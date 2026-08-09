"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STACK_QUERY } from "@/lib/breakpoints";

gsap.registerPlugin(ScrollTrigger);

/**
 * Das Gegenstück der gepinnten Layouts: wo STACK_QUERY greift, zeigen
 * „Projekte" und „Prozess" ihren gestapelten Aufbau (siehe die @media-Blöcke in
 * globals.css und process.css), und genau dort — und nur dort — läuft dieses
 * Aufdecken. Sonst übernehmen useHorizontalPin/useProcessPin.
 *
 * Beide Queries stehen in lib/breakpoints.ts, damit sie nicht driften können.
 */

/** Startseite der Bildblende. Gerade Schritte wischen von links herein,
 *  ungerade von rechts — dieselbe Links-rechts-Ordnung, die auf dem Desktop
 *  der Shuttle zwischen den Spalten fährt.
 *
 *  Alle vier Kanten tragen ausgeschriebene `%`, auch die Nullen. Das ist keine
 *  Kosmetik, sondern die Bedingung dafür, dass die Blende überhaupt läuft.
 *  GSAP interpoliert `clip-path` als Zeichenkette und übernimmt die Einheit aus
 *  dem ZIEL-Wert; stehen dort blanke Nullen, entsteht ein einheitenloser
 *  Zwischenwert, den der Browser als ungültiges CSS verwirft. Am pausierten
 *  Tween gemessen, Playhead von Hand gesetzt:
 *
 *    `inset(0 0 0 100%)` → `inset(0 0 0 0)`
 *      p=0 / .25 / .5 / .75  alle `inset(0px 0px 0px 100%)`, p=1 `inset(0px)`
 *    `inset(0% 0% 0% 100%)` → `inset(0% 0% 0% 0%)`
 *      p=.25 `75%`, p=.5 `50%`, p=.75 `25%`
 *
 *  Mit der alten Schreibweise gab es also nie eine Blende, sondern nur einen
 *  Sprung am Ende — auf dem Scrub wäre daraus ein Sprung mitten im Scrollen
 *  geworden. */
const CLIP_FROM = ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 100%)"];
const CLIP_OPEN = "inset(0% 0% 0% 0%)";

/**
 * Halber Weg des Parallax auf [data-reveal="media"], in Pixeln: das Bild fährt
 * von -10 nach +10.
 *
 * ZWILLING IM CSS: `padding-block: 0.75rem` auf `.process-panel__media`
 * (sections/process/process.css) und `.work-panel__media` (app/globals.css).
 * Beide Felder kleben und ihr Kind füllt sie exakt aus — ohne diese Fahrbahn
 * tritt das verschobene Kind unten heraus und malt einen Streifen unter die
 * Copy. Genau das war auf dem Gerät zu sehen: gemessen 7.7-8.8px im Prozess und
 * 10.8-12.8px bei den Projekten, in einem Kontrollversuch mit `transform: none`
 * auf 0.00px zurückgeführt.
 *
 * 12px CSS gegen 10px hier lässt 2px Reserve für Teilpixel. Wer den Weg
 * vergrössert, muss die Polsterung mitziehen — sonst kehrt der Streifen zurück.
 */
const MEDIA_DRIFT_PX = 10;

/** Ab welchem Blenden-Fortschritt die Maske ganz verschwindet. Siehe die
 *  Begründung am `onUpdate` des Blenden-Scrubs — ein Scrub hat kein
 *  `onComplete`, an dem man das sonst aufhängen könnte. */
const WIPE_DONE = 0.999;

interface StackRevealOptions {
  /** Selektor der einzelnen Etagen im Stapel, z. B. ".process-panel". */
  panel: string;
  /**
   * Wie das Bild hereinkommt.
   *  - "wipe": Blende über die Bildkante, dazu ein leichter Push-in. Nur für
   *    Medien, die in einem eigenen, randlosen Rahmen sitzen.
   *  - "rise": steigt auf und blendet ein. Für die Gerätemockups — eine Blende
   *    würde dort die außen liegenden Pfeile dauerhaft abschneiden, weil
   *    clip-path auch auf absolut positionierte Kinder außerhalb der Box wirkt.
   */
  media?: "wipe" | "rise";
}

