"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Always start at the top on page load/refresh
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    // Expose for AnimationProvider to sync with ScrollTrigger
    // Lenis.raf() is called exclusively via GSAP ticker in AnimationProvider
    (window as unknown as Record<string, unknown>).__lenis = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as Record<string, unknown>).__lenis;
    };
  }, []);

  return <>{children}</>;
}
