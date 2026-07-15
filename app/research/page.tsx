"use client";

import { useEffect } from "react";
import { useNavigate } from "@/app/TransitionProvider";

const RESEARCH_URL = "https://aura-simulator.vercel.app/research";

// The research content lives on the main AURA simulator. This route auto-redirects
// there, with a visible fallback link + "Back to Start" in case the redirect is
// blocked or the destination is unavailable, so viewers are never stranded.
export default function ResearchPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.location.replace(RESEARCH_URL);
  }, []);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <img src="/icons/New_logo_eye.svg" alt="" className="w-16 opacity-80" />

      <div>
        <h1 className="mb-3 font-serif text-3xl font-normal text-[#ffc99d] sm:text-4xl">
          Taking you to the research…
        </h1>
        <p className="text-sm text-white/55">
          If you are not redirected automatically, use the link below.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <a
          href={RESEARCH_URL}
          className="rounded-xl border border-[#ffc99d]/50 bg-[#ffc99d]/[0.06] px-6 py-3 text-sm tracking-[0.04em] text-[#ffc99d] transition-colors hover:bg-[#ffc99d]/10"
        >
          Read the Research →
        </a>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-[13px] tracking-[0.04em] text-white/50 transition-colors hover:text-white/80"
        >
          ← Back to Start
        </button>
      </div>
    </main>
  );
}
