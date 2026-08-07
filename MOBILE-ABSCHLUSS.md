# Abschluss — Mobile Gauntlet Loop

Ausgangsstand `f26f009`. Phase 0 → [MOTION-INVENTORY.md](MOTION-INVENTORY.md),
Phase 1 → [MOBILE-KONZEPT.md](MOBILE-KONZEPT.md).

---

## Mapping: Desktop-Effekt → mobiles Pendant

| Desktop | mobil vorher | mobil jetzt | Klasse |
|---|---|---|---|
| Hero-Auftritt mit `filter: blur(8px)` an beiden Headline-Zeilen | identisch, inkl. Blur | unter 768px kein `filter`; dafür längerer Weg (`y 40→56` / `30→42`) und die Zeilen 0.52 s statt 0.4 s versetzt | ÜBERSETZT |
| Leistungen: gepinnter Kapitelwechsel (`scrub 0.45`) | Stapel, `once: true` | Stapel mit gedämpftem Scrub, Bild skaliert am Scroll zurück | ÜBERSETZT |
| Prozess: Shuttle fährt quer, Seite alterniert | Blende alterniert, aber abgespielt | dieselbe alternierende Blende, jetzt am Scroll gezogen (`scrub 0.6`) | ÜBERSETZT |
| Projekte: horizontaler Track | Stapel, `once: true` | Stapel; Bildrahmen atmet `1.06 → 1.0` über die Einfahrt | ÜBERSETZT |
| Kunden-Marquee | identisch | identisch | PORTIERT |
| Über mich: Kamerafahrt in den Monitor | eigene Hochformat-Fassung | unverändert (war schon richtig) | PORTIERT |
| Über mich unter 660px Fensterhöhe | **nichts** | Szene driftet `1.0 → 1.06` am Scroll, Copy steigt gestaffelt | ERSETZT |
| CTA-Karte wächst | Vollbild-Blende, aber am Mount-Schalter | dieselbe Blende, jetzt `gsap.matchMedia` — reagiert auf Drehung, respektiert reduzierte Bewegung | ÜBERSETZT |
| Rollzähler in beiden Pins | fehlt ersatzlos | **weiterhin offen** (siehe unten) | offen |

## Die Entscheidungen

**iPad Pro/Air 13″ hochkant (1024×1366) bekommt den Stapel, nicht den Pin.**
Umgesetzt als positive Zwei-Arm-Query in
[breakpoints.ts](portfolio/src/lib/breakpoints.ts) — bewusst **ohne** `not (...)`,
weil ein geklammertes `not` erst ab Safari 16.4 verstanden wird und ältere
Browser die ganze Query verwerfen würden. Der Pin wäre dann auf dem *Desktop*
aus. Arm 1 (`pointer: fine`) fängt jeden Maus-Desktop, Arm 2
(`orientation: landscape`) jedes iPad quer.

**Das Band 768–1023px** (nur noch iPads hochkant) bekommt die Handy-Dramaturgie
hochgezogen statt den Desktop-Pin heruntergezogen.

**Die drei Pin-Queries stehen jetzt einmal** in einem Modul statt dreimal als
Stringliteral. Drei Literale können driften, eine Konstante nicht.

---

## Gate-Ergebnisse

