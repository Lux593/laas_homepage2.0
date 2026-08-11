"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/ui/MagneticButton";
import DeviceBezel, { type DeviceVariant } from "@/components/ui/DeviceBezel";
import {
  useIsMobile,
  usePrefersReducedMotion,
} from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type FormStatus = "idle" | "submitting" | "success";

interface ContactDropFormProps {
  /** Cow / easter egg — beside the button when closed. */
  leadingAccessory?: React.ReactNode;
  /** Cream card / scroll coverage while the form is open. */
  onOpenChange?: (open: boolean) => void;
}

const FIELD_PHONE =
  "w-full rounded-lg border border-[#0a0a0a]/15 bg-white/80 px-2.5 py-2 text-[11px] leading-tight text-[#0a0a0a] outline-none transition-colors placeholder:text-[#0a0a0a]/35 focus:border-[#0a0a0a]/45";

const FIELD_PAD =
  "w-full rounded-xl border border-[#0a0a0a]/15 bg-white/80 px-3.5 py-2.5 text-[13px] leading-tight text-[#0a0a0a] outline-none transition-colors placeholder:text-[#0a0a0a]/35 focus:border-[#0a0a0a]/45";

const LABEL_PHONE =
  "mb-0.5 block text-left text-[9px] font-mono uppercase tracking-wider text-[#6a6a6a]";

const LABEL_PAD =
  "mb-1 block text-left text-[10px] font-mono uppercase tracking-wider text-[#6a6a6a]";

/** Tropfen = Knopffarbe. Pfütze = exakter Rahmenton, aus ipad-frame.webp
 *  gelesen (rgb(15,24,41)). Die Pfütze färbt sich beim Ausbreiten um, damit
 *  der Schnitt auf den echten Rahmen keinen Farbsprung hat. */
const INK = "#0a0a0a";
const BEZEL = "#0f1829";

/** Fallstrecke zwischen Knopfunterkante und Gerätekante — und zugleich der
 *  Layout-Abstand im offenen Zustand. Vorher standen hier 28px: zu wenig, um
 *  einen Fall überhaupt als Fall zu lesen, der Tropfen war am Ziel, bevor er
 *  Fahrt aufgenommen hatte. */
const DROP_GAP = { ipad: 92, iphone: 62 } as const;

/** Eckradius der Rahmen-WebPs, als Anteil der Rahmenbreite. Diagonalschnitt
 *  durch den Alphakanal: die Kante trifft die 45°-Linie bei d = R·(1−1/√2). */
const CORNER_RATIO = { ipad: 0.0508, iphone: 0.1327 } as const;

/** Spritzer: Richtung (x), Steighöhe (y) und Grösse, jeweils als Vielfaches
 *  des Tropfenradius. Unsymmetrisch, weil symmetrische Spritzer sofort als
 *  Muster gelesen werden statt als Flüssigkeit. */
const SPLASH = [
  { dx: -1.15, rise: 0.62, size: 0.34, delay: 0 },
  { dx: -0.6, rise: 1.05, size: 0.24, delay: 0.04 },
  { dx: 0.22, rise: 1.18, size: 0.2, delay: 0.06 },
  { dx: 0.78, rise: 0.9, size: 0.3, delay: 0.02 },
  { dx: 1.25, rise: 0.5, size: 0.22, delay: 0 },
] as const;

type RelRect = { x: number; y: number; width: number; height: number };

function relativeRect(el: HTMLElement, root: HTMLElement): RelRect {
  const er = el.getBoundingClientRect();
  const rr = root.getBoundingClientRect();
  return {
    x: er.left - rr.left,
    y: er.top - rr.top,
    width: er.width,
    height: er.height,
  };
}

/**
 * Hängender Tropfen: eine Strecke der Breite `neck` an der Knopfunterkante,
 * zwei Kubiken hinunter zur Kugel vom Radius `r` bei `cy`, unten herum
 * geschlossen. Wandert `cy` nach unten und `neck` gegen null, entsteht genau
 * die Einschnürung, die einen Tropfen ausmacht — der Abriss ist dann nur noch
 * der Wechsel auf die freie Ellipse.
 *
 * Die Kontrollpunkte der Flanken liegen senkrecht über den Kugelpolen
 * (Abstand 1.35·r), dort ist die Tangente vertikal: der Übergang Kubik→Bogen
 * ist damit knickfrei, was man bei jedem anderen Wert sofort als Ecke sieht.
 */
