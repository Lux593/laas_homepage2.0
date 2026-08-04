"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import TextReveal from "@/components/ui/TextReveal";
import { useLightSection } from "@/hooks/useLightSection";
import {
  ABOUT_HOBBIES,
  ABOUT_INTRO,
  ABOUT_PORTRAIT,
  ABOUT_ROLES,
  ABOUT_TOOLS,
} from "@/lib/constants";
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

/** Startfarbe der Iris — dasselbe Hellgrau wie der gezoomte LAAS-Schriftzug
 *  auf dem Monitor (liftapp.png @ 0.32 auf heller Bildschirmfläche). Wird beim
 *  Ausbreiten zu #000, noch bevor die Kugel groß ist. */
const IRIS_GREY = "#dddcd8";

/**
 * Lage der Monitor-Bildschirmfläche innerhalb von
 * /vorschaubilder/office_new.webp, in Prozent der gerenderten Bildbox. Nur diese
 * vier Werte anfassen, wenn die Skizze durch einen anderen Ausschnitt ersetzt
 * wird — die gesamte Zoom-Mathematik misst sich zur Laufzeit daraus.
 */
const SCREEN = { left: 40.68, top: 25.6, width: 28.58, height: 29.32 };

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

  /** Welche Rolle gerade angetippt/gehovert ist. Nur wirksam, wenn die Rolle in
   *  den Konstanten ein eigenes Foto trägt — sonst bleibt die Platte stehen. */
  const [activeRole, setActiveRole] = useState<number | null>(null);

  // Cream only while the desk sketch is visible. Once the black iris opens
  // (ZOOM_END of the scrub), nav flips back to dark chrome.
  useLightSection(sectionRef, {
    end: () => {
      const track = trackRef.current;
      if (!track) return "bottom top+=40";
      const mobile =
        window.matchMedia("(max-width: 767px)").matches &&
        window.matchMedia("(min-height: 660px)").matches;
      const zoomEnd = mobile ? ZOOM_END.mobile : ZOOM_END.desktop;
      return `top+=${track.offsetHeight * zoomEnd} top+=40`;
    },
  });

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
        gsap.set(content, {
          clipPath: IRIS_CLOSED,
          backgroundColor: IRIS_GREY,
        });

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
          // Farbe läuft über die ersten 40 % der Clip-Dauer: startet im
          // LAAS-Grau, ist bei 40 % Ausbreitung schwarz — danach wächst nur
          // noch die schwarze Fläche.
          .fromTo(
            content,
            { clipPath: IRIS_CLOSED, backgroundColor: IRIS_GREY },
            { clipPath: IRIS_OPEN, ease: IRIS_EASE, duration: 0.2 },
            zoomEnd
          )
          .to(
            content,
            { backgroundColor: "#000000", ease: "power2.in", duration: 0.08 },
            zoomEnd
          )
          // Läuft wie im Sidebar-Overlay leicht versetzt in der offenen Blende mit,
          // statt danach als zweite, eigene Bewegung.
          .to(
            groups,
            { opacity: 1, y: 0, ease: "power3.out", duration: 0.14, stagger: 0.05 },
            zoomEnd + 0.04
          );
      }
    );

    return () => mm.revert();
  }, []);

  return (
    // Cream-Fortsetzung nach Projekte: kein Top-Radius/Aufwärtsschatten —
    // sonst entstünde ein zweites Panel-Slide auf derselben Cream-Fläche.
    // Die Iris (.about-content) ist schwarz; die Section bleibt cream, damit
    // die Skizze oben/unten nicht von schwarzen Letterbox-Balken gerahmt wird.
    // Unten weicher Schatten Richtung CTA (weniger hart als zuvor).
    <section
      id="about"
      ref={sectionRef}
      className="relative z-10 rounded-b-[1.5rem] bg-[#f2ede4] text-[#0a0a0a] shadow-[0_32px_64px_-28px_rgba(0,0,0,0.35)] md:rounded-b-[2rem]"
    >
      <div ref={trackRef} className="about-track">
        <div ref={stageRef} className="about-stage">
          {/* work-container statt container-custom: dieselbe Spine wie Projekte
              und Prozess (bis 1920), sonst sitzt „Über mich" auf Ultrawides
              weiter innen als die Header darüber. */}
          <header ref={headerRef} className="about-header work-container w-full">
            <span className="mb-3 block font-mono text-caption uppercase tracking-[0.2em] text-[#5f574e]">
              04 - Wer das hier baut
            </span>
            <TextReveal
              as="h2"
              variant="words"
              start="top 95%"
              className="font-display text-[clamp(1.9rem,4vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tighter text-[#0a0a0a]"
            >
              ÜBER MICH
            </TextReveal>
          </header>

          <div ref={sceneRef} className="about-scene">
            <div ref={artRef} className="about-art">
              {/* Bewusst kein next/image: die Datei liefert der Nutzer, ihre
                  Maße stehen nicht fest, und ein falsches width/height-Paar
                  würde das Seitenverhältnis der Bühne verfälschen.
                  Lampenlicht ist bereits im Bild — kein CSS-Licht-Overlay. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/vorschaubilder/office_new.webp"
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
                <div className="absolute left-1/2 top-1/2 w-[36%] -translate-x-1/2 -translate-y-1/2 opacity-[0.32]">
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

          <div ref={contentRef} className="about-content text-[#f2ede4]">
            <div className="work-container flex w-full flex-col">
              {/* Annotiertes Porträt: die Platte in der Mitte ist der Anker,
                  links steht wer das ist, rechts hängen die Rollen als
                  beschriftete Auszüge daran. Dieselbe Zeichnungssprache wie die
                  Bauzeichnung in „Leistungen" — Hairline, Punkt, Beschriftung. */}
              <div className="about-plan">
                {/* Auf schmalen Fenstern lösen sich diese drei per
                    `display: contents` aus dem Wrapper und ordnen sich einzeln
                    im Raster ein — nur so steht das Porträt dort neben dem
                    Namen statt darunter, und alles passt in eine Blende. */}
                <div className="about-left">
                  <div className="about-in about-identity">
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-[#f2ede4]/50">
                      {ABOUT_INTRO.greeting}
                    </p>
                    {/* Zwei Zeilen statt einer: der Name trägt den Grad, den
                        die Section vorher gar nicht ausgespielt hat. */}
                    <h3 className="about-name mt-[clamp(0.5rem,1.4vh,0.9rem)] font-display text-[clamp(2.15rem,5.4vw,4.75rem)] font-bold uppercase leading-[0.86] tracking-[-0.04em]">
                      {ABOUT_INTRO.name.split(" ").map((part) => (
                        <span key={part} className="block">
                          {part}
                        </span>
                      ))}
                    </h3>
                  </div>

                  <p className="about-in about-statement max-w-[34ch] font-body text-body-md leading-relaxed text-[#f2ede4]/70">
                    {ABOUT_INTRO.subtitle}
                  </p>

                  {/* Reine Wortreihe, keine Aufzählungszeichen — der Abstand
                      trennt. */}
                  <div className="about-in about-hobbies">
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#f2ede4]/50">
                      Hobbys
                    </p>
                    <ul className="about-hobby-list mt-[clamp(0.7rem,1.8vh,1.1rem)] font-body text-body-sm text-[#f2ede4]/70">
                      {ABOUT_HOBBIES.map((hobby) => (
                        <li key={hobby}>{hobby}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <figure className="about-in about-plate">
                  <Image
                    src={ABOUT_PORTRAIT.src}
                    alt={ABOUT_PORTRAIT.alt}
                    width={ABOUT_PORTRAIT.width}
                    height={ABOUT_PORTRAIT.height}
                    sizes="(max-width: 767px) 62vw, (max-width: 1023px) 42vw, 36vw"
                    className="about-plate-img"
                    priority={false}
                  />
                  {/* Sobald eine Rolle in den Konstanten ein eigenes Foto trägt,
                      liegt es hier vorbereitet auf der Platte und wird beim
                      Hovern der Annotation aufgeblendet — kein Nachladeruckeln.
                      Ohne solche Fotos rendert diese Schleife nichts. */}
                  {ABOUT_ROLES.map((role, index) =>
                    role.image ? (
                      <Image
                        key={role.company}
                        src={role.image}
                        alt={role.imageAlt ?? ""}
                        width={ABOUT_PORTRAIT.width}
                        height={ABOUT_PORTRAIT.height}
                        sizes="(max-width: 767px) 62vw, (max-width: 1023px) 42vw, 36vw"
                        className="about-plate-img about-plate-alt"
                        data-shown={activeRole === index ? "" : undefined}
                        aria-hidden={activeRole !== index}
                      />
                    ) : null
                  )}
                </figure>

                <div className="about-in about-annotations">
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#f2ede4]/50">
                    Was ich gerade beruflich mache
                  </p>
                  <ul className="about-roles mt-[clamp(0.85rem,2vh,1.35rem)]">
                    {ABOUT_ROLES.map((role, index) => (
                      <li
                        key={role.company}
                        className="about-role"
                        data-active={activeRole === index ? "" : undefined}
                        // Nur Rollen mit eigenem Foto reagieren. Ohne Bild gäbe
                        // es einen Hover-Zustand, der nichts tut.
                        onMouseEnter={() => role.image && setActiveRole(index)}
                        onMouseLeave={() =>
                          setActiveRole((current) => (current === index ? null : current))
                        }
                        onFocus={() => role.image && setActiveRole(index)}
                        onBlur={() =>
                          setActiveRole((current) => (current === index ? null : current))
                        }
                        tabIndex={role.image ? 0 : undefined}
                      >
                        <div className="about-role-body min-w-0">
                          <p className="font-display text-body-sm font-semibold leading-tight text-[#f2ede4] md:text-body-md">
                            {role.company}
                          </p>
                          <p className="mt-1.5 font-body text-caption leading-relaxed text-[#f2ede4]/60">
                            {role.position}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Schriftfeld: in einer technischen Zeichnung steht unten am Rand,
                  womit gezeichnet wurde. Hier eben mit diesen Werkzeugen. */}
              <div className="about-in about-titleblock">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#f2ede4]/50">
                  Tools die ich mag
                </p>
                <ul className="about-tools">
                  {ABOUT_TOOLS.map((tool) => (
                    <li key={tool.name}>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="about-tool"
                        data-cursor-hover
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tool.icon}
                          alt=""
                          width={28}
                          height={28}
                          className="about-tool-icon"
                        />
                        {/* Auf dem Handy stünden sieben beschriftete Einträge
                            in drei Zeilen — die Blende hat die Höhe nicht. Die
                            Marken sind erkennbar, der Name bleibt für
                            Screenreader da und kommt ab sm zurück. */}
                        <span className="about-tool-name sr-only font-mono text-[0.65rem] uppercase tracking-[0.14em] sm:not-sr-only">
                          {tool.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
