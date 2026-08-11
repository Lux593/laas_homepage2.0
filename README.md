# Luca Arnoldi App Studio — Website

One-Pager-Portfolio, Deutsch, Dark Theme. Sieben Sections in dieser Reihenfolge
(`portfolio/src/app/page.tsx`):

Hero → Leistungen → Prozess → Projekte → Kunden → Über mich → CTA

## Wo was liegt

**Die App ist alles unterhalb von `portfolio/`.** Ein Ordner im Repo-Root landet
nicht auf der Website — er wird nur mitgeklont und macht den Deploy grösser.

```
portfolio/          Next.js-App (Quelle der Wahrheit)
  src/app/          Layout, Seite, globals.css, sitemap
  src/components/   sections/ (die sieben) · ui/ · providers/
  src/lib/          constants.ts, breakpoints.ts
  public/           Bilder, Videos, Icons → ausgeliefert unter /…
  scripts/          Build-Stempel und Gerätematrix-Runner
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
