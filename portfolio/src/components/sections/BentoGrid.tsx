"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import { EXPERTISE, TECH_STACK } from "@/lib/constants";
import { cn } from "@/lib/utils";
import CardSpotlight from "@/components/ui/CardSpotlight";

gsap.registerPlugin(ScrollTrigger);

function BentoCard({
  children,
  className,
  index,
}: {
  children: React.ReactNode;
  className?: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        {
          y: 100,
          opacity: 0,
          scale: 0.9,
          rotateX: -10,
          transformPerspective: 1500,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          duration: 1,
          ease: "expo.out",
          delay: index * 0.1,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [index]);

  return (
    <CardSpotlight className={cn("rounded-3xl h-full", className)}>
      <div
        ref={ref}
        className="relative rounded-3xl border border-glass-border bg-glass-bg p-8 md:p-10 overflow-hidden group hover:border-white/10 transition-all duration-700 ease-out-expo h-full"
      >
        <div className="relative z-10 h-full flex flex-col">{children}</div>
      </div>
    </CardSpotlight>
  );
}

export default function BentoGrid() {
  return (
    <section id="expertise" className="relative py-section">
      <div className="container-custom">
        <div className="mb-16 md:mb-24">
          <span className="text-caption font-mono uppercase tracking-widest text-text-muted block mb-4">
            02 — Expertise
          </span>
          <TextReveal
            as="h2"
            variant="words"
            className="text-display-sm md:text-display-md font-display font-bold tracking-tighter"
          >
            Was ich mitbringe
          </TextReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto items-stretch">
          {/* App-Entwicklung */}
          <BentoCard className="md:col-span-2 lg:col-span-2" index={0}>
            <span className="text-caption font-mono uppercase tracking-widest text-accent-primary mb-4 block">
              {EXPERTISE[0].title}
            </span>
            <p className="text-display-sm font-display font-bold tracking-tight mb-4">
              Deine Idee als fertige App
            </p>
            <p className="text-body-sm text-text-secondary max-w-lg leading-relaxed">
              {EXPERTISE[0].description}
            </p>

            <div className="mt-8 p-4 rounded-xl bg-bg-primary/50 border border-glass-border font-mono text-caption text-text-muted">
              <span className="text-accent-primary">const</span>{" "}
              <span className="text-text-primary">app</span> ={" "}
              <span className="text-accent-secondary">{"{"}</span>{" "}
              ui: <span className="text-accent-warm">&apos;pixel-perfect&apos;</span>,
              stack: <span className="text-accent-warm">&apos;React + Native&apos;</span>,
              deploy: <span className="text-accent-warm">&apos;überall&apos;</span>{" "}
              <span className="text-accent-secondary">{"}"}</span>;
            </div>
          </BentoCard>

          {/* Automatisierung & Workflows */}
          <BentoCard className="lg:col-span-1" index={1}>
            <span className="text-caption font-mono uppercase tracking-widest text-accent-secondary mb-4 block">
              {EXPERTISE[1].title}
            </span>
            <p className="text-body-lg font-display font-bold tracking-tight mb-3">
              Weniger Handarbeit, mehr Ergebnis
            </p>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              {EXPERTISE[1].description}
            </p>

            {/* Workflow Pipeline — Fortschritt wandert von Label zu Label */}
            <div className="mt-auto pt-6 flex items-center">
              {["Daten", "Automation", "Action"].map((label, i) => (
                <div key={label} className="flex items-center">
                  {/* Node */}
                  <div
                    className="px-2.5 py-1 rounded-md border border-accent-secondary/12 transition-all"
                    style={{
                      animation: "nodeActivate 4.5s ease infinite",
                      animationDelay: `${i * 1.5}s`,
                    }}
                  >
                    <span
                      className="text-[10px] font-mono transition-all"
                      style={{
                        animation: "nodeTextActivate 4.5s ease infinite",
                        animationDelay: `${i * 1.5}s`,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {/* Verbindungslinie mit Fortschritt */}
                  {i < 2 && (
                    <div className="w-8 h-[2px] bg-accent-secondary/8 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-secondary/50 rounded-full origin-left"
                        style={{
                          animation: "lineFillLR 4.5s ease infinite",
                          animationDelay: `${i * 1.5 + 0.75}s`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Tech Stack */}
          <BentoCard className="md:col-span-2 lg:col-span-3" index={2}>
            <span className="text-caption font-mono uppercase tracking-widest text-text-muted mb-6 block">
              Tech Stack
            </span>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
              {TECH_STACK.map((tech, i) => (
                <span
                  key={tech.name}
                  className="inline-flex items-center gap-2 px-4 py-2 text-body-sm font-mono rounded-full border border-glass-border bg-bg-primary/50 text-text-secondary hover:text-text-primary hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all duration-500 ease-out-expo cursor-default"
                  style={{ transitionDelay: `${i * 20}ms` }}
                >
                  <Image
                    src={tech.icon}
                    alt={tech.name}
                    width={16}
                    height={16}
                    className="w-4 h-4 brightness-0 invert opacity-70"
                  />
                  {tech.name}
                </span>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
