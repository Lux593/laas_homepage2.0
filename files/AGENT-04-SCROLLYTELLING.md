# 📜 AGENT-04: Scrollytelling & Scroll-Driven Animations

## Rolle
Du bist ein Motion Designer / Animation Engineer. Deine Aufgabe: Alle scroll-basierten Animationen implementieren — das Herzstück der Website. Jede Section soll beim Scrollen "zum Leben erwachen" mit cinematischen, an den Scrollbalken gekoppelten Transitions.

## Voraussetzung
AGENT-01 bis AGENT-03 abgeschlossen. GSAP und Lenis funktionieren.

---

## Kernprinzip: Keine Fade-Ins!

**VERBOTEN:** Einfache `opacity: 0 → 1` Fade-Ins oder simple `translateY` Reveals.

**STATTDESSEN:** Jedes Element nutzt eine Kombination aus:
- 3D-Transforms (rotateX, rotateY, perspective)
- Clip-Path Reveals
- Staggered Character/Word Animations
- Parallax-Versätze auf verschiedenen Geschwindigkeiten
- Scroll-Progress-basierte kontinuierliche Animationen

---

## Schritt 1: Text Reveal Komponente (Reusable)

Erstelle `src/components/ui/TextReveal.tsx`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  className?: string;
  /** Animation-Typ */
  variant?: "words" | "chars" | "lines";
  /** Verzögerung pro Element */
  stagger?: number;
  /** ScrollTrigger Start-Position */
  start?: string;
  /** Tag-Typ */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Zusätzliche Animation-Props */
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
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return;

    const container = containerRef.current;
    const text = children;

    // Text in Spans aufsplitten
    let elements: string[];
    if (variant === "chars") {
      elements = text.split("");
    } else if (variant === "words") {
      elements = text.split(" ");
    } else {
      elements = [text]; // lines = ganzer Text als ein Block
    }

    // HTML generieren
    container.innerHTML = elements
      .map((el, i) => {
        const content = variant === "words" ? `${el}&nbsp;` : el;
        return `<span class="inline-block overflow-hidden"><span class="reveal-element inline-block" style="display:inline-block">${content}</span></span>`;
      })
      .join("");

    const revealElements = container.querySelectorAll(".reveal-element");

    // GSAP Animation
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

    hasAnimated.current = true;

    return () => {
      tl.kill();
    };
  }, [children, variant, stagger, start, fromVars]);

  return (
    <Tag
      ref={containerRef as any}
      className={cn("overflow-hidden", className)}
      style={{ perspective: "1000px" }}
    >
      {children}
    </Tag>
  );
}
```

---

## Schritt 2: Scroll-Linked Text Highlight (Manifesto)

Erstelle `src/components/ui/ScrollHighlight.tsx`:

```typescript
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

    // Alle Wörter starten dim
    gsap.set(wordSpans, { opacity: 0.15, color: "var(--color-text-muted)" });

    // ScrollTrigger: Text leuchtet Wort für Wort auf
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5, // An Scroll gekoppelt (nicht zeitbasiert!)
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
      {/* Sticky Container - bleibt auf dem Bildschirm */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen flex items-center justify-center px-[var(--container-padding)]"
      >
        <p
          className={cn(
            "text-display-sm md:text-display-md font-body leading-[1.3] max-w-5xl text-center",
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
```

---

## Schritt 3: 3D Flip Project Cards

Erstelle `src/components/ui/FlipCard.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

interface FlipCardProps {
  project: Project;
  index: number;
}

export default function FlipCard({ project, index }: FlipCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;

    // 3D Flip Animation gekoppelt an Scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: "top 90%",
        end: "top 30%",
        scrub: 1,
      },
    });

    // Karte startet nach hinten geklappt
    gsap.set(card, {
      rotateX: 35,
      scale: 0.85,
      opacity: 0.3,
      transformPerspective: 2000,
      transformOrigin: "center bottom",
    });

    // Animation: Dreht sich flüssig auf und wird größer
    tl.to(card, {
      rotateX: 0,
      scale: 1,
      opacity: 1,
      ease: "none",
    });

    // Parallax für den Content innerhalb der Karte
    gsap.fromTo(
      contentRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: {
          trigger: card,
          start: "top 60%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="perspective-2000 mb-32 md:mb-48">
      <div
        ref={cardRef}
        className="preserve-3d relative group rounded-3xl overflow-hidden border border-glass-border bg-glass-bg"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Projekt-Bild */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-primary/90 z-10" />

          {/* Farbiger Glow basierend auf Projekt */}
          <div
            className="absolute -inset-20 opacity-20 blur-[100px] z-0 transition-opacity duration-700 group-hover:opacity-40"
            style={{ backgroundColor: project.color }}
          />

          {/* Placeholder für Projektbild */}
          <div
            className="w-full h-full bg-gradient-to-br from-bg-elevated to-bg-secondary flex items-center justify-center"
          >
            <span className="text-display-md font-display font-bold text-text-muted/20 tracking-tighter">
              {project.id.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="relative z-20 p-8 md:p-12 -mt-20">
          {/* Meta */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-caption font-mono uppercase tracking-widest text-text-muted">
              {project.category}
            </span>
            <span className="w-8 h-[1px] bg-text-muted/30" />
            <span className="text-caption font-mono text-text-muted">{project.year}</span>
          </div>

          {/* Title */}
          <h3 className="text-display-sm md:text-display-md font-display font-bold tracking-tighter mb-2">
            {project.title}
          </h3>

          {/* Subtitle */}
          <p className="text-body-md font-serif italic text-text-secondary mb-6">
            {project.subtitle}
          </p>

          {/* Description */}
          <p className="text-body-sm text-text-secondary max-w-2xl mb-8 leading-relaxed">
            {project.description}
          </p>

          {/* Tech Stack Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-caption font-mono rounded-full border border-glass-border bg-glass-bg text-text-secondary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Schritt 4: Parallax Wrapper (Reusable)

Erstelle `src/components/ui/Parallax.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface ParallaxProps {
  children: React.ReactNode;
  /** Geschwindigkeit: positiv = langsamer, negativ = schneller */
  speed?: number;
  className?: string;
}

export default function Parallax({ children, speed = 0.2, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const offset = speed * 200;

    gsap.fromTo(
      element,
      { y: -offset },
      {
        y: offset,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll()
        .filter((t) => t.trigger === element)
        .forEach((t) => t.kill());
    };
  }, [speed]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
```

---

## Schritt 5: Horizontal Scroll Section (Optional Premium-Feature)

Erstelle `src/components/ui/HorizontalScroll.tsx`:

```typescript
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
```

---

## Schritt 6: Staggered Section Reveal

Erstelle `src/components/ui/StaggerReveal.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  /** CSS-Selektor für die zu animierenden Kinder */
  childSelector?: string;
  /** Start-Position des ScrollTriggers */
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
```

---

## Schritt 7: Testen

Aktualisiere `src/app/page.tsx` um alle Scroll-Komponenten zu testen:

```typescript
import dynamic from "next/dynamic";
import TextReveal from "@/components/ui/TextReveal";
import ScrollHighlight from "@/components/ui/ScrollHighlight";
import Parallax from "@/components/ui/Parallax";
import { MANIFESTO_TEXT } from "@/lib/constants";

const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  return (
    <main className="relative min-h-screen bg-bg-primary">
      <Scene />

      <div className="relative z-10">
        {/* Hero Test */}
        <section className="h-screen flex items-center justify-center">
          <div className="text-center">
            <TextReveal
              as="h1"
              variant="chars"
              className="text-display-xl font-display font-bold tracking-tighter"
              stagger={0.02}
            >
              Code that feels alive
            </TextReveal>
            <Parallax speed={0.3}>
              <TextReveal
                as="p"
                variant="words"
                className="text-body-lg font-body text-text-secondary mt-6"
                start="top 95%"
              >
                Fullstack Developer & Digital Experience Engineer
              </TextReveal>
            </Parallax>
          </div>
        </section>

        {/* Manifesto Test */}
        <ScrollHighlight text={MANIFESTO_TEXT} />

        {/* Spacer */}
        <section className="h-screen" />
      </div>
    </main>
  );
}
```

---

## Verifikation

```bash
pnpm dev
```

✅ Hero-Text fliegt Buchstabe für Buchstabe ein mit 3D-Rotation
✅ Manifesto-Text leuchtet Wort für Wort beim Scrollen auf
✅ Text bleibt sticky auf dem Bildschirm während Scroll-Container durchscrollt wird
✅ Parallax-Elemente bewegen sich mit unterschiedlicher Geschwindigkeit
✅ Alle Animationen sind an den Scrollbalken gekoppelt (nicht zeitbasiert)
✅ 60fps durchgehend

**→ Weiter mit AGENT-05-SECTIONS.md**
