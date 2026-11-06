"use client";

import { useEffect } from "react";

/**
 * Feeds scroll position and pointer offset into CSS variables on <html>;
 * scene layers turn them into depth-scaled translations.
 */
export default function ParallaxDriver() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let frame = 0;
    let sy = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      frame = 0;
      root.style.setProperty("--sy", String(Math.min(sy, 1600)));
      root.style.setProperty("--mx", mx.toFixed(3));
      root.style.setProperty("--my", my.toFixed(3));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onScroll = () => {
      sy = window.scrollY;
      queue();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      queue();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);
  return null;
}
