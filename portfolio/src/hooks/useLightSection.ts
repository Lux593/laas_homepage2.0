"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Module-level so several light sections can be active without clobbering
// each other's toggles (GiganticCTA is the obvious second consumer).
let lightCount = 0;

function apply() {
  document.documentElement.dataset.uiTheme = lightCount > 0 ? "light" : "dark";
}

type LightSectionOptions = {
  /** ScrollTrigger `end` — defaults to `"bottom top+=40"`. Use to stop light
   *  chrome before a dark overlay (e.g. the About wipe) covers the cream stage. */
  end?: string | (() => string);
};

/**
 * Flags the document as "light chrome" (`data-ui-theme="light"` on <html>) while
 * the referenced section owns the top of the viewport, so the fixed white nav and
 * progress bar stay readable over a cream background.
 */
export function useLightSection(
  ref: RefObject<HTMLElement | null>,
  options?: LightSectionOptions
) {
  // Inline `end` lambdas must not recreate the ScrollTrigger every render.
  //
  // Nachgefuehrt wird im Effect, nicht im Render — waehrend des Renders in ein
  // Ref zu schreiben ist eine unreine Nebenwirkung. Der Effect steht bewusst
  // VOR dem Haupteffect, damit beim Mount erst der Wert steht und dann der
  // ScrollTrigger entsteht. Die Startbelegung aus `useRef` deckt denselben
  // Mount ohnehin ab, und `resolveEnd` laeuft erst bei einem ScrollTrigger-
  // Refresh, also lange nachdem die Effects durch sind.
  const endRef = useRef(options?.end);
  useEffect(() => {
    endRef.current = options?.end;
  });

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

    const resolveEnd = () => {
      const end = endRef.current;
      if (typeof end === "function") return end();
      return end ?? "bottom top+=40";
    };

    const st = ScrollTrigger.create({
      trigger: el,
      // +=40 liegt im Leistenband und damit vor der Wortmarke — der Wechsel ist
      // vollzogen, bevor die Sectionkante sie erreicht.
      //
      // Der frühere Kommentar hier ("≈ the nav's vertical centre, py-5 around a
      // 32px logo") beschrieb eine Leiste, die es nie gab: gemessen sind es
      // pt/pb statt py, ein 20px hohes Logo, und die Leistenmitte lag bei 52.
      // Seit die Leiste mobil auf 72px steht, ist ihre Mitte 36 und der
      // Desktop-Wert 52 — eine einzelne Zahl kann beide nicht treffen. 40
      // bleibt unverändert, weil jede Änderung hier den eingefrorenen Desktop
      // beträfe; sie liegt in beiden Fällen innerhalb des Bandes.
      start: "top top+=40",
      end: resolveEnd,
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
