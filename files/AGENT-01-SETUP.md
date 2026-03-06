# 🏗️ AGENT-01: Projekt-Setup & Scaffolding

## Rolle
Du bist ein Senior DevOps Engineer. Deine Aufgabe ist es, das komplette Projekt-Fundament aufzusetzen — sauber, modern und ohne Kompromisse.

## Voraussetzungen
- Node.js ≥ 20 installiert
- pnpm installiert (`npm install -g pnpm`)
- Git initialisiert

---

## Schritt 1: Next.js Projekt erstellen

```bash
pnpm create next-app@latest portfolio --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
cd portfolio
```

Wähle bei allen Prompts die empfohlenen Defaults (App Router, src/, Turbopack).

---

## Schritt 2: Dependencies installieren

### Core Animation & 3D

```bash
# GSAP mit Premium-Plugins (kostenlos für öffentliche Projekte seit 2024)
pnpm add gsap @gsap/react

# 3D Engine
pnpm add three @react-three/fiber @react-three/drei @types/three

# Smooth Scrolling
pnpm add lenis

# Motion Library für Layout-Animationen
pnpm add framer-motion

# Utilities
pnpm add clsx tailwind-merge
```

### Dev Dependencies

```bash
pnpm add -D @types/node prettier eslint-config-prettier
```

---

## Schritt 3: Tailwind CSS 4 konfigurieren

