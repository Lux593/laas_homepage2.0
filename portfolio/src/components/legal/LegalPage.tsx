"use client";

import { useEffect, useState } from "react";

import LegalSection, {
  type LegalSectionData,
} from "@/components/legal/LegalSection";
import Navigation from "@/components/ui/Navigation";
import ScrollProgress from "@/components/ui/ScrollProgress";
import TextReveal from "@/components/ui/TextReveal";
import { useLightChrome } from "@/hooks/useLightChrome";
import { type Locale, localizePath } from "@/lib/i18n/locales";
import type { LegalChrome, LegalLink, NavCopy } from "@/lib/i18n/types";
import type { LegalSlug } from "@/lib/legal";

/** 01, 02, … — dieselbe zweistellige Marke wie in SERVICE_ASSETS und im Projektzähler. */
const mark = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Die geteilte Hülle aller Rechtsseiten und der Fehlerseite.
 *
 * Client-Component, weil sie Client-Dinge braucht: useLightChrome (die feste
 * Leiste muss über der Cremefläche dunkel schreiben), TextReveal (GSAP) und
 * den Scroll-Spy fürs Inhaltsverzeichnis. Die Routen-Dateien darüber bleiben
 * Server-Components und behalten damit ihre `metadata` — die SEO-Angaben
 * werden serverseitig gerendert. Ihre Texte bekommt sie fertig von LegalShell.
 */
