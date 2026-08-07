# Mobile-Plan: Handy und Tablet auf Desktop-Niveau

---

## ⏸ STATUS — pausiert am 2026-08-06, vor der ersten Code-Änderung

**Umgesetzt: nichts.** Es existiert keine Code-Änderung aus diesem Plan. Der Arbeitsbaum enthält
ausschließlich Lucas eigene Arbeit. Nichts hier kollidiert mit paralleler Entwicklung.

**Angelegt wurden nur zwei Dateien:** dieses Dokument und `.mobile-audit/audit-raw.json`
(vollständiges Audit: 8 Bereiche, 173 Findings, 87 Motion-Einträge, mit Datei/Zeile, Schweregrad,
Zielviewports, Vorschlag und Desktop-Risiko pro Eintrag).

**Nächster Schritt:** Phase 0.1 — die Off-by-one-Kante bei 768/1024 in
`src/hooks/useMediaQuery.ts` und `src/components/providers/SmoothScroll.tsx`. Danach 0.2, 0.4, 0.3,
dann die Blocker in der Reihenfolge 1.1 → 1.3 → 1.2 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9.

**Audit-Basis:** HEAD `4e0aaf2`, plus die zu dem Zeitpunkt nicht committeten Änderungen an
`globals.css`, `Hero.tsx`, `about.css`, `hero.css`, `framer-moveable-thumbnails.tsx` und
`constants.ts`.

> ⚠️ **Beim Wiederaufnehmen zuerst prüfen:** Alle Zeilennummern in diesem Dokument stammen aus
> diesem Stand. Wenn seither an einer der genannten Dateien gearbeitet wurde, sind die Referenzen
> zu verifizieren, bevor sie als Anker benutzt werden. Die *Befunde* bleiben gültig, die
> *Zeilennummern* möglicherweise nicht.

**Noch zu entscheiden** (Details am Dokumentende): About-Umbau ja/nein, Hero-Höheneinheit
`dvh` voll oder nur auf der Section, iPad-Projekte mobil randlos ja/nein.

**Noch offen:** Playwright ist nicht installiert, das Audit ist rein statisch. Alle Zahlen sind
aus den CSS-Werten nachgerechnet, nicht gemessen. Vor der Umsetzung wäre eine visuelle Gegenprobe
auf den Zielgeräten sinnvoll — sie kann Rechenfehler aufdecken und liefert zugleich die
Desktop-Baseline für Phase 7.

---

**Design Read:** Portfolio-Landingpage (Modus *Experience*) für Auftraggeber, die dich meist zuerst
auf dem Handy sehen. Dunkle, cineastische Bronze-Bühne mit choreografiertem Scroll. Die mobile
Fassung soll dieselbe Aussage treffen, aber in mobiler Grammatik: vertikal statt horizontal,
Druck statt Hover, kürzere Wege statt langer Runways.

**Harte Constraint:** Die Desktop-Ansicht ändert sich nicht. Kein gerendertes Pixel ab 1024px
mit feinem Zeiger. Jede Maßnahme unten ist entweder additiv unterhalb der Grenze oder
nachweislich desktop-neutral (Begründung steht jeweils dabei).

**Entschiedene Rahmenbedingungen:**
- Desktop bleibt `≥1024px`. iPad Landscape behält Pinning und horizontalen Track, bekommt aber
  Touch-Äquivalente und Höhenkorrekturen.
- Motion-Ambition: eigenständige mobile Choreografie. Jede abgeschaltete Desktop-Animation
  bekommt ein mobil gedachtes Gegenstück, keine Streichung.
- Die beiden Hijack-Sections werden mobil zum vertikalen Scrub-Stack.

---

## Befund

Audit über alle 7 Sections plus Chrome und Motion-Primitives: **173 Findings, 87 Animationen
inventarisiert.**

| | Anzahl |
|---|---|
| Blocker (sichtbar kaputt) | 18 |
| Major | 84 |
| Minor | 71 |
| davon ohne jedes Desktop-Risiko | 129 |
| davon Desktop-Regel wird im Text angefasst, Ergebnis beweisbar gleich | 40 |
| davon echtes Desktop-Risiko | 4 |

Verteilung: Performance 41, Motion 38, Layout 35, Touch 24, Typografie 19, Viewport-Höhe 16.

**Die Kernaussage:** Die Seite ist mobil nicht *unfertig*, sie ist mobil *ungedacht*. Es gibt
Mobilzweige, aber sie sind Restposten des Desktops. 23 der 87 Animationen laufen unter 1024px
gar nicht, ohne Ersatz. Gleichzeitig laufen die teuersten Effekte (animierte `filter`, `mask-image`,
`clip-path`) auf dem Handy ungebremst mit, wo sie am meisten kosten.

**Nebenbefund, der viel Arbeit spart:** 12 Primitives sind gar nicht importiert und damit toter
Code: `CustomCursor`, `Marquee`, `CounterAnimation`, `FlipCard`, `HorizontalScroll`,
`ScrollHighlight`, `RollingText`, `WorkflowScene`, `Parallax`, `StaggerReveal`, `CardSpotlight`,
`AnimatedLink`. Sie stehen nicht im Umsetzungs-Scope.

---

## Die Schutzmechanik: warum Desktop sicher ist

Vier Eigenschaften des Projekts machen den Desktop-Schutz technisch garantierbar statt nur
sorgfältig. Sie sind die Grundlage jeder Maßnahme unten.

