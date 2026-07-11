import { getSimulations } from "@/lib/supabase";
import AppSidebar from "@/components/AppSidebar";
import SimulationSelect from "./SimulationSelect";

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

      <AppSidebar />

      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 sm:pl-24">
        <div className="aura-rise w-full max-w-xl">
          <h1 className="mb-3 text-center font-serif text-4xl font-normal text-[#ffc99d] sm:text-5xl">
            Choose a Simulation
          </h1>
          <p className="mb-10 text-center text-sm tracking-[0.02em] text-white/55">
            Select a situation to step inside it.
          </p>

          {simulations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm uppercase tracking-[0.18em] text-white/40">
              No simulations available right now.
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <SimulationSelect
                simulations={simulations.map((s) => ({
                  id: s.id,
                  situation: s.situation,
                }))}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
