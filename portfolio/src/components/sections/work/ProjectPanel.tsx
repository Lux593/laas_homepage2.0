"use client";

import FramerMoveableThumbnails from "@/components/ui/framer-moveable-thumbnails";
import type { Project } from "@/lib/constants";

/**
 * Ein Projekt, als aufgeschlagene Doppelseite statt als Karte. Die Struktur
 * kommt aus dem Raster und den Haarlinien, nicht aus einem Kasten.
 *
 * Die data-reveal-Marken liest ausschliesslich useStackReveal, und der läuft
 * nur, wo STACK_QUERY greift (lib/breakpoints.ts) — also unter 1024px UND auf
 * dem iPad 13" hochkant, das breiter ist. Gepinnt fährt der Track horizontal
 * und niemand liest sie.
 *
 * Im DOM steht die Copy vor dem Gerät; gestapelt dreht `order: -1` in
 * globals.css die Reihenfolge um, sodass der Rahmen oben klebt und die Copy
 * daran vorbeizieht.
 */
export default function ProjectPanel({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  return (
    // Pinned: vertically center the spread. The device column keeps a
    // --frame-h slot so landscape iPads share the iPhone's midline instead of
    // sitting flush under PROJEKTE. Stacked stays top-flowing.
    <article className="work-panel relative flex max-w-full flex-col justify-start overflow-x-clip lg:justify-center">
      {/* w-full is load-bearing: container-custom's auto margins would otherwise
          stop this flex item from stretching and shrink-wrap it to its content */}
      <div className="work-container w-full">
        {/* Zweispaltig steht der Text links (dieselbe Kante wie „PROJEKTE"),
            das Gerät in der rechten 1fr-Spalte. Gestapelt liegt das Gerät oben
            und der Text darunter. */}
        <div className="mt-[clamp(0.75rem,2vh,1.25rem)] lg:mt-0">
          {/* Spalten und Abstände stehen als CSS in globals.css, nicht als
              lg:-Utilities. `lg:` heisst nur „ab 1024px" und ist damit auf dem
              iPad Pro 13" hochkant (1024×1366) falsch: das Gerät ist per
              STACK_QUERY ein Stapel-Gerät, bekam über `lg:` aber die
              zweispaltige Doppelseite — und mit ihr, sobald das Gerätefeld
              `order: -1` trägt, die vertauschten Spalten. Die Bedingung für
              zwei Spalten ist nicht die Breite allein, und das lässt sich in
              einem Tailwind-Präfix nicht ausdrücken.
              Die Spuren selbst bleiben, wie sie waren: Text auf minmax(40ch,48ch),
              Gerät auf minmax(0,1fr), damit ein iPad quer schrumpfen kann,
              statt der Copy über das voreingestellte min-size:auto Breite zu
              nehmen. */}
          <div className="work-panel__grid grid w-full max-w-full items-center">
            {/* Rasterfelder nehmen die volle Spaltenbreite, das Zeilenmass sitzt
                eine Ebene tiefer. Diese Regel ist im Stapel keine Kosmetik:
                das Feld, das den Grund über den klebenden Rahmen zieht, muss
                mindestens so breit sein wie der Rahmen darunter, sonst schaut
                das Gerät seitlich am Text vorbei. Welches Feld das ist, steht
                weiter unten am Rumpf — hier stand es früher, als es noch
                .work-panel__copy war. */}
            {/* Zwei Blöcke statt eines Fliesstexts: gestapelt gehören Zähler und
                Titel ÜBER den Rahmen, Fliesstext und Liste darunter. Die
                Umsortierung macht globals.css — dort löst `display: contents`
                diese beiden Hüllen im Stapel auf, sodass Kopf, Rahmen und Rumpf
                drei Geschwister im selben Raster werden und über `order` in die
                gewünschte Folge gehen.
                Auf dem Desktop bleiben beide gewöhnliche Blöcke in derselben
                Spalte: h3 trägt keinen Aussenabstand, der Fliesstext bringt
                seine 12px selbst mit und gibt sie durch die Hülle nach aussen
                weiter — die Zeilenabstände sind dieselben wie zuvor. */}
            <div className="work-panel__copy min-w-0 w-full">
              <div className="work-panel__head max-w-[48ch]">
                {/* Stacked, the header counter is out of sight by the time a panel
                    is on screen — so the position belongs to the panel itself.
                    Pinned, the counter in the section header already says it. */}
                <div
                  data-reveal="copy"
                  className="mb-7 flex items-center gap-4 lg:hidden"
                  aria-hidden
                >
                  {/* Display statt Mono — siehe ProcessPanel: die Mono-Null
                      trägt einen Strich und fiel als einzige Zahl aus der
                      Reihe. */}
                  <span className="shrink-0 font-display text-caption font-bold tabular-nums tracking-tighter text-[#6a6a6a]">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(total).padStart(2, "0")}
                  </span>
                  {/* Hier lief eine Haarlinie neben der Zahl bis an den
                      Satzspiegelrand. Raus auf Ansage — die Zahl steht allein.
                      useStackReveal zieht [data-reveal="rule"] auf, findet hier
                      aber nichts mehr und überspringt den Tween. */}
                </div>

                <header data-reveal="copy">
                  <h3 className="whitespace-pre-line font-display text-[clamp(1.9rem,3.1vw,3.1rem)] font-bold leading-[0.98] tracking-tighter text-[#0a0a0a] uppercase">
                    {project.title}
                  </h3>
                </header>
              </div>

              {/* Kein 48ch-Deckel auf dieser Hülle, sondern eine Ebene tiefer
                  auf der Liste. Der Rumpf ist im Stapel das Feld, das den Grund
                  über den klebenden Rahmen zieht (globals.css), und ein Grund
                  deckt nur, so weit er reicht: auf dem iPad Pro 13" hochkant
                  mass er 525.3px, der Rahmen darunter stand 76px weiter rechts
                  und schaute neben dem Text hervor. Gemeint war das nie — der
                  Kommentar oben beschreibt genau diese Bedingung, sie ging nur
                  verloren, als `display: contents` .work-panel__copy die Box
                  nahm, auf der sie gestanden hatte.
                  Auf dem Desktop ändert der Umzug nichts: die Textspalte ist
                  dort per minmax(40ch,48ch) ohnehin nie breiter als das Mass,
                  der Deckel war dort schon vorher wirkungslos. */}
              <div className="work-panel__body">
                <p
                  data-reveal="copy"
                  className="work-panel__lede mt-3 max-w-[46ch] font-body text-body-md text-[#3a3a3a]"
                >
                  {project.subtitle}
                </p>

                <ul className="work-panel__features mt-7 max-w-[48ch] border-t border-[#0a0a0a]/12">
                  {project.features.map((feature, i) => (
                    <li
                      key={feature.title}
                      data-reveal="copy"
                      className="grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 border-b border-[#0a0a0a]/12 py-2.5"
                    >
                      <span className="font-display text-caption font-bold tracking-tighter tabular-nums text-[#6a6a6a]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="work-panel__feature-title font-display text-body-sm font-semibold text-[#0a0a0a]">
                          {feature.title}
                        </p>
                        <p className="work-panel__feature-copy mt-1 font-body text-caption leading-relaxed text-[#6a6a6a]">
                          {feature.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* --frame-h slot = iPhone height budget. iPad centers inside it so
                both devices share one midline when the track slides. min-w-0 +
                w-full keep max-w-full on the frame honest.

                Kein `relative` mehr auf diesem Feld: gestapelt macht globals.css
                daraus ein `position: sticky`, und eine Tailwind-Utility schlägt
                jede Regel aus @layer components — der Rahmen bliebe im Fluss.
                Es hatte hier ohnehin nichts zu halten, alle absolut gesetzten
                Kinder (Bezel, Screen, Pfeile) hängen am Rahmen selbst. */}
            <div className="work-panel__media flex min-w-0 w-full items-center justify-center justify-self-center lg:min-h-[var(--frame-h)]">
              {/* Die data-reveal-Ebene sitzt INNEN, nicht auf dem klebenden Feld:
                  useStackReveal schreibt hier Aufsteiger und Parallax, beides als
                  transform. Auf dem klebenden Element selbst verschöbe genau das
                  die Position, die halten soll — der Parallax läuft über die
                  ganze Durchfahrt und zöge das Plateau um ±2.5% der Rahmenhöhe
                  wieder auseinander. Messbar war er auch vorher schon: solange
                  die Marke auf dem äusseren Feld sass, lief dessen `top` mit
                  0.988 zum Scrolldelta statt mit 1.000. Die fehlenden 1.2%
                  waren der Parallax. */}
              <div data-reveal="media" className="relative w-full">
                <FramerMoveableThumbnails
                  items={project.gallery}
                  frame={project.device}
                  fit={project.fit}
                  screenColor={project.screenColor}
                  screenInset={project.screenInset}
                  screenBlurTop={project.screenBlurTop}
                  unoptimized={project.unoptimized}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
