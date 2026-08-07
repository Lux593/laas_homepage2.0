"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { PIN_QUERY, STACK_QUERY } from "@/lib/breakpoints";
import "./hero/hero.css";

gsap.registerPlugin(ScrollTrigger);

const ROTATING_WORDS = [
  "Web-Apps",
  "mobile Apps",
  "KI Integration",
  "Prozessautomationen",
  "Website Design",
];

/**
 * Höhe des Streifens am unteren Bildrand, in dem der Scroll-Hinweis sitzt —
 * in Prozent einer Bildschirmhöhe.
 */
const PEEK = 12;

/**
 * Horizontaler Einzug der Hero-Copy — 9% der Bühne.
 *
 * Prozent-Padding rechnet immer gegen den Elternblock, also gegen das ganze
 * Fenster, und nicht gegen die gedeckelte Bühne, in der die Copy steht. Ein
 * blankes "9%" ließe die Headline auf großen Schirmen also weiter nach rechts
 * wandern, während die Zeichnung gegenläufig nach links rückt — genau das
 * Auseinanderdriften, das der Deckel verhindern soll, nur andersherum.
 * min(100%, --stage-max) friert den Bezug oberhalb des Deckels ein; darunter
 * löst es zu 100% auf und ist damit exakt das alte 9%.
 */
const CONTENT_INSET = "calc(0.09 * min(100%, var(--stage-max)))";

/**
 * Layout-Zwilling von `STACK_QUERY` (lib/breakpoints.ts), bewusst OHNE dessen
 * `prefers-reduced-motion`-Klausel.
 *
 * Er beantwortet nicht die Frage „darf animiert werden" — die hängt eine Ebene
 * höher an `reduced` —, sondern „ist das ein gestapeltes Gerät, das den teuren
 * Blur-Pfad nicht bezahlen soll". Mit der Klausel drin fiele ausgerechnet ein
 * Telefon mit reduzierter Bewegung aus dem Stapel-Arm heraus und bekäme die
 * zwei parallel animierten `filter` — die Umkehrung des Zwecks.
 *
 * Die zwei Arme sind wörtlich die aus `breakpoints.ts`: ein geklammertes `not`
 * wäre Media Queries Level 4 und würde in Safari < 16.4 die ganze Query
 * verwerfen. Derselbe Wortlaut steht als `@media` in den Stapel-Regeln.
 */
const STACK_LAYOUT_QUERY =
  "(max-width: 1023.98px), " +
  "(min-width: 1024px) and (pointer: coarse) and (orientation: portrait)";

