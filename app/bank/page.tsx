import { getSimulations } from "@/lib/supabase";
import CornerIcons from "@/components/CornerIcons";
import BankGrid from "./BankGrid";

// Data comes from Supabase at request time.
export const dynamic = "force-dynamic";

export default async function BankPage() {
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

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-28 pt-[12vh]">
        <div className="aura-rise mb-8 text-center">
          <h1 className="mb-3 font-serif text-4xl font-normal text-[#ffc99d] sm:text-5xl">
            Simulation Bank
          </h1>
          <p className="text-sm tracking-[0.02em] text-white/55">
            The full library — tap a card to step inside.
          </p>
        </div>

        {simulations.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/40 p-10 text-center text-sm uppercase tracking-[0.18em] text-white/40">
            No simulations available right now.
          </div>
        ) : (
          <BankGrid
            simulations={simulations.map((s) => ({
              id: s.id,
              situation: s.situation,
              video_url: s.video_url,
              sensory_load: s.sensory_load,
            }))}
          />
        )}
      </div>
    </main>
  );
}
