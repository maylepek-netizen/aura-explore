import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-5xl font-normal text-[#ffc99d]">404</h1>
      <p className="mt-4 max-w-sm font-serif text-lg italic text-white/70">
        That moment doesn&apos;t exist.
      </p>
      <Link
        href="/explore"
        className="aura-cta mt-10 inline-flex items-center gap-2 px-8 py-3 text-sm uppercase"
      >
        Back to simulations
      </Link>
    </main>
  );
}