**1. Die Section-CSS-Dateien sind ungelayert.** `hero.css`, `about.css`, `services.css` und
`process.css` werden per Import ohne `@layer` geladen, Tailwind v4 legt seine Utilities dagegen
in `@layer utilities` ([globals.css:1](portfolio/src/app/globals.css#L1)). Ungelayerte Regeln
schlagen gelayerte immer, unabhängig von Spezifität und Reihenfolge. **Folge:** Mobile Overrides
können vollständig in den CSS-Dateien leben. Kein einziges `md:`- oder `lg:`-Utility im TSX muss
angefasst werden.

**2. `svh`, `vh` und `lvh` sind auf Desktop identisch.** Ohne dynamische Browser-Chrome fallen
alle drei zusammen. Jede Umstellung von `vh` auf `svh`/`dvh` ändert auf einem Desktop-Browser
exakt 0 Pixel und wirkt ausschließlich dort, wo eine einziehbare Toolbar existiert.

**3. `(pointer: coarse)` und `(hover: hover)` trennen Gerät von Breite.** Ein Maus-Desktop matcht
nie `pointer: coarse`. Ein Zweig mit dieser Bedingung ist damit beweisbar unerreichbar für
Desktop, egal wie breit er formuliert ist.

**4. `touch-action` wirkt nur auf Touch- und Pen-Eingabe.** Änderungen daran sind für Maus und
Trackpad folgenlos.

---

## Phase 0: Die Breakpoint-Ordnung reparieren

Muss zuerst. Alles Weitere hängt daran, und der aktuelle Zustand erzeugt Widersprüche, die sich
sonst durch jede spätere Maßnahme durchziehen.

### 0.1 Die Off-by-one-Kante bei 768 und 1024

Heute widersprechen sich JS und CSS an genau den beiden Kanten, die die Zielgeräte treffen.
Bei exakt **768px (iPad Portrait)** gilt gleichzeitig: `useIsMobile()` ist `true`
([useMediaQuery.ts:20](portfolio/src/hooks/useMediaQuery.ts#L20), `max-width: 768px`), Tailwinds
`md:` ist aktiv, die Desktopzweige in `hero.css:86`, `about.css:315` und `services.css:33` greifen,
und Lenis ist aus ([SmoothScroll.tsx:11](portfolio/src/components/providers/SmoothScroll.tsx#L11)).
Der Hero schaltet also Logik ab, während das Layout darunter im Desktopmodus steht.

Dieselbe Kante bei 1024: `useIsTablet` deckt bis einschließlich 1024 ab, `useIsDesktop` beginnt
bei 1025, aber `globals.css:415` und `useHorizontalPin.ts:119` pinnen ab 1024. Ein iPad Landscape
ist für die Hooks Tablet und für das CSS Desktop.

**Maßnahme.** Regel für das ganze Projekt: *768 und 1024 gehören immer der größeren Seite.*

| Datei | von | auf |
|---|---|---|
| `useMediaQuery.ts:20` | `(max-width: 768px)` | `(max-width: 767.98px)` |
| `useMediaQuery.ts:24` | `(min-width: 769px) and (max-width: 1024px)` | `(min-width: 768px) and (max-width: 1023.98px)` |
| `useMediaQuery.ts:28` | `(min-width: 1025px)` | `(min-width: 1024px)` |
| `SmoothScroll.tsx:11` | `(max-width: 768px)` | `(max-width: 767.98px)` |

Desktop-Risiko: keins. Wirkung ausschließlich in den Punkten 768 und 1024/1025. `useIsTablet` und
`useIsDesktop` sind laut repoweitem Grep nirgends verwendet, dort ist die Änderung folgenlos.
Nebeneffekt: iPad Portrait bekommt Lenis, wie sein Layout es ohnehin erwartet.

### 0.2 `useMediaQuery` liefert im ersten Render immer `false`

[useMediaQuery.ts:5-17](portfolio/src/hooks/useMediaQuery.ts#L5-L17) initialisiert `matches` auf
`false` und korrigiert erst im Effekt. Auf einem 375px-Handy rendert der Hero deshalb einen Frame
lang den Desktopzweig, bevor er umschaltet.

**Maßnahme.** Auf `useSyncExternalStore` umstellen, dasselbe Muster das
[AnimationProvider.tsx:23](portfolio/src/components/providers/AnimationProvider.tsx#L23) bereits
benutzt: Client-Snapshot `() => window.matchMedia(query).matches`, Server-Snapshot `() => false`.
Der Client-Snapshot ist dann schon im ersten Render korrekt.

### 0.3 Landscape-Phones fallen in den Desktop-Pfad

**Das ist eines der vier Findings mit echtem Desktop-Risiko, und es braucht die vorsichtigste
Lösung.** Alle Desktopzweige prüfen ausschließlich die Breite. Ein iPhone 14 quer ist 844px breit
und 390px hoch, fällt damit ab 768px in den vollen Desktop-Pfad: Lenis an, dreispaltiges
About-Layout auf 390px Höhe, Hero-Parallax mit animiertem Blur.

Konkret nachgerechnet für iPhone SE quer (667x375, nutzbare Höhe ~285px): der Hero-Copy-Block
braucht 227,5px, verfügbar sind 205,2px. `overflow-hidden` schneidet oben und unten je 11px ab,
die erste Zeile beginnt bei y = -11px, direkt hinter der fixen Nav.

**Maßnahme.** Die bestehenden `(min-width: …)`-Zweige *nicht* umschreiben. Stattdessen einen
vorgelagerten Kurzformat-Zweig einziehen, der eine Kombination bedient, die auf Desktop praktisch
nicht vorkommt:

```css
@media (orientation: landscape) and (max-height: 500px) { … }
```

Ein Desktopfenster ist praktisch nie unter 500px hoch, iPad Landscape ist 768 bzw. 834px hoch.
Der Zweig ist damit für jedes Zielgerät mit Desktop-Charakter unerreichbar.

Inhalt für den Hero: Typo von `vw` auf `vh` entkoppeln (im Querformat ist die Höhe die knappe
Ressource), `padding-bottom` auf 16svh, `justify-content: flex-end` mit `padding-top: 7rem` damit
die Copy unter der Nav startet, und Zeichnung plus Lampe als eigene rechte Spalte
(`--desk-box: 42vw`). Das ist die mobil *gedachte* Querformat-Fassung statt einer gestauchten
Hochformat-Fassung.

Für About analog: `@media (max-height: 520px)` nimmt die Section aus dem gepinnten
Drei-Spalten-Layout (`position: static`, `height: auto`).

### 0.4 Safe-Areas systematisch verfügbar machen

Das Layout läuft mit `viewportFit: "cover"`
([layout.tsx:86](portfolio/src/app/layout.tsx#L86)), aber `env(safe-area-inset-bottom)` wird im
gesamten Projekt genau einmal berücksichtigt. Weder `<body>` noch eine der Vollbildbühnen
kompensiert den Home-Indicator.

**Maßnahme.** `--safe-b: env(safe-area-inset-bottom)` mit `0px`-Default in `:root` definieren,
damit der Wert allen Sections zur Verfügung steht. Außerdem
[globals.css:380 und 392](portfolio/src/app/globals.css#L380) auf dieselbe `max()`-Formel bringen,
die `.work-container` schon benutzt: `max(var(--container-padding), env(safe-area-inset-left))`.
Ohne Notch lösen die `env()` zu 0 auf, der Ausdruck ist dann rechnerisch identisch zu heute.

---

## Phase 1: Blocker

Was heute auf einem Zielgerät sichtbar kaputt ist. 18 Stück, hier die schwersten nach Section.

### 1.1 Hero: die Komposition verrutscht beim Scrollen um 190px

Der klebende Hero ist `h-svh` ([Hero.tsx:421](portfolio/src/components/sections/Hero.tsx#L421)),
und alle inneren Anker rechnen in `svh` (`pb-28svh`, `mb-11svh`, `--desk-w: 82.94svh`,
`--lamp-hang: 9svh`). `svh` ist die *kleine* Viewporthöhe und ändert sich nie. Sobald die
URL-Leiste einklappt, wächst der sichtbare Bereich auf `lvh`, auf iPhone 14 von ~553px auf ~745px.
Der Hero bleibt 553px hoch und klebt an `top: 0`. Die Zeichnung steht dann nicht mehr 61px über
der Bildschirmkante, sondern 251px. Der Scroll-Hinweis schwebt frei in der unteren Bildschirmhälfte.

**Maßnahme.** Unter 1024px auf `dvh` umstellen, ausschließlich in `hero.css`. Die ScrollTrigger-
Seite ist bereits abgesichert: `ScrollTrigger.config({ ignoreMobileResize: true })` steht in
[AnimationProvider.tsx:38](portfolio/src/components/providers/AnimationProvider.tsx#L38), das
Einklappen löst also keinen Pin-Sprung aus.

*Ehrlicher Trade-off:* Die Komposition wandert während des Einklappens mit. Das ist das gewünschte
Verhalten und entspricht einer nativen App. Wer den Reflow ganz vermeiden will, setzt nur
`height: 100dvh` auf der Section und lässt die inneren Anker in `svh` - dann bleibt das schwarze
Band weg, die Zeichnung sitzt aber weiterhin etwas zu hoch.

### 1.2 About: der Streifen passt auf keinem Telefon in die Bühne

Nachgerechnet für 390x844 (Bühne 664px): verfügbar sind 554px, gebraucht werden ~741px.
`.about-content` ist `display: flex; align-items: center`, bei Überlauf schneidet
`.about-stage { overflow: hidden }` oben und unten je ~93px ab. Die Anrede fehlt, der obere Teil
des Porträts fehlt, die zweite Tool-Reihe (GitHub, Spotify, YouTube) ist unsichtbar und nicht
erreichbar. Auf 430x932 bleiben 723px verfügbar bei 730px Bedarf. **Es passt auf keinem Telefon.**
Reines Verkleinern von Abständen bringt nachgerechnet nur 94px, es fehlen 187px.

**Maßnahme.** Die Blende mobil nur noch die Titelkarte enthüllen lassen. `.about-annotations` und
`.about-titleblock` per `useIsMobile()` aus `.about-panel` in ein Geschwister-Element
`.about-flow` verschieben (beide Blöcke bleiben genau einmal im DOM, kein Duplikat). Dort bekommen
sie eigene ScrollTrigger: `start: "top 82%"`, `y: 24 → 0`, `opacity 0 → 1`, `stagger: 0.08`, kein
Scrub. Die Bühne trägt danach nur noch `.about-lead` (~234px in 554px), also komfortabel.

### 1.3 About: die `min-height: 660px`-Schwelle liegt 1px neben dem iPhone

[about.css:540](portfolio/src/components/sections/about/about.css#L540) prüft `(min-height: 660px)`.
Auf dem 844pt-iPhone liegt die Layout-Viewporthöhe bei ~659px mit Leiste und ~745px ohne. Die
Schwelle liegt exakt dazwischen. Folge: `gsap.matchMedia` revertet und rebuildet den kompletten
Mobile-Kontext mitten im Scrollen, das CSS klappt zwischen `sticky + height 280vh` und statischem
Fluss um, die Dokumenthöhe springt um ~1400px. `ignoreMobileResize` hilft hier *nicht*, es
unterdrückt nur ScrollTrigger-Refreshes, nicht die matchMedia-Change-Events.

**Maßnahme.** Die Höhenbedingung aus der Media Query nehmen und einmalig in JS entscheiden:
`document.documentElement.dataset.aboutMotion = tall ? 'on' : 'off'`, nur bei `orientationchange`
neu berechnen, nie bei `resize`. In der CSS-Query den Attribut-Gate `html[data-about-motion='on']`
statt der Höhenbedingung.

### 1.4 About: die dreispaltige Fassung wird auf iPad abgeschnitten

Die Mindestbreiten des Streifens summieren sich auf ~1450px: `.about-annotations` hat
`min-width: 448px`, `.about-plate` ist `flex: 0 0 auto` und kann nicht schrumpfen,
`.about-statement` trägt `whitespace-nowrap`. Verfügbar sind bei 768px aber nur 656px. Die
Flex-Row läuft über, `overflow: hidden` schneidet die rechte Tools-Spalte auf iPad Portrait
komplett ab. Nicht scrollbar, nicht erreichbar.

**Maßnahme.** Additiver Block *nach* `about.css:419` für 768-1099px, der das gestapelte Layout
wiederherstellt (späterer Block, gleiche Spezifität, gewinnt per Quellreihenfolge). Ab 1100px
ändert sich kein gerendertes Pixel. Tools als 6-spaltiges Grid, das die vorhandene Tabletbreite
nutzt.

### 1.5 About: der Satz ist auf jedem Telefon rechts abgeschnitten

[About.tsx:657-663](portfolio/src/components/sections/About.tsx#L657-L663) setzt beide Zeilen des
Statements in `whitespace-nowrap`. Die Textspalte ist mobil ~181px breit, die Zeile
"Ich interessiere mich für Technik," braucht ~265px.

**Maßnahme.** Der Umbruch ist eine Desktop-Setzentscheidung. In `about.css`:
`@media (max-width: 767px) { .about-statement span { display: inline; white-space: normal } }`.
Gewinnt gegen die Tailwind-Utility, weil `about.css` ungelayert ist (siehe Schutzmechanik 1).

### 1.6 SelectedWork: das Rahmen-Budget rechnet gegen die falsche Höhe

Die Pin-Box misst sich in `svh`, das Höhenbudget des Geräterahmens darin aber in `vh`
([globals.css:443](portfolio/src/app/globals.css#L443)). Auf iPad Safari sind das ~90-140px
Differenz: der Rahmen wird für eine Bühne bemessen, die höher ist als die, in der er steht.
`overflow: hidden` schneidet ab.

**Maßnahme.** `78vh` → `78svh`. Auf jedem Desktop-Browser ohne dynamische Chrome sind die Werte
definitionsgemäß identisch, die berechneten Pixel ändern sich dort um exakt 0.

### 1.7 GiganticCTA: die Kuh wird zu einem Drittel abgeschnitten

Das Easter Egg hängt per `absolute right-[calc(100%+0.55rem)] w-[6.4rem]` links neben dem Button
und ragt unter ~410px aus der Karte, die es per `overflow-hidden` abschneidet. Auf 375px sind es
37px, auf 360px 45px.

**Maßnahme.** Nur die Basisklassen tauschen, alle `sm:`/`md:`-Klassen unangetastet: die Kuh mobil
*über* den Button setzen statt daneben. Ab 640px ist das Ergebnis byte-gleich zu heute.

### 1.8 Chrome: das Menü sperrt den Scroll nicht

Es gibt im ganzen Projekt keinen Zugriff auf `document.body.style.overflow`. Auf Desktop fällt das
kaum auf, weil Lenis das Mausrad über dem Overlay fängt. Mobil ist Lenis aus: ein Wischen auf dem
Overlay scrollt die Seite dahinter ungebremst weiter. Der Nutzer tippt einen Menüpunkt und landet
woanders. Zusätzlich feuern alle `useStackReveal`-Trigger (`once: true`) hinter dem Overlay ab,
ihre Reveals sind verbraucht, bevor der Nutzer den Inhalt je gesehen hat.

**Maßnahme.** Effekt in `Navigation.tsx`, der beim Öffnen die Scrollposition per
`position: fixed; top: -Ypx` auf `<body>` einfriert (iOS ignoriert reines `overflow: hidden`),
beim Schließen zurücksetzt und `window.scrollTo(0, Y)` nachzieht. Rein additiv.

### 1.9 Chrome: Grain-Overlay ist der teuerste Dauerposten

`inset: -50%; width: 200%; height: 200%` spannt die vierfache Viewportfläche auf, darauf läuft ein
SVG-Filter mit `feTurbulence numOctaves=3`. Auf einem 390x844-Gerät mit DPR 3 sind das 2340x5064
Device-Pixel Filterergebnis, rund 47 MB Backing Store. SVG-Filter laufen auf mobilem Chrome und
Safari **nicht** auf der GPU. Die Animation läuft ununterbrochen, auch wenn niemand scrollt, und
jeder Hell/Dunkel-Umschlag löst einen Full-Screen-Repaint aus.

**Maßnahme.** `filter: url(#grain-filter)` aus dem Inline-Style in eine Klasse verschieben (sonst
per Media-Query nicht überschreibbar), dann unter 1024px auf eine 128px-Rauschkachel als
`background-image` mit `background-position`-Animation umstellen. Bei 3,5% Deckkraft ist der
Unterschied zu `feTurbulence` auf einem Handydisplay nicht wahrnehmbar. Der Desktopblock bleibt
Zeichen für Zeichen unverändert.

---

## Phase 2: Touch-Grammatik

Die Seite ist für Hover gebaut. Auf Touch fällt an vielen Stellen die einzige Rückmeldung weg,
ohne dass etwas an ihre Stelle tritt.

### 2.1 Der einzige Haupt-CTA hat auf Touch keinerlei Feedback

`MagneticButton` bricht bei
[MagneticButton.tsx:25](portfolio/src/components/ui/MagneticButton.tsx#L25) ab, weil
`useSupportsHover()` auf jedem Touch-Gerät `false` ist. Die `hover:`-Klassen sind durch Tailwinds
Hover-Kapselung ebenfalls stumm. Beim Antippen passiert visuell nichts.

**Maßnahme.** Touch-Zweig statt Leerlauf, additiv neben dem bestehenden Early-Return:
`onPointerDown` → `gsap.to(el, { scale: 0.95, x: (touchX-cx)*0.12, y: (touchY-cy)*0.12,
duration: 0.12 })`, `onPointerUp`/`onPointerCancel` → `{ scale: 1, x: 0, y: 0, duration: 0.5,
ease: "back.out(2.2)" }`. Gleiche Physik-Anmutung, nur vom Finger ausgelöst statt vom Zeiger.
Dazu `group-active:translate-x-1` am Pfeil neben das bestehende `group-hover:`.

### 2.2 Hover-Regeln ohne Guard lassen Elemente deaktiviert aussehen

`.about-tool:hover` ist die einzige Aufhellung der sechs Tool-Links, ohne
`@media (hover: hover)`-Guard. Auf Touch bleiben alle sechs dauerhaft bei 55% Deckkraft und lesen
sich wie deaktivierte Elemente, obwohl es externe Links sind. Nach einem Tap hält iOS den
Hover-Zustand zusätzlich fest.

Dasselbe Muster bei den Social-Links in `GiganticCTA`, die ihre Farbe per
`onMouseEnter`/`onMouseLeave` direkt auf `e.currentTarget.style.color` setzen. iOS feuert beim Tap
ein synthetisches `mouseenter`, das passende `mouseleave` kommt erst beim nächsten Tap woanders.
Der zuletzt angetippte Link bleibt dauerhaft eingefärbt.

**Maßnahme.** Hover-Regeln in `@media (hover: hover) and (pointer: fine)` einfassen (Desktop fällt
exakt hinein, Ergebnis dort byte-identisch), darunter einen Touch-Ruhezustand mit höherer
Grundhelligkeit und `:active`-Zustand setzen. Bei den Socials die Handler und das Inline-`style`
ersatzlos streichen und über `hover:` plus `active:` Klassen fahren.

### 2.3 Der Vorher-Nachher-Wipe springt bei jeder Berührung

`handlePointerDown` in `ServicesLandscape` ruft `setFromClientX(event.clientX)` sofort auf. Die
Schnittkante springt bei jeder Berührung an die Fingerposition, auch wenn der Nutzer nur scrollen
wollte. Auf iPad Landscape belegt die Figur ~52% der Bildschirmbreite bei 400vh Scrollstrecke:
jeder Flick, der auf der Zeichnung startet, verändert das Bild.

**Maßnahme.** Den Sofort-Sprung auf `event.pointerType === 'mouse'` beschränken. Für touch und pen
den Startpunkt in einem Ref merken und `draggingRef` erst setzen, wenn `|Δx| > 8px` **und**
`|Δx| > |Δy|` (horizontale Absicht). Der Mauspfad bleibt Zeile für Zeile identisch.

Zusätzlich `touch-action: pan-y` → `pan-y pinch-zoom`. Heute ist auf der ganzen Figur Pinch-Zoom
gesperrt, obwohl das Dokument mit `maximumScale: 5` Zoom ausdrücklich zulässt.

### 2.4 Das Karussell sagt nicht, dass es eines ist

Keine Dots, kein Zähler, kein Rand-Peek. Die Slides sind `w-full shrink-0`, sitzen also
kantenbündig. Die einzige Affordanz sind zwei Pfeile, die bei den iPad-Projekten mobil *auf* dem
Bild liegen und zusammen 128 von 311px belegen, also 41% der Bildfläche.

**Maßnahme.** Pfeile unter 1024px aus dem Rahmen nehmen und als Leiste unter das Gerät legen,
dazu eine Dot-Reihe in einem 44px hohen Tap-Streifen. `active:scale-95` an beide Buttons. Die
`lg:`-Klassen bleiben unverändert.

### 2.5 Die Prozess-Inhalte sind hinter zugeklappten Accordions unsichtbar

`type="single" collapsible` ohne `defaultValue`, alle drei Punkte jedes Schritts sind zu. Die
einzige Einladung ist ein 16px-Chevron bei 55% Deckkraft. Auf Desktop gibt es Hover, Cursor-Wechsel
und Anfasser; auf Touch fällt das komplett weg.

**Maßnahme.** `ProcessCopy` eine optionale Prop `defaultOpen?: string` geben. Nur `ProcessPanel`
(der Stapel-Zweig) setzt sie, der Pin-Zweig nicht. Der Desktop rendert also unverändert alles
geschlossen.

### 2.6 Tap-Targets unter 44px

Der Logo-Link umschließt nur ein `h-5`-Image, die klickbare Fläche ist 20px hoch. Er zeigt auf
`href="#"`, was auf Mobile einen History-Eintrag erzeugt und den Zurück-Button verbraucht. Der
Hero enthält überhaupt kein Touch-Target: Hinweis-Wrapper, Illustrationsebene, Lampenebene und
Copy-Container sind alle `pointer-events-none`, man kann nicht einmal den Namen markieren.

**Maßnahme.** Logo-Link auf `-m-3 p-3` (negativer Margin plus Padding vergrößert nur die
Trefferfläche, Optik und Position bleiben pixelgleich, auch auf Desktop), `href="#main-content"`.
Den Scroll-Hinweis unter 1024px zu einem echten `<a href="#services">` mit `min-h-11 min-w-11`
machen.

### 2.7 Ankersprünge landen unter der Nav

Kein `scroll-margin-top` im gesamten Projekt. Nach dem Sprung steht die Sectionoberkante auf y=0,
die fixe Nav liegt aber mobil ~104px hoch darüber. Dazu springt jeder Anker hart, weil
`scroll-behavior: auto` und Lenis mobil aus ist.

**Maßnahme.** `@media (max-width: 1023px) { #work, #services, … { scroll-margin-top:
calc(env(safe-area-inset-top) + 6.5rem) } html { scroll-behavior: smooth } }`. Auf Desktop ist
Lenis zuständig, dort würde `smooth` sich mit ihm beißen, deshalb die Breitengrenze.

---

## Phase 3: Die mobile Choreografie

Der eigentliche Kern. 23 Animationen laufen unter 1024px nicht. Für jede gibt es hier ein
mobil gedachtes Gegenstück, kein Ersatzlos.

### 3.1 Hero: Tiefe kommt vom Scrollen statt vom Zeiger

Der Maus-Parallax ist mobil abgeschaltet
([Hero.tsx:512](portfolio/src/components/sections/Hero.tsx#L512), `transform: "none"`), aber
`useMousePosition` läuft trotzdem: eine rAF-Dauerschleife ruft alle 3 Frames `setPosition` mit
einem *neuen* Objektliteral auf, also ~20 vollständige Re-Renders des Hero-Baums pro Sekunde,
für immer, auf einem Gerät ohne Maus.

**Ersatz.** Hook hinter `(hover: hover) and (pointer: fine)` gaten (Early-Return vor
`addEventListener`). Als mobile Tiefe dieselben Ebenen an den bereits existierenden Scroll-Scrub
koppeln: im mobilen `matchMedia`-Zweig ein zusätzliches `tl.to(textLayer, { x: -6, duration: 1 }, 0)`.
Die Kopfzeile driftet dann beim Scrollen leicht gegen Lampe und Zeichnung, ohne einen einzigen
zusätzlichen Listener.

### 3.2 Hero: Blur wird zu Bewegung

`filter: blur(8px) → blur(0px)` läuft auf beiden Textblöcken auf jedem Handy, überlappend, und
gleichzeitig laufen zwei Masken-Wipes. `filter` und `mask-image` sind beide keine
Compositor-Properties: jeder Frame ist eine Neurasterung, und zwar exakt im LCP-Fenster parallel
zu Hydration und Font-Swap.

**Ersatz.** Unter 768px Blur streichen und die Bewegung *verstärken*, damit der Auftritt nicht
schwächer wird: `y: 56 → 0` statt 40, dazu ein Wechsel der Laufweite (`letterSpacing`
`-0.02em → -0.05em`). Das liest sich als Scharfstellen wie der Blur, kostet aber nur Layout auf
einer Zeile. Die beiden Zeilen um 0.08s gegeneinander versetzen: zwei gestaffelte Zeilen lesen
sich auf einem schmalen Screen als mehr Choreografie als ein gemeinsamer Blur.

Den Zeichnungs-Wipe unter 768px horizontal statt vertikal laufen lassen (Gradient 90deg statt
180deg). Die Zeichnung ist dort ein 341x132px breiter flacher Streifen; ein vertikaler Wipe über
132px ist kaum als Bewegung lesbar, ein horizontaler über 341px schon.

### 3.3 Services: die Fortschrittslinie wird zum sticky Balken

Unter 1024px sind Kapitelwechsel, Fortschrittslinie, Kapitelzähler und Kapitelliste alle aus, sie
stecken im `display: none`-Pin. Der Stapel hat keinerlei Fortschrittsanzeige.

**Ersatz.** Die Linie ist die eine Idee, die sich direkt übersetzen lässt: dieselbe
`.services-rail__fill` als sticky Balken am oberen Rand von `.services-stack`, gespeist vom
Scroll-Fortschritt der Section. `scaleX` auf einer 1px-Haarlinie ist auch auf Mittelklasse-Android
billig. Daneben die Ordnungszahl als sticky Mitläufer, gespeist vom selben Trigger.

Die Kapitelliste wird *nicht* nachgebaut: der Stapel **ist** die Kapitelliste. Stattdessen die
aktive Etage markieren, `toggleClass` auf `.services-panel` bei `start: 'top 60%'`.

### 3.4 Services: die Zeichnung bekommt einen Auftritt und einen Scrub

Die Zeichnung, auf Desktop das dominante Element der Bühne, bekommt mobil **gar keinen Auftritt**:
`useStackReveal` sucht `[data-reveal='media']` nur innerhalb eines `.services-panel`, die
Stack-Landscape liegt aber als Geschwister davor. Und der Vorher-Nachher-Wipe steht bei 50/50 und
wartet auf eine Ziehgeste, die niemand vermutet.

**Ersatz.** Zwei Schritte. Erstens die Zeichnung in ein eigenes
`<article class="services-panel services-panel--visual">` mit innerem `[data-reveal='media']`
legen, innerhalb von `stackRef` aber außerhalb von `.services-track` (die Haarlinien-Regel ist auf
`.services-track >` gescopt). Zweitens den Wipe an den Scroll koppeln statt an die Geste:
`gsap.to` auf ein Proxy `{v: 12} → {v: 88}`, `ease: none`, ScrollTrigger `start: 'top 80%'`,
`end: 'bottom 35%'`, `scrub`. Der Vergleich führt sich dann selbst vor, die Ziehgeste bleibt
zusätzlich möglich.

### 3.5 Process: der Shuttle-Wipe wird zum alternierenden Einrücken

Der Seitenwechsel des Bildes zwischen Spalte 2 und Spalte 1 ist komplett aus.

**Ersatz.** Der *Seitenwechsel* ist die Idee, nicht die Horizontale. Im Stapel-Zweig pro Panel das
Medium abwechselnd einrücken: gerade Schritte `x: -6% → 0`, ungerade `x: 6% → 0`, synchron zur
bestehenden Clip-Blende. `CLIP_FROM` alterniert in `useStackReveal` bereits nach Index, die
Ordnung ist also schon da.

Dazu die Ziffernrolle zurückholen: `rollCounter()` aus `useProcessPin.ts` nach `src/lib/` heben
(reines DOM plus GSAP, keine Abhängigkeit zum Pin) und im Stapel als
`position: sticky; top: calc(env(safe-area-inset-top) + 4.5rem)` Mini-Zähler über `.process-track`
setzen. Gleiche Optik wie Desktop, nur klein.

### 3.6 Process: der Reveal feuert, bevor das Bild im Bild ist

Eine einzige Timeline pro Panel, `start: 'top 78%'`, `once: true`. Die Copy sitzt oben im Panel,
das Bild ganz unten. Auf 375x667 ist ein Panel ~900px hoch: wenn der Trigger feuert, steht das
Bild rechnerisch noch weit unter der Viewportkante. Der Auftritt des Bildes ist vorbei, bevor man
es sieht.

**Ersatz.** Die Media-Tweens aus der Panel-Timeline herauslösen und in eine eigene Timeline mit
`trigger: art, start: 'top 88%'` legen. Identische Werte, identische Alternierung, nur der Trigger
wandert vom Panel auf das Bild. Dasselbe für die `<li>`-Elemente in `SelectedWork`.

### 3.7 SelectedWork: der horizontale Track wird zum vertikalen Scrub-Stack

Wie entschieden: kein Pin, kein Gestenkonflikt, native Scroll-Physik. Aber auch kein stummer
Stapel.

**Ersatz.** Neuer `gsap.matchMedia`-Zweig `(max-width: 1023px) and (prefers-reduced-motion:
no-preference)` in `useHorizontalPin.ts`, der **nicht** den Track bewegt, sondern pro Panel die
Gerätespalte choreografiert: beim Verlassen `scale: 0.92`, `opacity: 0.55` scrub-gebunden an das
Erscheinen des nächsten Panels; beim Eintreten von unten `y: 40 → 0`. Dazu der Counter-Roll
`01→02→03→04` als `yPercent: -50 → 0` bei `start: 'top 60%'`, synchron mit dem `scaleX`-Aufziehen
der Haarlinie. Derselbe Takt wie auf dem Desktop, nur in der vertikalen Achse.

Zusätzlich das Layout drehen: heute kommt mobil zuerst der komplette Textblock (~575px), erst
danach das Gerät. Auf einem 667px-Screen sieht man eine volle Bildschirmhöhe lang nur Text, bevor
klar wird, worum es geht. Fix: `max-lg:contents` am Copy-Container, dann sind die Kinder unterhalb
1024px direkte Grid-Items und lassen sich umsortieren, während ab `lg` alles wieder in der
ursprünglichen Struktur liegt.

### 3.8 SelectedWork: die Geräte-Mockups sind höhengetrieben statt breitengetrieben

`--frame-h: clamp(240px, 60vh, 560px)` macht das Mockup mobil höhengetrieben, obwohl mobil die
Breite der knappe Faktor ist. Auf 375x667 wird das iPhone-Mockup 196px breit, also 52% der
Viewportbreite für das Hauptmotiv. Die beiden iPad-Projekte zeigen 1920px breite
Dashboard-Screenshots in einem 311px breiten Ausschnitt: Verkleinerungsfaktor 6, nichts ist lesbar.

**Ersatz.** Unter 1024px breitengetrieben rechnen:
`--frame-h: min(78svh, clamp(300px, calc((100vw - 2*var(--container-padding)) * 1.45), 620px))`.
Und unter 768px für die iPad-Projekte die Bezel-Metapher aufgeben: das Bild randlos über die volle
Breite führen statt es in den Container-Rand zu quetschen.

### 3.9 About: der kleinste Screen bekommt endlich Bewegung

Unterhalb 660px Fensterhöhe gibt es *keinen* matchMedia-Zweig. Die Section mit der aufwendigsten
Choreografie der ganzen Seite ist auf dem kleinsten Zielgerät (iPhone SE) vollständig bewegungslos.

**Ersatz.** Dritter, rein additiver Zweig `(max-width: 767px) and (max-height: 659px) and
(prefers-reduced-motion: no-preference)` **ohne** Pinning: ScrollTrigger auf `.about-content`,
`start: "top 88%"`, `end: "top 30%"`, `scrub: 0.4`, der dieselbe Bandmetapher als reinen
`clip-path`-Zug fährt. Kurze Screens brauchen keine gepinnte Bühne, aber sie brauchen die Blende.

Dazu für alle Telefone: `scrub: true` → `scrub: 0.45`. `scrub: true` ist 1:1-Kopplung ohne
Glättung. Quer hängt Lenis mit `duration: 1.2` davor und macht daraus eine weiche Fahrt; mobil ist
Lenis aus, es gibt nur den impulsgesteuerten iOS-Fling. Der Wert 0.45 ist eine Nachlaufzeit und
ersetzt genau das, was Lenis quer leistet.

Und der Establishing-Shot wird zum Raum statt zum Briefkastenschlitz: `.about-art` bleibt mobil
bei `width: 100%` mit `aspect-ratio: 1.884`, auf 390px also ein 207px hoher Streifen in einer
664px hohen Bühne. Fix: `width: max(100%, calc(72svh * var(--art-ratio)))`. Die Monitorfläche
wächst von 111px auf 258px, `endScale` fällt von 3.64 auf 1.58, die Fahrt wird lesbar.

### 3.10 Clients: der Ticker wird greifbar

Auf 375px sieht man 12% des Tracks und wartet bis zu 50 Sekunden, um alle sechs Kunden zu sehen.
Die einzige natürliche Touch-Geste (am Balken ziehen) tut nichts. Dazu ist `ITEM_GAP` mobil 144px,
eine Sequenz damit ~3100px breit.

**Ersatz.** Unter 768px den Auto-Lauf durch einen steuerbaren Drift ersetzen:
`overflow-x: auto`, `scroll-snap-type: x proximity`, `scroll-snap-align: center` an den Items,
Scrollbar versteckt. Die CSS-Animation läuft weiter, bis der Nutzer anfasst. Basiswerte senken:
`gap-x-16 md:gap-x-48` und `px-8 md:px-24`. Ab 768px sind die berechneten Werte identisch zu heute.

### 3.11 GiganticCTA: die Blende bekommt Weg und wird billig

Die Blendenstrecke ist nur 30vh, auf 667px also ~200px. Ohne Lenis legt ein normaler Flick 200px
in wenigen Frames zurück, die Blende springt statt zu laufen. Und sie scrubbt `clip-path: inset()`
auf einer 100vh großen Cremefläche, was jeden Frame den kompletten Paint der Karte invalidiert.

**Ersatz.** `end: () => "+=" + Math.round(clientHeight * 0.45)`: eine in Pixeln eingefrorene
Distanz ist gegen den URL-Leisten-Kollaps immun und gibt dem Flick genug Weg. Dazu denselben
Bottom-up-Wipe als Compositor-Arbeit bauen: ein Overlay-Div mit `origin-top` und
`scaleY: 1 → 0` statt `clip-path`. Optisch identisch, aber GPU-beschleunigt.

Dazu den Effekt insgesamt in `gsap.matchMedia()` umziehen. Heute wird `isMobile` einmalig in einem
`useEffect(…, [])` ausgewertet, ohne Resize-Listener: wer im Portrait lädt und dreht, behält den
Mobile-Zweig auf 844px Breite.

### 3.12 Navigation: der Menü-Stagger bekommt eine zweite Achse

Der Stagger läuft, aber es gibt keinen Exit-Stagger, die Einträge verschwinden schlagartig.

**Ersatz.** Pro Eintrag zusätzlich ein alternierender `x`-Offset (`-24px` / `+24px` → 0) und eine
1px-Haarlinie darunter, die per `scaleX: 0 → 1` mit 0.06s Versatz nachzieht. Dieselbe
Links-rechts-Ordnung, die `useStackReveal` für die gestapelten Sections bereits verwendet, also
eine durchgehende mobile Grammatik statt eines Einzeleffekts. Dazu einen Exit-Stagger in 60% der
Enter-Dauer.

---

## Phase 4: Performance

Auf einem Mittelklasse-Handy entscheidet das über den Eindruck mehr als jede Animation.

| Problem | Datei | Maßnahme |
|---|---|---|
| `will-change: transform` permanent auf einem ~375x4600px-Track | `SelectedWork.tsx:74` | Klasse entfernen, Eigenschaft in den Desktop-Block `globals.css:423-427` verschieben |
| `will-change` permanent auf 4 Reel-Strips mit 54 Bildern | `framer-moveable-thumbnails.tsx:320` | Nur während der Bewegung setzen (`isMoving`-State) |
| `unoptimized: true` liefert 1920x1462 und 1206x2622 Originale ans Handy | `constants.ts:328, 372` | Flag entfernen, Cache-Bust über Dateinamen lösen |
| Beide Zeichnungen mit `priority`, doppelt gemountet, Pin-Instanz unter `display:none` | `ServicesLandscape.tsx:113-132` | `priority` und `sizes` zu Props machen, Stack-Instanz auf `priority={false}` |
| `sizes` unterschätzt die Stack-Darstellung (65vw statt ~88vw) | `ServicesLandscape.tsx:117, 127` | Stack-Instanz auf `88vw`, Desktop-String unverändert |
| `sizes` frame-unabhängig, obwohl die Rahmen um Faktor 1.7 differieren | `framer-moveable-thumbnails.tsx:343, 361` | Aus `frame` ableiten, `≥1024px`-Teil wortgleich lassen |
| Video und Poster von Schritt 1 werden sofort geladen, obwohl 3 Screens unter der Falz | `ProcessMedia.tsx:80, 92` | Prop `eager?: boolean`, nur der Pin-Zweig setzt sie |
| `ScrollTrigger.refresh()` feuert bei jedem Accordion-Toggle, und *nur* unter 1024px | `ProcessCopy.tsx:22-35` | Gezielt statt global: den 4 Parallax-Scrubs IDs geben und nur diese refreshen |
| Beide Layouts permanent im DOM, nur per `display:none` getauscht | `Process.tsx:80-149` | Nur den passenden Zweig rendern (`useSyncExternalStore`, Server-Snapshot = Stapel) |
| Marquee läuft permanent, auch offscreen (Browser pausieren das nicht) | `Clients.tsx:67` | `animation-play-state` per IntersectionObserver toggeln |
| Animiertes WebP 358 KB bei 384px, dargestellt mit 102px, Loop läuft dauerhaft | `GiganticCTA.tsx:178-187` | 160px-Variante per `<source media="(max-width: 639px)">` |
| Backdrop-Blur 24px hinter einem zu 98% deckenden Overlay | `Navigation.tsx:75` | Unter 1024px Blur weg, Grund volldeckend. Optisch identisch |
| Lampen-Sway erzeugt 60 Tween-Allokationen pro Sekunde, für die ganze Sitzung | `Hero.tsx:169-192` | `gsap.quickSetter` statt `gsap.set`, beide Loops an `heroActive` hängen |
| `blur`-From-Vars werden auch im Mobile-Zweig geschrieben | `Hero.tsx:256, 271` | From-Vars konditional machen wie die To-Vars |
| Kein `ScrollTrigger.refresh()` nach dem Bilder-Laden | `AnimationProvider.tsx:60-70` | Breitengegateter `load`-Listener unter 1024px |
| `pinType: "fixed"` friert auf iOS während Momentum-Scroll | `AnimationProvider.tsx:26-38` | `if (ScrollTrigger.isTouch === 1) ScrollTrigger.defaults({ pinType: "transform" })` |
| `clip-path` plus `mix-blend-mode: multiply` plus `blur` pro Scroll-Frame | `about.css:183-191`, `About.tsx:415-424` | Vormultipliziertes Porträt-WebP mobil, Blur-Tween durch Kreuzblende zweier Bilder ersetzen (Compositor-only) |
| `hud.style.width` pro Frame (layout-auslösend) | `About.tsx:318-322` | Mobil auf `transform: translate3d(…) scale(…)` wechseln |

---

## Phase 5: Typografie

Vier der Display-Größen haben zu hohe clamp-Untergrenzen
([globals.css:25-28](portfolio/src/app/globals.css#L25-L28)). Bei `--text-display-xl:
clamp(4rem, 12vw, 12rem)` unterschreitet der `12vw`-Term die `4rem` erst ab 533px: unterhalb steht
die Schrift fix auf 64px, auf einem 375px-Screen mit 24px Padding bleiben 327px nutzbare Breite.

**Maßnahme.** Nur die Untergrenzen senken. Sie binden per Definition ausschließlich unterhalb der
genannten Breiten, ab 533/600/640/800px rechnet `clamp()` weiter exakt mit dem `vw`-Term und ab
den Obergrenzen mit dem alten Maximum. Vorschlag: `xl` auf `clamp(2.75rem, 12vw, 12rem)`, die
übrigen analog.

Dazu drei Stellen, an denen die Hierarchie mobil kippt:

- **Services:** Der Sectiontitel "LEISTUNGEN" fällt auf sein clamp-Minimum 28px, die
  Leistungs-Überschriften darunter stehen bei 41px. Die h3 sind 47% größer als die h2, die sie
  einleiten soll. Auf 1440px ist das Verhältnis korrekt.
- **SelectedWork:** "PROJEKTE" und "POWER SHOP SERVICE APP" landen auf jedem Phone auf exakt
  derselben Größe, weil beide clamp-Terme erst ab 760 bzw. 980px greifen.
- **Process:** Die Accordion-Antworten stehen bei 12px und 55% Deckkraft, für den eigentlichen
  Substanzinhalt jedes Prozessschritts. Auf 15px und 72% heben. Der Titel
  "AUTOMATISIERUNG & SOFTWARE" braucht `hyphens: auto` plus `overflow-wrap: anywhere`, `lang="de"`
  steht bereits am `<html>`.

Alle vier per ungelayerter Regel in der jeweiligen Section-CSS, kein Token wird angefasst.

---

## Phase 6: iPad Landscape

Bleibt laut Entscheidung im Desktop-Pfad, braucht aber vier Korrekturen, die keinen Maus-Desktop
erreichen können.

1. **Pin-Typ.** `ScrollTrigger.defaults({ pinType: "transform" })` bei `isTouch === 1`. Behebt das
   Einfrieren gepinnter Elemente während Momentum- und Rubberband-Scroll auf iPadOS.
2. **Rahmen-Budget.** `78vh` → `78svh` (siehe 1.6).
3. **Copy-Überlauf im Work-Panel.** Gerechnet für 1024x768 in Safari: ~471px Panelinhalt verfügbar,
   ~534px gebraucht. `overflow: hidden` schneidet Titelkante und letztes Feature weg, ohne
   Scrollbalken, ohne Hinweis. Fix in
   `@media (min-width:1024px) and (pointer:coarse) and (max-height:900px)`: Feature-Beschreibungen
   ausblenden oder auf drei Einträge kürzen. `(pointer: coarse)` schließt jeden Zeigergeräte-Desktop aus.
4. **Prozess-Scrollstrecke.** ~3310px bei stehendem Bild. Auf der Maus mit Lenis ist das ein
   Kapitel, mit dem Finger sind es sieben bis acht Wischer. Additiver zweiter `mm.add`-Zweig
   `(min-width: 1024px) and (pointer: coarse)` mit lokalen Konstanten (`HOLD 0.25`, `MOVE 0.9`),
   ergibt ~1140px. Dasselbe für den Services-Runway: `h-[400vh]` in eine Klasse mit
   `var(--services-runway, 400svh)` überführen (auf Desktop identisch) und für Touch kürzen.

---

## Phase 7: Verifikation

Kein Punkt gilt als erledigt ohne Gegenprobe.

**Desktop-Regression zuerst.** Vor jeder Phase Screenshots bei 1280, 1440, 1920 und 2560 anlegen,
danach pixelweise vergleichen. Das ist die einzige Absicherung, die die Constraint wirklich prüft.

**Zielgeräte:** iPhone SE 375x667, iPhone 14/15 390x844, Pro Max 430x932, Android 360x800,
iPad Portrait 768x1024 und 834x1194, iPad Landscape 1024x768 und 1194x834. Jeweils Hoch- **und**
Querformat.

**Pro Gerät prüfen:**
- Kein horizontaler Scroll auf keiner Section
- URL-Leiste ein- und ausklappen während des Scrollens durch Hero, About und CTA
- Gerät drehen mitten in jeder gepinnten Section
- Jede Section mit einem einzigen schnellen Flick durchscrollen (nicht langsam), dann prüfen ob
  Reveals verbraucht sind, bevor man sie gesehen hat
- Menü öffnen, dahinter wischen, Menüpunkt tippen, Landeposition prüfen
- Jedes tappbare Element antippen und halten: gibt es Feedback, bleibt ein Hover-Zustand kleben
- Mit `prefers-reduced-motion: reduce` durchlaufen: `TextReveal` hat heute keinen Guard, GSAP
  schreibt Inline-Styles und ist vom globalen CSS-Reset unberührt, alle fünf Section-Überschriften
  fliegen weiterhin
- Bei größter Dynamic-Type-Einstellung durchsehen

**Performance:** Lighthouse Mobile vor und nach Phase 4. Ziel LCP < 2,5s, INP < 200ms, CLS < 0,1.
Zusätzlich ein Performance-Trace auf einem echten Mittelklasse-Android während des Scrollens durch
Hero und About, den beiden teuersten Sections.

---

## Reihenfolge und Abhängigkeiten

```
Phase 0 (Breakpoint-Ordnung)
   └─> alles Weitere. Ohne 0.1 widersprechen sich jede spätere Query und jeder Hook.

Phase 1 (Blocker)      ─┐
Phase 2 (Touch)        ─┼─> unabhängig voneinander, parallel machbar
Phase 4 (Performance)  ─┘

Phase 3 (Choreografie)  ─> braucht 1.1 (Hero-dvh), 1.2 (About-Umbau) und 0.1 vorher,
                           sonst baut man Animation auf eine Bühne, die sich noch ändert.

Phase 5 (Typografie)    ─> jederzeit, berührt nichts anderes.
Phase 6 (iPad)          ─> nach Phase 4 (der pinType-Default gehört dorthin).
Phase 7                 ─> nach jeder Phase, nicht nur am Ende.
```

**Empfohlener erster Schnitt:** Phase 0 plus die fünf Blocker 1.1 bis 1.5. Danach ist die Seite auf
jedem Zielgerät benutzbar und die Fläche steht, auf der die Choreografie aus Phase 3 aufbaut.

---

## Offene Punkte, die eine Entscheidung brauchen

1. **About-Umbau (1.2).** Die saubere Lösung verschiebt zwei Blöcke per `useIsMobile()` aus der
   Bühne in einen eigenen Fluss. Das ist der größte strukturelle Eingriff im ganzen Plan. Die
   Zwischenlösung (Abstände und Schriftgrößen senken) deckt nachgerechnet nur die Hälfte des
   Überlaufs, die zweite Tool-Reihe bliebe teilweise unerreichbar. Ich empfehle den Umbau.

2. **Hero-Höheneinheit (1.1).** Volle Umstellung auf `dvh` bedeutet, dass die Komposition beim
   Einklappen der URL-Leiste mitwandert. Das ist natives App-Verhalten, aber es ist Bewegung, die
   der Nutzer nicht ausgelöst hat. Die kleinere Variante lässt das schwarze Band verschwinden,
   akzeptiert aber eine leicht zu hoch sitzende Zeichnung.

3. **iPad-Projekte randlos (3.8).** Unter 768px die Bezel-Metapher aufgeben widerspricht der
   Gestaltungsidee der Section, macht die Dashboard-Screenshots aber überhaupt erst lesbar. Das
   ist eine Design-Entscheidung, keine technische.
