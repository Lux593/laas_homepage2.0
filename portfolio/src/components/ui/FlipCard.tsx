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
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    <div className="perspective-2000 mb-20 md:mb-32">
      <div
        ref={cardRef}
        className="preserve-3d relative group rounded-3xl overflow-hidden border border-glass-border bg-glass-bg"
        style={{ willChange: "transform, opacity" }}
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
              <Image
                src={project.logo}
                alt={`${project.title} Logo`}
                width={600}
                height={300}
                className="max-h-60 md:max-h-84 w-auto object-contain opacity-80 drop-shadow-lg"
              />
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
    </div>
  );
}
