"use client";

import { useNavigate } from "@/app/TransitionProvider";

// "Back to Start" button, fixed to the TOP RIGHT of the explore screen.
export default function ExploreFooter() {
  const navigate = useNavigate();
  return (
    <div
      className="pointer-events-none fixed right-0 top-0 z-30 flex items-center justify-end px-5 py-4"
      // Respect the notch/status bar on phones reporting a top inset.
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
    >
      <button
        type="button"
        onClick={() => navigate("/")}
        // min-h-[44px] meets the touch-target minimum (measured 42px before).
        className="pointer-events-auto flex min-h-[44px] items-center rounded-xl border border-white/15 bg-black/40 px-5 py-2.5 text-[13px] tracking-[0.04em] text-white/70 backdrop-blur transition-colors hover:border-[#ffc99d]/40 hover:text-[#ffc99d]"
      >
        ← Back to Start
      </button>
    </div>
  );
}
