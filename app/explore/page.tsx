import { getSimulations } from "@/lib/supabase";
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

      <ExploreFooter />

      {/* min-h-[100dvh] not min-h-screen: 100vh ignores mobile browser chrome
          and pushes content off-screen. justify-center centres the whole block
          (heading + subtitle + list) vertically instead of pinning it to a
          fixed top offset, so it sits lower and stays balanced on any screen
          height. The top padding is now only a floor that clears the fixed
          "Back to Start" button when the content is tall. px-4 on 320px
          screens buys back 16px. */}
      <div
        className="mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col items-center justify-center px-4 min-[360px]:px-6"
        style={{
          paddingTop: "calc(72px + env(safe-area-inset-top))",
          paddingBottom: "calc(4rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="aura-rise w-full max-w-2xl">
          {/* Fluid headline: fits 320px without clipping, grows on tablets. */}
          <h1
            className="mb-3 text-center font-serif font-normal text-[#ffc99d]"
            style={{ fontSize: "clamp(1.75rem, 8.5vw, 3rem)", lineHeight: 1.15, textWrap: "balance" }}
          >
            Choose a Simulation
          </h1>
          <p
            className="mb-8 text-center tracking-[0.02em] text-white/55"
            style={{ fontSize: "clamp(0.8125rem, 3.6vw, 0.875rem)" }}
          >
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
    </main>
  );
}
