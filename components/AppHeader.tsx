"use client";

import { useNavigate } from "@/app/TransitionProvider";

// Ported from the main AURA app. The right-side "Exit" link navigates back to
// the simulation library (/explore) via the transition provider.
interface AppHeaderProps {
  step: string;
  showBank?: boolean;
  onBankClick?: () => void;
  position?: "fixed" | "absolute";
}

export default function AppHeader({
  step,
  showBank = false,
  onBankClick,
  position = "fixed",
}: AppHeaderProps) {
  const navigate = useNavigate();
  return (
    <div
      className="aura-header"
      style={{
        position,
        top: 0,
        left: 80,
        right: 0,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        zIndex: 10,
        lineHeight: 1,
      }}
    >
      {/* Mobile: hide the right block and centre the step label below the logo */}
      <style>{`
        @media (max-width: 768px) {
          .aura-header { left: 0 !important; padding: 0 20px !important; justify-content: center !important; }
          .aura-header-right { display: none !important; }
          .aura-header-step { text-align: center; font-size: 11px !important; letter-spacing: 0.24em !important; }
        }
      `}</style>

      {/* LEFT: step label */}
      <div
        className="aura-header-step"
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 12,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.9)",
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        {step}
      </div>

      {/* RIGHT: optional bank button + exit */}
      <div className="aura-header-right" style={{ display: "flex", alignItems: "center", gap: 20, lineHeight: 1 }}>
        {showBank && (
          <button
            type="button"
            onClick={onBankClick ?? (() => navigate("/explore"))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              border: "1px solid rgba(255,201,157,0.35)",
              borderRadius: 8,
              padding: "7px 16px",
              color: "rgba(255,201,157,0.85)",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            <img
              src="/icons/bank.svg"
              alt=""
              style={{
                width: 16,
                display: "block",
                filter:
                  "brightness(0) saturate(100%) invert(83%) sepia(19%) saturate(800%) hue-rotate(330deg)",
              }}
            />
            Simulation Bank
          </button>
        )}
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1,
          }}
        >
          Simulation&nbsp;|&nbsp;
          <span
            onClick={() => navigate("/explore")}
            style={{ textDecoration: "underline", cursor: "pointer" }}
          >
            Exit
          </span>
        </div>
      </div>
    </div>
  );
}
