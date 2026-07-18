import Link from "next/link";
import { getSimulations } from "@/lib/supabase";
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

      {/* Top title bar — eye logo (top-left) navigates back to start */}
      {/* px-7 → px-4 on the narrowest phones so the title row doesn't crowd;
          safe-area padding keeps it clear of the notch. */}
      <div
        className="fixed inset-x-0 top-0 z-20 flex items-center gap-3 border-b border-white/[0.07] bg-black/70 px-4 py-4 backdrop-blur sm:px-7"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        {/* The logo alone gave a 17px-tall tap target — well under the 44px
            minimum. -m-3 p-3 grows the hit area without moving the logo. */}
        <Link
          href="/"
          aria-label="Back to start"
          className="-m-3 flex min-h-[44px] min-w-[44px] items-center justify-center p-3"
        >
          <img src="/icons/New_logo_eye.svg" alt="Back to start" className="w-[22px] opacity-70 transition-opacity hover:opacity-100" />
        </Link>
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/70">Simulation Bank</span>
        {/* Drops off below 360px rather than wrapping the row. */}
        <span className="hidden text-[10px] tracking-[0.1em] text-white/25 min-[360px]:inline">{simulations.length} saved</span>
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
