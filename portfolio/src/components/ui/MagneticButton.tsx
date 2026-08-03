"use client";

import { useRef, useEffect } from "react";
import { lerp, cn } from "@/lib/utils";
import { useSupportsHover } from "@/hooks/useMediaQuery";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export default function MagneticButton({
  children,
  className,
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const supportsHover = useSupportsHover();
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (!supportsHover || !ref.current) return;

    const element = ref.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      target.current.x = (e.clientX - centerX) * strength;
      target.current.y = (e.clientY - centerY) * strength;
    };

    const handleMouseLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    function animate() {
      position.current.x = lerp(position.current.x, target.current.x, 0.15);
      position.current.y = lerp(position.current.y, target.current.y, 0.15);

      if (ref.current) {
        ref.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    }

    element.addEventListener("mousemove", handleMouseMove, { passive: true });
    element.addEventListener("mouseleave", handleMouseLeave);

    rafId.current = requestAnimationFrame(animate);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [supportsHover, strength]);

  return (
    <div ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}
