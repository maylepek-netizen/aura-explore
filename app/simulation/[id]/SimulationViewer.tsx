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

// ─── Pulsing eye loading screen ───────────────────────────────────────────────
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
      `}</style>

      <div
        style={{
          position: "fixed", inset: 0, overflow: "hidden", background: "#000",
          zIndex: 80,
          opacity: visible ? 1 : 0, transition: "opacity 1.5s ease-in-out",
        }}
      >
        {/* Background video */}
        <video
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
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
          pointerEvents: "none",
        }} />

        {/* Centered content */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px",
          gap: 0,
        }}>
          <h1 style={{
            fontFamily: "'Amiri', serif",
            fontStyle: "italic",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: "#FFC99D",
            margin: "0 0 8px",
            textAlign: "center",
            fontWeight: 400,
            lineHeight: 1.2,
          }}>
            Every perception tells a different story.
          </h1>

          <p style={{
            fontFamily: "'Amiri', serif",
            fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)",
            color: "white",
            textAlign: "center",
            lineHeight: 1.35,
            fontWeight: 400,
            margin: "0 0 56px",
            maxWidth: 820,
          }}>
            What you experienced was only one possible interpretation of the world.
          </p>

          <p style={{
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

          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
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
    <button
      type="button"
      onClick={onStop}
      className="aura-cta flex w-full items-center justify-center px-6 py-3.5 text-sm uppercase"
    >
      Stop simulation
    </button>
  );
}

function VideoStage({ sim }: { sim: Simulation }) {
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

  // Brief pulsing-eye loading transition before the simulation reveals.
  const [loadingScreen, setLoadingScreen] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoadingScreen(false), 800);
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

  if (reflecting) {
    return (
      <ReflectionScreen
        onBank={() => navigate("/bank")}
        onNew={() => navigate("/question")}
      />
    );
  }

  return (
    <>
      <LoadingScreen visible={loadingScreen} />

      {/* ================= MOBILE / PORTRAIT (max-width 768px) ================= */}
      {/* Left panel only, over a black overlay: eye logo → situation → all data,
          scrollable, Assistant sans-serif. The video sits behind, dimmed. */}
      <div className="fixed inset-0 md:hidden">
        {/* Background video, dimmed behind the overlay */}
        <div className="absolute inset-0">
          <VideoStage sim={sim} />
        </div>
        {/* Black opacity overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Scrollable single panel */}
        <div className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain">
          <div className="min-h-full px-6 pb-32 pt-6">
            {/* Top row: exit + eye logo */}
            <div className="mb-5 flex items-center justify-between">
              <Link
                href="/explore"
                className="text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-[#ffc99d]"
              >
                ← exit
              </Link>
              <img src="/icons/New_logo_eye.svg" alt="aura" className="w-7 opacity-80" />
            </div>

            {/* Metrics */}
            <div className="mb-6">
              <MetricBars metrics={metrics} />
            </div>

            {/* Situation */}
            <h2 className="mb-6 font-serif text-2xl leading-snug text-white">
              {sim.situation || "Untitled situation"}
            </h2>

            {/* All data sections in sans-serif */}
            <DataSections sim={sim} />
          </div>
        </div>

        {/* Stop button pinned to bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0807] via-[#0a0807]/95 to-transparent px-6 pb-6 pt-10">
          <div className="pointer-events-auto">
            <StopButton onStop={stopSimulation} />
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
                className="inline-block text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-[#ffc99d]"
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
          <VideoStage sim={sim} />
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
