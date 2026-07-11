import Link from "next/link";
import { getSimulations } from "@/lib/supabase";
import { sensoryIntensity } from "@/lib/metrics";

// Data comes from Supabase at request time.
export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const simulations = await getSimulations();

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Radial vignette overlay — matches bank page */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="aura-rise mb-10 sm:mb-14">
          <Link
            href="/"
            className="mb-8 inline-block text-[10px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-[#ffc99d]"
          >
            ← Home
          </Link>
          <div className="flex items-baseline gap-3">
            <h1 className="font-serif text-4xl font-normal text-[#ffc99d] sm:text-5xl">
              Simulation Bank
            </h1>
            <span className="font-mono text-xs tracking-[0.1em] text-white/25">
              {simulations.length} saved
            </span>
          </div>
          <p className="mt-3 max-w-xl text-sm tracking-[0.02em] text-white/55">
            Each simulation places you inside a single situation. Select one to
            step in.
          </p>
        </header>

        {simulations.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm uppercase tracking-[0.18em] text-white/40">
            No simulations available right now.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {simulations.map((sim, i) => {
              const intensity = sensoryIntensity(sim.sensory_load);
              const loadColor =
                intensity > 70
                  ? "#e05c5c"
                  : intensity > 45
                    ? "#ffc99d"
                    : "#5ce08c";
              const num = String(i + 1).padStart(3, "0");
              const videoSrc = sim.video_url || null;

              return (
                <li
                  key={sim.id}
                  className="aura-card-fade"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <Link
                    href={`/simulation/${sim.id}`}
                    className="group block"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[5/3] w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.4)] grayscale transition-all duration-500 group-hover:scale-[1.04] group-hover:border-[#ffc99d]/35 group-hover:grayscale-0 group-hover:shadow-[0_0_24px_rgba(255,201,157,0.2),0_8px_32px_rgba(0,0,0,0.5)] group-hover:brightness-105">
                      {videoSrc ? (
                        <video
                          src={videoSrc}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="h-full w-full"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(20,15,10,0.9), rgba(10,8,6,0.95))",
                          }}
                        />
                      )}

                      {/* Sim number */}
                      <span className="absolute left-2.5 top-2.5 font-mono text-[9px] tracking-[0.2em] text-white/30 transition-colors group-hover:text-[#ffc99d]/80">
                        #{num}
                      </span>
                      {/* Load value */}
                      <span
                        className="absolute right-2.5 top-2.5 font-mono text-[9px] tracking-[0.1em] text-white/25 transition-colors"
                        style={{ color: undefined }}
                      >
                        <span className="group-hover:hidden">{intensity}%</span>
                        <span
                          className="hidden group-hover:inline"
                          style={{ color: loadColor }}
                        >
                          {intensity}%
                        </span>
                      </span>

                      {/* Load bar at bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/[0.08]">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{ width: `${intensity}%`, background: loadColor }}
                        />
                      </div>
                    </div>

                    {/* Meta below thumbnail */}
                    <div className="mt-2.5 px-0.5">
                      <div className="mb-1 text-[9px] uppercase tracking-[0.14em] text-white/35 transition-colors group-hover:text-white/70">
                        Simulation · Load {intensity}
                      </div>
                      <p className="font-serif text-sm leading-snug text-white/45 transition-colors group-hover:text-white/75">
                        {sim.situation || "Untitled situation"}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
