/**
 * Die beiden Queries, die entscheiden, ob eine Section gepinnt läuft oder
 * gestapelt. Sie sind exakte Gegenstücke — jedes Gerät matcht genau eine.
 *
 * Warum hier und nicht dreimal als Stringliteral: die Queries stehen in
 * `useHorizontalPin`, `useProcessPin` und `Services.tsx`, und jede hat einen
 * `@media`-Zwilling im CSS. Driften JS und CSS auseinander, ist das Ergebnis
 * ein dauerhaft aus dem Bild stehendes Panel oder 200vw Horizontal-Overflow
 * (so kommentiert in globals.css). Drei Literale können driften, eine
 * Konstante nicht.
 *
 * ── Warum zwei Arme statt `not (...)` ──────────────────────────────────────
 *
 * Zu lösen war: iPad Pro/Air 13" hochkant misst 1024×1366 und trifft
 * `(min-width: 1024px)` auf den Pixel. Es bekam damit den horizontalen Pin und
 * den Prozess-Shuttle in einem Hochformat, für das beide nie ausgelegt waren
 * (`--frame-h` rechnet mit 78vh, `--frame-w` mit `100vw - 40ch`).
 *
 * Die naheliegende Formulierung wäre ein Ausschluss gewesen:
 *   (min-width: 1024px) and (not ((pointer: coarse) and (orientation: portrait)))
 *
 * Die ist hier verboten. Ein geklammertes `not` ist Media Queries Level 4 und
 * wird von Safari erst ab 16.4 verstanden. Ältere Browser verwerfen bei einem
 * unbekannten Konstrukt die GESAMTE Query — der Pin wäre dort aus, und zwar
 * auf dem Desktop. Genau die Regression, die dieser Umbau ausschliessen soll.
 *
 * Die Zwei-Arm-Form benutzt nur Features, die überall verstanden werden:
 *  - Arm 1 fängt JEDEN Maus-Desktop, unabhängig von der Fensterform. Die
 *    unantastbare Zone ist damit beweisbar unberührt.
 *  - Arm 2 fängt jedes iPad im Querformat, das den Pin behalten soll.
 *  - iPad 13" hochkant (coarse + portrait) matcht keinen Arm → Stapel.
 */
export const PIN_QUERY =
  "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference), " +
  "(min-width: 1024px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)";

/**
 * Das exakte Gegenstück zu PIN_QUERY. Der zweite Arm ist der Zugewinn: iPad 13"
 * hochkant, das vorher zwischen beiden Layouts durchfiel.
 */
export const STACK_QUERY =
  "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference), " +
  "(min-width: 1024px) and (pointer: coarse) and (orientation: portrait) and (prefers-reduced-motion: no-preference)";
