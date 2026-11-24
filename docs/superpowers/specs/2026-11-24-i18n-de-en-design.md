# i18n: Ganze Website zweisprachig (DE/EN)

Stand: 24.11.2026 · ersetzt `2026-08-12-i18n-en-home-design.md` und den
zugehörigen Plan (beide nie umgesetzt; sie schlossen die Rechtsseiten aus und
setzten den Schalter nur ins Vollbild-Menü).

Änderung 24.11.2026 (Luca): Der Schalter sitzt doch im Vollbild-Menü, als
letzter Eintrag unter „Kontakt“, zentriert, statt in der Kopfleiste. Die
Kopfleiste bleibt auf allen Breiten unverändert.

Änderung 24.11.2026 (Umsetzung, Entscheid R6): Die 404 ist anders gebaut als
unten unter „Dateistruktur“, „404“ und „Risiken“ beschrieben. Sie kommt aus
`app/global-not-found.tsx`, eingeschaltet über `experimental.globalNotFound`
in `next.config.ts`, und rendert über `LegalShell` samt `Navigation`.
`dynamicParams = false` steht nur an `app/[lang]/layout.tsx`;
`[lang]/[...rest]` und `[lang]/not-found.tsx` gibt es nicht. Die Sprache
schickt der Proxy als Header `x-lang`, ohne ihn gilt Deutsch. Grund: Next
16.4.6 liefert ein `notFound()` unter `[lang]` nur als leere Fehler-Shell aus,
die erst im Browser rendert (ohne `lang`, ohne CSS). Die gestylte 404 mit
Status 404 und richtigem `lang` aus Akzeptanzkriterium 8 ging so nicht.

## Warum

Luca will mit der Website auch internationale Kunden erreichen. Heute ist alles
Deutsch. Jeder Text und jeder Inhalt soll zusätzlich auf Englisch verfügbar
sein, umschaltbar über einen DE/EN-Schalter im Menü. Screenshots, Bilder
und Videos mit deutschem Inhalt (z. B. die Projektvorschauen) bleiben, wie sie
sind.

Erfolg heißt: Luca kann einem internationalen Interessenten `laas.website/en`
schicken, und der liest eine vollständige, natürlich klingende englische Seite,
inklusive Impressum, Datenschutz und AGB. Google findet und indexiert beide
Sprachen getrennt.

## Entscheidungen (von Luca getroffen)

| Thema | Entscheidung |
|---|---|
| Umfang | Ganze Seite: One-Pager, 404, Impressum, Datenschutz, AGB |
| Rechtsseiten | Übersetzen, mit Hinweis „Only the German version is legally binding“ |
| Livegang | One-Pager und Rechtsseiten gehen gemeinsam auf Englisch live; juristische Gegenlese ist kein Gate, sondern optional danach |
| URLs | `/` = DE wie heute, `/en` = EN; alle heutigen URLs bleiben gültig |
| Spracherkennung | Keine. Die URL entscheidet, nur der Schalter wechselt |
| Schalter | Text „DE / EN“ im Vollbild-Menü, letzter Eintrag unter „Kontakt“, zentriert, auf allen Breiten (geändert 24.11.) |
| Umsetzung | Ansatz A (siehe unten): `app/[lang]` + `proxy.ts` + eigene Dictionaries |

## Ziele

- `/…` zeigt Deutsch, `/en/…` zeigt Englisch, für jede Seite der Website.
- Gleiche Section-Reihenfolge, gleiche Motion, gleiche Assets in beiden Sprachen.
- `<html lang>` stimmt serverseitig im ersten HTML (kein Nachziehen per Script).
- Saubere SEO: `hreflang`-Alternates, Canonical je URL, Sitemap mit beiden Sprachen.
- Fehlt ein englischer Text, schlägt der Build fehl, statt still Deutsch zu zeigen.

## Nicht-Ziele

- Keine übersetzten Slugs: die EN-Rechtsseiten heißen `/en/impressum`,
  `/en/datenschutz`, `/en/agb` (Mein Call: spart Rewrite-Tabellen und
  Doppel-URLs; Besucher klicken Links, sie tippen sie nicht).
- Keine Browser-Spracherkennung, keine Weiterleitung nach `Accept-Language`,
  kein Cookie, kein `localStorage`.
