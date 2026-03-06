# ✨ AGENT-06: Micro-Interactions & Custom Cursor

## Rolle
Du bist ein Interaction Designer & Animation Specialist. Deine Aufgabe: Die kleinen Details die eine gute Website zu einer großartigen machen — Custom Cursor mit Blend-Mode, magnetische Buttons, Hover-Effekte und subtile Micro-Animations.

## Voraussetzung
AGENT-01 bis AGENT-05 abgeschlossen.

---

## Schritt 1: Custom Cursor mit mix-blend-mode

Erstelle `src/components/ui/CustomCursor.tsx`:

```typescript
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { lerp } from "@/lib/utils";
import { useSupportsHover, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const supportsHover = useSupportsHover();
  const reducedMotion = usePrefersReducedMotion();

  // Maus-Positionen
  const mouse = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    // Dot folgt direkt
    dotPos.current.x = lerp(dotPos.current.x, mouse.current.x, 0.2);
    dotPos.current.y = lerp(dotPos.current.y, mouse.current.y, 0.2);

    // Ring folgt langsamer (Trailing Effect)
    ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.08);
    ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.08);

    if (dotRef.current) {
      dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
    }

    if (ringRef.current) {
      ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!supportsHover || reducedMotion) return;

    // Maus-Tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Hover-Detection für interaktive Elemente
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[data-cursor-hover]") ||
        target.closest("[role='button']")
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[data-cursor-hover]") ||
        target.closest("[role='button']")
      ) {
        setIsHovering(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });

    // Animation Loop starten
    rafId.current = requestAnimationFrame(animate);

    // Body-Klasse zum Verstecken des nativen Cursors
    document.body.classList.add("cursor-hidden");

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(rafId.current);
      document.body.classList.remove("cursor-hidden");
    };
  }, [supportsHover, reducedMotion, animate, isVisible]);

  // Nicht rendern auf Touch-Geräten
  if (!supportsHover || reducedMotion) return null;

  return (
    <>
      {/* Inner Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: "var(--z-cursor)",
          mixBlendMode: "difference",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s, width 0.4s cubic-bezier(0.22,1,0.36,1), height 0.4s cubic-bezier(0.22,1,0.36,1)",
          width: isHovering ? "60px" : "8px",
          height: isHovering ? "60px" : "8px",
          marginLeft: isHovering ? "-30px" : "-4px",
          marginTop: isHovering ? "-30px" : "-4px",
          borderRadius: "50%",
          backgroundColor: "white",
          willChange: "transform",
        }}
      />

      {/* Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: "var(--z-cursor)",
          mixBlendMode: "difference",
          opacity: isVisible && !isHovering ? 0.5 : 0,
          transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1)",
          width: "40px",
          height: "40px",
          marginLeft: "-20px",
          marginTop: "-20px",
          borderRadius: "50%",
          border: "1px solid white",
          willChange: "transform",
        }}
      />
    </>
  );
}
```

---

## Schritt 2: Magnetic Button

Erstelle `src/components/ui/MagneticButton.tsx`:

```typescript
"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { lerp } from "@/lib/utils";
import { useSupportsHover } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  /** Stärke des magnetischen Effekts (0-1) */
  strength?: number;
}

export default function MagneticButton({
  children,
  className,
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const supportsHover = useSupportsHover();
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    position.current.x = lerp(position.current.x, target.current.x, 0.15);
    position.current.y = lerp(position.current.y, target.current.y, 0.15);

    if (ref.current) {
      ref.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!supportsHover || !ref.current) return;

    const element = ref.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      target.current.x = distX * strength;
      target.current.y = distY * strength;
    };

    const handleMouseLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    element.addEventListener("mousemove", handleMouseMove, { passive: true });
    element.addEventListener("mouseleave", handleMouseLeave);

    rafId.current = requestAnimationFrame(animate);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [supportsHover, strength, animate]);

  return (
    <div ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}
```

---

## Schritt 3: Link Hover Underline Effekt

Erstelle `src/components/ui/AnimatedLink.tsx`:

```typescript
"use client";

import { cn } from "@/lib/utils";

interface AnimatedLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  external?: boolean;
}

export default function AnimatedLink({
  children,
  href,
  className,
  external = false,
}: AnimatedLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "relative inline-block group",
        className
      )}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      <span className="relative">
        {children}
        {/* Animierte Underline */}
        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current origin-right scale-x-0 transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
      </span>
    </a>
  );
}
```

---

## Schritt 4: Bento Card Hover Glow (Maus-folgende Highlights)

Erstelle `src/components/ui/CardSpotlight.tsx`:

```typescript
"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CardSpotlightProps {
  children: React.ReactNode;
  className?: string;
}

export default function CardSpotlight({ children, className }: CardSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Spotlight Gradient */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(200, 255, 0, 0.06), transparent 40%)`,
        }}
      />

      {/* Border Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-[inherit]"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(200, 255, 0, 0.15), transparent 40%)`,
          mask: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />

      {children}
    </div>
  );
}
```

---

## Schritt 5: Smooth Counter Animation

Erstelle `src/components/ui/CounterAnimation.tsx`:

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";

interface CounterAnimationProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export default function CounterAnimation({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
  className,
}: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView<HTMLSpanElement>({ threshold: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo
      const easedProgress = 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(easedProgress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
```

---

## Schritt 6: Custom Cursor in Layout einbinden

Aktualisiere `src/app/layout.tsx`:

```typescript
// Füge den Import hinzu:
import CustomCursor from "@/components/ui/CustomCursor";

// Füge CustomCursor in den Body ein (vor den Providers):
<body className="...">
  <CustomCursor />
  <Preloader />
  <SmoothScroll>
    <AnimationProvider>
      <GrainOverlay />
      {children}
    </AnimationProvider>
  </SmoothScroll>
</body>
```

---

## Schritt 7: CardSpotlight in BentoGrid integrieren

Aktualisiere die `BentoCard` Komponente in `src/components/sections/BentoGrid.tsx`:

Ersetze den äußeren `<div>` jeder BentoCard mit `<CardSpotlight>`:

```typescript
import CardSpotlight from "@/components/ui/CardSpotlight";

// In der BentoCard Komponente:
return (
  <CardSpotlight className={cn("rounded-3xl", className)}>
    <div
      ref={ref}
      className="relative rounded-3xl border border-glass-border bg-glass-bg p-8 md:p-10 overflow-hidden group hover:border-white/10 transition-all duration-700 ease-out-expo"
    >
      <div className="relative z-10">{children}</div>
    </div>
  </CardSpotlight>
);
```

---

## Verifikation

✅ Custom Cursor sichtbar (weißer Punkt + Ring)
✅ Cursor nutzt mix-blend-mode: difference (invertiert Farben)
✅ Dot wird groß und Ring verschwindet bei Hover über Links/Buttons
✅ Magnetic Buttons ziehen den Cursor-Bereich an
✅ Bento Cards zeigen Spotlight-Glow der der Maus folgt
✅ Links haben animierte Underlines
✅ Kein Custom Cursor auf Touch-Geräten
✅ `prefers-reduced-motion` wird respektiert

**→ Weiter mit AGENT-07-VISUAL-POLISH.md**
