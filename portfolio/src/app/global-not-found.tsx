import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import DocumentShell from "@/components/layout/DocumentShell";
import LegalPage from "@/components/legal/LegalPage";
import { NAV_ITEMS } from "@/lib/constants";
import { localizePath } from "@/lib/i18n/locales";
import { LOCALE_HEADER, localeFromHeader } from "@/lib/i18n/routing";
import { SITE_METADATA, SITE_VIEWPORT } from "@/lib/site-metadata";

// Die globale 404 erbt nichts vom Root-Layout, deshalb die Grund-Metadaten
// hier noch einmal, nur Titel und robots weichen ab.
export const metadata: Metadata = {
  ...SITE_METADATA,
  title: "Seite nicht gefunden — Luca Arnoldi App Solutions",
  // Eine Fehlerseite gehört nicht in den Index. `follow` bleibt an, damit die
  // Wege zurück auf die Startseite trotzdem gelesen werden.
  robots: { index: false, follow: true },
};

export const viewport: Viewport = SITE_VIEWPORT;

/**
 * Die 404 für jede Adresse ohne Route (aktiviert über
 * `experimental.globalNotFound` in next.config.ts).
 *
 * Sie liegt ausserhalb von app/[lang] und bekommt weder params noch den
 * Root-Parameter. Die Sprache schickt der Proxy deshalb als Header mit;
 * Pfade, auf denen er nicht läuft, fallen auf Deutsch zurück.
 */
export default async function GlobalNotFound() {
  const locale = localeFromHeader((await headers()).get(LOCALE_HEADER));

  return (
    <DocumentShell locale={locale}>
      <LegalPage
        locale={locale}
        current={null}
        eyebrow="Fehler 404"
        title="NICHTS ZU SEHEN"
        lede="Diese Seite gibt es nicht — jedenfalls nicht mehr, oder noch nicht. Vielleicht hat sich ein Tippfehler in die Adresse geschlichen, vielleicht ist der Link älter als die Seite dahinter."
        showUpdated={false}
      >
        {/* Kein LegalSection: die Fehlerseite ist kein Dokument mit Kapiteln,
            sondern eine Kreuzung. Die Haarlinie oben zitiert trotzdem den
            Rhythmus der Rechtsseiten, damit beide erkennbar zusammengehören. */}
        <div className="mt-12 border-t border-[#0a0a0a]/10 pt-8 md:mt-16 md:pt-10">
          <span className="block font-mono text-caption uppercase tracking-[0.2em] text-[#9a9a9a]">
            Wohin stattdessen
          </span>

          <nav
            aria-label="Bereiche der Startseite"
            className="mt-6 flex flex-col"
          >
            {/* <a> aus demselben Grund wie in LegalPage: die Ziele sind Anker auf
                der Startseite, und die will frisch aufgebaut werden. */}
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={`${localizePath("/", locale)}${item.href}`}
                className="group flex items-baseline justify-between gap-6 border-b border-[#0a0a0a]/10 py-4 font-display text-[clamp(1.25rem,2.6vw,1.75rem)] font-bold tracking-tight text-[#0a0a0a] transition-colors duration-300 hover:text-[#A07850]"
              >
                {item.label}
                <span
                  aria-hidden
                  className="font-body text-body-sm font-normal text-[#9a9a9a] transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            ))}
          </nav>
        </div>
      </LegalPage>
    </DocumentShell>
  );
}
