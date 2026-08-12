/** Ein Kapitel eines Rechtsdokuments, wie die Seiten es beschreiben. */
export interface LegalSectionData {
  /** Sprungziel für das Inhaltsverzeichnis — kurz, kleingeschrieben, stabil. */
  id: string;
  title: string;
  body: React.ReactNode;
}

/**
 * Ein nummeriertes Kapitel einer Rechtsseite.
 *
 * Die Nummer steht ÜBER dem Titel und nicht daneben: die Textspalte ist auf
 * 68ch Lesebreite gedeckelt, eine hängende Nummernspalte würde davon abbeissen.
 * Die Marke selbst — zweistellig, Display, tabular-nums — ist dieselbe, die
 * „Leistungen" und die Projektzählung schon tragen. Display statt Mono: die
 * Mono-Null trägt einen Schrägstrich und fällt aus der Zahlenreihe.
 *
 * Vergeben wird sie von LegalPage aus der Reihenfolge, nicht von Hand: ein
 * nachträglich eingeschobener Abschnitt hätte sonst fünfzehn Nummern und
 * ebenso viele Querverweise im Text nach sich gezogen.
 */
export default function LegalSection({
  mark,
  id,
  title,
  children,
}: {
  mark: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      // Sprungziele aus dem Inhaltsverzeichnis landen sonst unter der festen
      // Leiste. globals.css setzt scroll-padding-top nur unterhalb von 1024px;
      // das Verzeichnis gibt es aber erst ab lg — die beiden Regeln decken
      // also genau die Breiten ab, die die jeweils andere auslässt.
      className="mt-12 scroll-mt-32 border-t border-[#0a0a0a]/10 pt-8 md:mt-16 md:pt-10"
    >
      <span className="block font-display text-caption font-bold tracking-tighter tabular-nums text-[#9a9a9a]">
        {mark}
      </span>
      <h2 className="mt-3 font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-bold leading-tight tracking-tight text-[#0a0a0a]">
        {title}
      </h2>
      {/* Die Textfarbe erbt der ganze Rumpf; einzelne Absätze setzen sie nicht
          erneut. space-y statt Absatzabstände, damit verschachtelte Listen
          denselben Rhythmus behalten. */}
      <div className="mt-4 space-y-4 text-body-sm leading-relaxed text-[#3a3a3a] [&_a]:underline [&_a]:decoration-[#0a0a0a]/25 [&_a]:underline-offset-4 [&_a:hover]:decoration-[#0a0a0a]">
        {children}
      </div>
    </section>
  );
}

/** Aufzählung im Kapitelrumpf — bündig zum Fliesstext, Marke hängend. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="relative pl-5">
          <span
            aria-hidden
            className="absolute left-0 top-[0.65em] h-px w-2.5 bg-[#0a0a0a]/30"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
