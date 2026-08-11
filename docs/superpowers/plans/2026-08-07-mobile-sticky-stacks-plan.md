# Plan — Sticky-Bildstapel für die mobile Adaption

Basis-Commit: `58f276a`. Der Prozess-Stapel hat den Sticky-Rahmen bereits
(`process.css`, `.process-panel__media`). Dieser Plan zieht dasselbe Muster
durch die beiden verbliebenen gestapelten Sections und macht die
Prozess-Blende scroll-getrieben.

## Kontext

Die Seite ist eine Portfolio-Landingpage (Next.js 16 App Router, GSAP 3 +
ScrollTrigger, Lenis, Tailwind v4). Ab 1024px mit feinem Zeiger laufen
gepinnte Desktop-Choreografien (horizontaler Track, Shuttle). Darunter —
und auf iPad 13″ hochkant — greift ein gestapelter Aufbau, der bisher nur
ein Copy-Stagger plus Bildblende war.

Das Referenzmuster steht in
[`process.css`](../../../portfolio/src/components/sections/process/process.css)
unter dem Kommentar „Gestapelter Aufbau: das Bild hält, die Copy zieht daran
vorbei". Nachgemessen auf 393×852: `media.top` bleibt über 480px Scrollweg
konstant.

## Global Constraints — binden jede Task

1. **Desktop ist unantastbar.** `(min-width: 1024px) and (pointer: fine)`
   muss pixelgleich bleiben. Verifikation ist Pflicht, nicht Behauptung:
   ```
   cd portfolio
   node scripts/mobile-matrix.mjs shots .verify   # DEVICES=desktop-1440
   node scripts/mobile-matrix.mjs diff .baseline .verify desktop-1440
   ```
   Grenzwert: grösster mittlerer Kanalabstand ≤ 1.0. Der Rauschboden auf
   unverändertem Code ist 0.00.
2. **Vor jeder Messung:** `lsof -ti:3000 | xargs kill -9`, dann
   `rm -rf .next && pnpm run build && pnpm run start`. Ein Server aus einem
   älteren Build liefert HTML mit Verweisen auf überschriebene CSS-Dateien —
   Status 200, aber ohne Styles. Der Runner bricht dann mit einer
   Stylesheet-Fehlermeldung ab; das ist kein Codefehler.
3. **Keine neue Motion-Library, kein neues Pattern.** Animationen laufen als
   `useEffect` + `gsap.matchMedia()` + `mm.revert()` im Cleanup. `useGSAP`
   wird im Projekt nirgends benutzt.
4. **Jede GSAP-Query bekommt `and (prefers-reduced-motion: no-preference)`.**
   Ausnahmslos. Reine Layout-Regeln (`position: sticky`) dagegen **ohne** —
   Sticky ist keine Animation.
5. **Breitenbedingung für gestapelte Layout-CSS** (wörtlich, spiegelt
   `STACK_QUERY` aus `src/lib/breakpoints.ts`):
   ```css
   @media (max-width: 1023.98px),
     (min-width: 1024px) and (pointer: coarse) and (orientation: portrait) {
   ```
6. **`svh` auf Bühnen, nie `dvh`.** `dvh` ändert seinen Wert während die
   URL-Leiste fährt und vermisst gepinnte Bühnen neu.
7. **Nur `transform` und `opacity` animieren.** Kein `filter`, keine
   Layout-Eigenschaften.
8. Kein `any`, kein `@ts-ignore`, kein „deaktiviert" statt gelöst.
9. **Kommentare auf Deutsch**, im Ton des Bestands: erklären *warum*, nicht
   *was*. Der Bestand begründet Zahlen (siehe `WIPE_SPLIT` in `About.tsx`).
10. Gate vor jedem Commit: `npx tsc --noEmit` (0 Fehler), `pnpm run lint`
    (**genau 5 Fehler, 2 Warnungen** — das ist der Bestand, keine neuen),
    `pnpm run build` (grün).

## Task 1 — Sticky-Bildstapel für „Projekte"

**Datei:** `portfolio/src/components/sections/work/ProjectPanel.tsx` und
`portfolio/src/app/globals.css` (dort liegen die `.work-*`-Regeln).

Der gestapelte Projekte-Aufbau soll dasselbe Verhalten bekommen wie der
Prozess: **das Gerätemockup hält im Fenster, die Copy zieht daran vorbei.**

