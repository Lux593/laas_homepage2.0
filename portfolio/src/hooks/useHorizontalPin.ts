"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Timeline units: a resting beat before/after each push. */
const HOLD = 0.35;
/** Timeline units the push itself takes. */
const MOVE = 1;
/** Vertical scroll (in pinned-box heights) consumed per timeline unit. */
const SCROLL_UNIT = 0.9;

/**
 * Pins a section and slides a horizontal track through it: panel N leaves to the
 * left while panel N+1 enters from the right. Everything is written straight to
 * the DOM — no React state — because a scrubbed onUpdate fires every frame and
 * TextReveal rebuilds its innerHTML on every render.
 */
export function useHorizontalPin(
  panelCount: number,
  panelSelector = ".work-panel"
) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track || panelCount < 2) return;

    const mm = gsap.matchMedia();

    // MUST stay byte-identical to the @media query for .work-pin / .process-pin
    // in globals.css
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const steps = panelCount - 1;
        const totalUnits = HOLD + steps * (MOVE + HOLD);
        const panels = gsap.utils.toArray<HTMLElement>(panelSelector, track);
        const setBar = barRef.current
          ? gsap.quickSetter(barRef.current, "scaleX")
          : null;
        let lastIndex = -1;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () =>
              "+=" + Math.round(totalUnits * pin.offsetHeight * SCROLL_UNIT),
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.6,
            // Explicit: ScrollTrigger.defaults() in AnimationProvider runs after
            // this effect (React flushes child effects first), so it never lands.
            invalidateOnRefresh: true,
            // Resolve the pin before useLightSection, whose end depends on the
            // section height that the pin-spacer establishes.
            refreshPriority: 1,
            onUpdate: () => {
              const width = pin.clientWidth || 1;
              const x = (gsap.getProperty(track, "x") as number) || 0;
              // Derive from the actual x, not self.progress — the hold beats
              // make progress non-linear in panel index.
              const raw = -x / width;

              setBar?.((raw + 1) / panelCount);

              const index = gsap.utils.clamp(0, steps, Math.round(raw));
              if (index === lastIndex) return;
              lastIndex = index;

              if (counterRef.current) {
                counterRef.current.textContent = String(index + 1).padStart(
                  2,
                  "0"
                );
              }
              panels.forEach((panel, i) =>
                panel.setAttribute("aria-hidden", i === index ? "false" : "true")
              );
            },
          },
        });

        tl.to(track, { x: 0, duration: HOLD });
        for (let i = 1; i <= steps; i++) {
          tl.to(track, { x: () => -i * pin.clientWidth, duration: MOVE });
          tl.to(track, { x: () => -i * pin.clientWidth, duration: HOLD });
        }

        const st = tl.scrollTrigger!;

        // Tabbing into an off-screen panel: scroll the page to that panel rather
        // than letting the browser scroll the overflow:hidden box sideways.
        const handleFocusIn = (event: FocusEvent) => {
          const index = panels.findIndex((panel) =>
            panel.contains(event.target as Node)
          );
          if (index < 0) return;

          pin.scrollLeft = 0;
          const unitsAt =
            HOLD + index * (MOVE + HOLD) - (index ? HOLD / 2 : 0);
          const target =
            st.start + (unitsAt / totalUnits) * (st.end - st.start);

          if (Math.abs(window.scrollY - target) <= 8) return;
          const lenis = (window as { __lenis?: { scrollTo: (v: number) => void } })
            .__lenis;
          if (lenis) lenis.scrollTo(target);
          else window.scrollTo({ top: target });
        };

        // overflow:hidden boxes still have a scrollLeft; any stray scrollIntoView
        // would shift the clip permanently.
        const handleScroll = () => {
          pin.scrollLeft = 0;
        };

        pin.addEventListener("focusin", handleFocusIn);
        pin.addEventListener("scroll", handleScroll);

        return () => {
          pin.removeEventListener("focusin", handleFocusIn);
          pin.removeEventListener("scroll", handleScroll);
          gsap.set(track, { clearProps: "transform" });
          panels.forEach((panel) => panel.removeAttribute("aria-hidden"));
        };
      }
    );

    return () => mm.revert();
  }, [panelCount, panelSelector]);

  return { pinRef, trackRef, counterRef, barRef };
}
