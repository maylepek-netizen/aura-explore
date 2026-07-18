"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Simulation } from "@/lib/supabase";
import { deriveMetrics, parseThoughts, sensoryIntensity } from "@/lib/metrics";
import { useNavigate } from "@/app/TransitionProvider";

// ─── Synthesized heartbeat (Web Audio) — realistic lub-dub ────────────────────
// One cycle = "lub" (60Hz, 0.08s) → 0.05s pause → "dub" (55Hz, 0.06s) → silence
// until the next cycle. Cycle rate scales with sensory load:
// intensity 0 → 60 BPM, intensity 100 → 100 BPM (linear).
class HeartbeatEngine {
  private ctx: AudioContext;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  constructor() {
    this.ctx = new AudioContext();
  }

  private bpmForIntensity(intensity: number) {
    const clamped = Math.max(0, Math.min(100, intensity));
    return 60 + (clamped / 100) * 40; // 60 → 100 BPM
  }

  // A single low sine tone: `freq` Hz held for `dur` seconds, with tiny
  // attack/release so it thumps rather than clicks.
  private tone(when: number, freq: number, dur: number, gain: number) {
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 90;
    filter.Q.value = 6;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, when);
    gainNode.gain.setValueAtTime(0, when);
    gainNode.gain.linearRampToValueAtTime(gain, when + 0.012);
    gainNode.gain.setValueAtTime(gain, when + dur - 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  private loop(intensity: number) {
    if (!this.running) return;
    const now = this.ctx.currentTime;
    // "lub": 60Hz for 0.08s
    this.tone(now, 60, 0.08, 0.9);
    // pause 0.05s, then "dub": 55Hz for 0.06s
    this.tone(now + 0.08 + 0.05, 55, 0.06, 0.6);
    const interval = (60 / this.bpmForIntensity(intensity)) * 1000;
    this.timeout = setTimeout(() => this.loop(intensity), interval);
  }

  start(intensity: number) {
    if (this.running) return;
    this.running = true;
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.loop(intensity);
  }

  stop() {
    this.running = false;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = null;
    try { void this.ctx.suspend(); } catch {}
  }

  destroy() {
    this.stop();
    try { void this.ctx.close(); } catch {}
  }
}

// ─── Loading screen — plain black, no icon, no animation ──────────────────────
function LoadingScreen({ visible }: { visible: boolean }) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-black"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    />
  );
}

