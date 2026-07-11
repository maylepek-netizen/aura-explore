"use client";

import { useNavigate } from "./TransitionProvider";

const MUSIC_SRC =
  "https://res.cloudinary.com/duhsqezo3/video/upload/v1781351439/background_music_lhjybz.mp3";

export default function Home() {
  const navigate = useNavigate();

  function enter() {
    // Initialize global background music on the user gesture (autoplay-safe),
    // then let BackgroundMusic keep it going across navigations.
    if (typeof window !== "undefined" && !window.backgroundMusic) {
      const audio = new Audio(MUSIC_SRC);
      audio.loop = true;
      audio.volume = 0.35;
      window.backgroundMusic = audio;
      audio.play().catch(() => {});
    }
    navigate("/explore");
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Ambient cinematic glow — breathing */}
      <div
        aria-hidden
        className="aura-breathe-slow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,201,157,0.26) 0%, rgba(188,194,255,0.13) 45%, rgba(10,8,7,0) 72%)",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* Slow scan line */}
      <div aria-hidden className="aura-scan -z-10" style={{ top: "0" }} />

      <p className="aura-rise mb-6 text-[9px] uppercase tracking-[0.5em] text-[#ffc99d]/70">
        Simulation NO. 792734-04
      </p>

      {/* Real AURA eye logo (masked SVG) */}
      <div
        className="aura-rise-2 aura-breathe-slow mb-5"
        role="img"
        aria-label="AURA"
        style={{
          width: "clamp(56px, 8vw, 88px)",
          height: "calc(clamp(56px, 8vw, 88px) * 112 / 148)",
          backgroundColor: "#FFC99D",
          WebkitMask: "url('/icons/New_logo_eye.svg') no-repeat center / contain",
          mask: "url('/icons/New_logo_eye.svg') no-repeat center / contain",
        }}
      />

      <h1 className="aura-rise-2 font-serif text-5xl font-normal leading-none tracking-tight text-[#ffc99d] sm:text-7xl">
        AURA
      </h1>

      <p className="aura-rise-3 mt-6 max-w-md text-sm tracking-[0.18em] text-white/70 sm:text-base">
        Experience autism through different eyes
      </p>

      <button
        type="button"
        onClick={enter}
        className="aura-cta aura-rise-4 mt-14 inline-flex items-center gap-3 px-12 py-4 text-[13px] uppercase"
      >
        Enter
        <span aria-hidden>→</span>
      </button>
    </main>
  );
}
