import { getSimulations } from "@/lib/supabase";
import CornerIcons from "@/components/CornerIcons";
import BankGrid from "./BankGrid";

// Data comes from Supabase at request time.
export const dynamic = "force-dynamic";

export default async function BankPage() {
  const simulations = await getSimulations();

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#0a0806]">
      {/* Radial vignette overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <CornerIcons />

      {/* Top title bar */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center gap-3 border-b border-white/[0.07] bg-black/70 px-7 py-4 backdrop-blur">
        <img src="/icons/bank.svg" alt="" className="w-[18px] opacity-60" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/70">Simulation Bank</span>
        <span className="text-[10px] tracking-[0.1em] text-white/25">{simulations.length} saved</span>
      </div>

      {simulations.length === 0 ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
          <img src="/icons/bank.svg" alt="" className="w-10 opacity-25" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/30">
            No simulations available right now.
          </p>
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
    </main>
  );
}
