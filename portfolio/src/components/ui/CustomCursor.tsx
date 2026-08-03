"use client";

import { useEffect, useRef, useState } from "react";
import { lerp } from "@/lib/utils";
import { useSupportsHover, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const supportsHover = useSupportsHover();
  const reducedMotion = usePrefersReducedMotion();

  const mouse = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (!supportsHover || reducedMotion) return;

    function animate() {
      dotPos.current.x = lerp(dotPos.current.x, mouse.current.x, 0.2);
      dotPos.current.y = lerp(dotPos.current.y, mouse.current.y, 0.2);

      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.08);
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.08);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (
        el.closest("a") ||
        el.closest("button") ||
        el.closest("[data-cursor-hover]") ||
        el.closest("[role='button']")
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (
        el.closest("a") ||
        el.closest("button") ||
        el.closest("[data-cursor-hover]") ||
        el.closest("[role='button']")
      ) {
        setIsHovering(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });

    rafId.current = requestAnimationFrame(animate);

    document.body.classList.add("cursor-hidden");

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(rafId.current);
      document.body.classList.remove("cursor-hidden");
    };
  }, [supportsHover, reducedMotion, isVisible]);

  if (!supportsHover || reducedMotion) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: "var(--z-cursor)",
          mixBlendMode: "difference",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s, width 0.4s cubic-bezier(0.22,1,0.36,1), height 0.4s cubic-bezier(0.22,1,0.36,1)",
          width: isHovering ? "60px" : "8px",
          height: isHovering ? "60px" : "8px",
          marginLeft: isHovering ? "-30px" : "-4px",
          marginTop: isHovering ? "-30px" : "-4px",
          borderRadius: "50%",
          backgroundColor: "white",
          willChange: "transform",
        }}
      />

      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: "var(--z-cursor)",
          mixBlendMode: "difference",
          opacity: isVisible && !isHovering ? 0.5 : 0,
          transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1)",
          width: "40px",
          height: "40px",
          marginLeft: "-20px",
          marginTop: "-20px",
          borderRadius: "50%",
          border: "1px solid white",
          willChange: "transform",
        }}
      />
    </>
  );
}
