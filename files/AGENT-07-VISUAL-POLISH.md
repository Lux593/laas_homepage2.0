# 💎 AGENT-07: Visual Polish & Finishing Touches

## Rolle
Du bist ein Art Director & Visual Effects Artist. Deine Aufgabe: Die gesamte Website visuell auf Award-Niveau heben — Background Glows perfektionieren, Glassmorphism feintunen, Page Transitions hinzufügen, Section Dividers, und all die Details die den Unterschied machen.

## Voraussetzung
AGENT-01 bis AGENT-06 abgeschlossen. Alle Sections und Interaktionen funktionieren.

---

## Schritt 1: Animated Background Glows

Erstelle `src/components/ui/BackgroundGlows.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BackgroundGlows() {
  const glow1Ref = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);
  const glow3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glows = [glow1Ref.current, glow2Ref.current, glow3Ref.current].filter(Boolean);

    // Autonome floating Animation
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

    // Farbe ändert sich basierend auf Scroll-Section
    const sections = document.querySelectorAll("section[id]");

    const colorSchemes = [
      { primary: "#c8ff00", secondary: "#00d4ff" }, // Hero
      { primary: "#00d4ff", secondary: "#c8ff00" }, // Manifesto
      { primary: "#ff6b35", secondary: "#c8ff00" }, // Work
      { primary: "#c8ff00", secondary: "#ff6b35" }, // Expertise
      { primary: "#00d4ff", secondary: "#ff6b35" }, // Contact
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
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      <div
        ref={glow1Ref}
        className="absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full opacity-[0.07]"
        style={{
          backgroundColor: "#c8ff00",
          filter: "blur(150px)",
          top: "10%",
          left: "15%",
          willChange: "transform, background-color",
        }}
      />
      <div
        ref={glow2Ref}
        className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full opacity-[0.05]"
        style={{
          backgroundColor: "#00d4ff",
          filter: "blur(130px)",
          top: "50%",
          right: "10%",
          willChange: "transform, background-color",
        }}
      />
      <div
        ref={glow3Ref}
        className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full opacity-[0.04]"
        style={{
          backgroundColor: "#ff6b35",
          filter: "blur(120px)",
          bottom: "20%",
          left: "40%",
          willChange: "transform, background-color",
        }}
      />
    </div>
  );
}
```

---

## Schritt 2: Section Dividers (Horizontale Linien mit Animation)

Erstelle `src/components/ui/SectionDivider.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SectionDivider() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineRef.current) return;

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
```

---

## Schritt 3: Scroll Progress Indicator (Top Bar)

Erstelle `src/components/ui/ScrollProgress.tsx`:

```typescript
"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number>(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[var(--z-nav)]">
      <div
        className="h-full origin-left"
        style={{
          transform: `scaleX(${progress})`,
          background: "linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary))",
          willChange: "transform",
        }}
      />
    </div>
  );
}
```

---

## Schritt 4: Marquee / Ticker Band

Erstelle `src/components/ui/Marquee.tsx`:

```typescript
"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  speed?: number;
  className?: string;
  separator?: string;
}

export default function Marquee({
  items,
  speed = 30,
  className,
  separator = "✦",
}: MarqueeProps) {
  const content = items.join(` ${separator} `) + ` ${separator} `;

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <div
        className="inline-flex animate-[marquee_var(--duration)_linear_infinite]"
        style={{ "--duration": `${speed}s` } as React.CSSProperties}
      >
        <span className="text-display-sm md:text-display-md font-display font-bold tracking-tighter text-text-muted/10 mr-4">
          {content}
        </span>
        <span className="text-display-sm md:text-display-md font-display font-bold tracking-tighter text-text-muted/10 mr-4">
          {content}
        </span>
      </div>
    </div>
  );
}
```

Füge die Marquee-Keyframes in `globals.css` hinzu:

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

---

## Schritt 5: Glassmorphism Navigation verbessern

Aktualisiere die Navigation in `src/components/ui/Navigation.tsx`:

Ersetze die Nav-Container-Klasse:

```typescript
// Inner container mit Glassmorphism
<div
  className={cn(
    "mx-auto max-w-[var(--container-max)] transition-all duration-700 ease-out-expo rounded-full",
    isScrolled
      ? "mx-6 md:mx-8 px-6 py-3 glass border border-glass-border"
      : "px-[var(--container-padding)] py-4"
  )}
>
  {/* ... bestehender Nav-Content ... */}
</div>
```

---

## Schritt 6: Finale page.tsx Zusammenstellung

Aktualisiere `src/app/page.tsx` mit allen Polish-Elementen:

