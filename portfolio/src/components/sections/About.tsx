"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import TextReveal from "@/components/ui/TextReveal";
import { useLightSection } from "@/hooks/useLightSection";
import { ABOUT_FACTS, MANIFESTO_TEXT } from "@/lib/constants";
import "./about/about.css";

gsap.registerPlugin(ScrollTrigger, CustomEase);

/** Exakt die Kurve, mit der sich das Sidebar-Overlay öffnet: --ease-in-out-quart
 *  bzw. cubic-bezier(0.76, 0, 0.24, 1). Als SVG-Pfad, weil CustomEase die
 *  Kontrollpunkte in dieser Form erwartet. */
const IRIS_EASE = CustomEase.create("aboutIris", "M0,0 C0.76,0 0.24,1 1,1");

/** Deckt garantiert jedes Seitenverhältnis ab: der Radius-Prozentwert bezieht
 *  sich auf √(b²+h²)/√2, die halbe Diagonale ist davon immer 70,71 % — 78 %
 *  lässt also überall dieselbe kleine Reserve. */
const IRIS_OPEN = "circle(78% at 50% 50%)";
const IRIS_CLOSED = "circle(0% at 50% 50%)";

/**
 * Lage der Monitor-Bildschirmfläche innerhalb von /desk-scene.png, in Prozent
 * der gerenderten Bildbox. Nur diese vier Werte anfassen, wenn die Skizze durch
 * einen anderen Ausschnitt ersetzt wird — die gesamte Zoom-Mathematik misst sich
 * zur Laufzeit daraus.
 */
const SCREEN = { left: 40.95, top: 25.66, width: 28.17, height: 29.7 };

/** Anteil der Scrollstrecke, nach dem der Zoom seine Endgröße erreicht hat.
 *  Hochkant fällt die Blende früher, weil die Kamera dort weniger Weg hat. */
