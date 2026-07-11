"use client";

import { useNavigate } from "@/app/TransitionProvider";

// Ported from the main AURA app, adapted to aura-explore's routes:
// home → "/", bank → "/explore" (this project's library). The main app's
// /research route doesn't exist here, so the insights icon is omitted.
//
// Desktop (≥769px): a fixed 80px-wide sidebar column with the eye icon at top
// and the bank + sensory-channels icons grouped at the bottom.
// Mobile (≤768px): the 80px column collapses — it takes no layout space and
// doesn't capture clicks (pointer-events: none). The eye icon (top-left) and
// bank icon (bottom-left) stay in place as independent, individually-clickable
// fixed elements; the sensory-channels icon is hidden.
export default function AppSidebar() {
  const navigate = useNavigate();
  return (
    <div
      className="aura-sidebar"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 80,
        height: "100vh",
        background: "transparent",
        zIndex: 10,
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          /* Column no longer occupies width or blocks clicks */
          .aura-sidebar { width: auto !important; pointer-events: none !important; }
          /* Eye icon: pinned top-left, individually clickable */
          .aura-sidebar-top {
            height: auto !important;
            justify-content: flex-start !important;
            top: 18px !important;
            left: 18px !important;
            right: auto !important;
            pointer-events: none;
          }
          .aura-sidebar-top img { pointer-events: auto; }
          /* Bank icon: pinned bottom-left, individually clickable */
          .aura-sidebar-bottom {
            align-items: flex-start !important;
            bottom: 20px !important;
            left: 18px !important;
            right: auto !important;
            pointer-events: none;
          }
          .aura-sidebar-bottom img { pointer-events: auto; }
          /* Hide the third (sensory-channels) icon on mobile */
          .aura-sidebar-sensory { display: none !important; }
        }
      `}</style>

      {/* Top icon — vertically centered within the 60px header row */}
      <div
        className="aura-sidebar-top"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/icons/New_logo_eye.svg"
          alt="Home"
          onClick={() => navigate("/")}
          style={{
            width: 28,
            opacity: 0.6,
            cursor: "pointer",
            transition: "opacity 0.2s",
            display: "block",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0.6";
          }}
        />
      </div>

      {/* Bottom icon group */}
      <div
        className="aura-sidebar-bottom"
        style={{
          position: "absolute",
          bottom: 28,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <img
          src="/icons/bank.svg"
          alt="Simulation Bank"
          onClick={() => navigate("/explore")}
          style={{
            width: 33,
            opacity: 0.45,
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0.45";
          }}
        />
        <img
          className="aura-sidebar-sensory"
          src="/icons/sensory-channels.svg"
          alt="Sensory Channels"
          style={{ width: 27, opacity: 0.45 }}
        />
      </div>
    </div>
  );
}
