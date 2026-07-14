"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Simulation } from "@/lib/supabase";
import { deriveMetrics, parseThoughts } from "@/lib/metrics";
import { useNavigate } from "@/app/TransitionProvider";

// Panel open height as a fraction of viewport (mobile). Collapsed = strip only.
const OPEN_FRACTION = 0.45;
const COLLAPSED_PX = 48;

// Pulsing eye loading screen — a brief visual transition before the sim reveals.
function LoadingScreen({ visible }: { visible: boolean }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0807]"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <img
        src="/icons/New_logo_eye.svg"
        alt=""
        className="aura-eye-pulse"
        style={{ width: "clamp(60px, 12vw, 80px)", opacity: 0.9 }}
      />
      <style>{`
        @keyframes aura-eye-pulse-kf { 0%,100%{opacity:0.55;transform:scale(0.94)} 50%{opacity:1;transform:scale(1.06)} }
        .aura-eye-pulse { animation: aura-eye-pulse-kf 1.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// Reflection screen shown after the viewer stops the simulation.
function ReflectionScreen({
  onBank,
  onNew,
}: {
  onBank: () => void;
  onNew: () => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-10 bg-[#0a0807] px-6"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.9s ease" }}
    >
      <img
        src="/icons/New_logo_eye.svg"
        alt=""
        className="aura-eye-pulse"
        style={{ width: 64, opacity: 0.85 }}
      />
      <h1 className="text-center font-serif text-3xl font-normal text-white/90 sm:text-4xl">
        How did that feel?
      </h1>
      <div className="flex w-full max-w-[300px] flex-col gap-3">
        <button
          type="button"
          onClick={onBank}
          className="h-[50px] w-full rounded-lg border border-[#ffc99d]/50 bg-[#ffc99d]/[0.06] text-sm uppercase tracking-[0.14em] text-[#ffc99d] transition-colors hover:bg-[#ffc99d]/10"
        >
          Simulation Bank
        </button>
        <button
          type="button"
          onClick={onNew}
          className="h-[50px] w-full rounded-lg border border-white/20 bg-white/[0.04] text-sm uppercase tracking-[0.14em] text-white/80 transition-colors hover:bg-white/[0.08]"
        >
          New Simulation
        </button>
      </div>
      <style>{`
        @keyframes aura-eye-pulse-kf { 0%,100%{opacity:0.55;transform:scale(0.94)} 50%{opacity:1;transform:scale(1.06)} }
        .aura-eye-pulse { animation: aura-eye-pulse-kf 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function MetricBars({
  metrics,
}: {
  metrics: ReturnType<typeof deriveMetrics>;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="min-w-0">
          <div className="truncate text-[9px] font-medium uppercase tracking-[0.18em] text-white/60">
            {m.label}
          </div>
          <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-white/12">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${m.value}%`, background: m.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${open ? "" : "rotate-180"}`}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function VideoStage({
  sim,
  showChevron,
  onChevron,
  chevronOpen,
}: {
  sim: Simulation;
  showChevron: boolean;
  onChevron?: () => void;
  chevronOpen: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {sim.video_url && !failed ? (
        <video
          src={sim.video_url}
          autoPlay
          loop
          playsInline
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        // Fallback: cinematic gradient stands in when the video can't load.
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 40%, rgba(255,201,157,0.16) 0%, rgba(188,194,255,0.10) 45%, #050403 85%)",
          }}
        />
      )}

      {/* Heavy vignette on all edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 110% at 50% 50%, rgba(5,4,3,0) 42%, rgba(5,4,3,0.55) 72%, rgba(5,4,3,0.95) 100%)",
        }}
      />
      {/* Extra top/bottom darkening for the cinematic band feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background: "linear-gradient(to bottom, rgba(5,4,3,0.7), rgba(5,4,3,0))",
        }}
      />

      {failed && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 text-center">
          <p className="font-serif text-sm italic text-white/45">
            Video unavailable
          </p>
        </div>
      )}

      {showChevron && (
        <button
          type="button"
          onClick={onChevron}
          aria-label={chevronOpen ? "Collapse panel" : "Expand panel"}
          className="aura-bob absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full p-2 text-[#ffc99d]/80 transition-colors hover:text-[#ffc99d]"
        >
          <Chevron open={chevronOpen} />
        </button>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#ffc99d]/70">
        {label}
      </h3>
      {children}
    </div>
  );
}

function PanelContent({ sim }: { sim: Simulation }) {
  const thoughts = parseThoughts(sim.internal_thoughts);

  return (
    <div className="px-6 pb-40 pt-2">
      {thoughts.length > 0 && (
        <Section label="Thoughts">
          <ul className="space-y-3">
            {thoughts.map((t, i) => (
              <li key={i} className="text-[15px] leading-relaxed text-white/85">
                <span className="italic">“{t.text}”</span>
                {t.tag && (
                  <span className="ml-2 inline-block rounded-full border border-[#bcc2ff]/30 px-2 py-0.5 align-middle text-[10px] not-italic uppercase tracking-wider text-[#bcc2ff]/80">
                    {t.tag}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {sim.emotional_landscape?.trim() && (
        <Section label="Emotional landscape">
          <p className="text-sm leading-relaxed text-white/75">
            {sim.emotional_landscape}
          </p>
        </Section>
      )}

      {sim.soundscape?.trim() && (
        <Section label="Soundscape">
          <p className="text-sm leading-relaxed text-white/75">
            {sim.soundscape}
          </p>
        </Section>
      )}

      {sim.objective?.trim() && (
        <Section label="Objective">
          <p className="text-sm leading-relaxed text-white/75">
            {sim.objective}
          </p>
        </Section>
      )}
    </div>
  );
}

function StopButton({ onStop }: { onStop: () => void }) {
  return (
    <button
      type="button"
      onClick={onStop}
      className="aura-cta flex w-full items-center justify-center px-6 py-3.5 text-sm uppercase"
    >
      Stop simulation
    </button>
  );
}

export default function SimulationViewer({ sim }: { sim: Simulation }) {
  const metrics = deriveMetrics(sim.sensory_load);
  const navigate = useNavigate();

  // Brief pulsing-eye loading transition before the simulation reveals.
  const [loadingScreen, setLoadingScreen] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoadingScreen(false), 1400);
    return () => clearTimeout(t);
  }, []);

  // Reflection screen shown after Stop simulation.
  const [reflecting, setReflecting] = useState(false);
  const stopSimulation = useCallback(() => setReflecting(true), []);

  // ---- Mobile bottom-sheet state ----
  const [open, setOpen] = useState(true);
  // Drag offset in px added on top of the base open height (negative = taller).
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportH, setViewportH] = useState(0);
  const dragState = useRef<{ startY: number; startOffset: number } | null>(null);

  useEffect(() => {
    const update = () => setViewportH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const baseOpenH = viewportH ? viewportH * OPEN_FRACTION : 0;
  const maxH = viewportH ? viewportH * 0.9 : 0;

  // Effective panel height when open, factoring the current drag.
  const openHeight = viewportH
    ? Math.max(baseOpenH, Math.min(maxH, baseOpenH - dragOffset))
    : baseOpenH;
  const panelHeight = open ? openHeight : COLLAPSED_PX;

  const onDragStart = useCallback(
    (clientY: number) => {
      if (!open) return;
      dragState.current = { startY: clientY, startOffset: dragOffset };
      setIsDragging(true);
    },
    [open, dragOffset]
  );

  const onDragMove = useCallback((clientY: number) => {
    if (!dragState.current) return;
    const delta = clientY - dragState.current.startY;
    // Drag up (delta < 0) => taller panel => more negative offset.
    setDragOffset(dragState.current.startOffset + delta);
  }, []);

  const onDragEnd = useCallback(() => {
    dragState.current = null;
    setIsDragging(false);
    // If dragged down far, collapse.
    setDragOffset((prev) => {
      if (prev > baseOpenH * 0.4) {
        setOpen(false);
        return 0;
      }
      // Clamp within [maxH taller ... base]
      const minOffset = -(maxH - baseOpenH);
      return Math.max(minOffset, Math.min(0, prev));
    });
  }, [baseOpenH, maxH]);

  if (reflecting) {
    return (
      <ReflectionScreen
        onBank={() => navigate("/explore")}
        onNew={() => navigate("/question")}
      />
    );
  }

  return (
    <>
      <LoadingScreen visible={loadingScreen} />

      {/* ================= MOBILE / PORTRAIT (default) ================= */}
      <div className="fixed inset-0 flex flex-col lg:hidden">
        {/* TOP BAR */}
        <div className="relative z-20 flex-none bg-[#0a0807]/95 px-5 pb-2.5 pt-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <Link
              href="/explore"
              className="text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-[#ffc99d]"
            >
              ← exit
            </Link>
            <img src="/icons/New_logo_eye.svg" alt="aura" className="w-6 opacity-70" />
          </div>
          <MetricBars metrics={metrics} />
        </div>

        {/* VIDEO fills remaining space above the panel */}
        <div className="relative min-h-0 flex-1">
          <VideoStage
            sim={sim}
            showChevron={open}
            chevronOpen={open}
            onChevron={() => {
              setOpen(false);
              setDragOffset(0);
            }}
          />
        </div>

        {/* BOTTOM SHEET */}
        <div
          className="absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t border-white/10 bg-[#0d0a09] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.9)]"
          style={{
            height: panelHeight ? `${panelHeight}px` : undefined,
            transition: isDragging ? "none" : "height 300ms ease",
          }}
        >
          {/* Drag handle / collapsed strip toggle */}
          <button
            type="button"
            onClick={() => {
              if (!open) {
                setOpen(true);
                setDragOffset(0);
              }
            }}
            onPointerDown={(e) => {
              if (open) {
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                onDragStart(e.clientY);
              }
            }}
            onPointerMove={(e) => onDragMove(e.clientY)}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            aria-label={open ? "Drag to resize, or tap chevron to close" : "Open panel"}
            className="flex flex-none touch-none flex-col items-center justify-center gap-1 py-2.5"
            style={{ cursor: open ? "grab" : "pointer", height: `${COLLAPSED_PX}px` }}
          >
            <span className="h-1 w-10 rounded-full bg-white/25" />
            {!open && <span className="text-[#ffc99d]/70"><Chevron open={false} /></span>}
          </button>

          {/* Scrollable content (only when open) */}
          {open && (
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <PanelContent sim={sim} />
            </div>
          )}

          {/* STOP button fixed at very bottom of the sheet */}
          {open && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d0a09] via-[#0d0a09]/95 to-transparent px-5 pb-5 pt-8">
              <div className="pointer-events-auto">
                <StopButton onStop={stopSimulation} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= DESKTOP (side panels + center video) ================= */}
      <div className="fixed inset-0 hidden grid-cols-[minmax(280px,1fr)_minmax(0,2.2fr)_minmax(280px,1fr)] lg:grid">
        {/* LEFT panel: metrics + thoughts */}
        <aside className="flex min-h-0 flex-col border-r border-white/10 bg-[#0d0a09]">
          <div className="flex-none px-6 pb-5 pt-6">
            <Link
              href="/explore"
              className="mb-5 inline-block text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-[#ffc99d]"
            >
              ← exit
            </Link>
            <MetricBars metrics={metrics} />
          </div>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
            <PanelContent sim={sim} />
          </div>
        </aside>

        {/* CENTER: video */}
        <div className="relative min-h-0">
          <VideoStage sim={sim} showChevron={false} chevronOpen />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center px-10 pb-8">
            <div className="w-full max-w-xs">
              <StopButton onStop={stopSimulation} />
            </div>
          </div>
        </div>

        {/* RIGHT panel: situation framing */}
        <aside className="flex min-h-0 flex-col border-l border-white/10 bg-[#0d0a09]">
          <div className="px-6 pt-6">
            <img src="/icons/New_logo_eye.svg" alt="aura" className="w-7 opacity-70" />
          </div>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-6">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#ffc99d]/70">
              Situation
            </h3>
            <p className="font-serif text-xl leading-snug text-white">
              {sim.situation || "Untitled situation"}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
