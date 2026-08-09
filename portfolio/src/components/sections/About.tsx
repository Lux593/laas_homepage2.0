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

/** Wo die Copy einsteigt, als Anteil des VERTIKALEN Zuges der Blende.
 *
 *  Quer war das immer 0.3: die Copy staffelt sich in das noch schmale Band
 *  hinein, wie das Overlay der Sidebar. Dort steht in der Bandmitte die
 *  Textspalte „Was ich gerade beruflich mache", und ein Satz, der als Streifen
 *  auftaucht, liest sich als Bewegung.
 *
 *  Hochkant liegt in der Bandmitte etwas anderes: das Porträt. Der Streifen
 *  öffnet aus dem Querbalken auf y = 423, das Foto steht auf 313…493 — die
 *  Blende geht also mitten im Bild auf. Nachgemessen bei 0.3: bei
 *  Timeline-Fortschritt 0.65 ist das Band 178px hoch, deckt 80 % des Porträts
 *  und die Gruppe steht schon auf Deckkraft 0.40. Ein Gesicht, das in einem
 *  schmalen schwarzen Balken erscheint, liest sich nicht als Bewegung, sondern
 *  als Fehler — genau so gemeldet.
 *
 *  0.5 verschiebt den Einstieg dorthin, wo das Band rund 380px misst, also
 *  fast die halbe Bühne, und das Porträt vollständig darin liegt. Es ist dann
 *  eine Fläche, die sich öffnet, und kein Balken mit einem Bild darin. Die
 *  Staffelung selbst bleibt, sie sitzt nur später. */
const COPY_IN = { desktop: 0.3, mobile: 0.5 };

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

/** Seitenverhältnis von /laas-logo-full.svg. Die Höhe der HUD-Kopie steht
 *  nirgends als Stil — sie folgt aus dem Bild — für die Balkenkanten braucht
 *  es sie aber als Zahl, ohne dafür pro Frame das Layout zu lesen. */
const LOGO_RATIO = 777.06 / 1798.74;

/** Breite des Zeichens auf der Bildschirmfläche. Nicht dieselbe Zahl wie beim
 *  getraceten /laas-icon.svg (24,6 %): das trug noch rund 4,4 % Rand je Seite,
 *  die Vektordatei ist randlos beschnitten (Tinte füllt 100 % statt 91,2 % der
 *  Bildbreite). Bei gleicher Kastenbreite stünde das Zeichen schlagartig
 *  größer im Monitor — 22,4 % hält die sichtbare Breite bei denselben ~22,4 %
 *  der Bildschirmfläche wie vorher. */
const LOGO_WIDTH = 22.4;

/** Wie breit das Zeichen am Ende der Kamerafahrt steht, als Anteil der
 *  Bühnenbreite — NUR hochkant.
 *
 *  Quer ergibt sich die Endgröße aus dem Bild: die Kamera fährt, bis die
 *  Bildschirmfläche des Monitors die Bühne deckt, und wie groß das Zeichen
 *  darin landet, ist eine Folge davon (gemessen ~27 % der Fensterbreite).
 *  Hochkant trägt dieselbe Regel nicht: die Bildschirmfläche ist dort rund
 *  110 × 60 px groß, „cover" bräuchte den ~14-fachen Maßstab. Die Fahrt endete
 *  deshalb schon, sobald der Monitor die BREITE füllt — und das Zeichen stand
 *  am Ende auf gemessenen 23,3 % der Fensterbreite, also kleiner als auf dem
 *  Desktop, obwohl dort viermal so viel Platz daneben ist.
 *
 *  Statt eines Maßstabs steht hier deshalb das Ergebnis: das Zeichen soll am
 *  Ende so breit sein, und den nötigen Faktor rechnet measure() aus. Der Wert
 *  ist unabhängig von der Gerätebreite — Skizze, Bildschirmfläche und Zeichen
 *  sind durchgehend in Prozent der Bühne bemaßt, der Faktor kommt auf jedem
 *  Telefon auf dieselben ~8,7 heraus. */
const LOGO_END_WIDTH = 0.56;

