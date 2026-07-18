"use client";

import { useState } from "react";
import { useNavigate } from "../TransitionProvider";
import CornerIcons from "@/components/CornerIcons";
import AppHeader from "@/components/AppHeader";

export default function QuestionPage() {
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);

  // ui opacity: 1 = visible, 0 = faded out
  const [uiOpacity, setUiOpacity] = useState(1);
  // overlay opacity: 0.45 = default, 0 = fully transparent
  const [overlayOpacity, setOverlayOpacity] = useState(0.45);
  // video blur: 24 = blurred, 0 = clear
  const [videoBlur, setVideoBlur] = useState(24);

  function answer(value: "yes" | "no") {
    if (transitioning) return;
    try {
      localStorage.setItem("aura_question_overstimulated", value);
    } catch {}

    setTransitioning(true);

    // Phase 1 (0→1s): UI fades out
    setUiOpacity(0);

    // Phase 2 (1→4s): overlay fades out, blur lifts
    setTimeout(() => {
      setOverlayOpacity(0);
      setVideoBlur(0);
    }, 1000);

    // Phase 3 (4→7s): clean video — nothing to set, state holds

    // Phase 4 (7→9s): overlay and blur fade back in
    setTimeout(() => {
      setOverlayOpacity(0.45);
      setVideoBlur(24);
    }, 7000);

    // Phase 5 (9→10s): navigate to the simulation selection grid
    setTimeout(() => {
      navigate("/explore");
    }, 9000);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital@0;1&display=swap');

        /* Accent word inside any headline — italic AND peach, same serif.
           Reusable across the intro flow: wrap a word in <em>. The rest of the
           headline stays white, so this is the only coloured word. */
        .q-heading em {
          font-style: italic;
          font-family: inherit;
          color: #FFC99D;
        }

        /* Desktop keeps the blurred video + radial vignette; the flat mobile
           backdrop is off here. */
        .q-mobile-flat { display: none; }

        @media (max-width: 768px) {
          /* Hide the simulation serial on mobile */
          .q-serial { display: none !important; }
          /* Flat near-black backdrop; drop the grey radial wash. */
          .q-mobile-flat { display: block !important; }
          .q-radial { display: none !important; }
          /* Content fills full width; sits slightly above true centre. */
          .q-center {
            left: 0 !important;
            padding: 0 20px 40px !important;
            gap: 34px !important;
            justify-content: center !important;
          }
          .q-textwrap { width: 100% !important; max-width: 100% !important; gap: 26px !important; }

          /* Headline is the hero — large, serif, peach, wraps freely over 4-5 lines. */
          .q-heading {
            font-size: clamp(48px, 15vw, 68px) !important;
            line-height: 1.06 !important;
            max-width: 100% !important;
            text-wrap: balance;
            overflow-wrap: break-word;
            /* undo the old 2-line clamp */
            display: block !important;
            -webkit-line-clamp: none !important;
            overflow: visible !important;
          }
          .q-subtitle {
            font-size: 18px !important;
            line-height: 1.45 !important;
            max-width: 92% !important;
            overflow-wrap: break-word;
          }
          /* Full-width pill button with ~11% side margins, pushed 20px lower */
          .q-btnwrap { width: 100% !important; padding: 0 11% !important; margin-top: 20px !important; }
          .q-btnwrap button {
            width: 100% !important;
            padding: 20px 0 !important;
            border-radius: 999px !important;
            font-size: 17px !important;
            letter-spacing: 0.02em !important;
            opacity: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
          }
        }
      `}</style>

      <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#0d0a08" }}>

        {/* Background video */}
        <video
          src="https://res.cloudinary.com/duhsqezo3/video/upload/v1784382507/%D7%A1%D7%A8%D7%98%D7%95%D7%9F_%D7%A1%D7%95%D7%A4%D7%99_yxy2di.mp4"
          autoPlay loop muted playsInline
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
            transform: "scale(1.05)",
            filter: `blur(${videoBlur}px) brightness(${videoBlur === 0 ? 1 : 0.6})`,
            transition: "filter 1.5s ease-in-out",
          }}
        />

        {/* Black overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `rgba(0,0,0,${overlayOpacity})`,
          transition: "background 1.5s ease-in-out",
          pointerEvents: "none",
        }} />

        {/* Mobile: flat near-black behind the type (no grey wash). Lifts during
            the reveal phase so the video is still visible then. */}
        <div className="q-mobile-flat" style={{
          position: "absolute", inset: 0,
          background: "#0d0a08",
          opacity: overlayOpacity > 0.1 ? 1 : 0,
          transition: "opacity 1.5s ease-in-out",
          pointerEvents: "none",
        }} />

        {/* Radial gradient — fades with overlay */}
        <div className="q-radial" style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)",
          opacity: overlayOpacity > 0.1 ? 1 : 0,
          transition: "opacity 1.5s ease-in-out",
          pointerEvents: "none",
        }} />

        {/* ── ALL UI — fades out on transition ── */}
        <div style={{
          position: "absolute", inset: 0,
          opacity: uiOpacity,
          transition: "opacity 1s ease-in-out",
          pointerEvents: transitioning ? "none" : "auto",
        }}>

          {/* CORNER ICONS (eye top-left, bank bottom-left) */}
          <CornerIcons />

          {/* TOP HEADER */}
          <AppHeader step="STEP 02 / BEFORE WE BEGIN" />

          {/* BOTTOM RIGHT SERIAL */}
          <div className="q-serial" style={{
            position: "fixed", bottom: 20, right: 28,
            fontSize: 12, letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.3)", zIndex: 10,
          }}>
            Simulation NO. 792734-04
          </div>

          {/* CENTER CONTENT */}
          <div className="q-center" style={{
            position: "absolute", top: 0, bottom: 0, left: 80, right: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 56, zIndex: 5,
            padding: "0 60px",
          }}>
            <div className="q-textwrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <h1 className="q-heading" style={{
                fontFamily: "'Amiri', serif",
                fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                // White/off-white base; the <em> accent word carries the peach.
                color: "#F5EFE8",
                textAlign: "center",
                lineHeight: 1.3,
                fontWeight: 400,
                margin: 0,
                maxWidth: 820,
              }}>
                What if the world around you felt <em>different</em> than it does?
              </h1>

              <p className="q-subtitle" style={{
                fontFamily: "var(--font-assistant), 'assistant', sans-serif",
                fontStyle: "normal",
                fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                fontWeight: 400,
                margin: 0,
                maxWidth: 820,
              }}>
                Are you ready to explore that possibility?
              </p>
            </div>

            <div className="q-btnwrap" style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => answer("yes")}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "0 0 16px rgba(255,201,157,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.boxShadow = "none"; }}
                style={{
                  background: "#FFC99D",
                  color: "#1c0e00",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 64px",
                  fontSize: 15, letterSpacing: "0.08em",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: 0.8,
                  transition: "all 0.2s ease",
                }}
              >
                Next <span aria-hidden style={{ fontSize: "1.15em", lineHeight: 1 }}>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
