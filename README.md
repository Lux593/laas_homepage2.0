# Luca Arnoldi App Studio — Website

One-Pager-Portfolio, Deutsch und Englisch, Dark Theme. Sieben Sections in dieser
Reihenfolge (`portfolio/src/components/home/HomePage.tsx`):

Hero → Leistungen → Prozess → Projekte → Kunden → Über mich → CTA

## Wo was liegt

**Die App ist alles unterhalb von `portfolio/`.** Ein Ordner im Repo-Root landet
nicht auf der Website — er wird nur mitgeklont und macht den Deploy grösser.

```
portfolio/          Next.js-App (Quelle der Wahrheit)
  src/app/          [lang]/ (Layout, Startseite, Rechtsseiten), global-not-found.tsx,
                    globals.css, sitemap
  src/components/   home/ (Startseite) · sections/ (die sieben) · ui/ · layout/ ·
                    legal/ · providers/
  src/content/      legal/ (Rechtstexte je Sprache)
  src/lib/          constants.ts, breakpoints.ts, site-metadata.ts, i18n/ (Sprachen,
                    Wörterbücher, SEO-Helfer)
  src/proxy.ts      Sprache aus dem Pfad: ohne /en intern auf /de
  public/           Bilder, Videos, Icons → ausgeliefert unter /…
  scripts/          Build-Stempel, Gerätematrix-Runner, check-i18n.mjs,
                    find-inline-copy.mjs
framer/             Framer-Plugin-Port von HoverMaskReveal (eigenständig)
```

Bilder und Videos gehören ausschliesslich nach `portfolio/public/`. Von dort
werden sie unter `/…` ausgeliefert: `portfolio/public/vorschaubilder/x.webp`
→ `/vorschaubilder/x.webp`.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · GSAP 3 + ScrollTrigger ·
Lenis · framer-motion

Node ≥ 20.9 (`.nvmrc`: 22) · pnpm 10.33 · TypeScript

## Lokal

```bash
cd portfolio
pnpm install
pnpm dev            # http://localhost:3000
```

Weitere Skripte: `pnpm build` (stempelt zuerst `public/build.txt`),
`pnpm start`, `pnpm lint`.

> **Nie `pnpm build` neben laufendem `pnpm dev`.** Der Build überschreibt das
> `.next` des Dev-Servers, und die offene Seite rendert danach kaputt.

**Genau eine Lockfile: `pnpm-lock.yaml`.** Liegt eine `package-lock.json`
daneben, ist der erkannte Paketmanager mehrdeutig und Turbopack findet die
Workspace-Wurzel nicht mehr.

## Deploy (Hostinger)

hPanel → Einstellungen und erneute Bereitstellung:

| Feld | Wert |
|---|---|
| Framework-Voreinstellung | Next.js (Hostinger startet `next start`) |
| Root-Verzeichnis | `portfolio` |
| Build-Befehl | `pnpm run build` |
| Paketmanager | pnpm |
| Ausgabeverzeichnis | `.next` |

Kein `output: "export"` — das erzeugt nur `out/` und kein `.next`, `next start`
bricht dann ab. Die vollständige Herleitung samt der Cache-Header-Regel steht im
Kopf von `portfolio/next.config.ts`.

**Nach jedem Deploy den hcdn-Cache leeren.** Hostingers CDN leert nicht von
selbst; sonst sieht live alt aus, während der Build längst neu ist.

Bilder nie in-place überschreiben — der Image-Optimizer liefert sonst stunden­lang
die alte Rendition. Neues Motiv, neuer Dateiname.

## Sprachen

Deutsch liegt unter `/`, Englisch unter `/en` (`/en/impressum`, `/en/agb` …).
Die Slugs sind in beiden Sprachen gleich. Der DE/EN-Schalter sitzt im
Vollbild-Menü unter „Kontakt“. Es gibt keine Spracherkennung und kein Cookie:
Die Sprache steckt allein in der URL.

- **Copy:** `portfolio/src/lib/i18n/dictionaries/` (`de.ts`, `en.ts`)
- **Rechtstexte:** `portfolio/src/content/legal/` (`*.de.tsx`, `*.en.tsx`).
  Rechtlich bindend ist nur die deutsche Fassung; die EN-Seiten zeigen dazu
  einen Hinweis.

Prüfen (aus `portfolio/`). Die `check:i18n`-Befehle laufen gegen einen
laufenden Server (`pnpm build && pnpm start`):

```bash
pnpm test                                 # Unit-Tests
pnpm check:copy src/components src/app    # Text, der noch im JSX statt im Wörterbuch steht
pnpm check:i18n routing                   # Status, Weiterleitungen, lang je Pfad
pnpm check:i18n copy                      # deutsche Wörter auf EN-Seiten
pnpm check:i18n seo                       # canonical, hreflang, og:locale, og:url, Sitemap
pnpm check:i18n compare                   # DE-Text gegen die lokale Baseline (.i18n-baseline/, nicht im Repo)
```

Die Baseline für `compare` ist lokal und git-ignoriert. Sie muss ein Snapshot
des deutschen Stands **vor** i18n sein (`pnpm check:i18n snapshot` gegen einen
Build ohne die i18n-Änderungen). Auf einem frischen Klon fehlt sie, `compare`
meldet dann „Baseline fehlt“. Ein Snapshot vom i18n-Stand selbst vergleicht
die Seite nur mit sich und sagt nichts.

Nach jedem Deploy, sobald der Cache geleert ist (siehe Deploy):
`BASE_URL=https://laas.website pnpm check:i18n routing`.

Gut zu wissen:

- **404:** `app/global-not-found.tsx`, eingeschaltet über
  `experimental.globalNotFound` in `portfolio/next.config.ts`. Nach jedem
  Next-Upgrade `pnpm check:i18n routing` laufen lassen.
- **Bekannte Grenze:** `/en/…` mit Dateiendung (`/en/x.php`) und `/EN`
  bekommen die deutsche 404. Der Proxy-Matcher überspringt Pfade mit Endung,
  und `EN` ist keine Sprache.
- **`pnpm test`** braucht ein Node, das TypeScript nativ ausführt (Node 22
  laut `.nvmrc`). `engines` erlaubt ab 20.9, dort laufen die Tests nicht.

## Breakpoint-Regel

Ab `(min-width: 1024px) and (pointer: fine)` gilt die Desktop-Choreografie als
eingefroren. Arbeit an Handy und Tablet ist additiv — sie darf dort kein Pixel
verändern.

Welche Section gepinnt läuft und welche gestapelt, entscheiden `PIN_QUERY` und
`STACK_QUERY` in `portfolio/src/lib/breakpoints.ts`. Sie sind exakte Gegenstücke,
jedes Gerät matcht genau eine. Die Datei erklärt auch, warum sie als Zwei-Arm-Form
geschrieben sind und nicht als `not (…)`-Ausschluss.

Gegenprobe auf echten Geräteprofilen (7 Telefone, 4 iPads hochkant, 4 quer,
Desktop) — braucht einen laufenden Dev-Server:

```bash
cd portfolio
node scripts/mobile-matrix.mjs shots <outDir>   # Screenshots aller Profile
node scripts/mobile-matrix.mjs bytes            # Transferbudget 390×844
node scripts/mobile-matrix.mjs overflow         # horizontaler Overflow
node scripts/mobile-matrix.mjs perf             # fps unter 4× CPU-Throttle
node scripts/mobile-matrix.mjs vitals           # LCP / CLS
```
