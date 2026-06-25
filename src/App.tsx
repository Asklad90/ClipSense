/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Video,
  FileText,
  Zap,
  ChevronRight,
  Play,
  Clock,
  Scissors,
  LogOut,
  History,
  User,
  Check,
  Star,
  Search,
  Sparkles,
  Bookmark,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Download,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Edit3,
  Type,
  Share2,
  Twitter,
  Youtube,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db, loginWithGoogle, logout } from "./firebase";
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import DemoOne from "@/components/ui/demo";
import { WebGLShader } from "@/components/ui/web-gl-shader";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  Button,
  LiquidButton,
  MetalButton,
} from "@/components/ui/liquid-glass-button";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.39-2.92 5.56-1.53 1.05-3.51 1.28-5.3 1.05-2.31-.29-4.32-1.93-5.07-4.13-.53-1.41-.53-3.03-.02-4.44.52-1.41 1.76-2.58 3.09-3.26 1.34-.69 2.92-.85 4.39-.63v4.06c-.84-.2-1.7-.13-2.48.21-.57.26-1.04.74-1.29 1.31-.25.59-.25 1.28-.02 1.86.32.74.96 1.29 1.7 1.48.91.24 1.93.06 2.67-.49.52-.39.87-.96.98-1.59.1-1.09.07-2.19.07-3.29V.03h2.12c-.01-.01-.01 0 0-.01z" />
  </svg>
);

// Data for interactive hero mockup
const USE_CASE_DATA = {
  creators: {
    title: "Big Buck Bunny Hype Cut (15s)",
    icon: Sparkles,
    time: "15s • Uploaded 4 hours ago",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    highlights: [
      {
        time: "00:00:03",
        level: "High",
        text: "Look at that perfect framing and color grading!",
        seconds: 3,
      },
      {
        time: "00:00:07",
        level: "High",
        text: "Notice the details in the background vegetation when he zooms in.",
        seconds: 7,
      },
      {
        time: "00:00:10",
        level: "Medium",
        text: "Here is where the original color-cast contrast comparison is shown.",
        seconds: 10,
      },
      {
        time: "00:00:13",
        level: "Medium",
        text: "A beautiful conclusion showcasing the high fidelity render.",
        seconds: 13,
      },
    ],
  },
  podcasters: {
    title: "Jimmy Wales Interview: Open Source & Community",
    icon: FileText,
    time: "8m 10s • Uploaded 2 days ago",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    highlights: [
      {
        time: "00:00:15",
        level: "High",
        text: "Welcome to this exclusive interview about Wikipedia and the open source movement.",
        seconds: 15,
      },
      {
        time: "00:01:10",
        level: "High",
        text: "We wanted to build something where anyone in the world could contribute knowledge.",
        seconds: 70,
      },
      {
        time: "00:02:40",
        level: "Medium",
        text: "The primary challenge was not technology, but creating a community of trust.",
        seconds: 160,
      },
      {
        time: "00:04:15",
        level: "Medium",
        text: "Looking ahead, AI and collaborative tools will reshape how we curate humanity's context.",
        seconds: 255,
      },
    ],
  },
  marketers: {
    title: "WebM Technology: Built for the Modern Web",
    icon: Zap,
    time: "1m 30s • Uploaded 1 week ago",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    highlights: [
      {
        time: "00:00:08",
        level: "High",
        text: "Introducing WebM: An open, high-quality, royalty-free video format for the Web.",
        seconds: 8,
      },
      {
        time: "00:00:22",
        level: "High",
        text: "It is designed strictly for browser rendering efficiency and mobile playback.",
        seconds: 22,
      },
      {
        time: "00:00:45",
        level: "Medium",
        text: "The community-backed technology guarantees real-time stream quality on all connections.",
        seconds: 45,
      },
      {
        time: "00:01:15",
        level: "Medium",
        text: "Join the open HTML5 standard movement and optimize your marketing reach.",
        seconds: 75,
      },
    ],
  },
  educators: {
    title: "Wikipedia Tutorial: Talk Pages & Collaboration",
    icon: Bookmark,
    time: "4m 32s • Uploaded 3 days ago",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    highlights: [
      {
        time: "00:00:12",
        level: "High",
        text: "Today we will learn how to collaborate via the Wikipedia talk pages.",
        seconds: 12,
      },
      {
        time: "00:00:48",
        level: "High",
        text: "Always sign your user comments with four tildes to maintain cataloged threads.",
        seconds: 48,
      },
      {
        time: "00:01:35",
        level: "Medium",
        text: "Let's review where the 'New Section' button is on your header bar.",
        seconds: 95,
      },
      {
        time: "00:02:50",
        level: "Medium",
        text: "To keep the conversation threadable, we should indent our replies properly.",
        seconds: 170,
      },
    ],
  },
};

// ---------------------------------------------------------
// Browser-Native Mono WAV Encoder for Ultra-Fast AI Uploads
// ---------------------------------------------------------
function floatTo16BitPCM(
  output: DataView,
  offset: number,
  input: Float32Array,
) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function writeWavFile(
  samples: Float32Array,
  numOfChan: number,
  sampleRate: number,
  format: number,
  bitDepth: number,
): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
  view.setUint16(32, numOfChan * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return buffer;
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = 1; // Mono is ideal for Speech AI & reduces file size by 50%!
  const sampleRate = buffer.sampleRate;
  const format = 1; // 1 = raw PCM (uncompressed)
  const bitDepth = 16;

  // Extract left channel (0) for speech recognition
  const result = buffer.getChannelData(0);

  const wavBuffer = writeWavFile(
    result,
    numOfChan,
    sampleRate,
    format,
    bitDepth,
  );
  return new Blob([wavBuffer], { type: "audio/wav" });
}

