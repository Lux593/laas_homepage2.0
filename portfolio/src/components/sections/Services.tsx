"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import { useLightSection } from "@/hooks/useLightSection";
import { useStackReveal } from "@/hooks/useStackReveal";
import { SERVICES, SERVICES_INTRO, type Service } from "@/lib/constants";
import ServicesLandscape from "@/components/sections/services/ServicesLandscape";
import "./services/services.css";

gsap.registerPlugin(ScrollTrigger);

const TOTAL = String(SERVICES.length).padStart(2, "0");
const CHAPTER = 1 / SERVICES.length;

/** Seitlicher Einzug des einfahrenden Balkens in Prozent — bündig zur Hero-Copy. */
const ENTER_INSET = 9;

/* Kapitelwechsel. Die Verhältnisse sind die des Prozess-Crossfades
   (useProcessPin: raus power1.in, rein power2.out, rund ein Drittel
   Überlappung), nur in Sekunden statt in Timeline-Einheiten — hier hängt der
   Wechsel nicht am Scrub, sondern läuft beim Indexsprung ab. */
/** Abgang des alten Kapitels. */
const SWAP_LEAVE = 0.22;
/** Auftritt des neuen Kapitels. */
const SWAP_ENTER = 0.45;
/** Der Auftritt setzt nach 60 % des Abgangs ein — kurz genug, dass nie zwei
    Texte lesbar übereinander stehen. */
const SWAP_HANDOVER = 0.13;
/** Pixel, die der Abgang sich gegen die Scrollrichtung hebt. */
const SWAP_LEAVE_SHIFT = 10;
/** Pixel, aus denen der Auftritt aus der Scrollrichtung nachrückt. */
const SWAP_ENTER_SHIFT = 18;

function titleLines(title: string) {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 2) return [title];
  return [parts[0]!, parts.slice(1).join(" ")];
}