// ─── Reflection screen ────────────────────────────────────────────────────────
// Text + styling copied from the main AURA summary page. Buttons rerouted for
// aura-explore: Simulation Bank → /bank, New Simulation → /question.
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital@0;1&display=swap');

        /* Accent word inside the headline — italic peach, same serif. */
        .rf-headline em { font-style: italic; font-family: inherit; color: #FFC99D; }

        .rf-logo { display: none; }

        @media (max-width: 768px) {
          /* Flat near-black: drop the blurred video wash and radial glow so the
             contrast is white-on-black with a single peach accent. */
          .rf-video, .rf-radial { display: none !important; }
          .rf-flat { display: block !important; }
          .rf-logo { display: block !important; }

          /* Stack sits slightly above centre, tight and continuous. */
          .rf-content {
            justify-content: center !important;
            padding: 96px 20px 40px !important;
          }

          /* Eyebrow — peach, above the headline with a small gap. */
          .rf-eyebrow {
            font-size: 21px !important;
            opacity: 0.85 !important;
            margin: 0 0 14px !important;
            line-height: 1.3 !important;
          }

          /* Hero headline — white, serif, wraps freely over 4-5 lines. */
          .rf-headline {
            font-size: clamp(40px, 11vw, 56px) !important;
            line-height: 1.08 !important;
            margin: 0 0 26px !important;
            max-width: 100% !important;
            text-wrap: balance;
            overflow-wrap: break-word;
          }
          .rf-headline br { display: none; }

          .rf-subq { margin: 0 0 26px !important; font-size: 12px !important; }

          /* Buttons match the intro screens' Next button width/margins. */
          .rf-buttons {
            width: 100% !important;
            flex-direction: column !important;
            gap: 16px !important;
            padding: 0 11% !important;
          }
          .rf-buttons button {
            width: 100% !important;
            padding: 19px 0 !important;
            border-radius: 999px !important;
            font-size: 16px !important;
            opacity: 1 !important;
            white-space: nowrap;
          }
        }
      `}</style>

      <div
        style={{
          position: "fixed", inset: 0, overflow: "hidden", background: "#000",
          zIndex: 80,
          opacity: visible ? 1 : 0, transition: "opacity 1.5s ease-in-out",
        }}
      >
        {/* Mobile: eye logo top-left, matching the intro screens */}
        <img
          className="rf-logo"
          src="/icons/New_logo_eye.svg"
          alt=""
          style={{ position: "absolute", top: 22, left: 22, width: 30, opacity: 0.85, zIndex: 5 }}
        />

        {/* Background video */}
        <video
          className="rf-video"
          src="https://res.cloudinary.com/duhsqezo3/video/upload/v1781856804/%D7%90%D7%A0%D7%99_%D7%A8%D7%95%D7%A6%D7%94_%D7%A9%D7%96%D7%94_%D7%99%D7%94%D7%99%D7%94_%D7%AA%D7%A7%D7%A8%D7%99%D7%91%D7%99%D7%9D_%D7%A9%D7%9C_%D7%94_1_nlathf.mp4"
          autoPlay loop muted playsInline
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
            filter: "blur(24px) brightness(0.35)",
            transform: "scale(1.05)",
          }}
        />

        {/* Black overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />

        {/* Radial gradient */}
        <div className="rf-radial" style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
          pointerEvents: "none",
        }} />

        {/* Mobile: flat near-black backdrop */}
        <div className="rf-flat" style={{ position: "absolute", inset: 0, background: "#0a0807", display: "none" }} />

        {/* Centered content */}
        <div className="rf-content" style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px",
          gap: 0,
        }}>
          <h1 className="rf-eyebrow" style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1.2rem, 4vw, 3.2rem)",
            color: "#FFC99D",
            opacity: 0.6,
            margin: "0 0 8px",
            textAlign: "center",
            fontWeight: 400,
            lineHeight: 1.2,
          }}>
            Every perception tells a different story.
          </h1>

          <p className="rf-headline" style={{
            fontFamily: "'Amiri', serif",
            fontSize: "clamp(1.92rem, 3.84vw, 3.12rem)",
            color: "white",
            textAlign: "center",
            lineHeight: 1.35,
            fontWeight: 400,
            margin: "0 0 56px",
            maxWidth: 820,
          }}>
            What you experienced was only one possible interpretation of the world.
          </p>

          <p className="rf-subq" style={{
            fontSize: "clamp(0.75rem, 1.2vw, 0.95rem)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            margin: "0 0 64px",
            fontWeight: 400,
          }}>
            Would you like to explore another perspective?
          </p>

          <div className="rf-buttons" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              onClick={onBank}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "0 0 16px rgba(255,201,157,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.boxShadow = "none"; }}
              style={{
                background: "#FFC99D",
                color: "#1a0f00",
                border: "none",
                borderRadius: 12,
                padding: "16px 52px",
                fontSize: 14,
                letterSpacing: "0.06em",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                opacity: 0.8,
                transition: "all 0.2s ease",
              }}
            >
              Simulation Bank
            </button>

            <button
              type="button"
              className="aura-btn"
              onClick={onNew}
              style={{
                background: "transparent",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.5)",
                borderRadius: 50,
                padding: "16px 52px",
                fontSize: 14,
                letterSpacing: "0.06em",
                fontWeight: 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              New Simulation
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Small shared pieces ──────────────────────────────────────────────────────

function MetricBars({ metrics }: { metrics: ReturnType<typeof deriveMetrics> }) {
  return (
    // gap-2 on the narrowest phones buys back horizontal room for the labels.
    <div className="grid grid-cols-3 gap-2 min-[360px]:gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="min-w-0">
          {/* "OVERSTIMULATION" was truncated at 320px: 0.18em tracking on a
              third of a 320px viewport leaves ~85px for ~97px of text. Fluid
              size + tighter tracking on small screens lets it render in full.
              No truncate — the label wraps instead of being cut. */}
          <div
            className="font-medium uppercase leading-tight text-white/60"
            style={{
              fontSize: "clamp(7.5px, 2.4vw, 9px)",
              letterSpacing: "clamp(0.04em, 0.9vw, 0.18em)",
              overflowWrap: "anywhere",
            }}
          >
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

// Section heading + body, in Assistant sans-serif (the body font).
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

// All the data sections aura-explore has, rendered in sans-serif.
function DataSections({ sim }: { sim: Simulation }) {
  const thoughts = parseThoughts(sim.internal_thoughts);
  return (
    <>
      {thoughts.length > 0 && (
        <Section label="Internal thoughts">
          <ul className="space-y-3">
            {thoughts.map((t, i) => (
              <li key={i} className="text-[15px] leading-relaxed text-white/85" style={{ fontFamily: "var(--font-body)" }}>
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
          <p className="text-sm leading-relaxed text-white/75">{sim.emotional_landscape}</p>
        </Section>
      )}

      {sim.soundscape?.trim() && (
        <Section label="Soundscape">
          <p className="text-sm leading-relaxed text-white/75">{sim.soundscape}</p>
        </Section>
      )}

      {sim.objective?.trim() && (
        <Section label="Objective">
          <p className="text-sm leading-relaxed text-white/75">{sim.objective}</p>
        </Section>
      )}
    </>
  );
}

function StopButton({ onStop }: { onStop: () => void }) {
  return (
    // This button's container collapses to ~88px in the narrow desktop
    // sidebar. With 24px padding per side only 40px was left for a ~90px
    // label, clipping it. Padding and tracking now scale with the container,
    // and the label may wrap to a second line rather than being cut off.
    // (Measured at 768px: clientW 88 vs scrollW 90 before this change.)
    <button
      type="button"
      onClick={onStop}
      className="aura-cta flex w-full items-center justify-center py-3.5 text-center uppercase"
      style={{
        paddingInline: "clamp(8px, 3vw, 24px)",
        fontSize: "clamp(11px, 2.6vw, 14px)",
        letterSpacing: "clamp(0.02em, 0.4vw, 0.12em)",
        overflowWrap: "anywhere",
      }}
    >
      Stop simulation
    </button>
  );
}

function VideoStage({ sim, onReady }: { sim: Simulation; onReady?: () => void }) {
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // No video to wait for — reveal immediately rather than holding on black.
  useEffect(() => {
    if (!sim.video_url || failed) onReady?.();
  }, [sim.video_url, failed, onReady]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {sim.video_url && !failed ? (
        <video
          ref={videoRef}
          src={sim.video_url}
          autoPlay
          loop
          playsInline
          // `muted` is REQUIRED for autoplay: iOS Safari and Chrome Android
          // refuse to autoplay video with audio, leaving only the first frame
          // painted — which reads as a static image. The simulation's own
          // soundscape is played separately, so muting the video track costs
          // us nothing here.
          muted
          onCanPlay={() => { onReady?.(); void videoRef.current?.play().catch(() => {}); }}
          onError={() => { setFailed(true); onReady?.(); }}
          // object-cover + centre: fills the frame on a portrait phone by
          // cropping the sides, never letterboxing or stretching.
          className="h-full w-full object-cover"
          style={{ objectPosition: "center" }}
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 40%, rgba(255,201,157,0.16) 0%, rgba(188,194,255,0.10) 45%, #050403 85%)",
          }}
        />
      )}

      {/* Cinematic vignette (all edges) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 110% at 50% 50%, rgba(5,4,3,0) 42%, rgba(5,4,3,0.55) 72%, rgba(5,4,3,0.95) 100%)",
        }}
      />

      {failed && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 text-center">
          <p className="font-serif text-sm italic text-white/45">Video unavailable</p>
        </div>
      )}
    </div>
  );
}

// ─── Main viewer ──────────────────────────────────────────────────────────────

export default function SimulationViewer({ sim }: { sim: Simulation }) {
  const metrics = deriveMetrics(sim.sensory_load);
  const navigate = useNavigate();

  // Plain black cover carried over from the selection dissolve. It lifts as
  // soon as the video can play (see onCanPlay in VideoStage), with a short
  // fallback so a stalled/absent video never leaves the screen black forever.
  // No eye loader on this path.
  const [loadingScreen, setLoadingScreen] = useState(true);
  const revealSimulation = useCallback(() => setLoadingScreen(false), []);
  useEffect(() => {
    const t = setTimeout(() => setLoadingScreen(false), 2500);
    return () => clearTimeout(t);
  }, []);

  // Synthesized heartbeat — starts once the sim reveals, rate scales with load.
  const heartbeatRef = useRef<HeartbeatEngine | null>(null);
  useEffect(() => {
    if (loadingScreen) return;
    const engine = new HeartbeatEngine();
    heartbeatRef.current = engine;
    engine.start(sensoryIntensity(sim.sensory_load));
    return () => { engine.destroy(); heartbeatRef.current = null; };
  }, [loadingScreen, sim.sensory_load]);

  // Reflection screen shown after Stop simulation.
  const [reflecting, setReflecting] = useState(false);
  const stopSimulation = useCallback(() => {
    heartbeatRef.current?.stop();
    setReflecting(true);
  }, []);

  // ── Mobile bottom-sheet: draggable, collapsible ──
  // Height as a fraction of viewport. Default ~0.38 (35-40%); drag up to expand
  // toward EXPANDED, drag down to collapse to a minimum strip.
  const SHEET_MIN = 0.12;      // collapsed strip
  const SHEET_DEFAULT = 0.38;  // default portion of screen
  const SHEET_MAX = 0.85;      // fully expanded
  const [sheetFraction, setSheetFraction] = useState(SHEET_DEFAULT);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ y: number; frac: number } | null>(null);

  const onSheetPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStart.current = { y: e.clientY, frac: sheetFraction };
    setDragging(true);
  };
  const onSheetPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const vh = window.innerHeight || 1;
    // Drag up (clientY decreases) → taller sheet.
    const delta = (dragStart.current.y - e.clientY) / vh;
    const next = Math.max(SHEET_MIN, Math.min(SHEET_MAX, dragStart.current.frac + delta));
    setSheetFraction(next);
  };
  const onSheetPointerUp = () => {
    dragStart.current = null;
    setDragging(false);
    // Snap to the nearest of min / default / max for a tidy resting position.
    setSheetFraction((f) => {
      const stops = [SHEET_MIN, SHEET_DEFAULT, SHEET_MAX];
      return stops.reduce((best, s) => (Math.abs(s - f) < Math.abs(best - f) ? s : best), stops[0]);
    });
  };

  if (reflecting) {
    return (
      <ReflectionScreen
        onBank={() => navigate("/bank")}
        onNew={() => navigate("/explore")}
      />
    );
  }

  return (
    <>
      <LoadingScreen visible={loadingScreen} />

      {/* ================= MOBILE / PORTRAIT (max-width 768px) ================= */}
      {/* Video fixed at top (~63vh, not covered by text) + a draggable, collapsible
          bottom sheet holding all data (scrollable, Assistant sans-serif). No
          full-screen overlay covering the video. */}
      <div className="fixed inset-0 bg-[#0a0807] md:hidden">
        {/* METRICS — fixed top bar (ANXIETY / SOUND / OVERSTIMULATION) */}
        <div
          className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-black/70 px-4 pb-2.5 pt-3 backdrop-blur min-[360px]:px-5"
          // Clear the notch — this bar is flush to the top of the screen.
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <div className="mb-2 flex items-center justify-between">
            {/* Exit is the primary way out of a running simulation and measured
                just 15px tall. -m-2.5 p-2.5 grows the hit area to 44px without
                shifting the label. */}
            <Link
              href="/explore"
              className="-m-2.5 flex min-h-[44px] items-center p-2.5 text-[10px] uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-[#ffc99d]"
            >
              ← exit
            </Link>
            <img src="/icons/New_logo_eye.svg" alt="aura" className="w-6 opacity-80" />
          </div>
          <MetricBars metrics={metrics} />
        </div>

        {/* VIDEO — fills every pixel between the top of the screen and the
            sheet, so there is never an empty black band. VideoStage uses
            object-fit: cover, cropping the sides on a portrait phone rather
            than letterboxing. Tracks the sheet as it is dragged. */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: `calc(100dvh - ${sheetFraction * 100}dvh)`,
            transition: dragging ? "none" : "height 260ms ease",
          }}
        >
          <VideoStage sim={sim} onReady={revealSimulation} />
        </div>

        {/* BOTTOM SHEET — draggable up/down, content scrollable */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-2xl border-t border-white/10"
          style={{
            height: `${sheetFraction * 100}dvh`,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            transition: dragging ? "none" : "height 260ms ease",
            fontFamily: "var(--font-body)",
          }}
        >
          {/* Drag handle */}
          <div
            onPointerDown={onSheetPointerDown}
            onPointerMove={onSheetPointerMove}
            onPointerUp={onSheetPointerUp}
            onPointerCancel={onSheetPointerUp}
            className="flex flex-none touch-none cursor-grab flex-col items-center justify-center gap-1 py-3 active:cursor-grabbing"
          >
            <span className="h-1 w-10 rounded-full bg-white/30" />
          </div>

          {/* Scrollable content */}
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-28" style={{ fontFamily: "var(--font-body)" }}>
            {/* Situation — sans-serif */}
            <h2 className="mb-5 text-xl font-semibold leading-snug text-white" style={{ fontFamily: "var(--font-body)" }}>
              {sim.situation || "Untitled situation"}
            </h2>

            {/* All data sections in sans-serif */}
            <DataSections sim={sim} />
          </div>

          {/* Stop button pinned to bottom of the sheet */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent px-6 pb-5 pt-8">
            <div className="pointer-events-auto">
              <StopButton onStop={stopSimulation} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP (side panels + center video) ================= */}
      <div className="fixed inset-0 hidden grid-cols-[minmax(300px,1fr)_minmax(0,2.2fr)_minmax(300px,1fr)] md:grid">
        {/* LEFT panel: metrics + all data */}
        <aside className="flex min-h-0 flex-col border-r border-white/10 bg-[#0d0a09]">
          <div className="flex-none px-6 pb-5 pt-6">
            <div className="mb-5 flex items-center justify-between">
              <Link
                href="/explore"
                className="-m-2.5 inline-flex min-h-[44px] items-center p-2.5 text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-[#ffc99d]"
              >
                ← exit
              </Link>
              <img src="/icons/New_logo_eye.svg" alt="aura" className="w-7 opacity-80" />
            </div>
            <MetricBars metrics={metrics} />
          </div>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-2">
            <DataSections sim={sim} />
          </div>
        </aside>

        {/* CENTER: video + stop */}
        <div className="relative min-h-0">
          <VideoStage sim={sim} onReady={revealSimulation} />
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
