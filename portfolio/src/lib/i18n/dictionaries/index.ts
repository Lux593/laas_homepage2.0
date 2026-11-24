import type { Locale } from "../locales.ts";
import type { Dictionary } from "../types.ts";
import { de } from "./de.ts";
import { en } from "./en.ts";

const DICTIONARIES: Record<Locale, Dictionary> = { de, en };

/**
 * Das Wörterbuch einer Sprache.
 *
 * Nur in Server-Komponenten aufrufen. Client-Komponenten bekommen ihre Texte
 * als Props: ein Import von hier im Client zöge jede Sprache ins Bundle.
 */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
