"use client";

import ProcessCopy from "@/components/sections/process/ProcessCopy";
import ProcessMedia from "@/components/sections/process/ProcessMedia";
import type { ProcessStep } from "@/lib/constants";

/**
 * Gestapelter Prozessschritt für den mobilen Aufbau und für reduzierte
 * Bewegung. Im DOM steht die Copy vor dem Bild; im gestapelten Layout dreht
 * process.css die Reihenfolge per `order: -1` um, sodass das Bild oben klebt
 * und die Copy daran vorbeizieht. Nur wenn keine der beiden Bedingungen greift
 * (breites Fenster mit reduzierter Bewegung), bleibt es bei Text vor Bild.
 */
export default function ProcessPanel({
  step,
  index,
  total,
}: {
  step: ProcessStep;
  index: number;
  total: number;
}) {
  return (
    <article className="process-panel relative flex flex-col justify-start">
      <div className="process-container w-full">
        <div className="mt-[clamp(0.75rem,2vh,1.25rem)] flex justify-center">
          <div className="process-panel__grid grid w-full max-w-full grid-cols-1 items-start gap-y-10">
            <div className="process-panel__copy relative z-10 min-w-0 max-w-[48ch] justify-self-center">
              {/* Ersetzt den Zähler, den der gepinnte Aufbau oben im Header
                  mitlaufen lässt: gestapelt gehört die Position an den Schritt
                  selbst, sonst weiß man beim Scrollen nie, wo man steht. */}
              <div
                data-reveal="copy"
                className="mb-7 flex items-center gap-4"
                aria-hidden
              >
                {/* Display statt Mono: die Mono-Ziffern tragen eine
                    durchgestrichene Null und standen damit als einzige Zahlen
                    der Seite in einer anderen Schrift als die Zähler im
                    Desktop-Header, die Kapitelmarken und die Punktnummern. */}
                <span className="shrink-0 font-display text-caption font-bold tabular-nums tracking-tighter text-[#f2ede4]/55">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
                {/* Hier lief eine Haarlinie neben der Zahl bis an den
                    Satzspiegelrand. Raus auf Ansage — die Zahl steht allein. */}
              </div>

              <ProcessCopy step={step} />
            </div>

            <div className="process-panel__media relative z-0 w-full shrink-0 justify-self-center">
              <ProcessMedia step={step} index={index} total={total} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
