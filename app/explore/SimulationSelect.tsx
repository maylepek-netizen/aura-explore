"use client";

import { useNavigate } from "@/app/TransitionProvider";
import type { Simulation } from "@/lib/supabase";

// A fixed, always-visible scrollable list of simulations. Each row is a button;
// clicking it navigates straight to that simulation. No dropdown, no separate
// confirm button. Styling: translucent-black rows with a subtle border and
// soft white text, brightening on hover toward the peach accent.
export default function SimulationSelect({
  simulations,
}: {
  simulations: Pick<Simulation, "id" | "situation">[];
}) {
  const navigate = useNavigate();

  return (
    <div
      className="no-scrollbar max-h-[55vh] w-full overflow-y-auto overscroll-contain rounded-2xl border border-white/12 bg-black/40 p-2 backdrop-blur-sm"
    >
      <ul className="flex flex-col gap-1.5">
        {simulations.map((sim) => (
          <li key={sim.id}>
            <button
              type="button"
              onClick={() => navigate(`/simulation/${sim.id}`)}
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
  );
}
