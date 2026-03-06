"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function generateParticleData(count: number) {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const speeds = new Float32Array(count);
  const randomness = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
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
}

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

    // Autonomous floating movement
    pos.x += sin(uTime * aSpeed * 0.3 + aRandomness.x * 6.28) * 0.5;
    pos.y += cos(uTime * aSpeed * 0.2 + aRandomness.y * 6.28) * 0.3;
    pos.z += sin(uTime * aSpeed * 0.1 + aRandomness.z * 6.28) * 0.4;

    // Mouse interaction: particles repel from cursor
    vec2 mouseInfluence = uMouse * 2.0;
    float distToMouse = length(pos.xy - mouseInfluence);
    float mouseRepel = smoothstep(3.0, 0.0, distToMouse) * 0.5;
    pos.xy += normalize(pos.xy - mouseInfluence) * mouseRepel;

    // Scroll-based Y shift
    pos.y += uScrollProgress * 2.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Particle size (closer = bigger)
    gl_PointSize = aScale * (150.0 / -mvPosition.z);

    // Alpha based on camera distance
    vDistance = -mvPosition.z;
    vAlpha = smoothstep(20.0, 2.0, vDistance) * 0.35;
  }
`;

const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;

  varying float vAlpha;
  varying float vDistance;

  void main() {
    // Soft circle particle
    float distToCenter = length(gl_PointCoord - vec2(0.5));
    if (distToCenter > 0.5) discard;

    float alpha = smoothstep(0.5, 0.1, distToCenter) * vAlpha;

    // Color gradient based on position
    float colorMix = sin(vDistance * 0.5 + uTime * 0.3) * 0.5 + 0.5;
    vec3 color = mix(uColorA, uColorB, colorMix);

    gl_FragColor = vec4(color, alpha);
  }
`;

interface ParticleFieldProps {
  count?: number;
}

export default function ParticleField({ count = 1500 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const { positions, scales, speeds, randomness } = useMemo(
    () => generateParticleData(count),
    [count]
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color("#888888") },
      uColorB: { value: new THREE.Color("#aaaaaa") },
    }),
    []
  );

  // Mouse tracking via useFrame to avoid stale closures
  useFrame((state) => {
    if (!pointsRef.current) return;

    const material = pointsRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    material.uniforms.uScrollProgress.value = maxScroll > 0 ? scrollY / maxScroll : 0;

    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-aScale"
          args={[scales, 1]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[speeds, 1]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          args={[randomness, 3]}
          count={count}
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
