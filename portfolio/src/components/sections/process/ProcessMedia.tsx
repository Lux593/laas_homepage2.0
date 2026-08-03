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
  const hasPoster = Boolean(step.poster);

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

  if (!hasPoster || !step.poster) {
    return <ProcessCycle step={step} index={index} total={total} />;
  }

  return (
    <figure className="process-media relative mx-auto w-full">
      <div className="process-media-frame relative overflow-hidden">
        {hasLoop ? (
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
        ) : null}
        <Image
          src={step.poster}
          alt=""
          fill
          sizes="580px"
          className={
            hasLoop
              ? "object-cover motion-safe:hidden"
              : "object-cover"
          }
          aria-hidden
        />
      </div>
    </figure>
  );
}