Ersetze `tailwind.config.ts` komplett:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dunkles, cinematisches Farbschema
        bg: {
          primary: "#050505",      // Fast-Schwarz (OLED)
          secondary: "#0a0a0a",    // Leicht heller
          elevated: "#111111",     // Karten-Hintergrund
        },
        text: {
          primary: "#f5f5f0",      // Warmes Weiß
          secondary: "#8a8a80",    // Gedämpftes Grau
          muted: "#4a4a45",        // Sehr gedämpft
        },
        accent: {
          primary: "#c8ff00",      // Elektro-Lime (Signature Farbe)
          secondary: "#00d4ff",    // Cyan Glow
          warm: "#ff6b35",         // Warmes Orange für Hover
        },
        glass: {
          border: "rgba(255,255,255,0.06)",
          bg: "rgba(255,255,255,0.02)",
          hover: "rgba(255,255,255,0.05)",
        },
      },
      fontFamily: {
        display: ["var(--font-clash)", "system-ui", "sans-serif"],
        body: ["var(--font-satoshi)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        // Fluid Typography Scale
        "display-xl": "clamp(4rem, 12vw, 12rem)",
        "display-lg": "clamp(3rem, 8vw, 8rem)",
        "display-md": "clamp(2rem, 5vw, 5rem)",
        "display-sm": "clamp(1.5rem, 3vw, 3rem)",
        "body-lg": "clamp(1.125rem, 1.5vw, 1.5rem)",
        "body-md": "clamp(1rem, 1.2vw, 1.25rem)",
        "body-sm": "clamp(0.875rem, 1vw, 1rem)",
        "caption": "clamp(0.75rem, 0.8vw, 0.875rem)",
      },
      spacing: {
        "section": "clamp(8rem, 15vh, 16rem)",
        "section-sm": "clamp(4rem, 8vh, 8rem)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1000": "1000ms",
        "1200": "1200ms",
      },
      animation: {
        "grain": "grain 8s steps(10) infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "20%": { transform: "translate(-15%, 5%)" },
          "30%": { transform: "translate(7%, -25%)" },
          "40%": { transform: "translate(-5%, 25%)" },
          "50%": { transform: "translate(-15%, 10%)" },
          "60%": { transform: "translate(15%, 0%)" },
          "70%": { transform: "translate(0%, 15%)" },
          "80%": { transform: "translate(3%, 35%)" },
          "90%": { transform: "translate(-10%, 10%)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Schritt 4: Globale Styles einrichten

Ersetze `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================
   CSS Custom Properties (Design Tokens)
   ============================================ */
:root {
  /* Colors */
  --color-bg-primary: #050505;
  --color-bg-secondary: #0a0a0a;
  --color-bg-elevated: #111111;
  --color-text-primary: #f5f5f0;
  --color-text-secondary: #8a8a80;
  --color-text-muted: #4a4a45;
  --color-accent-primary: #c8ff00;
  --color-accent-secondary: #00d4ff;
  --color-accent-warm: #ff6b35;

  /* Spacing */
  --section-padding: clamp(8rem, 15vh, 16rem);
  --container-max: 1440px;
  --container-padding: clamp(1.5rem, 4vw, 4rem);

  /* Transitions */
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
  --duration-fast: 300ms;
  --duration-medium: 600ms;
  --duration-slow: 1000ms;
  --duration-ultra: 1500ms;

  /* Z-Index Scale */
  --z-behind: -1;
  --z-base: 0;
  --z-above: 10;
  --z-nav: 100;
  --z-overlay: 200;
  --z-cursor: 9999;
}

/* ============================================
   Base Reset & Overrides
   ============================================ */
@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    scroll-behavior: auto; /* Lenis übernimmt */
  }

  body {
    min-height: 100vh;
    overflow-x: hidden;
    background-color: var(--color-bg-primary);
  }

  /* Smooth Scrolling deaktivieren wenn User das will */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Selection Styling */
  ::selection {
    background-color: var(--color-accent-primary);
    color: var(--color-bg-primary);
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 4px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--color-text-muted);
    border-radius: 2px;
  }

  /* Links Reset */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Image Reset */
  img, video, canvas {
    display: block;
    max-width: 100%;
  }

  /* Button Reset */
  button {
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
    color: inherit;
  }
}

/* ============================================
   Utility Classes
   ============================================ */
@layer utilities {
  .container-custom {
    max-width: var(--container-max);
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--container-padding);
    padding-right: var(--container-padding);
  }

  /* Hide native cursor when custom cursor is active */
  .cursor-hidden * {
    cursor: none !important;
  }

  /* GPU-beschleunigtes Element */
  .gpu {
    transform: translateZ(0);
    will-change: transform;
    backface-visibility: hidden;
  }

  /* Perspective Container für 3D Cards */
  .perspective-2000 {
    perspective: 2000px;
  }

  .preserve-3d {
    transform-style: preserve-3d;
  }

  /* Text Gradient */
  .text-gradient-accent {
    background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Glassmorphism */
  .glass {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .glass-hover {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

/* ============================================
   Noise / Grain Overlay (wird via SVG geladen)
   ============================================ */
.grain-overlay {
  position: fixed;
  inset: -50%;
  width: 200%;
  height: 200%;
  z-index: var(--z-overlay);
  pointer-events: none;
  opacity: 0.035;
  animation: grain 8s steps(10) infinite;
}
```

---

## Schritt 5: Fonts einrichten

### Option A: Lokale Fonts (empfohlen für Performance)

Lade diese Fonts herunter und speichere sie in `public/fonts/`:
- **Clash Display Variable** (von fontshare.com — kostenlos)
- **Satoshi Variable** (von fontshare.com — kostenlos)

Falls nicht möglich, nutze Option B.

### Option B: Google Fonts als Fallback

In `src/app/layout.tsx`:

```typescript
import { Inter } from "next/font/google";
import localFont from "next/font/local";

// Primär: Versuche lokale Fonts
const clashDisplay = localFont({
  src: [
    { path: "../../public/fonts/ClashDisplay-Variable.woff2", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const satoshi = localFont({
  src: [
    { path: "../../public/fonts/Satoshi-Variable.woff2", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// Serif für Mixed Typography
const instrumentSerif = localFont({
  src: [
    { path: "../../public/fonts/InstrumentSerif-Regular.woff2", style: "normal" },
    { path: "../../public/fonts/InstrumentSerif-Italic.woff2", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
  fallback: ["Georgia", "serif"],
});
```

**WICHTIG:** Falls die lokalen Font-Dateien nicht verfügbar sind, nutze Google Fonts:

```typescript
import { Instrument_Serif, DM_Sans } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-satoshi", // nutze gleiche Variable
  display: "swap",
});
```

---

## Schritt 6: Root Layout erstellen

Erstelle `src/app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from "next";
import "./globals.css";

// Fonts hier importieren (siehe Schritt 5)

export const metadata: Metadata = {
  title: "[DEIN NAME] — Fullstack Developer & Digital Experience Engineer",
  description:
    "I build digital experiences that don't just work — they fascinate. Fullstack Developer specializing in React, Next.js, AI Integration & Premium Web Experiences.",
  keywords: [
    "Fullstack Developer",
    "Web Developer",
    "React",
    "Next.js",
    "TypeScript",
    "AI Integration",
    "Digital Experience",
  ],
  authors: [{ name: "[DEIN NAME]" }],
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://[DEINE-DOMAIN].com",
    title: "[DEIN NAME] — Fullstack Developer",
    description: "I build digital experiences that fascinate.",
    siteName: "[DEIN NAME]",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "[DEIN NAME] Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "[DEIN NAME] — Fullstack Developer",
    description: "I build digital experiences that fascinate.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${clashDisplay.variable} ${satoshi.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg-primary text-text-primary font-body antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
```

---

## Schritt 7: Utility-Funktionen erstellen

Erstelle `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes intelligently */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Linear interpolation */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/** Clamp value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Map a value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/** Get scroll progress (0-1) of an element */
export function getScrollProgress(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const elementTop = rect.top;
  const elementHeight = rect.height;

  const progress = 1 - (elementTop + elementHeight) / (windowHeight + elementHeight);
  return clamp(progress, 0, 1);
}

/** Check if device supports hover (no touch) */
export function supportsHover(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover)").matches;
}

/** Check prefers-reduced-motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

---

## Schritt 8: Konstanten / Projektdaten

Erstelle `src/lib/constants.ts`:

```typescript
export const SITE_CONFIG = {
  name: "[DEIN NAME]",
  title: "Fullstack Developer & Digital Experience Engineer",
  tagline: "Code that feels alive",
  email: "hello@[DEINE-DOMAIN].com",
  socials: {
    github: "https://github.com/[DEIN-USERNAME]",
    linkedin: "https://linkedin.com/in/[DEIN-USERNAME]",
    twitter: "https://twitter.com/[DEIN-USERNAME]",
  },
} as const;

export const MANIFESTO_TEXT =
  "I build digital experiences that don't just work — they fascinate. Every pixel, every interaction, every millisecond is intentional. I craft software that moves people.";

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  tech: string[];
  description: string;
  image: string;
  color: string; // Accent-Farbe für Glow
}

export const PROJECTS: Project[] = [
  {
    id: "nexus",
    title: "Nexus Neural UI",
    subtitle: "AI-Powered Web Application",
    category: "Fullstack / AI",
    year: "2025",
    tech: ["React", "Next.js", "Python", "OpenAI", "PostgreSQL"],
    description:
      "An intelligent interface that adapts to user behavior through neural pattern recognition and real-time AI inference.",
    image: "/images/projects/nexus-hero.webp",
    color: "#c8ff00",
  },
  {
    id: "aura",
    title: "Aura FinTech",
    subtitle: "Native iOS Banking Experience",
    category: "Mobile / Finance",
    year: "2025",
    tech: ["Swift", "SwiftUI", "Core Data", "Plaid API"],
    description:
      "A premium banking experience with biometric security, real-time analytics and gesture-driven navigation.",
    image: "/images/projects/aura-hero.webp",
    color: "#00d4ff",
  },
  {
    id: "flow",
    title: "Flow State Logic",
    subtitle: "Workflow Automation Platform",
    category: "SaaS / Automation",
    year: "2024",
    tech: ["Next.js", "n8n", "PostgreSQL", "Docker", "AWS"],
    description:
      "Enterprise workflow automation that reduces manual processes by 80% through intelligent pipeline orchestration.",
    image: "/images/projects/flow-hero.webp",
    color: "#ff6b35",
  },
];

export const EXPERTISE = [
  {
    title: "Fullstack Architecture",
    description: "Scalable systems from pixel-perfect frontends to resilient backend infrastructure.",
    icon: "layers",
  },
  {
    title: "AI & Automation",
    description: "LLM integration, custom agents, n8n/Make workflows that eliminate friction.",
    icon: "brain",
  },
  {
    title: "Digital Experience",
    description: "Award-level interfaces with 3D, animation and obsessive attention to detail.",
    icon: "sparkles",
  },
] as const;

export const TECH_STACK = [
  "React", "Next.js", "TypeScript", "Node.js", "Python",
  "PostgreSQL", "AWS", "Docker", "Swift", "Three.js",
  "GSAP", "Framer Motion", "Tailwind CSS", "Prisma", "Redis",
] as const;

export const NAV_ITEMS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Expertise", href: "#expertise" },
  { label: "Contact", href: "#contact" },
] as const;
```

---

## Schritt 9: TypeScript Types

Erstelle `src/types/index.ts`:

```typescript
export interface MousePosition {
  x: number;
  y: number;
  normalizedX: number; // -1 bis 1
  normalizedY: number; // -1 bis 1
}

export interface ScrollState {
  progress: number;    // 0-1 über gesamte Seite
  velocity: number;    // Scroll-Geschwindigkeit
  direction: "up" | "down";
}

export interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}
```

---

## Schritt 10: Cursor Rules für Cursor AI

Erstelle `.cursorrules` im Projekt-Root:

```
Du bist ein Expert-Level Fullstack Developer der eine Award-Winning Portfolio Website baut.