| Gate | Ergebnis | Beleg |
|---|---|---|
| 1 Build/Types/Lint | ✅ | `tsc` 0 Fehler · Build grün · Lint **5 Fehler statt 6** (der `useMediaQuery`-Fehler ist mitgefixt, keine neuen) |
| 2 Desktop-Regression | ✅ | 1440×900, 7 Halte: grösster mittlerer Kanalabstand **0.71**, ≤0.12 % Pixel über der Schwelle. Rauschboden auf unverändertem Code = 0.00, die Messung ist also aussagekräftig. Gesamthöhe 20738 px vorher wie nachher, beide Pin-Spacer da |
| 3 Layout / Overflow | ⚠️ 15/16 | Alle Geräte sauber ausser **320×568** — und das ist **vorbestehend**, mit dem Baseline-Code identisch reproduziert |
| 4 Performance | ✅ | 4× CPU-Drossel, durchgehende Fahrt: iPhone 16 109 fps · iPad Air 11″ 108 · iPad 13″ hoch 60 · iPad 13″ quer 60 (jeweils p95-Worst, Schwelle 50) |
| 5 Blur | ✅ | Einziger echter Kandidat bleibt `Navigation.tsx:75`; er läuft nur beim Menüöffnen, nicht beim Scrollen — **nicht angefasst**, siehe offene Punkte |
| 6 Touch | ✅ | `pointer-coarse:min-h-11` stand bereits; `onMouseLeave` existiert (die Gate-Beschreibung war überholt) |
| 7 iOS/iPadOS | ⚠️ teilweise | Der Dreh-Fall ist strukturell gelöst — CTA hängt nicht mehr an einem beim Mount gelesenen `window.innerWidth`. **Auf echter Hardware nicht geprüft** |
| 8 reduced-motion | ✅ | Jede neue Query trägt `and (prefers-reduced-motion: no-preference)`; der CTA hatte als einzige Section gar keinen — jetzt hat er ihn |
| 9 Immersion | ✅ | Der Stapel fährt jetzt am Scroll statt abzuspielen — die tragende Eigenschaft der DNA („der Nutzer fährt die Kamera") |
| 10 Vitals | ⚠️ Ersatzmessung | CLS 0.0000 auf drei Profilen. iPad 13″ quer zeigt 2.58 — **der unveränderte Desktop zeigt 2.56**, also ein Artefakt des programmatischen Scrollens über Pins, keine Folge der Änderungen. Lighthouse lief nicht |

---

## Offene Punkte — notiert, nicht gebaut

1. **Overflow auf 320×568 (vorbestehend).** Verursacher genau lokalisiert:
   `.hero-lamp__art` rendert 351 px breit, und `.about-lead` bringt 390 px in
   eine 272 px-Spalte. Nicht angefasst, weil die Lampengeometrie
   durchgerechnet ist und ein Eingriff ohne Sichtprüfung den Hero gefährdet.
   `body { overflow-x: hidden }` verhindert echtes Seitwärtsscrollen — der
   Inhalt wird aber beschnitten.

2. **Das Transferbudget aus `bd49d0b` ist nicht reproduzierbar.** Deterministisch
   gemessen (fester `load`-Zeitpunkt, Deduplizierung der Range-Requests,
   dreimal identisch) liegt der Aufruf bei **2099 KB** statt 323 KB. Meine
   Änderungen bewegen davon **+2 KB**. Entweder wurde damals anders gemessen
   oder die Seite ist seither gewachsen — beides sollte geklärt werden, bevor
   die Marke wieder als Gate benutzt wird.

3. **511 KB Bilder vor dem ersten Scroll**, darunter ein Projektbild zehn
   Bildschirme weiter unten (79 KB, `loading` steht auf `auto`). Echter,
   billiger Gewinn — aber Ladeverhalten, nicht Motion.

4. **Beide Layouts stehen gleichzeitig im DOM.** Dieselben Bilder erscheinen
   doppelt (gepinnt *und* gestapelt). Das Handy zahlt für das Desktop-Markup
   mit. Architekturthema, bewusst ausgeklammert.

5. **Die Rollzähler (P5/W2) fehlen mobil weiterhin.** Konzeptionell entschieden
   (sticky am Stapelkopf, gleiche `rollCounter`-Mechanik), aber nicht gebaut —
   es braucht Markup-Änderungen in `Process.tsx` und `SelectedWork.tsx`.

6. **Nav-Blur (`backdrop-blur-xl` unter einer `clip-path`-Kreisanimation)**
   unverändert. Er läuft nur beim Menüöffnen, nicht beim Scrollen, und Gate 4
   ist ohne ihn grün — die Dringlichkeit war geringer als erwartet.

7. **Kein Test auf echter Hardware.** Alles oben ist Chromium-Emulation.
   iOS-Safari-Eigenheiten (Sticky in `overflow-x-clip`-Vorfahren, Momentum,
   Lenis auf iPads) sind damit nicht abgedeckt.

8. **`~/node_modules`** aus einem fehlgeleiteten `pnpm add` ist noch da
   (`git`, `mime`, `playwright`). Rekursives Löschen im Home wird vom
   Berechtigungs-Klassifizierer blockiert: bitte `rm -rf ~/node_modules`.

---

## Werkzeug, das dabei entstanden ist

[`portfolio/scripts/mobile-matrix.mjs`](portfolio/scripts/mobile-matrix.mjs) —
die volle Gerätematrix als Daten plus sechs Messläufe
(`shots`, `diff`, `bytes`, `assets`, `overflow`, `perf`, `vitals`).

Zwei Dinge darin sind teuer erkauft und sollten bleiben:

- **Der Stylesheet-Wächter.** Läuft ein Server aus einem älteren Build auf
  Port 3000, liefert er HTML mit Verweisen auf überschriebene CSS-Dateien:
  Status 200, aber ohne Styles. Die Seite ist dann doppelt so hoch, die Pins
  weg — das sieht wie eine schwere Desktop-Regression aus und ist keine. Genau
  darauf bin ich hereingefallen. Der Wächter bricht jetzt laut ab.
- **Der deterministische Messpunkt.** `networkidle` feuert bei dieser Seite je
  nach Lazy-Loading an verschiedenen Stellen — zwei Läufe ergaben 733 und
  2359 KB für denselben Zustand.
