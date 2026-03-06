"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SectionDivider() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: lineRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }, lineRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="container-custom py-4">
      <div
        ref={lineRef}
        className="h-[1px] w-full"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-text-muted) 20%, var(--color-text-muted) 80%, transparent)",
          opacity: 0.15,
        }}
      />
    </div>
  );
}
