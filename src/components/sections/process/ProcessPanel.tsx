"use client";

import ProcessMedia from "@/components/sections/process/ProcessMedia";
import type { ProcessStep } from "@/lib/constants";

/**
 * One process step as a centered spread (text + media), matching the project
 * panels: structure from grid and hairlines, not from card chrome.
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
        <div className="mt-[clamp(1.75rem,4vh,3rem)] flex justify-center">
          <div className="grid w-full max-w-full grid-cols-1 items-center gap-y-12 lg:w-auto lg:grid-cols-[minmax(0,48ch)_minmax(260px,340px)] lg:gap-x-[clamp(3rem,5vw,5rem)] lg:gap-y-0">
            <div className="min-w-0 max-w-[48ch] justify-self-center lg:justify-self-stretch">
              <header>
                <h3 className="font-display text-[clamp(1.7rem,3vw,2.85rem)] font-bold leading-[0.98] tracking-tighter text-text-primary uppercase">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[46ch] font-body text-body-md text-text-secondary">
                  {step.subtitle}
                </p>
              </header>

              <p className="mt-6 max-w-[46ch] font-body text-body-sm leading-relaxed text-text-secondary">
                {step.description}
              </p>

              <ul className="mt-7 border-t border-white/10">
                {step.points.map((point, i) => (
                  <li
                    key={point.title}
                    className="grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 border-b border-white/10 py-2.5"
                  >
                    <span className="font-mono text-caption tabular-nums text-text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-body-sm font-semibold text-text-primary">
                        {point.title}
                      </p>
                      <p className="mt-1 line-clamp-2 max-xl:hidden [@media(max-height:900px)]:hidden font-body text-caption leading-relaxed text-text-muted">
                        {point.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative w-full max-w-[340px] shrink-0 justify-self-center">
              <ProcessMedia step={step} index={index} total={total} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
