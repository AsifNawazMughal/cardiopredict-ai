"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft, Heart } from "lucide-react";
import { SLIDES } from "./slides";

export default function PresentationPage() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, SLIDES.length - 1)), []);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  // Keyboard navigation: ← → arrows, Home / End
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp")                { e.preventDefault(); prev(); }
      else if (e.key === "Home")                                            { e.preventDefault(); setIndex(0); }
      else if (e.key === "End")                                             { e.preventDefault(); setIndex(SLIDES.length - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;
  const isThemed = slide.themed;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        <Link href="/about" className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
          <ArrowLeft className="w-4 h-4"/> Back to About
        </Link>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-600" fill="currentColor"/>
          <span className="font-bold text-gray-900 text-sm hidden sm:inline">CardioPredict AI</span>
          <span className="text-xs text-gray-500 hidden sm:inline">— Presentation</span>
        </div>
        <div className="text-xs text-gray-500 font-mono tabular-nums">
          {index + 1} / {SLIDES.length}
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 flex items-stretch p-3 sm:p-6">
        <div className={`flex-1 rounded-2xl shadow-lg overflow-hidden flex flex-col ${isThemed ? "bg-gradient-to-br from-red-600 to-rose-600" : "bg-white"}`}>
          <div className="flex-1 min-h-[60vh]">
            {slide.render()}
          </div>
        </div>
      </div>

      {/* Progress + controls */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* Segmented progress bar */}
          <div className="flex gap-1 mb-3">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`flex-1 h-1.5 rounded-full transition-colors ${i <= index ? "bg-red-600" : "bg-gray-200 hover:bg-gray-300"}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={prev}
              disabled={isFirst}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4"/> Prev
            </button>
            <p className="text-xs text-gray-500 hidden sm:block">
              Use <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">→</kbd> arrow keys to navigate
            </p>
            <button
              onClick={next}
              disabled={isLast}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
