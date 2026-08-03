"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  childSelector?: string;
  start?: string;
}

export default function StaggerReveal({
  children,
  className,
  childSelector = ":scope > *",
  start = "top 80%",
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const elements = ref.current.querySelectorAll(childSelector);

    gsap.fromTo(
      elements,
      {
        y: 80,
        opacity: 0,
        rotateX: -15,
        transformPerspective: 1000,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: "play none none none",
        },
      }
    );
  }, [childSelector, start]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
