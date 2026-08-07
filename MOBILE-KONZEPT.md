# MOBILE-KONZEPT — Phase 1 des Gauntlet-Loops

Baut auf [MOTION-INVENTORY.md](MOTION-INVENTORY.md) auf. Ein Vorschlag pro
Section: **welcher Motion-Moment trägt sie unter 1024px?**

Leitsatz: *Ein starker Moment pro Screen.* Nicht fünf kleine gleichzeitig, und
nicht die Desktop-Choreografie in klein.

---

## Die Grundidee: der Stapel bekommt ein Rückgrat

Der Desktop hat **einen** Pin-Gedanken, zweimal parametrisiert
(`useHorizontalPin` für Projekte, `useProcessPin` für Prozess). Mobil steht dem
heute **ein** Stapel-Gedanke gegenüber, ebenfalls zweimal parametrisiert
(`useStackReveal` mit `wipe` / `rise`) — nur ist der arm: Copy steigt, Bild
blendet, fertig. Er hat kein Rückgrat, weil ihm die drei Eigenschaften fehlen,
die den Desktop tragen.

| Desktop-Eigenschaft | fehlt mobil | Übersetzung |
|---|---|---|
| Der Nutzer **fährt** die Bewegung (`scrub` 0.45–0.65) | `once: true` — die Bewegung läuft ab, egal was der Nutzer tut | Bild an den Scroll koppeln, gedämpft wie überall sonst |
| Das Bild **steht** und der Inhalt zieht daran vorbei (Pin) | alles scrollt gleich schnell weg | Sticky-Rahmen: das Bild hält, während seine Copy durchläuft |
| Ein **Zähler** sagt, wo man in der Sequenz steht | fehlt ersatzlos | derselbe Rollzähler, sticky am Stapel |

Deshalb wird `useStackReveal` ausgebaut statt eine vierte Datei angelegt — der
Loop nennt ihn ausdrücklich als Ansatzpunkt.

---

## Section für Section

### 1. Hero — „Licht statt Unschärfe"

**Trägt schon.** Der Hero ist die einzige Section, deren Dramaturgie mobil
vollständig ankommt (H1–H13). Er braucht keine Bewegung dazu, er braucht sie
billiger.

Unter 768px fallen die beiden `filter: blur()` an den Headline-Zeilen weg — die
teuerste animierbare Eigenschaft, ausgerechnet im LCP-Fenster. Damit der
Auftritt nicht schwächer wird, statt dessen **mehr Weg und ein Versatz**:
`y 40 → 56` bzw. `30 → 42`, und die beiden Zeilen starten 0.12 s gegeneinander
versetzt statt gemeinsam. Zwei gestaffelte Zeilen lesen sich auf einem schmalen
Screen als mehr Choreografie als ein gemeinsamer Blur — und kosten nur
Compositing statt einer Rasterung pro Frame.

*Ein starker Moment:* die Lampe geht an.

### 2. Leistungen — „die Kapitel stapeln sich, aber sie halten"

Der gepinnte Kapitelwechsel (L4) fällt unter 1024px weg. Der Stapel bekommt
statt dessen das neue Rückgrat: jedes Kapitelbild sitzt in einem **Sticky-Rahmen
und skaliert am Scroll** (1.06 → 1.0, gedämpft), während seine Copy daran
vorbeizieht. Das ist die vertikale Fassung von „das Bild steht, der Text
wechselt".

### 3. Prozess — „der Shuttle wird eine Kaskade"

Der Shuttle fährt quer zwischen zwei Spalten und wechselt dabei die Seite
(P1–P4). Die Links-rechts-Ordnung ist die Idee, nicht die Horizontale — und die
existiert im Stapel bereits: `CLIP_FROM` alterniert die Blende zwischen
links und rechts. Sie wird nur nicht gefahren, sondern abgespielt.

Also: dieselbe alternierende Blende, aber **am Scroll gezogen** statt
`once: true`, dazu der Sticky-Rahmen. Der Nutzer wischt das Bild selbst auf.

*Ein starker Moment:* die aufziehende Blende, abwechselnd von links und rechts.

### 4. Projekte — „die Sequenz wird zählbar"

Der horizontale Track (W1) fällt weg, der Rollzähler (W2) ersatzlos mit. Von
beidem ist der **Zähler** das, was mobil wirklich fehlt: der Desktop sagt dem
Nutzer, dass er bei 03 von 06 steht. Im Stapel weiss er es nicht.

