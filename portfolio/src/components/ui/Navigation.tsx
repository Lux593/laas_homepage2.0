"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { NAV_ITEMS } from "@/lib/constants";

/**
 * Nur der Teil der Lenis-Instanz, den der Scroll-Lock braucht. SmoothScroll
 * legt sie ab 768px unter `window.__lenis` ab; unter 768px existiert sie nicht.
 */
type ScrollDriver = { stop: () => void; start: () => void };

/** Erst ab hier darf die Leiste weichen — darüber steht der Hero-Kopf. */
const HIDE_AFTER_PX = 120;

/** Zittern am Finger soll die Leiste nicht auf und ab schalten. */
const HIDE_DELTA_PX = 8;

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  /** Der Einflug fährt dieselbe Box — vorher darf nichts anderes daran ziehen. */
  const entryDoneRef = useRef(false);

  useEffect(() => {
    if (!navRef.current) return;
    const tween = gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.65,
        ease: "expo.out",
        onComplete: () => {
          entryDoneRef.current = true;
        },
      }
    );
    return () => { tween.kill(); };
  }, []);

  // Die Leiste fährt beim Abwärtsscrollen weg und beim Aufwärtsscrollen zurück.
  //
  // Das ersetzt den Schleier, der vorher unter der Leiste lag: mobil zieht der
  // Seiteninhalt in derselben Farbe unter ihr durch — gemessen deckte
  // „VON VORNE ANFANGEN" die weisse Wortmarke auf voller Breite. Der Schleier
  // löste das mit einem Verlauf, stand über hellen Sections aber als
  // cremefarbene Blende quer im Bild. Weicht die Leiste stattdessen, gibt es
  // gar keine Überlagerung mehr, die zu kaschieren wäre.
  //
  // `yPercent` statt `y`: der Einflug oben benutzt `y`, GSAP hält beide
  // getrennt und rechnet sie in dieselbe transform. Die zwei Bewegungen können
  // sich damit nicht gegenseitig überschreiben.
  //
  // Gilt auf ALLEN Breiten, auf Ansage — die eine bewusste Ausnahme von der
  // eingefrorenen Desktop-Ansicht. Die Leiste selbst ist dort unverändert;
  // sie fährt nur beim Abwärtsscrollen aus dem Bild.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let visible = true;
    let lastY = window.scrollY;

    const setVisible = (next: boolean) => {
      if (next === visible) return;
      visible = next;
      gsap.to(el, {
        yPercent: next ? 0 : -100,
        // Bei reduzierter Bewegung schaltet die Leiste ohne Fahrt um. Die
        // Trennung bleibt, die Animation entfällt.
        duration: reduced.matches ? 0 : 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      // Menü offen: die Leiste trägt den Schliessknopf und bleibt. Solange der
      // Einflug läuft, gehört die transform ihm allein.
      if (isMenuOpen || !entryDoneRef.current) {
        lastY = y;
        setVisible(true);
        return;
      }
      if (Math.abs(delta) < HIDE_DELTA_PX) return;
      lastY = y;
      setVisible(delta < 0 || y < HIDE_AFTER_PX);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      gsap.set(el, { yPercent: 0 });
    };
  }, [isMenuOpen]);

  // Scroll-Lock, solange das Menü offen ist. Vorher wanderte der Hintergrund
  // hinter dem offenen Menü pro Radschritt weiter: scrollY 600 → 1000 auf
  // 393x852, 600 → 732 auf 820x1180.
  //
  // Zwei Sperren, weil zwei Scroll-Ebenen übereinander laufen. Unter 768px
  // existiert keine Lenis-Instanz, dort trägt allein das preventDefault. Ab
  // 768px liest Lenis sein Rad-Delta selbst und ignoriert, dass das Event
  // schon abgewehrt ist — mit preventDefault, aber ohne stop() gemessen: 600 →
  // 732 auf 820x1180 und 600 → 799 auf 1440x900, also unverändert undicht.
  // Erst beide zusammen halten alle fünf Profile bei 600.
  //
  // Rad und Finger abzufangen lässt Layout und Scrollposition unangetastet:
  // nach dem Schliessen steht die Seite gemessen wieder bei genau 600, weil
  // die Position nie verändert wurde. Ein Umschalten von `overflow` oder ein
  // fixierter Body müsste sie erst wegnehmen und danach zurückrechnen.
  useEffect(() => {
    if (!isMenuOpen) return;
    const lenis = (window as unknown as { __lenis?: ScrollDriver }).__lenis;
    lenis?.stop();
    const block = (event: Event) => event.preventDefault();
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    return () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      lenis?.start();
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Nav Bar */}
      <div
        ref={navRef}
        // The overlay is dark and sits *below* the nav, so force dark chrome while
        // the menu is open — otherwise the logo goes dark-on-dark over cream sections.
        data-ui-theme={isMenuOpen ? "dark" : undefined}
        // Die Leiste selbst fängt keine Zeiger mehr ab. Gemessen traf
        // elementFromPoint auf 393x852 über das ganze 393x104-Band dieses div —
        // auch dort, wo nichts zu sehen war: die 32px leeres pb-8 schluckten
        // Taps auf Akkordeon-Trigger und Links darunter. Logo und Knopf holen
        // sich die Zeiger einzeln zurück.
        className="pointer-events-none fixed top-0 left-0 right-0 z-[var(--z-nav)] opacity-0"
      >
        {/* Safe-Area: das Layout läuft mit viewportFit "cover", die feste Leiste
            säße im Querformat sonst unter dem Notch. Ohne Notch sind die
            env()-Werte 0.

            Mobil auf --container-padding statt 3rem: die Leiste stand auf 48px
            Achse, jeder Inhaltscontainer auf 24px. Die Wortmarke saß damit 24px
            RECHTS der Textkante — Überschriften liefen nicht neben ihr vorbei,
            sondern hinter ihr durch (gemessen: „WINTERSPORT VERLEIH SYSTEM"
            deckte sie auf voller Breite). Jetzt fluchten die Achsen bei jeder
            Breite unter 1024px.

            Höhe: 10 + 44 + 10 = 64px statt 104px. Von den alten 104 waren 56
            reines Padding. Der lg-Zweig stellt 24/56/32 = 112px wieder her —
            byte-identisch zu vorher, der Desktop ist eingefroren. */}
        <div className="pointer-events-none relative flex w-full items-center justify-between pt-[max(0.625rem,env(safe-area-inset-top))] pr-[max(var(--container-padding),env(safe-area-inset-right))] pb-2.5 pl-[max(var(--container-padding),env(safe-area-inset-left))] lg:pt-[max(1.5rem,env(safe-area-inset-top))] lg:pr-[max(3rem,env(safe-area-inset-right))] lg:pb-8 lg:pl-[max(3rem,env(safe-area-inset-left))]">
          {/* Logo — `-m-3 p-3` vergrößert allein die Trefferfläche: die
              Polsterung wächst um 12px pro Seite, der negative Aussenabstand
              zieht sie wieder heraus, das Bild bleibt auf den Pixel dort, wo es
              war. Bei 18px Wortmarke trüge die Polsterung allein nur noch 42px,
              deshalb das min-h: die fehlenden 2px verteilt die zentrierte Zeile
              gleichmässig, das Bild bleibt stehen, die Trefferfläche misst
              wieder 44. Ab 768px sind 24 + 24 = 48px ohnehin darüber, dort ist
              das min-h wirkungslos und der Desktop unverändert.
              Mobil 18px statt 20px: unter 768px zieht die Wortmarke mit ein,
              ab 768px bleibt md:h-6 unverändert und der Desktop damit auch. */}
          <a
            href="#"
            className="pointer-events-auto relative -m-3 flex min-h-[2.75rem] shrink-0 items-center p-3"
          >
            <Image
              src="/laas-logo.svg"
              alt="LAAS – Luca As A Service"
              width={200}
              height={54}
              className="nav-logo h-[1.125rem] w-auto md:h-6"
              priority
            />
          </a>

          {/* Menu Button — mobil 44x44 statt 48x48: das ist genau die
              Mindest-Trefferfläche, tiefer geht es nicht. Die Balken werden
              28px breit, der Abstand von 8px bleibt, weil die X-Animation mit
              y: ±6 auf ihn gerechnet ist. Ab 768px unverändert 56x56/36px. */}
          <button
            className="pointer-events-auto relative flex shrink-0 flex-col justify-center items-center gap-2 w-11 h-11 md:w-14 md:h-14"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Navigationsmenü umschalten"
            aria-expanded={isMenuOpen}
          >
            <motion.span
              className="w-7 h-[2px] md:w-9 block bg-[var(--ui-fg)] transition-colors duration-300"
              animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="w-7 h-[2px] md:w-9 block bg-[var(--ui-fg)] transition-colors duration-300"
              animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </div>

      {/* Fullscreen Menu Overlay — outside nav to avoid transform inheritance */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[calc(var(--z-nav)-1)] bg-bg-primary/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8 text-center"
            initial={{ clipPath: "circle(0% at calc(100% - 2.25rem) 2.75rem)" }}
            animate={{ clipPath: "circle(150% at 50% 50%)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.25rem) 2.75rem)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                // 44px Trefferfläche, ohne an der Schrift zu drehen. Die
                // Zeilenbox allein trägt max(36px, 4.5vw) — 1.5 Zeilenhöhe mal
                // --text-display-sm, clamp(1.5rem, 3vw, 3rem) — und bleibt
                // damit unter 978px Fensterbreite unter dem Mass: gemessen
                // 36px bei 320 und 393, 36.9px bei 820. Ab 1024px sind es
                // schon 46.1px und bei 1440px 64.8px — dort bleibt die
                // Mindesthöhe wirkungslos, der Desktop ändert sich nicht.
                // `flex` statt blossem min-h, weil die dazugewonnenen 7-8px
                // sonst unter der Schrift hingen statt sie zu fassen.
                className="flex min-h-[44px] items-center justify-center text-display-sm font-display font-bold tracking-tighter hover:text-accent-primary transition-colors duration-300"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
