"use client";

import { useEffect, useRef, useState } from "react";
import { lerp } from "@/lib/utils";
import type { MousePosition } from "@/types";

const INITIAL_POSITION: MousePosition = {
  x: 0,
  y: 0,
  normalizedX: 0,
  normalizedY: 0,
};

export function useMousePosition(smoothing = 0.1): MousePosition {
  const [position, setPosition] = useState<MousePosition>(INITIAL_POSITION);

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const frameCount = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    function animate() {
      current.current.x = lerp(current.current.x, target.current.x, smoothing);
      current.current.y = lerp(current.current.y, target.current.y, smoothing);

      // Throttle state updates to every 3rd frame to reduce re-renders
      frameCount.current++;
      if (frameCount.current % 3 === 0) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        setPosition({
          x: current.current.x,
          y: current.current.y,
          normalizedX: (current.current.x / windowWidth) * 2 - 1,
          normalizedY: (current.current.y / windowHeight) * 2 - 1,
        });
      }

      rafId.current = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [smoothing]);

  return position;
}
