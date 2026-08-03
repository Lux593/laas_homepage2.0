"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { ProcessStep } from "@/lib/constants";
import ProcessCycle from "@/components/sections/process/ProcessCycle";

/**
 * Right-side visual for a process step: looping comic clip when assets exist,
 * otherwise the editorial cycle mark as fallback.
 */
export default function ProcessMedia({
  step,
  index,
  total,
}: {
  step: ProcessStep;
  index: number;
  total: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasLoop = Boolean(step.video && step.poster);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasLoop) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      video.pause();
      video.removeAttribute("autoplay");
      return;
    }

    const play = () => {
      void video.play().catch(() => {});
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play();
        else video.pause();
      },
      { threshold: 0.35 }
    );

    io.observe(video);
    return () => io.disconnect();
  }, [hasLoop, step.video]);

  if (!hasLoop || !step.poster) {
    return <ProcessCycle step={step} index={index} total={total} />;
  }

  return (
    <figure className="relative mx-auto w-full max-w-[min(100%,340px)]">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          poster={step.poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${step.subtitle}: kurze Comic-Animation`}
        >
          <source src={step.video} type="video/mp4" />
        </video>
        <Image
          src={step.poster}
          alt=""
          fill
          sizes="340px"
          className="object-cover motion-safe:hidden"
          aria-hidden
        />
      </div>
      <figcaption className="mt-6 text-center font-mono text-caption uppercase tracking-[0.2em] text-text-muted">
        {step.subtitle}
      </figcaption>
    </figure>
  );
}