```typescript
import dynamic from "next/dynamic";
import Navigation from "@/components/ui/Navigation";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import SelectedWork from "@/components/sections/SelectedWork";
import BentoGrid from "@/components/sections/BentoGrid";
import GiganticCTA from "@/components/sections/GiganticCTA";
import SectionDivider from "@/components/ui/SectionDivider";
import Marquee from "@/components/ui/Marquee";
import BackgroundGlows from "@/components/ui/BackgroundGlows";
import { TECH_STACK } from "@/lib/constants";

const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  return (
    <main className="relative min-h-screen bg-bg-primary">
      {/* Fixed Background Layers */}
      <Scene />
      <BackgroundGlows />

      {/* Fixed UI Elements */}
      <ScrollProgress />
      <Navigation />

      {/* Content */}
      <div className="relative z-10">
        <Hero />

        <SectionDivider />

        <Manifesto />

        <SectionDivider />

        {/* Tech Stack Marquee (zwischen Manifesto und Work) */}
        <div className="py-16 overflow-hidden">
          <Marquee items={[...TECH_STACK]} speed={40} />
        </div>

        <SectionDivider />

        <SelectedWork />

        <SectionDivider />

        <BentoGrid />

        <SectionDivider />

        <GiganticCTA />
      </div>
    </main>
  );
}
```

---

## Schritt 7: Favicon & OG Image erstellen

### SVG Favicon

Erstelle `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#050505"/>
  <text x="16" y="23" font-family="system-ui" font-weight="800" font-size="20" fill="#c8ff00" text-anchor="middle">
    ✦
  </text>
</svg>
```

Referenziere ihn im Root Layout `<head>`:

```typescript
// In layout.tsx metadata:
icons: {
  icon: "/favicon.svg",
  apple: "/favicon.svg",
},
```

---

## Schritt 8: Placeholder Projektbilder

Da echte Bilder noch fehlen, erstelle hochwertige Gradient-Platzhalter.

Aktualisiere die FlipCard in `src/components/ui/FlipCard.tsx`:

Ersetze den Bild-Placeholder-Bereich:

```typescript
{/* Gradient Placeholder statt Bild */}
<div
  className="w-full h-full relative"
  style={{
    background: `
      radial-gradient(ellipse at 30% 50%, ${project.color}22 0%, transparent 50%),
      radial-gradient(ellipse at 70% 50%, ${project.color}11 0%, transparent 50%),
      linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)
    `,
  }}
>
  {/* Große Projekt-Nummer */}
  <div className="absolute inset-0 flex items-center justify-center">
    <span
      className="text-[15rem] md:text-[20rem] font-display font-black leading-none tracking-tighter select-none"
      style={{ color: `${project.color}08` }}
    >
      {String(PROJECTS.indexOf(project) + 1).padStart(2, "0")}
    </span>
  </div>

  {/* Floating Tech Labels im Bild */}
  <div className="absolute inset-0 flex items-center justify-center gap-4 flex-wrap p-12">
    {project.tech.slice(0, 3).map((tech) => (
      <span
        key={tech}
        className="px-4 py-2 rounded-full text-caption font-mono glass border border-glass-border text-text-muted"
      >
        {tech}
      </span>
    ))}
  </div>
</div>
```

---

## Schritt 9: Responsive Fine-Tuning

Überprüfe und korrigiere folgende Breakpoints:

### Mobile (< 768px):
- Hero Headline: `text-[clamp(2.5rem,10vw,4rem)]`
- Kein Custom Cursor
- Kein 3D-Hintergrund (oder reduzierte Partikel)
- Navigation: Hamburger-Menu
- Bento Grid: Single Column
- Projekt-Cards: Kein 3D-Flip (einfacher Scale-In stattdessen)

### Tablet (768px - 1024px):
- Bento Grid: 2 Spalten
- Reduzierte Partikel-Anzahl
- Kleinere Glows

### Desktop (> 1024px):
- Voller Effekt-Umfang
- Custom Cursor aktiv
- Alle 3D-Animationen

---

## Verifikation

✅ Background Glows pulsieren und ändern Farbe pro Section
✅ Section Dividers animieren von links nach rechts
✅ Scroll Progress Bar am oberen Rand
✅ Tech Stack Marquee scrollt endlos horizontal
✅ Navigation wird zu Glassmorphism-Pill beim Scrollen
✅ Projekt-Platzhalter sehen hochwertig aus (Gradienten, nicht grau)
✅ Favicon ist sichtbar
✅ Responsive auf allen Größen

**→ Weiter mit AGENT-08-PERFORMANCE-QA.md**