export default function Hero() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const rotatingRef = useRef<HTMLSpanElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const illuRef = useRef<HTMLImageElement>(null);
  const lampRef = useRef<HTMLImageElement>(null);

  // Parallax-Ebenen. Bewusst eigene Wrapper: die Entry-Timeline unten besitzt
  // line1Ref/line2Ref/scrollIndicatorRef und der Maus-Parallax besitzt den
  // .text-left-Knoten — die Scroll-Timeline darf keinen davon anfassen.
  const headLayerRef = useRef<HTMLDivElement>(null);
  const subLayerRef = useRef<HTMLDivElement>(null);
  const cueLayerRef = useRef<HTMLDivElement>(null);
  const illuLayerRef = useRef<HTMLDivElement>(null);
  const lampLayerRef = useRef<HTMLDivElement>(null);

  const mouse = useMousePosition(0.08);
  const isMobile = useIsMobile();
  const [wordIndex, setWordIndex] = useState(0);
  const [heroActive, setHeroActive] = useState(true);

  // Entry animation
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Einmal beim Mount gelesen, bewusst ohne matchMedia-Kontext: das hier ist
    // die Auftrittstimeline, sie läuft 1.4s ab Paint und danach nie wieder.
    // Ein Dreh während dieser 1.4s ist kein realer Fall — im Gegensatz zum
    // Scroll-Parallax weiter unten, der die ganze Seitenlaufzeit lebt und
    // deshalb gsap.matchMedia braucht.
    // Die Grenze ist die Projektgrenze aus breakpoints.ts, nicht mehr 768px.
    // Vorher stand hier `(max-width: 767.98px)`, und ein iPad Air hochkant
    // (820px, Touch) bekam deshalb im Hero den Blur-Auftritt, während dieselbe
    // Seite eine Section tiefer dasselbe Gerät als gestapelt behandelt —
    // gemessen: zwei parallel animierte `filter` auf 820×1180.
    const narrow = window.matchMedia(STACK_LAYOUT_QUERY).matches;
    // Kurzer Beat nach Paint — früher 2.2s für den Preloader, der aktuell aus ist.
    const tl = gsap.timeline({ delay: 0.4 });

    // Zuerst geht die Lampe an. Die Maske läuft von oben nach unten, also
    // erst das Kabel herunter, dann das Glas, dann der Kegel. `--glow` ist
    // ihre Unterkante in Prozent.
    //
    // -20 statt -8: bei -8 endet der weiche Rand der Maske erst bei 6%, die
    // obersten Prozent der Grafik blieben also sichtbar und das Kabelende
    // stand schon vor dem Start im Bild. Ab -20 liegt die Maske vollständig
    // über der Grafik — die Lampe ist wirklich aus.
    if (lampRef.current) {
      const lamp = lampRef.current;

      if (reduced) {
        gsap.set(lamp, { "--glow": 130, opacity: 1 });
      } else {
        // Deckkraft an, sobald die Timeline anläuft. Sie ist zu dem Zeitpunkt
        // noch komplett wegmaskiert (--glow: -20) — sichtbar wird dadurch
        // nichts. Warum trotzdem: siehe opacity-0 am <img> weiter unten.
        tl.set(lamp, { opacity: 1 }, 0);

        // Bewusst ohne Zucken der Birne: das Glas ist zu dem Zeitpunkt schon
        // sichtbar, ein Dip danach liest sich als Fehler statt als Einschalten.
        tl.fromTo(
          lamp,
          { "--glow": -20 },
          { "--glow": 130, duration: 1.2, ease: "power2.out" },
          0,
        );
      }
    }

    // Kurz nach der Lampe: bei 0.2 ist der Kegel schon sichtbar, die
    // Zeichnung folgt knapp dahinter und wirkt von ihm freigelegt.
    //
    // Gleicher Top-down-Wipe wie die Lampe: die Maske läuft von oben nach
    // unten, als würde der Lichtkegel die Zeichnung freilegen. `--wipe` ist
    // die Unterkante der Maske in Prozent; -25 heißt komplett verdeckt,
    // 120 komplett offen.
    if (illuRef.current) {
      if (reduced) {
        gsap.set(illuRef.current, { "--wipe": 120, opacity: 1 });
      } else {
        tl.set(illuRef.current, { opacity: 1 }, 0.2);
        tl.fromTo(
          illuRef.current,
          { "--wipe": -25 },
          { "--wipe": 120, duration: 1.4, ease: "power2.out" },
          0.2,
        );
      }
    }

    // Absolute Positionen statt "-=": der Wipe oben ist länger als die
    // Textzeilen und würde die relative Kette sonst nach hinten schieben.
    // 0 / 0.4 / 0.8 sind exakt die Zeitpunkte der vorherigen "-="-Kette.
    // Im gestapelten Layout fällt der Blur weg. `filter` ist die teuerste animierbare
    // Eigenschaft überhaupt: der komplette Textkasten wird 60×/s neu gerastert
    // und weichgezeichnet — und zwar genau im LCP-Fenster, parallel zu
    // Hydration, Font-Swap und den beiden Masken-Wipes darüber. Auf 375px
    // liegen dort sonst gleichzeitig zwei animierte `filter`, zwei animierte
    // `mask-image` und der Nav-Einflug auf einem Main Thread.
    //
    // Damit der Auftritt nicht schwächer wird, statt dessen mehr Weg und ein
    // Versatz: zwei gestaffelte Zeilen lesen sich auf einem schmalen Screen als
    // mehr Choreografie als ein gemeinsamer Blur — und kosten nur Compositing.
    const soften = (px: number) => (narrow ? {} : { filter: `blur(${px}px)` });
    const sharp = narrow ? {} : { filter: "blur(0px)" };

    if (line1Ref.current) {
      tl.fromTo(
        line1Ref.current,
        { y: narrow ? 56 : 40, opacity: 0, ...soften(8) },
        { y: 0, opacity: 1, ...sharp, duration: 1, ease: "expo.out" },
        0,
      );
    }

    if (line2Ref.current) {
      tl.fromTo(
        line2Ref.current,
        { y: narrow ? 42 : 30, opacity: 0, ...soften(8) },
        { y: 0, opacity: 1, ...sharp, duration: 0.8, ease: "expo.out" },
        // 0.52 statt 0.4: der Versatz zwischen den Zeilen ersetzt im Stapel die
        // Schärfeverlagerung. Im Pin-Layout bleibt es bei 0.4 — dort trägt der Blur.
        narrow ? 0.52 : 0.4,
      );
    }

    if (scrollIndicatorRef.current) {
      tl.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
        0.8,
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

    // Hängelampe: echte Sinuskurve statt CSS alternate. Amplitude baut sich
    // nach dem Einschalten auf — so wirkt das Pendeln wie Luftzug, nicht wie
    // ein Loop von Anfang an auf Vollausschlag.
    const lamp = lampRef.current;
    const sway = { phase: 0 };
    const amp = { value: 0 };
    if (lamp && !reduced) {
      gsap.set(lamp, { transformOrigin: "49.9% 0%" });

      gsap.to(amp, {
        value: 2,
        duration: 2.8,
        ease: "power2.out",
        delay: 1.2,
      });

      gsap.to(sway, {
        phase: Math.PI * 2,
        duration: 8,
        ease: "none",
        repeat: -1,
        delay: 1.2,
        onUpdate: () => {
          gsap.set(lamp, { rotation: Math.sin(sway.phase) * amp.value });
        },
      });
    }

    return () => {
      tl.kill();
      if (arrow) gsap.killTweensOf(arrow);
      if (lamp) gsap.killTweensOf(lamp);
      gsap.killTweensOf(sway);
      gsap.killTweensOf(amp);
    };
  }, []);

  // Scroll-Parallax: der Hero klebt im Wrapper und tritt ebenenweise in die Tiefe
  // zurück. Nahe Ebenen wandern weit, die Zeichnung kaum — daher der Tiefeneindruck.
  useEffect(() => {
    const mm = gsap.matchMedia();

    type Tuning = {
      blur: boolean;
      intensity: number;
      /**
       * Anteil der Runway, über den die Kopfzeile zurücktritt und ausblendet.
       * Die Subzeile hängt mit +0.01 daran.
       */
      retreat: number;
    };

    const build =
      ({ blur, intensity, retreat }: Tuning) =>
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
              duration: retreat,
            },
            0,
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
              duration: retreat + 0.01,
            },
            0.03,
          );
        }

        if (illuLayerRef.current) {
          const illu = illuLayerRef.current;

          // Hinterste Ebene: driftet am wenigsten und bleibt am längsten stehen.
          tl.to(
            illu,
            { y: () => -vh() * 0.1 * intensity, scale: 0.8, duration: 1 },
            0,
          )
            // power2.in hält die Deckkraft lange oben. Die Zeichnung sitzt tief
            // im Bild, die Panel-Kante erreicht sie erst spät — bis dahin soll
            // sie sichtbar bleiben und verschluckt werden, statt vorher
            // wegzublenden.
            .to(illu, { opacity: 0, duration: 1, ease: "power2.in" }, 0);
        }

        // Die Lampe driftet wie die Zeichnung, wird aber NICHT skaliert: ihr
        // Kabel hängt am oberen Bildrand, ein Zusammenziehen zur Mitte würde es
        // sichtbar vom Rand lösen. Dieselbe Deckkraft-Kurve, damit Lampe und
        // Zeichnung als eine Szene verschluckt werden.
        if (lampLayerRef.current) {
          const lamp = lampLayerRef.current;

          tl.to(lamp, { y: () => -vh() * 0.1 * intensity, duration: 1 }, 0).to(
            lamp,
            { opacity: 0, duration: 1, ease: "power2.in" },
            0,
          );
        }

        // Die Creme-Kante gehört nicht mehr hierher: die Leistungen-Section
        // fährt selbst als schmaler Balken ein und breitet sich aus (siehe
        // Services.tsx). Ein vorauseilender Stummel im Hero war immer ein
        // zweites Objekt und hat als solches gelesen.
      };

    // Die Grenze ist dieselbe wie in Services/Prozess: PIN_QUERY und
    // STACK_QUERY sind exakte Gegenstücke, jedes Gerät matcht genau eines.
    // Vorher trennte der Hero bei 768px und war damit als einzige Section
    // anderer Meinung: ein iPad Air hochkant (820px, Touch) lief hier im
    // Desktop-Arm — gemessen mit geskrubbtem filter: blur(0px) → blur(10px) auf
    // der Kopfzeile —, während es eine Section tiefer gestapelt läuft und den
    // Pin nie sieht. Dasselbe Gerät kann nicht zwei Performance-Klassen haben.
    //
    // Beide Queries tragen ihre prefers-reduced-motion-Klausel selbst: matcht
    // keine, gibt es keinen Context und damit keinen Parallax. Runway und
    // sticky sind dort per motion-safe/motion-reduce ebenfalls abgeschaltet.
    mm.add(PIN_QUERY, build({ blur: true, intensity: 1, retreat: 0.4 }));

    // Ohne Blur: teuerste Operation beim Scrubben. Auf dem Telefon kommt dazu,
    // dass Lenis dort ohnehin aus ist (SmoothScroll.tsx, <= 767.98px); auf dem
    // iPad hochkant läuft Lenis weiter und der Blur wäre umso teurer.
    //
    // retreat 0.86 statt 0.4 — der eigentliche Takt-Fix. Mit 0.4 war die
    // Kopfzeile bei 44 % der Runway fertig (gemessen: opacity 0 ab scrollY 557
    // von 1273) und stand die restlichen 56 % eingefroren da, während oben im
    // Bild nichts mehr passierte; die Cremekante erreicht die Headline erst bei
    // rund drei Vierteln der Strecke. Kürzen der Runway hilft dagegen nicht:
    // die Trigger-Spanne ist Hero-Höhe + Runway, das Verhältnis 0.4 zu 1 und
    // damit die tote Strecke bleiben prozentual gleich, nur in Pixeln kleiner.
    // Bleibt das Strecken der Dauer. 0.86 und nicht 1.0, damit die Ordnung der
    // Ebenen erhalten bleibt: Kopf- und Subzeile (0.87) sind vor Zeichnung und
    // Lampe (1.0) verschwunden, die nahe Ebene geht also weiterhin zuerst.
    // Die Kopfzeile legt dabei weiterhin den 1.8-fachen Weg der Zeichnung
    // zurück (0.18 gegen 0.1 Bildschirmhöhe, beide mit intensity verrechnet) —
    // die Tiefenstaffelung liegt jetzt in der Weite, nicht mehr im Tempo.
    mm.add(STACK_QUERY, build({ blur: false, intensity: 0.7, retreat: 0.86 }));

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
                { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
              );
            }
          },
        });
      }
    }, 2000);

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
            Re-Render (rotierendes Wort alle 3 s) zurückschreiben wollen.

            Das padding-right sind 8% der Bühne, nicht des Fensters — dieselbe
            Rechnung wie bei CONTENT_INSET oben. Es muss auf denselben Wert
            kommen wie das right: 8% der Lampe in hero.css, sonst hängt sie
            nicht mehr mittig über der Zeichnung. */}
        <div
          ref={illuLayerRef}
          className="absolute inset-0 z-0 mx-auto w-[min(100%,var(--stage-max))] flex items-end justify-end opacity-80 mix-blend-screen pointer-events-none will-change-[transform,opacity]"
          style={{ paddingRight: "calc(0.08 * min(100%, var(--stage-max)))" }}
        >
          {/* Weiße Strichzeichnung auf reinem Schwarz. mix-blend-screen auf der
              Ebene darüber löscht das Schwarz gegen den #050505-Grund aus —
              deshalb braucht die Datei keinen Alphakanal.
              mb hält sie über der Balkenkante, max-h verhindert, dass sie auf
              flachen Fenstern in die Headline wächst.

              opacity-0 ist der Startzustand, nicht der Wipe. Verdeckt ist die
              Zeichnung eigentlich schon durch die Maske (--wipe: -25). Nur
              hängt die Maske am Compositor: in einer Aufnahme des Seitenaufbaus
              stand die Zeichnung für ein paar Frames komplett im Bild, bevor
              die Maske griff — genau das "kurz alles sichtbar, dann weg". Die
              Deckkraft wird auf Style-Ebene ausgewertet und kann diesen Frame
              nicht verpassen. Die Timeline schaltet sie zum Wipe-Start auf 1,
              wo die Maske ohnehin noch alles verdeckt — sichtbar ändert sich
              dadurch nichts. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={illuRef}
            src="/hero-desk.webp"
            alt=""
            width={1270}
            height={490}
            className="mb-[11svh] w-[min(960px,91vw)] max-h-[32svh] md:max-h-[37svh] object-contain select-none opacity-0"
            style={{
              ["--wipe" as string]: -25,
              WebkitMaskImage:
                "linear-gradient(180deg, #000 calc(var(--wipe) * 1%), transparent calc((var(--wipe) + 16) * 1%))",
              maskImage:
                "linear-gradient(180deg, #000 calc(var(--wipe) * 1%), transparent calc((var(--wipe) + 16) * 1%))",
            }}
          />
        </div>

        {/* Hängelampe — Vektor 1:1 aus dem Canva-Blatt, Maße und Anschluss an
            die Zeichnung stehen in hero.css. Eigene Ebene über der Zeichnung
            (wie in Canva), aber unter der Copy (z-10): so läuft das Kabel
            hinter der Headline durch statt über sie. */}
        <div
          ref={lampLayerRef}
          className="hero-lamp z-0 will-change-[transform,opacity]"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={lampRef}
            src="/hero-lamp.svg"
            alt=""
            width={1587}
            height={1755}
            className="hero-lamp__art select-none opacity-0"
            style={{
              ["--glow" as string]: -20,
              WebkitMaskImage:
                "linear-gradient(180deg, #000 calc(var(--glow) * 1%), transparent calc((var(--glow) + 14) * 1%))",
              maskImage:
                "linear-gradient(180deg, #000 calc(var(--glow) * 1%), transparent calc((var(--glow) + 14) * 1%))",
            }}
          />
        </div>

        {/* Main Content — linker Einzug bündig zur einfahrenden Panel-Kante.
            max-w deckelt die Bühne wie bei der Zeichnungs-Ebene: der Einzug
            ist danach 9% des Deckels, nicht mehr des Fensters. Ohne ihn
            liefen Headline und Zeichnung auf großen Schirmen auseinander und
            die Mitte bliebe leer. Zentriert wird über items-center der
            Section — auto-Margins würden hier als Flex-Item das w-full
            aushebeln. */}
        <div
          className="relative z-10 w-full max-w-[var(--stage-max)] pointer-events-none"
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
                  Mein Fokus
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
          Leistungen-Section anfängt sich darüberzuschieben.

          Sie muss auf keinen Wert in den Timelines abgestimmt werden: die
          Scroll-Timeline nimmt dieses div selbst als Trigger und leitet ihre
          Spanne daraus ab. Gemessen ist diese Spanne Hero-Höhe + diese Höhe —
          auf 393×852 sind das 852 + 0.4·852 = 1193px, exakt die Strecke, über
          die ScrollTrigger scrubbt.

          Deshalb hilft Kürzen auch nicht gegen tote Strecke: der Nenner
          schrumpft mit, jede Timeline-Position bleibt prozentual dieselbe. */}
      <div
        ref={runwayRef}
        aria-hidden
        className="h-[40vh] md:h-[50vh] motion-reduce:hidden"
      />
    </>
  );
}
