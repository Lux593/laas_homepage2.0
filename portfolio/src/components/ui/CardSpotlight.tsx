"use client";

import { useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface CardSpotlightProps {
  children: React.ReactNode;
  className?: string;
}

export default function CardSpotlight({ children, className }: CardSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(200, 255, 0, 0.06), transparent 40%)`;
    }
    if (borderRef.current) {
      borderRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(200, 255, 0, 0.15), transparent 40%)`;
    }
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : 0 }}
      />

      <div
        ref={borderRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-[inherit]"
        style={{
          opacity: isHovered ? 1 : 0,
          mask: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />

      {children}
    </div>
  );
}
