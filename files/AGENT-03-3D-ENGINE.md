# 🌌 AGENT-03: 3D Engine & WebGL Hintergrund

## Rolle
Du bist ein Creative Technologist / WebGL Engineer. Deine Aufgabe: Einen atemberaubenden, interaktiven 3D-Hintergrund mit Three.js erstellen, der auf Mausbewegungen und Scroll reagiert — subtil genug um den Content nicht zu stören, aber beeindruckend genug um den "Wow"-Effekt zu erzeugen.

## Voraussetzung
AGENT-01 + AGENT-02 abgeschlossen. Dependencies Three.js, @react-three/fiber, @react-three/drei installiert.

---

## Konzept

Der 3D-Hintergrund besteht aus drei Layern:

1. **Particle Field** — Tausende kleine Partikel die sich langsam bewegen und auf Maus reagieren
2. **Floating Geometric Shapes** — Abstrakte, halbtransparente 3D-Formen die rotieren
3. **Animated Glow Spheres** — Große, verschwommene Lichtquellen die Farbe und Position wechseln

Alle drei Layer reagieren auf:
- **Mausbewegung** (leichte Verschiebung / Parallax)
- **Scroll-Position** (Rotation, Farbe, Intensität ändern sich pro Section)
- **Zeit** (sanftes, autonomes Floating)

---

## Schritt 1: R3F Scene Wrapper

Erstelle `src/components/canvas/Scene.tsx`:

```typescript
"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import * as THREE from "three";
import ParticleField from "./ParticleField";
import FloatingShapes from "./FloatingShapes";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/** Maus-Tracking innerhalb der 3D-Szene */
function MouseTracker() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useFrame(() => {
    // Lerp für smoothe Bewegung
    mouse.current.x += (target.current.x - mouse.current.x) * 0.05;
    mouse.current.y += (target.current.y - mouse.current.y) * 0.05;

    // Kamera reagiert subtil auf Maus
    camera.position.x = mouse.current.x * 0.3;
    camera.position.y = mouse.current.y * 0.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/** Scroll-basierte Szenen-Anpassung */
function ScrollEffects() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollY / maxScroll;

    // Sanfte Rotation basierend auf Scroll
    groupRef.current.rotation.y = progress * Math.PI * 0.5;
    groupRef.current.rotation.x = Math.sin(progress * Math.PI) * 0.1;
  });

  return <group ref={groupRef} />;
}

export default function Scene() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Kein 3D auf Mobile oder bei reduced motion
  if (!mounted || reducedMotion) return null;

  const particleCount = isMobile ? 800 : 3000;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.7 }}
    >
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 60,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: false,
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <MouseTracker />
          <ambientLight intensity={0.15} />

          {/* Partikel-Feld */}
          <ParticleField count={particleCount} />

          {/* Floating Shapes */}
          <FloatingShapes />

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

---

## Schritt 2: Particle Field mit Custom Shader

Erstelle `src/components/canvas/ParticleField.tsx`:

```typescript
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Vertex Shader
const vertexShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2 uMouse;

  attribute float aScale;
  attribute float aSpeed;
  attribute vec3 aRandomness;

  varying float vAlpha;
  varying float vDistance;

  void main() {
    vec3 pos = position;

    // Autonome Bewegung (Floating)
    pos.x += sin(uTime * aSpeed * 0.3 + aRandomness.x * 6.28) * 0.5;
    pos.y += cos(uTime * aSpeed * 0.2 + aRandomness.y * 6.28) * 0.3;
    pos.z += sin(uTime * aSpeed * 0.1 + aRandomness.z * 6.28) * 0.4;

    // Maus-Interaktion: Partikel weichen der Maus aus
    vec2 mouseInfluence = uMouse * 2.0;
    float distToMouse = length(pos.xy - mouseInfluence);
    float mouseRepel = smoothstep(3.0, 0.0, distToMouse) * 0.5;
    pos.xy += normalize(pos.xy - mouseInfluence) * mouseRepel;

    // Scroll-basierte Y-Verschiebung
    pos.y += uScrollProgress * 2.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Partikelgröße (näher = größer)
    gl_PointSize = aScale * (300.0 / -mvPosition.z);

    // Alpha basierend auf Distanz zur Kamera
    vDistance = -mvPosition.z;
    vAlpha = smoothstep(20.0, 2.0, vDistance) * 0.8;
  }
`;

// Fragment Shader
const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;

  varying float vAlpha;
  varying float vDistance;

  void main() {
    // Kreisförmiger Partikel (soft circle)
    float distToCenter = length(gl_PointCoord - vec2(0.5));
    if (distToCenter > 0.5) discard;

    float alpha = smoothstep(0.5, 0.1, distToCenter) * vAlpha;

    // Farb-Gradient basierend auf Position
    float colorMix = sin(vDistance * 0.5 + uTime * 0.3) * 0.5 + 0.5;
    vec3 color = mix(uColorA, uColorB, colorMix);

    gl_FragColor = vec4(color, alpha);
  }
`;

interface ParticleFieldProps {
  count?: number;
}

