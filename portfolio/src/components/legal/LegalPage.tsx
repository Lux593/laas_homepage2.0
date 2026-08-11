"use client";

import { usePathname } from "next/navigation";

import LegalSection, {
  type LegalSectionData,
} from "@/components/legal/LegalSection";
import Navigation from "@/components/ui/Navigation";
import ScrollProgress from "@/components/ui/ScrollProgress";
import TextReveal from "@/components/ui/TextReveal";
import { useLightChrome } from "@/hooks/useLightChrome";
import { LEGAL, LEGAL_PAGES } from "@/lib/legal";

/** 01, 02, … — dieselbe zweistellige Marke wie in SERVICES und im Projektzähler. */
const mark = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Die geteilte Hülle aller Rechtsseiten und der Fehlerseite.
 *
 * Client-Component, weil sie zwei Client-Dinge braucht: useLightChrome (die
 * feste Leiste muss über der Cremefläche dunkel schreiben) und TextReveal
 * (GSAP). Die Routen-Dateien darüber bleiben Server-Components und behalten
 * damit ihre `metadata` — die SEO-Angaben werden serverseitig gerendert.
 */
export default function LegalPage({
  eyebrow = "Rechtliches",
  title,
  lede,
  showUpdated = true,
  sections,
  children,
}: {
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
  const pathname = usePathname();
  const hasIndex = Boolean(sections && sections.length > 2);

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
      <Navigation />

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
                Stand: {LEGAL.updated}
              </p>
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
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
                  Die Regel kennt den Grund darüber nicht: next/link würde hier
                  gerade NICHT das Richtige tun, weil die Startseite einen
                  frischen Lenis- und ScrollTrigger-Zustand braucht. */}
              <a
                href="/"
                className="group inline-flex items-center gap-2 font-mono text-caption uppercase tracking-widest text-[#6a6a6a] transition-colors duration-300 hover:text-[#0a0a0a] pointer-coarse:min-h-11"
              >
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-500 ease-out-expo group-hover:-translate-x-1"
                >
                  ←
                </span>
                Zur Startseite
              </a>

              <nav
                aria-label="Weitere rechtliche Hinweise"
                className="flex flex-wrap items-center gap-x-5 gap-y-1 md:gap-x-8"
              >
                {LEGAL_PAGES.filter((page) => page.href !== pathname).map(
                  (page) => (
                    <a
                      key={page.href}
                      href={page.href}
                      className="inline-flex items-center font-mono text-caption uppercase tracking-widest text-[#9a9a9a] transition-colors duration-300 hover:text-[#0a0a0a] pointer-coarse:min-h-11"
                    >
                      {page.label}
                    </a>
                  ),
                )}
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
              aria-label="Inhalt dieses Dokuments"
              className="hidden lg:sticky lg:top-[clamp(8rem,20vh,11rem)] lg:block lg:self-start"
            >
              <span className="block font-mono text-caption uppercase tracking-[0.2em] text-[#9a9a9a]">
                Inhalt
              </span>
              <ol className="mt-5 space-y-1">
                {sections.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex gap-3 py-1 text-body-sm leading-snug text-[#6a6a6a] transition-colors duration-300 hover:text-[#0a0a0a]"
                    >
                      <span className="pt-[0.15em] font-mono text-caption text-[#b8afa2] transition-colors duration-300 group-hover:text-[#A07850]">
                        {mark(i)}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}
