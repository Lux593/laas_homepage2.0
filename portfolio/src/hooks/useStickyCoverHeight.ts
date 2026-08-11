"use client";

import { useEffect, type RefObject } from "react";

/**
 * Misst das klebende Feld einer gestapelten Etage und schreibt seine Höhe als
 * `--media-h` auf die Etage. Die deckende Fläche darunter nimmt den Wert als
 * `min-height` (siehe .work-panel__body in app/globals.css).
 *
 * WARUM GEMESSEN UND NICHT GERECHNET
 *
 * Ein `position: sticky`-Element löst, sobald seine Unterkante die Unterkante
 * seines Rasters erreicht — und das Raster endet mit dem Rumpf. Die deckende
 * Fläche kann den Rahmen deshalb nur so weit schlucken, wie sie selbst hoch
 * ist; alles darüber bleibt stehen und fährt am Ende der Etage mit hoch.
 * Die Bedingung ist eine Subtraktion (Rumpfhöhe ≥ Feldhöhe), die vollständige
 * Herleitung mit den Messwerten steht an .work-panel__body.
 *
 * Diese Höhe in CSS nachzubauen hiesse, drei Zahlen aus zwei anderen Dateien zu
 * kopieren: die beiden Seitenverhältnisse der Rahmen (0.4896 hochkant, 1.4596
 * quer, ui/framer-moveable-thumbnails.tsx), die 44px Trefferfläche der
 * Fortschrittspunkte und die Polsterung des Felds. Vier Werte, die niemand
 * mitzieht, wenn ein sechstes Projekt ein drittes Gerät mitbringt — und die
 * Fläche deckte dann wieder zu wenig oder liesse einen Streifen Leerraum
 * stehen. Der ResizeObserver liest stattdessen die Zahl, um die es geht.
 *
 * Border-Box statt getBoundingClientRect(): über dem Feld liegt im Stapel eine
 * Transformation — useStackReveal fährt das Gerät mit `scale: 0.96 → 1` herein
 * und lässt einen Parallax mitlaufen. Das Rechteck wäre also die Höhe NACH der
 * Skalierung (gemessen 4% zu klein, solange die Etage noch nicht aufgedeckt
 * ist), die Border-Box ist die Layouthöhe. Dieselbe Unterscheidung, aus
 * demselben Grund, wie im Karussell selbst.
 *
 * Nicht auf den Stapel eingegrenzt: gepinnt liest die `min-height` niemand
 * (die Regel steht nur im Stapelzweig), und beim Wechsel des Layouts ändert
 * sich die Feldhöhe — der Beobachter feuert also ohnehin und korrigiert den
 * Wert von selbst. Eine Media-Query hier wäre ein zweiter Zwilling von
 * STACK_QUERY ohne Gegenwert.
 */
export function useStickyCoverHeight(
  rootRef: RefObject<HTMLElement | null>,
  { panel, media }: { panel: string; media: string },
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const host = el.closest<HTMLElement>(panel);
        if (!host) continue;
        // blockSize ist die Höhe im Schreibmodus der Seite; offsetHeight ist
        // die Rückfallebene für den einen Commit vor dem ersten Feuern und
        // ebenfalls transformfrei (contentRect wäre es zwar auch, liesse aber
        // die 1.5rem Polsterung des Felds weg und deckte 24px zu wenig).
        const h = entry.borderBoxSize?.[0]?.blockSize || el.offsetHeight;
        if (h > 0) host.style.setProperty("--media-h", `${h}px`);
      }
    });

    for (const el of root.querySelectorAll<HTMLElement>(media)) ro.observe(el);
    return () => ro.disconnect();
  }, [rootRef, panel, media]);
}
