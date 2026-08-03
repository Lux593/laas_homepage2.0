"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollHighlight from "@/components/ui/ScrollHighlight";
import { MANIFESTO_TEXT } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      gsap.fromTo(
        imageRef.current,
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.to(imageRef.current, {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    // On mobile: just make the image visible immediately
    mm.add("(max-width: 767px)", () => {
      gsap.set(imageRef.current, { opacity: 1 });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="about" className="relative">
      <div className="container-custom pt-12 md:pt-section mb-8 md:mb-24">
        <span className="text-caption font-mono uppercase tracking-widest text-text-muted block mb-4">
          03 — Manifest
        </span>
        <h2 className="text-display-sm md:text-display-md font-display font-bold tracking-tighter">
          Über mich.
        </h2>
      </div>

      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-start">
          {/* Text left - with scroll highlight */}
          <div>
            <ScrollHighlight text={MANIFESTO_TEXT} className="font-body" />
          </div>

          {/* Image - above text on mobile, sticky on desktop */}
          <div className="order-first md:order-none md:sticky md:top-[20vh]" style={{ height: "fit-content" }}>
            <div
              ref={imageRef}
              className="opacity-0"
            >
              <div className="relative w-48 mx-auto md:mx-0 md:w-72 lg:w-96 rounded-2xl overflow-hidden">
                <Image
                  src="/personal_pic.jpg"
                  alt="Luca Arnoldi"
                  width={384}
                  height={512}
                  className="w-full h-auto object-cover grayscale-[30%]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
