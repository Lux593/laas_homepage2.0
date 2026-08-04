"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import { useLightSection } from "@/hooks/useLightSection";
import { SERVICES, SERVICES_INTRO } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

const TOTAL = String(SERVICES.length).padStart(2, "0");

const THRESHOLDS = [
  { start: 0, end: 1 / 3 },
  { start: 1 / 3, end: 2 / 3 },
  { start: 2 / 3, end: 1 },
] as const;

function barHeight(progress: number, start: number, end: number) {
  if (progress < start) return 0;
  if (progress > end) return 100;
  return ((progress - start) / (end - start)) * 100;
}

/**
 * Leistungen — Editorial-Split (Text only) + Scroll-Reveal-Content-A-Motion:
 * sticky Stage, wachsende Progress-Linien, aktive Themen beim Scrollen.
 * Progress über Refs/DOM (kein setState → TextReveal bleibt stabil).
 */
export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLightSection(sectionRef);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bars = stage.querySelectorAll<HTMLElement>("[data-service-bar]");
    const items = stage.querySelectorAll<HTMLElement>("[data-service-item]");
    const marks = stage.querySelectorAll<HTMLElement>("[data-service-mark]");
    let lastIndex = -1;

    const apply = (progress: number) => {
      const activeIndex = progress < 1 / 3 ? 0 : progress < 2 / 3 ? 1 : 2;

      bars.forEach((bar, index) => {
        const { start, end } = THRESHOLDS[index]!;
        const fill = barHeight(progress, start, end);
        bar.style.height = `${Math.max(
          fill,
          index === 0 && progress === 0 ? 8 : 0
        )}%`;
      });

      items.forEach((item, index) => {
        const on = index === activeIndex;
        item.style.opacity = on ? "1" : "0.35";
        const body = item.querySelector<HTMLElement>("[data-service-body]");
        if (body) body.style.opacity = on ? "1" : "0.45";
      });

      marks.forEach((mark, index) => {
        const on = index === activeIndex;
        mark.style.borderColor = on
          ? "rgba(10,10,10,0.55)"
          : "rgba(10,10,10,0.18)";
        mark.style.backgroundColor = on ? "rgba(10,10,10,0.06)" : "transparent";
      });

      if (activeIndex !== lastIndex) {
        lastIndex = activeIndex;
        if (counterRef.current) {
          counterRef.current.textContent = String(activeIndex + 1).padStart(
            2,
            "0"
          );
        }
      }
    };

    if (reduce) {
      apply(1);
      return;
    }

    apply(0);

    const st = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.45,
      onUpdate: (self) => apply(self.progress),
      invalidateOnRefresh: true,
      refreshPriority: 1,
    });

    return () => st.kill();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative z-10 overflow-x-clip rounded-t-[1.5rem] bg-[#f2ede4] text-[#0a0a0a] shadow-[0_-40px_80px_-24px_rgba(0,0,0,0.8)] md:rounded-t-[2rem]"
    >
      <div ref={trackRef} className="relative flex w-full">
        <div className="sticky top-0 z-20 flex h-[100svh] w-full flex-col">
          <header className="work-container w-full shrink-0 pt-[clamp(4rem,8vh,5.5rem)] pb-[clamp(0.875rem,2vh,1.375rem)]">
            <div className="flex items-end justify-between gap-8">
              <div className="min-w-0">
                <span className="mb-3 block font-mono text-caption uppercase tracking-[0.2em] text-[#6a6a6a]">
                  {SERVICES_INTRO.eyebrow}
                </span>
                <TextReveal
                  as="h2"
                  variant="words"
                  start="top 95%"
                  className="font-display text-[clamp(1.9rem,4vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tighter text-[#0a0a0a]"
                >
                  {SERVICES_INTRO.headline}
                </TextReveal>
              </div>

              <div
                className="hidden shrink-0 items-baseline gap-2 lg:flex"
                aria-hidden
              >
                <span
                  ref={counterRef}
                  className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-bold leading-none tracking-tighter tabular-nums text-[#0a0a0a]"
                >
                  01
                </span>
                <span className="font-mono text-caption tracking-[0.2em] text-[#6a6a6a]">
                  / {TOTAL}
                </span>
              </div>
            </div>
          </header>

          <div
            ref={stageRef}
            className="work-container grid min-h-0 w-full flex-1 grid-cols-1 items-center pb-10 lg:grid-cols-2"
          >
            {/* Links: Statement an der Mittelachse */}
            <div className="hidden h-full flex-col justify-center border-[#0a0a0a]/12 lg:flex lg:border-r lg:pr-[clamp(2rem,4vw,3.5rem)]">
              <div className="ml-auto max-w-[28ch] text-right">
                <p className="text-balance font-serif text-[clamp(1.75rem,3.2vw,2.85rem)] leading-[1.15] tracking-[-0.02em] text-[#0a0a0a]">
                  {SERVICES_INTRO.statement}
                </p>
                <span
                  aria-hidden
                  className="mt-6 ml-auto block h-px w-12 bg-[#0a0a0a]/35"
                />
                <p className="mt-6 ml-auto max-w-[28ch] font-body text-body-md leading-relaxed text-[#5f574e]">
                  {SERVICES_INTRO.support}
                </p>
              </div>
            </div>

            {/* Rechts: Themen mit Scroll-Progress */}
            <div className="flex h-full flex-col justify-center gap-[clamp(1.75rem,4.5vh,2.75rem)] lg:pl-[clamp(2rem,4vw,3.5rem)]">
              {/* Mobile: Statement über den Punkten */}
              <div className="mb-2 max-w-[34ch] lg:hidden">
                <p className="text-balance font-serif text-[clamp(1.5rem,5vw,2rem)] leading-[1.15] tracking-[-0.02em] text-[#0a0a0a]">
                  {SERVICES_INTRO.statement}
                </p>
                <span
                  aria-hidden
                  className="mt-4 block h-px w-12 bg-[#0a0a0a]/35"
                />
                <p className="mt-4 font-body text-body-sm leading-relaxed text-[#5f574e]">
                  {SERVICES_INTRO.support}
                </p>
              </div>

              {SERVICES.map((service, index) => (
                <div
                  key={service.id}
                  data-service-item
                  className="flex gap-5 transition-opacity duration-300 md:gap-6"
                  style={{ opacity: index === 0 ? 1 : 0.35 }}
                >
                  <div className="relative flex shrink-0 flex-col items-center">
                    <span
                      data-service-mark
                      aria-hidden
                      className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#0a0a0a]/20 font-display text-body-sm font-bold tracking-tight text-[#0a0a0a] transition-[border-color,background-color] duration-300 md:h-12 md:w-12"
                      style={{
                        backgroundColor:
                          index === 0 ? "rgba(10,10,10,0.06)" : "transparent",
                        borderColor:
                          index === 0
                            ? "rgba(10,10,10,0.55)"
                            : "rgba(10,10,10,0.18)",
                      }}
                    >
                      {service.mark}
                    </span>
                    {/* Progress-Linie unter dem Kreis — Scroll-Kapitel */}
                    <div className="relative mt-2 w-px flex-1 min-h-[2.5rem]">
                      <div className="absolute inset-0 bg-[#0a0a0a]/12" />
                      <div
                        data-service-bar
                        className="absolute top-0 left-0 w-px bg-[#0a0a0a]"
                        style={{ height: index === 0 ? "8%" : "0%" }}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 pt-2">
                    <h3 className="font-display text-[clamp(1.15rem,1.8vw,1.45rem)] font-bold uppercase leading-[1.1] tracking-tight text-[#0a0a0a]">
                      {service.title}
                    </h3>
                    <p
                      data-service-body
                      className="mt-2 max-w-[40ch] font-body text-body-sm leading-relaxed text-[#5f574e] transition-opacity duration-300 md:text-body-md"
                      style={{ opacity: index === 0 ? 1 : 0.45 }}
                    >
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none h-[300vh] w-px shrink-0" aria-hidden />
      </div>
    </section>
  );
}
