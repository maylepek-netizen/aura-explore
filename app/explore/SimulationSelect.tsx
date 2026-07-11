"use client";

import { useState } from "react";
import { useNavigate } from "@/app/TransitionProvider";
import type { Simulation } from "@/lib/supabase";

export default function SimulationSelect({
  simulations,
}: {
  simulations: Pick<Simulation, "id" | "situation">[];
}) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>("");

  return (
    <div className="w-full max-w-xl">
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          aria-label="Choose a simulation"
          className="w-full appearance-none rounded-xl border border-white/15 bg-white/[0.04] py-4 pl-5 pr-12 text-base text-white outline-none transition-colors focus:border-[#ffc99d]/60 focus:bg-white/[0.06]"
          style={{ colorScheme: "dark" }}
        >
          <option value="" disabled>
            Select a situation…
          </option>
          {simulations.map((sim) => (
            <option key={sim.id} value={sim.id}>
              {sim.situation || `Untitled situation #${sim.id}`}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#ffc99d]"
        >
          ▾
        </span>
      </div>

      {selectedId && (
        <button
          type="button"
          onClick={() => navigate(`/simulation/${selectedId}`)}
          className="aura-cta mt-6 flex w-full items-center justify-center px-6 py-4 text-sm uppercase"
        >
          Start Simulation
        </button>
      )}
    </div>
  );
}
