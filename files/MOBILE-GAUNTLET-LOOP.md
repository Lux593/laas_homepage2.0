# GAUNTLET LOOP — Mobile Immersive Adaption (angepasst auf laas_homepage2.0)

## Context

Der vorgelegte Golden Loop ist generisch formuliert und trägt Platzhalter
(`[Next.js / GSAP / Lenis / Tailwind — anpassen]`, `[< 768px]`, `[85]`).
Drei seiner Vorgaben sind für dieses Projekt nicht nur unpräzise, sondern
**falsch** — würde man sie wörtlich umsetzen, wäre das Ergebnis eine Regression.
Dieses Dokument ist der auf den tatsächlichen Code gemappte Ersatz.

**Ausgangslage:** Die mobile Ansicht ist nicht unbearbeitet. Drei Commits im
Branch haben bereits gefixt, was kaputt war:

| Commit | Inhalt |
|---|---|
| `7758ac9` | About-Kamerafahrt hochkant, Prozess animiert statt Liste, iPad-Breite |
| `bd49d0b` | Ladelast 56 MB → **323 KB** beim Aufruf / **451 KB** nach vollem Scroll (390×844), 4 Overflow-Stellen bei 320px, Tippziele |
| `d119ea6` | Projekt-Thumbnails, Hero/About-Politur mobil |

Was fehlt, ist nicht *Reparatur*, sondern **Immersion**: unter 1024px fällt die
Seite auf `useStackReveal` zurück — ein braves Copy-Stagger + Bildblende pro
Etage, identisch für „Projekte" und „Prozess". Die Desktop-Dramaturgie
(Shuttle, horizontaler Pin, Kamerafahrt) hat dort kein gleichwertiges Pendant.
Genau das ist das Ziel dieses Loops.

---

## Was ich gegenüber deinem Entwurf geändert habe — und warum

### 1. Breakpoint-Grenze: `< 768px` → **`< 1024px`** ⚠️ wichtigste Korrektur

Das Projekt hat **drei** Grenzen, nicht eine:

| Grenze | Was dort umschaltet | Fundstellen |
|---|---|---|
| **1024px** | **Die Pins.** `useHorizontalPin` (Projekte) und `useProcessPin` (Prozess) laufen nur bei `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`. Darunter greift `useStackReveal` mit `(max-width: 1023px) …` | `useHorizontalPin.ts:114`, `useProcessPin.ts:109`, `useStackReveal.ts:16`, Spiegel in `globals.css:412`, `process.css:186` |
| **768px** | Lenis an/aus · Hero-Blur an/aus + Parallax-Intensität 1 → 0.7 · About-Kamerakontext quer/hochkant · Services-Radius · Tailwind `md:` | `SmoothScroll.tsx:11`, `Hero.tsx:322-330`, `About.tsx:174-177`, `Services.tsx:330` |
| **1023px** | Prozess-Copy-Verhalten, iPad-Well-Padding | `ProcessCopy.tsx:26`, `globals.css:403` |

Dazu eine **Höhen**bedingung: die About-Kamerafahrt hochkant verlangt
`(min-height: 660px)` (`About.tsx:152`, `about.css:538`) — darunter bleibt es
bewusst statisch.

Bei `< 768px` zu arbeiten würde das Band **768–1023px** übersehen. Und genau das
ist die unangenehmste Zone der Seite: **Lenis läuft dort (an ab 769px), die Pins
laufen nicht (erst ab 1024px).** Smooth-Scroll ohne die Motion, für die er da
ist.

→ **Arbeitsbereich dieses Loops: `< 1024px` inklusive Tablets**, mit 768 als
innerer Naht — plus die Touch-Sonderfälle **oberhalb** 1024px (siehe Gerätematrix).

#### Gerätematrix — echte Viewports gegen die drei Grenzen

Alle Angaben in CSS-Pixeln. Die Spalte „landet bei" ist das, was die Seite dort
**heute** tut.

**Telefone — hochkant** (alle unter 768 → Lenis aus, Blur aus, Stapel):