/**
 * Deckt gestapelte Etagen beim Hereinscrollen auf: Copy steigt gestaffelt hoch,
 * die Haarlinie zieht sich auf, das Bild kommt als Blende oder Aufsteiger nach.
 * Zusätzlich läuft ein leiser Parallax über die gesamte Durchfahrt.
 *
 * Zwei Sorten Bewegung, bewusst getrennt: Copy und Haarlinie spielen einmalig
 * ab (`once: true`) — das ist Satz, der sich setzt, und der soll nicht
 * rückwärts wieder auseinanderfallen. Das Bild dagegen wird gefahren: die
 * `wipe`-Blende hängt an einem eigenen Scrub, ebenso der Parallax.
 *
 * Die Startzustände setzt bewusst GSAP und nicht CSS: bleibt das Skript aus,
 * steht der Inhalt sichtbar da statt auf opacity: 0 hängenzubleiben.
 */
export function useStackReveal(
  rootRef: RefObject<HTMLElement | null>,
  { panel: panelSelector, media = "rise" }: StackRevealOptions,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(STACK_QUERY, () => {
      const panels = gsap.utils.toArray<HTMLElement>(panelSelector, root);

      panels.forEach((panel, index) => {
        const copy = gsap.utils.toArray<HTMLElement>(
          "[data-reveal='copy']",
          panel,
        );
        const rules = gsap.utils.toArray<HTMLElement>(
          "[data-reveal='rule']",
          panel,
        );
        const art = panel.querySelector<HTMLElement>("[data-reveal='media']");
        const artInner = panel.querySelector<HTMLElement>(
          "[data-reveal='media-inner']",
        );

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: panel,
            // 78 % statt der üblichen 85 %: die Etagen sind hoch, und tiefer
            // angesetzt läuft die Bewegung sonst durch, bevor sie im Bild ist.
            start: "top 78%",
            once: true,
          },
        });

        if (rules.length) {
          tl.fromTo(
            rules,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.8, ease: "power2.out" },
            0,
          );
        }

        if (copy.length) {
          tl.fromTo(
            copy,
            { y: 26, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07 },
            0.04,
          );
        }

        if (art && media === "wipe") {
          // Die Blende hängt am Scrollbalken, nicht an der Uhr. Vorher lief sie
          // in der `once`-Timeline oben mit fester Dauer mit: bei eingefrorenem
          // scrollY zog sie gemessen über rund 1000 ms von voll geschlossen bis
          // `none` durch, ohne einen einzigen weiteren Scroll-Input. Das ist die
          // Umkehrung dessen, was die Seite sonst tut — auf dem Desktop fährt
          // der Nutzer den Prozess-Shuttle mit `scrub: 0.65` selbst. Hier fährt
          // er jetzt die Blende.
          //
          // Getriggert wird auf dem Panel, nicht auf dem Bildrahmen: der klebt
          // im gestapelten Aufbau (`position: sticky` auf `.process-panel__media`
          // in process.css). Für ein klebendes Element misst ScrollTrigger
          // start/end an einer Position, die sich unter ihm wegschiebt.
          //
          // Das Fenster 82 % → 45 % der Fensterhöhe sind auf dem iPhone (852px)
          // 315px Scrollweg, auf dem iPad (1180px) 437px. Es endet bewusst,
          // bevor der Rahmen seine Klebeposition erreicht: gemessen steht die
          // Maske bei scrollY 4405 auf `none`, der Rahmen rastet erst bei 4765
          // auf `top: 102.2px` ein — 360px später. Erst zieht die Blende auf,
          // dann hält das Bild. Zwei Momente nacheinander, nicht zwei
          // gleichzeitig.
          //
          // `scrub: 0.55` liegt wie alle Scrubs des Projekts zwischen 0.4 und
          // 0.8. Die Dämpfung ist hier nicht Sparsamkeit, sondern das Gefühl:
          // die Blende zieht der Hand nach, statt am Rad zu kleben.
          const wipeTl = gsap.timeline({
            defaults: { ease: "none", duration: 1 },
            scrollTrigger: {
              trigger: panel,
              start: "top 82%",
              end: "top 45%",
              scrub: 0.55,
            },
            // Ersatz für das `onComplete` der alten Timeline. Ein Scrub wird nie
            // „fertig", er steht nur an einer Position — deshalb hängt das
            // Abräumen der Maske am Fortschritt und nicht an einem Abschluss.
            // Nötig ist es weiterhin: eine stehende Maske schneidet jedes
            // spätere Overlay im Bild ab. Und es muss hier stehen und nicht in
            // einem `onLeave` des ScrollTriggers — dessen Callbacks feuern an
            // der echten Scrollposition, während der gedämpfte Playhead noch
            // schreibt, und der nächste Frame überschriebe das `none` wieder.
            //
            // Schwelle 0.999 statt exakt 1, weil der Scroll einen Hauch vor dem
            // Ende stehenbleiben kann und die Maske dann dauerhaft als Haarlinie
            // stünde. Der Rahmen misst gemessen 345px — ein Promille davon sind
            // 0.35px, der Sprung ist nicht zu sehen. Unterhalb der Schwelle
            // schreibt der Tween den Zwischenwert im selben Frame ohnehin wieder
            // selbst, das `none` kann also nicht kleben bleiben.
            onUpdate: () => {
              if (wipeTl.progress() >= WIPE_DONE) {
                gsap.set(art, { clipPath: "none" });
              }
            },
          });

          // Die Maske sitzt auf der Bildkante, der Push-in auf dem Rahmen
          // darunter — der wächst also in eine Maske hinein und landet exakt auf
          // dem gestalteten Ausschnitt. Beide laufen deshalb auf demselben
          // Fenster: bliebe der Push-in zeitgesteuert, während die Maske am
          // Scroll hängt, wäre genau diese Kopplung wieder aufgelöst.
          wipeTl.fromTo(
            art,
            { clipPath: CLIP_FROM[index % 2] },
            { clipPath: CLIP_OPEN },
            0,
          );

          if (artInner) {
            wipeTl.fromTo(artInner, { scale: 1.08 }, { scale: 1 }, 0);
          }
        }

        if (art && media === "rise") {
          tl.fromTo(
            art,
            { y: 44, autoAlpha: 0, scale: 0.96 },
            {
              y: 0,
              autoAlpha: 1,
              scale: 1,
              duration: 0.95,
              ease: "power3.out",
            },
            0.1,
          );
        }

        // Leises Mitlaufen über die gesamte Durchfahrt. Bewusst auf derselben
        // Ebene wie die Blende und nicht auf dem Rahmen darunter: clip-path
        // wandert mit der Transformation seines eigenen Elements mit, auf dem
        // Kind dagegen liefe der Inhalt unter einer stehenden Maske weg und
        // legte am Rand einen Streifen Hintergrund frei.
        //
        // `scrub: 0.6` statt `scrub: true`: ungedämpft lief hier als einziger
        // Scrub der Seite ein Trigger PRO PANEL bei jedem Frame mit — bei vier
        // Prozessschritten plus sechs Projekten zehn gleichzeitig. Alle anderen
        // Scrubs im Projekt liegen zwischen 0.4 und 0.8, und die Dämpfung ist
        // hier nicht nur billiger, sie ist der Punkt: der Nutzer FÄHRT die
        // Bewegung, sie klebt nicht am Rad. Genau das trägt den Desktop.
        //
        // Feste Pixel statt yPercent, seit der Streifen aufgefallen ist: mit
        // ±2.5% hing der Weg an der Rahmenhöhe und lief zwischen 5.2px (iPad im
        // Projektpanel) und 12.8px (iPhone auf 430px Breite) auseinander. Kein
        // CSS-Wert kann eine Fahrbahn decken, die er nicht kennt — mit einem
        // festen Weg schon. Sichtbar ist der Unterschied nicht: gemessen lag
        // der alte Weg genau in dieser Grössenordnung.
        if (art) {
          gsap.fromTo(
            art,
            { y: -MEDIA_DRIFT_PX },
            {
              y: MEDIA_DRIFT_PX,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        }

        // Das Bild atmet über die Einfahrt zurück: 1.06 beim Hereinkommen,
        // 1.0 wenn die Etage steht.
        //
        // Das Gegenstück zum Desktop-Pin — Bild steht, Inhalt läuft dagegen —
        // liegt bei beiden Nutzern dieses Hooks im CSS und nicht hier:
        // `position: sticky` auf `.process-panel__media` (process.css) und
        // `.work-panel__media` (globals.css). Die Projekte kamen zuletzt dazu;
        // sie halten gemessen 540–660px Scrollweg, je nach Gerät.
        // „Leistungen" war der dritte Nutzer und ist raus: die Sektion zeigt
        // im Stapel keine ziehende Copy mehr, sondern eine eigene gepinnte
        // Bühne mit vier Bildstufen (Services.tsx, services.css).
        //
        // Auf `artInner` statt auf `art`, weil dort im wipe-Fall schon der
        // Push-in sitzt und beide sonst gegeneinander schreiben würden — im
        // rise-Fall ist artInner frei.
        if (artInner && media === "rise") {
          gsap.fromTo(
            artInner,
            { scale: 1.06 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top bottom",
                end: "center center",
                scrub: 0.6,
              },
            },
          );
        }
      });
    });

    return () => mm.revert();
  }, [rootRef, panelSelector, media]);
}