export default function LegalPage({
  locale,
  current,
  alternateHref,
  nav,
  chrome,
  legalLinks,
  updated,
  eyebrow = chrome.eyebrow,
  title,
  lede,
  showUpdated = true,
  sections,
  children,
}: {
  locale: Locale;
  /**
   * Welche Rechtsseite das ist — sie fällt aus der Fusszeile, die auf die
   * Geschwister zeigt. `null` auf der Fehlerseite: dort zeigt die Fusszeile
   * alle drei. Kommt als Prop statt aus dem Pfad im Browser, weil der Proxy
   * die deutschen Pfade intern umschreibt (siehe Navigation.tsx).
   */
  current: LegalSlug | null;
  /** Dieselbe Seite in der anderen Sprache (für den Sprachschalter). */
  alternateHref: string;
  nav: NavCopy;
  chrome: LegalChrome;
  /** Alle drei Rechtslinks, Pfade schon in der Sprache der Seite. */
  legalLinks: LegalLink[];
  /** Standdatum, fertig formatiert. */
  updated: string;
  /** Fehlt er, steht `chrome.eyebrow` („Rechtliches"). */
  eyebrow?: string;
  title: string;
  lede: string;
  /** Die Fehlerseite trägt kein Standdatum — sie ist kein Dokument. */
  showUpdated?: boolean;
  /**
   * Die Kapitel des Dokuments. Sie kommen als Daten und nicht als Kinder
   * herein, weil sie zweimal gebraucht werden: einmal als Text, einmal als
   * Inhaltsverzeichnis. Aus einer Liste gerendert können die beiden nicht
   * auseinanderlaufen, und die Nummerierung ergibt sich aus der Reihenfolge.
   */
  sections?: LegalSectionData[];
  /** Freier Inhalt statt Kapiteln — die Fehlerseite nutzt das. */
  children?: React.ReactNode;
}) {
  useLightChrome();
  const hasIndex = Boolean(sections && sections.length > 2);
  const [activeId, setActiveId] = useState<string | null>(
    sections?.[0]?.id ?? null,
  );

  // Welches Kapitel gerade unter der festen Leiste liegt — steuert die
  // Hervorhebung im sticky Verzeichnis. Die Leselinie liegt auf halber
  // Viewport-Höhe: eine obere Linie (wie 160px) wird von kurzen Schlusskapiteln
  // oft nie erreicht, weil die Seite nicht weit genug scrollt — dann springt
  // die Markierung vom vorvorletzten direkt auf den letzten Punkt. Auf der
  // Mitte kreuzt jede Überschrift die Linie, sobald sie im Lesefeld steht.
  useEffect(() => {
    if (!hasIndex || !sections?.length) return;

    type ScrollDriver = {
      on: (event: string, cb: () => void) => void;
      off: (event: string, cb: () => void) => void;
    };

    const update = () => {
      const line = window.innerHeight / 2;
      let current = sections[0].id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = section.id;
      }

      // Ganz am Anschlag: ein sehr kurzes letztes Kapitel kann seine Überschrift
      // nicht bis zur Mitte hochschaffen. Erst dann, nicht vorher, gewinnt es
      // fest — sonst würde der vorletzte Punkt übersprungen.
      const lastId = sections[sections.length - 1].id;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      if (current !== lastId && window.scrollY >= maxScroll - 1) {
        current = lastId;
      }

      setActiveId(current);
    };

    update();

    // Lenis ab 768px; darunter (und bei reduced-motion) nur native Scroll.
    const lenis = (window as unknown as { __lenis?: ScrollDriver }).__lenis;
    lenis?.on("scroll", update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      lenis?.off("scroll", update);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [hasIndex, sections]);

  return (
    // Der Grund liegt am <main> und nicht an einem inneren Kasten: die Seite
    // kann kürzer sein als das Fenster (Impressum auf einem grossen Schirm),
    // und dann stünde unter der Cremefläche der schwarze Seitengrund.
    // min-h-svh statt min-h-screen aus demselben Grund wie in GiganticCTA —
    // 100vh ist in Safari die grosse Ansicht und damit zu hoch.
    <main
      id="main-content"
      className="relative min-h-svh bg-[#f2ede4] text-[#0a0a0a]"
    >
      <ScrollProgress />
      <Navigation
        locale={locale}
        isHome={false}
        alternateHref={alternateHref}
        copy={nav}
      />

      {/* Oberer Abstand deckt die feste Leiste in beiden Ausbaustufen: sie misst
          mobil 64px und ab lg 112px (siehe Navigation.tsx). */}
      <div className="container-custom pt-[clamp(7rem,18svh,11rem)] pb-[clamp(4rem,10vh,8rem)]">
        {/* Zwei Spalten erst ab lg, und die zweite ist das Verzeichnis.
            Der Grund ist kein Schmuck: die Textspalte steht auf 68ch
            Lesebreite, auf einem 1440er Schirm blieb daneben die halbe Fläche
            leer. Ein 15 Kapitel langes Dokument braucht ohnehin einen
            Einstieg, der nicht Scrollen heisst.

            Das Verzeichnis trägt weiter unten `self-start`, und das ist die
            Bedingung fürs Kleben, nicht Kosmetik: gestreckt (der Standardfall
            im Raster) wäre die Box des Verzeichnisses genauso hoch wie ihr
            Rasterfeld und hätte darin keinen Weg zu fahren — sichtbar wäre
            gar nichts. Kurz gehalten bleibt das Feld hoch, die Box klein, und
            zwischen beiden liegt die Strecke. */}
        <div
          className={
            hasIndex
              ? "lg:grid lg:grid-cols-[minmax(0,68ch)_minmax(0,1fr)] lg:gap-x-[clamp(3rem,6vw,7rem)]"
              : undefined
          }
        >
          {/* 68ch statt der vollen 1440er Spine. Die Spine bleibt die Spine —
              der Kopf fluchtet mit jeder anderen Section der Seite —, aber
              Fliesstext über 90 Zeichen pro Zeile verliert beim Rücksprung die
              Zeile. */}
          <div className="max-w-[68ch]">
            <span className="block font-mono text-caption uppercase tracking-[0.2em] text-[#6a6a6a]">
              {eyebrow}
            </span>

            <TextReveal
              as="h1"
              variant="words"
              stagger={0.05}
              className="mt-3 font-display text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[0.95] tracking-tighter text-[#0a0a0a]"
            >
              {title}
            </TextReveal>

            <p className="mt-6 text-body-md leading-relaxed text-[#3a3a3a]">
              {lede}
            </p>

            {showUpdated && (
              <p className="mt-8 font-mono text-caption text-[#9a9a9a]">
                {chrome.updatedLabel} {updated}
              </p>
            )}

            {/* Nur auf übersetzten Rechtsseiten (das deutsche Wörterbuch hat
                keinen Hinweis, die Fehlerseite kein Dokument): verbindlich ist
                die deutsche Fassung, und der Weg dorthin steht vor dem ersten
                Kapitel, nicht erst in der Fusszeile. Bronze wie die
                Fill-Marken, Schrift aber dunkel — der Satz muss auf der
                Cremefläche lesbar sein, nicht nur auffallen. */}
            {chrome.translationNotice && current && (
              <div
                role="note"
                className="mt-8 border-l-2 border-[#A07850] bg-[#A07850]/10 py-4 pr-4 pl-5 md:py-5 md:pr-6 md:pl-6"
              >
                <p className="text-body-sm font-semibold leading-relaxed text-[#0a0a0a]">
                  {chrome.translationNotice.text}
                </p>
                <a
                  href={localizePath(`/${current}`, "de")}
                  hrefLang="de"
                  className="group mt-2 inline-flex items-center gap-2 font-mono text-caption uppercase tracking-widest text-[#3a3a3a] transition-colors duration-300 hover:text-[#0a0a0a] pointer-coarse:min-h-11"
                >
                  {/* Unterstrichen wird nur die Beschriftung: am Flex-Link
                      selbst ginge die Linie auch unter den Pfeil. */}
                  <span className="underline decoration-[#A07850]/60 underline-offset-4 transition-colors duration-300 group-hover:decoration-[#0a0a0a]">
                    {chrome.translationNotice.linkLabel}
                  </span>
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
                  >
                    →
                  </span>
                </a>
              </div>
            )}

            {sections?.map((section, i) => (
              <LegalSection
                key={section.id}
                mark={mark(i)}
                id={section.id}
                title={section.title}
              >
                {section.body}
              </LegalSection>
            ))}

            {children}

            {/* Fusszeile: zurück und quer zu den Geschwisterseiten. Sie spiegelt
                die Fusszeile der Kontaktkarte, von der man hierher kam —
                dieselbe Reihenfolge, dieselbe Mono-Anmutung.

                Bewusst <a> und nicht next/link, hier wie überall zwischen
                diesen Seiten und der Startseite. Lenis wird im Root-Layout
                einmal aufgesetzt (Effect mit leerer Abhängigkeitsliste) und
                überlebt eine Client-Navigation; die Startseite hängt ausserdem
                voller ScrollTrigger mit Pin-Spacern, deren Dokumenthöhe beim
                Wechsel stehen bliebe. Ein voller Seitenaufbau setzt beides
                sauber neu auf und kostet auf drei selten besuchten Seiten
                nichts. */}
            <div className="mt-20 flex flex-col gap-5 border-t border-[#0a0a0a]/10 pt-8 md:flex-row md:items-center md:justify-between">
              <a
                href={localizePath("/", locale)}
                className="group inline-flex items-center gap-2 font-mono text-caption uppercase tracking-widest text-[#6a6a6a] transition-colors duration-300 hover:text-[#0a0a0a] pointer-coarse:min-h-11"
              >
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-500 ease-out-expo group-hover:-translate-x-1"
                >
                  ←
                </span>
                {chrome.backHome}
              </a>

              <nav
                aria-label={chrome.moreLegal}
                className="flex flex-wrap items-center gap-x-5 gap-y-1 md:gap-x-8"
              >
                {legalLinks
                  .filter((link) => link.slug !== current)
                  .map((link) => (
                    <a
                      key={link.slug}
                      href={link.href}
                      className="inline-flex items-center font-mono text-caption uppercase tracking-widest text-[#9a9a9a] transition-colors duration-300 hover:text-[#0a0a0a] pointer-coarse:min-h-11"
                    >
                      {link.label}
                    </a>
                  ))}
              </nav>
            </div>
          </div>

          {/* Das Verzeichnis. Erst ab lg sichtbar — darunter gäbe es keine
              Spalte dafür, und eine ausklappbare Liste über dem Dokument wäre
              auf dem Telefon ein zweiter Scrollweg statt einer Abkürzung.
              aria-hidden bleibt es NICHT: es ist echte Navigation, nur eine, die
              erst ab einer Breite Platz hat. */}
          {hasIndex && sections && (
            <nav
              aria-label={chrome.tocLabel}
              className="hidden lg:sticky lg:top-[clamp(8rem,20vh,11rem)] lg:block lg:self-start"
            >
              <span className="block font-mono text-caption uppercase tracking-[0.2em] text-[#9a9a9a]">
                {chrome.tocHeading}
              </span>
              <ol className="mt-5 space-y-1">
                {sections.map((section, i) => {
                  const isActive = activeId === section.id;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        aria-current={isActive ? "location" : undefined}
                        className={
                          isActive
                            ? "group flex gap-3 py-1 text-body-sm font-semibold leading-snug text-[#0a0a0a] transition-colors duration-300"
                            : "group flex gap-3 py-1 text-body-sm leading-snug text-[#8a8278] transition-colors duration-300 hover:text-[#0a0a0a]"
                        }
                      >
                        <span
                          className={
                            isActive
                              ? "pt-[0.15em] font-display text-caption font-bold tracking-tighter tabular-nums text-[#A07850] transition-colors duration-300"
                              : "pt-[0.15em] font-display text-caption font-bold tracking-tighter tabular-nums text-[#c4bbb0] transition-colors duration-300 group-hover:text-[#A07850]"
                          }
                        >
                          {mark(i)}
                        </span>
                        {section.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}
