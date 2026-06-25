import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// Setup storage for uploads
const uploadDir = "/tmp/clipsense-uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Let Multer save chunk files to a flat temporary directory with random names first.
// This completely decouples receiving binary stream segments from unparsed req.body fields,
// resolving any race conditions where uploadId or chunkIndex is missing during download.
const tempUploadDir = "/tmp/clipsense-temp";
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const chunkUpload = multer({ dest: tempUploadDir });

// Gemini Initialization
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not set in environment.");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API Routes

// 1. Chunk Upload Route (Bypasses 32MB Cloud Run Request Limit)
app.post("/api/upload-chunk", (req, res, next) => {
  chunkUpload.single("chunk")(req, res, (err) => {
    if (err) {
      console.error("[ClipSense] Chunk upload multer error:", err);
      return res.status(400).json({ error: err.message || "Failed to upload chunk" });
    }
    next();
  });
}, (req: any, res) => {
  const { uploadId, chunkIndex, totalChunks, fileName } = req.body;

  if (!uploadId || chunkIndex === undefined) {
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(400).json({ error: "Missing uploadId or chunkIndex" });
  }

  const safeUploadId = uploadId.replace(/[^a-zA-Z0-9_-]/g, "");
  const chunkDir = path.join(uploadDir, safeUploadId);

  try {
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);

    if (req.file && req.file.path) {
      if (fs.existsSync(chunkPath)) {
        try { fs.unlinkSync(chunkPath); } catch (e) {}
      }
      fs.renameSync(req.file.path, chunkPath);
    } else {
      return res.status(400).json({ error: "No chunk file received" });
    }

    const safeFileName = fileName ? fileName.replace(/[^a-zA-Z0-9_.-]/g, "_") : `chunk_${chunkIndex}`;
    console.log(`[ClipSense] Successfully received chunk ${Number(chunkIndex) + 1}/${totalChunks} for file: "${safeFileName}" (ID: ${uploadId})`);
    res.json({ success: true });
  } catch (error: any) {
    console.error("[ClipSense] Error handling chunk storage:", error);
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ error: "Failed to persist chunk: " + error.message });
  }
});

