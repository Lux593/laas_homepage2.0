"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/ui/TextReveal";
import { useLightSection } from "@/hooks/useLightSection";
import { PIN_QUERY, STACK_QUERY } from "@/lib/breakpoints";
import { SERVICE_ASSETS, type Service } from "@/lib/constants";
import { format } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import ServicesLandscape from "@/components/sections/services/ServicesLandscape";
import "./services/services.css";

gsap.registerPlugin(ScrollTrigger);

const TOTAL = String(SERVICE_ASSETS.length).padStart(2, "0");
const CHAPTER = 1 / SERVICE_ASSETS.length;

/** Seitlicher Einzug des einfahrenden Balkens in Prozent — bündig zur Hero-Copy.
 *  Gilt nur noch für die gepinnte Bühne; im Stapel fährt die Section ohne Einzug
 *  in voller Breite ein (siehe mm.add(STACK_QUERY, …) bei der Einfahrt). */
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
/** Pixel, die der Abgang sich horizontal gegen die Scrollrichtung verschiebt. */
const SWAP_LEAVE_SHIFT = 14;
/** Pixel, aus denen der Auftritt horizontal aus der Scrollrichtung nachrückt. */
const SWAP_ENTER_SHIFT = 22;

/* Kapitelwechsel im Stapel: die Copy schiebt sich als Ganzes durch die Bühne,
   die Zeichnung darüber blendet. Abgang und Auftritt laufen gleich lang und auf
   derselben Kurve — so steht zwischen beiden Texten jederzeit genau eine
   Bühnenbreite, sie können sich nie überlagern. */
/** Dauer des Schubs in Sekunden. */
const SLIDE_DURATION = 0.65;
const SLIDE_EASE = "power2.inOut";
/** Überblendung der Zeichnung, parallel zum Schub. */
const ART_FADE = 0.5;

function titleLines(title: string) {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 2) return [title];
  return [parts[0]!, parts.slice(1).join(" ")];
}

interface ChapterStageOptions {
  /** Wurzel, in der `[data-featured]` und `[data-chapter]` gesucht werden. */
  root: HTMLElement;
  /** Fortschritt 0…1 der ganzen Sektion — läuft pro Frame. */
  onProgress?: (progress: number) => void;
  /** Neuer aktiver Index — läuft nur beim Wechsel. */
  onIndex?: (index: number) => void;
  /** Stapel: Copy schiebt sich seitlich durch, die Zeichnung blendet.
   *  Ohne die Option bleibt es beim Wechsel der Desktop-Bühne. */
  slide?: boolean;
}

/**
 * Die Kapitelmaschine beider Bühnen.
 *
 * Sie ist eine Fabrik und keine zweite Fassung, weil Desktop und Stapel
 * denselben Vorgang zeigen: ein Index, der am Scroll hängt, ein Kapitel, das
 * abgeht, eins, das kommt. Nur die Ebenen sind andere — auf dem Desktop je eine
 * Textebene, im Stapel je ein Paar aus Bildstufe und Textebene. Deshalb ist
 * `featured[i]` hier eine LISTE von Knoten und nicht ein Knoten: alles, was
 * dieselbe `data-index` trägt, geht gemeinsam ab und kommt gemeinsam wieder.
 *
 * Jede Instanz hält ihren eigenen Stand (`lastIndex`, `armed`, `swap`). Vorher
 * lagen die drei im Effekt und wurden von beiden matchMedia-Armen geteilt —
 * beim Wechsel der Query räumte der eine Arm den Stand des anderen ab.
 */
