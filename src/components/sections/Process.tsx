"use client";

import { useRef } from "react";
import TextReveal from "@/components/ui/TextReveal";
import ProcessPanel from "@/components/sections/process/ProcessPanel";
import { useHorizontalPin } from "@/hooks/useHorizontalPin";
import { PROCESS_STEPS } from "@/lib/constants";
import "./process/process.css";

const TOTAL = String(PROCESS_STEPS.length).padStart(2, "0");

/**
 * How-it-works section: same scroll language as Meine Projekte (pinned
 * horizontal scrub on desktop, stacked on mobile / reduced motion), dark surface.
 */
export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const { pinRef, trackRef, counterRef, barRef } = useHorizontalPin(
    PROCESS_STEPS.length,
    ".process-panel"
  );

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative z-10 bg-bg-primary"
    >
      <div ref={pinRef} className="process-pin">
        <header className="process-container w-full shrink-0 pt-[clamp(4rem,8vh,5.5rem)] pb-[clamp(0.875rem,2vh,1.375rem)]">
          <div className="flex items-end justify-between gap-8">
            <div className="min-w-0">
              <span className="mb-3 block font-mono text-caption uppercase tracking-[0.2em] text-text-muted">
                02 - So arbeiten wir zusammen
              </span>
              <TextReveal
                as="h2"
                variant="words"
                start="top 95%"
                className="font-display text-[clamp(1.9rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-tighter text-text-primary uppercase"
              >
                WIE FUNKTIONIERTS?
              </TextReveal>
            </div>

            <div
              className="hidden shrink-0 items-baseline gap-2 lg:flex"
              aria-hidden
            >
              <span
                ref={counterRef}
                className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-bold leading-none tracking-tighter tabular-nums text-text-primary"
              >
                01
              </span>
              <span className="font-mono text-caption tracking-[0.2em] text-text-muted">
                / {TOTAL}
              </span>
            </div>
          </div>
        </header>

        <div
          className="process-container w-full shrink-0 pb-[clamp(0.5rem,1.5vh,1rem)]"
          aria-hidden
        >
          <div className="relative h-px w-full bg-white/12">
            <span
              ref={barRef}
              className="absolute inset-0 hidden origin-left bg-accent-primary will-change-transform lg:block"
              style={{ transform: `scaleX(${1 / PROCESS_STEPS.length})` }}
            />
          </div>
        </div>

        <div ref={trackRef} className="process-track will-change-transform">
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
