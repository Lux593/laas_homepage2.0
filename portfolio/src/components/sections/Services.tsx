"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import { useLightSection } from "@/hooks/useLightSection";
import { useStackReveal } from "@/hooks/useStackReveal";
import { SERVICES, SERVICES_INTRO, type Service } from "@/lib/constants";
import ServicesLandscape from "@/components/sections/services/ServicesLandscape";
import "./services/services.css";

gsap.registerPlugin(ScrollTrigger);

const TOTAL = String(SERVICES.length).padStart(2, "0");
const CHAPTER = 1 / SERVICES.length;

function titleLines(title: string) {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 2) return [title];
  return [parts[0]!, parts.slice(1).join(" ")];
}

function ServicesHeader({
  counterRef,
}: {
  counterRef?: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <header className="work-container w-full shrink-0 pt-[clamp(4rem,8vh,5.5rem)] pb-[clamp(0.875rem,2vh,1.375rem)]">
      <div className="flex items-end justify-between gap-8">
        <div className="min-w-0">
          <span className="mb-2 block font-mono text-caption uppercase tracking-[0.2em] text-[#6a6a6a] lg:mb-3">
            {SERVICES_INTRO.eyebrow}
          </span>
          <TextReveal
            as="h2"
            variant="words"
            start="top 95%"
            className="font-display text-[clamp(1.75rem,4vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tighter text-[#0a0a0a]"
          >
            {SERVICES_INTRO.headline}
          </TextReveal>
        </div>

        {counterRef ? (
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
        ) : null}
      </div>
    </header>
  );
}

/**
 * Mobile / reduced-motion: volles Kapitel pro Panel, Lookbook-Typografie.
 */
function ServicePanel({
  service,
  index,
  total,
}: {
  service: Service;
  index: number;
  total: number;
}) {
  const lines = titleLines(service.title);

  return (
    <article className="services-panel relative flex flex-col justify-start">
      <div className="work-container w-full">
        <div className="services-panel__inner">
          <div
            data-reveal="copy"
            className="mb-8 flex items-center gap-4"
            aria-hidden
          >
            <span className="font-display text-[clamp(2.5rem,12vw,4rem)] font-bold leading-none tracking-tighter tabular-nums text-[#0a0a0a]/12">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span data-reveal="rule" className="h-px flex-1 bg-[#0a0a0a]/15" />
            <span className="shrink-0 font-mono text-caption tabular-nums tracking-[0.2em] text-[#0a0a0a]/45">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          <header data-reveal="copy">
            <h3 className="services-panel__title font-display font-bold uppercase tracking-tighter text-[#0a0a0a]">
              {lines.map((line) => (
                <span key={line} className="block leading-[0.92]">
                  {line}
                </span>
              ))}
            </h3>
          </header>

          <p
            data-reveal="copy"
            className="mt-7 max-w-[36ch] font-body text-body-md leading-relaxed text-[#5f574e]"
          >
            {service.description}
          </p>
        </div>
      </div>
    </article>
  );
}

/**
 * Leistungen — Lookbook-Theater.
 *
 * Desktop: sticky Bühne, asymmetrisches Split, Riesen-Kapiteltypografie,
 * kontinuierlicher Progress-Scrub, Kapitel-Rail.
 * Mobile: Stack + useStackReveal, gleiche typografische Sprache.
 */
export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLightSection(sectionRef);
  useStackReveal(stackRef, { panel: ".services-panel" });

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const featured = stage.querySelectorAll<HTMLElement>("[data-featured]");
    const chapters = stage.querySelectorAll<HTMLElement>("[data-chapter]");
    let lastIndex = -1;

    const applyActive = (activeIndex: number) => {
      featured.forEach((layer, index) => {
        const on = index === activeIndex;
        layer.classList.toggle("is-active", on);
        layer.setAttribute("aria-hidden", on ? "false" : "true");
      });

      chapters.forEach((chapter, index) => {
        chapter.classList.toggle("is-active", index === activeIndex);
      });

      if (counterRef.current) {
        counterRef.current.textContent = String(activeIndex + 1).padStart(
          2,
          "0"
        );
      }
    };

    const applyScrub = (progress: number) => {
      const activeIndex = Math.min(
        SERVICES.length - 1,
        Math.floor(progress / CHAPTER)
      );

      // Kontinuierlicher Progress — pro Frame, nur Transform.
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.max(progress, 0.02)})`;
      }

      if (activeIndex !== lastIndex) {
        lastIndex = activeIndex;
        applyActive(activeIndex);
      }
    };

    const mm = gsap.matchMedia();

    // MUSS byte-identisch zur @media-Query für .services-pin--desktop bleiben
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        applyScrub(0);

        const st = ScrollTrigger.create({
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.45,
          onUpdate: (self) => applyScrub(self.progress),
          invalidateOnRefresh: true,
          refreshPriority: 1,
        });

        return () => st.kill();
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative z-10 overflow-x-clip rounded-t-[1.5rem] bg-[#f2ede4] text-[#0a0a0a] shadow-[0_-40px_80px_-24px_rgba(0,0,0,0.8)] md:rounded-t-[2rem]"
    >
      <div ref={trackRef} className="services-pin--desktop relative w-full">
        <div className="sticky top-0 z-20 h-[100svh] w-full [backface-visibility:hidden] [transform:translateZ(0)]">
          <div className="flex h-full w-full flex-col overflow-hidden">
            <ServicesHeader counterRef={counterRef} />

            <div ref={stageRef} className="services-stage work-container">
              {/* Links: dominante Landschaft */}
              <div className="services-landscape-slot">
                <ServicesLandscape className="services-landscape--desktop" />
              </div>

              {/* Rechts: Lookbook-Kapitel */}
              <div className="services-lookbook">
                <div className="services-featured">
                  {SERVICES.map((service, index) => {
                    const lines = titleLines(service.title);
                    return (
                      <div
                        key={service.id}
                        data-featured
                        data-index={index}
                        className={`services-featured__layer${index === 0 ? " is-active" : ""}`}
                        aria-hidden={index !== 0}
                      >
                        <h3 className="services-featured__title font-display font-bold uppercase tracking-tighter text-[#0a0a0a]">
                          {lines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </h3>
                        <p className="services-featured__body font-body text-[#5f574e]">
                          {service.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="services-rail">
                  <div className="services-rail__track" aria-hidden>
                    <div
                      ref={progressRef}
                      className="services-rail__fill"
                      style={{ transform: "scaleX(0.02)" }}
                    />
                  </div>

                  <nav className="services-chapters" aria-label="Leistungen">
                    {SERVICES.map((service, index) => (
                      <div
                        key={service.id}
                        data-chapter
                        data-index={index}
                        className={`services-chapter${index === 0 ? " is-active" : ""}`}
                      >
                        <span className="services-chapter__mark font-mono tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="services-chapter__label font-display font-bold uppercase tracking-tight">
                          {service.title}
                        </span>
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none h-[300vh] w-px shrink-0"
          aria-hidden
        />
      </div>

      <div ref={stackRef} className="services-stack">
        <ServicesHeader />

        <div className="mt-[clamp(1.25rem,3vh,2.5rem)] w-full">
          <ServicesLandscape className="services-landscape--stack" />
        </div>

        <div className="services-track">
          {SERVICES.map((service, index) => (
            <ServicePanel
              key={service.id}
              service={service}
              index={index}
              total={SERVICES.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