function ServicesHeader({
  counterRef,
}: {
  counterRef?: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <header className="work-container relative z-20 w-full shrink-0 pt-[clamp(4rem,8vh,5.5rem)] pb-[clamp(0.875rem,2vh,1.375rem)]">
      <div className="flex items-end justify-between gap-8">
        <div className="min-w-0">
          <span className="mb-2 block font-mono text-caption uppercase tracking-[0.2em] text-[#6a6a6a] lg:mb-3">
            {SERVICES_INTRO.eyebrow}
          </span>
          <TextReveal
            as="h2"
            variant="words"
            start="top 95%"
            className="font-display text-[clamp(1.75rem,4vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tighter text-[#0a0a0a]"
          >
            {SERVICES_INTRO.headline}
          </TextReveal>
        </div>

        {counterRef ? (
          <div
            className="hidden shrink-0 items-baseline gap-2 lg:flex"
            aria-hidden
          >
            <span
              ref={counterRef}
              className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-bold leading-none tracking-tighter tabular-nums text-[#0a0a0a]"
            >
              01
            </span>
            <span className="font-display text-caption font-bold tracking-tighter tabular-nums text-[#6a6a6a]">
              / {TOTAL}
            </span>
          </div>
        ) : null}
      </div>
    </header>
  );
}

/**
 * Mobile / reduced-motion: volles Kapitel pro Panel, Lookbook-Typografie.
 */
function ServicePanel({
  service,
  index,
  total,
}: {
  service: Service;
  index: number;
  total: number;
}) {
  const lines = titleLines(service.title);

  return (
    <article className="services-panel relative flex flex-col justify-start">
      <div className="work-container w-full">
        <div className="services-panel__inner">
          <div
            data-reveal="copy"
            className="mb-8 flex items-center gap-4"
            aria-hidden
          >
            <span className="font-display text-[clamp(2.5rem,12vw,4rem)] font-bold leading-none tracking-tighter tabular-nums text-[#0a0a0a]/12">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span data-reveal="rule" className="h-px flex-1 bg-[#0a0a0a]/15" />
            <span className="shrink-0 font-mono text-caption tabular-nums tracking-[0.2em] text-[#0a0a0a]/45">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          <header data-reveal="copy">
            <h3 className="services-panel__title font-display font-bold uppercase tracking-tighter text-[#0a0a0a]">
              {lines.map((line) => (
                <span key={line} className="block leading-[0.92]">
                  {line}
                </span>
              ))}
            </h3>
          </header>

          <p
            data-reveal="copy"
            className="mt-7 max-w-[36ch] font-body text-body-md leading-relaxed text-[#5f574e]"
          >
            {service.description}
          </p>
        </div>
      </div>
    </article>
  );
}

/**
 * Leistungen — Lookbook-Theater.
 *
 * Desktop: sticky Bühne, asymmetrisches Split, Riesen-Kapiteltypografie,
 * kontinuierlicher Progress-Scrub, Kapitel-Rail.
 * Mobile: Stack + useStackReveal, gleiche typografische Sprache.
 */
export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLightSection(sectionRef);
  useStackReveal(stackRef, { panel: ".services-panel" });

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const featured = gsap.utils.toArray<HTMLElement>("[data-featured]", stage);
    /** Titel und Subtext je Ebene — nur sie werden versetzt. */
    const featuredCopy = featured.map((layer) =>
      gsap.utils.toArray<HTMLElement>("[data-featured-copy]", layer)
    );
    const chapters = stage.querySelectorAll<HTMLElement>("[data-chapter]");
    let lastIndex = -1;
    /** Vor dem Initialstand wird nur gesetzt, nicht bewegt. */
    let armed = false;
    let swap: gsap.core.Timeline | null = null;

    /**
     * Kapitelwechsel — bewusst OHNE eigene Compositing-Ebene.
     *
     * Eine eigene Ebene ist hier nicht die Lösung, sondern die Ursache: sie
     * entsteht mitten in der sichtbaren Bewegung, der Text landet für ihre
     * Dauer auf einem eigenen Geräte-Pixel-Raster und wabert, und alles, was
     * die Ebene überlappt, muss Chrome mitpromoten — das trifft als Erstes
     * die 1-px-Fortschrittslinie darunter, die genau davon flimmert.
     *
     * Also: keine Promotion. Drei Vorkehrungen halten den Wechsel trotzdem
     * billig und ruhig:
     *   - force3D: false — sonst schiebt GSAP von sich aus ein translate3d()
     *     unter den Tween und promotet die Ebene doch.
     *   - roundProps: "y" — der Versatz läuft in ganzen Pixeln. Damit bleibt
     *     das Subpixel-Antialiasing erhalten und der Text zittert nicht auf
     *     gebrochenen Positionen.
     *   - Versetzt werden nur Titel und Subtext, nicht die randlose Ebene:
     *     deren Kasten füllt die ganze Spalte, und 18 px Versatz schöben ihre
     *     Zeichenfläche in die Rail darunter.
     * Und weiterhin: niemals filter, clip-path, mask oder box-shadow.
     */
    const swapChapter = (activeIndex: number, direction: 1 | -1) => {
      const enter = featured[activeIndex];
      const enterCopy = featuredCopy[activeIndex];
      if (!enter || !enterCopy) return;

      // Bei schnellem Scrollen springt der Index mehrfach hintereinander.
      swap?.kill();
      swap = null;

      // Abgehen muss alles, was noch sichtbar ist — auch eine Ebene aus einem
      // abgebrochenen Wechsel, die sonst halbtransparent stehen bliebe.
      const leaving = featured
        .map((layer, index) => index)
        .filter(
          (index) =>
            index !== activeIndex &&
            Number(gsap.getProperty(featured[index]!, "opacity")) > 0
        );
      const leave = leaving.map((index) => featured[index]!);
      const leaveCopy = leaving.flatMap((index) => featuredCopy[index]!);

      swap = gsap.timeline({
        onComplete: () => {
          // Ruhezustand ohne Inline-Transform: erst ohne transform rendert
          // der Text wieder mit vollem Subpixel-Antialiasing.
          gsap.set([...enterCopy, ...leaveCopy], { clearProps: "transform" });
          swap = null;
        },
      });

      if (leave.length) {
        // autoAlpha statt opacity: die abgegangene Ebene landet auf
        // visibility: hidden und kostet danach gar keine Zeichenzeit mehr.
        swap
          .to(
            leave,
            { autoAlpha: 0, duration: SWAP_LEAVE, ease: "power1.in" },
            0
          )
          .to(
            leaveCopy,
            {
              y: -SWAP_LEAVE_SHIFT * direction,
              duration: SWAP_LEAVE,
              ease: "power1.in",
              force3D: false,
              roundProps: "y",
            },
            0
          );
      }

      swap
        .fromTo(
          enter,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: SWAP_ENTER, ease: "power2.out" },
          SWAP_HANDOVER
        )
        .fromTo(
          enterCopy,
          { y: SWAP_ENTER_SHIFT * direction },
          {
            y: 0,
            duration: SWAP_ENTER,
            ease: "power2.out",
            force3D: false,
            roundProps: "y",
          },
          SWAP_HANDOVER
        );
    };

    const applyActive = (activeIndex: number) => {
      featured.forEach((layer, index) => {
        const on = index === activeIndex;
        layer.classList.toggle("is-active", on);
        layer.setAttribute("aria-hidden", on ? "false" : "true");
      });

      chapters.forEach((chapter, index) => {
        chapter.classList.toggle("is-active", index === activeIndex);
      });

      if (counterRef.current) {
        counterRef.current.textContent = String(activeIndex + 1).padStart(
          2,
          "0"
        );
      }
    };

    const applyScrub = (progress: number) => {
      const activeIndex = Math.min(
        SERVICES.length - 1,
        Math.floor(progress / CHAPTER)
      );

      // Kontinuierlicher Progress — pro Frame, nur Transform.
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.max(progress, 0.02)})`;
      }

      if (activeIndex !== lastIndex) {
        const previous = lastIndex;
        lastIndex = activeIndex;
        applyActive(activeIndex);
        // previous === -1 ist der Initialstand: der wird gesetzt, nicht
        // eingeblendet. Die Richtung folgt dem Indexsprung, damit der alte
        // Text beim Hochscrollen nach unten abgeht statt nach oben.
        if (armed && previous !== -1) {
          swapChapter(activeIndex, activeIndex > previous ? 1 : -1);
        }
      }
    };

    const mm = gsap.matchMedia();

    // ── Einfahrt der zweiten Seite ────────────────────────────────────────
    //
    // Kein vorauseilender Stummel mehr: die Section selbst kommt als schmaler,
    // seitlich eingezogener Balken herein und klappt dann auf volle Breite auf.
    // Die Höhe macht der Scroll von allein — die Oberkante der Section IST die
    // Oberkante des Balkens. Animiert wird deshalb nur der seitliche Einzug und
    // der Radius, und zwar über clip-path: box-shadow/Radien am Element würden
    // beim Aufklappen eine zweite Kante in die Cremefläche zeichnen.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const section = sectionRef.current;
      if (!section) return;

      const token = (name: string, fallback: string) =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
        fallback;

      const wide = window.matchMedia("(min-width: 768px)").matches;
      const openRadius = wide ? 3 : 2.5;
      const restRadius = parseFloat(
        wide ? token("--radius-panel-lg", "2rem") : token("--radius-panel", "1.5rem")
      );

      // clip-path als Ganzes tweenen geht nicht: Chrome meldet den eingezogenen
      // Startwert in der Kurzform (`inset(0% 9% round …)`) zurück, GSAP mischt
      // dann Rechts-Einzug gegen Unten-Einzug und der Radius springt. Also
      // laufen zwei Zahlen, den String setzt services.css zusammen.
      //
      // Dass GSAP diese Zahlen als CSS-Variablen selbst schreibt und sie nicht
      // aus einem onUpdate in style.clipPath wandern, ist kein Stil, sondern
      // Bedingung: bei jedem refresh() rendert ScrollTrigger die Timeline
      // einmal mit unterdrückten Callbacks neu (revert → invalidate → zurück
      // auf den alten Fortschritt). Ein aus onUpdate gesetzter clip-path bliebe
      // dabei auf dem Balken-Wert stehen, während die Animation sich für
      // „offen" hält — und da der Fortschritt sich nicht ändert, holt das keine
      // spätere Aktualisierung nach. Die Section hinge bis zum nächsten echten
      // Scrubben quer über den Inhalt geschnitten fest.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top 55%",
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });

      // Erst als Balken hereinfahren (Werte stehen still, daher der Versatz auf
      // 0.45), dann aufklappen.
      //
      // MUSS ein fromTo bleiben, kein set + to: revert() merkt sich als
      // Ursprungswert `style[prop]`, und das ist bei einer Custom Property
      // immer undefined — GSAP löscht die Inline-Variable also, statt sie
      // zurückzuschreiben. Der Wert fällt damit auf den Ruhezustand aus
      // services.css (0%), und ein to() läse beim invalidate() genau diese 0%
      // als neuen Startwert ein: die Einfahrt wäre nach dem ersten Refresh tot
      // und die Section schöbe sich in voller Breite über den Hero. Beim fromTo
      // steht der Startwert in den Vars und übersteht das.
      tl.fromTo(
        section,
        {
          "--enter-inset": `${ENTER_INSET}%`,
          "--enter-radius": `${openRadius}rem`,
        },
        {
          "--enter-inset": "0%",
          "--enter-radius": `${restRadius}rem`,
          duration: 0.55,
          ease: "power2.out",
          immediateRender: true,
        },
        0.45
      );

      // Der Balken fährt leer herein. Sonst steht die Kopfzeile schon in dem
      // schmalen Streifen und wird von der Clip-Kante mitten im Wort
      // abgeschnitten — der Inhalt kommt erst, wenn die Fläche fast offen ist.
      const content = [track, stackRef.current].filter(
        (el): el is HTMLDivElement => el !== null
      );
      if (content.length) {
        tl.fromTo(
          content,
          { opacity: 0 },
          { opacity: 0, duration: 0.55, ease: "none" },
          0
        ).to(content, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0.55);
      }

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(section, { clearProps: "--enter-inset,--enter-radius" });
        if (content.length) gsap.set(content, { clearProps: "opacity" });
      };
    });

    // MUSS byte-identisch zur @media-Query für .services-pin--desktop bleiben
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        // Ab hier führt GSAP die Deckkraft der Ebenen inline; die Klasse
        // .is-active bleibt für pointer-events, aria und die
        // Stapelreihenfolge zuständig. Die opacity-Regeln in services.css
        // sind damit nur noch der Ruhezustand für Skript-aus.
        featured.forEach((layer, index) =>
          gsap.set(layer, { autoAlpha: index === 0 ? 1 : 0 })
        );

        const st = ScrollTrigger.create({
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.45,
          onUpdate: (self) => applyScrub(self.progress),
          // Ein Refresh setzt den Stand nur nach, er animiert nicht: der
          // AnimationProvider stößt nach document.fonts.ready einen an, und
          // sonst liefe kurz nach dem Laden ein Kapitelwechsel los, den
          // niemand ausgelöst hat.
          // Den vorigen Stand wiederherstellen statt blind scharf zu
          // schalten: dieses onRefresh feuert schon während create(), und
          // dort darf noch nichts animieren.
          onRefresh: (self) => {
            const wasArmed = armed;
            armed = false;
            applyScrub(self.progress);
            armed = wasArmed;
          },
          invalidateOnRefresh: true,
          refreshPriority: 1,
        });

        // Erststand aus der tatsächlichen Scrollposition, bevor scharf
        // geschaltet wird: beim Reload mitten in der Sektion steht sofort das
        // richtige Kapitel da, ohne Einblendung.
        applyScrub(st.progress);
        armed = true;

        return () => {
          st.kill();
          swap?.kill();
          swap = null;
          armed = false;
          lastIndex = -1;
          // Zurück unter CSS-Kontrolle — sonst bliebe beim Wechsel unter
          // 1024 px eine Ebene auf visibility: hidden stehen.
          gsap.set(featured, { clearProps: "opacity,visibility" });
          gsap.set(featuredCopy.flat(), { clearProps: "transform" });
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    /* Radius und Schatten als Klassen nur im reduced-motion-Fall: sonst setzt
       die Einfahrt beides über den clip-path in services.css, und ein
       zusätzlicher box-shadow würde davon ohnehin weggeschnitten. */
    <section
      id="services"
      ref={sectionRef}
      className="services-section relative z-10 overflow-x-clip bg-panel text-panel-ink motion-reduce:rounded-t-panel motion-reduce:shadow-panel-lift motion-reduce:md:rounded-t-panel-lg"
    >
      <div ref={trackRef} className="services-pin--desktop relative w-full">
        <div className="sticky top-0 z-20 h-[100svh] w-full [backface-visibility:hidden] [transform:translateZ(0)]">
          <div className="flex h-full w-full flex-col overflow-hidden">
            <ServicesHeader counterRef={counterRef} />

            <div ref={stageRef} className="services-stage work-container">
              {/* Links: dominante Landschaft */}
              <div className="services-landscape-slot">
                <ServicesLandscape className="services-landscape--desktop" />
              </div>

              {/* Rechts: Lookbook-Kapitel */}
              <div className="services-lookbook">
                <div className="services-featured">
                  {SERVICES.map((service, index) => {
                    const lines = titleLines(service.title);
                    return (
                      <div
                        key={service.id}
                        data-featured
                        data-index={index}
                        className={`services-featured__layer${index === 0 ? " is-active" : ""}`}
                        aria-hidden={index !== 0}
                      >
                        {/* data-featured-copy: nur diese beiden Kästen werden
                            versetzt, nicht die randlose Ebene darum — sonst
                            wächst deren Zeichenfläche in die Rail darunter. */}
                        <h3
                          data-featured-copy
                          className="services-featured__title font-display font-bold uppercase tracking-tighter text-[#0a0a0a]"
                        >
                          {lines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </h3>
                        <p
                          data-featured-copy
                          className="services-featured__body font-body text-[#5f574e]"
                        >
                          {service.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="services-rail">
                  <div className="services-rail__track" aria-hidden>
                    <div
                      ref={progressRef}
                      className="services-rail__fill"
                      style={{ transform: "scaleX(0.02)" }}
                    />
                  </div>

                  <nav className="services-chapters" aria-label="Leistungen">
                    {SERVICES.map((service, index) => (
                      <div
                        key={service.id}
                        data-chapter
                        data-index={index}
                        className={`services-chapter${index === 0 ? " is-active" : ""}`}
                      >
                        <span className="services-chapter__mark font-display font-bold tracking-tighter tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="services-chapter__label font-display font-bold uppercase tracking-tight">
                          {service.title}
                        </span>
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none h-[400vh] w-px shrink-0"
          aria-hidden
        />
      </div>

      <div ref={stackRef} className="services-stack">
        <ServicesHeader />

        <div className="mt-[clamp(1.25rem,3vh,2.5rem)] w-full">
          <ServicesLandscape className="services-landscape--stack" />
        </div>

        <div className="services-track">
          {SERVICES.map((service, index) => (
            <ServicePanel
              key={service.id}
              service={service}
              index={index}
              total={SERVICES.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
