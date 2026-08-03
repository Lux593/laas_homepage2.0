"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, Lightformer, Preload } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { detectGPUTier } from "@/lib/gpu-detect";

function ElegantRibbon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    // Lazy-follow: smooth mouse tracking
    mouse.current.x += (state.pointer.x - mouse.current.x) * 0.05;
    mouse.current.y += (state.pointer.y - mouse.current.y) * 0.05;

    if (meshRef.current) {
      // Continuous rotation + mouse offset
      meshRef.current.rotation.x =
        state.clock.elapsedTime * 0.1 + mouse.current.y * 0.2;
      meshRef.current.rotation.y =
        state.clock.elapsedTime * 0.15 + mouse.current.x * 0.2;
      // Sine bob on Y axis
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
    mouse.current.x += (target.current.x - mouse.current.x) * 0.05;
    mouse.current.y += (target.current.y - mouse.current.y) * 0.05;

    // eslint-disable-next-line react-hooks/immutability -- R3F camera mutation is the intended pattern
    camera.position.x = mouse.current.x * 0.3;
    camera.position.y = mouse.current.y * 0.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function Scene() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const [mounted] = useState(() => typeof window !== "undefined");
  const [gpuTier] = useState<"high" | "medium" | "low">(() => {
    if (typeof window === "undefined") return "medium";
    return detectGPUTier();
  });

  if (!mounted || reducedMotion) return null;

  // Lower quality on low-end GPUs
  const segments = gpuTier === "low" ? 128 : 256;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.8, mixBlendMode: "screen" }}
    >
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
          <MouseTracker />

          {/* Lighting — bronze tones */}
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

          {/* Selbe Falle wie in HeroCanvas: preset="night" holt eine HDR von
              raw.githack.com. Umgebung stattdessen lokal im Scene-Graph. */}
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
    </div>
  );
}
