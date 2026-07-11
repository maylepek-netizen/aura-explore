import Link from "next/link";
import { getSimulations } from "@/lib/supabase";
import { sensoryIntensity } from "@/lib/metrics";

// Data comes from Supabase at request time.
export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const simulations = await getSimulations();

  return (
    <main className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 sm:mb-14">
        <Link
          href="/"
          className="mb-8 inline-block text-xs uppercase tracking-[0.35em] text-[#f3ece4]/40 transition-colors hover:text-[#ffc99d]"
        >
          ← aura
        </Link>
        <h1 className="font-serif text-4xl font-bold text-[#ffc99d] sm:text-5xl">
          Choose a moment
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[#f3ece4]/55 sm:text-base">
          Each simulation places you inside a single situation. Select one to
          step in.
        </p>
      </header>

      {simulations.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-[#f3ece4]/50">
          No simulations available right now.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {simulations.map((sim) => {
            const intensity = sensoryIntensity(sim.sensory_load);
            return (
              <li key={sim.id}>
                <Link
                  href={`/simulation/${sim.id}`}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:border-[#ffc99d]/50 hover:bg-[#ffc99d]/[0.04] hover:shadow-[0_0_50px_-14px_rgba(255,201,157,0.6)] sm:p-6"
                >
                  {/* Hover glow wash */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(120% 80% at 50% 0%, rgba(255,201,157,0.12) 0%, rgba(10,8,7,0) 60%)",
                    }}
                  />

                  <p className="font-serif text-lg leading-snug text-[#f3ece4] sm:text-xl">
                    {sim.situation || "Untitled situation"}
                  </p>

                  <div className="mt-6">
                    <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-[#f3ece4]/40">
                      <span>Sensory load</span>
                      <span className="text-[#ffc99d]/70">{intensity}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${intensity}%`,
                          background:
                            "linear-gradient(90deg, #bcc2ff 0%, #ffc1bb 50%, #ffc99d 100%)",
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