export default function ParticleField({ count = 3000 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Partikel-Positionen und Attribute generieren
  const { positions, scales, speeds, randomness } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const randomness = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Sphärische Verteilung
      const radius = Math.random() * 15 + 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) - 5;

      scales[i] = Math.random() * 2 + 0.5;
      speeds[i] = Math.random() * 0.5 + 0.1;

      randomness[i3] = Math.random();
      randomness[i3 + 1] = Math.random();
      randomness[i3 + 2] = Math.random();
    }

    return { positions, scales, speeds, randomness };
  }, [count]);

  // Uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color("#c8ff00") }, // Lime
      uColorB: { value: new THREE.Color("#00d4ff") }, // Cyan
    }),
    []
  );

  // Maus-Tracking
  useMemo(() => {
    if (typeof window === "undefined") return;
    const handleMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const material = pointsRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

    // Scroll Progress
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    material.uniforms.uScrollProgress.value = maxScroll > 0 ? scrollY / maxScroll : 0;

    // Sanfte Gesamtrotation
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={count}
          array={scales}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          count={count}
          array={speeds}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          count={count}
          array={randomness}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
```

---

## Schritt 3: Floating Geometric Shapes

Erstelle `src/components/canvas/FloatingShapes.tsx`:

```typescript
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

interface FloatingShapeProps {
  position: [number, number, number];
  geometry: "torus" | "octahedron" | "icosahedron";
  scale: number;
  speed: number;
  color: string;
}

function FloatingShape({ position, geometry, scale, speed, color }: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Sanftes Floating
    meshRef.current.position.x = initialPos.x + Math.sin(t * speed * 0.5) * 0.5;
    meshRef.current.position.y = initialPos.y + Math.cos(t * speed * 0.3) * 0.3;
    meshRef.current.position.z = initialPos.z + Math.sin(t * speed * 0.2) * 0.2;

    // Rotation
    meshRef.current.rotation.x += 0.003 * speed;
    meshRef.current.rotation.y += 0.005 * speed;
    meshRef.current.rotation.z += 0.002 * speed;
  });

  const GeometryComponent = useMemo(() => {
    switch (geometry) {
      case "torus":
        return <torusGeometry args={[1, 0.4, 16, 32]} />;
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "icosahedron":
        return <icosahedronGeometry args={[1, 1]} />;
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} scale={scale}>
      {GeometryComponent}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.08}
        wireframe
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function FloatingShapes() {
  const shapes = useMemo(
    () => [
      {
        position: [-4, 2, -8] as [number, number, number],
        geometry: "torus" as const,
        scale: 1.5,
        speed: 0.6,
        color: "#c8ff00",
      },
      {
        position: [5, -1, -10] as [number, number, number],
        geometry: "octahedron" as const,
        scale: 1.2,
        speed: 0.4,
        color: "#00d4ff",
      },
      {
        position: [0, 3, -12] as [number, number, number],
        geometry: "icosahedron" as const,
        scale: 1.8,
        speed: 0.3,
        color: "#ff6b35",
      },
      {
        position: [-6, -3, -6] as [number, number, number],
        geometry: "icosahedron" as const,
        scale: 0.8,
        speed: 0.7,
        color: "#c8ff00",
      },
      {
        position: [7, 4, -14] as [number, number, number],
        geometry: "torus" as const,
        scale: 2,
        speed: 0.2,
        color: "#00d4ff",
      },
    ],
    []
  );

  return (
    <group>
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}
    </group>
  );
}
```

---

## Schritt 4: In die Hauptseite einbinden

Aktualisiere `src/app/page.tsx`:

```typescript
import dynamic from "next/dynamic";

// Dynamisch laden um SSR-Probleme mit Three.js zu vermeiden
const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  return (
    <main className="relative min-h-screen bg-bg-primary">
      {/* 3D Background (fixed, hinter allem) */}
      <Scene />

      {/* Content Layer (relativ, über dem 3D) */}
      <div className="relative z-10">
        {/* Temporärer Content zum Testen des Scroll-Effekts */}
        <section className="h-screen flex items-center justify-center">
          <h1 className="text-display-xl font-display font-bold tracking-tighter">
            3D Engine <span className="font-serif italic font-light text-text-secondary">active</span>
          </h1>
        </section>
        <section className="h-screen flex items-center justify-center">
          <p className="text-display-sm font-body text-text-secondary">Scroll to see particles react</p>
        </section>
        <section className="h-screen" />
      </div>
    </main>
  );
}
```

---

## Schritt 5: Performance-Optimierungen

### GPU Detection & Fallback

Erstelle `src/lib/gpu-detect.ts`:

```typescript
/**
 * Erkennt ob die GPU leistungsfähig genug für die 3D-Szene ist.
 * Gibt ein Tier zurück: "high", "medium", "low"
 */
export function detectGPUTier(): "high" | "medium" | "low" {
  if (typeof window === "undefined") return "medium";

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "low";

    const glContext = gl as WebGLRenderingContext;
    const debugInfo = glContext.getExtension("WEBGL_debug_renderer_info");

    if (debugInfo) {
      const renderer = glContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

      // High-End GPUs
      if (
        renderer.includes("nvidia") ||
        renderer.includes("radeon rx") ||
        renderer.includes("apple m") ||
        renderer.includes("apple gpu")
      ) {
        return "high";
      }

      // Low-End / Integrated
      if (
        renderer.includes("intel") ||
        renderer.includes("mali") ||
        renderer.includes("adreno 5") ||
        renderer.includes("swiftshader")
      ) {
        return "low";
      }
    }

    return "medium";
  } catch {
    return "medium";
  }
}

export function getParticleCount(tier: "high" | "medium" | "low"): number {
  switch (tier) {
    case "high": return 5000;
    case "medium": return 2000;
    case "low": return 500;
  }
}
```

---

## Verifikation

```bash
pnpm dev
```

✅ 3D-Partikelfeld ist sichtbar (Lime + Cyan Partikel)
✅ Partikel reagieren auf Mausbewegung
✅ Wireframe-Shapes floaten im Hintergrund
✅ Beim Scrollen ändert sich die Perspektive
✅ Performance ist flüssig (60fps)
✅ Auf Mobile wird die 3D-Szene nicht geladen (oder mit weniger Partikeln)
✅ `prefers-reduced-motion` deaktiviert 3D komplett

**→ Weiter mit AGENT-04-SCROLLYTELLING.md**