// 2. Assembly & Process Route
app.post("/api/upload-complete", async (req, res) => {
  const { uploadId, fileName, mimeType, totalChunks } = req.body;

  if (!uploadId || !fileName || !totalChunks) {
    return res.status(400).json({ error: "Missing required parameters (uploadId, fileName, totalChunks)." });
  }

  const safeUploadId = uploadId.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const chunkDir = path.join(uploadDir, safeUploadId);
  const finalFilePath = path.join(uploadDir, `${safeUploadId}-${safeFileName}`);

  let geminiFileNameToCleanup: string | null = null;

  try {
    // Verify all chunks exist
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk-${i}`);
      if (!fs.existsSync(chunkPath)) {
        return res.status(400).json({ error: `Missing upload slice chunk-${i} of ${totalChunks}.` });
      }
    }

    // Concatenate chunks into a single target file sequentially
    console.log(`[ClipSense] Reassembling video from ${totalChunks} chunks to: ${finalFilePath}`);
    if (fs.existsSync(finalFilePath)) {
      try { fs.unlinkSync(finalFilePath); } catch (e) {}
    }

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk-${i}`);
      const chunkData = fs.readFileSync(chunkPath);
      fs.appendFileSync(finalFilePath, chunkData);
    }

    // Remove local individual chunks directory
    try {
      fs.rmSync(chunkDir, { recursive: true, force: true });
    } catch (e) {
      console.warn("[ClipSense] Non-blocking chunk directory cleanup warning:", e);
    }

    // Upload reconstructed consolidated file to Gemini File API
    console.log(`[ClipSense] Uploading reassembled file to Gemini native Files API...`);
    const uploadResult = await ai.files.upload({
      file: finalFilePath,
      config: {
        mimeType: mimeType || "video/mp4",
        displayName: safeFileName,
      }
    });

    if (!uploadResult || !uploadResult.name) {
      throw new Error("Failed to receive a valid uploaded file reference from Google GenAI.");
    }

    geminiFileNameToCleanup = uploadResult.name;
    const fileUri = uploadResult.uri;

    // Poll Gemini for video processing state
    console.log(`[ClipSense] File uploaded to Gemini: ${geminiFileNameToCleanup}. Processing...`);
    let fileMeta = await ai.files.get({ name: geminiFileNameToCleanup });
    let attempts = 0;
    while (fileMeta.state === "PROCESSING") {
      attempts++;
      if (attempts % 12 === 0) console.log(`[ClipSense] Still processing ${safeFileName} (${attempts * 5}s elapsed)...`);
      await new Promise<void>((resolve) => setTimeout(resolve, 5000));
      fileMeta = await ai.files.get({ name: geminiFileNameToCleanup });
      
      // Safety timeout at 30 minutes
      if (attempts > 360) throw new Error("Video processing timed out in AI engine.");
    }

    if (fileMeta.state === "FAILED") {
      throw new Error(`AI Video processing failed for ${safeFileName}.`);
    }

    console.log(`[ClipSense] File ready for analysis: ${fileUri}`);

    // Generate Transcript and Highlights using Gemini
    const prompt = `
      Analyze the attached recording (audio or video) and transcribe the exact, genuine words spoken in the dialogue. Do not use placeholder text, do not repeat example terms from this prompt, and do not make up words. If no dialogue is found, write '[Silence]' or '[Instrumental]' with proper timestamps as appropriate.
      
      Provide:
      1. A full, precise chronological transcript of the dialogue with exact timestamps.
      2. A ranked list of "best moments" or highlights based strictly on the recording's actual content. For each highlight, provide:
         - A short catchy title
         - A descriptive summary of why it is a peak moment
         - Start and end time in HH:MM:SS format
         - An authentic performance/hype score from 1-10

      Format your response as a single valid JSON object with the following structure:
      {
        "transcript": [
          { "time": "00:00:10", "text": "Exact words spoken" }
        ],
        "highlights": [
          { "title": "A title", "description": "Actual event description", "start": "00:01:20", "end": "00:01:45", "score": 9 }
        ]
      }
      Only return the raw JSON matching this schema. No preamble or markdown code blocks.
    `;

    console.log(`[ClipSense] Sending analysis prompt to Gemini...`);
    let result;
    const modelName = "gemini-2.5-flash"; // Correct supported model for Google GenAI video analysis
    let aiAttempts = 0;
    const maxRetries = 3;

    while (aiAttempts < maxRetries) {
      try {
        result = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [
                { fileData: { mimeType: fileMeta.mimeType, fileUri: fileMeta.uri } },
                { text: prompt },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
          }
        });
        break; // Success
      } catch (err: any) {
        aiAttempts++;
        console.error(`[ClipSense] API Error (Attempt ${aiAttempts}/${maxRetries}):`, err.message || err);
        if (aiAttempts >= maxRetries) {
          throw err;
        }
        
        let delay = Math.pow(2, aiAttempts) * 2000;
        const errMsg = err.message || JSON.stringify(err);
        if (errMsg.includes("429") || errMsg.includes("Quota exceeded") || errMsg.includes("RESOURCE_EXHAUSTED")) {
          delay = 15000;
        }
        
        console.log(`[ClipSense] Waiting ${delay}ms before retrying...`);
        await new Promise<void>(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`[ClipSense] Analysis complete. Parsing results...`);
    
    if (!result || !result.text) {
      throw new Error("AI returned empty response");
    }

    let cleanedText = result.text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const data = JSON.parse(cleanedText);

    // Clean up video from Gemini API to save space
    if (geminiFileNameToCleanup) {
      try {
        console.log(`[ClipSense] Deleting video from Gemini API to save storage: ${geminiFileNameToCleanup}`);
        await ai.files.delete({ name: geminiFileNameToCleanup });
      } catch (delErr) {
        console.error(`[ClipSense] Error deleting from Gemini:`, delErr);
      }
    }

    // Clean up local consolidated file
    if (fs.existsSync(finalFilePath)) {
      fs.unlinkSync(finalFilePath);
    }

    res.json(data);
  } catch (error: any) {
    console.error("[ClipSense] Fatal processing error:", error);
    
    // Clean up failed file from Gemini
    if (geminiFileNameToCleanup) {
      try {
        console.log(`[ClipSense] Cleaning up failed upload from Gemini API: ${geminiFileNameToCleanup}`);
        await ai.files.delete({ name: geminiFileNameToCleanup });
      } catch (delErr) {
        console.error(`[ClipSense] Error deleting from Gemini after failure:`, delErr);
      }
    }

    // Clean up local consolidated file on failure
    if (fs.existsSync(finalFilePath)) {
      try { fs.unlinkSync(finalFilePath); } catch(e) {}
    }

    // Clean up chunkDir on failure
    if (fs.existsSync(chunkDir)) {
      try { fs.rmSync(chunkDir, { recursive: true, force: true }); } catch (e) {}
    }
    
    res.status(500).json({ error: typeof error?.message === 'string' ? error.message : "Failed to process video analysis. Check server logs." });
  }
});

// Final error handler to catch anything else
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[ClipSense] Uncaught Error:", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
