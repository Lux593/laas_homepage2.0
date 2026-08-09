"use client";

import Image from "next/image";
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { SERVICES_INTRO } from "@/lib/constants";

/** Startposition der Ziehkante in Prozent. */
const START = 50;
/** Tastaturschritt in Prozent — mit Shift das Fünffache. */
const STEP = 2;

const clamp = (value: number) => Math.min(100, Math.max(0, value));

/**
 * Leistungen-Visual: dasselbe Blatt zweimal — zugestellter und geräumter
 * Arbeitsplatz — deckungsgleich übereinander, getrennt von einer ziehbaren
 * Schnittkante.
 *
 * Beide Blätter tragen multiply und werden deshalb komplementär beschnitten
 * (siehe services.css): multiply deckt nicht ab, ein bloßes Überlagern ließe
 * die Tusche des unteren Blatts überall durchscheinen.
 *
 * Der Beschnitt sitzt bewusst direkt auf dem <img> und nicht auf einem
 * Wrapper: clip-path macht einen eigenen Stacking-Context auf, und das
 * multiply der Zeichnung würde dann nicht mehr auf dem Creme der Figur
 * landen — das Papierweiß bliebe als heller Kasten stehen.
 */
export default function ServicesLandscape({
  className = "",
}: {
  className?: string;
}) {
  const figureRef = useRef<HTMLElement>(null);
  const draggingRef = useRef(false);
  const [wipe, setWipe] = useState(START);

  const setFromClientX = useCallback((clientX: number) => {
    const box = figureRef.current?.getBoundingClientRect();
    // getBoundingClientRect liefert die transformierte Box, clientX ebenso —
    // die Skalierung der Figur rechnet sich damit von allein heraus.
    if (!box?.width) return;
    setWipe(clamp(((clientX - box.left) / box.width) * 100));
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    // Kein preventDefault: touch-action: pan-y trennt schon sauber zwischen
    // unserem Ziehen und dem vertikalen Scrollen der Seite.
    if (draggingRef.current) setFromClientX(event.clientX);
  };

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const step = event.shiftKey ? STEP * 5 : STEP;
    const delta =
      event.key === "ArrowLeft"
        ? -step
        : event.key === "ArrowRight"
          ? step
          : event.key === "Home"
            ? -100
            : event.key === "End"
              ? 100
              : null;
    if (delta === null) return;
    event.preventDefault();
    setWipe((current) => clamp(current + delta));
  };

  const position = Math.round(wipe);

  return (
    <figure
      ref={figureRef}
      className={`services-landscape relative overflow-hidden ${className}`.trim()}
      style={{ "--services-wipe": `${wipe}%` } as CSSProperties}
      role="slider"
      tabIndex={0}
      aria-label={`${SERVICES_INTRO.statement} Ziehen wechselt zwischen zugestelltem und geräumtem Arbeitsplatz.`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={position}
      aria-valuetext={`${position} Prozent Chaos`}
      aria-orientation="horizontal"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
    >
      {/* sizes rechnet die scale(1.55) der Figur mit — sonst liefert Next eine
          Quelle, die schmaler ist als die Darstellung, und die Haarlinien der
          Zeichnung werden weich.

          KEIN priority mehr, seit die Figur nur noch auf der Desktop-Bühne
          steht: `priority` schreibt einen Preload-Link in den Kopf, und der
          gilt unabhängig davon, dass .services-pin--desktop im Stapel auf
          display:none steht — beide Blätter (rund 540 KB) landeten damit auf
          jedem Telefon, das sie nie zu sehen bekommt. Lazy hält sie dort
          vollständig zurück; auf dem Desktop lädt sie der grosszügige
          rootMargin von next/image lange vor der Sektion. */}
      <Image
        src={SERVICES_INTRO.visualAfter}
        alt=""
        fill
        sizes="(max-width: 1023px) 65vw, 60vw"
        className="services-landscape__after object-contain object-center"
        aria-hidden
        draggable={false}
      />
      <Image
        src={SERVICES_INTRO.visualBefore}
        alt=""
        fill
        sizes="(max-width: 1023px) 65vw, 60vw"
        className="services-landscape__before object-contain object-center"
        aria-hidden
        draggable={false}
      />

      <span className="services-landscape__seam" aria-hidden>
        <span className="services-landscape__grip" />
      </span>
    </figure>
  );
}
