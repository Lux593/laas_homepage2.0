"use client";

import { useRef, type RefObject } from "react";
import TextReveal from "@/components/ui/TextReveal";
import ProcessCopy from "@/components/sections/process/ProcessCopy";
import ProcessMedia from "@/components/sections/process/ProcessMedia";
import ProcessPanel from "@/components/sections/process/ProcessPanel";
import { useProcessPin } from "@/hooks/useProcessPin";
import { useStackReveal } from "@/hooks/useStackReveal";
import { PROCESS_STEPS } from "@/lib/constants";
import "./process/process.css";

const TOTAL = String(PROCESS_STEPS.length).padStart(2, "0");

function ProcessHeader({
  counterRef,
}: {
  counterRef?: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <header className="process-container w-full shrink-0 pt-[clamp(4rem,8vh,5.5rem)] pb-[clamp(0.875rem,2vh,1.375rem)]">
      <div className="flex items-end justify-between gap-8">
        <div className="min-w-0">
          <span className="mb-3 block font-mono text-caption uppercase tracking-[0.2em] text-[#f2ede4]/60">
            So arbeiten wir zusammen
          </span>
          <TextReveal
            as="h2"
            variant="words"
            start="top 95%"
            className="font-display text-[clamp(1.9rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-tighter text-[#f2ede4] uppercase"
          >
            WIE FUNKTIONIERTS?
          </TextReveal>
        </div>

        {counterRef ? (
          <div
            className="hidden shrink-0 items-baseline gap-2 lg:flex"
            aria-hidden
          >
            <span
              ref={counterRef}
              className="pin-counter inline-block h-[1em] overflow-hidden font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-bold leading-none tracking-tighter tabular-nums text-[#f2ede4]"
            >
              <span data-counter-digit className="block h-[1em]">
                01
              </span>
            </span>
            <span className="font-display text-caption font-bold tracking-tighter tabular-nums text-[#f2ede4]/60">
              / {TOTAL}
            </span>
          </div>
        ) : null}
      </div>
    </header>
  );
}

/**
 * How-it-works: on desktop the artwork shuttles across as a wipe between
 * steps; mobile / reduced-motion keep a stacked reading order.
 */
export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const { pinRef, stageRef, shuttleRef, counterRef } = useProcessPin(
    PROCESS_STEPS.length
  );
  // Gegenstück zum Shuttle: unter 1024px steht der Stapel, und die Schritte
  // decken sich beim Hereinscrollen einzeln auf, statt fertig dazuliegen.
  useStackReveal(stackRef, { panel: ".process-panel", media: "wipe" });

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative z-10 bg-bg-primary"
    >
      {/* Desktop shuttle stage */}
      <div ref={pinRef} className="process-pin process-pin--desktop">
        <ProcessHeader counterRef={counterRef} />

        <div ref={stageRef} className="process-stage process-container">
          <div className="process-stage-grid">
            <div className="process-slot" data-process-slot="left">
              {PROCESS_STEPS.map((step, index) =>
                index % 2 === 0 ? (
                  <div
                    key={step.id}
                    data-process-copy={index}
                    className="process-copy-layer"
                  >
                    <ProcessCopy step={step} />
                  </div>
                ) : null
              )}
            </div>

            <div className="process-slot" data-process-slot="right">
              {PROCESS_STEPS.map((step, index) =>
                index % 2 === 1 ? (
                  <div
                    key={step.id}
                    data-process-copy={index}
                    className="process-copy-layer"
                  >
                    <ProcessCopy step={step} />
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Mirrors the text grid; shuttle lives in column 2 and translates by one column */}
          <div className="process-shuttle-track" aria-hidden>
            <div ref={shuttleRef} className="process-shuttle">
              {PROCESS_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  data-process-media={index}
                  className="process-shuttle-layer"
                >
                  <ProcessMedia
                    step={step}
                    index={index}
                    total={PROCESS_STEPS.length}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / reduced-motion stack */}
      <div ref={stackRef} className="process-stack">
        <ProcessHeader />
        <div className="process-track">
          {PROCESS_STEPS.map((step, index) => (
            <ProcessPanel
              key={step.id}
              step={step}
              index={index}
              total={PROCESS_STEPS.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
