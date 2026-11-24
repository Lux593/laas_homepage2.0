/**
 * Sprachen der Seite und die reinen Pfad-Helfer dazu.
 *
 * Bewusst ohne React- und Next-Importe: die Datei läuft in Server- und
 * Client-Komponenten, im Proxy und unter `node --test`.
 *
 * Deutsch ist die Hauptsprache und hat kein Präfix (`/`, `/impressum`),
 * Englisch hängt unter `/en`. Die Slugs sind in beiden Sprachen gleich.
 */

export const LOCALES = ["de", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

/** Wert für `og:locale` je Sprache. */
export const OG_LOCALE: Record<Locale, string> = {
  de: "de_DE",
  en: "en_US",
};

/** Genau die zwei Kürzel, kein Case-Folding: `EN` ist keine Sprache. */
export function hasLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "de" ? "en" : "de";
}

/**
 * Macht aus einem sprachlosen Pfad den Pfad der gewünschten Sprache.
 * `/` → `/` bzw. `/en`, `/impressum` → `/impressum` bzw. `/en/impressum`.
 */
export function localizePath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Hängt einen Hash an einen Pfad. Leer oder nur `#` ergibt den Pfad
 * unverändert, damit beim Sprachwechsel kein loses `#` in der URL landet.
 */
export function withHash(href: string, hash: string): string {
  return hash === "" || hash === "#" ? href : `${href}${hash}`;
}