function createChapterStage({
  root,
  onProgress,
  onIndex,
  slide = false,
}: ChapterStageOptions) {
  const nodes = gsap.utils.toArray<HTMLElement>("[data-featured]", root);
  /** Pro Kapitel alles, was gemeinsam ein- und ausgeblendet wird. */
  const featured = SERVICE_ASSETS.map((_, index) =>
    nodes.filter((node) => Number(node.dataset.index) === index),
  );
  /** Titel und Subtext je Kapitel — nur sie werden versetzt. */
  const featuredCopy = featured.map((layer) =>
    layer.flatMap((node) =>
      gsap.utils.toArray<HTMLElement>("[data-featured-copy]", node),
    ),
  );
  const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", root);

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
   * Also: keine Promotion. Zwei Vorkehrungen halten den Wechsel trotzdem
   * billig und ruhig:
   *   - force3D: false — sonst schiebt GSAP von sich aus ein translate3d()
   *     unter den Tween und promotet die Ebene doch.
   *   - Versetzt werden nur Titel und Subtext, nicht die randlose Ebene:
   *     deren Kasten füllt die ganze Spalte, ein horizontaler Versatz auf
   *     der Ebene selbst würde also seitlich über die Spalte hinausragen.
   *     Im Stapel gilt dasselbe für die Bildstufe: sie blendet nur, sie
   *     rutscht nicht — eine wandernde Zeichnung neben wandernder Copy wären
   *     zwei Bewegungen auf einer Kante.
   * KEIN roundProps: bei power2.out wird die Bewegung zum Ende hin
   * langsamer als 1px/Frame — auf ganze Pixel gerundet hieße das, die
   * letzten Frames stehen auf demselben Pixel und springen dann, statt
   * auszuklingen. Genau das war das ruckelige Ende der Einblendung.
   * Und weiterhin: niemals filter, clip-path, mask oder box-shadow — das
   * sind exakt die Eigenschaften, die eine eigene Compositing-Ebene
   * erzwingen und damit das Ruckeln wieder hereinholen würden.
   */
  const swapChapter = (activeIndex: number, direction: 1 | -1) => {
    const enter = featured[activeIndex];
    const enterCopy = featuredCopy[activeIndex];
    if (!enter?.length || !enterCopy) return;

    // Bei schnellem Scrollen springt der Index mehrfach hintereinander.
    swap?.kill();
    swap = null;

    // Abgehen muss alles, was noch sichtbar ist — auch eine Ebene aus einem
    // abgebrochenen Wechsel, die sonst halbtransparent stehen bliebe.
    const leaving = featured
      .map((_, index) => index)
      .filter(
        (index) =>
          index !== activeIndex &&
          Number(gsap.getProperty(featured[index]![0]!, "opacity")) > 0,
      );
    const leave = leaving.flatMap((index) => featured[index]!);
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
        .to(leave, { autoAlpha: 0, duration: SWAP_LEAVE, ease: "power1.in" }, 0)
        .to(
          leaveCopy,
          {
            x: -SWAP_LEAVE_SHIFT * direction,
            duration: SWAP_LEAVE,
            ease: "power1.in",
            force3D: false,
          },
          0,
        );
    }

    swap
      .fromTo(
        enter,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: SWAP_ENTER, ease: "power2.out" },
        SWAP_HANDOVER,
      )
      .fromTo(
        enterCopy,
        { x: SWAP_ENTER_SHIFT * direction },
        {
          x: 0,
          duration: SWAP_ENTER,
          ease: "power2.out",
          force3D: false,
        },
        SWAP_HANDOVER,
      );
  };

  /** Deckkraft eines Knotens, wie GSAP sie gerade führt. */
  const opacityOf = (node: HTMLElement | undefined) =>
    node ? Number(gsap.getProperty(node, "opacity")) : 0;

  /**
   * Kapitelwechsel im Stapel: die Copy schiebt sich durch, die Zeichnung blendet.
   *
   * Abwärts läuft der alte Text nach links hinaus und der neue kommt von
   * rechts, aufwärts umgekehrt. Beide fahren gleichzeitig, gleich lang, auf
   * derselben Kurve — wie zwei Seiten eines Karussells.
   * Die Bühne schneidet (`overflow: hidden` in services.css), der Weg ist
   * deshalb genau eine Bühnenbreite.
   *
   * Absichtlich zeitbasiert und nicht am Scroll festgemacht: hängt das Telefon
   * kurz (erster Aufruf, das Skript wird gerade eingerichtet), kommt der
   * Wechsel einen Moment später, läuft dann aber vollständig ab. Eine an den
   * Scroll gekoppelte Bewegung stünde in derselben Lage still und spränge
   * danach — genau das war der Fehler des alten Fortschrittsstrichs.
   */
  const swapSlide = (activeIndex: number, direction: 1 | -1) => {
    const enterLayer = featured[activeIndex];
    const enterCopy = featuredCopy[activeIndex];
    if (!enterLayer?.length || !enterCopy) return;

    swap?.kill();
    swap = null;

    const isArt = (node: HTMLElement) => node.hasAttribute("data-featured-art");
    const distance = root.clientWidth;

    const leaving = featured
      .map((_, index) => index)
      .filter(
        (index) =>
          index !== activeIndex &&
          featured[index]!.some((node) => opacityOf(node) > 0),
      );
    const leaveArt = leaving.flatMap((index) => featured[index]!.filter(isArt));
    const leaveText = leaving.flatMap((index) =>
      featured[index]!.filter((node) => !isArt(node)),
    );
    const leaveCopy = leaving.flatMap((index) => featuredCopy[index]!);
    const enterArt = enterLayer.filter(isArt);
    const enterText = enterLayer.filter((node) => !isArt(node));

    swap = gsap.timeline({
      onComplete: () => {
        gsap.set([...enterCopy, ...leaveCopy], { clearProps: "transform" });
        swap = null;
      },
    });

    swap
      .to(leaveArt, { autoAlpha: 0, duration: ART_FADE, ease: "power1.inOut" }, 0)
      .to(enterArt, { autoAlpha: 1, duration: ART_FADE, ease: "power1.inOut" }, 0);

    if (leaveCopy.length) {
      swap
        .to(
          leaveCopy,
          { x: -distance * direction, duration: SLIDE_DURATION, ease: SLIDE_EASE },
          0,
        )
        .set(leaveText, { autoAlpha: 0 }, SLIDE_DURATION);
    }

    // Steht der Text noch halb im Bild — Richtungswechsel mitten im Schub —,
    // fährt er von dort zurück, statt erst an den Rand zu springen.
    const enterTo = { x: 0, duration: SLIDE_DURATION, ease: SLIDE_EASE };
    if (opacityOf(enterText[0]) > 0) {
      swap.to(enterCopy, enterTo, 0);
    } else {
      swap
        .set(enterText, { autoAlpha: 1 }, 0)
        .fromTo(enterCopy, { x: distance * direction }, enterTo, 0);
    }
  };

  /** Ohne Bewegung auf ein Kapitel stellen — Initialstand und Refresh. */
  const settle = (activeIndex: number) => {
    swap?.kill();
    swap = null;
    featured.forEach((layer, index) =>
      gsap.set(layer, { autoAlpha: index === activeIndex ? 1 : 0 }),
    );
    gsap.set(featuredCopy.flat(), { clearProps: "transform" });
  };

  const applyActive = (activeIndex: number) => {
    featured.forEach((layer, index) => {
      const on = index === activeIndex;
      layer.forEach((node) => {
        node.classList.toggle("is-active", on);
        node.setAttribute("aria-hidden", on ? "false" : "true");
      });
    });

    chapters.forEach((chapter, index) => {
      chapter.classList.toggle("is-active", index === activeIndex);
    });

    onIndex?.(activeIndex);
  };

  const applyScrub = (progress: number) => {
    const activeIndex = Math.min(
      SERVICE_ASSETS.length - 1,
      Math.floor(progress / CHAPTER),
    );

    // Kontinuierlicher Progress — pro Frame, nur Transform.
    onProgress?.(progress);

    if (activeIndex !== lastIndex) {
      const previous = lastIndex;
      lastIndex = activeIndex;
      applyActive(activeIndex);
      // previous === -1 ist der Initialstand: der wird gesetzt, nicht
      // eingeblendet. Die Richtung folgt dem Indexsprung, damit der alte
      // Text beim Hochscrollen nach unten abgeht statt nach oben.
      if (armed && previous !== -1) {
        const direction = activeIndex > previous ? 1 : -1;
        if (slide) swapSlide(activeIndex, direction);
        else swapChapter(activeIndex, direction);
      } else {
        // Ohne Animation, aber sichtbar auf dem richtigen Kapitel. Vorher
        // wechselte hier nur die Klasse, während die Deckkraft inline auf dem
        // alten Kapitel stehen blieb: nach einem Refresh mitten in der
        // Sektion (oder einem Reload dort) stand der falsche Text da.
        settle(activeIndex);
      }
    }
  };

  return {
    /** Ab hier führt GSAP die Deckkraft der Ebenen inline; die Klasse
     *  .is-active bleibt für pointer-events, aria und die Stapelreihenfolge
     *  zuständig. Die opacity-Regeln in services.css sind damit nur noch der
     *  Ruhezustand für Skript-aus. */
    prime() {
      featured.forEach((layer, index) =>
        gsap.set(layer, { autoAlpha: index === 0 ? 1 : 0 }),
      );
    },
    applyScrub,
    /** Den vorigen Stand wiederherstellen statt blind scharf zu schalten:
     *  ein Refresh setzt den Stand nur nach, er animiert nicht. Der
     *  AnimationProvider stösst nach document.fonts.ready einen an, und sonst
     *  liefe kurz nach dem Laden ein Kapitelwechsel los, den niemand ausgelöst
     *  hat. Feuert schon während create(), wo noch nichts animieren darf. */
    restore(progress: number) {
      const wasArmed = armed;
      armed = false;
      applyScrub(progress);
      armed = wasArmed;
    },
    arm() {
      armed = true;
    },
    destroy() {
      swap?.kill();
      swap = null;
      armed = false;
      lastIndex = -1;
      // Zurück unter CSS-Kontrolle — sonst bliebe beim Wechsel der Query eine
      // Ebene auf visibility: hidden stehen.
      const all = featured.flat();
      gsap.set(all, { clearProps: "opacity,visibility" });
      gsap.set(featuredCopy.flat(), { clearProps: "transform" });
      all.forEach((node) => node.removeAttribute("aria-hidden"));
    },
  };
}

