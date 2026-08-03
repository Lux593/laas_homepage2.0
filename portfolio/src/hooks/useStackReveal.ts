"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * MUSS das Gegenstück der gepinnten Layouts bleiben: unterhalb von 1024px
 * zeigen „Projekte" und „Prozess" ihren gestapelten Aufbau (siehe die
 * @media-Blöcke in globals.css und process.css), und genau dort — und nur dort —
 * läuft dieses Aufdecken. Oberhalb übernehmen useHorizontalPin/useProcessPin.
 */
const QUERY = "(max-width: 1023px) and (prefers-reduced-motion: no-preference)";

/** Startseite der Bildblende. Gerade Schritte wischen von links herein,
 *  ungerade von rechts — dieselbe Links-rechts-Ordnung, die auf dem Desktop
 *  der Shuttle zwischen den Spalten fährt. */
const CLIP_FROM = ["inset(0 100% 0 0)", "inset(0 0 0 100%)"];
const CLIP_OPEN = "inset(0 0 0 0)";

interface StackRevealOptions {
  /** Selektor der einzelnen Etagen im Stapel, z. B. ".process-panel". */
  panel: string;
  /**
   * Wie das Bild hereinkommt.
   *  - "wipe": Blende über die Bildkante, dazu ein leichter Push-in. Nur für
   *    Medien, die in einem eigenen, randlosen Rahmen sitzen.
   *  - "rise": steigt auf und blendet ein. Für die Gerätemockups — eine Blende
   *    würde dort die außen liegenden Pfeile dauerhaft abschneiden, weil
   *    clip-path auch auf absolut positionierte Kinder außerhalb der Box wirkt.
   */
  media?: "wipe" | "rise";
}

/**
 * Deckt gestapelte Etagen beim Hereinscrollen auf: Copy steigt gestaffelt hoch,
 * die Haarlinie zieht sich auf, das Bild kommt als Blende oder Aufsteiger nach.
 * Zusätzlich läuft ein leiser Parallax über die gesamte Durchfahrt.
 *
 * Die Startzustände setzt bewusst GSAP und nicht CSS: bleibt das Skript aus,
 * steht der Inhalt sichtbar da statt auf opacity: 0 hängenzubleiben.
 */
export function useStackReveal(
  rootRef: RefObject<HTMLElement | null>,
  { panel: panelSelector, media = "rise" }: StackRevealOptions
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(QUERY, () => {
      const panels = gsap.utils.toArray<HTMLElement>(panelSelector, root);

      panels.forEach((panel, index) => {
        const copy = gsap.utils.toArray<HTMLElement>("[data-reveal='copy']", panel);
        const rules = gsap.utils.toArray<HTMLElement>("[data-reveal='rule']", panel);
        const art = panel.querySelector<HTMLElement>("[data-reveal='media']");
        const artInner = panel.querySelector<HTMLElement>(
          "[data-reveal='media-inner']"
        );

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: panel,
            // 78 % statt der üblichen 85 %: die Etagen sind hoch, und tiefer
            // angesetzt läuft die Bewegung sonst durch, bevor sie im Bild ist.
            start: "top 78%",
            once: true,
          },
        });

        if (rules.length) {
          tl.fromTo(
            rules,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.8, ease: "power2.out" },
            0
          );
        }

        if (copy.length) {
          tl.fromTo(
            copy,
            { y: 26, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07 },
            0.04
          );
        }

        if (art && media === "wipe") {
          // Die Blende sitzt auf der Bildkante, der Push-in auf dem Rahmen
          // darunter — der wächst also in eine Maske hinein und landet exakt
          // auf dem gestalteten Ausschnitt, ohne ihn dauerhaft zu beschneiden.
          tl.fromTo(
            art,
            { clipPath: CLIP_FROM[index % 2] },
            {
              clipPath: CLIP_OPEN,
              duration: 0.95,
              ease: "power3.inOut",
              // Eine stehende Maske würde jedes spätere Overlay im Bild
              // abschneiden; nach dem Aufziehen wird sie nicht mehr gebraucht.
              onComplete: () => {
                gsap.set(art, { clipPath: "none" });
              },
            },
            0.1
          );

          if (artInner) {
            tl.fromTo(
              artInner,
              { scale: 1.08 },
              { scale: 1, duration: 1.1, ease: "power3.out" },
              0.1
            );
          }
        }

        if (art && media === "rise") {
          tl.fromTo(
            art,
            { y: 44, autoAlpha: 0, scale: 0.96 },
            { y: 0, autoAlpha: 1, scale: 1, duration: 0.95, ease: "power3.out" },
            0.1
          );
        }

        // Leises Mitlaufen über die gesamte Durchfahrt. Bewusst auf derselben
        // Ebene wie die Blende und nicht auf dem Rahmen darunter: clip-path
        // wandert mit der Transformation seines eigenen Elements mit, auf dem
        // Kind dagegen liefe der Inhalt unter einer stehenden Maske weg und
        // legte am Rand einen Streifen Hintergrund frei.
        if (art) {
          gsap.fromTo(
            art,
            { yPercent: -2.5 },
            {
              yPercent: 2.5,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      });
    });

    return () => mm.revert();
  }, [rootRef, panelSelector, media]);
}
