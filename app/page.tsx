import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Ambient cinematic glow — breathing */}
      <div
        aria-hidden
        className="aura-breathe-slow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,201,157,0.26) 0%, rgba(188,194,255,0.13) 45%, rgba(10,8,7,0) 72%)",
        }}
      />
      {/* Vignette — matches main app radial darkening */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* Slow scan line */}
      <div aria-hidden className="aura-scan -z-10" style={{ top: "0" }} />

      <p className="aura-rise mb-6 text-[9px] uppercase tracking-[0.5em] text-[#ffc99d]/70">
        Simulation NO. 792734-04
      </p>

      <h1 className="aura-rise-2 font-serif text-6xl font-normal leading-none tracking-tight text-[#ffc99d] sm:text-8xl">
        AURA
      </h1>

      <p className="aura-rise-3 mt-6 max-w-md text-sm tracking-[0.18em] text-white/70 sm:text-base">
        Experience autism through different eyes
      </p>

      <Link
        href="/explore"
        className="aura-cta aura-rise-4 mt-14 inline-flex items-center gap-3 px-12 py-4 text-[13px] uppercase"
      >
        Enter
        <span aria-hidden>→</span>
      </Link>
    </main>
  );
}