TECH STACK:
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Three.js + @react-three/fiber + @react-three/drei
- GSAP (ScrollTrigger)
- Lenis (Smooth Scroll)
- Framer Motion

DESIGN REGELN:
- OLED-Schwarz (#050505) als Basis
- Mixed Typography: Bold Sans-Serif + Italic Serif
- Signature Color: Elektro-Lime (#c8ff00)
- Glassmorphism für Karten und Navigation
- Film Grain Overlay für Textur
- KEIN generisches Template-Design
- KEINE Standard-Fade-Ins — nur Scroll-Driven Animations

CODE REGELN:
- Alle Komponenten als React Server Components wo möglich
- "use client" nur wo nötig (Animationen, Interaktionen)
- Performance: Nur transform und opacity animieren
- requestAnimationFrame für Mouse/Scroll Events
- Passive Event Listeners für Scroll
- Responsive: Mobile-First Approach
- prefers-reduced-motion respektieren
- TypeScript strict mode
- Saubere Imports mit @/ Alias

ANIMATION REGELN:
- GSAP ScrollTrigger für scroll-basierte Animationen
- Lenis für Smooth Scrolling
- Framer Motion für Layout-Animationen und Exits
- Three.js für 3D-Hintergründe
- Alle Animationen müssen bei 60fps laufen
- Hardware-Acceleration via translate3d/will-change

DATEI-KONVENTIONEN:
- Komponenten: PascalCase (z.B. Hero.tsx)
- Hooks: camelCase mit use-Prefix (z.B. useScrollProgress.ts)
- Utilities: camelCase (z.B. utils.ts)
- Styles: globals.css + Tailwind
```

---

## Schritt 11: Next.js Config

Ersetze `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Transpile Three.js Packages
  transpilePackages: ["three"],

  // Bilder-Optimierung
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack Konfiguration für GLSL Shader
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader"],
    });
    return config;
  },

  // Headers für Performance
  async headers() {
    return [
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Schritt 12: Placeholder-Struktur erstellen

Erstelle alle Verzeichnisse:

```bash
mkdir -p public/fonts
mkdir -p public/images/projects
mkdir -p public/shaders
mkdir -p src/components/canvas/shaders
mkdir -p src/components/sections
mkdir -p src/components/ui
mkdir -p src/components/providers
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/types
```

Erstelle eine minimale `src/app/page.tsx`:

```typescript
export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="h-screen flex items-center justify-center">
        <h1 className="text-display-xl font-display font-bold tracking-tighter">
          Setup <span className="font-serif italic font-light text-text-secondary">complete</span>
        </h1>
      </div>
    </main>
  );
}
```

---

## Verifikation

Nach Abschluss aller Schritte:

```bash
pnpm dev
```

✅ Die Seite muss auf `localhost:3000` laden
✅ "Setup complete" muss in Mixed Typography angezeigt werden
✅ Schwarzer Hintergrund, warmes Weiß als Textfarbe
✅ Keine Konsolen-Fehler
✅ TypeScript kompiliert fehlerfrei

**→ Weiter mit AGENT-02-DESIGN-SYSTEM.md**
