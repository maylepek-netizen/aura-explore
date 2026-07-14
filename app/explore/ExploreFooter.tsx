"use client";

import { useNavigate } from "@/app/TransitionProvider";

// Footer bar on the explore ("Simulation Bank") screen. A single "Back to Start"
// button returns to the landing page. (A "Read the Research" button was requested
// too, but aura-explore has no /research route, so it is intentionally omitted.)
export default function ExploreFooter() {
  const navigate = useNavigate();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-center justify-end px-6 py-4">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="pointer-events-auto rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-[13px] tracking-[0.04em] text-white/70 transition-colors hover:border-[#ffc99d]/40 hover:text-[#ffc99d]"
      >
        ← Back to Start
      </button>
    </div>
  );
}
