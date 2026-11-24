import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import DocumentShell from "@/components/layout/DocumentShell";
import LegalShell from "@/components/legal/LegalShell";
import { getNavCopy } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/locales";
import { LOCALE_HEADER, localeFromHeader } from "@/lib/i18n/routing";
import { SITE_VIEWPORT, siteMetadata } from "@/lib/site-metadata";

/** Sprache der 404 — der Proxy schickt sie als Header mit (siehe unten). */
async function requestLocale() {
  return localeFromHeader((await headers()).get(LOCALE_HEADER));
}

// Die globale 404 erbt nichts vom Root-Layout, deshalb die Grund-Metadaten
// hier noch einmal, nur Titel und robots weichen ab.
export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await requestLocale());

  return {
    ...siteMetadata(dict),
    title: dict.notFound.metaTitle,
    // Eine Fehlerseite gehört nicht in den Index. `follow` bleibt an, damit die
    // Wege zurück auf die Startseite trotzdem gelesen werden.
    robots: { index: false, follow: true },
  };
}

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
  const locale = await requestLocale();
  const dict = getDictionary(locale);
  const copy = dict.notFound;

  return (
    <DocumentShell locale={locale}>
      <LegalShell
        locale={locale}
        current={null}
        eyebrow={copy.eyebrow}
        title={copy.title}
        lede={copy.lede}
        showUpdated={false}
      >
        {/* Kein LegalSection: die Fehlerseite ist kein Dokument mit Kapiteln,
            sondern eine Kreuzung. Die Haarlinie oben zitiert trotzdem den
            Rhythmus der Rechtsseiten, damit beide erkennbar zusammengehören. */}
        <div className="mt-12 border-t border-[#0a0a0a]/10 pt-8 md:mt-16 md:pt-10">
          <span className="block font-mono text-caption uppercase tracking-[0.2em] text-[#9a9a9a]">
            {copy.whereTo}
          </span>

          <nav
            aria-label={copy.sectionsLabel}
            className="mt-6 flex flex-col"
          >
            {/* <a> aus demselben Grund wie in LegalPage: die Ziele sind Anker auf
                der Startseite, und die will frisch aufgebaut werden. */}
            {getNavCopy(dict).items.map((item) => (
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
      </LegalShell>
    </DocumentShell>
  );
}
