"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";

interface CounterAnimationProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export default function CounterAnimation({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
  className,
}: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView<HTMLSpanElement>({ threshold: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo
      const easedProgress = 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(easedProgress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
