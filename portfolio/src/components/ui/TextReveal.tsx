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
  /**
   * Bindet die Enthüllung an den Scroll, statt sie einmalig abzuspielen.
   *
   * Ohne diesen Wert bleibt es beim `toggleActions: "play none none none"` von
   * vorher — das ist der Ruhezustand aller bestehenden Aufrufe und darf sich
   * nicht ändern.
   *
   * Wozu: auf dem Telefon fiel auf, dass die Kopfzeile der Leistungen 1002ms
   * NACH dem Finger noch auf der Uhr weiterlief (duration 1, expo.out) und
   * rückwärts überhaupt nicht mehr reagierte, weil `play none none none` nur
   * das Hinspielen kennt. Gemessen im Flick-Test: abwärts erreichte die
   * Deckkraft der Wörter erst nach einer Sekunde die 1, während die Fläche
   * längst offen stand; aufwärts stand sie unverrückt auf 1. Wer die Bewegung
   * fahren soll, darf sie nicht abgespielt bekommen.
   *
   * Mit `scrub` gehört auch `end` gesetzt — sonst endet der Bereich beim
   * ScrollTrigger-Standard und die Staffelung quetscht sich hinein.
   */
  scrub?: number;
  /** Nur zusammen mit `scrub` wirksam. */
  end?: string;
}

/** Stable default — inline `fromVars = {}` would remount the tween on every parent render. */
const EMPTY_FROM: gsap.TweenVars = {};

export default function TextReveal({
  children,
  className,
  variant = "words",
  stagger = 0.03,
  start = "top 85%",
  as: Tag = "p",
  fromVars = EMPTY_FROM,
  scrub,
  end,
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
        // pt/-mt: tight leading + overflow-hidden would otherwise clip
        // diacritics (Ü, Ä, Ö) above the line box.
        return `<span class="inline-block overflow-hidden pt-[0.22em] -mt-[0.22em]"><span class="reveal-element inline-block" style="display:inline-block">${content}</span></span>`;
      })
      .join("");

    const revealElements = container.querySelectorAll(".reveal-element");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger:
          scrub === undefined
            ? { trigger: container, start, toggleActions: "play none none none" }
            : { trigger: container, start, end, scrub },
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
  }, [children, variant, stagger, start, fromVars, scrub, end]);

  return (
    <Tag
      ref={containerRef as React.Ref<never>}
      className={cn("overflow-hidden pt-[0.22em] -mt-[0.22em]", className)}
      style={{ perspective: "1000px" }}
    >
      {children}
    </Tag>
  );
}
