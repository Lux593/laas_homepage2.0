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
    // Blende und Push-in liegen bewusst auf zwei Ebenen: die Maske sitzt auf
    // der Bildkante (figure), der Zoom auf dem Rahmen darunter — siehe
    // useStackReveal. Im gepinnten Desktop-Layout bleibt beides ungenutzt.
    <figure data-reveal="media" className="process-media relative mx-auto w-full">
      <div
        data-reveal="media-inner"
        className="process-media-frame relative overflow-hidden"
      >
        {/* Das Standbild liegt UNTER dem Video und wird nie versteckt: es ist
            zugleich Platzhalter, bis der Clip da ist, und das ganze Bild bei
            reduzierter Bewegung. Vorher hing dasselbe PNG zusätzlich am
            poster-Attribut — und ein poster wird roh geladen, an next/image
            vorbei: 25 MB unkomprimierte PNGs allein für vier Standbilder. */}
        <Image
          src={step.poster}
          alt=""
          fill
          sizes="(max-width: 1023px) 92vw, 580px"
          className="object-cover"
          aria-hidden
        />
        {hasLoop ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            muted
            loop
            playsInline
            // "none" statt "metadata": mit metadata zog der Browser alle vier
            // Clips schon beim Seitenaufruf komplett — auf dem Handy 31 MB,
            // bevor der Prozess-Block überhaupt in Sicht war. Geladen wird
            // jetzt erst, wenn der Schritt im Bild steht und play() ruft.
            preload="none"
            aria-label={`${step.subtitle}: kurze Comic-Animation`}
          >
            <source src={step.video} type="video/mp4" />
          </video>
        ) : null}
      </div>
    </figure>
  );
}
