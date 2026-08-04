"use client";

import { useRef } from "react";
import TextReveal from "@/components/ui/TextReveal";
import ProjectPanel from "@/components/sections/work/ProjectPanel";
import { useHorizontalPin } from "@/hooks/useHorizontalPin";
import { useLightSection } from "@/hooks/useLightSection";
import { useStackReveal } from "@/hooks/useStackReveal";
import { PROJECTS } from "@/lib/constants";

const TOTAL = String(PROJECTS.length).padStart(2, "0");

export default function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const { pinRef, trackRef, counterRef } = useHorizontalPin(PROJECTS.length);
  useLightSection(sectionRef);
  // Gegenstück zum horizontalen Pin: unter 1024px stehen die Projekte
  // untereinander und decken sich beim Hereinscrollen einzeln auf.
  useStackReveal(trackRef, { panel: ".work-panel", media: "rise" });

  return (
    // Cream lives on the section, not on .work-pin — GSAP's generated pin-spacer
    // does not inherit the pinned element's background.
    //
    // z-10 + Radius + Schlagschatten nach oben: die Section schiebt sich beim
    // Scrollen über den klebenden Hero. Ohne die drei läge dort nur eine harte
    // Kante statt eines Panels, das sich sichtbar davorlegt. Der Schatten fällt
    // auf den Hero, weil die Section später im DOM steht und damit darüber malt.
    <section
      id="work"
      ref={sectionRef}
      className="relative z-10 overflow-x-clip rounded-t-[1.5rem] bg-[#f2ede4] shadow-[0_-40px_80px_-24px_rgba(0,0,0,0.8)] md:rounded-t-[2rem]"
    >
      <div ref={pinRef} className="work-pin overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* w-full is load-bearing: container-custom's auto margins would otherwise
            stop this flex item from stretching and shrink-wrap it to its content */}
        <header className="work-container w-full shrink-0 pt-[clamp(4rem,8vh,5.5rem)] pb-[clamp(0.875rem,2vh,1.375rem)]">
          <div className="flex items-end justify-between gap-8">
            <div className="min-w-0">
              <span className="mb-3 block font-mono text-caption uppercase tracking-[0.2em] text-[#6a6a6a]">
                03 - Was ich bisher gemacht habe
              </span>
              {/* start well before the pin engages — inside the pinned range a
                  play-once trigger would never fire and the headline would stay hidden */}
              <TextReveal
                as="h2"
                variant="words"
                start="top 95%"
                className="font-display text-[clamp(1.9rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-tighter text-[#0a0a0a]"
              >
                PROJEKTE
              </TextReveal>
            </div>

            <div
              className="hidden shrink-0 items-baseline gap-2 lg:flex"
              aria-hidden
            >
              <span
                ref={counterRef}
                className="pin-counter inline-block h-[1em] overflow-hidden font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-bold leading-none tracking-tighter tabular-nums text-[#0a0a0a]"
              >
                <span data-counter-digit className="block h-[1em]">
                  01
                </span>
              </span>
              <span className="font-mono text-caption tracking-[0.2em] text-[#6a6a6a]">
                / {TOTAL}
              </span>
            </div>
          </div>
        </header>

        <div ref={trackRef} className="work-track min-w-0 will-change-transform">
          {PROJECTS.map((project, index) => (
            <ProjectPanel
              key={project.id}
              project={project}
              index={index}
              total={PROJECTS.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
