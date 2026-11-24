import type { Metadata } from "next";

import type { LegalSectionData } from "@/components/legal/LegalSection";
import type { Locale } from "@/lib/i18n/locales";
import { buildAlternates } from "@/lib/i18n/seo";
import type { LegalSlug } from "@/lib/legal";

import { agbDe } from "./agb.de";
import { agbEn } from "./agb.en";
import { datenschutzDe } from "./datenschutz.de";
import { datenschutzEn } from "./datenschutz.en";
import { impressumDe } from "./impressum.de";
import { impressumEn } from "./impressum.en";

/**
 * Ein Rechtsdokument in einer Sprache: Metadaten, Kopf und Kapitel.
 *
 * Rechtstext ist JSX mit <Fill>, Links und Anschriften und passt deshalb nicht
 * ins String-Wörterbuch. Er liegt je Seite und Sprache in einem eigenen Modul
 * (`impressum.de.tsx`, `impressum.en.tsx`, …). Verbindlich ist die deutsche
 * Fassung; die englische Seite zeigt dazu den Hinweis aus
 * `legalChrome.translationNotice`.
 *
 * Die Kapitel-IDs sind in beiden Sprachen gleich, damit ein Hash
 * (`/en/impressum#kontakt` → `/impressum#kontakt`) den Sprachwechsel übersteht.
 */
export type LegalDoc = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lede: string;
  sections: LegalSectionData[];
};

/**
 * Alle Rechtsdokumente nach Slug und Sprache. Nur in Server-Komponenten
 * importieren: die Texte beider Sprachen hängen daran.
 */
export const LEGAL_DOCS: Record<LegalSlug, Record<Locale, LegalDoc>> = {
  agb: { de: agbDe, en: agbEn },
  datenschutz: { de: datenschutzDe, en: datenschutzEn },
  impressum: { de: impressumDe, en: impressumEn },
};

/**
 * Metadaten einer Rechtsseite: Titel, Beschreibung und die Sprachverweise.
 * Jede Sprache ist ihre eigene kanonische URL (`/impressum`, `/en/impressum`),
 * beide zeigen per hreflang aufeinander.
 */
export function legalMetadata(slug: LegalSlug, locale: Locale): Metadata {
  const doc = LEGAL_DOCS[slug][locale];
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: buildAlternates(`/${slug}`, locale),
  };
}
