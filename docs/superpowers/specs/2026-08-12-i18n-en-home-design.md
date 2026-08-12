# i18n: Englische Hauptseite (DE/EN)

Stand: 12.08.2026 — Design nachgeschärft (Variante A)

## Ausgangslage

Die Portfolio-One-Pager (`portfolio/src/app/page.tsx`) ist Deutsch. Copy sitzt
größtenteils in `lib/constants.ts`, teils inline (z. B. Hero-Rotating-Words,
Aria-Labels in Sections). Navigation prüft Home mit `usePathname() === "/"`.
Rechtsseiten (`/agb`, `/datenschutz`, `/impressum`) sind DE-Recht und bleiben
außerhalb.

## Ziel

Internationale Kunden können die **Marketing-Hauptseite** auf Englisch lesen.
Sprachwechsel über einen Toggle in der Navigation. Saubere, teilbare URLs.
Rechtsseiten bleiben Deutsch. Desktop-Scroll-Choreografie bleibt unangetastet.

## Nicht-Ziele

- Keine Übersetzung von AGB / Datenschutz / Impressum
- Kein Auto-Redirect nach `Accept-Language`
- Kein Cookie / `localStorage` für Locale in v1
- Kein i18n-Framework (`next-intl` o. ä.)
- Keine dritte Sprache
- Kein Umbau der GSAP-/Pin-Logik

## Architektur (Variante A — leichte Dictionaries)

### Routing

| URL | Locale | Inhalt |
|---|---|---|
| `/` | `de` | One-Pager (wie heute) |
| `/en` | `en` | Dieselbe One-Pager-Komposition, englische Copy |
| `/agb`, `/datenschutz`, `/impressum` | nur DE | unverändert |

Section-Hashes bleiben sprachneutral: `#services`, `#process`, `#work`,
`#about`, `#contact`.

### Neue / geänderte Dateien

| Datei | Rolle |
|---|---|
| `src/lib/i18n/types.ts` | `Locale = "de" \| "en"`; `Dictionary`-Typ |
| `src/lib/i18n/dictionaries/de.ts` | DE-Marketing-Strings (`satisfies Dictionary`) |
| `src/lib/i18n/dictionaries/en.ts` | EN-Pendants (`satisfies Dictionary`) |
| `src/lib/i18n/getDictionary.ts` | `getDictionary(locale)` + Merge-Helfer |
| `src/components/home/HomePage.tsx` | Section-Komposition aus heutiger `page.tsx` |
| `src/components/i18n/DocumentLang.tsx` | setzt `document.documentElement.lang` (s. unten) |
| `src/app/page.tsx` | `HomePage` mit `locale="de"` |
| `src/app/en/layout.tsx` | Inline-Script `lang="en"` vor Paint + rendert children |
| `src/app/en/page.tsx` | `HomePage` mit `locale="en"` + EN-`generateMetadata` |
| `src/components/ui/Navigation.tsx` | Home-Erkennung, locale-aware Anker, Toggle |
| `src/app/layout.tsx` | Default `lang="de"`, DE-Metadata, `alternates.languages` |
| `src/app/sitemap.ts` | `/` und `/en` eintragen |
| `src/app/not-found.tsx` | Nav-Labels fest DE (Default-Locale) |
| `src/lib/constants.ts` | nur noch sprachneutrale Struktur/Assets; Text-Copy raus |

`en/layout.tsx` ist **pflicht**, nicht optional — Träger für das `lang`-Script.

### Datenmodell: constants × Dictionary

Zwei Schichten, Join über stabile `id`s:

1. **`constants.ts`** — sprachneutral:
   - Project/Service/Process-`id`s
   - Tech-Arrays, Farben, Device/Fit, Asset-Pfade (Bilder, Videos, Poster)
   - `SITE_CONFIG.name`, `url`, `email`, `socials`
   - Section-Hash-Ziele für die Nav (`href: "#services"` …)
   - `LEGAL_PAGES[].href` bleibt die Quelle für Rechts-URLs

2. **Dictionary** — nur Strings, gleicher Shape in DE/EN:
   - Nav-Labels (parallel zu den Hash-`href`s aus constants)
   - Meta (title, description, OG)
   - `tagline`, Hero-Texte inkl. Rotating-Words
   - Services / Process / Projects / About / Clients-Labels / CTA / Aria
   - Jahre als Anzeige-String (z. B. `"2025 – heute"` / `"2025 – present"`)
   - Legal-Link-**Labels** (Ziele weiter aus `LEGAL_PAGES.href`)

