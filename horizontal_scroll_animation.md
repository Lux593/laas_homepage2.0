# Horizontal Scroll & Layout Morphing Animation Guide

Diese Anleitung erklärt, wie die Kombination aus **horizontalem Scrollen (GSAP)** und der **nahtlosen Detailansicht (Framer Motion)** aus dem LAAS-Projekt funktioniert, damit du diesen Effekt in anderen React/Next.js-Projekten wiederverwenden kannst.

## 🛠 Benötigter Tech Stack
Um diesen Effekt zu bauen, brauchst du drei wesentliche Libraries:
1. **Framer Motion** (`npm install framer-motion`) - Für die Klick-Animation (Card zu Fullscreen Modal).
2. **GSAP** (`npm install gsap @gsap/react`) - Für die Scroll-Logik.
3. **Lucide React** (optional) - Für Icons (z.B. den Schließen-X-Button).

---

## 🧠 Das Konzept (Wie es funktioniert)

Der Effekt besteht aus **zwei voneinander getrennten Animations-Systemen**, die perfekt ineinandergreifen:

### Teil 1: Das Horizontale Scrollen (GSAP ScrollTrigger)
Normalerweise scrollen Webseiten nur vertikal von oben nach unten. Um horizontale Karten zu erzeugen, tricksen wir den Browser aus:
1. Wir "pinnen" (fixieren) den übergeordneten Container (die `<section>`), sobald er den oberen Bildschirmrand erreicht.
2. Anstatt die Seite weiter nach unten gleiten zu lassen, verschieben wir den inneren Container (den *Scroll-Wrapper*, in dem die Karten liegen) per CSS Transform (`x: -scrollWidth`) nach links.
3. Die Scroll-Distanz der Maus wird 1:1 an diese X-Verschiebung gebunden (`scrub: 1`).
4. **Zusatz-Effekt:** Jede Karte hat zudem eine eigene kleine Fade-Up-Animation, die erst auslöst, wenn die Karte beim horizontalen Scrollen ins Bild (`containerAnimation`) slidet.

### Teil 2: Die Fluid-Detailansicht (Framer Motion `layoutId`)
Wenn du auf eine Karte klickst, passiert kein klassischer Seitenwechsel. Framer Motion nutzt ein Feature namens **Shared Layout Animations**.
1. Die kleine Karte in der Liste und das riesige Fullscreen-Modal teilen sich dieselben `layoutId`-Props (z.B. `layoutId="card-1"` oder `layoutId="title-1"`).
2. Wenn das Fullscreen-Modal im DOM gerendert wird (gesteuert über einen einfachen React `useState`), erkennt Framer Motion automatisch: *"Ah, diese Karte existiert schon im kleinen Format!"*
3. Framer Motion berechnet selbstständig die Größe, Position und Styles der alten und neuen Version und morpht sie fließend ineinander über.

---

## 💻 Code-Blaupause

Hier ist das minimalistische Grundgerüst, das du für dein nächstes Projekt kopieren kannst:

```tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const items = [
  { id: "1", title: "Projekt Eins" },
  { id: "2", title: "Projekt Zwei" },
  { id: "3", title: "Projekt Drei" },
];

export default function HorizontalScroller() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Ref für den PIN-Trigger (die Section, die stehen bleibt)
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ref für das Element, das nach links geschoben wird
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!scrollWrapperRef.current || !containerRef.current) return;

    // Berechne, wie weit geschoben werden muss (inkl. etwas Puffer)
    const scrollWidth = scrollWrapperRef.current.scrollWidth - window.innerWidth + 200;

    // Das horizontale Scrollen
    gsap.to(scrollWrapperRef.current, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1, // Koppelung an Maus-Scroll
        end: () => `+=${scrollWidth}`,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden flex flex-col justify-center bg-black">
      
      {/* Container, der nach links geschoben wird */}
      <div ref={scrollWrapperRef} className="flex w-max items-center h-full pl-[10vw]">
        
        {items.map((item) => (
          <motion.div
            key={item.id}
            layoutId={`card-${item.id}`} // WICHTIG: Verbindet Karte mit Modal
            onClick={() => setSelectedId(item.id)}
            className="w-[60vw] h-[60vh] mx-4 bg-gray-900 rounded-3xl p-8 cursor-pointer flex items-end"
          >
            <motion.h2 layoutId={`title-${item.id}`} className="text-white text-4xl font-bold">
              {item.title}
            </motion.h2>
          </motion.div>
        ))}

      </div>

      {/* Das Modal Overlay */}
      <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none">
            
            {/* Abgedunkelter Hintergrund */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-black/80 pointer-events-auto"
            />

            {/* Die geöffnete Karte */}
            <motion.div
              layoutId={`card-${selectedId}`} // WICHTIG: Gleiche ID wie Karte
              className="relative w-full h-full max-w-5xl bg-gray-800 rounded-3xl p-16 pointer-events-auto flex flex-col justify-center"
            >
              <button 
                onClick={() => setSelectedId(null)}
                className="absolute top-8 right-8 text-white p-4"
              >
                Schließen
              </button>
              
              <motion.h2 layoutId={`title-${selectedId}`} className="text-white text-6xl font-bold mb-8">
                {items.find(i => i.id === selectedId)?.title}
              </motion.h2>

              <p className="text-gray-300 text-xl">Hier steht dann der lange Beschreibungstext...</p>
            </motion.div>
            
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
```

## ⚠️ Wichtige "Gotchas" (Fehlerquellen)
- **`AnimatePresence`**: Ist zwingend notwendig, damit das Modal beim Schließen nicht einfach verschwindet, sondern fließend in die kleine Karte zurück-morpht.
- **`pointer-events-none` auf dem Wrapper**: Das transparente Div, das das Fullscreen-Modal hält, muss `pointer-events-none` haben. Die verdunkelten Overlays und Modals darin müssen dann wieder `pointer-events-auto` sein. Sonst kannst du nicht auf die Elemente hinter dem unsichtbaren Overlay klicken.
- **ScrollTrigger `pin: true`**: Da GSAP die Section "pinned", baut es automatisch Wrapper-Divs ums HTML. Wenn man Framer Motion mit GSAP mixt, kommt es manchmal zu Z-Index Konflikten. Nutze daher beim Modal immer `fixed inset-0 z-50`.
