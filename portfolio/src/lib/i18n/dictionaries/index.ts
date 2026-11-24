import type { Locale } from "../locales.ts";
import type { Dictionary } from "../types.ts";
import { de } from "./de.ts";

/** Englisch fehlt noch; bis es da ist, bekommt auch `/en` den deutschen Text. */
const DICTIONARIES: Record<Locale, Dictionary> = { de, en: de };

/**
 * Das Wörterbuch einer Sprache.
 *
 * Nur in Server-Komponenten aufrufen. Client-Komponenten bekommen ihre Texte
 * als Props: ein Import von hier im Client zöge jede Sprache ins Bundle.
 */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
