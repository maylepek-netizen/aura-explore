"use client";

import { useState } from "react";
import { useNavigate } from "@/app/TransitionProvider";
import { sensoryIntensity } from "@/lib/metrics";
import type { Simulation } from "@/lib/supabase";

type Card = Pick<Simulation, "id" | "situation" | "video_url" | "sensory_load">;

function loadColor(intensity: number) {
  return intensity > 70 ? "#e05c5c" : intensity > 45 ? "#ffc99d" : "#5ce08c";
}

function SimCard({ sim, onOpen }: { sim: Card; onOpen: () => void }) {
  const [failed, setFailed] = useState(false);
  const intensity = sensoryIntensity(sim.sensory_load);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex snap-center flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/30 text-left transition-all duration-300 hover:border-[#ffc99d]/40 hover:bg-black/50"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {sim.video_url && !failed ? (
          <video
            src={sim.video_url}
            muted
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(80% 60% at 50% 40%, rgba(255,201,157,0.16) 0%, rgba(188,194,255,0.10) 45%, #050403 85%)",
            }}
          />
        )}
        {/* Load bar */}
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${intensity}%`, background: loadColor(intensity) }}
          />
        </div>
      </div>

      {/* Caption */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="flex-1 text-sm leading-snug text-white/60 transition-colors duration-200 group-hover:text-white/90">
          {sim.situation || `Untitled situation #${sim.id}`}
        </span>
        <span
          aria-hidden
          className="text-white/20 transition-colors duration-200 group-hover:text-[#ffc99d]"
        >
          →
        </span>
      </div>
    </button>
  );
}

export default function BankGrid({ simulations }: { simulations: Card[] }) {
  const navigate = useNavigate();

  return (
    <>
      {/*
        Mobile: a horizontal snap-scroll row — swipe through cards with the thumb.
        Desktop (sm+): a normal multi-column grid.
      */}
      <div
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:snap-none sm:overflow-visible sm:px-0 lg:grid-cols-3"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y" }}
      >
        {simulations.map((sim) => (
          <div key={sim.id} className="w-[78vw] max-w-[320px] flex-none sm:w-auto sm:max-w-none">
            <SimCard sim={sim} onOpen={() => navigate(`/simulation/${sim.id}`)} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="pointer-events-auto rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-[13px] tracking-[0.04em] text-white/70 transition-colors hover:border-[#ffc99d]/40 hover:text-[#ffc99d]"
        >
          ← Back to Start
        </button>
        <button
          type="button"
          onClick={() => navigate("/research")}
          className="pointer-events-auto rounded-xl border border-[#ffc99d]/50 bg-[#ffc99d]/[0.06] px-5 py-2.5 text-[13px] tracking-[0.04em] text-[#ffc99d] transition-colors hover:bg-[#ffc99d]/10"
        >
          Read the Research →
        </button>
      </div>
    </>
  );
}
