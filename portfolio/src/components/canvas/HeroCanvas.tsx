"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Preload } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

function ElegantRibbon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    // Lazy-follow: smooth mouse tracking
    mouse.current.x += (state.pointer.x - mouse.current.x) * 0.05;
    mouse.current.y += (state.pointer.y - mouse.current.y) * 0.05;

    if (meshRef.current) {
      meshRef.current.rotation.x =
        state.clock.elapsedTime * 0.1 + mouse.current.y * 0.2;
      meshRef.current.rotation.y =
        state.clock.elapsedTime * 0.15 + mouse.current.x * 0.2;
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
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

export default function HeroCanvas() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
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

        <Environment preset="night" />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
