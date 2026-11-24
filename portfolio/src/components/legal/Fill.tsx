import { lang } from "next/root-params";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { format } from "@/lib/i18n/format";
import { DEFAULT_LOCALE, hasLocale } from "@/lib/i18n/locales";
import { LEGAL } from "@/lib/legal";

/**
 * Die Rahmentexte der Rechtsseiten in der Sprache der Route. Fill steht tief
 * in den Rechtstexten, deshalb kommt die Sprache aus dem Root-Parameter statt
 * als Prop durch jede Stelle. Ohne gültige Sprache: Deutsch.
 */
async function legalChrome() {
  const value = await lang();
  return getDictionary(hasLocale(value) ? value : DEFAULT_LOCALE).legalChrome;
}

/**
 * Ein Wert aus lib/legal.ts — oder, solange er dort `null` ist, ein sichtbar
 * markierter Platzhalter.
 *
 * Die Markierung ist Absicht und kein Übergangsschmutz: wer die Seite einmal
 * durchscrollt, sieht jede offene Stelle, ohne den Rechtstext lesen zu müssen.
 * Sie verschwindet von selbst, sobald in lib/legal.ts ein Wert steht — die
 * Texte in app/impressum, app/datenschutz und app/agb bleiben unangetastet.
 */
export async function Fill({
  value,
  label,
}: {
  /** Der Wert aus LEGAL — `null`, solange die Angabe fehlt. */
  value: string | null;
  /** Was hier hingehört. Steht im Platzhalter und ist die Anleitung zum Ausfüllen. */
  label: string;
}) {
  if (value) return <>{value}</>;

  const chrome = await legalChrome();

  return (
    <span
      // Kein Aussenabstand: die Marke steht mitten im Satz, und ein mx würde
      // vor dem folgenden Satzzeichen als Leerschlag stehen („Gerichtsstand ."
      // stand so im ersten Durchgang). Den Abstand nach vorn trägt der
      // Wortzwischenraum des Fliesstexts, die Luft im Inneren das px.
      className="inline-block rounded-[3px] bg-[#A07850]/12 px-1.5 font-mono text-[0.85em] tracking-tight text-[#8a6540] underline decoration-[#A07850]/45 decoration-dashed underline-offset-[3px]"
      // Für Screenreader ausgeschrieben — „[Strasse]" allein wäre vorgelesen
      // nicht als Lücke erkennbar.
      aria-label={format(chrome.fillLabel, { label })}
    >
      {label}
    </span>
  );
}

/**
 * Anschrift des Anbieters als Block — steht im Impressum, in der
 * Datenschutzerklärung und in den AGB jeweils identisch.
 */
export async function ProviderAddress() {
  const { company, name, street, zip, city, country } = LEGAL.provider;
  const chrome = await legalChrome();

  return (
    <address className="not-italic">
      {company}
      <br />
      {name}
      <br />
      <Fill value={street} label={chrome.streetLabel} />
      <br />
      {zip} {city}
      <br />
      {country}
    </address>
  );
}