type ServicesCopy = Omit<Dictionary["services"], "items">;

function ServicesHeader({
  copy,
  counterRef,
  revealScrub,
}: {
  copy: ServicesCopy;
  counterRef?: RefObject<HTMLSpanElement | null>;
  /** Nur der Stapel setzt das — siehe die Begründung an der Fundstelle. */
  revealScrub?: number;
}) {
  return (
    <header className="work-container relative z-20 w-full shrink-0 pt-[clamp(4rem,8vh,5.5rem)] pb-[clamp(0.875rem,2vh,1.375rem)]">
      <div className="flex items-end justify-between gap-8">
        <div className="min-w-0">
          <span className="mb-2 block font-mono text-caption uppercase tracking-[0.2em] text-[#6a6a6a] lg:mb-3">
            {copy.eyebrow}
          </span>
          <TextReveal
            as="h2"
            variant="words"
            start={revealScrub === undefined ? "top 95%" : "top 92%"}
            end={revealScrub === undefined ? undefined : "top 58%"}
            scrub={revealScrub}
            className="font-display text-[clamp(1.75rem,4vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tighter text-[#0a0a0a]"
          >
            {copy.headline}
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
 * Ein Kapitel des gestapelten Aufbaus: die Bildstufe und die Copy darunter.
 *
 * Sie kommen als Geschwister und nicht ineinander, weil sie in der gepinnten
 * Bühne in ZWEI Gitterzeilen liegen müssen — Bild oben, Copy unten, alle vier
 * Kapitel deckungsgleich in derselben Zelle. Die Zeilen sind explizit gesetzt
 * (`grid-area`), die Reihenfolge im Markup bleibt deshalb frei: hier steht sie
 * abwechselnd Bild/Copy, damit der ungepinnte Ruhezustand — reduced motion —
 * ohne eine einzige Regel als lesbare Folge herausfällt.
 *
 * Die Bildstufe trägt KEIN data-featured-copy: sie blendet nur, sie rutscht
 * nicht. Siehe die Begründung an swapChapter.
 */
function ServicesChapter({
  service,
  index,
  total,
}: {
  service: Service;
  index: number;
  total: number;
}) {
  const lines = titleLines(service.title);
  const mark = String(index + 1).padStart(2, "0");

  return (
    <>
      <figure
        data-featured
        data-featured-art
        data-index={index}
        className={`services-stack-art${index === 0 ? " is-active" : ""}`}
        aria-hidden
      >
        {/* Kein priority: auf dem Desktop steht .services-stack auf
            display:none, ein Preload-Link gälte aber trotzdem — vier
            Zeichnungen, die dort niemand sieht. Lazy lädt sie genau dort,
            wo sie gebraucht werden. */}
        <Image
          src={service.visual}
          alt=""
          fill
          sizes="(max-width: 1023px) 90vw, 45vw"
          className="object-contain object-center"
          draggable={false}
        />
      </figure>

      <article
        data-featured
        data-index={index}
        className={`services-stack-chapter${index === 0 ? " is-active" : ""}`}
      >
        <div
          data-featured-copy
          className="services-stack-chapter__meta"
          aria-hidden
        >
          <span className="services-stack-chapter__mark font-display font-bold leading-none tracking-tighter tabular-nums">
            {mark}
          </span>
          {/* Der Strich zeigt, wie weit die Folge ist: pro Kapitel ein
              fester Stand (01 = ein Viertel …), kein Scroll-Instrument. Er
              fährt mit seinem Text durch die Bühne, also steht jedes Kapitel
              mit seinem eigenen Stand im Bild. Fest im Markup, damit er auch
              ohne Skript und auf dem ersten Frame stimmt. */}
          <span className="services-stack-rule">
            <span
              className="services-stack-rule__fill"
              style={{ transform: `scaleX(${(index + 1) / total})` }}
            />
          </span>
          {/* Display statt Mono — siehe ProcessPanel: die Mono-Null trägt
              einen Strich und fiel als einzige Zahl aus der Reihe. */}
          <span className="services-stack-chapter__count shrink-0 font-display text-caption font-bold tabular-nums tracking-tighter">
            {mark} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <h3
          data-featured-copy
          className="services-stack-chapter__title font-display font-bold uppercase tracking-tighter text-[#0a0a0a]"
        >
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>

        <p
          data-featured-copy
          className="services-stack-chapter__body font-body text-[#5f574e]"
        >
          {service.description}
        </p>
      </article>
    </>
  );
}

/**
 * Leistungen — Lookbook-Theater.
 *
 * Desktop: sticky Bühne, asymmetrisches Split, Riesen-Kapiteltypografie,
 * kontinuierlicher Progress-Scrub, Kapitel-Rail.
 * Stapel: dieselbe Bühne hochkant — die Zeichnung räumt sich über vier Stufen
 * auf, die Copy wechselt mit ihr, und die Seite steht dabei still.
 */
export default function Services({
  copy,
  services,
}: {
  copy: ServicesCopy;
  services: Service[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const stackTrackRef = useRef<HTMLDivElement>(null);
  const stackStageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLightSection(sectionRef);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const mm = gsap.matchMedia();

    // ── Einfahrt der zweiten Seite ────────────────────────────────────────
    //
    // Kein vorauseilender Stummel mehr: die Section selbst kommt QUER als
    // schmaler, seitlich eingezogener Balken herein und klappt dann auf volle
    // Breite auf. Die Höhe macht der Scroll von allein — die Oberkante der
    // Section IST die Oberkante des Balkens. Animiert wird deshalb nur der
    // seitliche Einzug und der Radius, und zwar über clip-path: box-shadow und
    // Radien am Element würden beim Aufklappen eine zweite Kante in die
    // Cremefläche zeichnen.
    //
    // Im Stapel gibt es diesen Balken nicht mehr, siehe mm.add(STACK_QUERY, …).
    //
    // ZWEI ARME, seit auf dem Telefon gemessen wurde, was die eine Timeline
    // dort anrichtet. PIN_QUERY behält die Werte von vorher — der Desktop ist
    // eingefroren —, STACK_QUERY bekommt eigene. Die Vereinigung beider Queries
    // deckt genau das ab, was vorher „(prefers-reduced-motion: no-preference)"
    // allein abdeckte: unter 1024px greift STACK, ab 1024px greift PIN für
    // feinen Zeiger und für Querformat, STACK für groben Zeiger im Hochformat.
    //
    // Der Befund: mit `end: "top 55%"` und dem Versatz 0.45 standen auf 393x852
    // die ersten 172.5px des Wegs still — der Balken war sichtbar, aber kein
    // Wert bewegte sich —, danach fielen Öffnung UND Einblendung in die
    // restlichen 210.9px. Auf dem echten Gerät ist es schlimmer: der Hero misst
    // in `svh`, die Trigger-Marken rechnen in `vh`, und
    // ScrollTrigger.config({ ignoreMobileResize: true }) unterdrückt das
    // Nachmessen, wenn Safari die Adressleiste einklappt. Emuliert wuchs die
    // Totstrecke damit auf 257.8px und das Öffnungsfenster schrumpfte auf
    // 184.4px — 58% Stillstand, dann alles auf einmal.
    //
    // Warum sich das nur abwärts falsch anfühlt: die Werte sind in beide
    // Richtungen identisch, gemessen auf 0.04 Prozentpunkte genau. Abwärts
    // trifft der Finger aber erst den toten Teil und danach den ganzen Rest —
    // das liest sich als Aufsnappen. Aufwärts liegt der lebendige Teil vorn und
    // der tote hinten, wo ohnehin nichts mehr zu sehen ist.
    //
    // Der Stapel bekam deshalb einen längeren Weg (`top 40%` statt `top 55%`:
    // 60% Fensterhöhe statt 45%). Der Weg bleibt, das Aufsnappen ist mit dem
    // Einzug ohnehin weg — er trägt jetzt allein die Einblendung des Inhalts.
    //
    // `opts.inset` ist der seitliche Einzug des Balkens. Steht dort 0, entfällt
    // die Aufklapp-Bewegung vollständig: die Section beginnt in voller Breite,
    // es bleibt der Ruhezustand aus services.css (`--enter-inset: 0%`, Radius
    // `--radius-panel`). Genau das ist der Stapel-Fall — dazu die Begründung an
    // der mm.add(STACK_QUERY, …) weiter unten.
    const buildEntry =
      (opts: {
        end: string;
        scrub: number;
        open: number;
        ink: number;
        inset: number;
      }) =>
      () => {
        const section = sectionRef.current;
        if (!section) return;

        const token = (name: string, fallback: string) =>
          getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim() || fallback;

        const wide = window.matchMedia("(min-width: 768px)").matches;
        const openRadius = wide ? 3 : 2.5;
        const restRadius = parseFloat(
          wide
            ? token("--radius-panel-lg", "2rem")
            : token("--radius-panel", "1.5rem"),
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
            end: opts.end,
            scrub: opts.scrub,
            invalidateOnRefresh: true,
          },
        });

        // Erst als Balken hereinfahren, dann aufklappen. `opts.open` ist die
        // Länge dieser Balkenphase; sie fehlt der Öffnung, damit beide zusammen
        // die Timeline genau füllen.
        //
        // MUSS ein fromTo bleiben, kein set + to: revert() merkt sich als
        // Ursprungswert `style[prop]`, und das ist bei einer Custom Property
        // immer undefined — GSAP löscht die Inline-Variable also, statt sie
        // zurückzuschreiben. Der Wert fällt damit auf den Ruhezustand aus
        // services.css (0%), und ein to() läse beim invalidate() genau diese 0%
        // als neuen Startwert ein: die Einfahrt wäre nach dem ersten Refresh tot
        // und die Section schöbe sich in voller Breite über den Hero. Beim fromTo
        // steht der Startwert in den Vars und übersteht das.
        if (opts.inset > 0) {
          tl.fromTo(
            section,
            {
              "--enter-inset": `${opts.inset}%`,
              "--enter-radius": `${openRadius}rem`,
            },
            {
              "--enter-inset": "0%",
              "--enter-radius": `${restRadius}rem`,
              duration: 1 - opts.open,
              ease: "power2.out",
              immediateRender: true,
            },
            opts.open,
          );
        }

        // Der Balken fährt leer herein. Sonst steht die Kopfzeile schon in dem
        // schmalen Streifen und wird von der Clip-Kante mitten im Wort
        // abgeschnitten — der Inhalt kommt erst, wenn die Fläche weit offen ist.
        // `opts.ink` ist der Moment, in dem das Einblenden beginnt; im Stapel
        // liegt er bei 0.45, wo der Einzug rechnerisch noch 3.2% misst — die
        // Deckkraft ist dort aber selbst erst bei 0, und voll ist sie bei 0.85,
        // wo der Einzug unter 1px liegt.
        const content = [track, stackRef.current].filter(
          (el): el is HTMLDivElement => el !== null,
        );
        if (content.length) {
          tl.fromTo(
            content,
            { opacity: 0 },
            { opacity: 0, duration: opts.ink, ease: "none" },
            0,
          ).to(
            content,
            { opacity: 1, duration: 0.4, ease: "power1.out" },
            opts.ink,
          );
        }

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(section, { clearProps: "--enter-inset,--enter-radius" });
          if (content.length) gsap.set(content, { clearProps: "opacity" });
        };
      };

    // Byte-identisch zu vorher: end "top 55%", scrub 0.4, Öffnung ab 0.45,
    // Einblendung ab 0.55.
    mm.add(
      PIN_QUERY,
      buildEntry({
        end: "top 55%",
        scrub: 0.4,
        open: 0.45,
        ink: 0.55,
        inset: ENTER_INSET,
      }),
    );
    // Im Stapel OHNE Einzug: die Fläche beginnt in voller Breite.
    //
    // Der Balken war für die Desktop-Bühne gedacht, wo die Section quer über
    // ein breites Bild fährt und die eingezogene Kante als eigenes Blatt lesbar
    // ist. Auf dem Telefon steht daneben nichts — dort liest sich derselbe
    // Vorgang als Fläche, die sich aus der Mitte heraus aufzieht, während sie
    // ohnehin schon von unten steigt. Zwei Bewegungen auf einer Kante, und die
    // seitliche gewinnt gegen die eigentliche.
    //
    // `open` ist damit gegenstandslos (es war die Länge der Balkenphase) und
    // steht auf 0. `end`, `scrub` und `ink` bleiben: an ihnen hängt weiterhin
    // die Einblendung des Inhalts, die kein Einzug ist, sondern das Ankommen.
    mm.add(
      STACK_QUERY,
      buildEntry({
        end: "top 40%",
        scrub: 0.55,
        open: 0,
        ink: 0.45,
        inset: 0,
      }),
    );

    // MUSS byte-identisch zur @media-Query für .services-pin--desktop bleiben
    mm.add(PIN_QUERY, () => {
      const chapters = createChapterStage({
        root: stage,
        onProgress: (progress) => {
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${Math.max(progress, 0.02)})`;
          }
        },
        onIndex: (index) => {
          if (counterRef.current) {
            counterRef.current.textContent = String(index + 1).padStart(2, "0");
          }
        },
      });
      chapters.prime();

      const st = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.45,
        onUpdate: (self) => chapters.applyScrub(self.progress),
        onRefresh: (self) => chapters.restore(self.progress),
        invalidateOnRefresh: true,
        refreshPriority: 1,
      });

      // Erststand aus der tatsächlichen Scrollposition, bevor scharf
      // geschaltet wird: beim Reload mitten in der Sektion steht sofort das
      // richtige Kapitel da, ohne Einblendung.
      chapters.applyScrub(st.progress);
      chapters.arm();

      return () => {
        st.kill();
        chapters.destroy();
      };
    });

    // ── Die Zeichnung räumt sich auf, die Seite steht still ───────────────
    //
    // Dieselbe Bühne wie oben, nur hochkant und mit einem zweiten Satz Ebenen:
    // über der Copy hängt die Bildstufe des Kapitels. Vier Stände desselben
    // Blatts, und was auf dem Desktop der Finger an der Ziehkante macht, macht
    // hier der Scroll.
    //
    // Warum gepinnt und nicht gestapelt: gestapelt lief die Zeichnung als
    // klebendes Hauptmotiv mit, während vier Kapitel an ihr vorbeizogen — ein
    // Bild, vier Texte. Die vier Stände sind aber vier Bilder, und die sind nur
    // als Folge zu lesen. Eine Folge braucht einen Halt: die Fläche steht, der
    // Scroll ist der Schnitt. Genau das ist die Bühne, die der Desktop schon
    // hat; sie kostet hier keine zweite Mechanik, nur eine zweite Wurzel.
    //
    // Im Stapel hängt nichts Sichtbares mehr am Scroll. Der Scroll wählt nur
    // das Kapitel; der Wechsel selbst läuft auf Zeit (swapSlide): Text schiebt
    // sich seitlich durch, die Zeichnung blendet. Ein Strich, der dem Finger
    // folgte, fror auf dem Telefon beim ersten Besuch ein und sprang dann —
    // ein Zeitwechsel kommt bei einem Ruckler höchstens später, läuft aber
    // ganz. Der Strich steht deshalb fest pro Kapitel (ServicesChapter).
    //
    // Kein scrub: es gibt keine Animation, die er glätten könnte, und das
    // Kapitel soll wechseln, sobald die Schwelle überschritten ist.
    mm.add(STACK_QUERY, () => {
      const stackStage = stackStageRef.current;
      const stackTrack = stackTrackRef.current;
      if (!stackStage || !stackTrack) return;

      const chapters = createChapterStage({ root: stackStage, slide: true });
      chapters.prime();

      const st = ScrollTrigger.create({
        trigger: stackTrack,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => chapters.applyScrub(self.progress),
        onRefresh: (self) => chapters.restore(self.progress),
        invalidateOnRefresh: true,
        refreshPriority: 1,
      });

      chapters.applyScrub(st.progress);
      chapters.arm();

      return () => {
        st.kill();
        chapters.destroy();
      };
    });

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
            <ServicesHeader copy={copy} counterRef={counterRef} />

            <div ref={stageRef} className="services-stage work-container">
              {/* Links: dominante Landschaft */}
              <div className="services-landscape-slot">
                <ServicesLandscape
                  className="services-landscape--desktop"
                  label={format(copy.landscapeLabel, {
                    statement: copy.statement,
                  })}
                  valueTemplate={copy.landscapeValue}
                />
              </div>

              {/* Rechts: Lookbook-Kapitel */}
              <div className="services-lookbook">
                <div className="services-featured">
                  {services.map((service, index) => {
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

                  <nav
                    className="services-chapters"
                    aria-label={copy.sectionLabel}
                  >
                    {services.map((service, index) => (
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
        {/* Diese Kopfzeile gehört dem Stapel — auf dem Desktop steht
            .services-stack auf display:none (services.css). Sie ist damit der
            einzige Ort, an dem `revealScrub` wirkt, und der Desktop behält sein
            einmaliges Abspielen. Gemessen war genau diese Zeile die Asymmetrie,
            die als Aufsnappen ankam: abwärts lief sie 1002ms nach dem Finger
            weiter, aufwärts rührte sie sich nie. */}
        <ServicesHeader copy={copy} revealScrub={0.5} />

        {/* Die Kopfzeile bleibt AUSSERHALB der Klebestrecke und zieht vorbei.
            Innen gerechnet kostete sie auf 375x667 rund 155px der Bühne — die
            fehlen dort dem Bild, und das Bild ist die Aussage. Draussen ist sie
            das, was sie ist: die Ankündigung, nach der die Bühne einrastet. */}
        <div ref={stackTrackRef} className="services-stack-track">
          <div
            ref={stackStageRef}
            className="services-stack-stage work-container"
          >
            {services.map((service, index) => (
              <ServicesChapter
                key={service.id}
                service={service}
                index={index}
                total={services.length}
              />
            ))}
          </div>

          {/* Die Strecke, über die die Bühne steht. Sie ist der einzige Grund,
              warum die Seite hier nicht weiterläuft: gescrollt wird an ihr,
              gezeigt wird auf der klebenden Bühne darüber. */}
          <div className="services-stack-scroll" aria-hidden />
          {/* Rastpunkte, einer je Kapitel: ein schneller Wisch hält am
              nächsten Kapitel an, statt eins zu überspringen. Lage und Regeln
              in services.css (.services-stack-snap). */}
          {services.map((service, index) => (
            <span
              key={service.id}
              className="services-stack-snap"
              style={{ "--snap-index": index } as CSSProperties}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  );
}
