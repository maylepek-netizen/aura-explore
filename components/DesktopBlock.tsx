"use client";

import { useEffect, useState } from "react";

// AURA is a mobile-first experience. On wider viewports we show this block
// instead of the app, with the page URL so the visitor can open it on a phone.
//
// Client-side only: `mounted` stays false during SSR and the first paint, so the
// server never renders a tree that mismatches the client.

const BREAKPOINT = 768;

export default function DesktopBlock({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUrl(window.location.href);

    const update = () => setIsDesktop(window.innerWidth > BREAKPOINT);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Before mount, render the app as-is so SSR output matches the first paint.
  if (!mounted || !isDesktop) return <>{children}</>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the URL is shown in full below regardless */
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0a0807",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <img src="/icons/New_logo_eye.svg" alt="" style={{ width: 60, opacity: 0.9 }} />

      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(38px, 5vw, 56px)",
          letterSpacing: "0.18em",
          color: "#FFC99D",
          fontWeight: 400,
          margin: 0,
          lineHeight: 1,
        }}
      >
        AURA
      </h1>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 17,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.75)",
          margin: 0,
          maxWidth: 420,
        }}
      >
        This experience is designed for mobile only.
      </p>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.45)",
          margin: 0,
          maxWidth: 460,
        }}
      >
        Please open this link on your phone.
      </p>

      {/* The URL, large enough to read across a room and copyable in one click */}
      <div
        style={{
          border: "1px solid rgba(255,201,157,0.3)",
          borderRadius: 12,
          padding: "16px 22px",
          maxWidth: 520,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            letterSpacing: "0.02em",
            color: "#FFC99D",
            wordBreak: "break-all",
            lineHeight: 1.5,
          }}
        >
          {url}
        </span>

        <button
          type="button"
          onClick={copy}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 16px rgba(255,201,157,0.45)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          style={{
            background: "#FFC99D",
            color: "#0a0807",
            border: "none",
            borderRadius: 999,
            padding: "10px 26px",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            cursor: "pointer",
            transition: "box-shadow 0.2s ease",
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
