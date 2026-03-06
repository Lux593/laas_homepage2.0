# 🎯 MASTER-PLAN: Award-Winning Portfolio Website

## Projektübersicht

Dieses Dokument ist der **zentrale Orchestrator** für den Bau einer hochprofessionellen, preiswürdigen Portfolio-Website. Das Ziel: Eine Website, die sich anfühlt wie ein Awwwards Site of the Day — mit Scrollytelling, 3D-Animationen, Custom Cursor, Parallax-Effekten und einem Design, das Besucher nicht vergessen.

**Referenz-Standard:** Framer-Showcase-Websites, Awwwards Winners, FWA-Gewinner.
**Anti-Ziel:** Kein Standard-Kachel-Design. Keine generischen Templates. Keine langweiligen Fade-Ins.

---

## Tech Stack

| Kategorie | Technologie | Warum |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | SSR, Performance, Image Optimization, Routing |
| Sprache | **TypeScript** | Typsicherheit, bessere DX |
| Styling | **Tailwind CSS 4** + Custom CSS | Utility-First + Custom Animations |
| 3D / WebGL | **Three.js + @react-three/fiber + @react-three/drei** | 3D-Hintergründe, Partikel, Shader |
| Animationen | **GSAP (ScrollTrigger + SplitText)** | Industrie-Standard für Scroll-Animationen |
| Scroll-Engine | **Lenis** | Butter-smooth Scrolling |
| Motion Library | **Framer Motion** | Layout-Animationen, Page Transitions |
| Fonts | **Google Fonts: Instrument Serif + Satoshi / Clash Display** | Editorial Mixed Typography |
| Deployment | **Vercel** | Zero-Config, Edge Network, Analytics |
| Paketmanager | **pnpm** | Schneller, platzsparender |

---

## Agenten-System: Reihenfolge & Abhängigkeiten

```
AGENT-01-SETUP ──────────────────────────────► Projekt-Scaffolding & Dependencies
       │
       ▼
AGENT-02-DESIGN-SYSTEM ─────────────────────► Farben, Typografie, Tokens, Globals
       │
       ▼
AGENT-03-3D-ENGINE ─────────────────────────► WebGL Background, Partikel, Shader
       │
       ▼
AGENT-04-SCROLLYTELLING ────────────────────► Lenis, GSAP ScrollTrigger, Parallax
       │
       ▼
AGENT-05-SECTIONS ──────────────────────────► Hero, Manifesto, Work, Bento, CTA
       │
       ▼
AGENT-06-MICRO-INTERACTIONS ────────────────► Custom Cursor, Hover FX, Magnetic Buttons
       │
       ▼
AGENT-07-VISUAL-POLISH ─────────────────────► Grain, Glows, Glassmorphism, Transitions
       │
       ▼
AGENT-08-PERFORMANCE-QA ────────────────────► Lighthouse, A11y, Responsive, Final QA
       │
       ▼
AGENT-09-REFINER (♻️ Loop) ────────────────► Analyse → Priorisieren → Verbessern → Verifizieren
```

---

## Ausführungs-Anweisungen für Cursor AI

### Globale Regeln für JEDEN Agenten:

1. **Lies IMMER die komplette Agent-Datei** bevor du Code schreibst.
2. **Installiere fehlende Dependencies** selbstständig via `pnpm add`.
3. **Nutze das Internet** für aktuelle Docs, API-Referenzen, Beispiele.
4. **Erstelle KEINE Platzhalter** — jede Zeile Code muss funktionieren.
5. **Teste nach jedem Schritt** mit `pnpm dev` und behebe Fehler sofort.
6. **Committe nach jedem Agent** mit einer klaren Message.
7. **Kommentiere komplexen Code** auf Englisch für Wartbarkeit.
8. **Keine AI-Slop-Ästhetik** — kein Inter, kein Roboto, keine lila Gradienten auf Weiß.

### Reihenfolge:

Führe die Agenten **strikt in der Reihenfolge 01 → 08** aus. Jeder Agent baut auf dem vorherigen auf. Überspringe KEINEN Agenten.

### Starten:

```bash
# Öffne dieses Projekt in Cursor
# Sag dem Agenten:
"Lies MASTER-PLAN.md und starte mit AGENT-01-SETUP.md. Führe jeden Schritt vollständig aus."
```

### Nach jedem Agenten:

```bash
# Verifiziere dass alles kompiliert
pnpm dev

# Dann weiter zum nächsten:
"Lies AGENT-0X-[NAME].md und führe jeden Schritt vollständig aus."
```

---

## Dateistruktur (Ziel nach Abschluss aller Agenten)