/** Scrollweg der Kamerafahrt hochkant, in Bildschirmhöhen.
 *
 *  Quer läuft die Timeline bis ans Trackende. Hochkant NICHT: hinter ihr liegt
 *  der Kapitelwechsel, und ohne eigene Marke zöge sich die Fahrt einfach mit
 *  in die Länge. Die Zahl ist der Weg, den 280vh Track minus 100vh Bühne
 *  ergaben, bevor der Track für den Wechsel wuchs — die Fahrt selbst hat sich
 *  seither um keinen Pixel geändert. */
const CAMERA_SPAN = 1.8;

/** Kapitelwechsel hochkant: Anfang und Ende, in Bildschirmhöhen ab
 *  Trackoberkante.
 *
 *  Gemessen auf 393 × 852 steht die Blende bei 1.44 offen und Kapitel eins
 *  vollständig bei 1.40. Vorher begann der Wechsel erst bei 1.9 und lief bis
 *  2.85 — zwischen dem fertigen ersten Kapitel und dem fertigen zweiten lagen
 *  damit 1.45 Bildschirmhöhen, davon eine halbe, in der sich überhaupt nichts
 *  rührte. Jetzt setzt er kurz nach der Blende an und ist nach 0.55
 *  Bildschirmhöhen durch; die Strecke von Kapitel zu Kapitel schrumpft damit
 *  auf 0.97. Die Lesezeit auf Kapitel zwei bleibt, was sie war: hinter dem
 *  Ende stehen weiterhin 0.13 Bildschirmhöhen Klebestrecke (siehe die
 *  Trackhöhe in about.css). */
