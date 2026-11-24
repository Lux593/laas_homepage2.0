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
