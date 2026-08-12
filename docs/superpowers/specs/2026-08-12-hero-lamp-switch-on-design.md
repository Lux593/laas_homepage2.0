# Hero Lamp Switch-On Entry — Design

Date: 2026-08-12  
Status: approved — implementing

## Goal

Beim Laden des Heroes soll die Szene wie ein echtes Einschalten wirken:

1. Kabel + Gehäuse hängen schon  
2. Licht geht an (Birne / Halo)  
3. Lichtstrahl fällt nach unten  
4. Arbeitsplatz wird erleuchtet  

Nicht: ein einziger Top-down-Wipe über das gesamte Lampen-`<img>`.

## Evidence from audit

### Asset reality (`portfolio/public/hero-lamp.svg`)

Die SVG hat genau **vier** sichtbare Layer (keine fünfte „Gehäuse“-Grafik):

| Layer | Marker | Rolle |
|---|---|---|
| Cord | `mask="url(#cord_fade)"` | Kabel |
| Housing / Birne | `stroke="#ffde59"` | Gelbe Birnen-/Gehäuse-Zeichnung (ein Path) |
| Rays | `opacity=".7"` | Strahlenkranz (Halo) |
| Cone | `opacity=".028"` | Lichtkegel (sehr schwach) |

Wichtig:

- **„Gehäuse“ und „gelbe Glühbirne“ sind im Asset dieselbe Zeichnung** (gelber Stroke). Es gibt keine separate gefüllte Leuchtbirne in der Mitte.
- Der Kegel ist mit `opacity=".028"` absichtlich kaum sichtbar; die „Erleuchtung“ trägt vor allem der Desk-Wipe.
- Aktuell ist die Lampe ein `<img>` → Layer sind **nicht** einzeln animierbar.

### Current timeline (runtime logs, session `55d315`)

- Lamp `--glow` läuft `0 → ~1.2s` (Masken-Wipe über das ganze Bild).
- Desk `--wipe` startet bereits bei Timeline-Zeit **0.2s**, während die Lampe noch bei ~50% Glow ist.
- Ergebnis: Desk und Lampe überlappen — kein gestaffeltes „Anknippsen“.

## Corrected approach

Inline-SVG (oder React-SVG-Komponente) statt `<img>`, mit äußeren Wrapper-Gruppen:

```svg
<svg class="hero-lamp__art" …>
  <g id="lamp-cord" style="opacity:0">…</g>
  <g id="lamp-housing" style="opacity:0">… yellow stroke …</g>
  <g id="lamp-rays" style="opacity:0">… baked opacity .7 stays inside …</g>
  <g id="lamp-cone" style="opacity:0">… baked opacity .028 stays inside …</g>
</svg>
```

Äußere Wrapper von `0 → 1` animieren, innere Asset-Opacities unverändert lassen — sonst wird der Kegel ~35× zu hell.

### Choreography (nach bestehendem Delay `0.4s`)

| t | Element | Motion | Why |
|---|---|---|---|
| 0.00 | Cord | Fade 0→1, 0.9s, `sine.out` | weiches Einhängen |
| 0.28 | Housing (gelb) | Fade 0→1, 0.75s, `sine.out` | überlappt Kabel, kein Pop |
| 0.85 | Rays | Fade 0→1, 0.32s, `power2.out` | **Einschalt-Moment** (Halo) |
| 0.95 | Cone | Fade 0→1, 0.55s, `sine.out` | Strahl fällt |
| 1.05 | Desk | radiales `--lit` 0→160, 1.35s, `sine.out` | Lichtpool vom Lampenpunkt |
| ~1.6 | Sway | wie heute, Amplitude ramp | Pendeln nach dem An |

Text-Entry bleibt parallel wie bisher.  
`prefers-reduced-motion`: alle Layer + Desk sofort voll sichtbar, kein Sway.

### Was bewusst nicht

- Kein Birnen-Flicker-Loop (bestehender Code-Kommentar: liest sich als Fehler).
- Rays + Cone **nicht** als ein Block — getrennte Beats lesen sich als Einschalten.
- Desk startet **nicht** mehr bei 0.2s neben dem Lampen-Wipe.
- Keine zweite Lampen-Asset-Datei.

### Unchanged

- Layout/`hero.css` Stage-Maße, Kegel-Bodenmaske auf `.hero-lamp`
- Scroll-Parallax, `heroActive`-Pause
- Desk bleibt `hero-desk.webp` mit Masken-Wipe
- Pendel-`transformOrigin` am SVG-Root

## Files

- `portfolio/public/hero-lamp.svg` — IDs / Wrapper-Gruppen
- `portfolio/src/components/sections/Hero.tsx` — Inline-SVG + neue Timeline
- ggf. kleines `hero/HeroLamp.tsx` wenn Hero.tsx zu voll wird
- `portfolio/src/components/sections/hero/hero.css` — nur falls SVG-Root-Selektoren angepasst werden müssen

## Acceptance

1. Hard-Reload: erst Kabel, dann gelbes Gehäuse, dann Halo, dann Kegel, dann Desk.  
2. Fühlt sich wie Einschalten an, nicht wie ein gemeinsamer Wipe.  
3. Endzustand pixelgleich zum heutigen Endzustand (gleiche Opacities/Farben).  
4. Reduced motion: sofort fertig.  
5. Mobile/Desktop Layout unverändert; Pendeln startet erst nach dem An.
