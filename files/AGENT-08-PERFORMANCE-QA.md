# 🚀 AGENT-08: Performance, QA & Deployment

## Rolle
Du bist ein Performance Engineer & QA Lead. Deine Aufgabe: Die Website auf Produktionsqualität bringen — Performance optimieren, Accessibility sicherstellen, Edge Cases fixen, alle Animationen auf 60fps verifizieren und für Deployment vorbereiten.

## Voraussetzung
AGENT-01 bis AGENT-07 abgeschlossen. Alle Features implementiert.

---

## Schritt 1: Performance Audit & Fixes

### 1.1 Lazy Loading für Heavy Components

```typescript
// In page.tsx — alle schweren Komponenten dynamisch laden:
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => null,
});

const BackgroundGlows = dynamic(() => import("@/components/ui/BackgroundGlows"), {
  ssr: false,
});

const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), {
  ssr: false,
});
```

### 1.2 Image Optimization

Stelle sicher dass alle Bilder:
- WebP oder AVIF Format nutzen
- `next/image` mit `sizes` Prop verwenden
- Placeholder `blur` haben
- Lazy Loading (default in next/image)

```typescript
import Image from "next/image";

<Image
  src="/images/projects/nexus-hero.webp"
  alt="Nexus Neural UI"
  width={1200}
  height={675}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  quality={85}
  priority={false} // true nur für above-the-fold
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Generiere mit plaiceholder
/>
```

### 1.3 Font Optimization

In `layout.tsx` sicherstellen:

```typescript
// Fonts MÜSSEN display: swap haben
// Preload die kritischsten Fonts
<link
  rel="preload"
  href="/fonts/ClashDisplay-Variable.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

### 1.4 CSS Optimization

Überprüfe `globals.css`:

```css
/* Keine redundanten Styles */
/* will-change nur auf animierten Elementen */
/* Keine Paint-triggernden Properties animieren (nur transform + opacity) */

/* Verboten zu animieren: */
/* ❌ width, height, top, left, margin, padding, border, background-color */
/* ✅ transform, opacity, filter (nur blur), clip-path */
```

---

## Schritt 2: Animation Performance Checks

### 2.1 Scroll-Event Throttling verifizieren

Überprüfe ALLE scroll-basierten Effekte:

```typescript
// JEDER scroll handler MUSS requestAnimationFrame nutzen:
// ✅ Richtig:
const handleScroll = () => {
  cancelAnimationFrame(rafId.current);
  rafId.current = requestAnimationFrame(() => {
    // ... animation logic
  });
};
window.addEventListener("scroll", handleScroll, { passive: true }); // passive: true!

// ❌ Falsch:
window.addEventListener("scroll", () => {
  element.style.transform = `translateY(${window.scrollY}px)`;
});
```

### 2.2 GSAP ScrollTrigger Performance

```typescript
// Alle ScrollTrigger mit invalidateOnRefresh:
ScrollTrigger.defaults({
  invalidateOnRefresh: true,
});

// Batch-Create für viele ähnliche Triggers:
ScrollTrigger.batch(".reveal-element", {
  onEnter: (elements) => {
    gsap.fromTo(elements, { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1 });
  },
  start: "top 85%",
});
```

### 2.3 Three.js Performance

Überprüfe in `Scene.tsx`:

```typescript
// DPR begrenzen
dpr={[1, Math.min(2, window.devicePixelRatio)]}

// Antialias nur auf High-End
gl={{ antialias: gpuTier === 'high', ... }}

// frameloop auf demand wenn nicht sichtbar
frameloop="always" // oder "demand" für statische Szenen
```

---

## Schritt 3: Accessibility (A11y)

### 3.1 Fokus-Management

```css
/* In globals.css — sichtbarer Fokus-Ring */
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 4px;
  border-radius: 4px;
}

/* Fokus nur bei Keyboard, nicht bei Maus */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 3.2 Skip Navigation Link

Füge in `layout.tsx` als erstes Element im Body ein:

```typescript
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-bg-primary focus:rounded-lg focus:text-sm focus:font-bold"
>
  Skip to content
</a>
```

Und `id="main-content"` auf das `<main>` Element setzen.

### 3.3 ARIA Labels

Überprüfe alle interaktiven Elemente:

