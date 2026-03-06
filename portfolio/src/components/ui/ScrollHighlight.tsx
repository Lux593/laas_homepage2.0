"use client";

import { useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface ScrollHighlightProps {
  text: string;
  className?: string;
}

export default function ScrollHighlight({ text, className }: ScrollHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const words = useMemo(() => text.split(" "), [text]);

  useEffect(() => {
    if (!containerRef.current || !stickyRef.current) return;

    const wordSpans = stickyRef.current.querySelectorAll(".highlight-word");

    gsap.set(wordSpans, { opacity: 0.15, color: "var(--color-text-muted)" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        pin: false,
      },
    });

    wordSpans.forEach((word, i) => {
      const startProgress = i / wordSpans.length;
      const endProgress = (i + 1) / wordSpans.length;

      tl.to(
        word,
        {
          opacity: 1,
          color: "var(--color-text-primary)",
          duration: endProgress - startProgress,
          ease: "none",
        },
        startProgress
      );
    });

    return () => {
      tl.kill();
    };
  }, [words]);

  return (
    <div ref={containerRef} className="relative" style={{ height: "250vh" }}>
      <div
        ref={stickyRef}
        className="sticky top-10 h-screen flex items-center justify-start"
      >
        <p
          className={cn(
            "text-display-sm md:text-display-md font-body leading-[1.3] max-w-5xl text-left",
            className
          )}
        >
          {words.map((word, i) => (
            <span key={i} className="highlight-word inline-block mr-[0.3em] transition-colors">
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