```
portfolio/
├── public/
│   ├── fonts/
│   │   ├── ClashDisplay-Variable.woff2
│   │   └── Satoshi-Variable.woff2
│   ├── images/
│   │   ├── projects/
│   │   │   ├── nexus-hero.webp
│   │   │   ├── aura-hero.webp
│   │   │   └── flow-hero.webp
│   │   └── og-image.png
│   ├── shaders/
│   │   ├── vertex.glsl
│   │   └── fragment.glsl
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root Layout + Fonts + Metadata
│   │   ├── page.tsx                ← Haupt-Seite (orchestriert alle Sections)
│   │   ├── globals.css             ← CSS Variables, Resets, Custom Utilities
│   │   └── loading.tsx             ← Preloader Animation
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Scene.tsx           ← R3F Canvas Wrapper
│   │   │   ├── ParticleField.tsx   ← 3D Partikel-Hintergrund
│   │   │   ├── FloatingShapes.tsx  ← Abstrakte 3D-Formen
│   │   │   └── shaders/
│   │   │       ├── particles.vert  ← Vertex Shader
│   │   │       └── particles.frag  ← Fragment Shader
│   │   ├── sections/
│   │   │   ├── Hero.tsx            ← Hero Section mit Mouse Parallax
│   │   │   ├── Manifesto.tsx       ← Scroll-Linked Text Highlight
│   │   │   ├── SelectedWork.tsx    ← 3D Flip Project Cards
│   │   │   ├── BentoGrid.tsx       ← Asymmetrische Expertise-Kacheln
│   │   │   └── GiganticCTA.tsx     ← Conversion Footer
│   │   ├── ui/
│   │   │   ├── CustomCursor.tsx    ← Blend-Mode Cursor
│   │   │   ├── MagneticButton.tsx  ← Magnetic Hover Effect
│   │   │   ├── Navigation.tsx      ← Glassmorphism Nav
│   │   │   ├── TextReveal.tsx      ← Reusable Scroll Text Animation
│   │   │   ├── SplitText.tsx       ← GSAP SplitText Wrapper
│   │   │   ├── GrainOverlay.tsx    ← Film Grain SVG Overlay
│   │   │   └── Preloader.tsx       ← Initialer Ladebildschirm
│   │   └── providers/
│   │       ├── SmoothScroll.tsx    ← Lenis Provider
│   │       └── AnimationProvider.tsx ← GSAP Context Provider
│   ├── hooks/
│   │   ├── useScrollProgress.ts    ← Scroll-Position 0-1
│   │   ├── useMousePosition.ts     ← Maus-Tracking mit rAF
│   │   ├── useInView.ts            ← Intersection Observer
│   │   └── useMediaQuery.ts        ← Responsive Breakpoints
│   ├── lib/
│   │   ├── animations.ts           ← GSAP Animation Presets
│   │   ├── constants.ts            ← Projekt-Daten, Links, etc.
│   │   └── utils.ts                ← Hilfsfunktionen (lerp, clamp, map)
│   └── types/
│       └── index.ts                ← TypeScript Interfaces
├── .cursorrules                    ← Cursor AI Konfiguration
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Inhaltliche Sektionen (Content-Strategie)

### 1. Hero Section
- **Headline:** "Code that *feels* alive" (Mixed Typography: Bold Sans + Italic Serif)
- **Subline:** "Fullstack Developer & Digital Experience Engineer"
- **Visuell:** 3D-Partikel-Hintergrund, Mouse Parallax, Floating Glows

### 2. Manifesto (About Me)
- **Text:** "I build digital experiences that don't just work — they fascinate. Every pixel, every interaction, every millisecond is intentional. I craft software that moves people."
- **Effekt:** Wort-für-Wort Scroll-Highlight

### 3. Selected Work (3 Projekte)
- **Nexus Neural UI** — AI-Powered Web Application / React + Python + OpenAI
- **Aura FinTech** — Native iOS Banking Experience / Swift + SwiftUI
- **Flow State Logic** — Workflow Automation Platform / Next.js + n8n + PostgreSQL
- **Effekt:** 3D-Flip-Cards die beim Scrollen rotieren

### 4. Bento Grid (Expertise)
- **Fullstack Architecture** — Skalierbare Systeme von Frontend bis Backend
- **AI & Automation** — LLM-Integration, n8n, Make, Custom Agents
- **Tech Stack** — React, Next.js, TypeScript, Node.js, Python, PostgreSQL, AWS, Docker
- **Effekt:** Staggered Reveal, Hover-Glow, asymmetrisches Layout

### 5. Gigantic CTA
- **Headline:** "Ready to build something extraordinary?"
- **CTA Button:** "Start a project" → mailto / Calendly
- **Effekt:** Riesige Typografie, Magnetic Button, Background Glow Animation

---

## Qualitätskriterien (Definition of Done)

- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Alle Animationen bei 60fps auf Mid-Range Devices
- [ ] Smooth Scroll funktioniert auf allen Browsern
- [ ] Responsive: Mobile, Tablet, Desktop, Ultrawide
- [ ] Preloader Animation beim ersten Laden
- [ ] Custom Cursor funktioniert (deaktiviert auf Touch-Geräten)
- [ ] Kein Layout Shift (CLS = 0)
- [ ] Alle Bilder als WebP mit next/image optimiert
- [ ] Meta Tags + OG Image für Social Sharing
- [ ] Favicon + Apple Touch Icon
- [ ] Animationen respektieren `prefers-reduced-motion`
- [ ] Kein sichtbares Flackern oder Ruckeln
- [ ] 3D-Szene fällt graceful auf 2D zurück bei schwachen GPUs