```typescript
// Navigation Hamburger
<button aria-label="Toggle navigation menu" aria-expanded={isMobileMenuOpen}>

// Social Links
<a href="..." aria-label={`Visit ${platform} profile`}>

// 3D Canvas
<Canvas aria-hidden="true" role="presentation">

// Grain Overlay
<div className="grain-overlay" aria-hidden="true" role="presentation" />

// Scroll Indicator
<div aria-hidden="true" className="scroll-indicator">
```

### 3.4 Reduced Motion

Stelle sicher dass ALLE Animationen auf `prefers-reduced-motion` reagieren:

```typescript
// In jedem animierten Component:
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const reducedMotion = usePrefersReducedMotion();

// Animationen überspringen oder vereinfachen
if (reducedMotion) {
  gsap.set(elements, { opacity: 1, y: 0 }); // Direkt sichtbar, keine Animation
  return;
}
```

### 3.5 Color Contrast

Überprüfe alle Text/Hintergrund-Kombinationen:

| Element | Foreground | Background | Ratio | Status |
|---------|-----------|------------|-------|--------|
| Body Text | #f5f5f0 | #050505 | 18.7:1 | ✅ AAA |
| Secondary Text | #8a8a80 | #050505 | 5.7:1 | ✅ AA |
| Muted Text | #4a4a45 | #050505 | 3.1:1 | ⚠️ Large only |
| Accent on Dark | #c8ff00 | #050505 | 14.2:1 | ✅ AAA |

**Fix:** Muted Text (#4a4a45) nur für dekorative/große Texte verwenden, nie für informativen Fließtext.

---

## Schritt 4: Edge Cases & Browser Fixes

### 4.1 Safari-spezifische Fixes

```css
/* Safari backdrop-filter Fix */
@supports (-webkit-backdrop-filter: blur(1px)) {
  .glass {
    -webkit-backdrop-filter: blur(12px);
  }
}

/* Safari smooth scroll Bug */
html {
  scroll-behavior: auto; /* Lenis übernimmt */
}

/* Safari 100vh Bug */
.h-screen {
  height: 100vh;
  height: 100dvh; /* Dynamic Viewport Height */
}
```

### 4.2 Firefox-spezifische Fixes

```css
/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-text-muted) transparent;
}
```

### 4.3 Mobile Viewport Fixes

```typescript
// In layout.tsx viewport export:
export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover", // Für iPhone Notch
};
```

---

## Schritt 5: SEO & Meta Tags

### 5.1 Structured Data (JSON-LD)

Füge in `layout.tsx` hinzu:

```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "[DEIN NAME]",
      jobTitle: "Fullstack Developer",
      url: "https://[DEINE-DOMAIN].com",
      sameAs: [
        SITE_CONFIG.socials.github,
        SITE_CONFIG.socials.linkedin,
        SITE_CONFIG.socials.twitter,
      ],
      knowsAbout: [
        "Web Development",
        "React",
        "Next.js",
        "TypeScript",
        "AI Integration",
      ],
    }),
  }}
/>
```

### 5.2 robots.txt

Erstelle `public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://[DEINE-DOMAIN].com/sitemap.xml
```

### 5.3 Sitemap

Erstelle `src/app/sitemap.ts`:

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://[DEINE-DOMAIN].com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
```

---

## Schritt 6: Error Handling

### 6.1 Error Boundary für 3D

Erstelle `src/components/canvas/CanvasErrorBoundary.tsx`:

```typescript
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("3D Scene failed to load, falling back to 2D:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null; // Graceful degradation
    }
    return this.props.children;
  }
}
```

Wrapp die Scene in `page.tsx`:

```typescript
import CanvasErrorBoundary from "@/components/canvas/CanvasErrorBoundary";

<CanvasErrorBoundary>
  <Scene />
</CanvasErrorBoundary>
```

---

## Schritt 7: Build & Deploy Vorbereitung

### 7.1 Produktion-Build testen

```bash
pnpm build
pnpm start
```

Behebe ALLE Build-Fehler und Warnings.

### 7.2 Bundle-Analyse

```bash
pnpm add -D @next/bundle-analyzer

# In next.config.ts:
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);