Der Zähler kommt zurück — sticky am Stapelkopf, mit derselben Rollmechanik
(`yPercent ∓50`, 0.45 s, `power3.out`), nur getrieben davon, welches Panel
gerade im Bild steht. Die Gerätemockups behalten `rise` statt einer Blende, weil
`clip-path` die aussen liegenden Pfeile abschneiden würde.

### 5. Kunden — unverändert

Das Marquee läuft mobil identisch und ist compositor-freundlich. **PORTIEREN,
nichts zu tun.**

### 6. Über mich — „die Kamera fährt auch im kurzen Fenster"

A1–A6 tragen mobil bereits, in einer eigens gerechneten Hochformat-Fassung.
Das ist die Vorlage, nicht die Baustelle.

Offen ist nur A7: unter 660px Fensterhöhe (im Scope: nur 320×568) steht die
Section still. Sie bekommt keine Kamerafahrt — dafür ist zu wenig Platz, das war
eine richtige Entscheidung — aber eine **Ersatzbewegung**: die Szene skaliert am
Scroll leicht auf (1.0 → 1.06) und die Copy-Gruppen steigen gestaffelt ein.
Wenig, aber nicht nichts.

### 7. CTA — „die Blende bleibt, der Schalter wird richtig"

Die mobile Vollbild-Blende (C2) ist gut und bleibt. Sie hängt nur am falschen
Schalter: `window.innerWidth < 768` beim Mount, ohne `matchMedia`, ohne
Reduced-Motion-Zweig. Wird auf `gsap.matchMedia()` umgestellt — damit reagiert
sie auf den iPad-Dreh und respektiert reduzierte Bewegung.

---

## Die Bandentscheidung 768–1023px

Das Band besteht nach dem geschärften Scope **ausschliesslich aus iPads im
Hochformat** (820×1180, 834×1210). Hohe, schmale Fenster.

**Entscheidung: die Handy-Dramaturgie hochziehen, nicht den Desktop-Pin
herunterziehen.** Ein hohes schmales Fenster ist der Handy-Form näher als der
Desktop-Form; ein horizontaler Track in einem 820px breiten, 1180px hohen
Fenster hätte pro Panel weniger Breite als Höhe. Der Stapel mit dem neuen
Rückgrat passt dort besser — und das Band bekommt damit dieselbe Behandlung wie
das Telefon, nur grösser.

---

## Die Entscheidung zu iPad Pro/Air 13″ hochkant (B3)

1024×1366 trifft `(min-width: 1024px)` auf den Pixel und bekommt heute den
horizontalen Pin in einem Hochformat, für das er nie ausgelegt war.

**Entscheidung: das Gerät bekommt den Stapel, nicht den Pin.** Es ist das
höchste und schmalste Gerät der Matrix — dieselbe Begründung wie beim Band
darüber.

Umgesetzt wird das **nicht** über die Breite, sondern als positive
Zwei-Arm-Query:

```
(min-width: 1024px) and (pointer: fine)      and (prefers-reduced-motion: no-preference),
(min-width: 1024px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)
```

- **Jeder Maus-Desktop** matcht Arm 1 — unabhängig von der Fensterform. Die
  unantastbare Zone bleibt damit beweisbar unberührt.
- **Jedes iPad quer** matcht Arm 2 und behält den Pin.
- **iPad 13″ hochkant** (grob + portrait) matcht keinen Arm und fällt in den
  Stapel.

Bewusst **ohne** `not (...)`: eine `not`-Bedingung in Klammern ist Media Queries
Level 4 und wird von Safari erst ab 16.4 verstanden. Ältere Browser würden die
gesamte Query verwerfen — und dann wäre der Pin **auf dem Desktop** aus. Genau
die Regression, die dieser Loop verbietet. Die Zwei-Arm-Form benutzt nur
Features, die überall verstanden werden.

---

## Was ausdrücklich nicht gebaut wird

- **Kein neuer Motion-Layer über allem.** Der Loop verlangt einen starken Moment
  pro Screen, nicht mehr Bewegung insgesamt.
- **Keine Hover-Ersätze für C3/C4.** Der Pfeil-Versatz und der Farbwechsel am
  Link sind Verzierung; auf Touch fehlt dort nichts. Die Tippziele stehen.
- **Kein Umbau der Doppel-DOM-Struktur** (beide Layouts stehen gleichzeitig im
  Markup). Real und teuer, aber ein Architekturthema — notiert, nicht gebaut.