const SWAP_SPAN = { start: 1.62, end: 2.17 };

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
  // Gerechnet wird auf der SCROLLSTRECKE DER TIMELINE, nicht auf der Trackhöhe:
  // der Faktor oben ist ein Fortschritt DIESER Timeline, und nur wenn er gegen
  // dieselbe Strecke gerechnet wird, meint er auch denselben Punkt. Mit der
  // reinen Trackhöhe war er ein anderes Maß — bei 340vh Track und 100vh Bühne
  // um Faktor 1,42 daneben, der Umschlag fiel erst am Ende der klebenden Phase
  // statt beim Deckenwerden.
  //
  // Quer ist diese Strecke track.offsetHeight minus Viewporthöhe („bottom
  // bottom"). Hochkant NICHT: dort nagelt die Timeline ihr Ende auf
  // CAMERA_SPAN Bildschirmhöhen fest, der Track ist aber länger — der
  // Kapitelwechsel hängt hinten dran. Mit der Trackstrecke lag der Umschlag
  // deshalb gemessene 0.8 Bildschirmhöhen zu spät: die Blende war längst
  // schwarz, und die Leiste stand mit dunkler Tinte darauf.
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
      const distance = mobile
        ? window.innerHeight * CAMERA_SPAN
        : Math.max(0, track.offsetHeight - window.innerHeight);
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

        // Hochkant liegen die drei Blöcke als ZWEI Kapitel deckungsgleich
        // übereinander — die Zeilenzuweisung dazu steht in about.css. Quer
        // stehen sie wie bisher nebeneinander und diese beiden Listen bleiben
        // ungenutzt.
        const chapterOne = groups.filter((el) =>
          el.classList.contains("about-lead"),
        );
        const chapterTwo = groups.filter(
          (el) => !el.classList.contains("about-lead"),
        );

        // Hochkant führt Kapitel eins seine Deckkraft nicht als eigenen Wert,
        // sondern als Produkt zweier Faktoren — einer je Timeline. Die
        // Begründung steht ausführlich in about.css bei .about-lead; kurz: die
        // Kamerafahrt blendet ein, der Kapitelwechsel blendet aus, und ein
        // gemeinsamer Wert gehörte immer dem, der zuletzt schreibt.
        // Der Inline-Wert von oben muss dafür weg, sonst deckt er die
        // Rechnung im Stylesheet zu.
        if (isMobile) {
          gsap.set(chapterOne, { clearProps: "opacity" });
          gsap.set(chapterOne, { "--lead-in": 0 });
        }
        /** Gesetzt nur im Hochformat, siehe den Kapitelwechsel weiter unten. */
        let swapTeardown: (() => void) | undefined;

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
        /** Abstand des Kreuzes zur Mitte der BÜHNE — dorthin zielt die Kamera. */
        let aimX = 0;
        let aimY = 0;
        /** Abstand des Kreuzes zur Mitte der SZENE — um die wird skaliert.
         *  Zwei verschiedene Punkte, sobald --toolbar-gap > 0 ist, siehe
         *  measure(). */
        let pivotX = 0;
        let pivotY = 0;

        // Bühnenmaß und die Lage des Zeichens darin, beides bei Maßstab 1.
        // Daraus rechnet applyZoom die mitlaufende Kopie (siehe dort).
        let stageW = 0;
        let stageH = 0;
        /** Mitte der Szene, in Bühnenkoordinaten. */
        let sceneCx = 0;
        let sceneCy = 0;
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
        let hudH = 0;
        /** Layoutbreite der HUD-Kopie: steht die ganze Fahrt über fest, siehe
         *  measure und applyZoom. Nie 0 — sie steht im Nenner des Maßstabs. */
        let hudBaseW = 1;

        const measure = () => {
          gsap.set(scene, { x: 0, y: 0, scale: 1 });
          const s = target.getBoundingClientRect();
          const v = stage.getBoundingClientRect();
          const n = scene.getBoundingClientRect();
          const c = cross.getBoundingClientRect();
          const l = logo.getBoundingClientRect();

          stageW = v.width;
          stageH = v.height;

          // Die Szene ist hochkant NICHT so hoch wie die Bühne: about.css zieht
          // ihre Unterkante um --toolbar-gap herauf (die Lücke, die iOS beim
          // Einklappen der Adressleiste freigibt), damit der Establishing-Shot
          // in der kleinen Ansicht steht, während die Bühne bis in die große
          // hinein deckt. Skaliert wird um die Mitte DIESER Box, gezielt wird
          // auf die Mitte der Bühne — mit Lücke sind das zwei verschiedene
          // Punkte, und genau die wurden vorher gleichgesetzt.
          //
          // Der Fehler war deshalb auf dem Desktop und in Chromium unsichtbar
          // (dort ist svh = lvh, die Lücke also 0) und auf dem Telefon jedes
          // Mal zu sehen: die Kopie des Zeichens driftet um (Lücke/2)·(1−scale)
          // nach oben vom Monitor weg. Mit einer 90px-Lücke nachgestellt sind
          // das am Ende der Fahrt gemessene 118,8px — das Zeichen stand hoch
          // über der Bildschirmfläche, auf der es sitzen soll, und die Blende
          // öffnete dort ebenfalls, weil sie ihre Kanten aus dieser Kopie
          // ableitet.
          sceneCx = n.left + n.width / 2 - v.left;
          sceneCy = n.top + n.height / 2 - v.top;

          logoX = l.left - v.left;
          logoY = l.top - v.top;
          logoW = l.width;

          // Fehlt die Bilddatei noch oder ist sie nicht dekodiert, schrumpft die
          // Bildbox auf ein paar Pixel — daraus berechnete Faktoren wären absurd.
          // Dann lieber gar kein Zoom als ein 400-facher.
          if (s.width < 40 || s.height < 40 || logoW < 4) {
            endScale = 1;
            aimX = 0;
            aimY = 0;
            pivotX = 0;
            pivotY = 0;
          } else {
            // Quer: 1.04 schiebt die Monitorblende über die Viewport-Kante
            // hinaus, bevor die Skizze ausblendet — ohne den Zuschlag steht am
            // Ende eine unscharfe Rahmenlinie im Bild.
            //
            // Hochkant zielt die Fahrt stattdessen auf die Endgröße des
            // Zeichens (LOGO_END_WIDTH). „Cover" ist dort keine Option — die
            // Bildschirmfläche ist rund 110 × 60 px groß und bräuchte den
            // ~14-fachen Maßstab —, und die alte Ersatzregel „bis der Monitor
            // die Breite füllt" ließ das Zeichen kleiner enden als auf dem
            // Desktop. Den Rest der Höhe deckt die Blende ohnehin zu, hier wie
            // dort.
            endScale = isMobile
              ? (LOGO_END_WIDTH * stageW) / logoW
              : Math.max(v.width / s.width, v.height / s.height) * 1.04;

            // Die Kamera zielt auf das A-Kreuz, nicht auf die Mitte der
            // Bildschirmfläche: aus diesem Punkt öffnet die Blende, und ein paar
            // Pixel Versatz sind nach dem mehrfachen Zoom sichtbar. Das Kreuz
            // liegt fast mittig im Zeichen, der Monitor deckt die Bühne also
            // weiterhin — die 1.04 oben tragen den Rest.
            const crossX = c.left + c.width / 2 - v.left;
            const crossY = c.top + c.height / 2 - v.top;
            aimX = crossX - stageW / 2;
            aimY = crossY - stageH / 2;
            pivotX = crossX - sceneCx;
            pivotY = crossY - sceneCy;
          }

          // Die Layoutbreite der Kopie, EINMAL pro Messung. Genommen wird die
          // Endgröße der Fahrt, damit der Maßstab unterwegs immer ≤ 1 bleibt
          // (Begründung in applyZoom). Die Untergrenze ist keine Kosmetik: die
          // Zahl steht im Nenner des Maßstabs, und misst die Marke vor dem
          // ersten Layout 0, stünde dort NaN.
          hudBaseW = Math.max(1, logoW * endScale);
          hud.style.width = `${hudBaseW}px`;
        };

        const push = gsap.parseEase("power2.in");

        const applyZoom = (progress: number) => {
          // power2.in lässt den Schreibtisch den ersten Moment ruhig stehen und
          // beschleunigt dann hinein — eine Kamerafahrt, kein linearer Zug.
          const t = push(gsap.utils.clamp(0, 1, progress / zoomEnd));
          const scale = 1 + (endScale - 1) * t;
          // Skaliert wird um die Mitte der SZENE: ein Punkt mit Abstand pivot
          // landet dort bei pivot·scale. Ankommen soll das Kreuz aber in der
          // Mitte der BÜHNE, und zwar linear — von seiner Startlage aus um
          // aim·t verschoben. Aufgelöst nach der Verschiebung:
          //
          //   sceneMitte + pivot·scale + x  =  kreuzStart − aim·t
          //   x = pivot·(1 − scale) − aim·t
          //
          // Ohne Lücke fallen die beiden Mitten zusammen, dann sind pivot und
          // aim derselbe Wert und die Formel ist Zeichen für Zeichen die alte
          // `offset·(1 − t − scale)`. Der Desktop rechnet also unverändert.
          // Was die frühere Fassung nicht konnte: pivot und aim auseinander
          // halten, wenn die Szene kürzer ist als die Bühne (siehe measure).
          const x = pivotX * (1 - scale) - aimX * t;
          const y = pivotY * (1 - scale) - aimY * t;
          gsap.set(scene, { x, y, scale, force3D: true });

          // Das Zeichen läuft NICHT in der Szene mit, sondern als Kopie darüber
          // (siehe .about-logo-hud). Sie trägt ihre Endgröße als feste
          // Layoutbreite (measure) und wird von dort auf die Größe des
          // aktuellen Frames HERUNTERskaliert — Lage und Maßstab stehen
          // ausschließlich im Transform, das Layout rührt sich nicht.
          //
          // Genau da saß das Wackeln: eine gebrochene `width` pro Frame ist ein
          // Layoutwert, und Chrome malt Layoutboxen pixelgenau — linke und
          // rechte Kante werden EINZELN gerundet. Bei stetig wachsender Box
          // gemessen: linke Kante 447,5 / 447,0 / 446,5 / 446,5, rechte dazu
          // 542,5 / 543,0 / 542,5 / 543,5. Die gerenderte Breite pendelte also
          // pro Frame um ein Gerätepixel vor und zurück, statt monoton zu
          // wachsen. Am Schreibtisch darunter sah man davon nichts: der ist eine
          // Textur, die der Compositor stufenlos weiterskaliert. Das Zeichen
          // dagegen lag im Layout — und zitterte. Ein Transform kennt diese
          // Rundung nicht; gemessen fiel das Restzittern des Schwerpunkts damit
          // von 0,26 px auf 0,08 px pro Frame, ohne einen einzigen Rückschritt
          // in der gemalten Breite (vorher in fast jedem Frame einer).
          //
          // Warum die Kopie überhaupt außerhalb von .about-scene steht, bleibt
          // wie gehabt: die Szene trägt `will-change: transform` (about.css),
          // wird deshalb EINMAL gerastert und danach als Textur aufgezogen —
          // beim ~3,5-fachen Zoom kam das Zeichen dort als Bitmap-Upscale an
          // (gemessen 3,6 px breite Kanten statt 1,4 px). Den Hinweis situativ
          // fallen zu lassen half nicht: entweder flippte er mitten in der Fahrt
          // und ruckelte, oder man sah das Nachrastern als Schärfesprung. Der
          // Schreibtisch darunter bleibt gepinnt — er ist an dieser Stelle
          // ohnehin weichgezeichnet, seine Auflösung sieht niemand.
          //
          // Diese Ebene hier bekommt ausdrücklich KEIN will-change (about.css):
          // ohne den Hinweis folgt ihr Raster dem Maßstab, den das Transform
          // gerade setzt, statt auf einem festzukleben. Gemessen liegt die
          // Kantenschärfe über die ganze Fahrt rund 11 % über der früheren
          // Layout-Variante — es wird also weiterhin aus dem Vektor gerastert,
          // nur eben ohne Layoutbox dazwischen. Die Basisbreite ist trotzdem die
          // ENDgröße und nicht die Startgröße: bliebe die Rasterskala wider
          // Erwarten doch einmal stehen, ist ein zu großes Raster nur weich
          // gefiltert, ein zu kleines sichtbar aufgeblasen. Herunterskalieren
          // ist die Richtung, die im Zweifel verzeiht.
          //
          // Die Formel ist dieselbe wie oben, nur für einen Punkt statt für die
          // Ebene: um die Szenenmitte skalieren, dann den Kameraversatz drauf.
          // Sie MUSS denselben Ursprung benutzen wie das Transform der Szene —
          // steht hier die Bühnenmitte und dort die Szenenmitte, löst sich die
          // Kopie mit wachsendem Maßstab vom Original im Monitor.
          hudW = logoW * scale;
          hudH = hudW * LOGO_RATIO;
          hudX = sceneCx + (logoX - sceneCx) * scale + x;
          hudY = sceneCy + (logoY - sceneCy) * scale + y;
          hud.style.transform = `translate3d(${hudX}px, ${hudY}px, 0) scale(${
            hudW / hudBaseW
          })`;
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

          // Der Balken in Bühnenpixeln, aus der Box, die applyZoom der Kopie
          // gerade geschrieben hat — inklusive Höhe. Früher stand hier
          // `hudW * LOGO_RATIO`, weil die Höhe nirgends festgehalten war; seit
          // sie mitgerastet wird, ist der Wert von dort der genauere.
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
            // Quer wie bisher bis ans Trackende. Hochkant NICHT: hinter dieser
            // Timeline liegt noch der Kapitelwechsel, und bliebe das `end` an
            // „bottom bottom", zöge sich die Kamerafahrt mit jeder Änderung an
            // der Trackhöhe in die Länge. CAMERA_SPAN nagelt sie fest.
            end: isMobile
              ? () => `+=${window.innerHeight * CAMERA_SPAN}`
              : "bottom bottom",
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
          //
          // fromTo und nicht to, aus demselben Grund wie beim Reveal weiter
          // unten: ohne den festgeschriebenen Startwert kam der Header nach
          // einem Refresh beim Zurückscrollen nicht mehr wieder (gemessen:
          // Deckkraft 0, wo 1 stehen müsste).
          .fromTo(
            header,
            { opacity: 1, y: 0 },
            { opacity: 0, y: -28, ease: "power2.in", duration: 0.24 },
            0.14
          )
          // Schärfeverlagerung: macht aus dem unvermeidlichen Upscale des
          // Rasterbilds eine gewollte Kamerabewegung statt sichtbarer Pixel.
          // Bewusst flach gehalten, damit sie der Blende nicht die Schau stiehlt.
          // Zielt auf die Skizze, nicht auf .about-art — das LAAS-Zeichen liegt
          // im selben Container und muss scharf bleiben, es ist das Ziel.
          //
          // Der Wert ist im LOKALEN Koordinatensystem der Skizze angegeben und
          // wird vom Maßstab der Szene mitskaliert: auf dem Schirm steht am Ende
          // das Produkt aus beidem. Hochkant sind das mit 2px und dem Faktor
          // ~8,7 rund 17px — vorher 4px auf Faktor 3,64, also 14,6px. Bliebe die
          // 4 stehen, wären es jetzt 35px und aus der Skizze würde Schlieren.
          .fromTo(
            sketch,
            { filter: "blur(0px)" },
            {
              filter: `blur(${isMobile ? 2 : 3}px)`,
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
          //
          // WIE WEIT versetzt, steht in COPY_IN und ist quer und hochkant
          // verschieden — hochkant liegt in der Bandmitte das Porträt, und das
          // darf nicht als Bild in einem schmalen Balken auftauchen. Die
          // Rechnung dazu steht an der Konstante.
          //
          // Hochkant steigt hier nur das ERSTE Kapitel ein — Porträt, Name und
          // Ort. Der Rest kommt im Schwanz hinter dieser Timeline, siehe unten.
          //
          // MUSS ein fromTo bleiben, kein to. Der Startwert eines to() steht
          // nirgends geschrieben — GSAP liest ihn beim ersten Rendern aus dem
          // Element und wirft ihn bei jedem invalidate() wieder weg;
          // invalidateOnRefresh steht global als Default (AnimationProvider).
          // Fällt ein Refresh in einen Moment, in dem die Copy schon steht —
          // und Refreshes fallen genau dorthin: document.fonts.ready, das
          // onLoad der Skizze, jeder Resize —, dann liest der Tween 1 als
          // seinen neuen Anfang ein und läuft von da an von 1 nach 1.
          //
          // Vorwärts sieht man davon nichts, die Copy soll dort ja erscheinen.
          // Rückwärts blendet sie dann NICHT mehr aus: das Porträt stand in
          // voller Deckkraft im sich schliessenden Balken. Nachgestellt mit
          // einem Refresh auf Kapitel zwei und anschliessendem Zurückscrollen —
          // gemessen Deckkraft 1.00 bei einer Bandhöhe von 7px.
          //
          // Im fromTo steht der Anfang in den Vars und übersteht das
          // invalidate(). Die Werte sind dieselben, die gsap.set oben schreibt;
          // am gezeichneten Bild ändert sich nichts.
          .fromTo(
            isMobile ? chapterOne : groups,
            isMobile ? { "--lead-in": 0, y: 32 } : { opacity: 0, y: 32 },
            {
              ...(isMobile ? { "--lead-in": 1 } : { opacity: 1 }),
              y: 0,
              ease: "power3.out",
              duration: 0.14,
              stagger: 0.05,
            },
            zoomEnd +
              WIPE_DURATION *
                (split +
                  (1 - split) * (isMobile ? COPY_IN.mobile : COPY_IN.desktop))
          );

        // ── Kapitelwechsel, nur hochkant ──────────────────────────────────
        //
        // Warum überhaupt zwei Kapitel: der Streifen braucht gemessen 929.96px,
        // die Bühne hat 100svh. Auf einem echten iPhone sind das ~745px — es
        // fehlen 185px, und weil .about-content mittig ausrichtet, teilt sich
        // der Überlauf auf beide Enden. „Hey, ich bin" stand oben angeschnitten,
        // die untere Werkzeugreihe fehlte ganz. Genau der gemeldete Fehler.
        //
        // Warum ein EIGENER Trigger und nicht eine Position in der Timeline
        // oben: die hängt an der Kamerafahrt, und jede zusätzliche Strecke
        // darin verlangsamte sie mit. Der Track trägt den Wechsel stattdessen
        // als Schwanz hinter CAMERA_SPAN; wo der anfängt und aufhört, steht in
        // SWAP_SPAN.
        //
        // Scrub statt Abspielen: der Nutzer fährt den Wechsel. Rückwärts kommt
        // Kapitel eins deshalb von selbst zurück.
        if (isMobile) {
          const swap = gsap.timeline({
            scrollTrigger: {
              trigger: track,
              start: () => `top top-=${window.innerHeight * SWAP_SPAN.start}`,
              end: () => `top top-=${window.innerHeight * SWAP_SPAN.end}`,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          });

          swap
            // Auch hier fromTo statt to, und aus demselben Grund: dieser Tween
            // und der Reveal der Haupt-Timeline schreiben BEIDE die Deckkraft
            // desselben Elements. Wer von beiden seinen Anfang aus dem Element
            // liest, liest also den Zustand, den der andere gerade hinterlassen
            // hat — und nach einem invalidate() steht dieser Zufallswert dann
            // als Anfang fest.
            //
            // immediateRender: false ist die Bedingung dafür, dass das hier
            // gefahrlos ist: ein fromTo rendert seinen Anfang sonst sofort beim
            // Anlegen, und das wäre Deckkraft 1 auf Kapitel eins — sichtbar ab
            // dem ersten Frame der Seite, lange bevor die Blende aufgeht.
            .fromTo(
              chapterOne,
              { "--lead-out": 1, y: 0 },
              {
                "--lead-out": 0,
                y: -30,
                ease: "power2.in",
                duration: 0.34,
                immediateRender: false,
              },
              0,
            )
            .fromTo(
              chapterTwo,
              { opacity: 0, y: 34 },
              {
                opacity: 1,
                y: 0,
                ease: "power3.out",
                duration: 0.5,
                stagger: 0.08,
              },
              0.3,
            );

          // Hängt am selben mm-Kontext und wird von dessen revert() mit
          // aufgeräumt; der explizite Kill nimmt nur den Trigger mit, den
          // revert() nicht kennt.
          swapTeardown = () => {
            swap.scrollTrigger?.kill();
            swap.kill();
          };
        }

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
          swapTeardown?.();
          // Die beiden Faktoren von Kapitel eins stehen als rohe Custom
          // Properties am Element und überleben mm.revert() — wie die vier
          // Blendenwerte weiter unten. Bleiben sie stehen, hinge das Kapitel
          // beim Wechsel der Query auf dem letzten Produkt fest.
          for (const el of chapterOne) {
            el.style.removeProperty("--lead-in");
            el.style.removeProperty("--lead-out");
          }
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
                Textur (Begründung in applyZoom). Die Layoutbreite setzt measure
                einmal auf die Endgröße der Fahrt, Lage und Maßstab schreibt
                applyZoom pro Frame ins Transform — deckungsgleich mit dem
                Original im Monitor. Startet unsichtbar: ohne Kamerafahrt
                übernimmt sie nichts. */}
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
                    {/* Die Klasse trägt hochkant die Umstellung: dort löst
                        about.css die Textspalte auf und zieht allein diese
                        Zeile über das Porträt. */}
                    <p className="about-greeting font-mono text-[0.85rem] uppercase tracking-[0.24em] text-[#f2ede4]/50">
                      {ABOUT_INTRO.greeting}
                    </p>
                    {/* Die Schriftgrösse steht in about.css bei .about-name:
                        sie braucht neben der Fensterbreite eine zweite
                        Schranke aus der Spaltenbreite, und die ist als
                        Utility-Klasse nicht schreibbar. */}
                    <h3 className="about-name font-display font-bold uppercase leading-[0.86] tracking-[-0.04em]">
                      {ABOUT_INTRO.name.split(" ").map((part) => (
                        <span key={part} className="block">
                          {part}
                        </span>
                      ))}
                    </h3>
                    <p className="about-statement font-body text-[clamp(1.1rem,1.35vw,1.4rem)] leading-relaxed text-[#f2ede4]/70">
                      {/* Der Umbruchschutz der beiden Zeilen steht in about.css
                          bei .about-statement span und nicht mehr hier: er gilt
                          nur oberhalb der Stapelschwelle. Als Utility-Klasse
                          hätte er unter jeder Breite gegolten und blähte auf
                          320px den Layout-Viewport auf 414px auf. */}
                      {ABOUT_INTRO.subtitle.map((line) => (
                        <span key={line} className="block">
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