- Keine Übersetzung von Bildern, Screenshots, Videos.
- Keine dritte Sprache, kein i18n-Framework (`next-intl` o. ä.).
- Kein pixelgenauer Scroll-Restore beim Sprachwechsel.

## Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)

- Die deutsche Seite ändert sich sichtbar, abgesehen vom neuen Schalter im
  geöffneten Menü.
- Die Desktop-Choreografie (GSAP-Pins, Lenis, Timelines) verhält sich anders.
- Das Englisch klingt nach Maschinenübersetzung oder Template.
- Auf `/en` steht irgendwo noch ein deutscher Text oder deutsches Aria.
- Eine heute gültige URL (`/`, `/impressum`, `/datenschutz`, `/agb`, Anker)
  bricht oder ändert ihren Inhalt.

## Ansätze

| | Ansatz | Trade-off |
|---|---|---|
| **A (gewählt)** | Alle Routen unter `app/[lang]/`, Root-Layout dort mit `<html lang>`. `src/proxy.ts` schreibt unpräfixierte Pfade intern auf `/de/…` um. Eigene TS-Dictionaries. | Kein neues Paket, Muster aus der Next-16-Doku (`02-guides/internationalization.md`), `lang` serverseitig korrekt, statisch vorgerendert. Kosten: ein Proxy, `usePathname` darf nicht mehr für die Sprache herhalten. |
| B | `next-intl` mit `localePrefix: "as-needed"` | Erprobt, kann übersetzte Slugs. Aber neue Abhängigkeit und eigene Konzepte für zwei Sprachen mit statischer Copy. |
| C | Zwei Routenbäume `app/(de)/…` und `app/(en)/en/…` mit je eigenem Root-Layout | Kein Proxy. Aber jede Page-Datei doppelt, und die 404 braucht `global-not-found` (experimentell). |

Hinweis: Auch A ist laut Next-Doku ein `global-not-found`-Fall („root layout is
defined using top-level dynamic segments“, `not-found.md`). A umgeht das ohne
experimentelles Flag über den Locale-Fallback (siehe „404“ unten).

Luca hat A gewählt: kein neues Paket, kleinste Fläche, und `lang` stimmt ohne Hack.

## Architektur

### Routing

| Aufruf im Browser | Intern | Ergebnis |
|---|---|---|
| `/` | Rewrite → `/de` | DE-One-Pager, URL bleibt `/` |
| `/impressum`, `/datenschutz`, `/agb` | Rewrite → `/de/…` | DE-Rechtsseite, URL bleibt |
| `/en`, `/en/impressum` … | durchgereicht | EN-Seite |
| `/de`, `/de/…` | 301 → ohne `/de` | keine Doppel-URLs |
| `/irgendwas` | Rewrite → `/de/irgendwas` | DE-404 (Status 404) |
| `/en/irgendwas` | durchgereicht | EN-404 (Status 404) |
| `_next/…`, Dateien mit Endung, `sitemap.xml`, `favicon.ico` | Proxy läuft nicht | unverändert |
| unbekannt mit Endung, z. B. `/wp-login.php`, `/a/b.php` | Proxy läuft nicht, landet in `[lang]` mit ungültiger Locale | gestylte DE-404 (Status 404) über den Locale-Fallback |

Section-Anker bleiben sprachneutral: `#services`, `#process`, `#work`,
`#about`, `#contact`.

