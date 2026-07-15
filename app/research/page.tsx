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
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 overflow-hidden px-5 py-12 text-center sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <img src="/icons/New_logo_eye.svg" alt="" className="w-14 opacity-80 sm:w-16" />

      <div className="w-full max-w-md">
        <h1 className="mb-3 font-serif text-2xl font-normal leading-snug text-[#ffc99d] sm:text-4xl">
          Taking you to the research…
        </h1>
        <p className="mx-auto max-w-full text-sm leading-relaxed text-white/55">
          If you are not redirected automatically, use the link below.
        </p>
      </div>

      {/* Buttons: full width on mobile, auto on larger screens */}
      <div className="flex w-full max-w-xs flex-col items-stretch gap-3">
        <a
          href={RESEARCH_URL}
          className="w-full rounded-xl border border-[#ffc99d]/50 bg-[#ffc99d]/[0.06] px-6 py-3.5 text-sm tracking-[0.04em] text-[#ffc99d] transition-colors hover:bg-[#ffc99d]/10"
        >
          Read the Research →
        </a>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3 text-[13px] tracking-[0.04em] text-white/60 transition-colors hover:text-white/90"
        >
          ← Back to Start
        </button>
      </div>
    </main>
  );
}
