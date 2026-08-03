"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { heroScroll } from "@/lib/heroScroll";

gsap.registerPlugin(ScrollTrigger);

// Lazy-load the 3D canvas to avoid SSR issues
const HeroCanvas = dynamic(() => import("@/components/canvas/HeroCanvas"), {
  ssr: false,
  loading: () => null,
});

const ROTATING_WORDS = [
  "Web-Apps",
  "Native Apps",
  "KI-Integration",
  "Prozessautomation",
];

export default function Hero() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const rotatingRef = useRef<HTMLSpanElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  // Parallax-Ebenen. Bewusst eigene Wrapper: die Entry-Timeline unten besitzt
  // line1Ref/line2Ref/scrollIndicatorRef und der Maus-Parallax besitzt den
  // .text-left-Knoten — die Scroll-Timeline darf keinen davon anfassen.
  const headLayerRef = useRef<HTMLDivElement>(null);
  const subLayerRef = useRef<HTMLDivElement>(null);
  const cueLayerRef = useRef<HTMLDivElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);

  const mouse = useMousePosition(0.08);
  const isMobile = useIsMobile();
  const [wordIndex, setWordIndex] = useState(0);
  const [heroActive, setHeroActive] = useState(true);

  // Entry animation
  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.2 });

    if (line1Ref.current) {
      tl.fromTo(
        line1Ref.current,
        { y: 40, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "expo.out" }
      );
    }

    if (line2Ref.current) {
      tl.fromTo(
        line2Ref.current,
        { y: 30, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "expo.out" },
        "-=0.6"
      );
    }

    if (scrollIndicatorRef.current) {
      tl.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
        "-=0.4"
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  // Scroll-Parallax: der Hero klebt im Wrapper und tritt ebenenweise in die Tiefe
  // zurück. Nahe Ebenen wandern weit, das ferne Canvas kaum — daher der Tiefeneindruck.
  useEffect(() => {
    const mm = gsap.matchMedia();

    type Tuning = { blur: boolean; intensity: number };

    const build = ({ blur, intensity }: Tuning) => () => {
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
          onUpdate: (self) => {
            heroScroll.progress = self.progress;
          },
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

      if (cueLayerRef.current) {
        tl.to(
          cueLayerRef.current,
          { y: -60, opacity: 0, duration: 0.13 },
          0
        );
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

      if (canvasLayerRef.current) {
        const canvas = canvasLayerRef.current;

        // Hinterste Ebene: driftet am wenigsten und bleibt am längsten stehen.
        tl.to(
          canvas,
          { y: () => -vh() * 0.1 * intensity, scale: 0.8, duration: 1 },
          0
        )
          // power2.in hält die Deckkraft lange oben. Das Objekt sitzt auf halber
          // Höhe, die Panel-Kante erreicht es erst bei ~0.72 — bis dahin soll es
          // sichtbar bleiben und vom Panel verschluckt werden, statt vorher
          // wegzublenden.
          .to(canvas, { opacity: 0, duration: 1, ease: "power2.in" }, 0);
      }
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
      heroScroll.progress = 0;
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
      {/* `relative` ist der Fallback für reduced motion — die absolut
          positionierten Ebenen brauchen in jedem Fall einen Bezugsrahmen. */}
      <section
        className="relative motion-safe:sticky motion-safe:top-0 h-svh flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
        id="hero"
      >
        {/* 3D Canvas Background — hinterste Ebene, bewegt sich am wenigsten */}
        {/* opacity/blend bewusst als Klassen, nicht als Inline-Style: GSAP schreibt
            opacity inline, und React würde ein gleichnamiges style-Prop bei jedem
            Re-Render (rotierendes Wort alle 3 s) zurückschreiben wollen. */}
        <div
          ref={canvasLayerRef}
          className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none will-change-[transform,opacity]"
        >
          <HeroCanvas active={heroActive} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex justify-center px-[var(--container-padding)] pointer-events-none">
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

        {/* Scroll Indicator — vorderste Ebene, verschwindet zuerst.
            Zentrierung liegt im äußeren Flex-Container, damit GSAP auf der
            animierten Ebene keine translate-x-Klasse überschreibt. */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
          <div ref={cueLayerRef} className="will-change-[transform,opacity]">
            <div
              ref={scrollIndicatorRef}
              className="flex flex-col items-center gap-3 opacity-0"
            >
              <span
                className="text-caption font-mono uppercase tracking-widest"
                style={{ color: "#DFBE9F" }}
              >
                Scrollen
              </span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-[#DFBE9F]/50 to-transparent relative overflow-hidden">
                <div className="absolute w-full h-4 bg-[#C49F7B] animate-[scrollDown_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rückzugs-Strecke: transparent, der klebende Hero bleibt dahinter
          sichtbar. Ihre Höhe ist die einzige Stellschraube dafür, wie früh die
          Projekte-Section anfängt sich darüberzuschieben — hier 50vh, die
          Panel-Kante taucht also nach einer halben Bildschirmhöhe auf. */}
      <div
        ref={runwayRef}
        aria-hidden
        className="h-[40vh] md:h-[50vh] motion-reduce:hidden"
      />
    </>
  );
}
