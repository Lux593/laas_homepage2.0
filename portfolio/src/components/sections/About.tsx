"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import { useLightSection } from "@/hooks/useLightSection";
import {
  ABOUT_INTRO,
  ABOUT_PORTRAIT,
  ABOUT_ROLES,
  ABOUT_TOOLS,
} from "@/lib/constants";
import "./about/about.css";

gsap.registerPlugin(ScrollTrigger);

/** Bewusst NICHT die ease-in-out-quart des Sidebar-Overlays, obwohl die Blende
 *  sonst dieselbe Sprache spricht. Der Grund ist die Ansteuerung: das Overlay
 *  läuft zeitbasiert auf Klick, wo der steile Mittelteil kraftvoll wirkt. Diese
 *  Blende hängt am Scrollrad — dort koppelt derselbe Mittelteil einen riesigen
 *  Flächenzuwachs an minimalen Scrollweg. Gemessen: quart schiebt 60 % der
 *  gedeckten Fläche in 20 % der Strecke (Spitze = 3,0× Durchschnitt), power2
 *  36 % (1,8×). Die Blende behält damit Anlauf und Ausklang, verliert aber den
 *  Ruck in der Mitte. */
const WIPE_EASE = gsap.parseEase("power2.inOut");

/** Anteil der Scrollstrecke, über den die Blende aufgeht. Großzügiger als die
 *  früheren 0.2: ease-in-out-quart hat einen steilen Mittelteil, und je weniger
 *  Scrollweg darunter liegt, desto mehr Fläche reißt pro gescrolltem Pixel auf.
 *  Die Strecke ist der zweite Hebel neben der Kurve — sie kostet Lesezeit auf
 *  dem fertigen Bildschirm, davon hat der Track hinten aber genug. */
const WIPE_DURATION = 0.34;

/** Aufteilung der Blendendauer: erst zieht der Balken seitlich hinaus, dann
 *  öffnet das Band nach oben und unten. Zwei getrennte Züge, kein Überlappen —
 *  der seitliche Zug ist die Pointe („der Balken zieht sich raus"), und er ist
 *  nur lesbar, solange die Höhe noch steht.
 *
 *  Hochkant kürzer, weil sich die Verhältnisse drehen: quer legt jede Seitenkante
 *  rund 880 px zurück und jede Waagerechte rund 530 px, hochkant sind es 180 px
 *  gegen 400 px. Mit demselben Anteil bekäme der seitliche Zug dort zu viel
 *  Scrollweg für zu wenig Bewegung. Gleiches Muster wie ZOOM_END. */
const WIPE_SPLIT = { desktop: 0.38, mobile: 0.3 };

/** Wie weit die Blende am Ende über die Bühnenkante hinausschießt, in Pixeln.
 *  Genau 0 wäre rechnerisch bündig, ließe aber bei gebrochenen Gerätepixeln
 *  einen hellen Haarstrich an der Kante stehen. */
const WIPE_OVERSHOOT = 2;

/** Der Knoten im LAAS-Zeichen, in Prozent von /laas-logo-full.svg (viewBox
 *  1798,74 × 777,06) — am gerenderten Zeichen nachgemessen, nicht aus den
 *  Werten des früheren /laas-icon.svg hochgerechnet.
 *
 *  Die A-Schenkel kreuzen sich nicht wirklich: sie laufen aufeinander zu
 *  (Lücke 299 auf y = 200, noch 77 auf y = 450) und enden vorher — die
 *  Wortmarke schließt auf y = 485,87, ihr rechnerischer Schnittpunkt läge
 *  erst auf y = 537. Was man als Kreuz liest, ist der Querbalken
 *  (y = 301…359,35). Der Zielpunkt ist deshalb dessen Mitte auf der
 *  Symmetrieachse der beiden Schenkel — x = 885,4 fällt exakt mit dem
 *  verlängerten Schnittpunkt zusammen (Balken auf y = 330: 571,6…1199,2;
 *  innere Schenkelkanten auf y = 200: 735,5 und 1035,3).
 *
 *  `size` ist die Balkendicke und gibt der Messmarke im Elementinspektor die
 *  Ausdehnung des Knotens. Gerechnet wird nur mit ihrem Mittelpunkt. */
