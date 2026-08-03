"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  className?: string;
  variant?: "words" | "chars" | "lines";
  stagger?: number;
  start?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  fromVars?: gsap.TweenVars;
}

export default function TextReveal({
  children,
  className,
  variant = "words",
  stagger = 0.03,
  start = "top 85%",
  as: Tag = "p",
  fromVars = {},
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const text = children;

    let elements: string[];
    if (variant === "chars") {
      elements = text.split("");
    } else if (variant === "words") {
      elements = text.split(" ");
    } else {
      elements = [text];
    }

    container.innerHTML = elements
      .map((el) => {
        const content = variant === "words" ? `${el}&nbsp;` : el;
        return `<span class="inline-block overflow-hidden"><span class="reveal-element inline-block" style="display:inline-block">${content}</span></span>`;
      })
      .join("");

    const revealElements = container.querySelectorAll(".reveal-element");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start,
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        revealElements,
        {
          y: "110%",
          rotateX: -80,
          opacity: 0,
          ...fromVars,
        },
        {
          y: "0%",
          rotateX: 0,
          opacity: 1,
          duration: 1,
          ease: "expo.out",
          stagger,
        }
      );
    }, container);

    return () => {
      ctx.revert();
    };
  }, [children, variant, stagger, start, fromVars]);

  return (
    <Tag
      ref={containerRef as React.Ref<never>}
      className={cn("overflow-hidden", className)}
      style={{ perspective: "1000px" }}
    >
      {children}
    </Tag>
  );
}
