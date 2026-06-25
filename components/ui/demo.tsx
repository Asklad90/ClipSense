"use client"

import { WebGLShader } from "@/components/ui/web-gl-shader"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { ArrowLeft } from "lucide-react"

interface DemoOneProps {
  onBack?: () => void
}

export default function DemoOne({ onBack }: DemoOneProps) {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden min-h-screen py-12 px-4 bg-black select-none">
      <WebGLShader /> 

      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-6 left-6 z-55 bg-black/80 hover:bg-zinc-900 border border-zinc-700 text-white font-bold px-4 py-2 rounded-full transition-all text-xs uppercase tracking-wider cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to ClipSense
        </button>
      )}

      <div className="relative border border-[#27272a] p-2 w-full mx-auto max-w-3xl bg-black/40 backdrop-blur-xs rounded-3xl z-20">
        <main className="relative border border-[#27272a] py-16 px-4 overflow-hidden rounded-[22px] bg-neutral-950/60">
          <h1 className="mb-4 text-white text-center text-4xl sm:text-7xl font-extrabold tracking-tighter leading-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Design is Everything
          </h1>
          <p className="text-white/60 px-6 text-center text-xs md:text-sm lg:text-lg max-w-xl mx-auto mb-2 leading-relaxed">
            Unleashing creativity through bold visuals, seamless interfaces, and limitless possibilities.
          </p>
          <div className="my-8 flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
            </span>
            <p className="text-[11px] font-semibold text-green-550 dark:text-green-500 uppercase tracking-wider">
              Available for New Projects
            </p>
          </div>
          
          <div className="flex justify-center mt-6"> 
            <LiquidButton className="text-white border border-white/20 hover:border-white/40 rounded-full" size="xl">
              Let's Go
            </LiquidButton> 
          </div> 
        </main>
      </div>
    </div>
  )
}