| Gerät | Viewport | landet bei |
|---|---|---|
| Untergrenze (SE 1. Gen / Fold-Cover) | 320×568 | Stapel · Höhe < 660 → About statisch |
| iPhone SE (3. Gen) | 375×667 | Stapel · Höhe ≥ 660 → About-Kamera an |
| iPhone 16e | 390×844 | **Referenzgerät der 323/451-KB-Messung** |
| **iPhone 16** | **393×852** | Stapel · About-Kamera an |
| iPhone 16 Pro | 402×874 | dito |
| iPhone 16 Plus | 430×932 | dito |
| iPhone 16 Pro Max | 440×956 | dito |

**Telefone — quer.** Hier wird es unangenehm, und das ist neu gegenüber deinem
Entwurf: die Querformat-**Breite** schiebt fast jedes aktuelle iPhone über die
768er-Naht, während die **Höhe** unter 660 fällt:

| Gerät quer | Viewport | landet bei |
|---|---|---|
| iPhone SE (3. Gen) | 667×375 | < 768 → Lenis aus, Hero ohne Blur |
| **iPhone 16** | **852×393** | **≥ 768: Lenis AN, Hero-Blur AN, Parallax voll — auf 393px Höhe. Pins trotzdem aus. About-Kamera aus (Höhe < 660).** |
| iPhone 16 Pro | 874×402 | dito |
| iPhone 16 Plus | 932×430 | dito |
| iPhone 16 Pro Max | 956×440 | dito |

Das Band 768–1023px ist also **nicht** „Tablets" — es sind **Telefone im
Querformat** und **iPads hochkant**. Ein iPhone 16 quer bekommt heute die
Desktop-Blurs und den Smooth-Scroll auf einem 393px hohen Fenster.

**Tablets — hochkant:**

| Gerät | Viewport | landet bei |
|---|---|---|
| iPad mini (A17 Pro) | 744×1133 | < 768 → Lenis aus, Stapel |
| iPad (A16) / iPad Air 11″ | 820×1180 | 768er-Band: Lenis an, Pins aus |
| iPad Pro 11″ | 834×1194 (M2) / 834×1210 (M4) | dito |
| **iPad Air 13″ / iPad Pro 13″** | **1024×1366** | **`min-width: 1024px` greift exakt → voller Desktop-Pin auf einem Touch-Gerät hochkant** |

**Tablets — quer** (alle ≥ 1024 → **voller Desktop-Modus, ohne Maus**):

| Gerät quer | Viewport |
|---|---|
| iPad mini | 1133×744 |
| iPad (A16) / iPad Air 11″ | 1180×820 |
| iPad Pro 11″ | 1194×834 / 1210×834 |
| iPad Air 13″ / iPad Pro 13″ | 1366×1024 |

**Zwei Konsequenzen, die in Phase 0/1 gehören:**

1. **iPad Pro/Air 13″ hochkant trifft `1024` auf den Pixel genau.** Die
   `min-width: 1024px`-Query ist inklusiv — das Gerät bekommt den horizontalen
   Pin und den Prozess-Shuttle in einem 1024×1366-Hochformat, für das beide nie
   ausgelegt wurden (`--frame-h` rechnet mit `78vh`, `--frame-w` mit
   `100vw - 40ch`). Muss in Phase 0 vermessen und in Phase 1 entschieden werden.

2. **Alle iPads quer laufen im Desktop-Modus auf einem Touch-Gerät.** Hover
   existiert dort nicht — die Hover-Abhängigkeiten aus Gate 6 sind damit auch
   **oberhalb** 1024px scharf. Der Fix darf **nicht** über die Breite laufen,
   sonst trifft er echte Desktops. Er läuft über `(pointer: coarse)` /
   `(hover: none)`. Beide Helfer existieren bereits und werden
   wiederverwendet: `useSupportsHover()` in `hooks/useMediaQuery.ts:35` und
   `supportsHover()` in `lib/utils.ts:38`.

### 2. „`100dvh` statt `100vh` (iOS-URL-Bar!)" → **`svh` bleibt, `dvh` wäre der Bug**

