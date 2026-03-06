# 🏛️ AGENT-05: Content Sections

## Rolle
Du bist ein Senior Frontend Developer & UI Designer. Deine Aufgabe: Alle inhaltlichen Sections der Website bauen — mit den Animation-Komponenten aus AGENT-04, dem Design-System aus AGENT-02 und dem 3D-Hintergrund aus AGENT-03. Jede Section muss ein eigenständiges Meisterwerk sein.

## Voraussetzung
AGENT-01 bis AGENT-04 abgeschlossen.

---

## Section 1: Navigation

Erstelle `src/components/ui/Navigation.tsx`:

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";
import MagneticButton from "./MagneticButton";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initiale Animation
  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 2.5, ease: "expo.out" }
    );
  }, []);

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-[var(--z-nav)] transition-all duration-700 ease-out-expo opacity-0",
        isScrolled ? "py-3" : "py-6"
      )}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="relative group">
          <span className="text-body-md font-display font-bold tracking-tight text-text-primary">
            {SITE_CONFIG.name}
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent-primary transition-all duration-500 ease-out-expo group-hover:w-full" />
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className="relative text-caption font-mono uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors duration-300 group"
            >
              <span className="text-text-muted/50 mr-1">0{i + 1}</span>
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent-primary transition-all duration-500 ease-out-expo group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <a
            href="#contact"
            className="relative px-6 py-2.5 text-caption font-mono uppercase tracking-widest text-bg-primary bg-text-primary rounded-full hover:bg-accent-primary transition-colors duration-500 ease-out-expo"
          >
            Let's talk
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <motion.span
            className="w-6 h-[1px] bg-text-primary block"
            animate={isMobileMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-6 h-[1px] bg-text-primary block"
            animate={isMobileMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 top-0 bg-bg-primary/98 backdrop-blur-xl z-[-1] flex flex-col items-center justify-center gap-8"
            initial={{ clipPath: "circle(0% at top right)" }}
            animate={{ clipPath: "circle(150% at top right)" }}
            exit={{ clipPath: "circle(0% at top right)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-display-sm font-display font-bold tracking-tighter"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
```

---

## Section 2: Hero

Erstelle `src/components/sections/Hero.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { SITE_CONFIG } from "@/lib/constants";
import Parallax from "@/components/ui/Parallax";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition(0.08);
  const isMobile = useIsMobile();

  // Initiale Reveal-Animation (nach Preloader)
  useEffect(() => {
    if (!headlineRef.current || !sublineRef.current) return;

    const tl = gsap.timeline({ delay: 2.2 });

    // Headline Character Reveal
    const chars = headlineRef.current.querySelectorAll(".hero-char");
    tl.fromTo(
      chars,
      { y: "120%", rotateX: -90, opacity: 0 },
      {
        y: "0%",
        rotateX: 0,
        opacity: 1,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.025,
      }
    );

    // Subline
    tl.fromTo(
      sublineRef.current,
      { y: 30, opacity: 0, filter: "blur(10px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "expo.out" },
      "-=0.8"
    );

    // Scroll Indicator
    if (scrollIndicatorRef.current) {
      tl.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
        "-=0.4"
      );
    }
  }, []);

  // Headline in Spans aufsplitten
  const headlineWords = [
    { text: "Code", style: "font-display font-bold" },
    { text: "that", style: "font-display font-bold" },
    { text: "feels", style: "font-serif italic font-light" },
    { text: "alive", style: "font-display font-bold text-gradient-accent" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
      id="hero"
    >
      {/* Background Glows (reagieren auf Maus) */}
      {!isMobile && (
        <>
          <div
            className="absolute w-[600px] h-[600px] rounded-full bg-accent-primary/10 blur-[150px] pointer-events-none"
            style={{
              transform: `translate3d(${mouse.normalizedX * -40}px, ${mouse.normalizedY * -30}px, 0)`,
              transition: "transform 0.3s ease-out",
              left: "20%",
              top: "20%",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full bg-accent-secondary/8 blur-[120px] pointer-events-none"
            style={{
              transform: `translate3d(${mouse.normalizedX * 30}px, ${mouse.normalizedY * 20}px, 0)`,
              transition: "transform 0.4s ease-out",
              right: "15%",
              bottom: "25%",
            }}
          />
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center px-[var(--container-padding)]">
        {/* Headline mit Mouse Parallax */}
        <div
          style={{
            transform: isMobile
              ? "none"
              : `translate3d(${mouse.normalizedX * -15}px, ${mouse.normalizedY * -10}px, 0)`,
            transition: "transform 0.2s ease-out",
          }}
        >
          <h1
            ref={headlineRef}
            className="text-display-xl leading-[0.9] tracking-tighter mb-6"
            style={{ perspective: "1000px" }}
          >
            {headlineWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[0.15em]">
                <span className={`hero-char inline-block ${word.style}`}>
                  {word.text}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {/* Subline */}
        <Parallax speed={0.15}>
          <p
            ref={sublineRef}
            className="text-body-lg font-body text-text-secondary max-w-xl mx-auto opacity-0"
          >
            {SITE_CONFIG.title}
          </p>
        </Parallax>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0"
      >
        <span className="text-caption font-mono uppercase tracking-widest text-text-muted">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-text-muted/50 to-transparent relative overflow-hidden">
          <div className="absolute w-full h-4 bg-accent-primary animate-[scrollDown_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}
```

Füge diese Keyframe in `globals.css` hinzu:

```css
@keyframes scrollDown {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(300%); }
}
```

---

## Section 3: Manifesto

Erstelle `src/components/sections/Manifesto.tsx`:

```typescript
"use client";

import ScrollHighlight from "@/components/ui/ScrollHighlight";
import { MANIFESTO_TEXT } from "@/lib/constants";

export default function Manifesto() {
  return (
    <section id="about" className="relative">
      {/* Section Label */}
      <div className="container-custom pt-section">
        <span className="text-caption font-mono uppercase tracking-widest text-text-muted">
          01 — Manifesto
        </span>
      </div>

      {/* Scroll-Linked Highlight */}
      <ScrollHighlight
        text={MANIFESTO_TEXT}
        className="font-body"
      />
    </section>
  );
}
```

---

## Section 4: Selected Work

Erstelle `src/components/sections/SelectedWork.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FlipCard from "@/components/ui/FlipCard";
import TextReveal from "@/components/ui/TextReveal";
import { PROJECTS } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

export default function SelectedWork() {
  const headerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="work" className="relative py-section">
      <div className="container-custom">
        {/* Section Header */}
        <div ref={headerRef} className="mb-24 md:mb-32">
          <span className="text-caption font-mono uppercase tracking-widest text-text-muted block mb-4">
            02 — Selected Work
          </span>
          <TextReveal
            as="h2"
            variant="words"
            className="text-display-md md:text-display-lg font-display font-bold tracking-tighter"
          >
            Projects that push boundaries
          </TextReveal>
        </div>

        {/* Project Cards */}
        <div className="max-w-6xl mx-auto">
          {PROJECTS.map((project, index) => (
            <FlipCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Section 5: Bento Grid (Expertise)

Erstelle `src/components/sections/BentoGrid.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import { EXPERTISE, TECH_STACK } from "@/lib/constants";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

function BentoCard({
  children,
  className,
  index,
}: {
  children: React.ReactNode;
  className?: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      {
        y: 100,
        opacity: 0,
        scale: 0.9,
        rotateX: -10,
        transformPerspective: 1500,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        duration: 1,
        ease: "expo.out",
        delay: index * 0.1,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, [index]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-3xl border border-glass-border bg-glass-bg p-8 md:p-10 overflow-hidden group",
        "hover:border-white/10 transition-all duration-700 ease-out-expo",
        className
      )}
    >
      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function BentoGrid() {
  return (
    <section id="expertise" className="relative py-section">
      <div className="container-custom">
        {/* Section Header */}
        <div className="mb-16 md:mb-24">
          <span className="text-caption font-mono uppercase tracking-widest text-text-muted block mb-4">
            03 — Expertise
          </span>
          <TextReveal
            as="h2"
            variant="words"
            className="text-display-md md:text-display-lg font-display font-bold tracking-tighter"
          >
            What I bring to the table
          </TextReveal>
        </div>

        {/* Asymmetrisches Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">

          {/* Große Karte: Fullstack Architecture */}
          <BentoCard className="md:col-span-2 lg:col-span-2" index={0}>
            <span className="text-caption font-mono uppercase tracking-widest text-accent-primary mb-4 block">
              {EXPERTISE[0].title}
            </span>
            <p className="text-display-sm font-display font-bold tracking-tight mb-4">
              From pixel-perfect frontends to{" "}
              <span className="font-serif italic font-light text-text-secondary">
                resilient backends
              </span>
            </p>
            <p className="text-body-sm text-text-secondary max-w-lg leading-relaxed">
              {EXPERTISE[0].description}
            </p>

            {/* Decorative Code Block */}
            <div className="mt-8 p-4 rounded-xl bg-bg-primary/50 border border-glass-border font-mono text-caption text-text-muted">
              <span className="text-accent-primary">const</span>{" "}
              <span className="text-text-primary">architecture</span> ={" "}
              <span className="text-accent-secondary">{"{"}</span>{" "}
              frontend: <span className="text-accent-warm">'React'</span>,
              backend: <span className="text-accent-warm">'Node.js'</span>,
              scale: <span className="text-accent-warm">'∞'</span>{" "}
              <span className="text-accent-secondary">{"}"}</span>;
            </div>
          </BentoCard>

          {/* Kleine Karte: AI & Automation */}
          <BentoCard className="lg:col-span-1" index={1}>
            <span className="text-caption font-mono uppercase tracking-widest text-accent-secondary mb-4 block">
              {EXPERTISE[1].title}
            </span>
            <p className="text-body-lg font-display font-bold tracking-tight mb-3">
              Smart systems that{" "}
              <span className="font-serif italic font-light text-text-secondary">think</span>
            </p>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              {EXPERTISE[1].description}
            </p>

            {/* Animated dots */}
            <div className="mt-6 flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </BentoCard>

          {/* Tech Stack Karte (volle Breite) */}
          <BentoCard className="md:col-span-2 lg:col-span-3" index={2}>
            <span className="text-caption font-mono uppercase tracking-widest text-text-muted mb-6 block">
              Tech Stack
            </span>
            <div className="flex flex-wrap gap-3">
              {TECH_STACK.map((tech, i) => (
                <span
                  key={tech}
                  className="px-4 py-2 text-body-sm font-mono rounded-full border border-glass-border bg-bg-primary/50 text-text-secondary hover:text-text-primary hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all duration-500 ease-out-expo cursor-default"
                  style={{ transitionDelay: `${i * 20}ms` }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
```

---

## Section 6: Gigantic CTA

Erstelle `src/components/sections/GiganticCTA.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { SITE_CONFIG } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

export default function GiganticCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!glowRef.current || !sectionRef.current) return;

    // Glow pulsiert und wächst beim Scrollen
    gsap.fromTo(
      glowRef.current,
      { scale: 0.5, opacity: 0 },
      {
        scale: 1.5,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-section min-h-[80vh] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Glow */}
      <div
        ref={glowRef}
        className="absolute w-[800px] h-[800px] rounded-full bg-accent-primary/15 blur-[200px] pointer-events-none"
        style={{ opacity: 0 }}
      />

      <div className="relative z-10 text-center px-[var(--container-padding)]">
        {/* Section Label */}
        <span className="text-caption font-mono uppercase tracking-widest text-text-muted block mb-8">
          04 — Contact
        </span>

        {/* Gigantic Headline */}
        <TextReveal
          as="h2"
          variant="words"
          className="text-display-lg md:text-display-xl font-display font-bold tracking-tighter mb-8 max-w-5xl mx-auto"
          stagger={0.05}
        >
          Ready to build something extraordinary?
        </TextReveal>

        {/* Subtext */}
        <TextReveal
          as="p"
          variant="words"
          className="text-body-lg font-body text-text-secondary max-w-2xl mx-auto mb-12"
          start="top 90%"
        >
          Let's turn your vision into a digital experience that people remember.
        </TextReveal>

        {/* CTA Button */}
        <MagneticButton>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="inline-flex items-center gap-3 px-10 py-5 text-body-md font-display font-bold tracking-tight text-bg-primary bg-text-primary rounded-full hover:bg-accent-primary transition-colors duration-500 ease-out-expo group"
          >
            Start a project
            <span className="inline-block transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
              →
            </span>
          </a>
        </MagneticButton>

        {/* Social Links */}
        <div className="mt-16 flex items-center justify-center gap-8">
          {Object.entries(SITE_CONFIG.socials).map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption font-mono uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors duration-300"
            >
              {platform}
            </a>
          ))}
        </div>
      </div>

      {/* Footer Line */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-caption font-mono text-text-muted/50">
          © {new Date().getFullYear()} {SITE_CONFIG.name}. Crafted with obsessive attention to detail.
        </p>
      </div>
    </section>
  );
}
```

---

## Section 7: Alles zusammenfügen

Aktualisiere `src/app/page.tsx`:

```typescript
import dynamic from "next/dynamic";
import Navigation from "@/components/ui/Navigation";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import SelectedWork from "@/components/sections/SelectedWork";
import BentoGrid from "@/components/sections/BentoGrid";
import GiganticCTA from "@/components/sections/GiganticCTA";

const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  return (
    <main className="relative min-h-screen bg-bg-primary">
      {/* 3D Background */}
      <Scene />

      {/* Navigation */}
      <Navigation />

      {/* Content */}
      <div className="relative z-10">
        <Hero />
        <Manifesto />
        <SelectedWork />
        <BentoGrid />
        <GiganticCTA />
      </div>
    </main>
  );
}
```

---

## Verifikation

✅ Navigation erscheint nach dem Preloader mit Glassmorphism-Effekt
✅ Hero zeigt "Code that feels alive" mit Mixed Typography
✅ Hintergrund-Glows reagieren auf Maus
✅ Manifesto leuchtet Wort für Wort auf
✅ Projekt-Karten flippen in 3D beim Scrollen
✅ Bento Grid hat asymmetrisches Layout
✅ CTA ist riesig und eindrucksvoll
✅ Alle Sections haben Section-Labels mit Nummern
✅ Responsive auf Mobile, Tablet und Desktop

**→ Weiter mit AGENT-06-MICRO-INTERACTIONS.md**
