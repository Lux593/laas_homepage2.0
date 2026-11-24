/**
 * Sprachverweise für Suchmaschinen: `canonical` und `hreflang` je Seite, dazu
 * absolute URLs für Sitemap und JSON-LD.
 *
 * Ohne React- und Next-Importe, wie locales.ts: läuft in den Seiten, in der
 * Sitemap und unter `node --test`.
 */

import { SITE_CONFIG } from "../constants.ts";
import { type Locale, localizePath } from "./locales.ts";

/** Die Seiten, die es in beiden Sprachen gibt, als sprachloser Pfad. */
export type PagePath = "/" | "/impressum" | "/datenschutz" | "/agb";

/** Alle Seiten in der Reihenfolge der Sitemap: Startseite, dann Rechtliches. */
export const PAGE_PATHS: readonly PagePath[] = [
  "/",
  "/impressum",
  "/datenschutz",
  "/agb",
];

/**
 * `alternates` für die Metadaten einer Seite.
 *
 * Jede Sprache ist ihre eigene kanonische URL (`/impressum` und
 * `/en/impressum`), beide verweisen per hreflang aufeinander. `x-default`
 * zeigt auf Deutsch: die Hauptsprache und die Fassung ohne Präfix.
 *
 * Die Pfade bleiben relativ, `metadataBase` aus lib/site-metadata.ts macht
 * sie absolut.
 */
export function buildAlternates(
  path: PagePath,
  locale: Locale,
): {
  canonical: string;
  languages: { de: string; en: string; "x-default": string };
} {
  const de = localizePath(path, "de");
  return {
    canonical: localizePath(path, locale),
    languages: { de, en: localizePath(path, "en"), "x-default": de },
  };
}

/**
 * Absolute URL eines Pfads der Seite, für Stellen ohne `metadataBase`
 * (Sitemap, JSON-LD). Die Startseite ohne abschliessenden Schrägstrich, wie
 * Next sie auch im canonical schreibt.
 */
export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_CONFIG.url : `${SITE_CONFIG.url}${path}`;
}
