import { NextResponse, type NextRequest } from "next/server";

import {
  LOCALE_HEADER,
  localeFromPath,
  resolveProxy,
} from "@/lib/i18n/routing";

/**
 * Deutsch ohne Präfix, Englisch unter `/en`.
 *
 * Alle Routen liegen unter `app/[lang]`. Deutsche Adressen tragen das `/de`
 * aber nicht in der URL: der Proxy schreibt `/impressum` intern auf
 * `/de/impressum` um, die Adresszeile bleibt stehen. Wer `/de/…` direkt
 * aufruft, wird auf die kanonische Adresse ohne Präfix umgeleitet.
 *
 * Die Regeln selbst stehen in `resolveProxy` (lib/i18n/routing.ts) und sind
 * dort ohne Server getestet. Hier werden sie nur in Antworten übersetzt.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const decision = resolveProxy(pathname);

  // Die Sprache reist als Request-Header mit. Gelesen wird sie nur von
  // app/global-not-found.tsx: die 404 für `/en/gibtsnicht` liegt ausserhalb
  // von app/[lang] und sähe die Sprache sonst nirgends. `set` überschreibt
  // einen Wert, den der Browser selbst mitgeschickt hat.
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, localeFromPath(pathname));

  if (decision.kind === "next") {
    return NextResponse.next({ request: { headers } });
  }

  // clone() behält die Query: `/de?x=1` → `/?x=1`.
  const url = request.nextUrl.clone();
  url.pathname = decision.pathname;

  // 301 statt Nexts Default 307: `/de/…` ist dauerhaft nicht die Adresse,
  // Suchmaschinen sollen sich die Adresse ohne Präfix merken.
  if (decision.kind === "redirect") return NextResponse.redirect(url, 301);
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Nicht für Nexts interne Pfade und nicht für Dateien mit Endung
  // (`/og-image.jpg`, `/sitemap.xml`, `/favicon.ico`): die liegen ohne
  // Sprache an der Wurzel und dürfen nicht nach `/de/…` umgeschrieben werden.
  matcher: ["/((?!_next|__next|.*\\.[a-zA-Z0-9]+$).*)"],
};
