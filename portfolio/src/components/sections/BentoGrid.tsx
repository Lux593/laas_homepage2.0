"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import { EXPERTISE, TECH_STACK } from "@/lib/constants";

const WorkflowScene = dynamic(() => import("@/components/ui/WorkflowScene"), {
  ssr: false,
  loading: () => <div className="w-full h-44 md:h-52" />,
});

gsap.registerPlugin(ScrollTrigger);

function BentoCard({
  children,
  className = "",
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
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          delay: index * 0.1,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl border border-white/[0.04] bg-white/[0.02] p-7 md:p-9 overflow-hidden opacity-0 ${className}`}
    >
      {children}
    </div>
  );
}

export default function BentoGrid() {
  return (
    <section id="expertise" className="relative py-section">
      <div className="container-custom">
        {/* Section Header */}
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

        {/* Bento Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Card — App-Entwicklung (full width) */}
          <BentoCard className="md:col-span-2" index={0}>
            <span className="text-caption font-mono uppercase tracking-widest text-accent-primary/60 block mb-8">
              {EXPERTISE[0].title}
            </span>
            <h3 className="text-[clamp(1.75rem,4vw,3rem)] font-display font-bold tracking-tight leading-[1.1] mb-5">
              Deine Idee als fertige App
            </h3>
            <p className="text-body-sm text-text-secondary leading-relaxed max-w-xl mb-10">
              {EXPERTISE[0].description}
            </p>

            {/* Code snippet */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] font-mono text-caption text-text-muted inline-block">
              <span className="text-accent-primary">const</span>{" "}
              <span className="text-text-primary">app</span> ={" "}
              <span className="text-accent-secondary">{"{"}</span>{" "}
              ui: <span className="text-accent-warm">&apos;pixel-perfect&apos;</span>,
              stack: <span className="text-accent-warm">&apos;React + Native&apos;</span>,
              deploy: <span className="text-accent-warm">&apos;überall&apos;</span>{" "}
              <span className="text-accent-secondary">{"}"}</span>;
            </div>
          </BentoCard>

          {/* Automatisierung Card */}
          <BentoCard index={1}>
            <span className="text-caption font-mono uppercase tracking-widest text-accent-secondary/60 block mb-6">
              {EXPERTISE[1].title}
            </span>
            <h3 className="text-body-lg md:text-[1.4rem] font-display font-bold tracking-tight leading-tight mb-3">
              Weniger Handarbeit, mehr Ergebnis
            </h3>
            <p className="text-body-sm text-text-secondary leading-relaxed mb-8">
              {EXPERTISE[1].description}
            </p>

            {/* 3D Workflow Visualization */}
            <div className="mt-auto pt-2 -mx-4 md:-mx-6">
              <WorkflowScene />
            </div>
          </BentoCard>

          {/* Tools Card */}
          <BentoCard index={2}>
            <span className="text-caption font-mono uppercase tracking-widest text-accent-primary/60 block mb-6">
              Tech Stack
            </span>
            <h3 className="text-body-lg md:text-[1.4rem] font-display font-bold tracking-tight leading-tight mb-8">
              Tools die ich mag
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {TECH_STACK.map((tech) => (
                <a
                  key={tech.name}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={tech.name}
                  className="group/icon flex items-center justify-center aspect-square rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-accent-primary/20 hover:bg-accent-primary/5 transition-all duration-500 cursor-pointer"
                >
                  <Image
                    src={tech.icon}
                    alt={tech.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 brightness-0 invert opacity-40 group-hover/icon:opacity-90 transition-opacity duration-500"
                  />
                </a>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
