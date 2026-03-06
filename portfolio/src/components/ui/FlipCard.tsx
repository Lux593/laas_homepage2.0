"use client";

import { useRef, useEffect, useState } from "react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          end: "top 55%",
          scrub: 1,
        },
      });

      gsap.set(card, {
        rotateX: 35,
        scale: 0.85,
        opacity: 0.3,
        transformPerspective: 2000,
        transformOrigin: "center bottom",
      });

      tl.to(card, {
        rotateX: 0,
        scale: 1,
        opacity: 1,
        ease: "none",
      });

      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 60%",
            toggleActions: "play none none none",
          },
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="mb-20 md:mb-32" style={{ perspective: "2000px" }}>
      <div
        ref={cardRef}
        className="relative group cursor-pointer"
        style={{ willChange: "transform, opacity" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ===== FRONT FACE ===== */}
          <div
            className="relative rounded-3xl overflow-hidden border border-glass-border bg-glass-bg"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Project image placeholder */}
            <div className="relative aspect-[16/10] md:aspect-[16/8] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-primary/90 z-10" />

              <div
                className="absolute -inset-20 opacity-20 blur-[100px] z-0 transition-opacity duration-700 group-hover:opacity-40"
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
                  <div className="relative group/logo">
                    <div
                      className="absolute -inset-8 rounded-full opacity-0 blur-[40px] transition-opacity duration-500 group-hover/logo:opacity-50"
                      style={{ backgroundColor: project.color }}
                    />
                    <Image
                      src={project.logo}
                      alt={`${project.title} Logo`}
                      width={600}
                      height={300}
                      className="relative max-h-60 md:max-h-84 w-auto object-contain opacity-80 drop-shadow-lg transition-opacity duration-500 group-hover/logo:opacity-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div ref={contentRef} className="relative z-20 p-6 md:p-10 -mt-16">
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

          {/* ===== BACK FACE ===== */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden border border-glass-border bg-glass-bg"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="h-full flex flex-col p-8 md:p-12">
              {/* Back header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-body-lg md:text-display-sm font-display font-bold tracking-tighter">
                  {project.title}
                </h3>
                <span
                  className="text-caption font-mono uppercase tracking-widest px-3 py-1 rounded-full border"
                  style={{ borderColor: project.color, color: project.color }}
                >
                  {project.year}
                </span>
              </div>

              {/* Project image */}
              <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden mb-8">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(ellipse at 50% 50%, ${project.color}18 0%, transparent 70%),
                      linear-gradient(135deg, #0a0a0a 0%, #151515 100%)
                    `,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <Image
                    src={project.logo}
                    alt={`${project.title} Logo`}
                    width={300}
                    height={150}
                    className="max-h-32 w-auto object-contain opacity-60"
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-body-sm text-text-secondary leading-relaxed mb-6">
                {project.description}
              </p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-caption font-mono px-3 py-1.5 rounded-full bg-white/5 text-text-secondary border border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Flip-back hint */}
              <p className="text-caption font-mono text-text-muted/40 text-center mt-6">
                Klicken zum Zurückdrehen
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