const LOGO_CROSS = { x: 49.22, y: 42.5, size: 3.24 };

/** Der Querbalken selbst — das Startrechteck der Blende, in Prozent derselben
 *  viewBox wie LOGO_CROSS. Ober- und Unterkante liegen exakt waagerecht
 *  (y = 301 und y = 359,35), die beiden Enden dagegen SCHRÄG: sie folgen den
 *  A-Schenkeln, der Balken läuft unten von 559,01 bis 1214,16, oben nur von
 *  584,9 bis 1188,27.
 *
 *  Genommen wird die obere, schmalere Ausdehnung. Damit liegt das Rechteck auf
 *  jeder Höhe vollständig innerhalb der Tinte und verschwindet im ersten Moment
 *  restlos im Balken. Mit der unteren, breiteren stünden stattdessen zwei
 *  schwarze Nasen über die Schrägen hinaus — sichtbar, bevor sich überhaupt
 *  etwas bewegt. Der Unterschied ist nach ein paar gescrollten Pixeln ohnehin
 *  überholt: da ist die Blende breiter als das Zeichen. */
const LOGO_BAR = { left: 32.52, right: 66.06, top: 38.74, bottom: 46.24 };

/** Seitenverhältnis von /laas-logo-full.svg. applyZoom schreibt der HUD-Kopie
 *  nur die Breite, die Höhe folgt aus dem Bild — für die Balkenkanten braucht
 *  es sie aber als Zahl, ohne dafür pro Frame das Layout zu lesen. */
const LOGO_RATIO = 777.06 / 1798.74;

/** Breite des Zeichens auf der Bildschirmfläche. Nicht dieselbe Zahl wie beim
 *  getraceten /laas-icon.svg (24,6 %): das trug noch rund 4,4 % Rand je Seite,
 *  die Vektordatei ist randlos beschnitten (Tinte füllt 100 % statt 91,2 % der
 *  Bildbreite). Bei gleicher Kastenbreite stünde das Zeichen schlagartig
 *  größer im Monitor — 22,4 % hält die sichtbare Breite bei denselben ~22,4 %
 *  der Bildschirmfläche wie vorher. */
