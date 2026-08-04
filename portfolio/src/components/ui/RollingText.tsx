"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface RollingTextProps {
  words: string[];
  interval?: number;
  className?: string;
  charClassName?: string;
}

const STAGGER = 0.025;
const BLUR = 4;
const ROLL_OUT_DURATION = 0.4;
const ROLL_IN_DURATION = 0.5;

export default function RollingText({
  words,
  interval = 3000,
  className = "",
  charClassName = "",
}: RollingTextProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const animating = useRef(false);
  const needsRollIn = useRef(false);

  // Position new chars below and roll them in — runs before paint to prevent flash
  useIsomorphicLayoutEffect(() => {
    if (!needsRollIn.current || !containerRef.current) return;
    needsRollIn.current = false;

    const chars =
      containerRef.current.querySelectorAll<HTMLElement>(".roll-char");

    gsap.set(chars, { yPercent: 110, filter: `blur(${BLUR}px)` });

    gsap.to(chars, {
      yPercent: 0,
      filter: "blur(0px)",
      duration: ROLL_IN_DURATION,
      stagger: STAGGER,
      ease: "power3.out",
      onComplete: () => {
        animating.current = false;
      },
    });
  }, [wordIndex]);

  // Cycle timer — triggers roll-out
  useEffect(() => {
    const id = setInterval(() => {
      if (animating.current || !containerRef.current) return;
      animating.current = true;

      const chars =
        containerRef.current.querySelectorAll<HTMLElement>(".roll-char");

      gsap.to(chars, {
        yPercent: -110,
        filter: `blur(${BLUR}px)`,
        duration: ROLL_OUT_DURATION,
        stagger: STAGGER,
        ease: "power3.in",
        onComplete: () => {
          needsRollIn.current = true;
          setWordIndex((prev) => (prev + 1) % words.length);
        },
      });
    }, interval);

    return () => clearInterval(id);
  }, [words, interval]);

  return (
    <span ref={containerRef} className={`inline-flex ${className}`}>
      {words[wordIndex].split("").map((char, i) => (
        <span
          key={`${wordIndex}-${i}`}
          className="overflow-hidden inline-block"
          style={{ height: "1.4em" }}
        >
          <span
            className={`roll-char inline-block ${charClassName}`}
            style={{ lineHeight: "1.4" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </span>
  );
}