Die Regel ist allgemein richtig und hier falsch herum. Das Projekt benutzt
absichtlich `100svh` mit `100vh` als Fallback davor — auf jeder gepinnten Bühne
(`process.css:190-191`, `about.css:443-444`, `globals.css:417-418`,
`Hero.tsx:380/421`, `hero.css`).

`dvh` ändert seinen Wert, **während** die URL-Leiste fährt. Auf einer gepinnten
Bühne heißt das: Höhe ändert sich mitten im Pin, ScrollTrigger vermisst neu, der
Pin springt. Deshalb steht in `AnimationProvider.tsx:38` auch bereits
`ScrollTrigger.config({ ignoreMobileResize: true })`.

→ **Gate-Regel neu:** `svh` auf allem, was gepinnt/sticky ist. `dvh` nur auf
nicht-gepinnten Vollhöhen-Blöcken. `body` hat das `vh`/`dvh`-Paar bereits
(`globals.css:212-213`) — nicht anfassen. **Ein neu eingeführtes `dvh` auf einer
Bühne ist ein rotes Gate.**

### 3. „Lenis-Konflikte" → verschiebt sich auf das mittlere Band

Lenis ist unter 769px **komplett aus** (`SmoothScroll.tsx:10-12`, zusammen mit
reduced-motion). Auf dem Handy läuft nativer Scroll — die klassischen
iOS-Lenis-Probleme (Momentum, Rubber-Band, Pointer-Capture) existieren dort
nicht. Sie existieren im Band 769–1023px. Dorthin gehört der Test.

### 4. Stack-Platzhalter → konkret

```
Next.js 16.1.6 (App Router) · React 19.2.3 · TypeScript 5 (strict)
GSAP 3.14.2 + ScrollTrigger · Lenis 1.3.18 · framer-motion 12.35 · Tailwind v4
pnpm 10.33 · Node 22 · Deploy: Hostinger Node-Server, Root portfolio/
```

**Hauspattern beachten:** `@gsap/react` ist zwar installiert, `useGSAP` wird
**nirgends** benutzt — jede Animation ist `useEffect` + `gsap.matchMedia()` +
`mm.revert()` im Cleanup. framer-motion nur in `Navigation.tsx` und
`framer-moveable-thumbnails.tsx`. **Kein neues Pattern**, nicht nur keine neue
Dependency.

### 5. Blur-Check → die Liste ist bekannt und kurz

Kein Sweep nötig, es sind genau vier Stellen:

| Stelle | Status |
|---|---|
| `Navigation.tsx:75` — `backdrop-blur-xl` auf dem Vollbild-Menü | **einziger echter Kandidat.** Vollflächig, über der ganzen Seite, dazu eine `clip-path: circle()`-Animation darüber |
| `globals.css:329/336` — `.glass` / `.glass-hover` | nur in `FlipCard.tsx` referenziert, und die Komponente ist **nirgends eingebunden**. Toter Code — nicht optimieren, nicht anfassen |
| `Hero.tsx:262/281` — GSAP `filter: blur()` beim Scrub | **bereits gelöst.** Unter 768px per matchMedia aus (`Hero.tsx:326-330`) |

### 6. Gates 1 und 10 → auf real vorhandenes Werkzeug

- `node_modules` ist in diesem Container **leer** → `pnpm install --frozen-lockfile` ist Schritt 0.
- Es gibt **kein `typecheck`-Script** → `npx tsc --noEmit` von Hand.
- `lint` ist das nackte `eslint` (kein Pfadargument).
- **Lighthouse ist nicht installiert.** Playwright + Chromium sind da
  (`/opt/node22/bin/playwright`, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) —
  Gate 4 und 10 laufen darüber. Kein `playwright install`.
- Es gibt **keine Tests** → Desktop-Regression braucht eine
  Screenshot-Baseline, sonst ist „unverändert" eine Behauptung.

### 7. Scope-Grenzen, die der Loop nicht kennen konnte