# Ausführen:
ANALYZE=true pnpm build
```

Überprüfe:
- Three.js Bundle < 200KB gzipped
- Gesamtes JS < 350KB gzipped
- Kein ungenutzter Code

### 7.3 Vercel Deployment

```bash
# Vercel CLI installieren
pnpm add -g vercel

# Deploy
vercel

# Oder über Git: Push zu GitHub, Vercel auto-deploys
```

### 7.4 Vercel-spezifische Optimierungen in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // ... bestehende Config

  // Vercel Speed Insights
  experimental: {
    optimizeCss: true,
  },

  // Komprimierung
  compress: true,
};
```

---

## Schritt 8: Finale Checkliste

### Design & Visuell
- [ ] Kein Standard-Kachel-Design — jede Section ist einzigartig
- [ ] Mixed Typography (Bold Sans + Italic Serif) durchgehend
- [ ] OLED-Schwarz Hintergrund (#050505)
- [ ] Signature Farbe (Lime #c8ff00) ist präsent aber nicht dominant
- [ ] Film Grain Overlay subtil sichtbar
- [ ] Glassmorphism auf Navigation und Cards
- [ ] Background Glows pulsieren und ändern Farbe

### Animationen
- [ ] Preloader mit Zähler und Clip-Path Exit
- [ ] Hero Text: 3D Character Reveal
- [ ] Manifesto: Wort-für-Wort Scroll Highlight
- [ ] Projekt-Cards: 3D Flip beim Scrollen
- [ ] Bento Grid: Staggered 3D Reveal
- [ ] CTA: Glow wächst beim Scrollen
- [ ] Parallax auf mehreren Ebenen
- [ ] Alle Animationen 60fps

### Interaktionen
- [ ] Custom Cursor mit mix-blend-mode: difference
- [ ] Cursor wächst auf Hover über interaktive Elemente
- [ ] Magnetic Buttons
- [ ] Card Spotlight (Maus-folgendes Highlight)
- [ ] Animierte Link-Underlines
- [ ] Tech Stack Marquee

### 3D
- [ ] Partikelfeld reagiert auf Maus und Scroll
- [ ] Wireframe Floating Shapes rotieren
- [ ] GPU-Tier Detection und Fallback
- [ ] Graceful Degradation bei WebGL-Fehler

### Performance
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 95
- [ ] CLS = 0
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] JS Bundle < 350KB gzipped
- [ ] Passive Event Listeners überall
- [ ] requestAnimationFrame für alle Echtzeit-Updates

### Accessibility
- [ ] Skip Navigation Link
- [ ] Alle Bilder haben alt-Text
- [ ] ARIA Labels auf Buttons und Links
- [ ] Fokus-Ring sichtbar
- [ ] `prefers-reduced-motion` respektiert
- [ ] Kein Custom Cursor auf Touch-Geräten
- [ ] Ausreichende Farbkontraste (WCAG AA)

### SEO & Meta
- [ ] Title Tag + Meta Description
- [ ] Open Graph Tags + Image
- [ ] Twitter Card Tags
- [ ] Structured Data (JSON-LD)
- [ ] Canonical URL
- [ ] Sitemap
- [ ] robots.txt
- [ ] Favicon (SVG)

### Responsive
- [ ] Mobile (< 768px): Funktional, kein 3D
- [ ] Tablet (768-1024px): Reduzierte Effekte
- [ ] Desktop (> 1024px): Voller Umfang
- [ ] Ultrawide (> 1920px): Container begrenzt

### Browser-Kompatibilität
- [ ] Chrome (latest)
- [ ] Safari (latest) — backdrop-filter Fix
- [ ] Firefox (latest) — Scrollbar Fix
- [ ] Edge (latest)
- [ ] iOS Safari — dvh Fix
- [ ] Android Chrome

---

## ✅ PROJEKT ABGESCHLOSSEN

Wenn alle Checkboxen abgehakt sind, ist die Website bereit für Launch. Die Website sollte sich anfühlen wie ein Awwwards-Gewinner: cinematisch, interaktiv, performant und unvergesslich.

**Nächste Schritte nach Launch:**
1. Echte Projektbilder einpflegen (WebP, optimiert)
2. Analytics einrichten (Vercel Analytics / Plausible)
3. Bei Awwwards einreichen (awwwards.com/submit)
4. Laufende Performance-Monitoring
