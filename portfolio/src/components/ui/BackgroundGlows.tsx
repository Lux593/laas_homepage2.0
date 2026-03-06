"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BackgroundGlows() {
  const glow1Ref = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);
  const glow3Ref = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glows = [glow1Ref.current, glow2Ref.current, glow3Ref.current].filter(Boolean);

    const ctx = gsap.context(() => {
      glows.forEach((glow, i) => {
        gsap.to(glow, {
          x: `random(-100, 100)`,
          y: `random(-80, 80)`,
          duration: 8 + i * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      const sections = document.querySelectorAll("section[id]");

      const colorSchemes = [
        { primary: "#999999", secondary: "#aaaaaa" },
        { primary: "#aaaaaa", secondary: "#888888" },
        { primary: "#999999", secondary: "#bbbbbb" },
        { primary: "#888888", secondary: "#aaaaaa" },
        { primary: "#999999", secondary: "#aaaaaa" },
      ];

      sections.forEach((section, i) => {
        const colors = colorSchemes[i] || colorSchemes[0];

        ScrollTrigger.create({
          trigger: section,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => {
            if (glow1Ref.current) {
              gsap.to(glow1Ref.current, {
                backgroundColor: colors.primary,
                duration: 1.5,
                ease: "sine.inOut",
              });
            }
            if (glow2Ref.current) {
              gsap.to(glow2Ref.current, {
                backgroundColor: colors.secondary,
                duration: 2,
                ease: "sine.inOut",
              });
            }
          },
          onEnterBack: () => {
            if (glow1Ref.current) {
              gsap.to(glow1Ref.current, {
                backgroundColor: colors.primary,
                duration: 1.5,
                ease: "sine.inOut",
              });
            }
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      <div
        ref={glow1Ref}
        className="absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full opacity-[0.03]"
        style={{
          backgroundColor: "#999999",
          filter: "blur(180px)",
          top: "10%",
          left: "15%",
          willChange: "transform, background-color",
        }}
      />
      <div
        ref={glow2Ref}
        className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full opacity-[0.02]"
        style={{
          backgroundColor: "#aaaaaa",
          filter: "blur(160px)",
          top: "50%",
          right: "10%",
          willChange: "transform, background-color",
        }}
      />
      <div
        ref={glow3Ref}
        className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full opacity-[0.02]"
        style={{
          backgroundColor: "#888888",
          filter: "blur(160px)",
          bottom: "20%",
          left: "40%",
          willChange: "transform, background-color",
        }}
      />
    </div>
  );
}
