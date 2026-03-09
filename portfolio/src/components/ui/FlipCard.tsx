"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/lib/constants";
import { PROJECTS } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

interface FlipCardProps {
  project: Project;
  index?: number;
}

export default function FlipCard({ project }: FlipCardProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pinRef.current || !innerRef.current) return;

    const ctx = gsap.context(() => {
      // Pin the card and flip it on scroll
      gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top 15%",
          end: "+=250%",
          pin: true,
          scrub: 1.5,
        },
      })
        // Hold front visible for a moment
        .to(innerRef.current!, { rotateX: 0, duration: 0.5 })
        // Flip to back
        .to(innerRef.current!, {
          rotateX: 180,
          duration: 1,
          ease: "power2.inOut",
        })
        // Hold back visible
        .to(innerRef.current!, { rotateX: 180, duration: 0.6 });
    }, pinRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pinRef} className="mb-20 md:mb-32" style={{ perspective: "2000px" }}>
      <div
        ref={innerRef}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
      >
        {/* ===== FRONT ===== */}
        <div
          className="relative rounded-3xl overflow-hidden border border-glass-border bg-glass-bg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="relative aspect-[4/3] md:aspect-[16/8] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-primary/90 z-10" />

            <div
              className="absolute -inset-20 opacity-20 blur-[100px] z-0"
              style={{ backgroundColor: project.color }}
            />

            <div
              className="w-full h-full relative"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 50%, ${project.color}22 0%, transparent 50%),
                  radial-gradient(ellipse at 70% 50%, ${project.color}11 0%, transparent 50%),
                  linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)
                `,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-[15rem] md:text-[20rem] font-display font-black leading-none tracking-tighter select-none"
                  style={{ color: `${project.color}08` }}
                >
                  {String(PROJECTS.indexOf(project) + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="relative">
                  <div
                    className="absolute -inset-8 rounded-full opacity-0 blur-[40px]"
                    style={{ backgroundColor: project.color }}
                  />
                  <Image
                    src={project.logo}
                    alt={`${project.title} Logo`}
                    width={600}
                    height={300}
                    className="relative max-h-60 md:max-h-84 w-auto object-contain opacity-80 drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Front content */}
          <div className="relative z-20 p-6 md:p-10 -mt-16">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-caption font-mono uppercase tracking-widest text-text-muted">
                {project.category}
              </span>
              <span className="w-8 h-[1px] bg-text-muted/30" />
              <span className="text-caption font-mono text-text-muted">{project.year}</span>
            </div>

            <h3 className="text-body-lg md:text-display-sm font-display font-bold tracking-tighter mb-2">
              {project.title}
            </h3>

            <p className="text-body-md font-serif italic text-text-secondary mb-6">
              {project.subtitle}
            </p>

            <p className="text-body-sm text-text-secondary max-w-2xl mb-8 leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>

        {/* ===== BACK ===== */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden border border-glass-border bg-glass-bg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateX(-180deg)",
          }}
        >
          <div className="h-full flex flex-col p-6 md:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-body-lg md:text-display-sm font-display font-bold tracking-tighter">
                {project.title}
              </h3>
              <span
                className="text-caption font-mono uppercase tracking-widest px-3 py-1 rounded-full border shrink-0"
                style={{ borderColor: project.color, color: project.color }}
              >
                {project.year}
              </span>
            </div>

            {/* Details description */}
            <p className="text-body-sm text-text-secondary leading-relaxed mb-6">
              {project.details}
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {project.features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl p-4 border border-white/5 bg-white/[0.02]"
                >
                  <div
                    className="w-8 h-[2px] mb-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <h4 className="text-body-sm font-display font-semibold mb-1.5 text-text-primary">
                    {feature.title}
                  </h4>
                  <p className="text-caption text-text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Tech stack */}
            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="text-caption font-mono px-3 py-1.5 rounded-full bg-white/5 text-text-secondary border border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