1. Lies `ProcessPanel.tsx` und den `process.css`-Block als Referenzmuster.
2. Gib dem Medien-Wrapper und dem Copy-Block in `ProjectPanel.tsx` stabile
   Klassen (`work-panel__media`, `work-panel__copy`) — ohne bestehende
   Tailwind-Utilities zu entfernen.
3. In `globals.css`, unter der Breitenbedingung aus Constraint 5:
   - `.work-panel__media`: `position: sticky`, `top: clamp(5rem, 12svh, 8rem)`,
     `order: -1`
   - `.work-panel__copy`: `position: relative`, `z-index: 10`,
     `padding-top: clamp(1.5rem, 4vh, 2.5rem)`
   Die Werte sind bewusst identisch zum Prozess — ein gemeinsamer Rhythmus.
4. **Achtung Gerätepfeile:** Die Mockups tragen absolut positionierte Pfeile
   ausserhalb ihrer Box (deshalb benutzt `useStackReveal` dort `rise` statt
   einer `clip-path`-Blende). Prüfe, dass `position: sticky` sie nicht
   abschneidet und der neue Stapelkontext sie nicht verdeckt.

**Verifikation (alle Punkte belegen, nicht behaupten):**
- Sticky hält wirklich: auf 393×852 zum ersten `.work-panel` scrollen und
  `getBoundingClientRect().top` des Medien-Wrappers über mindestens 400px
  Scrollweg messen — der Wert muss konstant bleiben.
- `node scripts/mobile-matrix.mjs overflow` — kein neues rotes Gerät
  gegenüber dem Bestand (320×568 ist **vorbestehend rot**, das zählt nicht).
- Desktop-Diff nach Constraint 1.

## Task 2 — Sticky-Bildstapel für „Leistungen"

**Dateien:** `portfolio/src/components/sections/Services.tsx` und
`portfolio/src/components/sections/services/services.css`.

Analog zu Task 1 für die `.services-panel`-Etagen im gestapelten Aufbau.

1. Finde das Stapel-Markup (`stackRef`, `.services-panel`) und identifiziere
   Medien- und Copy-Block.
2. Stabile Klassen vergeben, dieselben Sticky-Werte wie Task 1.
3. Die Section hat eine Einfahrt über `clip-path` am Section-Element
   (`--enter-inset`). **Prüfe, ob der Clip den Sticky-Kontext bricht** —
   `clip-path` auf einem Vorfahren kann `position: sticky` unwirksam machen.
   Falls ja: das ist ein echter Konflikt, melde ihn als Befund mit Messung,
   statt eine der beiden Bewegungen still abzuschalten.

**Verifikation:** wie Task 1.

## Task 3 — Prozess-Blende am Scroll ziehen

**Datei:** `portfolio/src/hooks/useStackReveal.ts`.

Die alternierende Bildblende (`CLIP_FROM`, links/rechts im Wechsel) läuft
heute in einer `once: true`-Timeline — sie *spielt ab*. Auf dem Desktop
fährt der Nutzer den Shuttle selbst. Die Blende soll das ebenfalls tun.

1. Nimm die `clipPath`-Animation im `media === "wipe"`-Zweig aus der
   `once: true`-Timeline heraus.
2. Setze sie als eigenen scroll-getriebenen Tween auf, `scrub: 0.6` (derselbe
   Wert wie der Parallax darunter), Strecke etwa `top 85%` → `center center`.
3. **Die `onComplete`-Logik muss erhalten bleiben:** nach dem Aufziehen wird
   `clipPath: "none"` gesetzt, weil eine stehende Maske jedes spätere Overlay
   im Bild abschneidet. Bei einem Scrub gibt es kein `onComplete` — löse es
   über `onLeave`/`onEnterBack` oder eine Fortschrittsschwelle, und begründe
   die Wahl im Kommentar.
4. Copy-Stagger und Haarlinie bleiben wie sie sind (`once: true`). Nur das
   Bild wird gefahren.

**Verifikation:**
- Auf 393×852 in die Prozess-Section scrollen und `clipPath` des
  `[data-reveal="media"]`-Elements bei mehreren Scrollpositionen auslesen —
  der Wert muss sich mit der Position ändern, nicht einmalig springen.
- Nach dem Durchlauf muss `clipPath` auf `none` stehen.
- Desktop-Diff nach Constraint 1 (`useStackReveal` läuft dort nicht, der
  Diff muss also 0.00 sein).
