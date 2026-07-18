"use client";

import { useRef, useState } from "react";
import { useNavigate } from "@/app/TransitionProvider";
import { sensoryIntensity } from "@/lib/metrics";
import type { Simulation } from "@/lib/supabase";

type Card = Pick<Simulation, "id" | "situation" | "video_url" | "sensory_load">;

// Random but stable positions across a virtual canvas (ported from the main
// AURA bank). A seeded LCG keeps the scatter identical between renders.
function getCardPositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const rng = (seed: number) => {
    let s = seed;
    return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  };
  const rand = rng(42);
  const cols = Math.ceil(Math.sqrt(count * 1.6));
  const cellW = 2800 / cols;
  const cellH = 1800 / Math.ceil(count / cols || 1);
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push({
      x: 100 + col * cellW + rand() * cellW * 0.5,
      y: 100 + row * cellH + rand() * cellH * 0.5,
    });
  }
  return positions;
}

function loadColor(intensity: number) {
  return intensity > 70 ? "#e05c5c" : intensity > 45 ? "#ffc99d" : "#5ce08c";
}

function SimCard({
  sim, index, x, y, onOpen,
}: {
  sim: Card; index: number; x: number; y: number; onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [failed, setFailed] = useState(false);
  const intensity = sensoryIntensity(sim.sensory_load);
  const snippet = (sim.situation ?? "").length > 80 ? sim.situation!.slice(0, 80) + "…" : (sim.situation || `Untitled #${sim.id}`);
  const num = String(index + 1).padStart(3, "0");

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onOpen(); }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        // Fluid card width: on a 320px phone a fixed 200px card leaves almost
        // no breathing room, and the thumbnail crowds the edge. Scale with the
        // viewport but never below 150px (unreadable) or above 200px (the
        // original desktop size).
        width: "clamp(150px, 46vw, 200px)",
        cursor: "pointer",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        filter: hovered ? "grayscale(0%) brightness(1.05)" : "grayscale(100%)",
        transition: "all 0.4s ease",
        opacity: 0,
        animation: "cardFadeIn 0.6s ease forwards",
        animationDelay: `${index * 0.06}s`,
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: "100%",
        // Aspect-ratio rather than a fixed 120px: the card width is now fluid,
        // so a fixed height would distort the thumbnail on small screens.
        aspectRatio: "5 / 3",
        borderRadius: 8,
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${hovered ? "rgba(255,201,157,0.35)" : "rgba(255,255,255,0.1)"}`,
        overflow: "hidden",
        position: "relative",
        boxShadow: hovered ? "0 0 24px rgba(255,201,157,0.2), 0 8px 32px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.4)",
        transition: "all 0.4s ease",
      }}>
        {sim.video_url && !failed ? (
          <video
            src={sim.video_url}
            muted
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.5; }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(20,15,10,0.9), rgba(10,8,6,0.95))" }} />
        )}
        {/* Load bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ height: "100%", width: `${intensity}%`, background: loadColor(intensity), transition: "width 1s ease" }} />
        </div>
        {/* Number */}
        <div style={{ position: "absolute", top: 10, left: 10, fontSize: 9, letterSpacing: "0.2em", color: hovered ? "rgba(255,201,157,0.8)" : "rgba(255,255,255,0.3)" }}>#{num}</div>
        {/* Load value */}
        <div style={{ position: "absolute", top: 10, right: 10, fontSize: 9, letterSpacing: "0.1em", color: hovered ? loadColor(intensity) : "rgba(255,255,255,0.25)" }}>{intensity}%</div>
      </div>

      {/* Caption */}
      <div style={{ marginTop: 8, padding: "0 2px" }}>
        <p style={{
          // 10px is below comfortable mobile reading size; scale up slightly on
          // wider screens. overflowWrap stops a long unbroken situation string
          // (e.g. a URL or a long compound word) from pushing past the card.
          fontSize: "clamp(11px, 2.9vw, 12px)",
          lineHeight: 1.55,
          overflowWrap: "anywhere",
          color: hovered ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.3)",
          margin: 0,
          transition: "color 0.4s",
        }}>
          {snippet}
        </p>
      </div>
    </div>
  );
}

export default function BankGrid({ simulations }: { simulations: Card[] }) {
  const navigate = useNavigate();
  const positions = getCardPositions(simulations.length);

  // Pan state (mouse + touch). `moved` distinguishes a drag from a tap so a
  // pan doesn't accidentally open a card.
  const [offset, setOffset] = useState({ x: -200, y: -60 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const startPan = (x: number, y: number) => {
    dragging.current = true;
    moved.current = false;
    last.current = { x, y };
  };
  const movePan = (x: number, y: number) => {
    if (!dragging.current) return;
    const dx = x - last.current.x;
    const dy = y - last.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved.current = true;
    last.current = { x, y };
    setOffset((p) => ({ x: p.x + dx, y: p.y + dy }));
  };
  const endPan = () => { dragging.current = false; };

  const openCard = (id: number) => { if (!moved.current) navigate(`/simulation/${id}`); };

  return (
    <div className="fixed inset-0" style={{ overflow: "hidden", userSelect: "none" }}>
      <style>{`
        @keyframes cardFadeIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Pannable canvas — mouse drag + one-finger touch pan */}
      <div
        onMouseDown={(e) => { if (!(e.target as HTMLElement).closest("[data-card]")) startPan(e.clientX, e.clientY); }}
        onMouseMove={(e) => movePan(e.clientX, e.clientY)}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onTouchStart={(e) => { const t = e.touches[0]; startPan(t.clientX, t.clientY); }}
        onTouchMove={(e) => { const t = e.touches[0]; movePan(t.clientX, t.clientY); }}
        onTouchEnd={endPan}
        style={{ position: "absolute", inset: 0, cursor: dragging.current ? "grabbing" : "grab", zIndex: 1, touchAction: "none" }}
      >
        <div style={{
          position: "absolute",
          width: 3000, height: 2000,
          left: offset.x,
          top: offset.y,
          transition: dragging.current ? "none" : "left 0.05s, top 0.05s",
        }}>
          {simulations.map((sim, i) => {
            const pos = positions[i] ?? { x: 100, y: 100 };
            return (
              <div key={sim.id} data-card="true">
                <SimCard sim={sim} index={i} x={pos.x} y={pos.y} onOpen={() => openCard(sim.id)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Hint — sits above the footer button, clearing the home indicator. */}
      <div
        className="pointer-events-none fixed left-1/2 z-20 max-w-[92vw] -translate-x-1/2 text-center text-[9px] uppercase tracking-[0.2em] text-white/20"
        style={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}
      >
        drag / swipe to explore · tap to enter
      </div>

      {/* Footer */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-center justify-end px-6 py-4"
        // Keeps the button clear of the home indicator on notched phones.
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={() => navigate("/research")}
          // min-h-[44px]: measured 42px, just under the touch minimum.
          className="pointer-events-auto flex min-h-[44px] items-center rounded-xl border border-[#ffc99d]/50 bg-[#ffc99d]/[0.06] px-5 py-2.5 text-[13px] tracking-[0.04em] text-[#ffc99d] transition-colors hover:bg-[#ffc99d]/10"
        >
          Read the Research →
        </button>
      </div>
    </div>
  );
}
