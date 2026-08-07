"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { useLightSection } from "@/hooks/useLightSection";
import { SITE_CONFIG } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

export default function GiganticCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Cream contact card needs dark chrome (logo + menu) while it owns the top.
  useLightSection(sectionRef);

  useEffect(() => {
    if (!cardRef.current || !sectionRef.current) return;

    // Vorher stand hier `window.innerWidth < 768`, einmal beim Mount gelesen.
    // Drei Fehler in einer Zeile: der Wert reagierte nicht auf den iPad-Dreh
    // über die 768er-Naht (die Section blieb in der falschen Fassung stehen),
    // reduzierte Bewegung wurde nicht respektiert — als einzige GSAP-Section
    // der Seite —, und `gsap.context` statt `gsap.matchMedia` bricht mit dem
    // Muster, das überall sonst genau diese Umschaltung leistet.
    const mm = gsap.matchMedia();

    mm.add(
      "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
      () => {
        // Mobile: fullscreen clip-path wipe from bottom with rounded top corners
        gsap.set(cardRef.current, {
          scale: 1,
          borderRadius: "1.5rem 1.5rem 0 0",
        });

        const tween = gsap.fromTo(
          cardRef.current,
          { clipPath: "inset(100% 0 0 0 round 1.5rem 1.5rem 0 0)" },
          {
            clipPath: "inset(0% 0 0 0 round 1.5rem 1.5rem 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              // 30vh statt 50vh Strecke, aus demselben Grund wie quer (siehe
              // unten): die Blende räumt von unten auf, ihre sichtbare Kante
              // erscheint aber erst kurz vor Schluss über der Fensterkante.
              // Über 50vh stand dazwischen ein Drittel Bildhöhe leer.
              end: "top 70%",
              scrub: 0.5,
            },
          },
        );

        // matchMedia räumt beim Wechsel über die Naht selbst auf — aber die
        // Inline-Stile aus dem gsap.set oben kennt es nicht, die müssen weg,
        // sonst behält die Karte quer den 1.5rem-Radius von hochkant.
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(cardRef.current, {
            clearProps: "scale,borderRadius,clipPath",
          });
        };
      },
    );

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        // Desktop: card animation with scale + rounded corners
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            // „top bottom" statt „top 80%": der About-Track endet exakt dann,
            // wenn diese Section die Unterkante erreicht — die Karte setzt also
            // ohne Pause an, wo die Blende darüber aufhört. Die früheren 80 %
            // ließen davor 20vh reines Schwarz stehen, ununterscheidbar vom
            // Seitengrund.
            start: "top bottom",
            // Ende bei 30 % statt ganz oben: die Karte steht damit auf voller
            // Größe, BEVOR die Section die Oberkante erreicht. Danach schiebt
            // sie sich nur noch normal hoch, statt bis zuletzt zu wachsen.
            end: "top 30%",
            // 1 war zusammen mit Lenis (duration 1.2) eine zweite
            // Verzögerungsstufe: bei zügigem Scrollen lief die Karte rund zwei
            // Sekunden hinter dem Rad her und tauchte sichtbar zu spät auf.
            scrub: 0.5,
          },
        });

        // 0.32 statt 0.5 der Strecke für die Blende. Sie läuft von der
        // Unterkante der Karte hoch, und die Karte steht dabei auf 0.7 — ihre
        // Oberkante liegt also 15vh unter dem Kartenkasten, der selbst erst am
        // Fensterrand beginnt. Die aufziehende Kante ist deshalb die längste
        // Zeit unterhalb der Fensterkante und für den Betrachter unsichtbar.
        // Gerechnet: mit 40vh Blendenstrecke tauchte der erste Cremestreifen
        // erst nach 31vh Scrollweg auf, mit 22vh nach 20vh — und der schwarze
        // Streifen dazwischen schrumpft von 44vh auf gut 20vh.
        tl.fromTo(
          cardRef.current,
          {
            scale: 0.7,
            borderRadius: "2rem",
            clipPath: "inset(100% 0 0 0 round 2rem)",
          },
          {
            clipPath: "inset(0% 0 0 0 round 2rem)",
            scale: 0.7,
            borderRadius: "2rem",
            duration: 0.32,
            ease: "none",
          },
        );

        // Der Rest der Strecke gehört dem Wachsen. Die Oberkante der Karte
        // wandert dabei auf die Sectionkante zu und trifft sie am Ende genau —
        // die Lücke zum About-Panel darüber schließt sich also von selbst,
        // ohne dass hier eine zweite Bewegung dagegenhalten müsste.
        tl.to(cardRef.current, {
          scale: 1,
          borderRadius: "2rem",
          clipPath: "inset(0% 0 0 0 round 2rem)",
          duration: 0.68,
          ease: "none",
        });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(cardRef.current, {
            clearProps: "scale,borderRadius,clipPath",
          });
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="relative min-h-screen">
      {/* Inverted card that reveals from bottom */}
      <div
        ref={cardRef}
        className="relative min-h-screen flex flex-col justify-center overflow-hidden"
        style={{
          backgroundColor: "#f2ede4",
          clipPath: "inset(100% 0 0 0)",
          transformOrigin: "center center",
        }}
      >
        {/* py-section (min 8rem) sprengte zusammen mit der Fußzeile kurze
            Handy-Displays; der eigene clamp lässt erst unterhalb von ~850px
            Fensterhöhe nach und ist auf dem Desktop identisch zu vorher. */}
        <div className="relative z-10 text-center container-custom py-[clamp(5rem,15vh,16rem)] flex flex-col items-center">
          <TextReveal
            as="h2"
            variant="words"
            className="text-[clamp(2rem,5vw,3rem)] md:text-display-md font-display font-bold tracking-tighter mb-12 max-w-5xl text-[#0a0a0a] md:mb-14"
            stagger={0.05}
          >
            Lust auf ein Projekt ?
          </TextReveal>

          {/* nowrap erst ab md: auf 320px stand der Satz sonst 273px breit in
              einer 272px-Spalte und wurde am Rand abgeschnitten. */}
          <TextReveal
            as="p"
            variant="words"
            className="text-[clamp(1.2rem,2.2vw,2rem)] font-body mb-16 text-[#3a3a3a] md:mb-20 md:whitespace-nowrap"
            start="top 90%"
          >
            schreib mir - dann starten wir.
          </TextReveal>

          {/* relative + absolute cow: Button bleibt optisch zentriert,
              die Kuh hängt als Easter Egg links daneben ohne Layout-Shift. */}
          <div className="relative inline-flex items-center justify-center">
            {/* Die Kuh bringt ihre Bewegung selbst mit: ein 2.7-Sekunden-Loop
                als animiertes WebP (mit Higgsfield aus dem Original-PNG
                erzeugt, Vor- und Rücklauf aneinandergehängt, damit der Loop
                keinen Sprung hat). 65 ms pro Bild, an den beiden Umkehrpunkten
                110 ms — die kurze Pause nimmt dem Richtungswechsel das
                Mechanische. Die 384er-Bühne ist breiter als die Kuh —
                der freie Rand ist auf das Cremeweiß der Karte abgestimmt und
                nach außen weich ausgeblendet, damit kein Rechteck sichtbar
                wird. Deshalb sind die Breiten hier größer und die Abstände
                kleiner als beim randlosen PNG vorher.
                next/image scheidet aus: der Optimizer würde die Animation
                plattmachen, und das picture-Element braucht ein natives
                Bild-Tag. */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-[calc(100%+0.55rem)] top-1/2 w-[6.4rem] -translate-y-[48%] select-none sm:right-[calc(100%+0.9rem)] sm:w-[8rem] md:right-[calc(100%+1.2rem)] md:w-[9.6rem]"
            >
              <picture>
                {/* Reduzierte Bewegung bekommt das Standbild — ohne JS, und
                    auf derselben Bühne, damit die Kuh nicht verspringt. */}
                <source
                  media="(prefers-reduced-motion: reduce)"
                  srcSet="/cow-easter-egg-still.webp"
                />
                <img
                  src="/cow-easter-egg-anim.webp"
                  alt=""
                  width={384}
                  height={384}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="h-auto w-full"
                />
              </picture>
            </span>
            <MagneticButton>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="inline-flex items-center gap-3 px-10 py-5 text-body-md font-display font-bold tracking-tight rounded-full transition-colors duration-500 ease-out-expo group"
                style={{
                  backgroundColor: "#0a0a0a",
                  color: "#f0ede8",
                }}
              >
                Projekt starten
                <span className="inline-block transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
                  →
                </span>
              </a>
            </MagneticButton>
          </div>

          {/* Umbruchfähig und mit engerem Abstand: die drei Namen plus 2×2rem
              Lücke ergaben eine Mindestbreite von 330px, an der die ganze
              Spalte hing — auf 320px lief „instagram" aus dem Bild.
              pointer-coarse:min-h-11 macht aus den 18px hohen Zeilen ein
              44px-Tippziel — an der Eingabeart festgemacht, nicht an der
              Breite, sonst hätte das Handy im Querformat wieder Mausmaße. */}
          <div className="mt-32 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 md:mt-40 md:gap-x-8">
            {Object.entries(SITE_CONFIG.socials).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${platform}-Profil besuchen`}
                className="flex items-center gap-2 text-caption font-mono uppercase tracking-widest transition-colors duration-300 pointer-coarse:min-h-11"
                style={{ color: "#6a6a6a" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0a0a0a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6a6a6a")}
              >
                {platform === "github" && (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                {platform === "linkedin" && (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                )}
                {platform === "instagram" && (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                )}
                {platform}
              </a>
            ))}
          </div>
        </div>

        {/* Gestapelt läuft die Fußzeile im Fluss mit: absolut positioniert lag
            sie auf kurzen Displays über der CTA-Copy (auf 320×568 rund 80px
            Überlappung). Ab md sitzt sie wieder unten in der Karte.
            env(safe-area-inset-bottom) ist bei viewportFit "cover" nötig,
            damit der Home-Indicator die Links nicht verdeckt — ohne Notch
            löst es zu 0 auf und ändert nichts. */}
        <div className="relative mt-14 w-full px-[var(--container-padding)] pb-[env(safe-area-inset-bottom)] max-w-[var(--container-max)] mx-auto flex flex-col items-center gap-3 text-center md:absolute md:bottom-8 md:left-0 md:right-0 md:mt-0 md:pb-0 md:flex-row md:justify-between md:text-left">
          <p className="text-caption font-mono" style={{ color: "#9a9a9a" }}>
            © {new Date().getFullYear()} {SITE_CONFIG.name}
          </p>
          <div className="flex items-center gap-5 md:gap-8">
            {[
              { href: "/agb", label: "AGB" },
              { href: "/datenschutz", label: "Datenschutz" },
              { href: "/impressum", label: "Impressum" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center text-caption font-mono transition-colors duration-300 pointer-coarse:min-h-11"
                style={{ color: "#9a9a9a" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
