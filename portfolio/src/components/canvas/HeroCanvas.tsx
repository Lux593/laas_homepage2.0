"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Lightformer, Preload } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { heroScroll } from "@/lib/heroScroll";

const CAMERA_Z = 7;

function ElegantRibbon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0, y: 0 });
  // Rotation wird akkumuliert statt aus clock.elapsedTime abgeleitet: die
  // Scroll-Dämpfung unten würde einen elapsedTime-Term sonst schrumpfen lassen
  // und das Objekt sichtbar rückwärts drehen.
  const spin = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    // frameloop pausiert das Canvas außerhalb des Heros — der erste Frame danach
    // hätte sonst ein riesiges delta und würde die Rotation springen lassen.
    const dt = Math.min(delta, 0.1);
    const p = heroScroll.progress;

    // Lazy-follow: smooth mouse tracking
    mouse.current.x += (state.pointer.x - mouse.current.x) * 0.05;
    mouse.current.y += (state.pointer.y - mouse.current.y) * 0.05;

    // Kamera fährt beim Scrollen zurück — das ist der eigentliche Tiefeneffekt,
    // der DOM-Wrapper skaliert nur zusätzlich.
    state.camera.position.z = CAMERA_Z + p * 4.5;

    if (meshRef.current) {
      const damp = 1 - p * 0.6;
      spin.current.x += dt * 0.1 * damp;
      spin.current.y += dt * 0.15 * damp;

      meshRef.current.rotation.x = spin.current.x + mouse.current.y * 0.2;
      meshRef.current.rotation.y = spin.current.y + mouse.current.x * 0.2;
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.2 * damp;
      meshRef.current.scale.setScalar(0.7 - p * 0.28);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={0.7}>
        <torusKnotGeometry args={[1.5, 0.4, 256, 64, 2, 3]} />
        <meshPhysicalMaterial
          color="#0a0a0a"
          emissive="#1a120b"
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  );
}

export default function HeroCanvas({ active = true }: { active?: boolean }) {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) return null;

  return (
    <Canvas
      // Sobald der Hero durchgescrollt ist, wird der Renderloop gestoppt —
      // spart GPU/Akku auf dem gesamten Rest der Seite.
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, CAMERA_Z], fov: 45 }}
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <spotLight
          position={[10, 10, 10]}
          intensity={1.5}
          color="#C49F7B"
          angle={0.6}
          penumbra={1}
        />
        <spotLight
          position={[-10, -5, 8]}
          intensity={1}
          color="#C49F7B"
          angle={0.5}
          penumbra={1}
        />

        <ElegantRibbon />

        {/* KEIN preset="night". Das Preset lädt zur Laufzeit
            dikhololo_night_1k.hdr von raw.githack.com — einem fremden Host.
            Antwortet der nicht, wirft drei innerhalb des Suspense, und ein
            Suspense fängt nur Ladezustände, keine Fehler: der Fehler steigt
            bis zum React-Root und reißt die komplette Seite weg (<main> war
            danach nicht mehr im DOM). Die Umgebung wird deshalb hier im
            Scene-Graph gebaut — gleiche Optik, kein Netzwerk-Abruf. */}
        <Environment resolution={256} frames={1}>
          <color attach="background" args={["#050505"]} />
          <Lightformer
            intensity={2}
            color="#C49F7B"
            position={[0, 4, -9]}
            scale={[12, 12, 1]}
          />
          <Lightformer
            intensity={0.7}
            color="#DFBE9F"
            position={[-6, 1, -6]}
            scale={[6, 6, 1]}
          />
          <Lightformer
            intensity={0.35}
            color="#ffffff"
            position={[6, -3, -4]}
            scale={[4, 4, 1]}
          />
        </Environment>
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
