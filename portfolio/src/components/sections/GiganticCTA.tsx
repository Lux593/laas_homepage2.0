"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { SITE_CONFIG } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

export default function GiganticCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!glowRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        glowRef.current,
        { scale: 0.5, opacity: 0 },
        {
          scale: 1.5,
          opacity: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-section min-h-[80vh] flex flex-col justify-center overflow-hidden"
    >
      <div
        ref={glowRef}
        className="absolute w-[800px] h-[800px] rounded-full bg-accent-primary/15 blur-[200px] pointer-events-none"
        style={{ opacity: 0 }}
      />

      <div className="relative z-10 text-left container-custom">
        <span className="text-caption font-mono uppercase tracking-widest text-text-muted block mb-4 hidden">
          04 — Kontakt
        </span>

        <TextReveal
          as="h2"
          variant="words"
          className="text-display-sm md:text-display-md font-display font-bold tracking-tighter mb-8 max-w-5xl"
          stagger={0.05}
        >
          Lust auf ein Projekt?
        </TextReveal>

        <TextReveal
          as="p"
          variant="words"
          className="text-[clamp(1.5rem,3vw,3rem)] font-body text-text-secondary max-w-2xl mb-12"
          start="top 90%"
        >
          schreib mir - dann starten wir.
        </TextReveal>

        <MagneticButton>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="inline-flex items-center gap-3 px-10 py-5 text-body-md font-display font-bold tracking-tight text-bg-primary bg-text-primary rounded-full hover:bg-accent-primary transition-colors duration-500 ease-out-expo group"
          >
            Projekt starten
            <span className="inline-block transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
              →
            </span>
          </a>
        </MagneticButton>

        <div className="mt-16 flex items-center gap-8">
          {Object.entries(SITE_CONFIG.socials).map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${platform}-Profil besuchen`}
              className="flex items-center gap-2 text-caption font-mono uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors duration-300"
            >
              {platform === "github" && (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
              {platform === "linkedin" && (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              )}
              {platform === "instagram" && (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              )}
              {platform}
            </a>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 px-[var(--container-padding)] max-w-[var(--container-max)] mx-auto flex items-center justify-between">
        <p className="text-caption font-mono text-text-muted/50">
          © {new Date().getFullYear()} {SITE_CONFIG.name}
        </p>
        <div className="flex items-center gap-8">
          <a href="/agb" className="text-caption font-mono text-text-muted/50 hover:text-text-secondary transition-colors duration-300">AGB</a>
          <a href="/datenschutz" className="text-caption font-mono text-text-muted/50 hover:text-text-secondary transition-colors duration-300">Datenschutz</a>
          <a href="/impressum" className="text-caption font-mono text-text-muted/50 hover:text-text-secondary transition-colors duration-300">Impressum</a>
        </div>
      </div>
    </section>
  );
}
