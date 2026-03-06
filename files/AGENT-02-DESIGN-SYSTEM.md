# 🎨 AGENT-02: Design System & Providers

## Rolle
Du bist ein Senior Design Engineer. Deine Aufgabe: Das komplette Design-System aufbauen — Smooth Scroll Provider, Animation Context, Grain Overlay und die Grundbausteine, auf denen alle Sections aufbauen.

## Voraussetzung
AGENT-01 muss abgeschlossen sein. `pnpm dev` läuft fehlerfrei.

---

## Schritt 1: Lenis Smooth Scroll Provider

Erstelle `src/components/providers/SmoothScroll.tsx`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Prüfe reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // GSAP Integration
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Globaler Zugriff für andere Komponenten
    (window as any).__lenis = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
```

---

## Schritt 2: GSAP Animation Provider

Erstelle `src/components/providers/AnimationProvider.tsx`:

```typescript
"use client";

import { useEffect, createContext, useContext, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Context für globalen GSAP-Zugriff
const AnimationContext = createContext<{ isReady: boolean }>({ isReady: false });

export const useAnimationContext = () => useContext(AnimationContext);

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const isReady = useRef(false);

  useEffect(() => {
    // GSAP Plugins registrieren
    gsap.registerPlugin(ScrollTrigger);

    // GSAP Defaults für konsistente Animationen
    gsap.defaults({
      ease: "power3.out",
      duration: 1,
    });

    // ScrollTrigger mit Lenis synchronisieren
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }

    // Refresh ScrollTrigger nach Laden
    ScrollTrigger.refresh();

    isReady.current = true;

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <AnimationContext.Provider value={{ isReady: isReady.current }}>
      {children}
    </AnimationContext.Provider>
  );
}
```

---

## Schritt 3: Grain / Film Noise Overlay

Erstelle `src/components/ui/GrainOverlay.tsx`:

```typescript
"use client";

export default function GrainOverlay() {
  return (
    <>
      {/* SVG Noise Filter Definition */}
      <svg className="fixed w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="grain-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      {/* Grain Overlay Element */}
      <div
        className="grain-overlay"
        style={{ filter: "url(#grain-filter)" }}
        aria-hidden="true"
      />
    </>
  );
}
```

---

## Schritt 4: Reusable Hooks

### useScrollProgress

Erstelle `src/hooks/useScrollProgress.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { clamp } from "@/lib/utils";

interface ScrollProgressOptions {
  /** Offset from top of viewport (0-1) where tracking starts */
  start?: number;
  /** Offset from top of viewport (0-1) where tracking ends */
  end?: number;
}

export function useScrollProgress(
  ref: React.RefObject<HTMLElement | null>,
  options: ScrollProgressOptions = {}
) {
  const { start = 0, end = 1 } = options;
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;

    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const elementStart = rect.top - windowHeight * (1 - start);
      const elementEnd = rect.bottom - windowHeight * end;
      const totalDistance = elementEnd - elementStart;

      if (totalDistance === 0) return;

      const currentProgress = clamp(-elementStart / Math.abs(rect.height + windowHeight * (1 - start + end)), 0, 1);
      setProgress(currentProgress);
    });
  }, [ref, start, end]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  return progress;
}
```

### useMousePosition

Erstelle `src/hooks/useMousePosition.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { lerp } from "@/lib/utils";
import type { MousePosition } from "@/types";

export function useMousePosition(smoothing = 0.1): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    current.current.x = lerp(current.current.x, target.current.x, smoothing);
    current.current.y = lerp(current.current.y, target.current.y, smoothing);

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    setPosition({
      x: current.current.x,
      y: current.current.y,
      normalizedX: (current.current.x / windowWidth) * 2 - 1,
      normalizedY: (current.current.y / windowHeight) * 2 - 1,
    });

    rafId.current = requestAnimationFrame(animate);
  }, [smoothing]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  return position;
}
```

### useInView

Erstelle `src/hooks/useInView.ts`:

```typescript
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useInView<T extends HTMLElement>(
  options: UseInViewOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);

        if (inView && once) {
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isInView };
}
```

### useMediaQuery

Erstelle `src/hooks/useMediaQuery.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Convenience Hooks
export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1025px)");
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useSupportsHover() {
  return useMediaQuery("(hover: hover)");
}
```

---

## Schritt 5: Animation Presets

Erstelle `src/lib/animations.ts`:

```typescript
import gsap from "gsap";