const ZOOM_END = { desktop: 0.52, mobile: 0.46 };

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLightSection(sectionRef);

  useEffect(() => {
    const mm = gsap.matchMedia();

    // Zwei Kontexte auf derselben Bühne: quer fährt die Kamera in den Monitor,
    // bis er das Bild deckt, hochkant nur bis er die Breite füllt. Beide Queries
    // MÜSSEN byte-identisch zu den @media-Blöcken in about.css bleiben.
    mm.add(
      {
        desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        mobile:
          "(max-width: 767px) and (min-height: 660px) and (prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const isMobile = Boolean(context.conditions?.mobile);
        const zoomEnd = isMobile ? ZOOM_END.mobile : ZOOM_END.desktop;

        const track = trackRef.current;
        const stage = stageRef.current;
        const header = headerRef.current;
        const scene = sceneRef.current;
        const art = artRef.current;
        const target = targetRef.current;
        const content = contentRef.current;
        if (!track || !stage || !header || !scene || !art || !target || !content) return;

        const groups = gsap.utils.toArray<HTMLElement>(".about-in", content);
        gsap.set(groups, { opacity: 0, y: 32 });
        gsap.set(content, { clipPath: IRIS_CLOSED });

        // Wird bei jedem Refresh neu hergeleitet: die Skizze ist in vw/svh
        // dimensioniert, also wandern Zielgröße UND Außermittigkeit mit dem
        // Viewport. Hardcodierte Werte wären auf genau einer Fenstergröße richtig.
        let endScale = 1;
        let offsetX = 0;
        let offsetY = 0;

        const measure = () => {
          gsap.set(scene, { x: 0, y: 0, scale: 1 });
          const s = target.getBoundingClientRect();
          const v = stage.getBoundingClientRect();

          // Fehlt die Bilddatei noch oder ist sie nicht dekodiert, schrumpft die
          // Bildbox auf ein paar Pixel — daraus berechnete Faktoren wären absurd.
          // Dann lieber gar kein Zoom als ein 400-facher.
          if (s.width < 40 || s.height < 40) {
            endScale = 1;
            offsetX = 0;
            offsetY = 0;
            return;
          }

          // 1.04 schiebt die Monitorblende über die Viewport-Kante hinaus, bevor
          // die Skizze ausblendet — ohne den Zuschlag steht am Ende eine
          // unscharfe Rahmenlinie im Bild.
          //
          // Hochkant deckt bewusst nur die Breite: die Bildschirmfläche ist dort
          // rund 110 × 60 px groß, „cover" bräuchte den ~14-fachen Maßstab und
          // machte aus der Skizze Brei. Die Kamera fährt also nur, bis der Monitor
          // die Breite füllt — die Blende deckt den Rest der Höhe ohnehin zu.
          endScale =
            (isMobile
              ? v.width / s.width
              : Math.max(v.width / s.width, v.height / s.height)) * 1.04;
          offsetX = s.left + s.width / 2 - (v.left + v.width / 2);
          offsetY = s.top + s.height / 2 - (v.top + v.height / 2);
        };

        const push = gsap.parseEase("power2.in");

        const applyZoom = (progress: number) => {
          // power2.in lässt den Schreibtisch den ersten Moment ruhig stehen und
          // beschleunigt dann hinein — eine Kamerafahrt, kein linearer Zug.
          const t = push(gsap.utils.clamp(0, 1, progress / zoomEnd));
          const scale = 1 + (endScale - 1) * t;
          // Skaliert wird um die Bühnenmitte: ein Punkt mit Abstand offset
          // landet bei offset·scale. Wir wollen ihn stattdessen bei
          // offset·(1-t) — also linear von seiner Startlage in die Mitte.
          // x = offset·((1-t) - scale) leistet genau das. Die frühere Formel
          // `-offset·scale·t` ließ den Restfehler mit dem Scale mitwachsen;
          // deshalb saß die Iris in der Viewport-Mitte, das Icon aber daneben.
          gsap.set(scene, {
            x: offsetX * (1 - t - scale),
            y: offsetY * (1 - t - scale),
            scale,
            force3D: true,
          });
        };

        const spine = { p: 0 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onRefresh: (self) => {
              measure();
              applyZoom(self.progress);
            },
            onUpdate: (self) => applyZoom(self.progress),
          },
        });

        // Der Spine hält die Timeline-Dauer auf exakt 1, damit die Positionen
        // unten direkt als Scroll-Fortschritt lesbar sind.
        tl.to(spine, { p: 1, duration: 1, ease: "none" }, 0)
          // Der Header gehört zum Raum, nicht zum Bildschirm: sobald die Kamera
          // losfährt, zieht er nach oben aus dem Bild. Er ist lange weg, bevor die
          // Copy von unten hereinkommt — Altes raus nach oben, Neues rein von unten.
          .to(header, { opacity: 0, y: -28, ease: "power2.in", duration: 0.24 }, 0.14)
          // Schärfeverlagerung: macht aus dem unvermeidlichen Upscale des
          // Rasterbilds eine gewollte Kamerabewegung statt sichtbarer Pixel.
          // Bewusst flach gehalten, damit sie der Blende nicht die Schau stiehlt.
          // Hochkant einen Tick stärker: dort steht am Ende ein gröberer Upscale.
          .fromTo(
            art,
            { filter: "blur(0px)" },
            {
              filter: `blur(${isMobile ? 4 : 3}px)`,
              ease: "power2.in",
              duration: 0.18,
            },
            zoomEnd - 0.2
          )
          // Die Blende: erst wenn der Zoom das Icon in die Mitte gelegt hat
          // (zoomEnd), wächst die Kugel aus genau diesem Punkt — sonst öffnet
          // die nächste Seite zentriert, während das Icon noch versetzt sitzt.
          .fromTo(
            content,
            { clipPath: IRIS_CLOSED },
            { clipPath: IRIS_OPEN, ease: IRIS_EASE, duration: 0.2 },
            zoomEnd
          )
          // Läuft wie im Sidebar-Overlay leicht versetzt in der offenen Blende mit,
          // statt danach als zweite, eigene Bewegung.
          .to(
            groups,
            { opacity: 1, y: 0, ease: "power3.out", duration: 0.14, stagger: 0.055 },
            zoomEnd + 0.04
          );
      }
    );

    return () => mm.revert();
  }, []);

  return (
    // Cream-Panel auf dem dunklen Grund — gleiche Sprache wie „Meine Projekte":
    // Radius plus Schlagschatten nach oben, damit sich die Section beim Scrollen
    // sichtbar vor den dunklen Prozess-Block legt statt an ihn zu stoßen.
    <section
      id="about"
      ref={sectionRef}
      className="relative z-10 rounded-t-[1.5rem] rounded-b-[1.5rem] bg-[#f2ede4] text-[#0a0a0a] shadow-[0_-40px_80px_-24px_rgba(0,0,0,0.8),0_40px_80px_-24px_rgba(0,0,0,0.6)] md:rounded-t-[2rem] md:rounded-b-[2rem]"
    >
      <div ref={trackRef} className="about-track">
        <div ref={stageRef} className="about-stage">
          <header ref={headerRef} className="about-header">
            <div className="container-custom">
              <span className="mb-3 block font-mono text-caption uppercase tracking-[0.2em] text-[#5f574e]">
                03 - Wer das hier baut
              </span>
              <TextReveal
                as="h2"
                variant="words"
                start="top 95%"
                className="font-display text-[clamp(1.9rem,4vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tighter text-[#0a0a0a]"
              >
                ÜBER MICH
              </TextReveal>
            </div>
          </header>

          <div ref={sceneRef} className="about-scene">
            <div ref={artRef} className="about-art">
              {/* Licht liegt unter der Skizze — siehe about.css */}
              <div className="about-light" aria-hidden>
                <span className="about-light-shade" />
                <span className="about-light-beam" />
                <span className="about-light-pool" />
                <span className="about-light-bulb" />
              </div>

              {/* Bewusst kein next/image: die Datei liefert der Nutzer, ihre
                  Maße stehen nicht fest, und ein falsches width/height-Paar
                  würde das Seitenverhältnis der Bühne verfälschen. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/desk-scene.png"
                alt=""
                aria-hidden
                decoding="async"
                onLoad={() => ScrollTrigger.refresh()}
              />
              {/* Zielmarke: markiert die Bildschirmfläche im Bild, damit die
                  Kamera ein messbares Ziel hat. getBoundingClientRect liest die
                  Border-Box, absolut positionierte Kinder verändern sie nicht —
                  deshalb darf das Logo hier drin wohnen und wandert und
                  skaliert automatisch mit der Fläche mit. */}
              <div
                ref={targetRef}
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: `${SCREEN.left}%`,
                  top: `${SCREEN.top}%`,
                  width: `${SCREEN.width}%`,
                  height: `${SCREEN.height}%`,
                }}
              >
                {/* Die Breite gehört auf den Wrapper, nicht auf das Bild:
                    next/image schreibt aus width/height eigene Maße und
                    überstimmt eine Utility-Klasse am Bild-Element.
                    Der Prozentwert ist nicht die Sehfläche — liftapp.png trägt
                    rund 19 % transparenten Rand je Seite, sichtbar bleiben von
                    36 % also nur ~22 % der Bildschirmbreite. */}
                <div className="absolute left-1/2 top-1/2 w-[36%] -translate-x-1/2 -translate-y-1/2 opacity-[0.24]">
                  <Image
                    src="/liftapp.png"
                    alt=""
                    width={2188}
                    height={1352}
                    sizes="(max-width: 768px) 20vw, 40vw"
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div ref={contentRef} className="about-content">
            <div className="container-custom w-full">
              {/* Vorlage: Copy links, Portrait groß rechts. Die Spalten werden
                  explizit gesetzt statt über die DOM-Reihenfolge — gestapelt
                  soll das Gesicht weiter oben stehen, auf Desktop rechts. */}
              <div className="about-in grid items-center gap-8 md:grid-cols-[1fr_auto] md:gap-12 lg:gap-16">
                <div className="about-figure justify-self-center bg-[#f2ede4] md:col-start-2 md:row-start-1 md:justify-self-end">
                  <Image
                    src="/personal_pic.jpg"
                    alt="Luca Arnoldi"
                    width={1206}
                    height={953}
                    sizes="(max-width: 768px) 60vw, 36vw"
                    className="about-portrait h-auto w-full"
                  />
                </div>

                <p className="max-w-[26ch] font-display text-[clamp(1.35rem,2.7vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.03em] text-balance md:col-start-1 md:row-start-1">
                  {MANIFESTO_TEXT}
                </p>
              </div>

              <dl className="about-in mt-[clamp(2rem,5vh,3.25rem)] grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[rgba(10,10,10,0.14)] pt-[clamp(1.25rem,3vh,2rem)] md:grid-cols-4">
                {ABOUT_FACTS.map((fact) => (
                  <div key={fact.label}>
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#5f574e]">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 font-display text-[clamp(0.95rem,1.15vw,1.15rem)] font-bold leading-snug tracking-tight">
                      {fact.href ? (
                        <a
                          href={fact.href}
                          className="underline decoration-[rgba(10,10,10,0.25)] decoration-1 underline-offset-4 transition-colors duration-300 hover:decoration-[#0a0a0a]"
                        >
                          {fact.value}
                        </a>
                      ) : (
                        fact.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
