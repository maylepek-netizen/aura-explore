import { getSimulations } from "@/lib/supabase";
import CornerIcons from "@/components/CornerIcons";
import SimulationSelect from "./SimulationSelect";
import ExploreFooter from "./ExploreFooter";

// Data comes from Supabase at request time.
export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const simulations = await getSimulations();

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Radial vignette overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <CornerIcons />

      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-6 pb-16 pt-[14vh]">
        <div className="aura-rise w-full max-w-2xl">
          <h1 className="mb-3 text-center font-serif text-4xl font-normal text-[#ffc99d] sm:text-5xl">
            Choose a Simulation
          </h1>
          <p className="mb-8 text-center text-sm tracking-[0.02em] text-white/55">
            Select a situation to step inside it.
          </p>

          {simulations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-10 text-center text-sm uppercase tracking-[0.18em] text-white/40">
              No simulations available right now.
            </div>
          ) : (
            <SimulationSelect
              simulations={simulations.map((s) => ({
                id: s.id,
                situation: s.situation,
              }))}
            />
          )}
        </div>
      </div>

      <ExploreFooter />
    </main>
  );
}
