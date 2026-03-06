"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { clamp } from "@/lib/utils";

interface ScrollProgressOptions {
  start?: number;
  end?: number;
}

export function useScrollProgress(
  ref: React.RefObject<HTMLElement | null>,
  options: ScrollProgressOptions = {}
) {
  const { start = 0, end = 1 } = options;
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;

    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const currentProgress = clamp(
        -( rect.top - windowHeight * (1 - start)) /
          Math.abs(rect.height + windowHeight * (1 - start + end)),
        0,
        1
      );
      setProgress(currentProgress);
    });
  }, [ref, start, end]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  return progress;
}
