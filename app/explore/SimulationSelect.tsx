"use client";

import { useState } from "react";
import { useNavigate } from "@/app/TransitionProvider";
import type { Simulation } from "@/lib/supabase";

// A fixed, always-visible scrollable list of simulations. Each row is a button;
// clicking it shows a brief pulsing-eye loading screen, then navigates to that
// simulation. No dropdown, no separate confirm button. Styling: translucent-black
// rows with a subtle border and soft white text, brightening toward peach on hover.
export default function SimulationSelect({
  simulations,
}: {
  simulations: Pick<Simulation, "id" | "situation">[];
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Show the loading screen, then navigate after a short beat so the pulsing
  // eye reads as a deliberate transition into the simulation.
  const select = (id: number) => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => navigate(`/simulation/${id}`), 900);
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0807]">
          <img
            src="/icons/New_logo_eye.svg"
            alt=""
            className="aura-select-eye"
            style={{ width: "clamp(60px, 12vw, 80px)", opacity: 0.9 }}
          />
          <style>{`
            @keyframes aura-select-eye-kf { 0%,100%{opacity:0.55;transform:scale(0.94)} 50%{opacity:1;transform:scale(1.06)} }
            .aura-select-eye { animation: aura-select-eye-kf 1.6s ease-in-out infinite; }
          `}</style>
        </div>
      )}

      <div className="no-scrollbar max-h-[55vh] w-full overflow-y-auto overscroll-contain rounded-2xl border border-white/12 bg-black/40 p-2 backdrop-blur-sm">
        <ul className="flex flex-col gap-1.5">
          {simulations.map((sim) => (
            <li key={sim.id}>
              <button
                type="button"
                onClick={() => select(sim.id)}
                className="group flex w-full items-center gap-3 rounded-xl border border-white/8 bg-black/30 px-5 py-4 text-left transition-all duration-200 hover:border-[#ffc99d]/40 hover:bg-black/50"
              >
                <span className="flex-1 font-serif text-base leading-snug text-white/55 transition-colors duration-200 group-hover:text-white/90">
                  {sim.situation || `Untitled situation #${sim.id}`}
                </span>
                <span
                  aria-hidden
                  className="text-white/20 transition-colors duration-200 group-hover:text-[#ffc99d]"
                >
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
