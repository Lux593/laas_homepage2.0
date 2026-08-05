"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-1";
import type { ProcessStep } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

/**
 * Process step copy block — used in the pinned shuttle stage and mobile stack.
 */
export default function ProcessCopy({ step }: { step: ProcessStep }) {
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleScrollRefresh = () => {
    // Desktop pin is viewport-fixed — refresh there only causes layout flicker.
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(max-width: 1023px)").matches
    ) {
      return;
    }
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    // Wait for accordion height animation before re-measuring stacked triggers.
    refreshTimer.current = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 220);
  };

  return (
    // data-reveal markiert die Ziele für useStackReveal im gestapelten Aufbau.
    // Im gepinnten Desktop-Layout ist es wirkungslos: dort blendet useProcessPin
    // die ganze Copy-Ebene, und der Stapel-Hook läuft erst unter 1024px.
    <div className="process-copy-inner min-w-0 max-w-[56ch]">
      <header data-reveal="copy">
        <h3 className="whitespace-pre-line font-display text-[clamp(2rem,3.5vw,3.35rem)] font-bold leading-[0.98] tracking-tighter text-[#f2ede4] uppercase">
          {step.title}
        </h3>
        <p className="mt-3 max-w-[54ch] font-body text-[clamp(1.05rem,1.4vw,1.4rem)] text-[#f2ede4]/70">
          {step.subtitle}
        </p>
      </header>

      <p
        data-reveal="copy"
        className="mt-6 max-w-[54ch] font-body text-[clamp(1rem,1.15vw,1.15rem)] leading-relaxed text-[#f2ede4]/70"
      >
        {step.description}
      </p>

      <Accordion
        type="single"
        collapsible
        className="process-points relative z-20 mt-7 w-full"
        onValueChange={scheduleScrollRefresh}
      >
        {step.points.map((point, i) => (
          <AccordionItem
            key={point.title}
            value={`${step.id}-${i}`}
            data-reveal="copy"
            className="process-point border-0"
          >
            <AccordionTrigger className="gap-3 py-4 text-left text-[#f2ede4] hover:no-underline [&[data-state=open]>svg]:text-[#f2ede4]/80 [&>svg]:size-4 [&>svg]:text-[#f2ede4]/55">
              <span className="w-[2.25rem] shrink-0 font-display text-caption font-bold tracking-tighter tabular-nums text-[#f2ede4]/55">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 font-display text-[clamp(0.95rem,1.1vw,1.125rem)] font-semibold text-[#f2ede4]">
                {point.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="transition-none font-body text-caption leading-relaxed text-[#f2ede4]/55 data-[state=open]:animate-none data-[state=closed]:animate-none">
              {/* Inner padding only — AccordionContent mirrors className onto
                  outer + inner wrappers (would double indent). pr reserves the
                  chevron column so copy never sits under the arrow. */}
              <p className="pl-[calc(2.25rem+0.75rem)] pr-7">
                {point.description}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
