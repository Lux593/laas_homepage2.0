"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollHighlight from "@/components/ui/ScrollHighlight";
import { MANIFESTO_TEXT } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { y: 80, opacity: 0, rotate: -4, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          rotate: 3,
          scale: 1,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.to(imageRef.current, {
        y: -60,
        rotate: -2,
        ease: "none",
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, imageRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="relative">
      <div className="container-custom pt-section">
        <span className="text-caption font-mono uppercase tracking-widest text-text-muted">
          03 — Manifest
        </span>
      </div>

      <div className="relative">
        {/* Floating image overlapping the text */}
        <div
          ref={imageRef}
          className="absolute right-[8%] md:right-[12%] top-8 md:top-12 z-20 opacity-0 pointer-events-none"
        >
          <div className="relative w-36 md:w-52 rounded-2xl overflow-hidden border border-glass-border/50 shadow-2xl shadow-black/50"
            style={{ transform: "rotate(3deg)" }}
          >
            <Image
              src="/personal_pic.jpg"
              alt="Luca Arnoldi"
              width={208}
              height={280}
              className="w-full h-auto object-cover grayscale-[30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/20 to-transparent" />
          </div>
        </div>

        <ScrollHighlight text={MANIFESTO_TEXT} className="font-body" />
      </div>
    </section>
  );
}