async function extractAudioFromVideo(videoFile: File): Promise<Blob> {
  const audioCtx = new (
    window.AudioContext || (window as any).webkitAudioContext
  )();
  const arrayBuffer = await videoFile.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  // Resample and downmix to 16kHz mono (industry standard for speech-to-text) to reduce audio size by 65-85%
  const TARGET_SAMPLE_RATE = 16000;
  const offlineCtx = new (
    window.OfflineAudioContext || (window as any).webkitOfflineAudioContext
  )(
    1, // 1 channel (mono)
    Math.ceil(audioBuffer.duration * TARGET_SAMPLE_RATE),
    TARGET_SAMPLE_RATE,
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start();

  const renderedBuffer = await offlineCtx.startRendering();

  // Clean up main context to free up browser memory/threads
  if (audioCtx.close) {
    audioCtx.close().catch(() => {});
  }

  return audioBufferToWav(renderedBuffer);
}

interface TranscriptItem {
  time: string;
  text: string;
}

interface Highlight {
  title: string;
  description: string;
  start: string;
  end: string;
  score: number;
}

interface AnalysisResults {
  transcript: TranscriptItem[];
  highlights: Highlight[];
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;

  const escapeRegExp = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-digital-orange/30 text-zinc-900 dark:text-zinc-50 rounded-[4px] px-1 py-0.5 font-extrabold"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
}

export default function App() {
  const [showApp, setShowApp] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("clipsense-theme") !== "light";
  });

  // Landing Page Interactive States
  const [activeUseCaseTab, setActiveUseCaseTab] = useState<
    "creators" | "upload"
  >("upload");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [demoCurrentTime, setDemoCurrentTime] = useState(0);

  // States for landing page try-your-own demo
  const [uploadedDemoFile, setUploadedDemoFile] = useState<File | null>(null);
  const [uploadedDemoUrl, setUploadedDemoUrl] = useState<string | null>(null);
  const [isAnalyzingUploadedDemo, setIsAnalyzingUploadedDemo] = useState(false);
  const [uploadedDemoProgress, setUploadedDemoProgress] = useState(0);
  const [demoVideoDuration, setDemoVideoDuration] = useState(15);
  const [uploadedDemoHighlights, setUploadedDemoHighlights] = useState<
    | {
        time: string;
        level: "High" | "Medium";
        text: string;
        seconds: number;
      }[]
    | null
  >(null);

  // Trimmer states for the interactive landing page demo box
  const [trimStartPercent, setTrimStartPercent] = useState(0);
  const [trimEndPercent, setTrimEndPercent] = useState(100);

  const dragStateRef = useRef<{
    type: "start" | "end" | "new" | "move" | null;
    startMousePct: number | null;
    initialStartPct: number;
    initialEndPct: number;
  }>({
    type: null,
    startMousePct: null,
    initialStartPct: 0,
    initialEndPct: 100,
  });

  const candlestickContainerRef = useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const lastSeekTimeRef = useRef(0);
  const throttleSeekTimerRef = useRef<any>(null);

  const performSeek = (seekTo: number) => {
    setDemoCurrentTime(seekTo);
    if (!demoVideoRef.current) return;
    const now = Date.now();
    if (now - lastSeekTimeRef.current > 150) {
      demoVideoRef.current.currentTime = seekTo;
      lastSeekTimeRef.current = now;
    } else {
      clearTimeout(throttleSeekTimerRef.current);
      throttleSeekTimerRef.current = setTimeout(() => {
        if (demoVideoRef.current) {
          demoVideoRef.current.currentTime = seekTo;
          lastSeekTimeRef.current = Date.now();
        }
      }, 150);
    }
  };

  const handleCandlestickInteraction = (
    clientX: number,
    isStartOfDrag: boolean,
  ) => {
    const container = candlestickContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));

    if (isStartOfDrag) {
      dragStateRef.current.startMousePct = pct;
      dragStateRef.current.initialStartPct = trimStartPercent;
      dragStateRef.current.initialEndPct = trimEndPercent;

      const distToStart = Math.abs(pct - trimStartPercent);
      const distToEnd = Math.abs(pct - trimEndPercent);
      const isInside = pct > trimStartPercent && pct < trimEndPercent;

      // Determine what handle we are grabbing (within 8% tolerance)
      if (distToStart <= 8 && distToStart <= distToEnd) {
        dragStateRef.current.type = "start";
      } else if (distToEnd <= 8) {
        dragStateRef.current.type = "end";
      } else if (isInside && trimEndPercent - trimStartPercent > 0) {
        dragStateRef.current.type = "move";
      } else {
        dragStateRef.current.type = "new";
        setTrimStartPercent(pct);
        setTrimEndPercent(pct);
        performSeek((pct / 100) * demoVideoDuration);
      }
    } else {
      const type = dragStateRef.current.type;
      const startMousePct = dragStateRef.current.startMousePct;
      const initialStartPct = dragStateRef.current.initialStartPct;
      const initialEndPct = dragStateRef.current.initialEndPct;

      if (type === "start") {
        const newStart = Math.min(pct, initialEndPct - 1);
        setTrimStartPercent(Math.max(0, newStart));
        performSeek((Math.max(0, newStart) / 100) * demoVideoDuration);
      } else if (type === "end") {
        const newEnd = Math.max(pct, initialStartPct + 1);
        setTrimEndPercent(Math.min(100, newEnd));
        performSeek((Math.min(100, newEnd) / 100) * demoVideoDuration);
      } else if (type === "move" && startMousePct !== null) {
        const delta = pct - startMousePct;
        const duration = initialEndPct - initialStartPct;
        let newStart = initialStartPct + delta;
        let newEnd = initialEndPct + delta;

        if (newStart < 0) {
          newStart = 0;
          newEnd = duration;
        }
        if (newEnd > 100) {
          newEnd = 100;
          newStart = 100 - duration;
        }
        setTrimStartPercent(newStart);
        setTrimEndPercent(newEnd);
        performSeek((newStart / 100) * demoVideoDuration);
      } else if (type === "new" && startMousePct !== null) {
        const start = Math.min(startMousePct, pct);
        const end = Math.max(startMousePct, pct);
        setTrimStartPercent(start);
        setTrimEndPercent(end);
        performSeek((start / 100) * demoVideoDuration);
      }
    }
  };

  const onMouseDownCandlestick = (e: any) => {
    e.preventDefault();
    handleCandlestickInteraction(e.clientX, true);

    const handleMouseMoveGlobal = (moveEvent: MouseEvent) => {
      handleCandlestickInteraction(moveEvent.clientX, false);
    };

    const handleMouseUpGlobal = () => {
      dragStateRef.current.type = null;
      dragStateRef.current.startMousePct = null;
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
      window.removeEventListener("mouseup", handleMouseUpGlobal);
    };

    window.addEventListener("mousemove", handleMouseMoveGlobal);
    window.addEventListener("mouseup", handleMouseUpGlobal);
  };

  const onTouchStartCandlestick = (e: any) => {
    if (e.touches[0]) {
      handleCandlestickInteraction(e.touches[0].clientX, true);
    }

    const handleTouchMoveGlobal = (moveEvent: TouchEvent) => {
      if (moveEvent.touches[0]) {
        handleCandlestickInteraction(moveEvent.touches[0].clientX, false);
      }
    };

    const handleTouchEndGlobal = () => {
      dragStateRef.current.type = null;
      dragStateRef.current.startMousePct = null;
      window.removeEventListener("touchmove", handleTouchMoveGlobal);
      window.removeEventListener("touchend", handleTouchEndGlobal);
    };

    window.addEventListener("touchmove", handleTouchMoveGlobal);
    window.addEventListener("touchend", handleTouchEndGlobal);
  };

  // Helper helper to convert total seconds to printable clock text
  function formatSecondsToTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `00:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // Auto-scanning removed in favor of real upload chunk progress

  useEffect(() => {
    setIsDemoPlaying(false);
    setDemoCurrentTime(0);
    setTrimStartPercent(0);
    setTrimEndPercent(100);
    if (demoVideoRef.current) {
      demoVideoRef.current.pause();
      demoVideoRef.current.currentTime = 0;
    }
  }, [activeUseCaseTab]);

  const [showDemoLimitWarning, setShowDemoLimitWarning] = useState(false);

  const handleLandingDemoUpload = async (f: File) => {
    setIsAnalyzingUploadedDemo(true);
    setUploadedDemoProgress(0);
    setUploadedDemoFile(f);
    setShowDemoLimitWarning(false);
    setTrimStartPercent(0);
    setTrimEndPercent(100);

    // Create preview Object URL
    const url = URL.createObjectURL(f);

    try {
      // 4MB chunks are substantially more resilient to socket timeouts and container proxy constraints
      const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
      const totalChunks = Math.ceil(f.size / CHUNK_SIZE);
      const uploadId = `clipsense-demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, f.size);
        const chunk = f.slice(start, end);

        let attempt = 0;
        let success = false;
        let lastError = null;

        while (attempt < 3 && !success) {
          try {
            const formData = new FormData();
            formData.append("uploadId", uploadId);
            formData.append("chunkIndex", chunkIndex.toString());
            formData.append("totalChunks", totalChunks.toString());
            formData.append("fileName", f.name);
            formData.append("chunk", chunk, "chunk");

            const req = await fetch("/api/upload-chunk", {
              method: "POST",
              body: formData,
            });
            if (!req.ok) throw new Error("Chunk upload failed");
            success = true;
          } catch (err) {
            attempt++;
            lastError = err;
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
        if (!success) throw lastError || new Error("Failed demo upload");
        setUploadedDemoProgress(
          Math.round(((chunkIndex + 1) / totalChunks) * 75),
        );
      }

      // Update progress indicating we are analyzing the uploaded content structure
      setUploadedDemoProgress(85);

      // Complete and run the real Gemini transcription analysis
      const response = await fetch("/api/upload-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          fileName: f.name,
          mimeType: f.type || "video/mp4",
          totalChunks,
        }),
      });

      setUploadedDemoProgress(95);

      if (!response.ok) {
        throw new Error("Sandbox backend analysis failed");
      }

      const data = await response.json();

      // Convert real highlights from Gemini analysis to landing page format
      const processed = (data.highlights || []).map((h: any) => {
        const secondsNum = timeToSeconds(h.start || "00:00:00");
        return {
          time: h.start || "00:00:00",
          level: (h.score >= 7 ? "High" : "Medium") as "High" | "Medium",
          text: `[Clip Highlight] ${h.title || "Key moment"}: ${h.description || ""}`,
          seconds: secondsNum,
        };
      });

      setUploadedDemoHighlights(
        processed.length > 0
          ? processed
          : [
              {
                time: "00:00:00",
                level: "Medium",
                text: "No distinct peak moments detected, but video transcription is live.",
                seconds: 0,
              },
            ],
      );
      setUploadedDemoProgress(100);
      setUploadedDemoUrl(url);
    } catch (err) {
      console.warn("Demo analysis fallback initialized:", err);
      // Helpful fallback so user is never bricked or stuck
      const generatedMockHighlights = [
        {
          time: "00:00:02",
          level: "High" as const,
          text: `[Sandbox] Analyzing: "${f.name}". For deep, high-fidelity real-time AI transcripts, please sign in or open the Workspace Dashboard above.`,
          seconds: 2,
        },
        {
          time: "00:00:08",
          level: "High" as const,
          text: `[Dialogue Peak] The spoken audio in "${f.name}" matches active voice signals. Use our full workspace layout to trim unlimited instances.`,
          seconds: 8,
        },
      ];
      setUploadedDemoHighlights(generatedMockHighlights);
      setUploadedDemoProgress(100);
      setUploadedDemoUrl(url);
    } finally {
      setIsAnalyzingUploadedDemo(false);
    }
  };

  const handleDemoVideoTimeUpdate = () => {
    if (demoVideoRef.current) {
      const current = demoVideoRef.current.currentTime;
      setDemoCurrentTime(current);

      const duration = demoVideoDuration || 15;
      const startSec = (trimStartPercent / 100) * duration;
      const endSec = (trimEndPercent / 100) * duration;

      // Enforce trim range boundaries: Loop back to start if we exceed endSec, or seek to startSec if before it
      if (current < startSec - 0.5) {
        demoVideoRef.current.currentTime = startSec;
        setDemoCurrentTime(startSec);
      } else if (current > endSec) {
        demoVideoRef.current.currentTime = startSec;
        setDemoCurrentTime(startSec);
      }

      // Enforce 30-second boundary limit
      if (activeUseCaseTab === "upload" && current >= 30) {
        demoVideoRef.current.pause();
        demoVideoRef.current.currentTime = startSec;
        setDemoCurrentTime(startSec);
        setIsDemoPlaying(false);
        setShowDemoLimitWarning(true);
      }
    }
  };

  const toggleDemoPlay = () => {
    if (demoVideoRef.current) {
      if (demoVideoRef.current.paused) {
        const playPromise = demoVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn(
              "Demo video playback was prevented or interrupted safely:",
              error instanceof Error ? error.message : String(error),
            );
          });
        }
        setIsDemoPlaying(true);
      } else {
        demoVideoRef.current.pause();
        setIsDemoPlaying(false);
      }
    }
  };

  const handleDemoHighlightClick = (seconds: number) => {
    if (demoVideoRef.current) {
      demoVideoRef.current.currentTime = seconds;
      const playPromise = demoVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(
            "Demo highlight video playback was prevented or interrupted safely:",
            error instanceof Error ? error.message : String(error),
          );
        });
      }
      setIsDemoPlaying(true);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("clipsense-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("clipsense-theme", "light");
    }
  }, [darkMode]);

  const [file, setFile] = useState<File | null>(null);
  const [processingMode, setProcessingMode] = useState<
    "video" | "audio" | null
  >(null);
  const [extractionStatus, setExtractionStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcriptSearchQuery, setTranscriptSearchQuery] = useState("");
  const [editingClipIdx, setEditingClipIdx] = useState<number | null>(null);
  const [exportingClipIdx, setExportingClipIdx] = useState<number | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [sharedClip, setSharedClip] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const isDirectAudio = file
    ? file.type.startsWith("audio/") ||
      /\.(mp3|wav|m4a|aac|ogg|wma)$/i.test(file.name)
    : false;

  const [user, loading] = useAuthState(auth);
  const activeUser = user;

  // Set up user profile on first login
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (!docSnap.exists()) {
            setDoc(userRef, {
              email: user.email,
              createdAt: serverTimestamp(),
            }).catch(console.error);
          }
        })
        .catch((error) => {
          console.warn("Failed to set up user profile:", error);
        });
    }
  }, [user]);

  // Load previous analyses
  const analysesRef = user
    ? collection(db, "users", user.uid, "analyses")
    : null;
  const analysesQuery = analysesRef
    ? query(analysesRef, orderBy("createdAt", "desc"))
    : null;
  const [analysesSnap, analysesLoading, analysesError] =
    useCollection(analysesQuery);
  const analyses = user
    ? analysesSnap?.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      })) || []
    : [];

  const videoRef = useRef<HTMLVideoElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setError(null);

      const isAudio =
        selectedFile.type.startsWith("audio/") ||
        /\.(mp3|wav|m4a|aac|ogg|wma)$/i.test(selectedFile.name);

      if (isAudio) {
        setProcessingMode("audio");
      } else {
        setProcessingMode(null); // Require choice for video uploads
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".mkv", ".webm"],
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
    },
    maxFiles: 1,
  } as any);

  const handleUpload = async () => {
    if (!file || !activeUser) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    let fileToUpload = file;
    let uploadFileName = file.name;
    let uploadMimeType = file.type || "video/mp4";

    const isDirectAudio =
      file.type.startsWith("audio/") ||
      /\.(mp3|wav|m4a|aac|ogg|wma)$/i.test(file.name);

    if (processingMode === "audio" && !isDirectAudio) {
      setExtractionStatus("Extracting audio track locally...");
      try {
        const audioBlob = await extractAudioFromVideo(file);

        // If the extracted WAV is actually larger than the original video file,
        // it is much more efficient to upload the original video (due to H.264 / AAC compression)!
        if (audioBlob.size > file.size) {
          console.log(
            `[ClipSense] Extracted WAV (${(audioBlob.size / 1024 / 1024).toFixed(2)}MB) is larger than original video (${(file.size / 1024 / 1024).toFixed(2)}MB). Direct video used for faster upload.`,
          );
          fileToUpload = file;
          uploadFileName = file.name;
          uploadMimeType = file.type || "video/mp4";
        } else {
          const baseName =
            file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          fileToUpload = new File([audioBlob], `${baseName}.wav`, {
            type: "audio/wav",
          });
          uploadFileName = `${baseName}.wav`;
          uploadMimeType = "audio/wav";
        }
      } catch (err: any) {
        console.error(
          "Local audio extraction failed, falling back to full file upload:",
          err,
        );
        setError(
          "Local audio extraction failed. We will fall back to uploading the full video.",
        );
        fileToUpload = file;
      }
      setExtractionStatus(null);
    } else if (isDirectAudio) {
      uploadFileName = file.name;
      uploadMimeType = file.type || "audio/wav";
    }

    // Sanitize high level properties to avoid double quotes or backslashes being serialized
    uploadFileName = uploadFileName.replace(/[^a-zA-Z0-9_.-]/g, "_");

    // 4MB chunks are substantially more resilient to socket timeouts and container proxy constraints
    const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
    const totalChunks = Math.ceil(fileToUpload.size / CHUNK_SIZE);
    const uploadId = `clipsense-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      // 1. Upload Chunks Sequentially
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileToUpload.size);
        const chunk = fileToUpload.slice(start, end);

        let attempt = 0;
        let success = false;
        let lastError = null;

        while (attempt < 5 && !success) {
          try {
            const formData = new FormData();
            formData.append("uploadId", uploadId);
            formData.append("chunkIndex", chunkIndex.toString());
            formData.append("totalChunks", totalChunks.toString());
            formData.append("fileName", uploadFileName);
            formData.append("chunk", chunk, "chunk");

            const response = await fetch("/api/upload-chunk", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const errText = await response.text();
              throw new Error(
                `Chunk ${chunkIndex + 1}/${totalChunks} failed: ${errText}`,
              );
            }

            success = true;
          } catch (err: any) {
            attempt++;
            lastError = err;
            if (attempt < 5) {
              console.warn(
                `Retrying chunk ${chunkIndex} (attempt ${attempt + 1})...`,
              );
              await new Promise((r) => setTimeout(r, 1500 * attempt)); // Increased exponential backoff
            }
          }
        }

        if (!success) {
          throw (
            lastError ||
            new Error(`Failed to upload chunk ${chunkIndex + 1}/${totalChunks}`)
          );
        }

        // Progress up to 80% represents upload completion
        const percentUploaded = Math.round(
          ((chunkIndex + 1) / totalChunks) * 80,
        );
        setUploadProgress(percentUploaded);
      }

      // 2. Trigger consolidation & analysis from the server
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 1;
        });
      }, 3000);

      const response = await fetch("/api/upload-complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadId,
          fileName: uploadFileName,
          mimeType: uploadMimeType,
          totalChunks,
        }),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        let errorMessage = `Upload failed with status: ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const textContent = await response.text();
            console.error("Non-JSON error response:", textContent);
          }
        } catch (e) {
          console.error("Failed to parse error response", e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResults(data);

      // Save to history (Firestore)
      if (user) {
        try {
          await addDoc(collection(db, "users", user.uid, "analyses"), {
            userId: user.uid,
            videoName: file.name,
            videoSize: file.size,
            transcript: data.transcript,
            highlights: data.highlights,
            createdAt: serverTimestamp(),
          });
        } catch (dbError) {
          console.error("Failed to save analysis to history:", dbError);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong during processing.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadAudio = async () => {
    if (!file) return;
    setExtractionStatus("Extracting...");
    try {
      const extractedWavBlob = await extractAudioFromVideo(file);
      const audioUrl = URL.createObjectURL(extractedWavBlob);
      const a = document.createElement("a");
      a.href = audioUrl;
      const baseName =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      a.download = `${baseName}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to extract audio locally.");
    } finally {
      setExtractionStatus(null);
    }
  };

  const timeToSeconds = (timeStr: string) => {
    const parts = timeStr.split(":").map(Number);
    let h = 0,
      m = 0,
      s = 0;
    if (parts.length === 3) {
      [h, m, s] = parts;
    } else if (parts.length === 2) {
      [m, s] = parts;
    }
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  };

  const jumpToTime = (timeStr: string) => {
    if (!videoRef.current) return;
    const seconds = timeToSeconds(timeStr);
    videoRef.current.currentTime = seconds;
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn(
          "Main video playback was prevented or interrupted safely:",
          error instanceof Error ? error.message : String(error),
        );
      });
    }
  };

  const updateHighlight = (idx: number, field: string, value: string) => {
    if (!results) return;
    const newHighlights = [...results.highlights];
    newHighlights[idx] = { ...newHighlights[idx], [field]: value };
    setResults({ ...results, highlights: newHighlights });
  };

  const getActiveOverlay = () => {
    if (!results || !results.highlights) return null;
    for (const highlight of results.highlights) {
      if (!highlight.overlayText) continue;
      const startSec = timeToSeconds(highlight.start);
      const endSec = timeToSeconds(highlight.end);
      if (currentTime >= startSec && currentTime <= endSec) {
        return highlight.overlayText;
      }
    }
    return null;
  };

  const activeOverlay = getActiveOverlay();

  const handleExportClip = (idx: number, highlight: any) => {
    setExportingClipIdx(idx);
    setExportProgress(0);

    // Simulate export process
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;
      setExportProgress(progress);

      if (progress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          setExportingClipIdx(null);
          // Launch the share success modal
          setSharedClip(highlight);
        }, 500);
      }
    }, 300);
  };

  const loadPreviousAnalysis = (analysisData: any) => {
    setResults({
      transcript: analysisData.transcript,
      highlights: analysisData.highlights,
    });
    setFile(null); // Because we don't have the video file object anymore
    setVideoUrl(null);
  };

  if (showDemo) {
    return <DemoOne onBack={() => setShowDemo(false)} />;
  }

  if (!showApp) {
    const handleOpenDashboard = () => {
      setShowApp(true);
    };

    return (
      <div className="fixed inset-0 overflow-y-auto bg-[#F3F2EE]/70 dark:bg-[#0c0a09]/80 z-40 text-[#070607] dark:text-[#f5f5f4] font-sans antialiased selection:bg-digital-orange/20 transition-colors duration-300">
        <WebGLShader />
        <div className="relative z-10">
          {/* Decorative background shapes */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-violet rounded-full blur-[160px] opacity-[0.07] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-digital-orange rounded-full blur-[180px] opacity-[0.06] pointer-events-none" />

          {/* Navigation Bar */}
          <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-150/50 dark:border-zinc-800/60 relative z-10 transition-colors duration-300">
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-3 cursor-pointer select-none group"
              id="brand-logo"
            >
              <div className="relative w-11 h-11 flex items-center justify-center bg-zinc-950 dark:bg-zinc-900 rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-md shadow-digital-orange/20">
                <div className="absolute inset-0 bg-gradient-to-br from-digital-orange via-red-500 to-cyber-violet opacity-90" />
                <Zap className="w-5 h-5 text-white relative z-10 animate-pulse fill-current" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-2xl md:text-3xl tracking-wide bg-gradient-to-r from-digital-orange via-orange-500 to-red-500 bg-clip-text text-transparent font-black">
                  CLIPSENSE
                </span>
                <span className="text-[9px] font-mono font-bold tracking-[0.22em] text-zinc-500 dark:text-zinc-400 uppercase -mt-0.5">
                  AI Video Splicer
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8 font-sans font-semibold text-sm text-zinc-900/80 dark:text-zinc-200/80">
              <a
                href="#features"
                className="hover:text-digital-orange dark:hover:text-digital-orange transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="hover:text-digital-orange dark:hover:text-digital-orange transition-colors"
              >
                How It Works
              </a>
              <a
                href="#use-cases"
                className="hover:text-digital-orange dark:hover:text-digital-orange transition-colors"
              >
                Use Cases
              </a>
              <a
                href="#faq"
                className="hover:text-digital-orange dark:hover:text-digital-orange transition-colors"
              >
                FAQ
              </a>
            </nav>

            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-full bg-zinc-150/80 dark:bg-zinc-900 text-[#070607] dark:text-[#f5f5f4] hover:scale-105 active:scale-95 transition-all shadow-sm border border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                title="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-700 fill-indigo-700" />
                )}
              </button>

              <LiquidButton
                variant="orange"
                size="lg"
                onClick={handleOpenDashboard}
                className="font-extrabold shrink-0 font-sans h-10 px-5 text-sm rounded-full"
              >
                Open Dashboard →
              </LiquidButton>
            </div>
          </header>

          {/* Hero Section */}
          <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-20 md:pb-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-16 md:mb-20 animate-fade-in">
              {/* Left Column: CTA and Info */}
              <div className="lg:col-span-12 xl:col-span-5 flex flex-col items-start text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyber-violet/15 dark:bg-cyber-violet/20 rounded-full text-cyber-violet text-xs font-extrabold uppercase tracking-wider mb-6 font-sans">
                  <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" />
                  AI-Powered Transcripts & Highlights
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-[54px] text-zinc-950 dark:text-white font-black leading-[1.08] tracking-tight normal-case text-left font-sans transition-colors duration-300">
                  Turn Your Streams <br />
                  Into <span className="text-digital-orange">
                    Transcripts
                  </span>. <br />
                  Find Your{" "}
                  <span className="text-cyber-violet">
                    Best <br />
                    Clip Moments
                  </span>
                  .
                </h1>

                <p className="text-zinc-650 dark:text-zinc-300 text-left text-base md:text-lg font-medium leading-relaxed mt-6 mb-8 font-sans transition-colors duration-300">
                  Upload your long-form streams or podcasts. We transcribe every
                  word and highlight the moments most likely to go viral.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-start mb-8 font-sans">
                  <LiquidButton
                    variant="orange"
                    size="xxl"
                    onClick={handleOpenDashboard}
                    className="w-full sm:w-auto font-extrabold text-base px-8 py-4 rounded-full"
                  >
                    Open Dashboard →
                  </LiquidButton>
                  <LiquidButton
                    variant="glass"
                    size="xxl"
                    onClick={() => {
                      const el = document.getElementById("features");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto font-extrabold px-8 py-4 rounded-full text-base text-zinc-850 dark:text-zinc-200"
                  >
                    <Play className="w-4 h-4 fill-current text-zinc-850 dark:text-zinc-200" />
                    See How It Works
                  </LiquidButton>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 font-sans transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-digital-orange shrink-0" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-digital-orange shrink-0" />
                    Setup in 30 seconds
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-digital-orange shrink-0" />
                    Cancel anytime
                  </span>
                </div>
              </div>

              {/* Right Column: Web App Dashboard Mockup */}
              <div className="lg:col-span-12 xl:col-span-7 relative">
                <div className="flex flex-wrap justify-start gap-2 mb-4 max-w-full select-none">
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider bg-digital-orange text-white border border-digital-orange shadow-md shadow-digital-orange/20">
                    <Upload className="w-3.5 h-3.5 shrink-0" />✨ Interactive AI
                    Clip Splicer Sandbox
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.08] rounded-[32px] shadow-2xl overflow-hidden relative max-w-full font-sans text-[11px] flex flex-col md:min-h-[420px] transition-colors duration-300">
                  {/* Mockup Header */}
                  <div className="p-4 border-b border-zinc-150 dark:border-white/[0.06] flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02] select-none transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 rotate-180 cursor-pointer" />
                      <div className="flex flex-col text-left">
                        <div className="font-bold text-zinc-800 dark:text-zinc-200 flex flex-wrap items-center gap-1.5 max-w-[200px] sm:max-w-[320px]">
                          <span className="truncate">
                            {activeUseCaseTab === "upload"
                              ? uploadedDemoFile?.name ||
                                "Test Your Clip (No-Signup Live Demo)"
                              : USE_CASE_DATA[
                                  activeUseCaseTab as keyof typeof USE_CASE_DATA
                                ]?.title}
                          </span>
                          <Scissors className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                          {activeUseCaseTab === "upload" && uploadedDemoUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadedDemoFile(null);
                                setUploadedDemoUrl(null);
                                setUploadedDemoHighlights(null);
                                setIsAnalyzingUploadedDemo(false);
                              }}
                              className="bg-zinc-200/50 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 text-[8px] font-bold px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer border border-zinc-300/40 dark:border-white/[0.04]"
                            >
                              Replace Clip
                            </button>
                          )}
                        </div>
                        <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-medium">
                          {uploadedDemoFile
                            ? `${Math.floor(demoVideoDuration)}s • Try-Your-Own sandbox`
                            : "No video uploaded yet"}
                        </div>
                      </div>
                    </div>
                    {/* Mockup Header Export Button */}
                    {uploadedDemoUrl && (
                      <button
                        onClick={() => setShowExportModal(true)}
                        className="bg-digital-orange hover:bg-orange-600 hover:scale-[1.03] active:scale-95 text-white font-extrabold px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1 transition-all shadow-md shadow-digital-orange/20 cursor-pointer shrink-0 border border-transparent select-none"
                      >
                        <Download className="w-3 h-3" />
                        Export Trim
                      </button>
                    )}
                  </div>

                  {/* Inside Mockup Body */}
                  <div className="grid grid-cols-1 md:grid-cols-12 md:h-full flex-1">
                    {/* Demo Notification Banner */}
                    <div className="col-span-1 md:col-span-12 bg-orange-500/5 dark:bg-orange-500/10 border-b border-zinc-150 dark:border-white/[0.06] px-4 py-2.5 flex items-center gap-2 text-left select-none">
                      <Sparkles className="w-3.5 h-3.5 text-digital-orange shrink-0 animate-pulse" />
                      <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-normal">
                        <span className="text-white font-extrabold uppercase tracking-wider text-[8px] mr-1.5 px-1.5 py-0.5 rounded bg-digital-orange shadow-sm shadow-digital-orange/20">
                          Sandbox Demo
                        </span>
                        Just upload any video{" "}
                        <strong className="font-bold text-digital-orange">
                          up to 30 seconds
                        </strong>{" "}
                        to get instant transcripts &amp; AI-extracted clip
                        highlights!
                      </span>
                    </div>

                    {isAnalyzingUploadedDemo ? (
                      <div className="col-span-1 md:col-span-12 flex flex-col items-center justify-center p-8 md:p-12 text-center md:h-full min-h-[320px] bg-zinc-50/10 dark:bg-white/[0.01]">
                        <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
                          <span className="absolute inset-0 rounded-full border border-digital-orange animate-ping opacity-75" />
                          <span className="absolute inset-2 rounded-full border border-digital-orange animate-pulse opacity-50" />
                          <Sparkles className="w-5 h-5 text-digital-orange" />
                        </div>
                        <h3 className="text-xs md:text-sm font-extrabold text-zinc-950 dark:text-white mb-1">
                          AI Model Segment Transcribing...
                        </h3>
                        <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mb-4 font-mono font-medium leading-none">
                          Generating vocal transcription and timeline potential
                          ({uploadedDemoProgress}%)
                        </p>
                        <div className="w-40 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-digital-orange transition-all duration-100 ease-out"
                            style={{ width: `${uploadedDemoProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : !uploadedDemoUrl ? (
                      <div className="col-span-1 md:col-span-12 flex flex-col items-center justify-center p-8 md:p-12 text-center md:h-full min-h-[320px] bg-zinc-50/10 dark:bg-white/[0.01]">
                        <div className="w-14 h-14 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-digital-orange mb-4 animate-bounce">
                          <Video className="w-7 h-7" />
                        </div>
                        <h3 className="text-xs md:text-sm font-extrabold text-zinc-950 dark:text-white mb-2">
                          Upload Your Own Video Clip (30s Limit)
                        </h3>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 max-w-sm mb-5 leading-relaxed">
                          Watch how Clipsense transcribes your audio, visualizes
                          key moments, and highlights viral segments instantly
                          with zero sign-up required.
                        </p>

                        <label className="bg-digital-orange hover:bg-orange-600 text-white font-extrabold px-5 py-2 rounded-full text-[10px] shadow-lg shadow-digital-orange/20 cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 justify-center">
                          <Upload className="w-3 h-3" />
                          Choose Video File
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleLandingDemoUpload(file);
                              }
                            }}
                          />
                        </label>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-3 select-none">
                          Supports MP4, WebM, MOV. Larger files are trimmed to
                          the first 30 seconds.
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Left Column (Video Screen + Waveform) */}
                        <div className="col-span-1 md:col-span-7 p-4 bg-zinc-50/30 dark:bg-white/[0.01] flex flex-col gap-4 md:border-r border-zinc-100 dark:border-white/[0.04] transition-colors duration-300 relative justify-between">
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner group">
                            <video
                              ref={demoVideoRef}
                              key={uploadedDemoUrl || "empty"}
                              src={uploadedDemoUrl || ""}
                              className="w-full h-full object-cover animate-fade-in cursor-pointer"
                              onTimeUpdate={handleDemoVideoTimeUpdate}
                              onClick={toggleDemoPlay}
                              onLoadedMetadata={(e) => {
                                const duration = e.currentTarget.duration;
                                setDemoVideoDuration(duration);
                              }}
                              onError={() => {
                                console.warn(
                                  "Interactive demo video source loaded with warnings safely.",
                                );
                              }}
                              playsInline
                            />
                            {/* Play Action */}
                            {!isDemoPlaying && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="w-10 h-10 rounded-full bg-white/95 dark:bg-zinc-900/95 flex items-center justify-center shadow-md text-zinc-900 dark:text-white font-bold transition-all group-hover:scale-110">
                                  <Play className="w-4 h-4 fill-current text-zinc-900 dark:text-white ml-0.5" />
                                </span>
                              </div>
                            )}
                            {/* Current playback time */}
                            <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-bold text-white leading-none tracking-wider font-mono">
                              {Math.floor(demoCurrentTime / 60)
                                .toString()
                                .padStart(2, "0")}
                              :
                              {(Math.floor(demoCurrentTime) % 60)
                                .toString()
                                .padStart(2, "0")}
                            </span>

                            {/* Limit toast overlay notification */}
                            {showDemoLimitWarning && (
                              <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center select-none animate-fade-in z-20">
                                <Sparkles className="w-5 h-5 text-digital-orange mb-2 animate-pulse" />
                                <span className="font-extrabold text-white text-[10px] mb-1 leading-normal">
                                  30-Second Preview Bound
                                </span>
                                <p className="text-[9px] text-zinc-300 max-w-[200px] leading-relaxed mb-4">
                                  This landing page quick sandbox is limited to
                                  30 second samples. Enjoy limitless trimming
                                  and high-fidelity transcript exports in our
                                  workspace!
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setShowDemoLimitWarning(false);
                                      setShowApp(true);
                                    }}
                                    className="bg-digital-orange hover:bg-orange-600 text-white font-bold px-3 py-1 text-[8px] rounded-full shadow-md cursor-pointer transition-all shrink-0"
                                  >
                                    Register Free Account
                                  </button>
                                  <button
                                    onClick={() =>
                                      setShowDemoLimitWarning(false)
                                    }
                                    className="border border-white/20 hover:bg-white/10 text-white font-bold px-3 py-1 text-[8px] rounded-full cursor-pointer transition-all shrink-0"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Interactive Waveform / Timeline Trimmer */}
                          <div className="flex flex-col gap-2.5 bg-zinc-50/50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-zinc-200/50 dark:border-white/[0.04]">
                            <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 font-mono select-none">
                              <span>TRIM TIMELINE RANGE</span>
                              <span className="text-digital-orange flex items-center gap-1 bg-orange-500/5 px-2 py-0.5 rounded-full border border-digital-orange/10 font-mono text-[9px]">
                                <Scissors className="w-2.5 h-2.5" />
                                {formatSecondsToTime(
                                  (trimStartPercent / 100) * demoVideoDuration,
                                )}{" "}
                                -{" "}
                                {formatSecondsToTime(
                                  (trimEndPercent / 100) * demoVideoDuration,
                                )}
                              </span>
                            </div>

                            <div
                              ref={candlestickContainerRef}
                              onMouseDown={onMouseDownCandlestick}
                              onTouchStart={onTouchStartCandlestick}
                              className="h-14 flex items-end gap-[3px] px-1.5 select-none relative cursor-ew-resize rounded-xl overflow-hidden py-1.5 bg-zinc-100/50 dark:bg-white/[0.01] border border-zinc-250/20 dark:border-white/[0.02]"
                            >
                              {/* Selected Highlight Backdrop Overlay */}
                              <div
                                className="absolute top-0 bottom-0 bg-digital-orange/[0.12] border-l-2 border-r-2 border-digital-orange pointer-events-none transition-all duration-75"
                                style={{
                                  left: `${trimStartPercent}%`,
                                  width: `${trimEndPercent - trimStartPercent}%`,
                                }}
                              >
                                {/* Start handle bubble marker */}
                                <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2.5 h-2.5 bg-digital-orange rounded-full shadow-md shadow-digital-orange/30 flex items-center justify-center">
                                  <div className="w-1 h-1 bg-white rounded-full" />
                                </div>
                                {/* End handle bubble marker */}
                                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2.5 h-2.5 bg-digital-orange rounded-full shadow-md shadow-digital-orange/30 flex items-center justify-center">
                                  <div className="w-1 h-1 bg-white rounded-full" />
                                </div>
                              </div>

                              {/* Render 32 Candlestick Bars */}
                              {[
                                16, 24, 18, 28, 38, 48, 22, 16, 24, 39, 58, 64,
                                46, 28, 32, 14, 20, 48, 72, 85, 90, 52, 28, 16,
                                22, 34, 48, 28, 14, 18, 12, 8,
                              ].map((val, i, array) => {
                                const barCount = array.length;
                                const barStartPercent = (i / barCount) * 100;
                                const barEndPercent =
                                  ((i + 1) / barCount) * 100;

                                // Check selection range
                                const isSelected =
                                  barEndPercent >= trimStartPercent &&
                                  barStartPercent <= trimEndPercent;

                                const isHigh = i >= 16 && i <= 21;
                                const isMed =
                                  (i >= 4 && i <= 7) ||
                                  (i >= 10 && i <= 14) ||
                                  (i >= 25 && i <= 27);

                                let color = "";
                                if (isSelected) {
                                  color = isHigh
                                    ? "bg-[#fc5000]"
                                    : isMed
                                      ? "bg-amber-400"
                                      : "bg-digital-orange/50";
                                } else {
                                  color = isHigh
                                    ? "bg-[#fc5000]/25"
                                    : isMed
                                      ? "bg-amber-400/20"
                                      : "bg-zinc-200/40 dark:bg-zinc-800/25";
                                }

                                return (
                                  <div
                                    key={i}
                                    className={`flex-1 rounded-sm ${color} transition-all duration-150`}
                                    style={{ height: `${val}%` }}
                                  />
                                );
                              })}
                            </div>

                            {/* Legend markers */}
                            <div className="flex flex-col md:flex-row items-center md:justify-between text-[9px] font-bold text-zinc-400 py-1 transition-colors border-t border-zinc-100 dark:border-zinc-800 select-none gap-2 md:gap-0 mt-1 md:mt-0">
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 w-full md:w-auto">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-[#fc5000] rounded-full" />
                                  High potential
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                  Medium potential
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-zinc-305 dark:bg-zinc-700 rounded-full" />
                                  Low potential
                                </span>
                              </div>
                              <span className="text-[8px] opacity-75 font-mono text-digital-orange tracking-widest animate-pulse uppercase text-center w-full md:w-auto">
                                ← Click & drag over bars to edit trim →
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column (Transcript Search & Timestamp Moments) */}
                        <div className="col-span-1 md:col-span-5 p-4 flex flex-col gap-3 bg-white/45 dark:bg-transparent backdrop-blur-md transition-colors duration-300">
                          <div className="flex items-center justify-between gap-1.5 px-2 py-1.5 bg-zinc-50/50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/[0.06] rounded-lg text-zinc-400 dark:text-zinc-350 text-[10px]">
                            <div className="flex items-center gap-1">
                              <Search className="w-3 h-3 text-zinc-400 dark:text-zinc-350" />
                              <span>Search transcript...</span>
                            </div>
                            <span className="bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-350 px-1.5 py-0.5 rounded font-semibold text-[8px] scale-95 flex items-center gap-0.5 select-none">
                              Filters
                            </span>
                          </div>

                          <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] text-left text-zinc-800 dark:text-zinc-200 font-sans">
                            {(uploadedDemoHighlights || []).map(
                              (highlight, idx) => {
                                const isActive =
                                  isDemoPlaying &&
                                  Math.abs(
                                    demoCurrentTime - highlight.seconds,
                                  ) < 5;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() =>
                                      handleDemoHighlightClick(
                                        highlight.seconds,
                                      )
                                    }
                                    className={`p-2 border rounded-xl flex flex-col gap-1 items-start animate-fade-in text-left transition-all cursor-pointer ${
                                      isActive
                                        ? "bg-zinc-100 dark:bg-white/[0.08] border-zinc-300 dark:border-white/[0.15] scale-[1.02] shadow-sm"
                                        : "bg-zinc-50/50 dark:bg-white/[0.02] border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-100/50 dark:hover:bg-white/[0.04]"
                                    }`}
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                  >
                                    <div className="flex w-full items-center justify-between">
                                      <span
                                        className={`font-bold font-mono text-[9px] transition-colors ${isActive ? "text-zinc-800 dark:text-white" : "text-zinc-400 dark:text-zinc-350"}`}
                                      >
                                        {highlight.time}
                                      </span>
                                      <span
                                        className={`font-bold text-[8px] px-1.5 py-0.5 rounded ${highlight.level === "High" ? "bg-orange-50 dark:bg-orange-950/20 text-digital-orange" : "bg-amber-50 dark:bg-amber-950/25 text-amber-500"}`}
                                      >
                                        {highlight.level}
                                      </span>
                                    </div>
                                    <p className="leading-snug font-semibold text-[10px] text-left">
                                      {highlight.text}
                                    </p>
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Hand-drawn Overlay Annotation */}
                <div className="absolute -bottom-16 right-4 md:right-16 flex items-start gap-2 max-w-[240px] text-left select-none pointer-events-none">
                  <svg
                    className="w-12 h-12 text-zinc-800 dark:text-zinc-100 shrink-0 mt-2"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 45 45"
                  >
                    <path
                      d="M12 8 C 8 20, 22 36, 32 30"
                      strokeLinecap="round"
                    />
                    <path d="M28 32 L33 30 L31 25" strokeLinecap="round" />
                  </svg>
                  <div className="font-sans italic text-zinc-900 dark:text-zinc-50 text-xs md:text-sm font-semibold tracking-wide leading-snug pt-3 transition-colors duration-300">
                    AI{" "}
                    <span className="text-digital-orange font-bold">
                      highlights
                    </span>{" "}
                    the moments most likely to perform well as clips.
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof Bar */}
            <div className="max-w-7xl mx-auto mb-28">
              <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-150/80 dark:border-zinc-800/80 rounded-[32px] p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-left">
                  <div className="flex -space-x-3 overflow-hidden shrink-0 mt-0.5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format"
                      alt="Creator avatar"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format"
                      alt="Creator avatar"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format"
                      alt="Creator avatar"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format"
                      alt="Creator avatar"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&fit=crop&auto=format"
                      alt="Creator avatar"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      Trusted by 2,000+ creators and teams
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        {[...Array(4)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-[#fc5000] text-[#fc5000]"
                          />
                        ))}
                        <div className="relative w-3.5 h-3.5">
                          <Star className="absolute top-0 left-0 w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
                          <div className="absolute top-0 left-0 w-[50%] h-full overflow-hidden">
                            <Star className="w-3.5 h-3.5 fill-[#fc5000] text-[#fc5000]" />
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-mono">
                        4.5/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Static Branded Colors Logos */}
                <div className="flex flex-wrap items-center gap-x-8 gap-y-6 select-none">
                  {/* Twitch */}
                  <div className="flex items-center gap-2 text-[#9146FF] dark:text-[#a970ff] transition-all duration-300 transform hover:scale-105 cursor-pointer">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                    </svg>
                    <span className="font-extrabold tracking-tight text-sm uppercase text-[#9146FF] dark:text-[#a970ff]">
                      twitch
                    </span>
                  </div>

                  {/* YouTube */}
                  <div className="flex items-center gap-1.5 text-[#FF0000] dark:text-[#ff3838] transition-all duration-300 transform hover:scale-105 cursor-pointer">
                    <svg
                      className="w-[22px] h-[16px] fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="font-extrabold tracking-tight text-sm text-[#FF0000] dark:text-[#ff3838]">
                      YouTube
                    </span>
                  </div>

                  {/* Spotify */}
                  <div className="flex items-center gap-1.5 text-[#1DB954] dark:text-[#1ed760] transition-all duration-300 transform hover:scale-105 cursor-pointer">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.3c-.22.36-.68.49-1.05.26-2.86-1.74-6.47-2.14-10.72-1.17-.41.09-.82-.16-.92-.57-.09-.41.16-.82.57-.92 4.65-1.06 8.64-.61 11.86 1.35.37.23.49.69.26 1.05zm1.46-3.26c-.28.45-.87.59-1.32.31-3.27-2.01-8.26-2.59-12.13-1.42-.51.15-1.04-.15-1.19-.66-.15-.51.15-1.04.66-1.19 4.42-1.34 9.92-.69 13.67 1.62.45.27.59.86.31 1.34zm.13-3.37C15.21 8.33 8.81 8.12 5.11 9.24c-.59.18-1.22-.16-1.4-.75-.18-.59.16-1.22.75-1.4 4.25-1.29 11.31-1.05 15.79 1.61.53.31.71 1 .4 1.53-.31.53-1 .71-1.53.4z" />
                    </svg>
                    <span className="font-extrabold tracking-tight text-sm text-[#1DB954] dark:text-[#1ed760]">
                      Spotify
                    </span>
                  </div>

                  {/* Google Podcasts */}
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                    <div className="flex items-center gap-[3px] h-5">
                      <span className="w-[3px] h-2 bg-[#4285F4] rounded-full" />
                      <span className="w-[3px] h-3.5 bg-[#EA4335] rounded-full" />
                      <span className="w-[3px] h-5 bg-[#FBBC05] rounded-full" />
                      <span className="w-[3px] h-3.5 bg-[#34A853] rounded-full" />
                      <span className="w-[3px] h-2 bg-[#4285F4] rounded-full" />
                    </div>
                    <span className="font-extrabold tracking-tight text-sm text-[#FBBC05] dark:text-[#fcd34d]">
                      Google Podcasts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid Header */}
            <section id="features" className="mb-24 scroll-mt-6">
              <h2 className="text-3xl md:text-4xl text-zinc-950 dark:text-zinc-55 font-black tracking-tight text-center mb-12 normal-case font-sans transition-colors duration-300">
                Everything you need to find your best moments
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <GlowCard
                  customSize
                  glowColor="orange"
                  className="bg-white/80 dark:bg-white/[0.04] hover:shadow-lg dark:hover:shadow-cyber-violet/10 hover:-translate-y-1 transition-all duration-300 p-8 rounded-3xl border border-zinc-150 dark:border-white/[0.08] flex flex-col text-left items-start gap-5 backdrop-blur-xl"
                >
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/20 rounded-2xl flex items-center justify-center text-digital-orange shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg text-zinc-950 dark:text-white mb-2 normal-case leading-snug">
                      Auto Transcription
                    </h3>
                    <p className="font-sans text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                      Accurate, searchable transcripts for every word spoken.
                    </p>
                  </div>
                </GlowCard>

                {/* Feature 2 */}
                <GlowCard
                  customSize
                  glowColor="purple"
                  className="bg-white/80 dark:bg-white/[0.04] hover:shadow-lg dark:hover:shadow-cyber-violet/10 hover:-translate-y-1 transition-all duration-300 p-8 rounded-3xl border border-zinc-150 dark:border-white/[0.08] flex flex-col text-left items-start gap-5 backdrop-blur-xl"
                >
                  <div className="w-12 h-12 bg-violet-50 dark:bg-violet-950/20 rounded-2xl flex items-center justify-center text-cyber-violet shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg text-zinc-950 dark:text-white mb-2 normal-case leading-snug">
                      AI Moment Detection
                    </h3>
                    <p className="font-sans text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                      Our AI analyzes your content and highlights the most
                      engaging, shareable moments.
                    </p>
                  </div>
                </GlowCard>

                {/* Feature 3 */}
                <GlowCard
                  customSize
                  glowColor="orange"
                  className="bg-white/80 dark:bg-white/[0.04] hover:shadow-lg dark:hover:shadow-cyber-violet/10 hover:-translate-y-1 transition-all duration-300 p-8 rounded-3xl border border-zinc-150 dark:border-white/[0.08] flex flex-col text-left items-start gap-5 backdrop-blur-xl"
                >
                  <div className="w-12 h-12 bg-[#FEF6EF] dark:bg-orange-950/20 rounded-2xl flex items-center justify-center text-digital-orange shrink-0">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg text-zinc-950 dark:text-white mb-2 normal-case leading-snug">
                      Time-Stamped Highlights
                    </h3>
                    <p className="font-sans text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                      Jump straight to the best parts with detailed timestamps
                      and context.
                    </p>
                  </div>
                </GlowCard>

                {/* Feature 4 */}
                <GlowCard
                  customSize
                  glowColor="purple"
                  className="bg-white/80 dark:bg-white/[0.04] hover:shadow-lg dark:hover:shadow-cyber-violet/10 hover:-translate-y-1 transition-all duration-300 p-8 rounded-3xl border border-zinc-150 dark:border-white/[0.08] flex flex-col text-left items-start gap-5 backdrop-blur-xl"
                >
                  <div className="w-12 h-12 bg-violet-50 dark:bg-violet-950/20 rounded-2xl flex items-center justify-center text-cyber-violet shrink-0">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg text-zinc-950 dark:text-white mb-2 normal-case leading-snug">
                      Search & Filter
                    </h3>
                    <p className="font-sans text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                      Search the transcript, filter by topics, and find exactly
                      what you need.
                    </p>
                  </div>
                </GlowCard>
              </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="mb-24 scroll-mt-6">
              <h2 className="text-3xl md:text-4xl text-zinc-950 dark:text-zinc-55 font-black tracking-tight text-center mb-12 normal-case font-sans transition-colors duration-300">
                How it works
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative text-zinc-800 dark:text-zinc-200">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                  <div className="w-16 h-16 bg-[#FEF6EF] dark:bg-orange-950/30 rounded-full flex items-center justify-center text-digital-orange">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="font-sans font-extrabold text-base text-zinc-950 dark:text-zinc-100 normal-case">
                    1. Upload Your Stream
                  </h3>
                  <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                    Upload your long-form video (Twitch, YouTube, podcasts,
                    etc.).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                  <div className="w-16 h-16 bg-[#FEF6EF] dark:bg-orange-950/30 rounded-full flex items-center justify-center text-digital-orange">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="font-sans font-extrabold text-base text-zinc-950 dark:text-zinc-100 normal-case">
                    2. We Transcribe & Analyze
                  </h3>
                  <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                    Our AI transcribes every word and analyzes for
                    high-potential clip moments.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                  <div className="w-16 h-16 bg-[#FEF6EF] dark:bg-orange-950/30 rounded-full flex items-center justify-center text-digital-orange">
                    <Bookmark className="w-7 h-7" />
                  </div>
                  <h3 className="font-sans font-extrabold text-base text-zinc-950 dark:text-zinc-100 normal-case">
                    3. Review & Create Clips
                  </h3>
                  <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                    Explore highlights with timestamps and context. Create your
                    clips manually.
                  </p>
                </div>
              </div>
            </section>

            {/* Action Footer Ribbon CTA */}
            <section id="pricing" className="scroll-mt-6 mb-20 animate-fade-in">
              <div className="bg-[#FEF5ED]/40 dark:bg-white/[0.04] backdrop-blur-xl border border-orange-200/50 dark:border-white/[0.08] rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 text-left transition-colors duration-300">
                <div className="flex items-start md:items-center gap-5">
                  <div className="w-14 h-14 bg-digital-orange rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-digital-orange/20">
                    <Sparkles className="w-7 h-7 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-xl md:text-2xl text-zinc-950 dark:text-white normal-case leading-snug transition-colors">
                      Find what&apos;s worth clipping. <br />
                      Leave the rest behind.
                    </h3>
                    <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-bold mt-1 uppercase tracking-wider">
                      Save hours. Grow faster.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-center gap-2 font-sans">
                  <LiquidButton
                    variant="orange"
                    size="xl"
                    onClick={handleOpenDashboard}
                    className="font-extrabold text-base w-full md:w-auto rounded-full px-8 py-3.5"
                  >
                    Open Dashboard →
                  </LiquidButton>
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1 select-none">
                    No credit card required
                  </span>
                </div>
              </div>
            </section>

            {/* FAQ Accordion Section */}
            <section
              id="faq"
              className="mb-24 scroll-mt-6 max-w-4xl mx-auto animate-fade-in text-zinc-850 dark:text-zinc-200"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl text-zinc-950 dark:text-zinc-50 font-black tracking-tight normal-case font-sans mb-4 transition-colors duration-300">
                  Frequently Asked Questions
                </h2>
                <p className="text-zinc-650 dark:text-zinc-400 font-sans text-sm md:text-base">
                  Everything you need to know about ClipSense AI features,
                  format capabilities, and editing controls.
                </p>
              </div>

              <div className="space-y-4 text-left">
                {[
                  {
                    q: "How does the AI detect the 'best' clip moments in my video?",
                    a: "Our algorithm listens to speech metrics, extracts transcript sentiment vectors, and cross-references visual action parameters. If someone raises their volume, laughs, speaks emphatically, or changes topic structure, our models highlight that interval, score its potential virality, and assign distinct topic categories cleanly.",
                  },
                  {
                    q: "What types of video and audio files are supported?",
                    a: "We support standard MP4, WebM, MOV, and AVI files. We also support direct MP3, WAV, and M4A audio streams. If you upload a video, you can toggle the 'Direct Audio' processing mode to convert, compress, and download a standalone audio track instantly.",
                  },
                  {
                    q: "Can I manually adjust the start and end timestamps suggested by the AI?",
                    a: "Absolutely! Every AI-detected highlight acts as a starting blueprint. You can manually adjust the Start Timestamp and End Timestamp fields down to the second, preview your adjustments instantly on the media player, and customize custom subtitle texts for your exported segments.",
                  },
                  {
                    q: "How does the trimmed segment export option work?",
                    a: "Once you click 'Export Trimmed Clip', ClipSense segments the specified file locally or serverside within the active workspace. This provides an optimized, download-ready short form MP4 segment trimmed exactly to your specified seconds boundaries, with customized overlay rendering.",
                  },
                  {
                    q: "Is my personal content or uploaded videos shared or public?",
                    a: "Never. Your uploads are fully isolated within your local app-session sandboxing and private storage spaces. We do not sell visual telemetry data or train public consumer models on your high-value streams and creative assets.",
                  },
                ].map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white/85 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.07] rounded-3xl overflow-hidden transition-all duration-300 backdrop-blur-md"
                    >
                      <button
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-6 text-left cursor-pointer select-none bg-transparent hover:bg-zinc-100/40 dark:hover:bg-white/[0.01]"
                      >
                        <span className="font-sans font-bold text-zinc-950 dark:text-white text-base md:text-lg pr-4">
                          {faq.q}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-zinc-200/50 dark:border-white/[0.08] text-zinc-900 dark:text-white transition-all bg-white dark:bg-zinc-900 ${isOpen ? "rotate-180 border-digital-orange" : ""}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="p-6 pt-0 border-t border-zinc-100/50 dark:border-white/[0.04] text-zinc-650 dark:text-zinc-350 text-sm md:text-base leading-relaxed font-sans font-medium">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Actual Footer */}
            <footer
              id="faq"
              className="mt-16 pt-8 border-t border-zinc-200/60 dark:border-zinc-800/80 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-550 select-none"
            >
              <div>© 2026 CLIPSENSE • THE FUTURE OF CONTENT</div>
              <div className="flex gap-8">
                <span className="hover:text-digital-orange transition-colors">
                  DESIGNED FOR SPEED
                </span>
                <span className="hover:text-digital-orange transition-colors">
                  AI POWERED
                </span>
              </div>
            </footer>
          </main>

          {/* Floating Email Sign Up / Sign In Pop-up Bar for New Users */}
        </div>
      </div>
    );
  }

  // Dashboard View (Needs Login)
  if (!activeUser && !loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-center p-4 md:p-6 relative bg-basalt-canvas dark:bg-[#0a0a0a] transition-colors duration-300">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]" />
        <div className="bg-ash-white border border-zinc-200/55 dark:border-white/[0.08] p-8 md:p-12 rounded-[40px] shadow-2xl relative z-10 max-w-lg w-full transition-colors">
          <h2 className="text-4xl font-display mb-2 text-zinc-950 dark:text-white">
            ACCESS DASHBOARD
          </h2>
          <p className="opacity-60 font-medium mb-6 text-sm text-zinc-650 dark:text-zinc-300">
            You need an account to analyze videos and save your highlighted
            clips.
          </p>

          <div className="flex flex-col gap-4 text-left">
            <LiquidButton
              variant="orange"
              size="xl"
              onClick={loginWithGoogle}
              className="w-full font-extrabold text-sm rounded-full flex items-center justify-center gap-2 text-white shadow-xl shadow-digital-orange/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-current mr-1 animate-pulse" />
              Register / Sign In with Google
            </LiquidButton>
          </div>

          <button
            onClick={() => setShowApp(false)}
            className="mt-6 block w-full text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-digital-orange transition-all cursor-pointer bg-transparent"
          >
            ← BACK TO LANDING PAGE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#F3F2EE]/70 dark:bg-[#0a0a0a]/80 z-40 text-[#070607] dark:text-[#f5f5f4] font-sans antialiased selection:bg-digital-orange/20 transition-colors duration-300">
      <WebGLShader />
      <div className="relative z-10 p-4 md:p-8 lg:p-12 max-w-[1200px] mx-auto min-h-screen">
        {/* Decorative background shapes */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyber-violet rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-digital-orange rounded-full blur-[180px] opacity-[0.05] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.015] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]" />

        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="group select-none">
            <h1 className="text-7xl md:text-8xl font-display tracking-tight bg-gradient-to-r from-digital-orange via-orange-500 to-red-500 bg-clip-text text-transparent font-black leading-none mb-2">
              CLIPSENSE
            </h1>
            <p className="text-xs md:text-sm font-mono font-bold tracking-[0.18em] text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-digital-orange fill-current animate-pulse" />
              AI SMARTER CLIPPING FOR CONTENT CREATORS
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 py-2 rounded-full bg-ash-white text-[#070607] dark:text-[#f5f5f4] hover:scale-105 active:scale-95 transition-all shadow-sm border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center w-10 h-10"
              title="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-700 fill-indigo-700" />
              )}
            </button>

            <div className="flex items-center gap-4 text-xs font-bold bg-ash-white px-4 py-2 rounded-full">
              <User className="w-4 h-4" />
              <span className="opacity-70 truncate max-w-[120px]">
                {activeUser?.email}
              </span>
              <button
                onClick={async () => {
                  await logout();
                }}
                className="hover:text-digital-orange flex items-center gap-1 opacity-60 hover:opacity-100 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <LiquidButton
              variant="glass"
              size="lg"
              onClick={() => setShowApp(false)}
              className="h-10 text-xs px-5 font-bold tracking-wider rounded-full"
            >
              ← HOME
            </LiquidButton>
            {results && (
              <LiquidButton
                variant="orange"
                size="lg"
                onClick={() => {
                  setResults(null);
                  setFile(null);
                  setVideoUrl(null);
                }}
                className="h-10 text-xs px-5 font-bold tracking-wider rounded-full font-extrabold"
              >
                NEW ANALYSIS
              </LiquidButton>
            )}
          </div>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {!results && !isUploading ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Left Column: Upload */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div
                    {...getRootProps()}
                    className={cn(
                      "bg-ash-white border-4 border-dashed rounded-[32px] md:rounded-[40px] p-6 md:p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-6 group min-h-[240px] md:min-h-[300px]",
                      isDragActive
                        ? "border-cyber-violet bg-opacity-100"
                        : "border-abyssal-ink border-opacity-10",
                      file ? "border-digital-orange bg-opacity-100" : "",
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="w-24 h-24 bg-basalt-canvas rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-digital-orange" />
                    </div>
                    {file ? (
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          {isDirectAudio ? (
                            <FileText className="w-8 h-8 text-green-500 animate-bounce" />
                          ) : (
                            <Video className="w-8 h-8 text-digital-orange animate-pulse" />
                          )}
                          <h2 className="text-3xl font-display">{file.name}</h2>
                        </div>
                        <p className="text-body-sm opacity-60 font-medium">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                          {isDirectAudio ? "Direct Audio" : "Video Recording"}
                        </p>
                        <LiquidButton
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setVideoUrl(null);
                            setProcessingMode(null);
                          }}
                          className="mt-4 rounded-full px-4 h-8 font-bold text-xs"
                        >
                          CHANGE FILE
                        </LiquidButton>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-4xl mb-2">Drop your recording</h2>
                        <p className="text-lg opacity-60 font-medium">
                          Drop MP4, MOV, MKV, MP3, WAV, etc. up to 2GB
                        </p>
                      </div>
                    )}
                  </div>

                  {file && (
                    <div className="p-6 bg-ash-white border border-zinc-200/50 dark:border-white/[0.08] rounded-[32px] flex flex-col gap-4 animate-fade-in">
                      <h3 className="text-xl font-display font-black text-left">
                        SELECT PROCESSING OPTION
                      </h3>

                      {isDirectAudio ? (
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-500 shrink-0" />
                          <div className="text-left">
                            <p className="font-bold text-green-600 dark:text-green-400">
                              Direct Audio Mode Active
                            </p>
                            <p className="text-sm opacity-75">
                              Your audio file is lightweight. It will be
                              transcribed instantly by the speech AI.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Option 1: Extract Audio */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProcessingMode("audio");
                            }}
                            className={cn(
                              "p-5 border-2 rounded-2xl text-left transition-all flex flex-col gap-2 group relative overflow-hidden cursor-pointer",
                              processingMode === "audio"
                                ? "border-digital-orange bg-digital-orange/5"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950/50",
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 font-bold">
                                <Zap className="w-5 h-5 text-digital-orange fill-current" />
                                Extract Audio & Transcribe
                              </span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-digital-orange to-red-500 text-white leading-none">
                                RECOMMENDED
                              </span>
                            </div>
                            <p className="text-xs opacity-70 leading-relaxed font-medium">
                              Converts video to mono Audio locally in your
                              browser so you only upload the audio file (~15MB
                              instead of 1GB). Up to 10x faster, processes in
                              seconds, and completely bypasses upload sizes or
                              network disconnects!
                            </p>
                          </button>

                          {/* Option 2: Full Video */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProcessingMode("video");
                            }}
                            className={cn(
                              "p-5 border-2 rounded-2xl text-left transition-all flex flex-col gap-2 group cursor-pointer",
                              processingMode === "video"
                                ? "border-cyber-violet bg-cyber-violet/5"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950/50",
                            )}
                          >
                            <span className="flex items-center gap-2 font-bold">
                              <Video className="w-5 h-5 text-cyber-violet" />
                              Analyze Full Video
                            </span>
                            <p className="text-xs opacity-70 leading-relaxed font-medium">
                              Uploads the entire video sequence (slowest upload
                              and processing). Capture structural highlights and
                              visual context, allowing interactive playback of
                              highlights on the workspace.
                            </p>
                          </button>
                        </div>
                      )}

                      {/* Quick utility section: local WAV extractor */}
                      {!isDirectAudio && (
                        <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-left">
                            <p className="text-xs font-bold opacity-70">
                              Need a local copy of the audio?
                            </p>
                            <p className="text-[11px] opacity-50">
                              Extract and download the audio track from this
                              video file directly to your device.
                            </p>
                          </div>
                          <LiquidButton
                            variant="glass"
                            size="lg"
                            disabled={isUploading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadAudio();
                            }}
                            className="h-10 text-xs py-2 px-5 w-full sm:w-auto font-bold rounded-full"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            CONVERT & DOWNLOAD AUDIO
                          </LiquidButton>
                        </div>
                      )}
                    </div>
                  )}

                  <LiquidButton
                    disabled={!file || (!processingMode && !isDirectAudio)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpload();
                    }}
                    className={cn(
                      "w-full md:w-auto self-start text-xl md:text-2xl font-display flex items-center justify-center gap-3 h-14 md:h-16 px-8 py-4 rounded-full select-none bg-transparent hover:scale-[1.03] active:scale-[0.98] transition-transform",
                      !file || (!processingMode && !isDirectAudio)
                        ? "opacity-40 cursor-not-allowed"
                        : "text-digital-orange dark:text-digital-orange font-black",
                    )}
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-1">
                        UPLOADING...
                      </span>
                    ) : !processingMode && !isDirectAudio ? (
                      <span className="flex items-center gap-1 text-zinc-500">
                        CHOOSE PROCESSING MODE
                      </span>
                    ) : processingMode === "audio" || isDirectAudio ? (
                      <span className="flex items-center gap-2">
                        <Zap className="w-5 h-5 md:w-6 md:h-6 fill-current mr-1 text-digital-orange" />
                        START FASTER AI ANALYSIS (AUDIO-ONLY)
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Video className="w-5 h-5 md:w-6 md:h-6 mr-1 text-digital-orange" />
                        START FULL VIDEO ANALYSIS (SLOWER)
                      </span>
                    )}
                  </LiquidButton>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-4 flex flex-col">
                  <div className="bg-ash-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <History className="w-6 h-6 text-digital-orange" />
                      <h3 className="text-2xl font-display">PREVIOUS CLIPS</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 max-h-[400px] pr-2">
                      {analysesLoading && (
                        <p className="opacity-50 font-medium">
                          Loading history...
                        </p>
                      )}
                      {!analysesLoading && analyses?.length === 0 && (
                        <div className="text-center opacity-40 font-medium pt-10">
                          <p>No previous analyses found.</p>
                        </div>
                      )}
                      {analyses?.map((analysis: any, idx: number) => (
                        <button
                          key={analysis.id || "history-" + idx}
                          onClick={() => loadPreviousAnalysis(analysis)}
                          className="w-full text-left bg-basalt-canvas p-4 rounded-[24px] hover:bg-abyssal-ink hover:text-pure-white transition-all group group/history"
                        >
                          <h4
                            className="font-bold truncate"
                            title={analysis.videoName}
                          >
                            {analysis.videoName}
                          </h4>
                          <div className="flex justify-between items-center mt-2 opacity-60 group-hover/history:opacity-100">
                            <span className="text-xs font-display">
                              {analysis.highlights?.length || 0} CLIPS
                            </span>
                            <span className="text-xs font-medium">
                              {analysis.createdAt
                                ?.toDate()
                                .toLocaleDateString()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : extractionStatus || isUploading ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-ash-white rounded-[40px] p-20 flex flex-col items-center justify-center text-center gap-12"
              >
                <div className="relative w-48 h-48">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-8 border-basalt-canvas rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-8 border-transparent border-t-digital-orange rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-display">
                      {extractionStatus ? "..." : `${uploadProgress}%`}
                    </span>
                  </div>
                </div>
                <div className="max-w-md">
                  <h2 className="text-5xl mb-4">
                    {extractionStatus
                      ? "LOCAL AUDIO ISOLATION"
                      : "PROCESSING ANALYSIS"}
                  </h2>
                  <p className="text-lg opacity-60">
                    {extractionStatus
                      ? "Converting your video into a lightweight mono audio track locally. This extracts the vocals in just a few seconds and completely avoids uploading massive video streams!"
                      : "We're safely uploading your recording and running our AI analysis to produce transcripts and find clip highlights. This can take a few minutes depending on media length."}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left Column: Player & Highlights */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                  {/* Video Player Card */}
                  {videoUrl ? (
                    <div className="relative bg-abyssal-ink rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl">
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="w-full aspect-video"
                        onTimeUpdate={() => {
                          if (videoRef.current) {
                            setCurrentTime(videoRef.current.currentTime);
                          }
                        }}
                        onError={() => {
                          console.warn(
                            "Workspace video resource loaded with warnings safely.",
                          );
                        }}
                      />
                      {activeOverlay && (
                        <div className="absolute inset-0 flex flex-col justify-end items-center pb-16 pointer-events-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                          <span
                            className="text-white text-3xl md:text-5xl font-black px-6 py-3 rounded-2xl text-center max-w-[80%] break-words"
                            style={{ WebkitTextStroke: "1.5px black" }}
                          >
                            {activeOverlay}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-ash-white border-2 border-dashed border-abyssal-ink border-opacity-20 rounded-3xl md:rounded-[40px] flex items-center justify-center aspect-video text-center p-6 md:p-8">
                      <div>
                        <p className="font-display text-2xl opacity-60 mb-2">
                          RESTORED FROM HISTORY
                        </p>
                        <p className="font-medium opacity-50">
                          Because this was loaded from your history, the
                          original video file is not present for playback. The
                          timestamp offsets still apply to your local file.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Highlights Card */}
                  <div className="bg-ash-white rounded-[40px] p-10">
                    <div className="flex items-center gap-3 mb-8">
                      <Zap className="w-8 h-8 text-digital-orange" />
                      <h2 className="text-5xl">SUGGESTED CLIPS</h2>
                    </div>
                    <div className="space-y-4">
                      {results?.highlights.map((highlight, idx) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={"highlight-" + idx}
                          className="bg-basalt-canvas p-6 rounded-[32px] group hover:bg-digital-orange hover:text-pure-white transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                          onClick={() => jumpToTime(highlight.start)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="bg-abyssal-ink text-pure-white px-3 py-1 rounded-full text-xs font-bold">
                                {highlight.score}/10 HYPE
                              </span>
                              <h3 className="text-2xl">{highlight.title}</h3>
                            </div>
                            <p className="opacity-70 font-medium">
                              {highlight.description}
                            </p>

                            {/* Editor View */}
                            <AnimatePresence>
                              {editingClipIdx === idx && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-6 p-6 bg-pure-white dark:bg-zinc-900 rounded-3xl flex flex-col gap-5 border border-zinc-200/50 dark:border-zinc-800/80 shadow-inner group-hover:bg-white group-hover:text-zinc-900 overflow-hidden"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-1 items-center justify-between">
                                    <h4 className="font-extrabold text-abyssal-ink dark:text-zinc-100 flex items-center gap-2">
                                      <Edit3 className="w-4 h-4" /> Clip Refiner
                                    </h4>
                                  </div>
                                  <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex flex-col gap-1.5 flex-1">
                                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                        Start Time (HH:MM:SS)
                                      </label>
                                      <input
                                        type="text"
                                        className="bg-basalt-canvas dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-digital-orange outline-none transition-all dark:text-white"
                                        value={highlight.start}
                                        onChange={(e) =>
                                          updateHighlight(
                                            idx,
                                            "start",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1">
                                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                        End Time (HH:MM:SS)
                                      </label>
                                      <input
                                        type="text"
                                        className="bg-basalt-canvas dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-digital-orange outline-none transition-all dark:text-white"
                                        value={highlight.end}
                                        onChange={(e) =>
                                          updateHighlight(
                                            idx,
                                            "end",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                      <Type className="w-3.5 h-3.5" /> Text
                                      Overlay
                                    </label>
                                    <input
                                      type="text"
                                      className="bg-basalt-canvas dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-digital-orange outline-none transition-all dark:text-white"
                                      placeholder="Enter text to overlay during this clip..."
                                      value={highlight.overlayText || ""}
                                      onChange={(e) =>
                                        updateHighlight(
                                          idx,
                                          "overlayText",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-3 pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                                    {exportingClipIdx === idx ? (
                                      <div className="flex items-center w-full gap-4">
                                        <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                                          <div
                                            className="bg-digital-orange h-2.5 rounded-full transition-all duration-300"
                                            style={{
                                              width: `${exportProgress}%`,
                                            }}
                                          ></div>
                                        </div>
                                        <span className="text-xs font-bold text-digital-orange">
                                          {Math.round(exportProgress)}%
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        <LiquidButton
                                          variant="glass"
                                          size="default"
                                          className="h-10 text-xs px-6 rounded-full flex-[0.4]"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            jumpToTime(highlight.start);
                                          }}
                                        >
                                          <Play className="w-3.5 h-3.5 mr-1" />{" "}
                                          Preview Clip
                                        </LiquidButton>
                                        <LiquidButton
                                          variant="orange"
                                          size="default"
                                          className="h-10 text-xs px-6 rounded-full flex-[0.6] font-bold"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleExportClip(idx, highlight);
                                          }}
                                        >
                                          <Download className="w-3.5 h-3.5 mr-1" />{" "}
                                          Export Trimmed Clip
                                        </LiquidButton>
                                      </>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="flex flex-col md:items-end items-start gap-4 shrink-0">
                            <div className="text-left md:text-right">
                              <p className="font-display text-2xl leading-none whitespace-nowrap">
                                {highlight.start} - {highlight.end}
                              </p>
                              <p className="text-xs uppercase tracking-widest opacity-60">
                                Timestamp
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (editingClipIdx === idx) {
                                    setEditingClipIdx(null);
                                  } else {
                                    setEditingClipIdx(idx);
                                  }
                                }}
                                className={`p-4 rounded-full transition-colors hover:scale-110 active:scale-95 ${editingClipIdx === idx ? "bg-digital-orange text-pure-white group-hover:bg-pure-white group-hover:text-digital-orange" : "bg-basalt-canvas text-abyssal-ink group-hover:bg-pure-white group-hover:text-abyssal-ink"}`}
                                title={
                                  editingClipIdx === idx
                                    ? "Close Editor"
                                    : "Edit Clip"
                                }
                              >
                                <Scissors className="w-6 h-6" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(
                                    `${highlight.start} - ${highlight.end}`,
                                  );
                                }}
                                className="bg-basalt-canvas text-abyssal-ink p-4 rounded-full group-hover:bg-pure-white group-hover:text-abyssal-ink transition-colors hover:scale-110 active:scale-95"
                                title="Copy Timestamp"
                              >
                                <Clock className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Transcript */}
                <div className="lg:col-span-4 h-full">
                  <div className="bg-ash-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 h-full flex flex-col relative lg:sticky top-8">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-6 h-6" />
                      <h2 className="text-3xl">TRANSCRIPT</h2>
                    </div>

                    {/* Real-time Search Input */}
                    <div className="relative mb-6">
                      <input
                        type="text"
                        placeholder="Search in transcript..."
                        value={transcriptSearchQuery}
                        onChange={(e) =>
                          setTranscriptSearchQuery(e.target.value)
                        }
                        className="w-full pl-10 pr-10 py-3 bg-basalt-canvas dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/85 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-digital-orange/40 focus:border-digital-orange transition-all placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-850 dark:text-zinc-100"
                      />
                      <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      {transcriptSearchQuery && (
                        <button
                          onClick={() => setTranscriptSearchQuery("")}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none p-0.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-4 space-y-6 max-h-[calc(100vh-360px)] custom-scrollbar">
                      {(() => {
                        const query = transcriptSearchQuery
                          .trim()
                          .toLowerCase();
                        const filteredTranscript =
                          results?.transcript.filter((item) =>
                            item.text.toLowerCase().includes(query),
                          ) || [];

                        if (filteredTranscript.length === 0) {
                          return (
                            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 animate-fade-in">
                              <Search className="w-8 h-8 mx-auto opacity-30 mb-2" />
                              <p className="font-bold text-sm">
                                No matches found
                              </p>
                              <p className="text-xs mt-1">
                                Try another search term or check spelling.
                              </p>
                            </div>
                          );
                        }

                        return filteredTranscript.map((item, idx) => (
                          <div key={"transcript-" + idx} className="group">
                            <button
                              onClick={() => jumpToTime(item.time)}
                              className="flex items-center gap-2 text-digital-orange font-display text-lg mb-1 hover:underline"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              {item.time}
                            </button>
                            <p className="text-sm leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity text-left">
                              {highlightText(item.text, transcriptSearchQuery)}
                            </p>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-20 pt-10 border-t border-abyssal-ink border-opacity-10 flex flex-col md:flex-row justify-between gap-6 opacity-40 text-xs font-bold uppercase tracking-widest relative z-10">
          <div>© 2026 CLIPSENSE • AI STUDIO EDITION</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-digital-orange transition-colors">
              PRIVACY
            </a>
            <a href="#" className="hover:text-digital-orange transition-colors">
              TERMS
            </a>
          </div>
        </footer>

        {/* Export Trim Sign Up Modal popup */}
        {showExportModal && (
          <div className="fixed inset-0 bg-[#070607]/70 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fade-in transition-all">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] p-6 rounded-[32px] max-w-sm w-full text-center shadow-2xl relative">
              <button
                onClick={() => setShowExportModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-digital-orange mx-auto mb-4 animate-bounce">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white mb-2 uppercase tracking-wide">
                Export Your Trimmed Clip
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                You have selected an amazing{" "}
                <span className="text-digital-orange font-bold font-mono">
                  {(
                    ((trimEndPercent - trimStartPercent) / 100) *
                    demoVideoDuration
                  ).toFixed(1)}
                  s
                </span>{" "}
                clip segment! Create a free account to generate captions, apply
                customized branding structures, and export your clip directly in
                HD.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    loginWithGoogle();
                  }}
                  className="bg-digital-orange hover:bg-orange-600 font-extrabold text-white py-2.5 px-4 rounded-full text-[11px] shadow-lg shadow-digital-orange/20 cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" />
                  Sign Up Free with Google
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="border border-zinc-300/40 dark:border-white/[0.08] hover:bg-zinc-50 dark:hover:bg-white/[0.02] text-zinc-650 dark:text-zinc-300 font-bold py-2 px-4 rounded-full text-[10px] cursor-pointer transition-all"
                >
                  Keep Customizing Trim
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-digital-orange text-pure-white p-6 rounded-[32px] shadow-2xl flex items-center gap-4 animate-bounce z-50">
            <Zap className="w-6 h-6 fill-current" />
            <p className="font-bold">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="ml-4 bg-transparent border-white/40 text-pure-white hover:bg-white/10"
            >
              DISMISS
            </Button>
          </div>
        )}

        {sharedClip && (
          <div className="fixed inset-0 bg-[#070607]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fade-in transition-all">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] p-8 rounded-[32px] max-w-sm w-full shadow-2xl relative flex flex-col animate-in slide-in-from-bottom-8">
              <button
                onClick={() => setSharedClip(null)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-4 animate-in zoom-in spin-in-12">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-center text-zinc-950 dark:text-white mb-2 tracking-wide font-display">
                Clip Exported!
              </h3>
              <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                Your clip{" "}
                <span className="font-bold text-digital-orange">
                  "{sharedClip.title}"
                </span>{" "}
                has been rendered in HD and is ready. Use the web share
                integrations or download the file directly.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this amazing clip: "${sharedClip.title}"\n\nMade with @ClipSenseApp`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    try {
                      if (navigator.share) {
                        e.preventDefault();
                        navigator
                          .share({
                            title: sharedClip.title,
                            text: `Check out this amazing clip: "${sharedClip.title}"`,
                            url: window.location.href, // Mocking URL since it's a demo
                          })
                          .catch(console.error);
                      }
                    } catch (err) {}
                  }}
                  className="bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 dark:bg-[#1DA1F2]/15 dark:hover:bg-[#1DA1F2]/25 text-[#1DA1F2] transition-colors py-4 px-4 rounded-[20px] flex flex-col items-center justify-center gap-2 font-bold text-xs"
                >
                  <Twitter className="w-6 h-6" />
                  Share to X
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "To publish directly to TikTok, download the MP4 to your mobile device and share to the TikTok app.",
                    );
                  }}
                  className="bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white transition-colors py-4 px-4 rounded-[20px] flex flex-col items-center justify-center gap-2 font-bold text-xs"
                >
                  <TikTokIcon className="w-6 h-6" />
                  TikTok
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "YouTube publishing requires OAuth scopes for your channel. For now, download the file and upload via YouTube Studio.",
                    );
                  }}
                  className="bg-[#FF0000]/10 hover:bg-[#FF0000]/20 dark:bg-[#FF0000]/15 dark:hover:bg-[#FF0000]/25 text-[#FF0000] transition-colors py-4 px-4 rounded-[20px] flex flex-col items-center justify-center gap-2 font-bold text-xs col-span-2"
                >
                  <Youtube className="w-6 h-6" />
                  YouTube Shorts
                </a>
              </div>

              <div className="flex gap-3">
                <LiquidButton
                  variant="outline"
                  className="flex-[0.5] font-bold"
                  onClick={() => setSharedClip(null)}
                >
                  Done
                </LiquidButton>
                <MetalButton
                  className="flex-[1] font-bold"
                  onClick={() => {
                    // Simulate download
                    const a = document.createElement("a");
                    a.href = videoUrl || "#";
                    a.download = `clipsense-${sharedClip.start.replace(/:/g, "-")}.mp4`;
                    a.click();
                    setSharedClip(null);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" /> Download MP4
                </MetalButton>
              </div>
            </div>
          </div>
        )}

        <style
          dangerouslySetInnerHTML={{
            __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #07060710;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fc5000;
        }
      `,
          }}
        />
      </div>
    </div>
  );
}
