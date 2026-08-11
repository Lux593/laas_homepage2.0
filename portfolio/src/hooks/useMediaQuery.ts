"use client";

import { useSyncExternalStore } from "react";

/**
 * Projektweite Regel für die beiden Kanten: **768 und 1024 gehören immer der
 * grösseren Seite.** Vorher widersprachen sich JS und CSS an genau den zwei
 * Punkten, die die Zielgeräte treffen — bei exakt 768px sagten `hero.css` und
 * die GSAP-Query „Desktop", während `useIsMobile` und Lenis „Mobile" sagten.
 *
 * `useSyncExternalStore` statt `useState` + Effekt: der Client-Snapshot ist
 * schon im ERSTEN Render korrekt. Mit der alten Fassung rendert ein 375px-Handy
 * einen Frame lang den Desktopzweig, bevor der Effekt nachzieht.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    // Auf dem Server gibt es kein matchMedia. `false` ist der neutrale Wert:
    // die Hooks unten sind alle so formuliert, dass `false` den unauffälligeren
    // Zweig ergibt.
    () => false,
  );
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 767.98px)");
}

export function useSupportsHover() {
  return useMediaQuery("(hover: hover)");
}
