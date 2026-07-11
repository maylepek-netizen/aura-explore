"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    backgroundMusic?: HTMLAudioElement;
  }
}

// Resumes background music on every page navigation.
// Audio is first created on the landing page when the visitor clicks Enter.
export function BackgroundMusic() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const music = window.backgroundMusic;
    if (!music) return;

    if (music.paused) {
      music.volume = 0.35;
      music.play().catch(() => {});
    }
  }, [pathname]);

  return null;
}