function pendantPath(
  cx: number,
  top: number,
  cy: number,
  r: number,
  neck: number,
) {
  const shoulder = Math.max(cy - top, r) * 0.45;
  const flank = r * 1.35;
  return (
    `M${cx - neck} ${top}` +
    `C${cx - neck} ${top + shoulder} ${cx - r} ${cy - flank} ${cx - r} ${cy}` +
    `A${r} ${r} 0 0 0 ${cx + r} ${cy}` +
    `C${cx + r} ${cy - flank} ${cx + neck} ${top + shoulder} ${cx + neck} ${top}Z`
  );
}

function setAttrs(el: Element | null, attrs: Record<string, number | string>) {
  if (!el) return;
  for (const key in attrs) el.setAttribute(key, String(attrs[key]));
}

type Geo = {
  rootW: number;
  cx: number;
  btnW: number;
  btnBottom: number;
  devX: number;
  /** Gerätekante bei marginTop 0 — der Fixpunkt, auf den alles gerechnet wird. */
  devTop: number;
  dw: number;
  dh: number;
  screenX: number;
  screenTop: number;
  screenW: number;
  screenH: number;
  gap: number;
  corner: number;
  dropR: number;
};

export default function ContactDropForm({
  leadingAccessory,
  onOpenChange,
}: ContactDropFormProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const variant: DeviceVariant = isMobile ? "iphone" : "ipad";

  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<SVGSVGElement>(null);
  const pendantRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<SVGEllipseElement>(null);
  const reboundRef = useRef<SVGEllipseElement>(null);
  const poolRef = useRef<SVGRectElement>(null);
  const shutterTopRef = useRef<SVGRectElement>(null);
  const shutterBotRef = useRef<SVGRectElement>(null);
  const splashRefs = useRef<(SVGCircleElement | null)[]>([]);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);
  const animatingRef = useRef(false);
  const cowWidthRef = useRef(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    animatingRef.current = animating;
  }, [animating]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (stage) gsap.set(stage, { height: 0, marginTop: 0 });
  }, []);

  useEffect(() => {
    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, []);

  const killTimeline = () => {
    tlRef.current?.kill();
    tlRef.current = null;
  };

  const cowEl = () =>
    rootRef.current?.querySelector<HTMLElement>("[data-contact-accessory]") ??
    null;

  const measure = useCallback((): Geo | null => {
    const root = rootRef.current;
    const button = buttonRef.current;
    const stage = stageRef.current;
    const device = deviceRef.current;
    const screen = screenRef.current;
    if (!root || !button || !stage || !device || !screen) return null;

    const rootW = root.clientWidth;
    const btn = relativeRect(button, root);

    // MagneticButton schiebt den Knopf per transform. Für die Tropfenquelle
    // zählt die Ruhelage — sonst hängt der Tropfen neben dem Knopf, während
    // der Magnet in die Mitte zurückläuft.
    let magnetY = 0;
    const magnet = button.parentElement;
    const raw = magnet ? getComputedStyle(magnet).transform : "none";
    if (raw && raw !== "none") {
      magnetY = new DOMMatrixReadOnly(raw).m42;
    }

    // Der Gerätekasten liegt auch bei Bühnenhöhe 0 im Layout — overflow:hidden
    // schneidet nur die Darstellung, nicht die Box. Deshalb sind Breite, Höhe
    // und Bildschirmfeld schon vor dem Öffnen exakt messbar, statt aus der
    // Viewportbreite nachgerechnet zu werden.
    const dev = relativeRect(device, root);
    const scr = relativeRect(screen, root);
    const mt = parseFloat(getComputedStyle(stage).marginTop) || 0;

    const dw = dev.width;

    return {
      rootW,
      cx: rootW / 2,
      btnW: btn.width,
      btnBottom: btn.y - magnetY + btn.height,
      devX: dev.x,
      devTop: dev.y - mt,
      dw,
      dh: dev.height,
      screenX: scr.x,
      screenTop: scr.y - mt,
      screenW: scr.width,
      screenH: scr.height,
      gap: DROP_GAP[variant],
      corner: dw * CORNER_RATIO[variant],
      dropR: Math.max(12, Math.min(18, dw * 0.03)),
    };
  }, [variant]);

  const hideFx = () => {
    const fx = fxRef.current;
    if (fx) fx.style.display = "none";
    const dev = deviceRef.current;
    if (dev) dev.style.clipPath = "";
  };

  const scrollToSection = useCallback(() => {
    const target = document.getElementById("contact");
    if (!target) return;
    // Lenis fährt den Rest der Seite; ein paralleles scrollIntoView würde
    // dagegenhalten und ruckeln.
    const lenis = (window as unknown as Record<string, unknown>).__lenis as
      | { scrollTo: (t: Element, o?: Record<string, unknown>) => void }
      | undefined;
    if (lenis) lenis.scrollTo(target, { duration: 0.9 });
    else
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
  }, [prefersReducedMotion]);

  const openForm = useCallback(async () => {
    if (animatingRef.current || openRef.current) return;
    const root = rootRef.current;
    const stage = stageRef.current;
    const device = deviceRef.current;
    const fx = fxRef.current;
    if (!root || !stage || !device || !fx) return;

    killTimeline();
    setAnimating(true);
    setOpen(true);
    setStatus("idle");

    scrollToSection();

    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const geo = measure();
    if (!geo) {
      setAnimating(false);
      return;
    }

    const cow = cowEl();
    // Unter sm ist die Kuh ein Flex-Kind (position: relative) und hält Platz
    // im Layout — ihre Breite muss mitschrumpfen, sonst steht der Knopf schief
    // unter dem Tropfen. Ab sm hängt sie absolut daneben und kostet nichts.
    const cowInline = cow
      ? getComputedStyle(cow).position !== "absolute"
      : false;
    if (cow && cowInline && !cowWidthRef.current) {
      cowWidthRef.current = cow.getBoundingClientRect().width;
    }

    if (prefersReducedMotion) {
      gsap.set(stage, { height: geo.dh, marginTop: geo.gap });
      if (cow) gsap.set(cow, cowInline ? { opacity: 0, width: 0 } : { opacity: 0 });
      hideFx();
      firstFieldRef.current?.focus({ preventScroll: true });
      setAnimating(false);
      ScrollTrigger.refresh();
      return;
    }

    fx.style.width = `${geo.rootW}px`;
    fx.style.height = `${geo.devTop + geo.gap + geo.dh + 48}px`;
    fx.style.display = "block";

    const devY = geo.devTop + geo.gap;
    const r = geo.dropR;
    const neck0 = Math.min(geo.btnW * 0.13, r * 1.6);
    const hangTop = geo.btnBottom - 2;

    // Ein Zustandsobjekt für alles, was Layout und Pfütze gemeinsam haben:
    // sobald der Bühnenrand mitwandert, müssen Rechteck und Gerätekasten aus
    // DERSELBEN Zahl gezeichnet werden, sonst schiebt sich das Gerät unter der
    // Pfütze hervor.
    const view = { mt: 0, w: r * 3.4, h: 0 };
    const paint = () => {
      stage.style.marginTop = `${view.mt}px`;
      stage.style.height = `${view.h}px`;
      const side = (geo.dw - view.w) / 2;
      const rad = Math.min(geo.corner, view.w / 2, view.h / 2);
      setAttrs(poolRef.current, {
        x: geo.devX + side,
        y: geo.devTop + view.mt,
        width: Math.max(0, view.w),
        height: Math.max(0, view.h),
        rx: rad,
        ry: rad,
      });
      device.style.clipPath = `inset(0px ${side}px ${Math.max(
        0,
        geo.dh - view.h,
      )}px ${side}px round ${rad}px)`;
    };

    const pend = { cy: hangTop + 1, r: 1, neck: neck0 };
    const drawPendant = () => {
      setAttrs(pendantRef.current, {
        d: pendantPath(geo.cx, hangTop, pend.cy, pend.r, pend.neck),
      });
    };

    const rebound = { v: 0 };
    const drawRebound = () => {
      setAttrs(reboundRef.current, {
        cx: geo.cx,
        cy: geo.btnBottom - 1,
        rx: geo.btnW * 0.085,
        ry: Math.max(0, rebound.v),
      });
    };

    gsap.set(pendantRef.current, { display: "block", fill: INK });
    gsap.set([beadRef.current, poolRef.current], { display: "none" });
    gsap.set(reboundRef.current, { display: "block", fill: INK });
    gsap.set(poolRef.current, { fill: INK, opacity: 1 });
    gsap.set([shutterTopRef.current, shutterBotRef.current], {
      display: "none",
    });
    splashRefs.current.forEach((c) =>
      gsap.set(c, { display: "none", opacity: 1 }),
    );
    drawPendant();
    drawRebound();
    paint();

    const T_SWELL = 0.24;
    const T_NECK = 0.46;
    const T_PINCH = 0.62;
    const T_HIT = 0.88;
    const T_SETTLE = 1.34;

    const tl = gsap.timeline({
      onComplete: () => {
        hideFx();
        stage.style.height = "";
        firstFieldRef.current?.focus({ preventScroll: true });
        setAnimating(false);
        tlRef.current = null;
        ScrollTrigger.refresh();
      },
    });

    // --- Kuh tritt ab -----------------------------------------------------
    if (cow) {
      tl.to(
        cow,
        {
          rotate: 8,
          duration: 0.12,
          ease: "power2.out",
          transformOrigin: cowInline ? "100% 100%" : "50% 100%",
        },
        0,
      );
      tl.to(
        cow,
        {
          rotate: -20,
          yPercent: 12,
          scale: 0.45,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        0.12,
      );
      if (cowInline) {
        tl.to(cow, { width: 0, duration: 0.34, ease: "power2.inOut" }, 0.1);
      }
    }

    // --- Tropfen quillt aus der Knopfunterkante ----------------------------
    tl.to(
      pend,
      {
        cy: hangTop + r * 1.15,
        r,
        neck: neck0 * 0.82,
        duration: 0.22,
        ease: "power1.out",
        onUpdate: drawPendant,
      },
      T_SWELL,
    );

    // --- Hals wird lang und dünn ------------------------------------------
    tl.to(
      pend,
      {
        cy: hangTop + geo.gap * 0.36,
        neck: 1.2,
        duration: T_PINCH - T_NECK,
        ease: "power1.in",
        onUpdate: drawPendant,
      },
      T_NECK,
    );

    // --- Abriss: Pfad raus, freie Ellipse rein, Rest schnellt zurück -------
    tl.add(() => {
      gsap.set(pendantRef.current, { display: "none" });
      gsap.set(beadRef.current, { display: "block", fill: INK });
      setAttrs(beadRef.current, {
        cx: geo.cx,
        cy: pend.cy,
        rx: r * 0.84,
        ry: r * 1.2,
      });
      rebound.v = r * 0.55;
      drawRebound();
      gsap.to(rebound, {
        v: 0,
        duration: 0.55,
        ease: "elastic.out(1, 0.42)",
        onUpdate: drawRebound,
      });
    }, T_PINCH);

    // --- Freier Fall: beschleunigt und streckt sich -----------------------
    tl.to(
      beadRef.current,
      {
        attr: { cy: devY + r * 0.3, rx: r * 0.74, ry: r * 1.5 },
        duration: T_HIT - T_PINCH,
        ease: "power2.in",
      },
      T_PINCH,
    );

    // --- Aufschlag: platt schlagen, dann in der Pfütze aufgehen ------------
    tl.to(
      beadRef.current,
      {
        attr: { cy: devY + r * 0.4, rx: r * 2.3, ry: r * 0.42 },
        duration: 0.07,
        ease: "power3.out",
      },
      T_HIT,
    );
    tl.to(
      beadRef.current,
      {
        attr: { rx: r * 2.6, ry: 0.1 },
        duration: 0.2,
        ease: "power2.in",
      },
      T_HIT + 0.08,
    );
    tl.set(beadRef.current, { display: "none" }, T_HIT + 0.28);

    // --- Spritzer ---------------------------------------------------------
    const spreadX = r * 3.8;
    const riseY = r * 2.1;
    SPLASH.forEach((s, i) => {
      const c = splashRefs.current[i];
      if (!c) return;
      const at = T_HIT + s.delay;
      tl.set(
        c,
        {
          display: "block",
          opacity: 1,
          fill: INK,
          attr: { cx: geo.cx, cy: devY + r * 0.3, r: r * s.size },
        },
        at,
      );
      tl.to(
        c,
        {
          attr: { cx: geo.cx + s.dx * spreadX },
          duration: 0.44,
          ease: "power1.out",
        },
        at,
      );
      tl.to(
        c,
        {
          attr: { cy: devY - s.rise * riseY },
          duration: 0.17,
          ease: "power2.out",
        },
        at,
      );
      tl.to(
        c,
        {
          attr: { cy: devY + r * 0.8 },
          duration: 0.27,
          ease: "power2.in",
        },
        at + 0.17,
      );
      tl.to(c, { attr: { r: 0 }, duration: 0.16, ease: "power2.in" }, at + 0.28);
      tl.set(c, { display: "none" }, at + 0.45);
    });

    // --- Layout macht Platz, während der Tropfen fällt ---------------------
    tl.to(
      view,
      {
        mt: geo.gap,
        duration: T_HIT - T_NECK,
        ease: "power2.inOut",
        onUpdate: paint,
      },
      T_NECK,
    );

    // --- Pfütze läuft breit, dann tief; wird dabei zum Rahmenton ----------
    tl.set(poolRef.current, { display: "block" }, T_HIT);
    tl.to(
      view,
      { w: geo.dw, duration: 0.32, ease: "power3.out", onUpdate: paint },
      T_HIT,
    );
    tl.to(
      view,
      { h: geo.dh, duration: 0.44, ease: "power2.inOut", onUpdate: paint },
      T_HIT + 0.02,
    );
    tl.to(poolRef.current, { fill: BEZEL, duration: 0.3 }, T_HIT + 0.04);

    // --- Rahmen übernehmen, Bildschirm geht an ----------------------------
    const scrY = geo.screenTop + geo.gap;
    tl.set(
      shutterTopRef.current,
      {
        display: "block",
        fill: BEZEL,
        attr: {
          x: geo.screenX,
          y: scrY,
          width: geo.screenW,
          height: geo.screenH / 2,
        },
      },
      T_SETTLE,
    );
    tl.set(
      shutterBotRef.current,
      {
        display: "block",
        fill: BEZEL,
        attr: {
          x: geo.screenX,
          y: scrY + geo.screenH / 2,
          width: geo.screenW,
          height: geo.screenH / 2,
        },
      },
      T_SETTLE,
    );
    // Kurze Blende statt harter Schnitt: die Geometrie stimmt, aber der echte
    // Rahmen bringt seine Tastennoppen mit, und die sollen nicht aufpoppen.
    tl.to(poolRef.current, { opacity: 0, duration: 0.14 }, T_SETTLE);
    tl.set(
      poolRef.current,
      { display: "none", opacity: 1 },
      T_SETTLE + 0.14,
    );
    tl.add(() => {
      device.style.clipPath = "";
    }, T_SETTLE + 0.14);

    tl.to(
      shutterTopRef.current,
      { attr: { height: 0 }, duration: 0.36, ease: "power3.inOut" },
      T_SETTLE + 0.06,
    );
    tl.to(
      shutterBotRef.current,
      {
        attr: { y: scrY + geo.screenH, height: 0 },
        duration: 0.36,
        ease: "power3.inOut",
      },
      T_SETTLE + 0.06,
    );
    tl.set(
      [shutterTopRef.current, shutterBotRef.current],
      { display: "none" },
      T_SETTLE + 0.42,
    );

    tlRef.current = tl;
  }, [measure, prefersReducedMotion, scrollToSection]);

  const closeForm = useCallback(async () => {
    if (animatingRef.current || !openRef.current) return;
    const root = rootRef.current;
    const stage = stageRef.current;
    const device = deviceRef.current;
    const fx = fxRef.current;
    if (!root || !stage || !device || !fx) return;

    killTimeline();
    setAnimating(true);

    const cow = cowEl();
    const cowInline = cow
      ? getComputedStyle(cow).position !== "absolute" && cowWidthRef.current > 0
      : false;

    if (prefersReducedMotion) {
      gsap.set(stage, { height: 0, marginTop: 0 });
      if (cow) gsap.set(cow, { clearProps: "width,opacity,transform" });
      hideFx();
      setOpen(false);
      setStatus("idle");
      setAnimating(false);
      ScrollTrigger.refresh();
      return;
    }

    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const geo = measure();
    if (!geo) {
      setAnimating(false);
      return;
    }

    fx.style.width = `${geo.rootW}px`;
    fx.style.height = `${geo.devTop + geo.gap + geo.dh + 48}px`;
    fx.style.display = "block";

    const r = geo.dropR;
    const scrY = geo.screenTop + geo.gap;
    const hangTop = geo.btnBottom - 2;

    const view = { mt: geo.gap, w: geo.dw, h: geo.dh };
    const paint = () => {
      stage.style.marginTop = `${view.mt}px`;
      stage.style.height = `${view.h}px`;
      const side = (geo.dw - view.w) / 2;
      const rad = Math.min(geo.corner, view.w / 2, view.h / 2);
      setAttrs(poolRef.current, {
        x: geo.devX + side,
        y: geo.devTop + view.mt,
        width: Math.max(0, view.w),
        height: Math.max(0, view.h),
        rx: rad,
        ry: rad,
      });
      device.style.clipPath = `inset(0px ${side}px ${Math.max(
        0,
        geo.dh - view.h,
      )}px ${side}px round ${rad}px)`;
    };

    const pend = { cy: hangTop + r * 1.4, r, neck: 1.2 };
    const drawPendant = () => {
      setAttrs(pendantRef.current, {
        d: pendantPath(geo.cx, hangTop, pend.cy, pend.r, pend.neck),
      });
    };

    gsap.set([pendantRef.current, beadRef.current, poolRef.current], {
      display: "none",
    });
    gsap.set(reboundRef.current, { display: "none" });
    splashRefs.current.forEach((c) => gsap.set(c, { display: "none" }));

    // Bildschirm geht aus: die beiden Blenden fahren aus den Kanten zur Mitte.
    gsap.set([shutterTopRef.current, shutterBotRef.current], {
      display: "block",
      fill: BEZEL,
      opacity: 1,
    });
    setAttrs(shutterTopRef.current, {
      x: geo.screenX,
      y: scrY,
      width: geo.screenW,
      height: 0,
    });
    setAttrs(shutterBotRef.current, {
      x: geo.screenX,
      y: scrY + geo.screenH,
      width: geo.screenW,
      height: 0,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        hideFx();
        stage.style.height = "";
        gsap.set(stage, { height: 0, marginTop: 0 });
        setOpen(false);
        setStatus("idle");
        setAnimating(false);
        tlRef.current = null;
        ScrollTrigger.refresh();
      },
    });

    tl.to(
      shutterTopRef.current,
      { attr: { height: geo.screenH / 2 }, duration: 0.3, ease: "power3.inOut" },
      0,
    );
    tl.to(
      shutterBotRef.current,
      {
        attr: { y: scrY + geo.screenH / 2, height: geo.screenH / 2 },
        duration: 0.3,
        ease: "power3.inOut",
      },
      0,
    );

    // Rahmen an die Pfütze zurückgeben.
    tl.add(() => {
      gsap.set(poolRef.current, { display: "block", fill: BEZEL, opacity: 1 });
      paint();
      gsap.set([shutterTopRef.current, shutterBotRef.current], {
        display: "none",
      });
    }, 0.3);

    tl.to(
      view,
      { h: 0, duration: 0.44, ease: "power2.inOut", onUpdate: paint },
      0.34,
    );
    tl.to(
      view,
      { w: r * 3.2, duration: 0.36, ease: "power2.in", onUpdate: paint },
      0.42,
    );
    tl.to(poolRef.current, { fill: INK, duration: 0.3 }, 0.4);
    tl.to(
      view,
      { mt: 0, duration: 0.4, ease: "power2.inOut", onUpdate: paint },
      0.52,
    );

    // Der Rest sammelt sich zum Tropfen und steigt in den Knopf zurück.
    tl.add(() => {
      gsap.set(poolRef.current, { display: "none" });
      gsap.set(beadRef.current, { display: "block", fill: INK });
      setAttrs(beadRef.current, {
        cx: geo.cx,
        cy: geo.devTop + view.mt + r * 0.4,
        rx: r * 1.5,
        ry: r * 0.5,
      });
    }, 0.76);
    tl.to(
      beadRef.current,
      {
        attr: { rx: r * 0.82, ry: r * 1.3 },
        duration: 0.16,
        ease: "power2.out",
      },
      0.76,
    );
    tl.to(
      beadRef.current,
      {
        attr: { cy: hangTop + r * 1.4 },
        duration: 0.32,
        ease: "power2.out",
      },
      0.8,
    );

    tl.add(() => {
      gsap.set(beadRef.current, { display: "none" });
      gsap.set(pendantRef.current, { display: "block", fill: INK });
      drawPendant();
    }, 1.12);
    tl.to(
      pend,
      {
        cy: hangTop + 1,
        r: 1,
        neck: Math.min(geo.btnW * 0.13, r * 1.6),
        duration: 0.2,
        ease: "power2.in",
        onUpdate: drawPendant,
      },
      1.12,
    );

    // --- Kuh kommt zurück -------------------------------------------------
    if (cow) {
      if (cowInline) {
        tl.to(
          cow,
          { width: cowWidthRef.current, duration: 0.36, ease: "power2.out" },
          0.86,
        );
      }
      tl.to(
        cow,
        {
          opacity: 1,
          rotate: 0,
          yPercent: 0,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
        0.9,
      );
      // Alles inline Gesetzte wieder abgeben: ab sm liegt der vertikale
      // Versatz der Kuh in einer Tailwind-Klasse (-translate-y-[48%]), und die
      // greift nur, solange kein Inline-transform darüber liegt.
      tl.set(cow, { clearProps: "width,opacity,transform,transformOrigin" }, 1.4);
    }

    tlRef.current = tl;
  }, [measure, prefersReducedMotion]);

  const toggle = () => {
    if (animatingRef.current) return;
    if (open) void closeForm();
    else void openForm();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    setStatus("submitting");
    window.setTimeout(() => {
      setStatus("success");
      form.reset();
    }, 600);
  };

  const fieldClass = variant === "ipad" ? FIELD_PAD : FIELD_PHONE;
  const labelClass = variant === "ipad" ? LABEL_PAD : LABEL_PHONE;
  const stageMax =
    variant === "ipad" ? "max-w-[min(720px,92vw)]" : "max-w-[min(280px,85vw)]";

  return (
    <div ref={rootRef} className="relative flex w-full flex-col items-center">
      <div className="relative flex w-full items-center justify-center">
        {leadingAccessory}
        <MagneticButton strength={open || animating ? 0 : 0.3}>
          <button
            ref={buttonRef}
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-busy={animating}
            aria-controls="contact-drop-panel"
            className="inline-flex items-center gap-3 px-8 py-5 text-body-md font-display font-bold tracking-tight rounded-full transition-colors duration-500 ease-out-expo group sm:px-10"
            style={{
              backgroundColor: "#0a0a0a",
              color: "#f0ede8",
            }}
          >
            {open ? "Schließen" : "Projekt starten"}
            <span
              className={cn(
                "inline-block transition-transform duration-500 ease-out-expo",
                !open && "group-hover:translate-x-1",
                open && "rotate-90",
              )}
            >
              {open ? "×" : "→"}
            </span>
          </button>
        </MagneticButton>
      </div>

      <div
        id="contact-drop-panel"
        ref={stageRef}
        className={cn("relative mx-auto w-full overflow-hidden", stageMax)}
        aria-hidden={!open}
        inert={!open && !animating ? true : undefined}
      >
        <div ref={deviceRef} className="relative z-10 mx-auto">
          <DeviceBezel variant={variant} screenRef={screenRef}>
            <div
              className={cn(
                "flex h-full flex-col",
                variant === "ipad"
                  ? "px-6 pb-5 pt-6 md:px-8"
                  : "px-3 pb-3 pt-7",
              )}
            >
              <p
                className={cn(
                  "text-center font-display font-bold tracking-tight text-[#0a0a0a]",
                  variant === "ipad"
                    ? "mb-4 text-[18px]"
                    : "mb-3 text-[13px]",
                )}
              >
                Kontakt
              </p>

              {status === "success" ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-2 text-center">
                  <p
                    className={cn(
                      "font-display font-bold tracking-tight text-[#0a0a0a]",
                      variant === "ipad" ? "text-[20px]" : "text-[15px]",
                    )}
                  >
                    Danke — ich melde mich.
                  </p>
                  <p
                    className={cn(
                      "leading-snug text-[#6a6a6a]",
                      variant === "ipad" ? "text-[13px]" : "text-[11px]",
                    )}
                  >
                    Deine Nachricht ist angekommen.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className={cn(
                      "mt-3 rounded-full bg-[#0a0a0a] font-display font-bold text-[#f0ede8]",
                      variant === "ipad"
                        ? "px-5 py-2.5 text-[13px]"
                        : "px-4 py-2 text-[11px]",
                    )}
                  >
                    Neue Nachricht
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className={cn(
                    "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
                    variant === "ipad" ? "gap-3" : "gap-2",
                  )}
                >
                  <label className="block">
                    <span className={labelClass}>Vorname *</span>
                    <input
                      ref={firstFieldRef}
                      name="vorname"
                      type="text"
                      required
                      autoComplete="given-name"
                      className={fieldClass}
                      disabled={!open || animating}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Nachname *</span>
                    <input
                      name="nachname"
                      type="text"
                      required
                      autoComplete="family-name"
                      className={fieldClass}
                      disabled={!open || animating}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>E-Mail-Adresse *</span>
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={fieldClass}
                      disabled={!open || animating}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Betreff *</span>
                    <input
                      name="betreff"
                      type="text"
                      required
                      className={fieldClass}
                      disabled={!open || animating}
                    />
                  </label>
                  <label className="flex min-h-0 flex-1 flex-col">
                    <span className={labelClass}>Nachricht</span>
                    <textarea
                      name="nachricht"
                      rows={variant === "ipad" ? 4 : 3}
                      className={cn(
                        fieldClass,
                        variant === "ipad"
                          ? "min-h-[5.5rem] flex-1 resize-none"
                          : "min-h-[4.5rem] flex-1 resize-none",
                      )}
                      disabled={!open || animating}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!open || animating || status === "submitting"}
                    className={cn(
                      "mt-1 w-full rounded-full bg-[#0a0a0a] font-display font-bold tracking-tight text-[#f0ede8] transition-opacity disabled:opacity-60",
                      variant === "ipad"
                        ? "py-3 text-[14px]"
                        : "py-2.5 text-[12px]",
                    )}
                  >
                    {status === "submitting" ? "Senden…" : "Senden"}
                  </button>
                </form>
              )}
            </div>
          </DeviceBezel>
        </div>
      </div>

      {/* Tropfenbühne. Absolut, ohne Layoutwirkung, overflow sichtbar — die
          Spritzer verlassen den Kasten nach oben und zur Seite. */}
      <svg
        ref={fxRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-30"
        style={{ display: "none", overflow: "visible" }}
      >
        <rect ref={poolRef} fill={INK} />
        <path ref={pendantRef} fill={INK} />
        <ellipse ref={reboundRef} fill={INK} />
        <ellipse ref={beadRef} fill={INK} />
        {SPLASH.map((_, i) => (
          <circle
            key={i}
            ref={(el) => {
              splashRefs.current[i] = el;
            }}
            fill={INK}
          />
        ))}
        <rect ref={shutterTopRef} fill={BEZEL} />
        <rect ref={shutterBotRef} fill={BEZEL} />
      </svg>
    </div>
  );
}