**Nicht inventarisieren, nicht anfassen** — 15 UI-Komponenten mit null Imports:
`CustomCursor`, `HoverMaskReveal`, `WorkflowScene`, `Marquee`, `Parallax`,
`FlipCard`, `CardSpotlight`, `BackgroundGlows`, `ScrollHighlight`,
`StaggerReveal`, `SectionDivider`, `RollingText`, `CounterAnimation`,
`AnimatedLink`, `HorizontalScroll`. Ebenso: `Preloader` (in `layout.tsx:134`
auskommentiert), `transpilePackages: ["three"]` + die glsl-Loader in
`next.config.ts` (Reste des entfernten WebGL-Heros).

---

## Die sieben Sections — verbindliche Liste

Reihenfolge aus `src/app/page.tsx`:

| # | Section | Datei | Desktop-Motor | Zustand `< 1024px` |
|---|---|---|---|---|
| 1 | **Hero** | `sections/Hero.tsx` (566) + `hero/hero.css` | sticky + 4-Ebenen-Parallax-Scrub, Lampen-Sway, Rotationswort | läuft, ohne Blur, Intensität 0.7 |
| 2 | **Leistungen** | `sections/Services.tsx` (583) + `services/services.css` | clip-path-Einfahrt, gepinnte Kapitel mit Textwechsel | Einfahrt läuft, Kapitel-Pin ab 768px |
| 3 | **Prozess** | `sections/Process.tsx` + `useProcessPin.ts` (329) | Shuttle fährt Spalte 2 → 1, 4 Clips, Zähler | **Stapel** + `useStackReveal` („wipe") |
| 4 | **Projekte** | `sections/SelectedWork.tsx` + `useHorizontalPin.ts` (230) | horizontaler Pin, Panel-Durchlauf, Rollzähler | **Stapel** + `useStackReveal` („rise") |
| 5 | **Kunden** | `sections/Clients.tsx` | CSS-Marquee 50s, `motion-safe:` | identisch |
| 6 | **Über mich** | `sections/About.tsx` (765) + `about/about.css` | Kamerafahrt in den Monitor, Blende, HUD | eigener Kontext hochkant, **nur ≥660px Höhe** |
| 7 | **CTA** | `sections/GiganticCTA.tsx` (277) | Hover-Farbwechsel, `group-hover` Pfeil | Hover tot → Gate 6 |

---

## PHASE 0 — DESKTOP-ANALYSE

Erzeugt `MOTION-INVENTORY.md` im Repo-Root (neben `INHALT.md`).

1. **Section-für-Section-Tabelle** über die sieben oben, je Zeile:
   Trigger · Effekt · Dauer/Scrub · Easing · Motor (GSAP-Timeline /
   framer-motion / CSS) · **aktueller `< 1024px`-Zustand**.
   Die letzte Spalte ist der Zusatz zu deinem Entwurf — ohne sie planen wir
   gegen einen leeren Bildschirm, obwohl dort schon etwas steht.

2. **Design-DNA in 5 Sätzen.** Nicht neu erfinden — herleiten aus
   `INHALT.md`, `files/AGENT-02-DESIGN-SYSTEM.md`,
   `files/AGENT-04-SCROLLYTELLING.md`, `files/AGENT-07-VISUAL-POLISH.md` und den
   Design-Tokens in `globals.css` (Cream `#f2ede4` gegen Schwarz `#050505`,
   Akzent `#DFBE9F`, Instrument Serif / DM Sans, `power3.out`, `scrub: 0.6–0.8`).

3. **Klassifizierung** je Effekt: PORTIEREN / ÜBERSETZEN / ERSETZEN / STREICHEN.

4. **Performance-Budget-Kandidaten**, gemessen gegen die bestehende
   Marke aus `bd49d0b`: **≤ 323 KB beim Aufruf, ≤ 451 KB nach vollem
   Durchscrollen bei 390×844.** Das ist die Regressionsschwelle, keine
   Schätzung.

5. **Invarianten-Register** — projektspezifisch, nicht im Original enthalten:
   jede `gsap.matchMedia()`-Query im Code hat einen **byte-identischen
   `@media`-Zwilling im CSS**. Driften sie auseinander, ist das Ergebnis
   entweder ein dauerhaft aus dem Bild stehendes Panel oder 200vw
   Horizontal-Overflow (so kommentiert in `globals.css:412`). Alle Paare
   auflisten, bevor eine Query angefasst wird.

→ **STOP.** Inventory zeigen. Erst nach Freigabe weiter.

## PHASE 1 — MOBILE KONZEPT

Pro Section ein Vorschlag: welcher Motion-Moment trägt sie unter 1024px?

Leitplanken (deine, plus die Projektrealität):
- Sticky/Pinned Image-Stacks statt horizontaler Sequenzen — `useStackReveal`
  ist der vorhandene Ansatzpunkt, nicht eine neue Datei
- Scroll-getriebene Reveals statt Hover
- **Ein** starker Moment pro Screen
- Bilder: Sticky-Container + Scale/Mask beim Durchscrollen
- **Zusatz:** Das Band 768–1023px braucht eine bewusste Entscheidung —
  Handy-Variante hochziehen oder Desktop-Pin herunterziehen. Nicht offenlassen.
  Dort sitzen **iPhones im Querformat** (852×393 aufwärts) und **iPads
  hochkant** (820×1180, 834×1194) — zwei sehr verschiedene Formen, ein Band.
- **Zusatz:** Was unter `(max-height: 659px)` passiert, gehört ins Konzept.
  Dort ist die About-Kamerafahrt bewusst aus — und dort liegt **jedes** iPhone
  im Querformat.
- **Zusatz:** Für iPad Pro/Air 13″ hochkant (1024×1366) entscheiden: Pin dort
  behalten und für Hochformat auslegen, oder die Grenze auf `min-width: 1025px`
  bzw. auf eine Kombination aus Breite und `(pointer: fine)` heben. Beides ist
  vertretbar, aber es muss eine Entscheidung sein und keine Nebenwirkung.

→ **STOP.** Konzept zeigen. Erst nach Freigabe implementieren.

---

## CONSTRAINTS

- Arbeitsbereich **`< 1024px` inkl. Tablets**, innere Naht bei 768px,
  Höhen-Sonderfall 660px
- **Desktop mit Maus bleibt unverändert. Regression = Abbruch.**
  „Desktop" heißt ab hier `(min-width: 1024px) and (pointer: fine)` — **nicht**
  einfach `≥1024px`. Touch-Geräte oberhalb 1024px (iPads quer, iPad 13″
  hochkant) dürfen und sollen abweichen, aber ausschließlich über
  `(pointer: coarse)` / `(hover: none)`, nie über eine Breitengrenze
- Keine neue Dependency **und kein neues Pattern**: `useEffect` +
  `gsap.matchMedia()` + `mm.revert()`, so wie überall sonst
- Media-Queries + `gsap.matchMedia()`, **kein** UA-Sniffing
- **Jede** Query bekommt `and (prefers-reduced-motion: no-preference)` —
  ausnahmslos, so wie im Bestand
- **Jede** Query mit CSS-Zwilling: beide gleichzeitig ändern, byte-identisch
- `svh` auf Bühnen, nie `dvh`
- Kein `any`, kein `@ts-ignore`, kein „deaktiviert" statt gelöst
- Kommentare auf Deutsch, im Ton des Bestands (erklären *warum*, nicht *was*)
- Scope Creep: notieren, nicht bauen — besonders die 15 toten Komponenten

---

## GATES — jede Iteration, alle, in dieser Reihenfolge

**Schritt 0 (einmalig):** `cd portfolio && pnpm install --frozen-lockfile`

1. **Build / Types / Lint** — 0 Fehler
   ```
   npx tsc --noEmit          # kein typecheck-Script vorhanden
   pnpm run lint
   pnpm run build            # stamp-build.mjs + next build
   ```

2. **Desktop-Regression** — nicht behaupten, zeigen
   - Playwright-Screenshots **1440×900 mit `hasTouch: false`** vor der Änderung
     als Baseline, danach Vergleich über alle sieben Sections
   - Explizit prüfen: horizontaler Pin (Projekte) und Shuttle (Prozess) laufen
     unverändert; About-Kamerafahrt trifft denselben Endzustand
   - **Invarianten-Check:** jede berührte `matchMedia`-Query gegen ihren
     CSS-Zwilling diffen
   - Wurde eine Query auf `pointer`/`hover` erweitert: beweisen, dass die
     Maus-Variante byte-gleich zur Baseline rendert

3. **Layout** — kein horizontaler Overflow, auf der vollen Gerätematrix
   - **Pflichtbreiten hoch:** 320 · 375 · 390 · 393 · 402 · 430 · 440 ·
     744 · 820 · 834 · **1024**
   - **Pflichtbreiten quer:** 667 · 852 · 874 · 932 · 956 ·
     1133 · 1180 · 1194 · 1366
   - Jeweils mit der **echten Höhe** des Geräts fahren, nicht mit einer
     Standardhöhe — die 660px-Schwelle und die `svh`-Bühnen hängen daran
   - `svh`-Regel aus Constraint eingehalten (`dvh` auf Bühne = rot)
   - Safe-Area: `viewportFit: "cover"` ist in `layout.tsx:86` gesetzt, die
     `env()`-Insets in `Navigation.tsx:35` — neue fixe Elemente müssen nachziehen.
     Im **Querformat** sind `safe-area-inset-left/right` auf Notch-Geräten ≠ 0

4. **Performance** — **4× CPU-Throttle**, ≥ 50fps durchgehend
   - Messung per Playwright + CDP-Trace gegen `pnpm run start` (Production-Build,
     nicht `dev`)
   - Pflicht-Profile: **iPhone 16 hoch (393×852)**, **iPhone 16 quer (852×393)**,
     **iPad Air 11″ hoch (820×1180)**, **iPad Pro 13″ quer (1366×1024)**
   - Nur `transform` + `opacity` animiert; keine Layout-Shifts durch Animation
   - **Transfer-Budget gegen `bd49d0b` halten:** ≤ 323 KB Aufruf /
     ≤ 451 KB nach vollem Scroll bei 390×844

5. **Blur-Check** — nur `Navigation.tsx:75`. Auf Mobile reduzierter Radius oder
   statisches Fallback; die `clip-path`-Kreisanimation läuft darüber und ist der
   teure Teil. `.glass` ist toter Code, `.glass-hover` ebenso.

6. **Touch** — keine hover-abhängige Funktion, Targets ≥ 44px.
   **Gilt auf der ganzen Matrix, auch oberhalb 1024px** (iPads quer laufen im
   Desktop-Modus ohne Maus). Test mit Playwright `hasTouch: true` +
   `isMobile: true`, nicht nur über die Fensterbreite.
   - Konkrete Prüfstellen: `GiganticCTA.tsx:200` (`group-hover:translate-x-1`)
     und `GiganticCTA.tsx:223` (`onMouseEnter` schreibt `style.color` direkt —
     bleibt auf Touch dauerhaft hängen, es gibt kein `onMouseLeave`),
     `ProcessCopy.tsx`, `Navigation.tsx`
   - Menü-Button ist bereits 48px (`w-12 h-12`) ✓
   - Scroll wird nie blockiert, kein ungewollter Pointer-Capture
   - Fixes über `(pointer: coarse)`, nie über `max-width` — siehe Constraints

7. **iOS / iPadOS Safari** — was hier brechen kann, benennen:
   - `position: sticky` in Vorfahren mit `overflow-x-clip` /
     `overflow-x-hidden` — betrifft `SelectedWork.tsx:31/33` und
     `body` (`globals.css:214`)
   - `Hero.tsx:380/421` nutzt `motion-safe:sticky` — Verhalten bei
     reduced-motion mitprüfen
   - `svh` wird beim Rotieren neu berechnet → `ScrollTrigger.refresh()`-Verhalten
     explizit beim Dreh Hoch↔Quer prüfen, auf Telefon **und** iPad
   - **Lenis-Konflikte nur ab 769px** (darunter ist Lenis aus). Das trifft alle
     iPads und alle iPhones im Querformat außer SE — dort gegen Momentum-Scroll,
     Rubber-Band und den Zusammenlauf mit `ScrollTrigger.update` testen
   - iPadOS meldet sich als Desktop-Safari; **nichts** darf am UA hängen

8. **prefers-reduced-motion** — vollständige, nutzbare Variante
   - Lenis ist dort ohnehin aus (`SmoothScroll.tsx:10`)
   - `globals.css:228` killt alle CSS-Animationen global
   - Jede neue GSAP-Query braucht ihren `no-preference`-Zusatz, sonst läuft sie
     dort mit

9. **Immersions-Check** — Section für Section gegen die DNA aus Phase 0.
   Fühlt es sich nach derselben Seite an? Wo nicht — warum?

10. **Lighthouse Mobile** — Performance ≥ 85, CLS < 0.1
    - Nicht installiert. Entweder `npx lighthouse` gegen `pnpm run start`
      (braucht Netz über den Proxy) **oder** — falls das scheitert — die
      Kernwerte LCP/CLS/TBT per Playwright-`PerformanceObserver` messen und
      **explizit als Ersatzmessung ausweisen**, nicht als Lighthouse-Score.

---

## LOOP-REGELN

- Nach jeder Änderung: alle Gates von vorne, nicht nur das gefixte
- Ein Gate rot → fixen → zurück zu Gate 1
- **Max. 5 Iterationen**, danach Blocker-Report statt weiter raten
- Scope Creep: notieren, nicht bauen

## OUTPUT PRO ITERATION

```
Iteration N: [Section + Änderung] → Gates: 1✅ 4❌ (34fps im Hero) → Fix
```

## ABSCHLUSS

- Diff-Zusammenfassung
- Mapping-Tabelle Desktop-Effekt → Mobile-Pendant
- Liste der notierten, nicht umgesetzten Punkte
- Commit + Push auf `claude/mobile-plan-availability-r0vpvn`

---

## Verifikation dieses Plans

Vor Phase 0 einmal beweisen, dass die Messkette überhaupt steht:

```
cd portfolio
pnpm install --frozen-lockfile
npx tsc --noEmit && pnpm run lint && pnpm run build
pnpm run start &
```
Dann per Playwright (Chromium aus `/opt/pw-browsers`, **kein** `playwright install`):
`http://localhost:3000` in vier Profilen laden — **393×852 (iPhone 16, touch)**,
**852×393 (iPhone 16 quer, touch)**, **820×1180 (iPad Air 11″, touch)** und
**1440×900 (Desktop, `hasTouch: false`)** — je ein Screenshot, Transferbytes
gegen die 323/451-KB-Marke prüfen. Läuft das, ist Gate 1–4 belastbar; scheitert
es, wird das gemeldet statt geschätzt.

Die Geräteprofile werden als kleine Liste im Repo abgelegt
(`portfolio/scripts/mobile-matrix.mjs`, nur Daten + ein Playwright-Runner), damit
jede der maximal 5 Iterationen dieselben Viewports fährt und „grün" über die
Iterationen hinweg dasselbe bedeutet.

---

## Entschieden

- **Tablets sind im Scope.** Arbeitsbereich `< 1024px` inklusive iPads hochkant,
  plus die Touch-Sonderfälle oberhalb 1024px (iPads quer, iPad 13″ hochkant).
- **Gerätebasis:** aktuelle Apple-Viewports als Standardsatz — iPhone SE 3 /
  16 / 16 Pro / Plus / Pro Max, iPad mini / iPad A16 / Air 11″ / Pro 11″ /
  Air 13″ / Pro 13″, jeweils hoch **und** quer, dazu 320px als Untergrenze.
  Vollständig in der Gerätematrix oben.
- **Abgrenzung Desktop:** nicht über die Breite, sondern
  `(min-width: 1024px) and (pointer: fine)`. Nur das ist die unantastbare Zone.
