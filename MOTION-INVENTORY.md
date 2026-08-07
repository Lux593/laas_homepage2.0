# MOTION-INVENTORY — Phase 0 des Mobile-Gauntlet-Loops

**Stand:** HEAD `f26f009`, sauberer Arbeitsbaum (ausser den untracked Dateien
`MOBILE-PLAN.md` und `.mobile-audit/`).
**Quelle:** Jede Zeile unten ist am aktuellen Code nachgelesen, nicht aus dem
Audit vom `4e0aaf2` übernommen. Wo das Audit oder `files/MOBILE-GAUNTLET-LOOP.md`
etwas anderes behauptet, steht die Korrektur unter [Korrekturen](#korrekturen).

**Zählung:** 54 Bewegungen in 7 Sections plus globalem Chrome.
Davon laufen **31 unter 1024px identisch zum Desktop**, **9 laufen dort in einer
abgeschwächten Fassung**, **12 laufen dort gar nicht** und **2 sind ersatzlos
tot** (kein Pendant, keine Abschwächung).

---

## 1. Design-DNA in fünf Sätzen

Hergeleitet aus `INHALT.md`, `files/AGENT-02-DESIGN-SYSTEM.md`,
`files/AGENT-04-SCROLLYTELLING.md` und den Tokens in
[globals.css:5-58](portfolio/src/app/globals.css#L5-L58).

1. **Die Bühne ist ein dunkler Raum, in den Licht hineingeholt wird** — Grund
   `#050505`, Text `#fcfcfc`, Bronze `#C49F7B`/`#DFBE9F` als einziger
   Farbakzent; jeder Auftritt beginnt mit einer Maske, die aufgeht, nicht mit
   einem Element, das erscheint.
2. **Die Cremefläche `#f2ede4` ist das zweite Material und schiebt sich als
   Körper über das Schwarz** — sie fährt als Balken herein, klappt auf und
   nimmt den Hero unter sich weg; Sectionwechsel sind darum Materialwechsel,
   keine Scrollpositionen.
3. **Bewegung ist an den Scrollbalken gekoppelt, nicht an die Zeit** — die
   tragenden Momente sind alle `scrub` (0.4 bis 0.8, `ease: "none"` in der
   Timeline, das Gefühl macht die Scrub-Trägheit), und der Nutzer fährt die
   Kamera, statt sie abzuspielen.
4. **Das Tempo ist ruhig und schwer, mit langem Auslauf** — globaler Default
   `power3.out` / 1s ([AnimationProvider.tsx:28-31](portfolio/src/components/providers/AnimationProvider.tsx#L28-L31)),
   Auftritte `expo.out` und `power2.out` über 0.8–1.4s, Halte-Beats zwischen
   den Schritten (`HOLD` 0.35–0.4 Timeline-Einheiten); nichts schnappt.
5. **Typografie trägt die Dramaturgie mit**: fluide `clamp()`-Displaygrössen bis
   12rem, `tracking-tighter`, Grossbuchstaben in den Kapitelköpfen, dazu ein
   ständiges Filmkorn über allem — die Seite liest sich als Bühne, nicht als
   Dokument.

**Prüffrage für Gate 9:** Fährt der Nutzer die Bewegung selbst, geht Licht auf
statt Elemente an, und wechselt das Material statt der Position? Wo eine mobile
Fassung das nicht mehr tut, ist sie nicht dieselbe Seite.

---

## 2. Section-für-Section

Legende der Klassifizierung:
**P** = PORTIEREN (läuft mobil 1:1) · **Ü** = ÜBERSETZEN (Idee bleibt, Mechanik
ändert sich) · **E** = ERSETZEN (mobil unmöglich/zu teuer, gleichwertige
Alternative) · **S** = STREICHEN (mit Begründung).

### 2.1 Hero — `sections/Hero.tsx` + `hero/hero.css`

Eintritts-Timeline, `gsap.timeline({ delay: 0.4 })`,
[Hero.tsx:64-201](portfolio/src/components/sections/Hero.tsx#L64-L201).
**Diese ganze `useEffect` hat keine einzige Breitenabfrage** — nur einen
`reduced`-Zweig. Alles darin läuft auf jedem Gerät identisch.

| # | Effekt | Trigger | Dauer / Scrub | Easing | Motor | `< 1024px` heute | Klasse |
|---|---|---|---|---|---|---|---|
| H1 | Lampe an: `--glow` −20 → 130 speist einen `mask-image`-Stop | Mount, Position 0 | 1.2 s | `power2.out` | GSAP Timeline | **identisch** | Ü |
| H2 | Zeichnung frei: `--wipe` −25 → 120, zweiter `mask-image` | Mount, Position 0.2 | 1.4 s | `power2.out` | GSAP Timeline | **identisch** | Ü |
| H3 | Headline Zeile 1: `y 40→0`, `opacity`, `blur(8px)→0` | Mount, Position 0 | 1.0 s | `expo.out` | GSAP Timeline | **identisch, inkl. Blur** | Ü |
| H4 | Zeile 2 + Rotationswort: `y 30→0`, `opacity`, `blur(8px)→0` | Mount, Position 0.4 | 0.8 s | `expo.out` | GSAP Timeline | **identisch, inkl. Blur** | Ü |
| H5 | Scroll-Hinweis: `opacity 0→1`, `y 20→0` | Mount, Position 0.8 | 0.8 s | `expo.out` | GSAP Timeline | identisch | P |
| H6 | Pfeil-Wippen: `y → 5` | Mount + 1 s, `repeat: -1`, `yoyo` | 1.1 s / Zyklus | `sine.inOut` | GSAP Tween | identisch | P |
| H7 | Lampen-Sway: `rotation = sin(phase) · amp`, Amplitude baut auf 2° auf | Mount + 1.2 s, `repeat: -1` | 8 s Zyklus, Amp-Aufbau 2.8 s | `none` / `power2.out` | GSAP `onUpdate` → `gsap.set` | identisch | P |
| H8 | Rotationswort-Wechsel | `setInterval`, pausiert bei `heroActive === false` | — | — | React State | identisch | P |

Scroll-Parallax, [Hero.tsx:205-338](portfolio/src/components/sections/Hero.tsx#L205-L338).
Trigger `runway`, `start: "top bottom"`, `end: "bottom top"`, **`scrub: 0.8`**.
Zwei `mm.add()`-Kontexte, die sich nur in `blur` und `intensity` unterscheiden.

| # | Effekt | Position / Dauer (Timeline = 1) | Easing | `≥ 768px` | `< 768px` | Klasse |
|---|---|---|---|---|---|---|
| H9 | Cue-Layer: `y −14`, `opacity 0` | @0, 0.1 | `none` | ✓ | ✓ | P |
| H10 | Headline-Ebene: `y −18 %vh·i`, `scale 0.82`, `opacity 0` | @0, 0.4 | `none` | **+ `blur(10px)`** | ohne Blur, `i = 0.7` | P |
| H11 | Sub-Ebene: `y −14 %vh·i`, `scale 0.85`, `opacity 0` | @0.03, 0.41 | `none` | **+ `blur(8px)`** | ohne Blur, `i = 0.7` | P |
| H12 | Zeichnung: `y −10 %vh·i`, `scale 0.8` + separates `opacity 0` | @0, 1.0 | `none` / `power2.in` | ✓ | `i = 0.7` | P |
| H13 | Lampe: `y −10 %vh·i` + `opacity 0`, **ohne** Scale (Kabel hängt am Rand) | @0, 1.0 | `none` / `power2.in` | ✓ | `i = 0.7` | P |

> Der Hero ist damit die **einzige** Section, deren Desktop-Dramaturgie mobil
> vollständig ankommt. Sein Problem ist nicht Abwesenheit, sondern Kosten: H1–H4
> rastern vier Ebenen gleichzeitig im LCP-Fenster (siehe §4).

### 2.2 Leistungen — `sections/Services.tsx` + `services/services.css`

| # | Effekt | Trigger | Dauer / Scrub | Easing | Motor | `< 1024px` heute | Klasse |
|---|---|---|---|---|---|---|---|
| L1 | Einfahrt: Section kommt als schmaler Balken (`--enter-inset` 9 % → 0 %) und klappt auf, Radius `3rem → --radius-panel` | `top bottom` → `top 55%`, **`scrub: 0.4`** | 0.55 @0.45 | `power2.out` | GSAP, schreibt CSS-Vars, `clip-path` in CSS | **identisch — Query ist nur `(prefers-reduced-motion: no-preference)`, ohne Breite** | P |
| L2 | Inhalt blendet nach, wenn die Fläche fast offen ist | dieselbe Timeline | 0.4 @0.55 | `power1.out` | GSAP | identisch | P |
| L3 | Radius-Token-Wechsel `--radius-panel` → `-lg` | `@media (min-width: 768px)` | — | — | CSS | greift ab 768 | P |
| L4 | **Gepinnte Kapitel:** Textwechsel + Ebenen-Crossfade über `applyScrub(progress)` | `track` `top top` → `bottom bottom`, **`scrub: 0.45`**, Query `(min-width: 1024px) and (prefers-reduced-motion: no-preference)` | scrub | — | GSAP `ScrollTrigger.create` | **läuft nicht** → `useStackReveal(stackRef, { panel: ".services-panel" })`, Variante `rise` | Ü |

### 2.3 Prozess — `sections/Process.tsx` + `hooks/useProcessPin.ts`

Query `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`,
`pin: true`, **`scrub: 0.65`**, `HOLD 0.4` · `MOVE 1.15` · `SCROLL_UNIT 0.95`.

| # | Effekt | Position / Dauer | Easing | Motor | `< 1024px` heute | Klasse |
|---|---|---|---|---|---|---|
| P1 | **Shuttle** fährt `x` zwischen Spalte 2 und Spalte 1 (`shift()` = Spaltenbreite + Gap) | `MOVE` = 1.15 | `none` | GSAP | **läuft nicht** | Ü |
| P2 | Abgehende Copy: `autoAlpha → 0`, `y ±10` | `MOVE·0.5` | `power1.in` | GSAP | läuft nicht | Ü |
| P3 | Ankommende Copy: `y ±18 → 0`, `autoAlpha 0→1` | `MOVE·0.62` @ `+MOVE·0.3` | `power2.out` | GSAP | läuft nicht | Ü |
| P4 | Medien-Crossfade, überlappend damit der Shuttle nie leer ist | 2× `MOVE·0.5` @ `+0.35` / `+0.2` | `power1.inOut` | GSAP | läuft nicht | Ü |
| P5 | Rollzähler `01 → 02`: Streifen `yPercent ∓50` | 0.45 s | `power3.out` | GSAP, DOM direkt | **läuft nicht, kein Zähler im Stapel** | E |
| P6 | Video des aktiven Schritts `play()`, alle anderen `pause()` | `onEnter`/`onUpdate` | — | DOM | im Stapel steuert `IntersectionObserver` in `ProcessMedia.tsx:41-52` | P |
| P7 | **Stapel-Ersatz:** Copy-Stagger, Haarlinie `scaleX`, Bild-Blende `clip-path` links/rechts alternierend, `scale 1.08→1`, dazu `yPercent −2.5→2.5` Parallax | `top 78%`, `once: true` + eigener `scrub: true` | 0.7–1.1 s | `power3.out` / `power3.inOut` | `useStackReveal`, `media: "wipe"` | **das ist der Ist-Zustand** | Ü |

### 2.4 Projekte — `sections/SelectedWork.tsx` + `hooks/useHorizontalPin.ts`

Query identisch zu Prozess, **`scrub: 0.6`**, `HOLD 0.35` · `MOVE 1` ·
`SCROLL_UNIT 0.9`.

| # | Effekt | Position / Dauer | Easing | Motor | `< 1024px` heute | Klasse |
|---|---|---|---|---|---|---|
| W1 | **Horizontaler Track:** `x → −i · pin.clientWidth`, Panel N raus links / N+1 rein rechts | `MOVE` = 1 pro Schritt | `none` | GSAP | **läuft nicht** | Ü |
| W2 | Rollzähler, identische Mechanik zu P5 | 0.45 s | `power3.out` | GSAP, DOM direkt | **läuft nicht, kein Zähler im Stapel** | E |
| W3 | `aria-hidden` folgt dem sichtbaren Panel | `onUpdate` | — | DOM | entfällt (alle Panels sichtbar) | S — im Stapel sind alle Panels tatsächlich sichtbar, die Angabe wäre falsch |
| W4 | Fokus-Fang: Tab in ein Offscreen-Panel scrollt die Seite dorthin statt die Box seitlich | `focusin` | — | DOM + Lenis | entfällt mit dem Pin | S — ohne horizontale Box gibt es kein seitliches Verrutschen |
| W5 | **Stapel-Ersatz:** wie P7, aber `media: "rise"` (`y 44→0`, `scale 0.96→1`, `autoAlpha`) statt Blende — eine `clip-path`-Maske würde die aussen liegenden Gerätepfeile abschneiden | `top 78%`, `once: true` | 0.95 s | `power3.out` | `useStackReveal` | **das ist der Ist-Zustand** | Ü |

### 2.5 Kunden — `sections/Clients.tsx`

| # | Effekt | Trigger | Dauer | Easing | Motor | `< 1024px` heute | Klasse |
|---|---|---|---|---|---|---|---|
| K1 | Logo-Marquee, `motion-safe:animate-[marquee_50s_linear_infinite]` | dauerhaft | 50 s | `linear` | CSS Keyframes | **identisch** | P |

### 2.6 Über mich — `sections/About.tsx` + `about/about.css`

Zwei benannte `matchMedia`-Kontexte auf derselben Bühne,
[About.tsx:170-175](portfolio/src/components/sections/About.tsx#L170-L175).
Trigger `track` `top top` → `bottom bottom`, **`scrub: true`** (ungedämpft).

| # | Effekt | Konstanten | Easing | Motor | `< 768px` (bei Höhe ≥ 660px) | Klasse |
|---|---|---|---|---|---|---|
| A1 | **Kamerafahrt** in den Monitor: `scale 1 → endScale`, Versatz zielt auf das A-Kreuz | `ZOOM_END` 0.52 quer / **0.46 hoch**; `endScale` = `cover` quer / **nur Breite** hoch | `power2.in` | GSAP `gsap.set` pro Frame | **läuft, in eigener Fassung** | P |
| A2 | **Blende** öffnet aus dem Querbalken des Logos, erst seitlich, dann hoch/runter | `WIPE_DURATION` 0.34; `WIPE_SPLIT` 0.38 quer / **0.30 hoch**; Overshoot 2 px | `power2.inOut` | 4 CSS-Vars pro Frame | läuft, in eigener Fassung | P |
| A3 | HUD-Kopie des Logos läuft in Pixeln mit (bewusst ausserhalb der `will-change`-Szene, sonst Bitmap-Upscale) | `width` + `translate3d` pro Frame | — | DOM-Styles | läuft | P |
| A4 | Header zieht nach oben aus dem Bild | `opacity 0`, `y −28`, @0.14 | `power2.in` | GSAP | läuft | P |
| A5 | Track-Höhe = Scrollstrecke der Fahrt | **340vh** quer / **280vh** hoch | — | CSS | eigener Wert | P |
| A6 | Hell/Dunkel-Umschlag der Section (`useLightSection`) am berechneten Flip-Punkt | — | — | Hook | läuft | P |
| A7 | **Höhe < 660px:** Section bleibt statisch, `position: static`, keine Fahrt | — | — | CSS + JS | **nichts. Kein Ersatz.** | E |

> A1–A6 sind der Beleg, dass eine eigenständige mobile Choreografie in diesem
> Projekt schon existiert und funktioniert — About ist die einzige Section mit
> einem eigens gerechneten Hochformat-Pfad. Sie ist die Vorlage für Phase 1.

### 2.7 CTA — `sections/GiganticCTA.tsx`

| # | Effekt | Trigger | Dauer / Scrub | Easing | Motor | `< 768px` heute | Klasse |
|---|---|---|---|---|---|---|---|
| C1 | Karte wächst: `scale 0.7 → 1`, Radius 2rem, `clip-path inset(100%→0%)` | `top bottom` → `top 30%`, **`scrub: 0.5`** | 0.32 + 0.68 | `none` | GSAP | — | — |
| C2 | **Mobile Fassung:** Vollbild-`clip-path`-Blende von unten, Radius oben 1.5rem | `top bottom` → `top 70%`, **`scrub: 0.5`** | — | `none` | GSAP | **läuft** | P |
| C3 | Pfeil `group-hover:translate-x-1` | Hover | 500 ms | `--ease-out-expo` | CSS | **tot auf Touch** | E |
| C4 | Link-Farbwechsel per `onMouseEnter` / `onMouseLeave` | Hover | 300 ms | CSS-Transition | React inline style | tot auf Touch, aber **sauber gepaart** — bleibt nicht hängen | E |
| C5 | Tippziele `pointer-coarse:min-h-11` (44px) | — | — | — | CSS | **greift bereits** | P |

> C1/C2 schalten über **`window.innerWidth < 768` beim Mount** — kein
> `matchMedia`, kein Resize-Listener, kein `no-preference`-Zusatz. Siehe
> [Blocker B1](#b1).

### 2.8 Globales Chrome

| # | Effekt | Trigger | Dauer | Easing | Motor | `< 1024px` heute | Klasse |
|---|---|---|---|---|---|---|---|
| G1 | Nav fährt von oben ein: `y 0`, `opacity 1` | Mount, `delay: 0.65` | 0.8 s | `expo.out` | GSAP | identisch | P |
| G2 | Burger → X, zwei `motion.span` | Klick | 0.3 s | framer-motion default | framer-motion | identisch | P |
| G3 | **Vollbildmenü:** `clip-path circle(0% → 150%)` von oben rechts, darunter `backdrop-blur-xl` + `bg-bg-primary/98` | Klick | 0.6 s | `cubic-bezier(0.76, 0, 0.24, 1)` | framer-motion | identisch | Ü |
| G4 | Menüeinträge gestaffelt: `y`, `opacity` | Menü offen | 0.6 s, Stagger 0.08 s | `cubic-bezier(0.22, 1, 0.36, 1)` | framer-motion | identisch | P |
| G5 | Scroll-Fortschrittsbalken `scaleX(progress)` | Scroll | — | — | React inline, `willChange` | identisch | P |
| G6 | Filmkorn `--animate-grain: grain 8s steps(10) infinite` | dauerhaft | 8 s | `steps(10)` | CSS Keyframes | identisch | P |
| G7 | Lenis Smooth-Scroll | — | `duration: 1.2` | eigene Exponential-Kurve | Lenis | **aus ≤ 768px**, an ab 769 (= alle iPads ausser mini hoch) | P |

---

## 3. Invarianten-Register

Jede `gsap.matchMedia()`-Query gegen ihren CSS-Zwilling. Driften sie
auseinander, ist das Ergebnis ein dauerhaft aus dem Bild stehendes Panel oder
200vw Overflow — so kommentiert in
[globals.css:412-414](portfolio/src/app/globals.css#L412-L414).

| # | JS-Query | Datei:Zeile | CSS-Zwilling | Datei:Zeile | Status |
|---|---|---|---|---|---|
| I1 | `(min-width: 1024px) and (prefers-reduced-motion: no-preference)` | `useHorizontalPin.ts:119` | identisch | `globals.css:415` | ✅ byte-gleich |
| I2 | `(min-width: 1024px) and (prefers-reduced-motion: no-preference)` | `useProcessPin.ts:113` | identisch | `process.css:187` | ✅ byte-gleich |
| I3 | `(min-width: 1024px) and (prefers-reduced-motion: no-preference)` | `Services.tsx:412` | identisch | `services.css:490` | ✅ byte-gleich |
| I4 | `(prefers-reduced-motion: no-preference)` | `Services.tsx:322` | identisch | `services.css:22` | ✅ byte-gleich |
| I5 | `(min-width: 768px) and (prefers-reduced-motion: no-preference)` | `About.tsx:172` (Key `desktop`) | identisch, erster Arm der Kommaliste | `about.css:438` + `:514` | ✅ byte-gleich |
| I6 | `(max-width: 767px) and (min-height: 660px) and (prefers-reduced-motion: no-preference)` | `About.tsx:173-174` (Key `mobile`) | identisch, zweiter Arm | `about.css:439` + `:540` | ✅ byte-gleich |
| I7 | `(max-width: 1023px) and (prefers-reduced-motion: no-preference)` | `useStackReveal.ts:15` | **kein exakter Zwilling** — das Gegenstück ist die *Abwesenheit* von I1/I2 plus `globals.css:402` (`max-width: 1023px`, **ohne** `no-preference`) | `globals.css:402` | ⚠️ asymmetrisch, aber **korrekt**: bei `<1024px` + reduced-motion greift das Stapel-Layout, `useStackReveal` läuft nicht, und die Inhalte bleiben sichtbar, weil die Startzustände von GSAP statt CSS kommen ([useStackReveal.ts:42-43](portfolio/src/hooks/useStackReveal.ts#L42-L43)) |
| I8 | `(min-width: 768px) and (prefers-reduced-motion: no-preference)` (Hero-Parallax) | `Hero.tsx:323` | `@media (min-width: 768px)` **ohne** `no-preference` | `hero.css:86` | ⚠️ **kein Zwillingspaar** — die CSS-Regel setzt Lampengeometrie, die JS-Query den Parallax. Sie sehen wie Zwillinge aus, sind aber getrennte Zuständigkeiten. **Nicht versehentlich angleichen.** |
| I9 | `(max-width: 767px) and (prefers-reduced-motion: no-preference)` (Hero-Parallax mobil) | `Hero.tsx:328` | keiner | — | ✅ rein additiv |
| I10 | `(max-width: 768px)` (Lenis aus) | `SmoothScroll.tsx:11` | keiner | — | ⚠️ **inklusiv 768** → widerspricht `hero.css:86` und `Hero.tsx:323`, die 768 dem Desktop geben. Siehe [Blocker B2](#b2) |
| I11 | `(max-width: 768px)` (`useIsMobile`) | `useMediaQuery.ts:20` | keiner | — | ⚠️ dieselbe Kante wie I10 |
| I12 | `(max-width: 1023px)` (`ScrollTrigger.refresh` nach Akkordeon) | `ProcessCopy.tsx:26` | Gegenstück zu I2 | `process.css:187` | ✅ korrekt komplementär |
| I13 | `(min-width: 768px)` (Radius-Token) | `Services.tsx:330` | identisch | `services.css:33` | ✅ byte-gleich |
| I14 | `(max-width: 767px) and (min-height: 660px)` (Flip-Punkt `useLightSection`) | `About.tsx:152-153` | dieselben Werte wie I6, aber **ohne** `no-preference` | `about.css:540` | ⚠️ bewusst: der Flip-Punkt muss auch bei reduzierter Bewegung stimmen |

**Regel für alle Iterationen:** Vor jeder Änderung an einer dieser Queries
beide Seiten gleichzeitig anfassen und danach diffen. I8 und I14 sind die
Fallen — sie *sehen* wie Paare aus und sind bewusst keine.

---

## 4. Performance-Budget-Kandidaten

Regressionsschwelle aus `bd49d0b`: **≤ 323 KB beim Aufruf, ≤ 451 KB nach vollem
Durchscrollen bei 390×844.** Die Liste unten ist nach Kosten sortiert, nicht
nach Section.

| # | Kandidat | Warum teuer | Läuft heute mobil? |
|---|---|---|---|
| B-1 | **H1 + H2: zwei animierte `mask-image` gleichzeitig** | `mask-image` ist kein Compositor-Property. Das Lampen-SVG wird 1.2 s lang pro Frame neu gerastert, die Zeichnung 1.4 s — bei DPR 3 auf einer vierstelligen Pixelzahl | **ja, ungebremst** |
| B-2 | **H3 + H4: zwei animierte `filter: blur()` auf Textkästen** | `filter` ist die teuerste animierbare Eigenschaft. Beide liegen im Fenster 0–1.2 s, also **exakt im LCP-Fenster**, parallel zu Hydration, Font-Swap und B-1 | **ja, ungebremst** |
| B-3 | **G3: `backdrop-blur-xl` vollflächig unter einer `clip-path`-Kreisanimation** | Vollbild-Backdrop-Filter, dessen Clipping-Region sich 0.6 s lang jeden Frame ändert — der Blur muss pro Frame über die neue Region neu gerechnet werden. Der einzige echte Blur-Kandidat der Seite (Gate 5) | ja, bei jedem Menüöffnen |
| B-4 | **P7/W5: `scrub: true` ohne Dämpfung, ein Trigger pro Panel** | Der Parallax in `useStackReveal.ts:139-153` läuft mit `scrub: true` (ungedämpft, jeder Frame) und wird **pro Panel** angelegt — bei 4 Prozessschritten + n Projekten sind das n+4 gleichzeitig aktive Scrub-Trigger. Alle anderen Scrubs im Projekt sind gedämpft (0.4–0.8) | **ja, das ist der mobile Hauptpfad** |
| B-5 | **A1–A3: drei Style-Schreibvorgänge pro Frame bei `scrub: true`** | `applyZoom` schreibt `gsap.set(scene)`, `hud.style.width` und `hud.style.transform`; `applyWipe` danach 4 CSS-Vars. Ebenfalls ungedämpft | ja, bei Höhe ≥ 660px |
| B-6 | **P7: `clip-path`-Blende auf der Bildkante** | `clip-path`-Animation über 0.95 s pro Panel; immerhin `once: true` und danach `clipPath: "none"` | ja |
| B-7 | **Vier Prozess-Videos im Stapel** | Im gepinnten Layout spielt nur der aktive Clip. Im Stapel hängt jeder Clip an einem eigenen `IntersectionObserver` — beim Durchscrollen laden und spielen **alle vier nacheinander**. Der `opacity`-Check in `ProcessMedia.tsx:38-40` greift nur im Shuttle | **ja — der grösste Einzelposten im 451-KB-Budget** |
| B-8 | **G6: Filmkorn dauerhaft** | `steps(10)` über 8 s, ganzflächig, nie abgeschaltet | ja |
| B-9 | **K1: Marquee 50 s** | CSS-Transform-Animation, dauerhaft, aber compositor-freundlich | ja |

**Für Phase 1 wichtig:** B-1, B-2 und B-4 zusammen bedeuten, dass die
teuersten Effekte der Seite genau die sind, die mobil ungebremst laufen,
während die günstigsten (Pins, reine `x`-Transforms) dort abgeschaltet sind.
Das ist die Kostenrechnung genau falsch herum.

---

## 5. Phase 0.5 — offene Blocker, die vor dem Konzept gehören

Aus den 18 Blockern in `MOBILE-PLAN.md` bleiben nach dem geschärften Scope
(kein Telefon-Querformat) und nach Gegenprobe am aktuellen Code **vier**, die
Motion an der falschen Grenze schalten. Alles Übrige ist Layout/Typo und bleibt
in `MOBILE-PLAN.md` liegen.

<a id="b1"></a>
### B1 — CTA schaltet über `window.innerWidth`, nicht über `matchMedia`

[GiganticCTA.tsx:23](portfolio/src/components/sections/GiganticCTA.tsx#L23):
`const isMobile = window.innerWidth < 768;`

Drei Folgen:
1. **Kein Resize/Rotation.** Der Wert wird einmal beim Mount gelesen. Dreht man
   ein iPad über die 768er-Naht, bleibt die falsche Fassung stehen — das ist
   genau der Rotationsfall aus Gate 7.
2. **Kein `prefers-reduced-motion`.** Beide Zweige laufen bei reduzierter
   Bewegung mit; die Section ist die einzige mit GSAP-Scroll ohne den
   `no-preference`-Zusatz, den der Loop ausnahmslos verlangt.
3. **`gsap.context` statt `gsap.matchMedia`** — ein Bruch mit dem Hauspattern,
   der genau die Umschaltung verhindert, die überall sonst funktioniert.

Desktop-Risiko: keins. `window.innerWidth < 768` ist auf einem Maus-Desktop
immer `false`, und `(min-width: 768px)` liefert dort denselben Zweig.

<a id="b2"></a>
### B2 — Die 768er-Naht widerspricht sich

Bei **exakt 768px** gilt gleichzeitig: `hero.css:86` und `Hero.tsx:323` sagen
Desktop (Lampengeometrie + Parallax mit Blur), `useMediaQuery.ts:20` und
`SmoothScroll.tsx:11` sagen Mobile (Lenis aus). Kein Zielgerät im Scope ist
exakt 768px breit — aber die Regel „768 gehört der grösseren Seite" muss
festgezogen sein, bevor Phase 1 neue Queries an diese Naht hängt, sonst erbt
jede davon den Widerspruch.

Maßnahme: `(max-width: 768px)` → `(max-width: 767.98px)` an beiden Stellen.
Desktop-Risiko: keins, wirkt ausschliesslich im Punkt 768.

<a id="b3"></a>
### B3 — iPad Pro/Air 13″ hochkant trifft `1024` auf den Pixel

1024×1366 matcht `(min-width: 1024px)` — das Gerät bekommt den horizontalen Pin
und den Prozess-Shuttle in einem **Hochformat**, für das beide nie ausgelegt
wurden (`--frame-h` rechnet mit `78vh`, `--frame-w` mit `100vw - 40ch`).
Gleichzeitig ist es ein Touch-Gerät ohne Hover.

Das ist eine **Entscheidung für Phase 1**, kein Fix: Pin behalten und fürs
Hochformat auslegen, oder die Grenze auf `(min-width: 1024px) and (pointer: fine)`
heben. Beides vertretbar — aber es muss eine Entscheidung sein.

<a id="b4"></a>
### B4 — Zwei Effekte sind ersatzlos tot

- **A7:** unter 660px Fensterhöhe (im Scope: nur 320×568) ist die
  About-Kamerafahrt aus, ohne jedes Pendant. Die Section ist dort eine
  statische Textspalte.
- **P5/W2:** die Rollzähler existieren im Stapel nicht. Der Desktop zählt dem
  Nutzer vor, wo er in der Sequenz steht; mobil fehlt diese Orientierung
  vollständig.

Beide gehören ins Konzept, nicht in einen Fix.

---

## 6. Korrekturen

Punkte, an denen `files/MOBILE-GAUNTLET-LOOP.md` oder `MOBILE-PLAN.md` vom
aktuellen Code abweichen. Der Loop bleibt im Übrigen gültig.

| Fundstelle | Behauptung | Tatsächlich |
|---|---|---|
| Loop, Sectionliste | Leistungen: „Kapitel-Pin **ab 768px**" | Ab **1024px** (`Services.tsx:412` / `services.css:490`). Ab 768 wechselt dort nur ein Radius-Token |
| Loop, Gate 6 | `GiganticCTA.tsx:223` — „`onMouseEnter` schreibt `style.color` direkt, **bleibt auf Touch dauerhaft hängen, es gibt kein `onMouseLeave`**" | Ein `onMouseLeave` **existiert** ([GiganticCTA.tsx:224](portfolio/src/components/sections/GiganticCTA.tsx#L224)). Der Zustand hängt nicht. Bleibt ein Hover-Only-Signal (C4), ist aber kein Defekt |
| Loop, Gate 6 | Tippziele als offener Punkt | `pointer-coarse:min-h-11` steht bereits an beiden Links (Zeilen 221, 266) |
| Loop, Gate 1 | „`node_modules` ist in diesem Container leer", Playwright unter `/opt/pw-browsers` | Gilt für die Cloud-Umgebung. **Lokal:** `node_modules` ist gefüllt (375 Pakete), `/opt/pw-browsers` existiert nicht, `playwright` liegt unter `~/.nvm/.../bin/playwright`. Die Messkette aus „Verifikation dieses Plans" muss vor Gate 2–4 lokal neu verifiziert werden |
| Loop, Abschluss | Commit auf `claude/mobile-plan-availability-r0vpvn` | Wir stehen auf `main`; der Branch existiert nur remote. Zielbranch vor Phase 2 klären |
| `MOBILE-PLAN.md` 0.2 | `useMediaQuery` sollte auf `useSyncExternalStore` umgestellt werden | Weiterhin offen ([useMediaQuery.ts:6](portfolio/src/hooks/useMediaQuery.ts#L6) initialisiert auf `false`). Aber: **kein einziger Motion-Pfad hängt daran** — `useIsMobile` steuert nur den Maus-Parallax im Hero. Damit Layout-Thema, nicht Motion-Blocker → bleibt in `MOBILE-PLAN.md` |
| `MOBILE-PLAN.md` 0.3 | Landscape-Phones brauchen einen eigenen Kurzformat-Zweig | **Entfällt** — Telefon-Querformat ist per `f26f009` ausserhalb des Scopes |

---

## 7. Was das für Phase 1 heisst

Drei Beobachtungen, die das Konzept tragen sollten:

1. **Der Stapel ist nicht leer, er ist uniform.** `useStackReveal` liefert
   Prozess und Projekte dieselbe Bewegung mit zwei Bild-Varianten. Der Desktop
   unterscheidet die beiden Sections dramaturgisch scharf (Shuttle quer durch
   die Spalten vs. Panels, die seitlich durchlaufen) — mobil sind sie
   ununterscheidbar.
2. **Die Vorlage existiert schon im Haus.** About ist die einzige Section mit
   einem eigens gerechneten Hochformat-Pfad (A1–A6, eigene `ZOOM_END`, eigene
   Trackhöhe, eigener Blenden-Split). Sie beweist, dass „gleiche DNA, andere
   Mechanik" in diesem Code funktioniert, und liefert das Muster.
3. **Die Kostenrechnung steht falsch herum.** Mobil laufen die teuren Effekte
   (Masken, Blurs, ungedämpfte Scrubs) und die günstigen sind abgeschaltet. Wer
   in Phase 1 Motion hinzufügt, ohne B-1/B-2/B-4 gegenzurechnen, reisst das
   451-KB- und das 50-fps-Gate gemeinsam.

---

**→ STOP.** Freigabe abwarten, dann Phase 1 (Mobile-Konzept).
