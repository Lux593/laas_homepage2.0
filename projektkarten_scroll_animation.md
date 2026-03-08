# Projektkarten-Animation: „Was ich gebaut habe“

Beschreibung, wie die Projektkarten in der Section **„Was ich gebaut habe“** beim horizontalen Scrollen eingeblendet werden – technisch und visuell.

---

## Visuelle Beschreibung

### Gesamteindruck
Beim vertikalen Scrollen bleibt die Section „Was ich gebaut habe“ am oberen Rand fixiert (gepinnt). Statt weiter nach unten zu scrollen, bewegt sich der Inhalt horizontal von rechts nach links. Die Projektkarten erscheinen nacheinander, während sie in den sichtbaren Bereich gleiten.

### Einblendung der einzelnen Karten
Jede Karte wird beim Eintritt in den Viewport animiert:

- **Start:** Karte ist unsichtbar (`opacity: 0`) und 60px nach unten versetzt (`y: 60`)
- **Ende:** Karte ist voll sichtbar (`opacity: 1`) und in ihrer finalen Position (`y: 0`)
- **Verlauf:** Fade-up mit `power2.out` – schneller Start, weiches Ausklingen
- **Timing:** Die Animation ist an den horizontalen Scrollfortschritt gekoppelt (`scrub: 1`)

### Ablauf aus Nutzersicht
1. Section scrollt nach oben und bleibt am oberen Rand stehen.
2. Der Karten-Container bewegt sich horizontal nach links.
3. Beim Eintritt in den sichtbaren Bereich blendet jede Karte von unten nach oben ein.
4. Die Karten erscheinen nacheinander, je nachdem, wann sie den Viewport erreichen.

---

## Technische Beschreibung

### Stack
- **GSAP** mit **ScrollTrigger**
- **useGSAP** für React-Integration

### Zwei Animationsschichten

#### 1. Horizontales Scrollen (Container)
- **Trigger:** `sectionRef` (die Section)
- **Pin:** `pin: true` – Section bleibt während der horizontalen Scrollstrecke fixiert
- **Animation:** `scrollWrapperRef` wird mit `x: -scrollWidth` nach links verschoben
- **Scroll-Distanz:** `scrollWidth = scrollWrapper.scrollWidth - window.innerWidth + 200`
- **Scrub:** `scrub: 1` – Scrollposition und Animation sind 1:1 verknüpft

#### 2. Karten-Einblendung (Fade-Up)
- **Trigger:** `card` (`.flip-card-wrapper`)
- **Container-Animation:** `containerAnimation: scrollTween` – verknüpft mit der horizontalen Scroll-Animation
- **Start:** `"left 85%"` – Karte beginnt einzublenden, wenn ihre linke Kante 85% des Viewports erreicht
- **Ende:** `"left 55%"` – Animation endet, wenn die linke Kante bei 55% ist
- **fromTo:** `{ opacity: 0, y: 60 }` → `{ opacity: 1, y: 0 }`
- **Easing:** `power2.out`

### Wichtige GSAP-Optionen

| Option | Wert | Bedeutung |
|--------|------|-----------|
| `containerAnimation` | `scrollTween` | ScrollTrigger nutzt den Fortschritt der horizontalen Animation statt der vertikalen Scrollposition |
| `start: "left 85%"` | | Karte beginnt einzublenden, wenn ihre linke Kante bei 85% des Viewports ist |
| `end: "left 55%"` | | Karte ist voll eingeblendet, wenn ihre linke Kante bei 55% ist |
| `scrub: 1` | | 1 Sekunde Glättung zwischen Scroll und Animation |

### DOM-Struktur
```
section (sectionRef, gepinnt)
├── Header (sticky, absolute)
└── div (scrollWrapperRef, horizontal scrollend)
    └── div.flip-card-wrapper (pro Karte)
        └── FlipCard
```

---

## Code-Referenz

Die relevante Logik in `SelectedWork.tsx`:

```tsx
// Fade-up: Jede Karte blendet ein, wenn sie beim horizontalen Scrollen ins Bild kommt
const cards = scrollWrapperRef.current.querySelectorAll(".flip-card-wrapper");
cards.forEach((card) => {
  gsap.fromTo(
    card,
    { opacity: 0, y: 60 },
    {
      opacity: 1,
      y: 0,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        containerAnimation: scrollTween,
        start: "left 85%",
        end: "left 55%",
        scrub: 1,
      },
    }
  );
});
```

---

## Zusammenfassung

Die Projektkarten werden nicht alle beim Laden der Seite sichtbar, sondern **nacheinander beim horizontalen Scrollen** eingeblendet. Die Einblendung erfolgt per **Fade-Up** (opacity + y-Verschiebung) und ist über `containerAnimation` an den horizontalen Scrollfortschritt gekoppelt. Dadurch wird jede Karte erst animiert, wenn sie beim horizontalen Scrollen in den sichtbaren Bereich gleitet.
