"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
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

    meshRef.current.position.x = initialPos.x + Math.sin(t * speed * 0.5) * 0.5;
    meshRef.current.position.y = initialPos.y + Math.cos(t * speed * 0.3) * 0.3;
    meshRef.current.position.z = initialPos.z + Math.sin(t * speed * 0.2) * 0.2;

    meshRef.current.rotation.x += 0.003 * speed;
    meshRef.current.rotation.y += 0.005 * speed;
    meshRef.current.rotation.z += 0.002 * speed;
  });

  const geometryNode = useMemo(() => {
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
      {geometryNode}
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
        color: "#aaaaaa",
      },
      {
        position: [5, -1, -10] as [number, number, number],
        geometry: "octahedron" as const,
        scale: 1.2,
        speed: 0.4,
        color: "#999999",
      },
      {
        position: [0, 3, -12] as [number, number, number],
        geometry: "icosahedron" as const,
        scale: 1.8,
        speed: 0.3,
        color: "#888888",
      },
      {
        position: [-6, -3, -6] as [number, number, number],
        geometry: "icosahedron" as const,
        scale: 0.8,
        speed: 0.7,
        color: "#999999",
      },
      {
        position: [7, 4, -14] as [number, number, number],
        geometry: "torus" as const,
        scale: 2,
        speed: 0.2,
        color: "#999999",
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