const LOGO_WIDTH = 22.4;

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
  /** Nur die Skizze, nicht ihr Container: die Schärfeverlagerung darf das
   *  LAAS-Zeichen nicht mitnehmen — es ist das Ziel der Kamera und muss beim
   *  Eintauchen scharf stehen. */
  const sketchRef = useRef<HTMLImageElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  /** Das Zeichen im Monitor. Trägt in der Kamerafahrt nur noch die Geometrie —
   *  sichtbar ist die Kopie in `hudRef`, siehe applyZoom. */
  const logoRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLSpanElement>(null);
  /** Zeichen und Blende als eine Gruppe — sie teilen sich die Deckkraft der
   *  Anfahrt, siehe .about-veil in about.css. */
  const veilRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Cream only while the desk sketch is visible. Der Umschlag darf nicht schon
  // beim Öffnen der Blende fallen — da ist sie dann erst so breit wie der
  // Querbalken und der Bildschirm ringsum noch hell. Erst wenn die Oberkante des
  // Bandes die Navhöhe passiert hat, stimmt dunkles Chrome.
  //
  // Das liegt später als bei der früheren Kreisblende: ein Kreis deckt die
  // Bildmitte und den oberen Rand fast gleichzeitig, das Band erreicht oben erst
  // gegen Ende seines vertikalen Zuges. Deshalb hängt der Wert am Split statt an
  // einer festen Zahl — dreht man oben an der Aufteilung, wandert der Umschlag
  // mit. 0.78 ist der Punkt, an dem die Oberkante des Bandes bei power2.inOut
  // die Navhöhe passiert (nachgemessen, nicht geschätzt).
  //
  // Gerechnet wird auf der SCROLLSTRECKE des Triggers, nicht auf der Trackhöhe:
  // die Blende hängt an `trigger: track, start "top top", end "bottom bottom"`,
  // und deren Fortschritt läuft über track.offsetHeight MINUS Viewporthöhe. Mit
  // der reinen Trackhöhe war der Faktor hier ein anderes Maß als der Fortschritt
  // dort — bei 340vh Track und 100vh Bühne um Faktor 1,42 daneben, der Umschlag
  // fiel deshalb erst am Ende der klebenden Phase statt beim Deckenwerden.
  useLightSection(sectionRef, {
    end: () => {
      const track = trackRef.current;
      if (!track) return "bottom top+=40";
      const mobile =
        window.matchMedia("(max-width: 767px)").matches &&
        window.matchMedia("(min-height: 660px)").matches;
      const zoomEnd = mobile ? ZOOM_END.mobile : ZOOM_END.desktop;
      const split = mobile ? WIPE_SPLIT.mobile : WIPE_SPLIT.desktop;
      const flip = zoomEnd + WIPE_DURATION * (split + (1 - split) * 0.78);
      const distance = Math.max(0, track.offsetHeight - window.innerHeight);
      // +40 hebt den Versatz des Startpunkts wieder auf, sonst läge der
      // Umschlag um die Navhöhe zu früh.
      return `top+=${distance * flip + 40} top+=40`;
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
        const split = isMobile ? WIPE_SPLIT.mobile : WIPE_SPLIT.desktop;

        const track = trackRef.current;
        const stage = stageRef.current;
        const header = headerRef.current;
        const scene = sceneRef.current;
        const sketch = sketchRef.current;
        const target = targetRef.current;
        const logo = logoRef.current;
        const hud = hudRef.current;
        const cross = crossRef.current;
        const veil = veilRef.current;
        const content = contentRef.current;
        if (!track || !stage || !header || !scene || !sketch) return;
        if (!target || !logo || !hud || !cross || !veil || !content) return;

        const groups = gsap.utils.toArray<HTMLElement>(".about-in", content);
        gsap.set(groups, { opacity: 0, y: 32 });

        // Ab hier zeigt die Kopie das Zeichen, das Original im Monitor liefert
        // nur noch Maße. Der Tausch passiert erst in diesem Kontext: ohne
        // Kamerafahrt (reduzierte Bewegung, kurze Fenster) läuft applyZoom nie,
        // und dann muss das Original sichtbar bleiben.
        logo.style.visibility = "hidden";
        hud.style.visibility = "visible";

        // Startdeckkraft der Gruppe aus Zeichen und Blende. Steht hier und nicht
        // im Markup, aus demselben Grund wie der Tausch darüber: ohne
        // Kamerafahrt gibt es keine Anfahrt, die sie wieder hochzieht, und das
        // Panel läge blass da. Vor `zoomEnd - 0.3` hat die Timeline den Wert
        // noch nicht angefasst — bis dahin gilt genau dieser.
        veil.style.opacity = "0.32";

        // Wird bei jedem Refresh neu hergeleitet: die Skizze ist in vw/svh
        // dimensioniert, also wandern Zielgröße UND Außermittigkeit mit dem
        // Viewport. Hardcodierte Werte wären auf genau einer Fenstergröße richtig.
        let endScale = 1;
        let offsetX = 0;
        let offsetY = 0;

        // Bühnenmaß und die Lage des Zeichens darin, beides bei Maßstab 1.
        // Daraus rechnet applyZoom die mitlaufende Kopie (siehe dort).
        let stageW = 0;
        let stageH = 0;
        let logoX = 0;
        let logoY = 0;
        let logoW = 0;

        // Lage und Breite der HUD-Kopie im aktuellen Frame, wie applyZoom sie
        // gerade geschrieben hat. applyWipe braucht daraus die Balkenkanten und
        // liest sie hier ab, statt die Kopie zu vermessen: ein
        // getBoundingClientRect im Scroll-Handler wäre ein Layout-Read direkt
        // hinter dem Schreiben derselben Stile. applyZoom läuft in onUpdate wie
        // in onRefresh vor applyWipe, die Werte sind also nie eine Frame alt.
        let hudX = 0;
        let hudY = 0;
        let hudW = 0;

        const measure = () => {
          gsap.set(scene, { x: 0, y: 0, scale: 1 });
          const s = target.getBoundingClientRect();
          const v = stage.getBoundingClientRect();
          const c = cross.getBoundingClientRect();
          const l = logo.getBoundingClientRect();

          stageW = v.width;
          stageH = v.height;
          logoX = l.left - v.left;
          logoY = l.top - v.top;
          logoW = l.width;

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

          // Die Kamera zielt auf das A-Kreuz, nicht auf die Mitte der
          // Bildschirmfläche: aus diesem Punkt öffnet die Blende, und ein paar
          // Pixel Versatz sind nach dem ~3,5-fachen Zoom sichtbar. Das Kreuz
          // liegt fast mittig im Zeichen, der Monitor deckt die Bühne also
          // weiterhin — die 1.04 oben tragen den Rest.
          offsetX = c.left + c.width / 2 - (v.left + v.width / 2);
          offsetY = c.top + c.height / 2 - (v.top + v.height / 2);
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
          const x = offsetX * (1 - t - scale);
          const y = offsetY * (1 - t - scale);
          gsap.set(scene, { x, y, scale, force3D: true });

          // Das Zeichen läuft NICHT in der Szene mit, sondern als Kopie darüber
          // (siehe .about-logo-hud): Breite und Lage stehen hier in Pixeln,
          // also ist seine Layoutgröße immer seine Bildschirmgröße und Chrome
          // rastert es bei jedem Maßstab frisch aus dem Vektor.
          //
          // In der Szene ging das nicht: die trägt `will-change: transform`
          // (about.css) und wird deshalb EINMAL gerastert und danach als Textur
          // aufgezogen — beim ~3,5-fachen Zoom kam das Zeichen als
          // Bitmap-Upscale an (gemessen 3,6 px breite Kanten statt 1,4 px). Den
          // Hinweis situativ fallen zu lassen half nicht: entweder flippte er
          // mitten in der Fahrt und ruckelte, oder man sah das Nachrastern als
          // Schärfesprung. Der Schreibtisch darunter bleibt gepinnt — er ist an
          // dieser Stelle ohnehin weichgezeichnet, seine Auflösung sieht
          // niemand. Eine eigene Compositing-Ebene nur fürs Zeichen wäre
          // übrigens keine Lösung gewesen: der Teilbaum erbt die
          // festgehaltene Rasterskala (gemessen 2,75 px).
          //
          // Die Formel ist dieselbe wie oben, nur für einen Punkt statt für die
          // Ebene: um die Bühnenmitte skalieren, dann den Kameraversatz drauf.
          hudW = logoW * scale;
          hudX = stageW / 2 + (logoX - stageW / 2) * scale + x;
          hudY = stageH / 2 + (logoY - stageH / 2) * scale + y;
          hud.style.width = `${hudW}px`;
          hud.style.transform = `translate3d(${hudX}px, ${hudY}px, 0)`;
        };

        // Die Blende: ein Rechteck, das exakt im Querbalken zwischen den beiden
        // A steht und in zwei Zügen aufmacht — erst seitlich über die Kante
        // hinaus, dann nach oben und unten auf. Der Balken zieht sich also
        // heraus, statt dass eine fremde Form über das Zeichen läuft.
        //
        // Sie hängt am Scroll-Fortschritt statt an der Timeline, aus demselben
        // Grund wie der Zoom darüber: bei jedem refresh() rendert ScrollTrigger
        // die Timeline einmal mit unterdrückten Callbacks neu, ein von dort aus
        // gesetzter Stil bliebe auf dem alten Wert stehen (siehe die
        // ausführliche Notiz in Services.tsx). onRefresh schreibt beides neu.
        //
        // Vor zoomEnd ist die Blende geschlossen und deckt sich mit dem Balken.
        // Sichtbar ist davon nichts: sie ist schwarz, der Balken ist es auch,
        // und sie liegt exakt in seiner Tinte (siehe LOGO_BAR). Die Kanten
        // laufen mit dem Zoom mit, weil sie aus der HUD-Geometrie kommen.
        const applyWipe = (progress: number) => {
          const p = gsap.utils.clamp(
            0,
            1,
            (progress - zoomEnd) / WIPE_DURATION
          );
          const tx = WIPE_EASE(gsap.utils.clamp(0, 1, p / split));
          const ty = WIPE_EASE(
            gsap.utils.clamp(0, 1, (p - split) / (1 - split))
          );

          // Der Balken in Bühnenpixeln. Die Höhe der Kopie steht nirgends —
          // applyZoom schreibt ihr nur die Breite, den Rest macht das Bild —
          // also aus dem Seitenverhältnis der Datei.
          const hudH = hudW * LOGO_RATIO;
          const barL = hudX + hudW * (LOGO_BAR.left / 100);
          const barR = hudX + hudW * (LOGO_BAR.right / 100);
          const barT = hudY + hudH * (LOGO_BAR.top / 100);
          const barB = hudY + hudH * (LOGO_BAR.bottom / 100);

          // Keine Wurzel wie bei der früheren Kreisblende: dort wuchs die
          // gedeckte Fläche mit dem Quadrat des Radius, die Kurve musste erst
          // über die Fläche zurückgerechnet werden. Hier fällt das weg, weil im
          // vertikalen Zug die volle Breite bereits offen ist — die Fläche ist
          // dann exakt proportional zur Bandhöhe, die Kurve liegt also direkt
          // auf der Geometrie und trotzdem auf der Fläche. Der seitliche Zug
          // trägt rund ein Prozent der Gesamtfläche und ist ohnehin unkritisch.
          const set = (name: string, value: number) =>
            content.style.setProperty(name, `${value}px`);
          set("--wipe-left", gsap.utils.interpolate(barL, -WIPE_OVERSHOOT, tx));
          set(
            "--wipe-right",
            gsap.utils.interpolate(stageW - barR, -WIPE_OVERSHOOT, tx)
          );
          set("--wipe-top", gsap.utils.interpolate(barT, -WIPE_OVERSHOOT, ty));
          set(
            "--wipe-bottom",
            gsap.utils.interpolate(stageH - barB, -WIPE_OVERSHOOT, ty)
          );
        };

        // Der Fortschritt des zuletzt gezeichneten Frames. Der Beobachter unter
        // der Timeline braucht ihn, um nach einem Layoutwechsel dieselbe
        // Kameraposition neu rechnen zu können, ohne den Trigger zu befragen —
        // dessen Start und Ende sind in genau diesem Moment noch die alten.
        let progress = 0;

        const spine = { p: 0 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            // applyZoom zuerst: applyWipe liest die HUD-Geometrie ab, die dort
            // geschrieben wird.
            onRefresh: (self) => {
              progress = self.progress;
              measure();
              applyZoom(progress);
              applyWipe(progress);
            },
            onUpdate: (self) => {
              progress = self.progress;
              applyZoom(progress);
              applyWipe(progress);
            },
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
          // Zielt auf die Skizze, nicht auf .about-art — das LAAS-Zeichen liegt
          // im selben Container und muss scharf bleiben, es ist das Ziel.
          .fromTo(
            sketch,
            { filter: "blur(0px)" },
            {
              filter: `blur(${isMobile ? 4 : 3}px)`,
              ease: "power2.in",
              duration: 0.18,
            },
            zoomEnd - 0.2
          )
          // Gegenbewegung zur weich werdenden Skizze: das Zeichen zieht an,
          // während alles andere zurücktritt. Am Ende steht der Querbalken als
          // dunkelster, schärfster Strich im Bild — und genau er zieht sich
          // gleich heraus. Es ist der Übergang, nicht bloß der Ort davor.
          //
          // Sitzt auf der Gruppe, nicht auf dem Zeichen allein: die geschlossene
          // Blende liegt in der Tinte des Balkens und muss dieselbe Deckkraft
          // tragen, sonst steht sie als harter Strich im blassen Zeichen
          // (Rechnung in about.css bei .about-veil). Zielwert voll deckend, nicht
          // knapp darunter — die Blende ist reines Schwarz, und bei 0,94 bliebe
          // die Bühne am Ende ein Grauton neben dem schwarzen Panel darunter.
          .fromTo(
            veil,
            { opacity: 0.32 },
            { opacity: 1, ease: "power2.in", duration: 0.26 },
            zoomEnd - 0.3
          )
          // Die Blende selbst läuft neben der Timeline (applyWipe): erst wenn
          // der Zoom den Querbalken in die Mitte gelegt hat, zieht er sich
          // heraus. Sie ist durchweg schwarz — der frühere Lauf von Hellgrau
          // nach Schwarz passierte auf bereits großer Fläche und war als
          // Farbwechsel lesbar.
          //
          // Läuft wie im Sidebar-Overlay leicht versetzt in der offenen Blende mit,
          // statt danach als zweite, eigene Bewegung. Der Versatz sitzt im
          // VERTIKALEN Zug, nicht in der Blendendauer insgesamt: solange der
          // Balken nur seitlich hinausfährt, ist das Band ein paar Pixel hoch,
          // und die Copy ist sein Kind — der clip-path schnitte die Staffelung
          // schlicht weg, man sähe sie nie. Der Bezug auf split statt auf eine
          // feste Zahl hält das Verhältnis, wenn oben an der Aufteilung gedreht
          // wird.
          .to(
            groups,
            { opacity: 1, y: 0, ease: "power3.out", duration: 0.14, stagger: 0.05 },
            zoomEnd + WIPE_DURATION * (split + (1 - split) * 0.3)
          );

        // Browser-Zoom (Strg/Cmd +) ist ein Layoutwechsel ohne Scrollbewegung:
        // die Bühne misst in svh/vw und fließt sofort neu, das Zeichen steht
        // aber als Kopie in absoluten Pixeln (siehe applyZoom) und wird nur aus
        // onUpdate und onRefresh geschrieben. ScrollTrigger hängt seinen Refresh
        // hinter ein Debounce von 0,2 s (`gsap.delayedCall(0.2, _refreshAll)` in
        // ScrollTrigger.js), das jedes weitere resize-Event neu startet. So lange
        // klebt das Zeichen auf den Pixeln von vor dem Zoom, während der Monitor
        // darunter längst woanders steht — bei einem Schritt von 100 % auf 110 %
        // gemessene 72 px seitlich, 31 px hoch und 10 px Breite auf einem 108 px
        // breiten Zeichen. Genau das ist das Ruckeln: das Zeichen löst sich vom
        // Bildschirm und schnappt beim Refresh zurück.
        //
        // Der Beobachter nimmt dem Debounce nur diesen einen Nachzügler ab. Er
        // läuft im selben Frame wie der Reflow, noch vor dem Paint, und schreibt
        // exakt das, was onRefresh gleich darauf noch einmal schreibt. Ohne
        // Layoutwechsel feuert er nie — am ruhenden Bild ändert sich nichts.
        //
        // Beobachtet wird die Bühne, weil alle Messwerte an ihr hängen: die
        // Skizze ist `max(100%, 100svh · ratio)` breit, und Monitorfläche,
        // Zeichen und Kreuz sind Prozentwerte darin. Rückkopplungsfrei, weil
        // Szene, Schleier und Streifen absolut in der Bühne liegen — was
        // applyZoom und applyWipe schreiben, kann ihre Box nicht verändern.
        const ro = new ResizeObserver(() => {
          measure();
          applyZoom(progress);
          applyWipe(progress);
        });
        ro.observe(stage);

        // Der Tausch oben ist ein Inline-Stil und überlebt das Aufräumen von
        // GSAP — beim Wechsel der Query (Drehen, Fenstergröße, reduzierte
        // Bewegung) bliebe das Zeichen im Monitor sonst unsichtbar, während die
        // Kopie ohne applyZoom auf ihrer letzten Breite stehen bleibt.
        // Dasselbe gilt für die vier Blendenwerte: sie stehen als rohe Custom
        // Properties am Element und überleben mm.revert() ebenfalls. Im Fallback
        // sind sie wirkungslos, weil der clip-path selbst in der Motion-Query
        // steht — aber sie hier stehen zu lassen hieße, sich auf genau das zu
        // verlassen.
        return () => {
          ro.disconnect();
          logo.style.visibility = "";
          hud.style.visibility = "";
          hud.style.width = "";
          hud.style.transform = "";
          veil.style.opacity = "";
          for (const side of ["top", "right", "bottom", "left"]) {
            content.style.removeProperty(`--wipe-${side}`);
          }
        };
      }
    );

    // ── Kurzes Fenster: hochkant unter 660px Höhe ────────────────────────────
    //
    // Dort läuft die Kamerafahrt bewusst NICHT: sie braucht eine 100svh-Bühne
    // plus Scrollweg, und darunter fielen Szene und Copy übereinander. Diese
    // Entscheidung bleibt. Was fehlte, war ein Ersatz — die Section stand als
    // einzige der Seite vollständig still.
    //
    // Also die Idee der Fahrt ohne ihre Mechanik: die Szene atmet über die
    // Durchfahrt leicht auf, statt in den Monitor zu fahren, und die
    // Copy-Gruppen steigen gestaffelt ein. Im Scope trifft das nur 320×568.
    mm.add(
      "(max-width: 767.98px) and (max-height: 659.98px) and (prefers-reduced-motion: no-preference)",
      () => {
        const scene = sceneRef.current;
        const content = contentRef.current;
        const section = sectionRef.current;
        if (!scene || !content || !section) return;

        const groups = gsap.utils.toArray<HTMLElement>(".about-in", content);

        const drift = gsap.fromTo(
          scene,
          { scale: 1 },
          {
            scale: 1.06,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              // Gedämpft wie jeder andere Scrub im Projekt — der Nutzer fährt
              // die Bewegung, sie klebt nicht am Finger.
              scrub: 0.6,
            },
          },
        );

        // Startzustand aus GSAP, nicht aus CSS: bleibt das Skript aus, steht
        // die Copy sichtbar da statt auf opacity: 0 hängenzubleiben. Dasselbe
        // Muster wie in useStackReveal.
        const rise = gsap.fromTo(
          groups,
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: content, start: "top 85%", once: true },
          },
        );

        return () => {
          drift.scrollTrigger?.kill();
          drift.kill();
          rise.scrollTrigger?.kill();
          rise.kill();
          gsap.set(scene, { clearProps: "transform" });
          gsap.set(groups, { clearProps: "opacity,visibility,transform" });
        };
      },
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
              Wer dich unterstützt
            </span>
            <TextReveal
              as="h2"
              variant="words"
              start="top 95%"
              className="font-display text-[clamp(1.9rem,4vw,3.5rem)] font-bold uppercase leading-[1.05] tracking-tighter text-[#0a0a0a]"
              >
              ÜBER MICH
            </TextReveal>
          </header>

          <div ref={sceneRef} className="about-scene">
            <div className="about-art">
              {/* Bewusst kein next/image: die Datei liefert der Nutzer, ihre
                  Maße stehen nicht fest, und ein falsches width/height-Paar
                  würde das Seitenverhältnis der Bühne verfälschen.
                  Lampenlicht ist bereits im Bild — kein CSS-Licht-Overlay.
                  Die Schärfeverlagerung sitzt auf diesem Bild und nicht auf
                  .about-art: der Container trägt auch das LAAS-Zeichen, und das
                  muss beim Eintauchen scharf bleiben. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={sketchRef}
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
                {/* Die Breite gehört auf den Wrapper, nicht auf das Bild —
                    siehe LOGO_WIDTH für den Prozentwert. */}
                <div
                  ref={logoRef}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.32]"
                  style={{ width: `${LOGO_WIDTH}%` }}
                >
                  {/* Bewusst kein next/image: das Zeichen ist eine Vektordatei,
                      und next/image optimiert SVG nicht — es reichte srcset und
                      sizes durch, die hier beide sinnlos sind. Genau das ist der
                      Grund für das SVG: der Zoom vergrößert das Zeichen um das
                      Mehrfache, und als Vektor bleibt es dabei scharf, statt wie
                      das alte Raster-PNG an einer Auflösungsstufe zu hängen.
                      width/height stehen dran, damit die Box schon vor dem Laden
                      ihr Verhältnis kennt — sonst misst die Zoom-Mathematik beim
                      ersten Refresh auf einer 0-hohen Marke. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/laas-logo-full.svg"
                    alt=""
                    aria-hidden
                    width={1799}
                    height={777}
                    className="block h-auto w-full"
                  />
                  {/* Zielpunkt der Kamera: der Knoten der beiden A. Führt kein
                      Eigenleben — es wird nur gemessen, Lage und Größe stehen in
                      LOGO_CROSS. Die Blende startet nicht hier, sondern im
                      Querbalken ringsum (LOGO_BAR); dessen Mitte ist genau
                      dieser Punkt. */}
                  <span
                    ref={crossRef}
                    aria-hidden
                    className="pointer-events-none absolute block -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${LOGO_CROSS.x}%`,
                      top: `${LOGO_CROSS.y}%`,
                      width: `${LOGO_CROSS.size}%`,
                      aspectRatio: "1",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Zeichen und Blende liegen in einer Gruppe, weil sie sich die
              Deckkraft der Anfahrt teilen: die geschlossene Blende steht in der
              Tinte des Querbalkens, und getrennt gedeckt addierten sich beide
              dort zu einem dunkleren Fleck. Ausführlich in about.css bei
              .about-veil. Die Deckkraft setzt About.tsx im Bewegungskontext,
              nicht hier — im statischen Fallback läge sonst das ganze Panel
              blass da. */}
          <div ref={veilRef} className="about-veil">
            {/* Die sichtbare Ausgabe des Zeichens, bewusst außerhalb von
                .about-scene: dort läge sie in der gepinnten, hochskalierten
                Textur (Begründung in applyZoom). Hier setzt applyZoom Breite und
                Lage in Pixeln, deckungsgleich mit dem Original im Monitor.
                Startet unsichtbar — ohne Kamerafahrt übernimmt sie nichts. */}
            <div
              ref={hudRef}
              aria-hidden
              className="about-logo-hud"
              style={{ visibility: "hidden" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/laas-logo-full.svg"
                alt=""
                aria-hidden
                width={1799}
                height={777}
                className="block h-auto w-full"
              />
            </div>

            <div ref={contentRef} className="about-content text-[#f2ede4]">
              {/* Drei Blöcke über die Breite: links Porträt+Intro, mittig
                  Werdegang, rechts Tools — gleiche Höhe, Inhalt verteilt. */}
              <div className="about-panel">
                <div className="about-in about-lead">
                  <figure
                    className="about-plate"
                    aria-label={ABOUT_PORTRAIT.alt}
                  >
                    <Image
                      src={ABOUT_PORTRAIT.src}
                      alt={ABOUT_PORTRAIT.alt}
                      width={ABOUT_PORTRAIT.width}
                      height={ABOUT_PORTRAIT.height}
                      sizes="(max-width: 767px) 40vw, 14vw"
                      className="about-plate-img"
                    />
                  </figure>

                  <div className="about-identity">
                    <p className="font-mono text-[0.85rem] uppercase tracking-[0.24em] text-[#f2ede4]/50">
                      {ABOUT_INTRO.greeting}
                    </p>
                    <h3 className="about-name font-display text-[clamp(2.55rem,5.1vw,4.5rem)] font-bold uppercase leading-[0.86] tracking-[-0.04em]">
                      {ABOUT_INTRO.name.split(" ").map((part) => (
                        <span key={part} className="block">
                          {part}
                        </span>
                      ))}
                    </h3>
                    <p className="about-statement font-body text-[clamp(1.1rem,1.35vw,1.4rem)] leading-relaxed text-[#f2ede4]/70">
                      {ABOUT_INTRO.subtitle.map((line) => (
                        <span key={line} className="block whitespace-nowrap">
                          {line}
                        </span>
                      ))}
                    </p>
                    <p className="about-location mt-[clamp(0.85rem,2vh,1.25rem)] font-mono text-[0.8rem] uppercase tracking-[0.2em] text-[#f2ede4]/50">
                      {ABOUT_INTRO.location}
                    </p>
                  </div>
                </div>

                <div className="about-in about-annotations">
                  <p className="font-mono text-[0.85rem] uppercase tracking-[0.2em] text-[#f2ede4]/50">
                    Was ich gerade beruflich mache
                  </p>
                  <ul className="about-roles mt-[clamp(1.35rem,3.1vh,2.1rem)]">
                    {ABOUT_ROLES.map((role) => (
                      <li key={role.company} className="about-role">
                        <div className="about-role-body min-w-0">
                          <p className="font-display text-body-md font-semibold leading-tight text-[#f2ede4] md:text-[clamp(1.28rem,1.6vw,1.65rem)]">
                            {role.company}
                          </p>
                          <p className="mt-2 font-body text-[clamp(0.95rem,1.05vw,1.15rem)] leading-relaxed text-[#f2ede4]/60">
                            {role.position}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="about-in about-titleblock">
                  <p className="about-titleblock-label font-mono text-[0.85rem] uppercase tracking-[0.2em] text-[#f2ede4]/50">
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
                            width={32}
                            height={32}
                            className="about-tool-icon"
                          />
                          <span className="about-tool-name font-mono text-[0.58rem] uppercase tracking-[0.12em]">
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
      </div>
    </section>
  );
}
