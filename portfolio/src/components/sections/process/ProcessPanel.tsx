"use client";

import ProcessCopy from "@/components/sections/process/ProcessCopy";
import ProcessMedia from "@/components/sections/process/ProcessMedia";
import type { ProcessStep } from "@/lib/constants";

/**
 * Stacked process step for mobile / reduced-motion — text then media.
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
          <div className="grid w-full max-w-full grid-cols-1 items-start gap-y-10">
            <div className="relative z-10 min-w-0 max-w-[48ch] justify-self-center">
              <ProcessCopy step={step} />
            </div>

            <div className="relative z-0 w-full shrink-0 justify-self-center">
              <ProcessMedia step={step} index={index} total={total} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