/** Standard-Ease für die gesamte Website */
export const EASE = {
  outExpo: "expo.out",
  outQuint: "quint.out",
  inOutQuart: "quart.inOut",
  outBack: "back.out(1.7)",
  outElastic: "elastic.out(1, 0.5)",
} as const;

/** Wiederverwendbare GSAP-Animation Presets */
export const ANIMATION = {
  /** Text erscheint von unten (für Headlines) */
  revealUp: {
    from: { y: 120, opacity: 0, rotateX: -40 },
    to: { y: 0, opacity: 1, rotateX: 0, duration: 1.2, ease: EASE.outExpo },
  },

  /** Text erscheint mit Clip-Path */
  revealClip: {
    from: { clipPath: "inset(100% 0% 0% 0%)" },
    to: { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: EASE.outQuint },
  },

  /** Element faded sanft ein */
  fadeIn: {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0, duration: 0.8, ease: EASE.outQuint },
  },

  /** Skaliert von klein zu normal */
  scaleIn: {
    from: { scale: 0.85, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 1, ease: EASE.outExpo },
  },

  /** Stagger-Delay für Listen */
  stagger: {
    fast: 0.05,
    medium: 0.1,
    slow: 0.15,
  },

  /** ScrollTrigger Defaults */
  scrollTrigger: {
    start: "top 85%",
    end: "bottom 15%",
    toggleActions: "play none none none",
  },
} as const;

/**
 * Erstellt eine staggered reveal Animation für Kinder-Elemente
 */
export function createStaggerReveal(
  container: HTMLElement,
  childSelector: string,
  options?: gsap.TweenVars
) {
  const children = container.querySelectorAll(childSelector);

  return gsap.fromTo(
    children,
    { y: 60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: EASE.outQuint,
      stagger: ANIMATION.stagger.medium,
      ...options,
    }
  );
}
```

---

## Schritt 6: Preloader Komponente

Erstelle `src/components/ui/Preloader.tsx`:

```typescript
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Simuliere Lade-Fortschritt
    const duration = 2000; // 2 Sekunden
    const interval = 20;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const newProgress = Math.min(Math.round((current / steps) * 100), 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => setIsLoading(false), 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-bg-primary"
          exit={{
            clipPath: "inset(0% 0% 100% 0%)",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Zähler */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              ref={counterRef}
              className="text-display-lg font-display font-bold tracking-tighter tabular-nums text-text-primary"
            >
              {progress}
            </span>
            <span className="text-display-sm font-display font-light text-text-muted ml-1">
              %
            </span>
          </motion.div>

          {/* Progress Bar */}
          <div className="mt-8 w-48 h-[1px] bg-text-muted/20 overflow-hidden">
            <motion.div
              className="h-full bg-accent-primary"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Untertitel */}
          <motion.p
            className="mt-6 text-caption font-body text-text-muted tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Loading experience
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Schritt 7: Root Layout updaten

Aktualisiere `src/app/layout.tsx` um alle Provider einzubinden:

```typescript
// ... (bestehende imports)
import SmoothScroll from "@/components/providers/SmoothScroll";
import AnimationProvider from "@/components/providers/AnimationProvider";
import GrainOverlay from "@/components/ui/GrainOverlay";
import Preloader from "@/components/ui/Preloader";

// ... (metadata bleibt gleich)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${/* font variables */""}`}
      suppressHydrationWarning
    >
      <body className="bg-bg-primary text-text-primary font-body antialiased overflow-x-hidden">
        <Preloader />
        <SmoothScroll>
          <AnimationProvider>
            <GrainOverlay />
            {children}
          </AnimationProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
```

---

## Verifikation

```bash
pnpm dev
```

✅ Preloader erscheint mit Zähler (0 → 100%)
✅ Preloader verschwindet mit Clip-Path Animation
✅ Smooth Scrolling funktioniert (Seite muss Scroll-Höhe haben)
✅ Film Grain ist subtil sichtbar
✅ Keine Konsolen-Fehler

**→ Weiter mit AGENT-03-3D-ENGINE.md**