**`src/proxy.ts`** (Next 16 heißt Middleware jetzt Proxy, läuft auf Node, siehe
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`):

- Matcher als Konstante, schließt `_next/` und alles mit Dateiendung aus, analog
  zur bestehenden Cache-Header-Regel in `next.config.ts`.
- `/en` und `/en/…` → `NextResponse.next()`.
- `/de` und `/de/…` → `NextResponse.redirect(…, 301)` auf den Pfad ohne `/de`,
  Query bleibt erhalten.
- Alles andere → `NextResponse.rewrite` auf `/de` + Pfad.
- Entscheidet ausschließlich nach Pfad. Das ist Absicht: Hostingers CDN (hcdn)
  cacht dann pro URL eindeutig.

### Dateistruktur

| Heute | Neu |
|---|---|
| `src/app/layout.tsx` | `src/app/[lang]/layout.tsx` (Root-Layout, `generateStaticParams` → `de`, `en`; **kein** `dynamicParams = false`, siehe 404) |
| `src/app/page.tsx` | `src/app/[lang]/page.tsx` |
| `src/app/impressum/page.tsx` usw. | `src/app/[lang]/impressum/page.tsx` usw. |
| `src/app/not-found.tsx` | `src/app/[lang]/not-found.tsx` + `src/app/[lang]/[...rest]/page.tsx` (ruft `notFound()`) |
| `src/app/globals.css` | bleibt, Import wandert ins neue Root-Layout |
| `src/app/sitemap.ts`, `favicon.ico` | bleiben auf `src/app/` |
| — | `src/proxy.ts` |
| — | `src/lib/i18n/` (Typen, Dictionaries, Helfer) |
| — | `src/content/legal/` (Rechtstexte je Sprache) |

### Root-Layout `app/[lang]/layout.tsx`

- `<html lang={…}>` aus den Params (oder `lang()` aus `next/root-params`,
  stabil seit 16.3). Ist die Locale ungültig (`hasLocale` false), rendert das
  Layout mit `de` weiter, statt selbst `notFound()` zu werfen. Sonst stünde
  z. B. `lang="wp-login.php"` im HTML.
- Fonts, `SmoothScroll`, `AnimationProvider`, `GrainOverlay` wie heute.
- `generateMetadata` liefert Titel, Description, OG/Twitter je Sprache.
- Skip-Link „Zum Inhalt springen“ / „Skip to content“ aus dem Dictionary.
- JSON-LD (`Person`) mit sprachabhängigem `knowsAbout` und `jobTitle`.

### Texte: zwei Schichten

1. **`src/lib/constants.ts`**: nur noch sprachneutral. IDs, Asset-Pfade,
   Tech-Arrays, Farben, Device/Fit, `SITE_CONFIG.name/url/email/socials`,
   Section-Hashes, Client-Logos. Firmen- und Markennamen bleiben hier.
2. **`src/lib/i18n/dictionaries/de.ts` und `en.ts`**: nur Strings, identischer
   Aufbau.
   - `Dictionary`-Typ wird aus dem DE-Objekt abgeleitet (Strings verbreitert),
     `en.ts` ist `satisfies Dictionary`.
   - Listen mit IDs (Projekte, Services, Prozess-Schritte) als
     `Record<ProjectId, ProjectCopy>` usw., wobei die ID-Unions aus
     `constants.ts` kommen. Damit erzwingt TypeScript, dass jede ID in beiden
     Sprachen Copy hat. Ein eigenes Paritäts-Skript ist nicht nötig.
   - Merge-Helfer (z. B. `getProjects(dict)`) joinen Assets aus `constants` mit
     Copy aus dem Dictionary per ID.

**Datenfluss:** Server-Page lädt das Dictionary, merged, reicht fertige Daten
als Props an `HomePage` und die Sections. Client-Komponenten importieren die
Dictionaries **nie** selbst, sonst landen beide Sprachen im Client-Bundle.

**Strings mit Werten** (z. B. „Aufnahme 2 von 6“, „GitHub-Profil besuchen“):
Funktionen lassen sich nicht vom Server an Client-Komponenten übergeben. Solche
Texte stehen als Vorlage mit Platzhaltern im Dictionary
(`"Aufnahme {current} von {total}"`) und werden mit einem kleinen
`format()`-Helfer im Client gefüllt.

### Rechtsseiten

Rechtstext ist JSX mit eingebetteten `<Fill>`, Links und Adressen. Er passt
nicht in ein String-Dictionary.

- Pro Seite und Sprache ein Content-Modul, z. B.
  `src/content/legal/impressum.de.tsx` / `impressum.en.tsx`, jeweils mit
  `meta` (Titel, Description) und `sections: LegalSectionData[]`.
- Die Page unter `app/[lang]/impressum/page.tsx` wählt das Modul nach Sprache.
- Die heutigen DE-Texte werden unverändert in die `.de.tsx`-Module verschoben.
- EN-Seiten zeigen oben einen gut sichtbaren Hinweis: „This is a courtesy
  translation. Only the German version is legally binding.“ mit Link auf die
  deutsche Fassung derselben Seite.
- `LegalPage`-Chrome sprachabhängig: Eyebrow („Rechtliches“ / „Legal“),
  „Stand:“ / „Last updated:“, „Zur Startseite“ / „Back to home“, Aria-Labels,
  Footer-Labels der Rechtslinks.
- `lib/legal.ts`: Werte mit Sprache (`country`: „Deutschland“ / „Germany“,
  Hoster-Adresse „Zypern“ / „Cyprus“) werden pro Sprache geführt. `updated`
  wird ein ISO-Datum und per `Intl.DateTimeFormat` formatiert („12. August
  2026“ / „August 12, 2026“). Eigennamen (Aufsichtsbehörde, Firmierung) bleiben
  deutsch.
- `<Fill>`-Platzhalter: Beschriftung und Aria-Label je Sprache.
- Gesetzesverweise (§ 5 DDG, BGB, DSGVO/GDPR-Artikel) bleiben als Verweise
  erhalten, im Englischen mit gängiger englischer Bezeichnung.

### 404

- `app/[lang]/[...rest]/page.tsx` fängt alle unbekannten Pfade unter einer
  Sprache und ruft `notFound()`.
- Jede Page (und der Catch-all) prüft die Locale mit `hasLocale` und ruft bei
  ungültiger Locale `notFound()`. Das Layout fällt dabei auf `de` zurück (siehe
  Root-Layout), also erscheint die gestylte DE-404.
- **Kein `dynamicParams = false`**, weder am Layout noch am Catch-all. In
  16.4 schließt das das gesamte Routen-Tupel
  (`next/dist/build/static-paths/app.js` ~705–713, `build/index.js` ~1876):
  Der Catch-all würde nie rendern, und Next fiele auf seine ungestylte
  Default-404 ohne `lang` und ohne `globals.css` zurück.
- `app/[lang]/not-found.tsx` liest die Sprache über `lang()` aus
  `next/root-params` und rendert die heutige 404 sprachabhängig (Texte und
  Bereichsliste aus dem Dictionary, Links auf die Home derselben Sprache).
  Exportierte `metadata` dieser Datei werden berücksichtigt.
- Status bleibt 404, `noindex` bleibt.

### Navigation und Schalter

**Sprache kommt per Props, nicht aus der URL.** Laut Next-Doku
(`03-api-reference/04-functions/use-pathname.md`) führt `usePathname()` bei
vorgerenderten Seiten mit Proxy-Rewrite zu Hydration-Mismatches: Der Server
rendert `/de`, der Browser sieht `/`. **Im ganzen Projekt darf `usePathname()`
danach nicht mehr vorkommen.** Heute betrifft das zwei Stellen:

- `Navigation.tsx`: Home-Erkennung `usePathname() === "/"`.
- `LegalPage.tsx` (~Zeile 51): blendet die aktuelle Seite aus den
  Fußzeilen-Rechtslinks aus. Ersatz: die Page übergibt die aktuelle Seite als
  Prop (z. B. `current="impressum"`).

Die Server-Page übergibt `Navigation` stattdessen:

- `locale`, `isHome`
- `alternateHref`: dieselbe Seite in der anderen Sprache (`/` ↔ `/en`,
  `/impressum` ↔ `/en/impressum`)
- die Nav-Labels und Aria-Texte

**Anker:** Auf der Home bleibt `href="#services"` usw. zeichengleich wie heute
(kein Reload). Außerhalb der Home zeigen Section-Links und Logo auf die Home
**derselben** Sprache (`/#services` bzw. `/en#services`), denn die
Rechtsseiten gibt es jetzt in beiden Sprachen.

**Schalter:**

- Sitzt im Vollbild-Menü als letzter Eintrag unter „Kontakt“, zentriert, auf
  allen Breiten (Lucas Entscheidung vom 24.11.2026). Die Kopfleiste bleibt auf
  allen Breiten unverändert.
- Zwei Einträge „DE“ und „EN“ mit Trenner „/“, schlichter Text. Kleiner und
  ruhiger als die Menüpunkte (UI-Label-Größe statt Display-Schrift), damit er
  nicht wie ein sechster Menüpunkt liest; nach oben etwas mehr Abstand als
  zwischen den Menüpunkten. Aktive Sprache voll deckend und unterstrichen,
  inaktive gedimmt, beides in der Textfarbe des Menüs.
- Fährt ein wie die Menüpunkte, mit der nächsten Verzögerungsstufe nach
  „Kontakt“.
- Trefferfläche mindestens 44 × 44 px.
- Semantik: `<nav aria-label="Sprache">` bzw. „Language“; jeder Link mit
  `hrefLang` und `lang`, zugänglicher Name „Deutsch“ / „English“, aktive
  Sprache mit `aria-current`.
- Ziel ist `alternateHref` plus aktueller Hash (beim Klick aus
  `location.hash` angehängt). Der Wechsel ist ein normaler Seitenaufruf per
  `<a>`, kein `next/link`. Das ist dasselbe Muster wie zwischen Rechtsseiten
  und Home heute: GSAP-Pins und Lenis bauen sich sauber neu auf.
- Passt auf kurze Höhen (Handy quer, 320 × 568): Menüpunkte und Schalter
  werden nie abgeschnitten. Reicht die Höhe nicht, rücken die Abstände über
  eine Höhen-Query enger zusammen oder das Menü scrollt.
- Das Menü wird nur geöffnet gerendert, der Schalter-Link steht also nicht im
  Server-HTML. Suchmaschinen finden die andere Sprache über die
  `hreflang`-Alternates und die Sitemap (siehe SEO).

### SEO

- Jede Seite: `alternates.canonical` auf die eigene URL,
  `alternates.languages = { de: <DE-URL>, en: <EN-URL>, "x-default": <DE-URL> }`.
- `openGraph.locale` `de_DE` / `en_US`, `alternateLocale` jeweils die andere.
- `sitemap.ts`: beide Sprachen je Seite, mit `alternates.languages` pro Eintrag.
  Prioritäten wie heute (Home 1, Rechtsseiten 0.3).
- OG-Bild bleibt für beide Sprachen gleich (reine Wortmarke).

## Copy-Inventar

Alles Sichtbare und alles Aria muss durch Dictionary oder Legal-Content laufen.
Stand der Durchsicht:

| Bereich | Wo heute | Beispiele |
|---|---|---|
| Meta, OG, JSON-LD, Skip-Link | `app/layout.tsx` | Titel, Description, „Herzlich Willkommen…“, `knowsAbout` |
| Navigation | `constants.NAV_ITEMS`, `Navigation.tsx` | Labels, „Navigationsmenü umschalten“, Logo-Alt |
| Hero | `Hero.tsx` inline | „Hey, ich bin Luca“, „Mein Fokus“, `ROTATING_WORDS` |
| Leistungen | `constants.SERVICES_INTRO/SERVICES`, `Services.tsx`, `ServicesLandscape.tsx` | Eyebrow, Headline, Statement, Support, 4 Services, Drag-Aria |
| Prozess | `constants.PROCESS_STEPS`, `Process.tsx`, `ProcessMedia.tsx` | „So arbeiten wir zusammen“, „WIE FUNKTIONIERTS?“, 4 Schritte mit Punkten, Video-Aria |
| Projekte | `constants.PROJECTS`, `SelectedWork.tsx`, `framer-moveable-thumbnails.tsx` | „Eine Auswahl meiner Arbeit“, „PROJEKTE“, 6 Projekte (Titel, Subtitle, Kategorie, Jahr, Texte, Features, Galerie-Titel), „Vorheriges Bild“, „Nächstes Bild“, „Aufnahme i von n“ |
| Kunden | `constants.CLIENTS`, `Clients.tsx` | „Für Privatpersonen“, „Ausgewählte Kunden“ |
| Über mich | `constants.ABOUT_*`, `About.tsx` inline | Greeting, Subtitle, Rollen-Positionen, „Wer dich unterstützt“, „ÜBER MICH“, „Was ich gerade beruflich mache“, „Tools die ich mag“ |
| CTA | `GiganticCTA.tsx` inline | „Lust auf ein Projekt ?“, „schreib mir - dann starten wir.“, „Projekt starten“, „…-Profil besuchen“, Legal-Labels |
| 404 | `app/not-found.tsx` | Titel, Lede, „Wohin stattdessen“, Bereichsliste |
| Rechtsseiten | `app/{impressum,datenschutz,agb}/page.tsx`, `components/legal/*`, `lib/legal.ts` | ca. 960 Zeilen Rechtstext, Chrome-Texte, Fill-Labels |

Die Liste ist der Startpunkt, nicht die Grenze. Beim Umbau taucht garantiert
noch mehr auf (z. B. `alt`/`title` in Untersections). Alles Sichtbare kommt mit.

Bleibt unverändert in beiden Sprachen: Marken- und Firmennamen, Tech-Namen,
Personennamen, Ortsnamen, E-Mail, Social-URLs, Medieninhalte.

## Übersetzung

- **Wer:** Claude schreibt die englischen Texte, Luca liest gegen.
- **Variante:** US-Englisch (Mein Call: verbreitetste Variante bei
  Tech-Kunden).
- **Ton:** wie DE: direkt, persönlich, ohne Agentur-Floskeln. „du“ wird
  „you“. Sinngemäß statt wörtlich; Wortspiele und Rhythmus dürfen sich ändern,
  wenn das englische Original so besser klingt.
- **Display-Zeilen:** Großgeschriebene Titel mit `\n` (Prozess, Projekte)
  bekommen englische Umbrüche, die etwa die deutsche Zeilenlänge treffen.
- **Rechtstexte:** möglichst nah am deutschen Wortlaut, englische
  Standardbegriffe („Legal Notice“, „Privacy Policy“, „Terms and Conditions“).
  Claude ist kein Anwalt. Luca hat entschieden, alles gemeinsam live zu nehmen;
  der Hinweis „nur die deutsche Fassung ist verbindlich“ begrenzt das Risiko.
  Eine juristische Gegenlese der EN-AGB bleibt als optionaler Schritt danach.

## Constraints

- Ab `(min-width: 1024px) and (pointer: fine)` ist die Desktop-Choreografie
  eingefroren. Keine Änderung an GSAP-Pin-Hooks, `breakpoints.ts`, Timelines.
  Einzige Ausnahme: der Schalter im geöffneten Menü.
- Sections bekommen Copy als Props; ihre Motion-Logik bleibt unberührt.
- Zwischen Home und Rechtsseiten sowie beim Sprachwechsel bleibt `<a>` statt
  `next/link` (Lenis/ScrollTrigger brauchen den vollen Aufbau).
- Next 16.4: vor dem Schreiben die relevanten Guides in
  `node_modules/next/dist/docs/` lesen (Proxy, Root-Params, not-found,
  generateStaticParams, Metadata-Alternates, Sitemap).
- Hostinger: `next start` mit Node, CDN cacht pro URL. Nach Deploy hcdn-Cache
  leeren (steht im README).
- Nie `pnpm build` neben laufendem `pnpm dev`.
- Commits nur auf Lucas Ansage.

## Reihenfolge (DE bleibt bei jedem Schritt intakt)

1. **Routing:** `app/[lang]` + `proxy.ts`, alle Seiten verschoben, Inhalte noch
   DE. Prüfen: alle heutigen URLs liefern dasselbe wie vorher, `/en` liefert
   (vorübergehend) DE mit `lang="en"`.
2. **DE-Dictionary:** Copy aus `constants.ts` und Inline-Stellen ins
   DE-Dictionary heben, Sections auf Props umstellen. `/` sieht exakt aus wie
   vorher.
3. **EN-Dictionary:** komplette englische Copy für den One-Pager und die 404.
4. **Rechtsseiten:** Content-Module DE (verschoben) und EN (übersetzt), Hinweis,
   `LegalPage`-Chrome, `lib/legal.ts`.
5. **Navigation + Schalter**, SEO-Alternates, Sitemap.
6. **Verifikation** (unten).

## Akzeptanzkriterien

1. `/`, `/impressum`, `/datenschutz`, `/agb` und alle Anker verhalten sich wie
   heute; die DE-Seiten sehen bei geschlossenem Menü pixelgleich aus.
2. `/en`, `/en/impressum`, `/en/datenschutz`, `/en/agb` zeigen vollständig
   englische Inhalte; Bilder/Screenshots/Videos sind dieselben wie auf DE.
3. Im ausgelieferten HTML jeder EN-Seite steht `<html lang="en">`, auf jeder
   DE-Seite `<html lang="de">`.
4. Kein deutscher Text, kein deutsches Aria/Alt/Title auf EN-Seiten (außer
   Eigennamen und dem deutschen Rechtstext-Link im Hinweis).
5. Schalter im geöffneten Menü unter „Kontakt“ auf allen Breiten sichtbar und
   bedienbar, auch bei Handy quer, wechselt zur selben Seite in der anderen Sprache, Hash wird mitgenommen.
6. Auf `/en` bleiben Section-Anker und Logo auf `/en`. Auf Rechtsseiten führen
   Section-Links und Logo zur Home derselben Sprache.
7. `/de` und `/de/…` leiten per 301 auf die unpräfixierte URL.
8. Unbekannte Pfade: `/x` und `/wp-login.php` → gestylte DE-404, `/en/x` →
   gestylte EN-404, jeweils Status 404 und korrektes `lang`.
9. `hreflang`-Alternates und Canonical auf jeder Seite; Sitemap enthält beide
   Sprachen.
10. Keine Hydration-Warnungen in der Konsole auf DE- und EN-Seiten.
11. Desktop-Choreografie unverändert (Vorher/Nachher-Screenshots Desktop).
12. Längere EN-Zeilen ohne horizontalen Overflow und ohne abgeschnittene
    Display-Zeilen (Gerätematrix `overflow` auf `/` und `/en`).
13. `pnpm lint` und `pnpm build` in `portfolio/` grün.

## Verifikation

- **Routing-Matrix** gegen `pnpm build && pnpm start`: per `curl -sI` Status,
  `Location` und `lang` für alle Zeilen der Routing-Tabelle prüfen.
- **Deutsch-Scan** (Mein Call: kleines Skript `scripts/check-en-copy.mjs`):
  lädt alle EN-Seiten, zieht sichtbaren Text plus `aria-label`/`alt`/`title`
  und meldet Umlaute, ß und eine Liste häufiger deutscher Wörter. Eine
  Allowlist deckt Eigennamen ab (z. B. Feldschlösschen, Weil am Rhein,
  Baden-Württemberg, Intersport Gemo).
- **Gerätematrix:** `BASE_URL=http://localhost:3000/en node
  scripts/mobile-matrix.mjs overflow` und `shots`, dazu dasselbe auf `/` als
  Vergleich zum Stand vor dem Umbau.
- **Handtest im Browser:** Schalter auf Home mit Hash, auf Rechtsseite, auf 404;
  im Menü auf Desktop und Handy; Handy quer (kurze Höhe); 320 px Breite.

## Risiken

| Risiko | Gegenmittel |
|---|---|
| Hydration-Mismatch durch Rewrite | Locale/`isHome` per Props, kein `usePathname` für Sprache |
| Proxy erwischt Assets | Matcher schließt `_next/` und Dateien mit Endung aus; Asset-Check in der Routing-Matrix |
| 404 fällt auf ungestylte Next-Default-404 zurück | kein `dynamicParams = false`; Locale-Fallback auf `de`; Routing-Matrix prüft `/x`, `/en/x`, `/wp-login.php`, `/a/b.php` |
| `not-found.tsx` kennt die Sprache nicht (keine Props) | `lang()` aus `next/root-params` (stabil seit 16.3) |
| Halb übersetzte Aria | Typ-Parität + Deutsch-Scan |
| Großer Copy-Umzug bricht DE | Schrittfolge oben, nach Schritt 2 DE-Vergleich |
| EN-Zeilen zu lang für Display-Typo | Overflow-Matrix, Umbrüche bewusst setzen |
| Fehlerhafte AGB-Übersetzung | Hinweis „German version binding“; optionale juristische Gegenlese nach Livegang |

## Dem Builder überlassen

- Genaue Dateinamen und Helfer-Namen in `src/lib/i18n/` und `src/content/legal/`.
- Ob die Locale über Params oder `next/root-params` gelesen wird.
- Ob `HomePage` als eigene Komponente die Section-Komposition übernimmt.
- Wie die Allowlist des Deutsch-Scans aufgebaut ist.
- Feinmaße des Schalters (Schriftgröße, Abstand zu „Kontakt“) im Rahmen der
  Vorgaben oben.

## Aufräumen

`docs/superpowers/specs/2026-08-12-i18n-en-home-design.md` und
`docs/superpowers/plans/2026-08-12-i18n-en-home.md` werden mit dem neuen Plan
entfernt (die Git-Historie behält sie).
