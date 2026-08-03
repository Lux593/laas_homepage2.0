"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Module-level so several light sections can be active without clobbering
// each other's toggles (GiganticCTA is the obvious second consumer).
let lightCount = 0;

function apply() {
  document.documentElement.dataset.uiTheme = lightCount > 0 ? "light" : "dark";
}

/**
 * Flags the document as "light chrome" (`data-ui-theme="light"` on <html>) while
 * the referenced section owns the top of the viewport, so the fixed white nav and
 * progress bar stay readable over a cream background.
 */
export function useLightSection(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let active = false;
    // Coerce: a freshly created ScrollTrigger reports isActive as undefined, which
    // would slip past an identity check and push lightCount negative for good.
    const set = (next: boolean | undefined) => {
      const value = Boolean(next);
      if (value === active) return;
      active = value;
      lightCount += value ? 1 : -1;
      apply();
    };

    const st = ScrollTrigger.create({
      trigger: el,
      // +=40 ≈ the nav's vertical centre (py-5 around a 32px logo)
      start: "top top+=40",
      end: "bottom top+=40",
      // Resolve after the pin has established this section's final height.
      refreshPriority: -1,
      onToggle: (self) => set(self.isActive),
    });

    // Covers a reload with a restored scroll position inside the section. Read the
    // range directly — st.isActive is not populated until the first update.
    set(window.scrollY >= st.start && window.scrollY < st.end);

    return () => {
      set(false);
      st.kill();
    };
  }, [ref]);
}
