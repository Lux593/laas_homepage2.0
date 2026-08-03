"use client";

import { useEffect, createContext, useContext, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

const AnimationContext = createContext<{ isReady: boolean }>({ isReady: false });

export const useAnimationContext = () => useContext(AnimationContext);

let animationReady = false;
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return animationReady;
}

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const isReady = useSyncExternalStore(subscribe, getSnapshot, () => false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.defaults({
      ease: "power3.out",
      duration: 1,
    });

    ScrollTrigger.defaults({
      invalidateOnRefresh: true,
    });

    // Mobile URL-bar show/hide must not resize pinned sections mid-pin
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Sync ScrollTrigger with Lenis (retry because SmoothScroll effect may run after this one)
    let synced: Lenis | null = null;
    let onRefresh: (() => void) | null = null;

    function syncLenis() {
      const lenisInstance = (window as unknown as Record<string, Lenis | undefined>).__lenis;
      // The retry would otherwise register every listener twice
      if (!lenisInstance || synced) return;
      synced = lenisInstance;
      lenisInstance.on("scroll", ScrollTrigger.update);
      // Pinning changes document height — Lenis has to re-measure
      onRefresh = () => lenisInstance.resize();
      ScrollTrigger.addEventListener("refresh", onRefresh);
      ScrollTrigger.refresh();
    }
    syncLenis();
    // Retry after a frame in case SmoothScroll hasn't initialized yet
    const retryId = requestAnimationFrame(() => {
      syncLenis();
    });

    // Text metrics shift when the three next/font families swap in, which moves
    // every section start below them — re-measure once fonts settle.
    let fontsCancelled = false;
    if (typeof document !== "undefined" && document.fonts?.status !== "loaded") {
      document.fonts.ready.then(() => {
        if (!fontsCancelled) ScrollTrigger.refresh();
      });
    }

    ScrollTrigger.refresh();
    animationReady = true;
    listeners.forEach((cb) => cb());

    return () => {
      cancelAnimationFrame(retryId);
      fontsCancelled = true;
      if (onRefresh) ScrollTrigger.removeEventListener("refresh", onRefresh);
      synced?.off("scroll", ScrollTrigger.update);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      animationReady = false;
      listeners.forEach((cb) => cb());
    };
  }, []);

  return (
    <AnimationContext.Provider value={{ isReady }}>
      {children}
    </AnimationContext.Provider>
  );
}
