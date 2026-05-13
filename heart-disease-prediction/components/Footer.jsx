import { Heart, Github, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white">
      <div className="max-w-5xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-white" fill="currentColor" />
          <span>
            <span className="font-semibold">cardioai-prediction</span>
            <span className="text-red-100"> — a project by </span>
            <span className="font-semibold">Asif Nawaz</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/about"
            className="bg-white text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 font-bold px-4 py-1.5 rounded-full shadow-md ring-1 ring-white/30"
          >
            About <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://github.com/AsifNawazMughal/cardiopredict-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-100 hover:text-white transition-colors flex items-center gap-1 font-medium"
          >
            <Github className="w-3.5 h-3.5" /> Source
          </a>
        </div>
      </div>
    </footer>
  );
}
