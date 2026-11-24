/**
 * Entscheidung des Proxys für einen Pfad, ohne Next-Typen.
 *
 * Als eigene reine Funktion, damit die Regeln ohne Server testbar sind. Der
 * Proxy selbst übersetzt das Ergebnis nur noch in `NextResponse`.
 *
 *  - `/en`, `/en/…`  → durchlassen, die Route `app/[lang]` bedient sie direkt
 *  - `/de`, `/de/…`  → Redirect auf den Pfad ohne Präfix (kanonisch ist `/`)
 *  - alles andere    → intern auf `/de/…` umschreiben, die URL bleibt stehen
 */

import { DEFAULT_LOCALE, hasLocale, type Locale } from "./locales.ts";

/**
 * Request-Header, über den der Proxy die Sprache an app/global-not-found.tsx
 * weiterreicht. Die globale 404 liegt ausserhalb von app/[lang] und kennt
 * weder params noch `lang()` aus next/root-params.
 */
export const LOCALE_HEADER = "x-lang";

export type ProxyDecision =
  | { kind: "next" }
  | { kind: "redirect"; pathname: string }
  | { kind: "rewrite"; pathname: string };

function hasPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function resolveProxy(pathname: string): ProxyDecision {
  if (hasPrefix(pathname, "/en")) return { kind: "next" };

  if (hasPrefix(pathname, "/de")) {
    // Mehrfach-Slashes am Anfang zusammenziehen: `/de//evil.com` würde sonst
    // zu `//evil.com`, und das ist ein protokollrelativer Link auf einen
    // fremden Host (offener Redirect).
    const rest = pathname.slice("/de".length).replace(/^\/+/, "/");
    return { kind: "redirect", pathname: rest === "" ? "/" : rest };
  }

  return {
    kind: "rewrite",
    pathname: pathname === "/" ? "/de" : `/de${pathname}`,
  };
}

/** Sprache eines Pfads, wie der Proxy sie sieht: `/en`, `/en/…` → en, sonst de. */
export function localeFromPath(pathname: string): Locale {
  return hasPrefix(pathname, "/en") ? "en" : "de";
}

/**
 * Sprache aus dem Proxy-Header, wie app/global-not-found.tsx sie braucht.
 *
 * Der Header fehlt, wo der Proxy nicht läuft: Pfade mit Dateiendung wie
 * `/wp-login.php` schliesst sein Matcher aus. Und weil ein Client den Header
 * selbst mitschicken kann, zählen nur die zwei bekannten Kürzel. Alles andere
 * fällt auf Deutsch zurück, wie die Pfade ohne Präfix.
 */
export function localeFromHeader(value: string | null): Locale {
  return value !== null && hasLocale(value) ? value : DEFAULT_LOCALE;
}
