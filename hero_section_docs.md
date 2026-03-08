# Hero Section – Technische Dokumentation

Vollständige Beschreibung des Aufbaus der Hero-Sektion inkl. der 3D-Animation für den Einsatz auf anderen Websites.

---

## Tech Stack

| Paket | Version | Zweck |
|---|---|---|
| `next` | 16.x | Framework (Next.js App Router) |
| `react` | 19.x | UI |
| `three` | ^0.183 | 3D-Engine |
| `@react-three/fiber` | ^9.5 | React-Wrapper für Three.js |
| `@react-three/drei` | ^10.7 | Three.js Helfer (Float, Environment, ...) |
| `framer-motion` | ^12 | Animations-Library für UI |

Installation:
```bash
npm install three @react-three/fiber @react-three/drei framer-motion
```

---

## Datei-Struktur

```
src/
├── app/
│   ├── layout.tsx          # Font (Outfit) + globale Styles + SmoothScroller
│   ├── globals.css         # CSS-Variablen, Tailwind-Theme, Lenis-Styles
│   └── page.tsx            # Einstiegspunkt – ruft <Hero /> auf
└── components/
    ├── Hero.tsx             # Die gesamte Hero-Sektion
    └── SmoothScroller.tsx   # Lenis smooth scroll wrapper
```

---

## Layout-Aufbau (`Hero.tsx`)

```
<section>                          ← Vollbild, position: relative, bg: #050505
  │
  ├── <div> (3D Canvas Layer)      ← absolute, inset-0, z-0
  │     opacity: 0.8, mix-blend-mode: screen
  │     └── <Canvas>               ← React Three Fiber
  │           ├── ambientLight
  │           ├── spotLight × 2   (Farbe: #C49F7B = Bronze-Ton)
  │           ├── <ElegantRibbon> (das 3D-Objekt)
  │           └── <Environment preset="night">
  │
  ├── <div> (Text Overlay)         ← relative, z-10, pointer-events: none
  │     ├── <h1>  "Hey, ich bin ..."  (Framer Motion fade-in from bottom)
  │     └── <div> "Ich biete / [rotierender Service-Text]"
  │           └── animierter Text-Swap (slide-up mit AnimatePresence)
  │
  └── <div> (Scroll Indicator)     ← absolute, bottom-12, centered
        ├── "SCROLL" Label
        └── Animierte vertikale Linie (Framer Motion loop)
```

---

## Das 3D-Objekt – `ElegantRibbon`

### Geometrie

```tsx
<torusKnotGeometry args={[1.5, 0.4, 256, 64, 2, 3]} />
```

| Parameter | Wert | Bedeutung |
|---|---|---|
| radius | `1.5` | Gesamtradius des Knotens |
| tube | `0.4` | Dicke des Schlauchs |
| tubularSegments | `256` | Segmente entlang des Pfads (hohe Qualität) |
| radialSegments | `64` | Segmente im Querschnitt |
| p | `2` | Wicklungen um die Symmetrieachse |
| q | `3` | Wicklungen durch das Loch |

### Material

```tsx
<meshPhysicalMaterial
  color="#0a0a0a"          // Fast schwarz – die Bronze kommt nur durch Reflexionen
  emissive="#1a120b"       // Leicht warmes Eigenleuchten
  roughness={0.1}          // Sehr glatt/spiegelnd
  metalness={0.9}          // Fast vollständig metallisch
  clearcoat={1}            // Hochglanz-Lack-Effekt
  clearcoatRoughness={0.1} // Klarer Lack
  reflectivity={1}         // Maximale Reflexionen
  envMapIntensity={2}      // Environment Map 2× verstärkt
/>
```

Der Bronzeglanz entsteht **nicht** durch die Materialfarbe, sondern durch:
1. Die zwei goldenen `spotLight`s (Farbe `#C49F7B`)
2. `Environment preset="night"` (warme Umgebungsreflexionen)
3. `mix-blend-mode: screen` des Canvas-Containers

### Float Wrapper

```tsx
<Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
```

`@react-three/drei`'s `<Float>` fügt organisches Schweben hinzu – automatisch, keine manuelle Animation nötig.

### Maus-Interaktion (`useFrame`)

```tsx
useFrame((state) => {
  // Lazy-Follow: Mouse-Position wird geglättet
  mouse.current.x += (state.pointer.x - mouse.current.x) * 0.05;
  mouse.current.y += (state.pointer.y - mouse.current.y) * 0.05;

  if (meshRef.current) {
    // Kombination: kontinuierliche Rotation + Maus-Offset
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.1 + mouse.current.y * 0.2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15 + mouse.current.x * 0.2;
    // Sinus-Bob auf Y-Achse
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  }
});
```

