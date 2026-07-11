import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-5xl font-bold text-[#ffc99d]">404</h1>
      <p className="mt-4 max-w-sm font-serif text-lg italic text-[#f3ece4]/70">
        That moment doesn&apos;t exist.
      </p>
      <Link
        href="/explore"
        className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#ffc99d]/30 px-8 py-3 text-sm uppercase tracking-[0.3em] text-[#ffc99d] transition-all hover:border-[#ffc99d]/70 hover:bg-[#ffc99d]/10"
      >
        Back to simulations
      </Link>
    </main>
  );
}
