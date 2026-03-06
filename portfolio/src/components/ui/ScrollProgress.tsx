"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number>(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[var(--z-nav)]">
      <div
        className="h-full origin-left"
        style={{
          transform: `scaleX(${progress})`,
          background: "linear-gradient(90deg, #ffffff, #a0a0a0)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