Merge zur Laufzeit in `getDictionary` bzw. kleinen Helfern, z. B.
`getProjects(dict)`, `getServices(dict)`, `getProcessSteps(dict)`:
Assets aus constants + Copy aus dict, gejoint per `id`. Fehlt eine `id` in
einer Locale → TypeScript/`satisfies` bzw. expliziter Build-Fehler, kein
stillschweigendes Deutsch auf EN.

**Umsetzungsreihenfolge (kein blinder Big-Bang):**

1. Dictionary-Typ + `de.ts` mit heutigem DE-Wortlaut (Lift aus constants/Inline)
2. `en.ts` parallel, gleicher Shape
3. Merge-Helfer + Sections auf Props umstellen
4. `constants.ts` ausdünnen (nur Struktur/Assets behalten)
5. Route `/en`, Nav-Toggle, SEO

### Datenfluss

```
app/page.tsx | app/en/page.tsx
  → getDictionary(locale)
  → merge helpers (projects, services, …)
  → <HomePage dict locale … />
  → Sections erhalten fertige, gemergte Daten als Props
```

Kein Locale-Context. Client-Sections bleiben Client; Motion/Hooks lesen keine
Locale. Dictionary wird auf der Server-Page geladen und als Props gereicht —
Sections importieren die Dictionary-Module nicht selbst (kein doppeltes
Client-Bundle der großen String-Tabellen über Extra-Imports).

### `html lang` (fest)

- Root-`layout.tsx`: `lang="de"` (Default für `/` und Rechtsseiten).
- Auf `/en`: **blocking Inline-Script** in `en/layout.tsx` ganz am Anfang von
  `children` / body-nahe:

  ```html
  <script dangerouslySetInnerHTML={{
    __html: `document.documentElement.lang="en";`
  }} />
  ```

  Damit steht `lang` vor dem ersten Paint richtig. Zusätzlich darf
  `DocumentLang` als Absicherung laufen; alleiniger `useEffect` reicht nicht.
- `generateMetadata` liefert Metadata nicht `lang` — Metadata und Script sind
  getrennte Pflichten; beide nötig.

### Navigation

**Home-Erkennung**

```ts
const isHome = pathname === "/" || pathname === "/en";
const locale: Locale = pathname === "/en" || pathname.startsWith("/en/")
  ? "en"
  : "de"; // auf Rechtsseiten und 404 immer "de"
const localePrefix = locale === "en" ? "/en" : "";
```

**Anker**

- Auf Home (`/` oder `/en`): `sectionHref = hash` (zeichengleich wie heute auf
  `/`, kein Full-Reload).
- Außerhalb Home (Rechtsseiten, 404): immer **DE-Home**
  `sectionHref = `/${hash}`` bzw. `homeHref = "/"` — keine „letzte EN-Locale“.
- Logo: auf Home → `#` (DE) bzw. passende Home-Semantik; auf `/en` Home → `#`
  bleibt auf `/en`; außerhalb → `/`.

**Locale-Toggle (UX)**

- Ort: Fullscreen-Menü, unter den Section-Links, kompakt `DE | EN`.
- Aktive Locale markiert.
- Auf Home: Wechsel `/` ↔ `/en`, **Hash best effort mitnehmen**
  (`/en#work` → `/#work`). Nach Remount (GSAP/Lenis) ist exakter Scroll-Restore
  nicht garantiert; Ziel ist „gleiche Section-URL“, nicht pixelidentische
  Scrollposition. Akzeptiert in v1.
- Auf Nicht-Home: Toggle navigiert zu `/` bzw. `/en` (ohne erfundenen Hash).
- Kein Cookie; URL ist Source of Truth nur auf den Home-Routen.

Desktop-Leiste (Logo + Hamburger) bleibt eingefroren; Toggle nur im Overlay.

## Copy-Inventar (vollständig für v1)

Alles Sichtbare und alles Aria auf der Marketing-Home muss durchs Dictionary.

