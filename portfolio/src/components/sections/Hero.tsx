"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useIsMobile } from "@/hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

const ROTATING_WORDS = [
  "Web-Apps",
  "Native Apps",
  "KI-Integration",
  "Prozessautomation",
];

/**
 * Höhe des Streifens am unteren Bildrand, in dem der Scroll-Hinweis sitzt —
 * in Prozent einer Bildschirmhöhe.
 */
const PEEK = 12;

/** Horizontaler Einzug der Hero-Copy. */
const CONTENT_INSET = "9%";

export default function Hero() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const rotatingRef = useRef<HTMLSpanElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const illuRef = useRef<HTMLImageElement>(null);

  // Parallax-Ebenen. Bewusst eigene Wrapper: die Entry-Timeline unten besitzt
  // line1Ref/line2Ref/scrollIndicatorRef und der Maus-Parallax besitzt den
  // .text-left-Knoten — die Scroll-Timeline darf keinen davon anfassen.
  const headLayerRef = useRef<HTMLDivElement>(null);
  const subLayerRef = useRef<HTMLDivElement>(null);
  const cueLayerRef = useRef<HTMLDivElement>(null);
  const illuLayerRef = useRef<HTMLDivElement>(null);

  const mouse = useMousePosition(0.08);
  const isMobile = useIsMobile();
  const [wordIndex, setWordIndex] = useState(0);
  const [heroActive, setHeroActive] = useState(true);

  // Entry animation
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // Kurzer Beat nach Paint — früher 2.2s für den Preloader, der aktuell aus ist.
    const tl = gsap.timeline({ delay: 0.4 });

    // Die Zeichnung erzählt links Chaos → rechts aufgeräumter Tisch. Der Wipe
    // legt sie in dieser Leserichtung frei, damit die Kabel sichtbar aus dem
    // Haufen zum Schreibtisch wachsen. `--wipe` ist die rechte Kante der
    // Maske in Prozent; -25 heißt komplett verdeckt, 120 komplett offen.
    if (illuRef.current) {
      if (reduced) {
        gsap.set(illuRef.current, { "--wipe": 120 });
      } else {
        tl.fromTo(
          illuRef.current,
          { "--wipe": -25 },
          { "--wipe": 120, duration: 1.4, ease: "power2.out" },
          0
        );
      }
    }

    // Absolute Positionen statt "-=": der Wipe oben ist länger als die
    // Textzeilen und würde die relative Kette sonst nach hinten schieben.
    // 0 / 0.4 / 0.8 sind exakt die Zeitpunkte der vorherigen "-="-Kette.
    if (line1Ref.current) {
      tl.fromTo(
        line1Ref.current,
        { y: 40, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "expo.out" },
        0
      );
    }

    if (line2Ref.current) {
      tl.fromTo(
        line2Ref.current,
        { y: 30, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "expo.out" },
        0.4
      );
    }

    if (scrollIndicatorRef.current) {
      tl.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
        0.8
      );
    }

    // Leises Wippen des Pfeils. Eigener Tween statt CSS-Keyframe, damit er die
    // y-Werte der Entry-Timeline auf dem Elternknoten nicht überschreibt.
    const arrow = arrowRef.current;
    if (arrow && !reduced) {
      gsap.to(arrow, {
        y: 5,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      });
    }

    return () => {
      tl.kill();
      if (arrow) gsap.killTweensOf(arrow);
    };
  }, []);

  // Scroll-Parallax: der Hero klebt im Wrapper und tritt ebenenweise in die Tiefe
  // zurück. Nahe Ebenen wandern weit, die Zeichnung kaum — daher der Tiefeneindruck.
  useEffect(() => {
    const mm = gsap.matchMedia();

    type Tuning = {
      blur: boolean;
      intensity: number;
    };

    const build =
      ({ blur, intensity }: Tuning) =>
      () => {
      const runway = runwayRef.current;
      if (!runway) return;

      const vh = () => window.innerHeight;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          // Die Runway ist statisch positioniert — die sticky Section als Trigger
          // würde ScrollTrigger unzuverlässig vermessen. Ihre Oberkante sitzt
          // genau eine Hero-Höhe tief, "top bottom" ist also Scroll 0; ihre
          // Unterkante ist der Punkt, an dem die Creme voll deckt.
          trigger: runway,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
          invalidateOnRefresh: true,
          refreshPriority: 2,
          onLeave: () => setHeroActive(false),
          onEnterBack: () => setHeroActive(true),
          // Deckt Scroll-Restore und Anchor-Sprünge ab: dort wechselt der Trigger
          // nie den Zustand, onLeave würde also nie feuern.
          onRefresh: (self) => setHeroActive(self.progress < 1),
        },
      });

      // Leer-Tween hält die Timeline-Länge auf exakt 1, damit die Positions- und
      // Dauer-Angaben unten 1:1 dem Scroll-Fortschritt entsprechen. Ohne ihn würde
      // ScrollTrigger die kürzere Timeline über die volle Strecke strecken.
      tl.to({}, { duration: 1 }, 0);

      // Der Hinweis liegt jetzt in der Creme, nicht mehr über schwarzem Grund —
      // ein weiter Hub würde ihn aus dem Balken heraustragen. Also nur ein
      // kurzes Wegblenden.
      if (cueLayerRef.current) {
        tl.to(cueLayerRef.current, { y: -14, opacity: 0, duration: 0.1 }, 0);
      }

      if (headLayerRef.current) {
        tl.fromTo(
          headLayerRef.current,
          { filter: "blur(0px)" },
          {
            y: () => -vh() * 0.18 * intensity,
            scale: 0.82,
            opacity: 0,
            ...(blur ? { filter: "blur(10px)" } : {}),
            duration: 0.4,
          },
          0
        );
      }

      if (subLayerRef.current) {
        tl.fromTo(
          subLayerRef.current,
          { filter: "blur(0px)" },
          {
            y: () => -vh() * 0.14 * intensity,
            scale: 0.85,
            opacity: 0,
            ...(blur ? { filter: "blur(8px)" } : {}),
            duration: 0.41,
          },
          0.03
        );
      }

      if (illuLayerRef.current) {
        const illu = illuLayerRef.current;

        // Hinterste Ebene: driftet am wenigsten und bleibt am längsten stehen.
        tl.to(
          illu,
          { y: () => -vh() * 0.1 * intensity, scale: 0.8, duration: 1 },
          0
        )
          // power2.in hält die Deckkraft lange oben. Die Zeichnung sitzt tief
          // im Bild, die Panel-Kante erreicht sie erst spät — bis dahin soll
          // sie sichtbar bleiben und verschluckt werden, statt vorher
          // wegzublenden.
          .to(illu, { opacity: 0, duration: 1, ease: "power2.in" }, 0);
      }

      // Die Creme-Kante gehört nicht mehr hierher: die Leistungen-Section
      // fährt selbst als schmaler Balken ein und breitet sich aus (siehe
      // Services.tsx). Ein vorauseilender Stummel im Hero war immer ein
      // zweites Objekt und hat als solches gelesen.
    };

    // prefers-reduced-motion: kein Context → kein Parallax. Runway und sticky
    // sind dort per motion-safe/motion-reduce ebenfalls abgeschaltet.
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      build({ blur: true, intensity: 1 })
    );
    // Ohne Blur: teuerste Operation beim Scrubben, und Lenis ist <=768px ohnehin aus.
    mm.add(
      "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      build({ blur: false, intensity: 0.7 })
    );

    return () => {
      mm.revert();
    };
  }, []);

  // Rotating word animation — pausiert, sobald der Hero durchgescrollt ist
  useEffect(() => {
    if (!heroActive) return;

    const rotating = rotatingRef.current;
    const interval = setInterval(() => {
      if (rotatingRef.current) {
        gsap.to(rotatingRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
            if (rotatingRef.current) {
              gsap.fromTo(
                rotatingRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
              );
            }
          },
        });
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      if (rotating) gsap.killTweensOf(rotating);
    };
  }, [heroActive]);

  return (
    <>
      {/* Stummel und Scroll-Hinweis liegen bewusst NICHT im Hero: `sticky`
          macht die Section zu einem eigenen Stacking-Kontext, ein z-index
          darin käme gegen die Leistungen-Section (z-10) nie an. Als eigener
          klebender Wrapper direkt vor dem Hero klebt er ab Scroll 0 statt
          erst ab 100svh — und mit z-30 bleibt er über der Creme.

          Er ist eine volle Bildschirmhöhe hoch, damit Prozentwerte darin ein
          verlässliches Bezugsmaß haben, und zieht sich per negativem
          margin-bottom denselben Betrag wieder ab: im Fluss belegt er nichts. */}
      <div className="pointer-events-none relative z-30 h-svh mb-[-100svh] motion-safe:sticky motion-safe:top-0">
        {/* Der Hinweis steht jetzt auf dem dunklen Hero, nicht mehr auf Creme:
            helle Tinte statt panel-ink. Er hängt am unteren Bildrand, damit ihn
            die einfahrende Leistungen-Kante nicht mitzieht. */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center"
          style={{ height: `${PEEK}%` }}
        >
          <div ref={cueLayerRef} className="will-change-[transform,opacity]">
            <div
              ref={scrollIndicatorRef}
              className="flex flex-col items-center gap-2 text-[#8a8a8a] opacity-0"
            >
              <svg
                ref={arrowRef}
                width="11"
                height="26"
                viewBox="0 0 11 26"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5.5 0v23M1.5 18.5l4 4.5 4-4.5"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
              <span className="font-mono text-caption uppercase tracking-[0.2em] text-[#6a6a6a]">
                Scrollen
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* `relative` ist der Fallback für reduced motion — die absolut
          positionierten Ebenen brauchen in jedem Fall einen Bezugsrahmen.
          Das padding-bottom hält die untere Bildhälfte für Zeichnung und
          Balken frei: der zentrierte Text wird dadurch nach oben gedrückt und
          kann die Illustration nicht überlagern. */}
      <section
        className="relative motion-safe:sticky motion-safe:top-0 h-svh flex flex-col items-center justify-center overflow-hidden bg-[#050505] pb-[28svh] md:pb-[32svh]"
        id="hero"
      >
        {/* Illustration — hinterste Ebene, bewegt sich am wenigsten */}
        {/* opacity/blend bewusst als Klassen, nicht als Inline-Style: GSAP schreibt
            opacity inline, und React würde ein gleichnamiges style-Prop bei jedem
            Re-Render (rotierendes Wort alle 3 s) zurückschreiben wollen. */}
        <div
          ref={illuLayerRef}
          className="absolute inset-0 z-0 flex items-end justify-end opacity-80 mix-blend-screen pointer-events-none will-change-[transform,opacity]"
          style={{ paddingRight: "8%" }}
        >
          {/* Weiße Strichzeichnung auf reinem Schwarz. mix-blend-screen auf der
              Ebene darüber löscht das Schwarz gegen den #050505-Grund aus —
              deshalb braucht die Datei keinen Alphakanal.
              mb hält sie über der Balkenkante, max-h verhindert, dass sie auf
              flachen Fenstern in die Headline wächst. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={illuRef}
            src="/hero-desk.webp"
            alt=""
            width={1270}
            height={490}
            className="mb-[11svh] w-[min(960px,91vw)] max-h-[32svh] md:max-h-[37svh] object-contain select-none"
            style={{
              ["--wipe" as string]: -25,
              WebkitMaskImage:
                "linear-gradient(90deg, #000 calc(var(--wipe) * 1%), transparent calc((var(--wipe) + 16) * 1%))",
              maskImage:
                "linear-gradient(90deg, #000 calc(var(--wipe) * 1%), transparent calc((var(--wipe) + 16) * 1%))",
            }}
          />
        </div>

        {/* Main Content — linker Einzug bündig zur einfahrenden Panel-Kante */}
        <div
          className="relative z-10 w-full pointer-events-none"
          style={{ paddingLeft: CONTENT_INSET }}
        >
          <div
            className="text-left"
            style={{
              transform: isMobile
                ? "none"
                : `translate3d(${mouse.normalizedX * -5}px, ${mouse.normalizedY * -4}px, 0)`,
              transition: "transform 0.2s ease-out",
            }}
          >
            {/* Line 1 */}
            <div
              ref={headLayerRef}
              className="will-change-[transform,opacity,filter]"
            >
              <span
                ref={line1Ref}
                className="block text-[11vw] md:text-display-lg font-display font-bold tracking-tighter leading-[1.15] opacity-0"
                style={{ color: "#f2ede4" }}
              >
                Hey, ich bin Luca
              </span>
            </div>

            {/* Line 2 */}
            <div
              ref={subLayerRef}
              className="will-change-[transform,opacity,filter]"
            >
              <div ref={line2Ref} className="mt-3 opacity-0">
                <span className="block text-[6.5vw] md:text-display-md font-display font-light leading-[1.3] text-text-secondary">
                  Ich biete
                </span>
                {/* Line 3 - rotating word */}
                <span
                  ref={rotatingRef}
                  className="block text-[8vw] md:text-display-md font-display font-bold tracking-tight leading-[1.4] whitespace-nowrap"
                  style={{ color: "#f2ede4" }}
                >
                  {ROTATING_WORDS[wordIndex]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rückzugs-Strecke: transparent, der klebende Hero bleibt dahinter
          sichtbar. Ihre Höhe ist die einzige Stellschraube dafür, wie früh die
          Leistungen-Section anfängt sich darüberzuschieben — und sie muss zum
          runwayVh der Timelines oben passen. */}
      <div
        ref={runwayRef}
        aria-hidden
        className="h-[40vh] md:h-[50vh] motion-reduce:hidden"
      />
    </>
  );
}
