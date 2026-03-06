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

    // Sync ScrollTrigger with Lenis
    const lenisInstance = (window as unknown as Record<string, Lenis | undefined>).__lenis;
    if (lenisInstance) {
      lenisInstance.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    ScrollTrigger.refresh();
    animationReady = true;
    listeners.forEach((cb) => cb());

    return () => {
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
