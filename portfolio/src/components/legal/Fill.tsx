import { LEGAL } from "@/lib/legal";

/**
 * Ein Wert aus lib/legal.ts — oder, solange er dort `null` ist, ein sichtbar
 * markierter Platzhalter.
 *
 * Die Markierung ist Absicht und kein Übergangsschmutz: wer die Seite einmal
 * durchscrollt, sieht jede offene Stelle, ohne den Rechtstext lesen zu müssen.
 * Sie verschwindet von selbst, sobald in lib/legal.ts ein Wert steht — die
 * Texte in app/impressum, app/datenschutz und app/agb bleiben unangetastet.
 */
export function Fill({
  value,
  label,
}: {
  /** Der Wert aus LEGAL — `null`, solange die Angabe fehlt. */
  value: string | null;
  /** Was hier hingehört. Steht im Platzhalter und ist die Anleitung zum Ausfüllen. */
  label: string;
}) {
  if (value) return <>{value}</>;

  return (
    <span
      // Kein Aussenabstand: die Marke steht mitten im Satz, und ein mx würde
      // vor dem folgenden Satzzeichen als Leerschlag stehen („Gerichtsstand ."
      // stand so im ersten Durchgang). Den Abstand nach vorn trägt der
      // Wortzwischenraum des Fliesstexts, die Luft im Inneren das px.
      className="inline-block rounded-[3px] bg-[#A07850]/12 px-1.5 font-mono text-[0.85em] tracking-tight text-[#8a6540] underline decoration-[#A07850]/45 decoration-dashed underline-offset-[3px]"
      // Für Screenreader ausgeschrieben — „[Strasse]" allein wäre vorgelesen
      // nicht als Lücke erkennbar.
      aria-label={`Noch auszufüllen: ${label}`}
    >
      {label}
    </span>
  );
}

/**
 * Anschrift des Anbieters als Block — steht im Impressum, in der
 * Datenschutzerklärung und in den AGB jeweils identisch.
 */
export function ProviderAddress() {
  const { company, name, street, zip, city, country } = LEGAL.provider;

  return (
    <address className="not-italic">
      {company}
      <br />
      {name}
      <br />
      <Fill value={street} label="Strasse und Hausnummer" />
      <br />
      {zip} {city}
      <br />
      {country}
    </address>
  );
}