| Bereich | Beispiele (heute DE) |
|---|---|
| Nav | `NAV_ITEMS` Labels; `aria-label` Menü-Button |
| Meta | title, description, OG/Twitter-Texte |
| Site | `tagline` (Name/URL/Email/Socials bleiben constants) |
| Hero | `ROTATING_WORDS` + alle sichtbaren Fließtexte |
| Services | `SERVICES_INTRO`, `SERVICES[]` title/description; `aria-label="Leistungen"`; Landscape-Aria (Statement, „Prozent Chaos“, Drag-Hinweis) |
| Process | `PROCESS_STEPS[]` inkl. points; ProcessMedia-Aria |
| Work | `PROJECTS[]` title/subtitle/category/year/description/details/features/gallery titles; Thumbnails-Aria („Vorheriges Bild“, „Nächstes Bild“, „Aufnahmen…“, „Aufnahme i von n“) |
| Clients | übersetzbare Namen (z. B. „Für Privatpersonen“); `aria-label="Ausgewählte Kunden"` |
| About | greeting, subtitle-Zeilen, Role-`position`, Portrait-`alt` |
| CTA | Headline/Body/Buttons; Social-Aria (`…-Profil besuchen`); Legal-**Labels** |
| Sonst | alle weiteren user-facing Strings, die beim Audit in Sections/UI auffallen |

Markennamen, Firmennamen, Tech-Namen bleiben unverändert.

**Ton EN:** klar, direkt, ohne Template-Feeling — analog DE. Keine
Wort-für-Wort-Maschine.

**Layout-Check:** Stichprobe Desktop + ein Phone-Profil für längere EN-Zeilen
(Hero-Rotator, Process-Titel mit `\n`, Project-Titles) — kein horizontaler
Overflow, keine abgeschnittenen Display-Zeilen.

## SEO & Metadata

- `/`: `lang="de"` (Root), `og:locale=de_DE`, bestehende DE-Metadata
- `/en`: Script setzt `lang="en"`, `og:locale=en_US`, EN title/description via
  `generateMetadata` in `en/page.tsx`
- Beide Homes: `alternates.languages = { de: "/", en: "/en" }`, Canonical je URL
- Sitemap: `/` und `/en` (Priority wie Home); Rechtsseiten unverändert
- JSON-LD: auf EN-Home `inLanguage: "en"` wo gesetzt; Name/URL gleich
- OG-Bild (`/og-image.jpg`) darf für beide Locales gleich bleiben (Marke)

## Out of Scope

- Rechtsseiten-EN
- Browser-Spracherkennung
- Persistenz der Wahl über Besuche
- Pixelgenauer Scroll-Restore nach Locale-Wechsel

## Akzeptanzkriterien

1. `/` zeigt DE-Copy; `/en` zeigt EN-Copy; gleiche Section-Reihenfolge und Motion
2. Toggle im Nav-Menü wechselt Locale; Hash wird in die Ziel-URL übernommen
3. Section-Anker auf `/en` bleiben auf `/en` (kein Absprung nach `/#…`)
4. Logo auf `/en` bleibt auf der EN-Home (kein hartes `/`)
5. Auf Rechtsseiten/404 führen Section-Links und Logo zur **DE**-Home
6. Legal-Links: Labels locale-abhängig, `href` weiter `/agb` \| `/datenschutz` \| `/impressum`
7. Kein sichtbarer DE-String und kein DE-Aria auf `/en` (Inventar oben)
8. `document.documentElement.lang === "en"` auf `/en` vor Interaktion
9. Sitemap + `alternates.languages` enthalten beide Homes
10. Desktop-Pin-Choreografie unverändert (kein GSAP-/Pin-Umbau)
11. Stichprobe: längere EN-Strings ohne Overflow (Desktop + ein Phone)
12. `de.ts` und `en.ts` beide `satisfies Dictionary`; `pnpm build` in `portfolio/` grün

## Risiken & Mitigation

| Risiko | Mitigation |
|---|---|
| Anker-Bugs auf `/en` | `isHome` explizit `/` und `/en`; manueller Klick-Test |
| Halb übersetzte Aria | Inventar-Tabelle; TypeScript-Shape |
| constants-Big-Bang | Phasen 1→5 oben |
| Remount verliert Scroll | Hash best effort; in v1 akzeptiert |
| EN-Zeilen zu lang | Layout-Stichprobe vor Done |
| Props-Drill | akzeptiert; kein Context in v1 |
