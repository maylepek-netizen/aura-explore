import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Ambient cinematic glow */}
      <div
        aria-hidden
        className="aura-breathe pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,201,157,0.28) 0%, rgba(188,194,255,0.14) 45%, rgba(10,8,7,0) 72%)",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 45%, rgba(10,8,7,0) 40%, rgba(10,8,7,0.85) 100%)",
        }}
      />

      <p className="mb-6 text-xs uppercase tracking-[0.5em] text-[#ffc99d]/70">
        A U R A
      </p>

      <h1 className="font-serif text-6xl font-bold leading-none tracking-tight text-[#ffc99d] sm:text-8xl">
        aura
      </h1>

      <p className="mt-6 max-w-md font-serif text-lg italic text-[#f3ece4]/75 sm:text-xl">
        Experience autism through different eyes
      </p>

      <Link
        href="/explore"
        className="group mt-14 inline-flex items-center gap-3 rounded-full border border-[#ffc99d]/30 bg-[#ffc99d]/[0.04] px-10 py-3.5 text-sm uppercase tracking-[0.35em] text-[#ffc99d] transition-all duration-300 hover:border-[#ffc99d]/70 hover:bg-[#ffc99d]/10 hover:shadow-[0_0_40px_-8px_rgba(255,201,157,0.55)]"
      >
        Enter
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </Link>
    </main>
  );
}
