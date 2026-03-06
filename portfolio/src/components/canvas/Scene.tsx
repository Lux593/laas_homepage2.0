"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import ParticleField from "@/components/canvas/ParticleField";
import FloatingShapes from "@/components/canvas/FloatingShapes";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { detectGPUTier, getParticleCount } from "@/lib/gpu-detect";

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

  const particleCount = isMobile ? Math.min(800, getParticleCount(gpuTier)) : getParticleCount(gpuTier);

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
          <ParticleField count={particleCount} />
          <FloatingShapes />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
