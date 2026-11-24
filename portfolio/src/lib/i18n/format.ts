/**
 * Kleine Format-Helfer für Texte aus den Wörterbüchern.
 *
 * Reine Funktionen ohne Abhängigkeiten, damit sie auch in Client-Komponenten
 * liegen können, ohne ein Wörterbuch mitzuziehen.
 */

import type { Locale } from "./locales.ts";

/**
 * Ersetzt `{name}`-Platzhalter. Fehlt der Wert, bleibt der Platzhalter
 * sichtbar stehen — ein vergessener Wert fällt so beim Lesen der Seite auf,
 * statt als leere Stelle durchzurutschen.
 */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match,
  );
}

const DATE_LOCALE: Record<Locale, string> = { de: "de-DE", en: "en-US" };

/**
 * `2026-08-12` → „12. August 2026" bzw. „August 12, 2026".
 * Feste Zeitzone UTC: ISO-Daten ohne Uhrzeit werden als UTC gelesen, in einer
 * westlicheren Zeitzone käme sonst der Vortag heraus.
 */
export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