Der `0.05`-Faktor erzeugt das träge "Nachlaufen" der Maus.

### Kamera

```tsx
<Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
```

---

## Text-Animationen

### Headline (Framer Motion)

```tsx
<motion.h1
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
>
```

Ease `[0.16, 1, 0.3, 1]` = sanftes Expo-Out (schnell rein, weich stoppen).

### Rotierender Service-Text

Jede 2,5 Sekunden wechselt der Text per `setInterval`. Der neue Text fährt von unten rein (`y: 100% → 0%`):

```tsx
<motion.div
  key={currentServiceIndex}          // key-Wechsel triggert Re-mount
  initial={{ y: "100%", opacity: 0 }}
  animate={{ y: "0%", opacity: 1 }}
  exit={{ y: "-100%", opacity: 0 }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>
```

Ein unsichtbares `<span>` mit dem längsten Text (`"Workflow-Automationen"`) hält die Breite stabil, damit das Layout nicht springt.

### Scroll-Indikator (animierte Linie)

```tsx
<motion.div
  animate={{ top: ["-50%", "100%"] }}
  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
/>
```

Ein kurzes Element läuft in einer Endlosschleife von oben nach unten durch die Linie.

---

## CSS / Globale Styles

### Font

```tsx
// layout.tsx
import { Outfit } from "next/font/google";
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
```

`Outfit` (Google Fonts) – geometrische Groteskschrift.

### CSS-Variablen

```css
:root {
  --background: #050505;   /* Fast schwarz */
  --foreground: #fcfcfc;   /* Fast weiß */
  --bronze: #C49F7B;       /* Haupt-Akzentfarbe */
}
```

### Wichtige Tailwind-Klassen der Section

| Klasse | Bedeutung |
|---|---|
| `h-screen` | 100vh |
| `bg-[#050505]` | Hintergrundfarbe |
| `absolute inset-0 z-0` | Canvas als Hintergrundlayer |
| `opacity-80 mix-blend-screen` | 3D leuchtet durch |
| `relative z-10 pointer-events-none` | Text liegt über Canvas, blockiert keine Maus-Events |
| `overflow-hidden` | Kein Scroll-Überlauf in der Section |

---

## Anpassungen für andere Projekte

### Objekt wechseln

Statt `torusKnotGeometry` können andere Geometrien eingesetzt werden:

```tsx
<sphereGeometry args={[1.5, 64, 64]} />
<icosahedronGeometry args={[1.5, 5]} />
<octahedronGeometry args={[1.5, 3]} />
```

Für organisch verzerrte Oberflächen kann auch `<MeshDistortMaterial>` aus `@react-three/drei` genutzt werden:

```tsx
import { MeshDistortMaterial } from "@react-three/drei";
<MeshDistortMaterial distort={0.4} speed={2} color="#0a0a0a" metalness={0.9} />
```

### Farbe anpassen

Die Bronze-Farbe `#C49F7B` taucht an drei Stellen auf:
1. `spotLight color="#C49F7B"` → Lichtfarbe auf dem Objekt
2. Scroll-Indikator: `text-[#DFBE9F]` / `bg-[#C49F7B]`
3. CSS-Variable `--bronze`

Alle drei ersetzen um die Akzentfarbe zu ändern.

### Ohne Next.js

Die `Hero.tsx` Komponente funktioniert auch in reinem React (Vite etc.) – einzige Änderung: Font-Import aus Google Fonts via `<link>` im HTML statt `next/font`.

---

## Minimales Standalone-Beispiel

```tsx
"use client"; // nur Next.js

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

function Shape() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.15 + pointer.x * 0.2;
    ref.current.rotation.x = clock.elapsedTime * 0.1 + pointer.y * 0.2;
  });
  return (
    <Float speed={2} floatIntensity={0.5}>
      <mesh ref={ref} scale={0.7}>
        <torusKnotGeometry args={[1.5, 0.4, 256, 64, 2, 3]} />
        <meshPhysicalMaterial
          color="#0a0a0a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  );
}

export default function Hero() {
  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", background: "#050505" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.8, mixBlendMode: "screen" }}>
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 10, 10]} intensity={1.5} color="#C49F7B" />
          <Shape />
          <Environment preset="night" />
        </Canvas>
      </div>
      <div style={{ position: "relative", zIndex: 10, padding: "0 4rem", color: "white" }}>
        <h1>Dein Titel hier.</h1>
      </div>
    </section>
  );
}
```
