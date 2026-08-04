"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { SERVICES_INTRO } from "@/lib/constants";

/**
 * Leistungen-Visual: Rechteck, Desktop fadet per CSS-Mask nach rechts aus.
 * Clip ist bereits als Boomerang gerendert (vor + zurück) — native loop.
 */
export default function ServicesLandscape({
  className = "",
}: {
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      video.pause();
      video.removeAttribute("autoplay");
      return;
    }

    const play = () => {
      video.playbackRate = 0.7;
      void video.play().catch(() => {});
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play();
        else video.pause();
      },
      { threshold: 0.2, rootMargin: "10% 0px" }
    );

    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <figure
      className={`services-landscape relative overflow-hidden ${className}`.trim()}
      aria-label={SERVICES_INTRO.statement}
    >
      <Image
        src={SERVICES_INTRO.poster}
        alt=""
        fill
        sizes="(max-width: 1023px) 70vw, 38vh"
        className="object-cover object-center"
        priority
        aria-hidden
      />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden"
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src={SERVICES_INTRO.video} type="video/mp4" />
      </video>
    </figure>
  );
}
