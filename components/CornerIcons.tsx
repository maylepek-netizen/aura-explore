"use client";

import { useNavigate } from "@/app/TransitionProvider";

// Two independent, fixed corner icons — NOT a sidebar column.
// Eye (top-left) → home, Bank (bottom-left) → the simulation library.
// Same on every screen and every width; each icon is its own fixed element,
// so nothing occupies a sidebar column or blocks clicks across the left edge.
export default function CornerIcons() {
  const navigate = useNavigate();
  return (
    <>
      {/* Eye — top-left */}
      <img
        src="/icons/New_logo_eye.svg"
        alt="Home"
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          width: 28,
          opacity: 0.6,
          cursor: "pointer",
          transition: "opacity 0.2s",
          zIndex: 20,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = "0.6";
        }}
      />

      {/* Bank — bottom-left */}
      <img
        src="/icons/bank.svg"
        alt="Simulation Bank"
        onClick={() => navigate("/explore")}
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          width: 33,
          opacity: 0.45,
          cursor: "pointer",
          transition: "opacity 0.2s",
          zIndex: 20,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = "0.45";
        }}
      />
    </>
  );
}
