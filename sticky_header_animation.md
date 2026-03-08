# Sticky Header während Horizontal-Scroll-Animation

In der LAAS-Website bleiben Section-Titel wie **"Expertise. Elevated."** oder **"Ausgewählte Arbeiten."** starr an ihrem Platz stehen, während die großen Inhalts-Karten horizontal unter ihnen durchscrollen.

Hier erfährst du, wie dieser "Sticky"-Effekt im Zusammenspiel mit GSAP ScrollTrigger umgesetzt wurde.

## 🧠 Wie es funktioniert

Der Trick ist erstaunlich einfach und benötigt **keine komplexe GSAP-Animation** für den Text selbst.

Wenn wir mit GSAP eine horizontale Scroll-Animation bauen, nutzen wir das Feature `pin: true`. Das bedeutet: GSAP "friert" die gesamte Eltern-`<section>` (die den gesamten Bildschirm einnimmt) für die Dauer der horizontalen Scroll-Strecke fest ein. 

Da die gesamte `<section>` eingefroren ist, frieren wir auch alle Elemente darin ein, *die nicht aktiv wegbewegt werden*.

Das bedeutet konkret:
1. Alles, was im `scrollWrapper` (dem Div, das die Karten hält) liegt, wird von GSAP nach links geschoben.
2. Der Titel ("Ausgewählte Arbeiten.") wird absichtlich **außerhalb** dieses Wrappers im HTML platziert.
3. Der Titel wird absolut innerhalb der gepinnten Section positioniert (`absolute top-12 left-12`).

Das Ergebnis: Der Titel scrollt nicht nach oben weg (weil die Section gepinnt ist) und er scrollt nicht nach links weg (weil er nicht im horizontalen Wrapper liegt). Er bleibt "sticky" auf dem Bildschirm.

---

## 🎨 Pro-Tipp: `mix-blend-difference`

Eine weitere Herausforderung bei diesem Layout: Wenn der fixierte Text (z. B. weiß) über eine helle Karte scrollt, kann man ihn nicht mehr lesen.

Lösung: Wir geben dem fixierten Header die CSS-Eigenschaft `mix-blend-mode: difference` (in Tailwind einfach die Klasse `mix-blend-difference`).

Der Browser invertiert die Farbe des Textes nun in Echtzeit dynamisch basierend auf der Farbe, die gerade unter ihm vorbeizieht. Zieht eine rein weiße Karte unter dem Text durch, wird der weiße Text an genau dieser Stelle schwarz.

---

## 💻 Code-Beispiel

Hier ist die minimale Blaupause, um den Sticky-Header nachzubauen:

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function StickyHeaderScroller() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!scrollWrapperRef.current || !containerRef.current) return;

    // Horizontale Distanz berechnen
    const scrollWidth = scrollWrapperRef.current.scrollWidth - window.innerWidth;

    // Das horizontale Scrollen
    gsap.to(scrollWrapperRef.current, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true, // WICHTIG: Friert die komplette <section> ein!
        scrub: 1, 
        end: () => `+=${scrollWidth}`,
      },
    });
  }, { scope: containerRef });

  return (
    {/* Die Eltern-Section, die fixiert wird */}
    <section ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-center">
      
      {/* 🎯 DER STICKY HEADER */}
      {/*
        1. "absolute" positioniert ihn in der Ecke
        2. "z-10" sorgt dafür, dass er über den Karten liegt
        3. "mix-blend-difference" sorgt für Farb-Invertierung, wenn helle Karten vorbeiziehen
        4. "pointer-events-none" verhindert, dass er Klicks blockiert
      */}
      <div className="absolute top-12 left-12 z-10 mix-blend-difference pointer-events-none">
        <h2 className="text-6xl font-bold text-white tracking-tighter">
          Mein Sticky <span className="text-amber-600">Header.</span>
        </h2>
      </div>

      {/* ➡️ DER HORIZONTAL SCROLLENDE WRAPPER */}
      <div 
        ref={scrollWrapperRef} 
        className="flex w-max items-center h-full pl-[5vw]" // pl- ist das Padding links vorm ersten Element
      >
        {/* Die Karten, die unter dem Header vorbeiziehen */}
        <div className="w-[60vw] h-[60vh] bg-white rounded-3xl mx-4" />
        <div className="w-[60vw] h-[60vh] bg-gray-800 rounded-3xl mx-4" />
        <div className="w-[60vw] h-[60vh] bg-amber-600 rounded-3xl mx-4" />
      </div>
      
    </section>
  );
}
```
