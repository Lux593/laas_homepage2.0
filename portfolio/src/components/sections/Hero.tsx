"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useIsMobile } from "@/hooks/useMediaQuery";


const ROTATING_WORDS = [
  "Web-Apps",
  "Native Apps",
  "KI-Integration",
  "Prozessautomation",
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const rotatingRef = useRef<HTMLSpanElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition(0.08);
  const isMobile = useIsMobile();
  const [wordIndex, setWordIndex] = useState(0);

  // Entry animation
  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.2 });

    if (line1Ref.current) {
      tl.fromTo(
        line1Ref.current,
        { y: 40, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "expo.out" }
      );
    }

    if (line2Ref.current) {
      tl.fromTo(
        line2Ref.current,
        { y: 30, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "expo.out" },
        "-=0.6"
      );
    }

    if (scrollIndicatorRef.current) {
      tl.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
        "-=0.4"
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  // Rotating word animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (rotatingRef.current) {
        gsap.to(rotatingRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
            if (rotatingRef.current) {
              gsap.fromTo(
                rotatingRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
              );
            }
          },
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
      id="hero"
    >
      {/* Background Glows */}
      {!isMobile && (
        <>
          <div
            className="absolute w-[600px] h-[600px] rounded-full bg-accent-primary/10 blur-[150px] pointer-events-none"
            style={{
              transform: `translate3d(${mouse.normalizedX * -15}px, ${mouse.normalizedY * -10}px, 0)`,
              transition: "transform 0.3s ease-out",
              left: "20%",
              top: "20%",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full bg-accent-secondary/8 blur-[120px] pointer-events-none"
            style={{
              transform: `translate3d(${mouse.normalizedX * 10}px, ${mouse.normalizedY * 8}px, 0)`,
              transition: "transform 0.4s ease-out",
              right: "15%",
              bottom: "25%",
            }}
          />
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex justify-center px-[var(--container-padding)]">
        <div
          className="text-left"
          style={{
            transform: isMobile
              ? "none"
              : `translate3d(${mouse.normalizedX * -5}px, ${mouse.normalizedY * -4}px, 0)`,
            transition: "transform 0.2s ease-out",
          }}
        >
          {/* Line 1 */}
          <span
            ref={line1Ref}
            className="block h-[1.15em] text-display-md md:text-display-lg font-display font-bold tracking-tighter leading-[1.1] opacity-0"
          >
            Hey, ich bin Luca.
          </span>

          {/* Line 2 */}
          <div
            ref={line2Ref}
            className="mt-4 opacity-0"
          >
            <span className="block h-[1.15em] text-display-sm md:text-display-md font-display font-light text-text-secondary">
              Ich biete
            </span>
            {/* Line 3 - rotating word */}
            <span
              ref={rotatingRef}
              className="block h-[1.4em] text-display-sm md:text-display-md font-display font-bold tracking-tight text-gradient-accent whitespace-nowrap"
            >
              {ROTATING_WORDS[wordIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0"
      >
        <span className="text-caption font-mono uppercase tracking-widest text-text-muted">
          Scrollen
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-text-muted/50 to-transparent relative overflow-hidden">
          <div className="absolute w-full h-4 bg-accent-primary animate-[scrollDown_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}
