"use client";

import { useEffect, useRef } from "react";

export function Footer() {
  const rootRef = useRef<HTMLElement>(null);

  // Publish the footer's live height as a CSS variable so fixed-position
  // overlays (the Droplet mascot) can reserve space above it too, the same
  // way they already do for the composer.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        "--footer-height",
        `${entry.contentRect.height}px`,
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={rootRef}
      className="shrink-0 border-t border-slate-200 bg-white px-4 py-1.5 text-center text-xs text-slate-400"
    >
      © 2026 SoftWater Assist. Built with Claude Code
    </footer>
  );
}
