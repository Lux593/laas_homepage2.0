"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HorizontalScrollProps {
  children: React.ReactNode;
}

export default function HorizontalScroll({ children }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !scrollRef.current) return;

    const scrollElement = scrollRef.current;
    const totalWidth = scrollElement.scrollWidth - window.innerWidth;

    const tl = gsap.to(scrollElement, {
      x: -totalWidth,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: () => `+=${totalWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="overflow-hidden">
      <div ref={scrollRef} className="flex gap-8 will-change-transform">
        {children}
      </div>
    </div>
  );
}
