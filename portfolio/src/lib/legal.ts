// Relativ und mit Endung, damit lib/i18n/content.ts samt Test unter
// `node --test` ohne Bundler lädt.
import { SITE_CONFIG } from "./constants.ts";
import type { Locale } from "./i18n/locales.ts";

/**
 * Alle nachfüllbaren Angaben der Rechtsseiten an genau einer Stelle.
 *
 * `null` heisst „fehlt noch". Die Texte in content/legal (je Seite und
 * Sprache ein Modul) greifen ausschliesslich über <Fill> auf diese Werte zu:
 * steht hier ein Wert, erscheint er im Fliesstext; steht `null`, erscheint
 * stattdessen ein markierter Platzhalter mit der Beschriftung, die am
 * Aufrufort steht.
 *
 * Werte, die sich mit der Sprache ändern, stehen je Sprache da (`de`/`en`):
 * Ländername, Anschrift des Hosters und die Fristen und Anteile der AGB —
 * deren Einheit ist Text („14 Tage" / „14 days") und steht mitten im Satz.
 * In jeder Sprache gleich bleiben Eigennamen (Firmierung, Behörde, Hoster,
 * Gerichtsort), Anschrift und Kontakt des Anbieters und der Stundensatz.
 *
 * Nachfüllen heisst deshalb: hier `null` durch den echten Wert ersetzen — bei
 * Werten je Sprache in beiden Sprachen. Die Rechtstexte selbst müssen dafür
 * nicht angefasst werden, und die Markierung verschwindet von allein.
 *
 * Was hier NICHT steht, steht bewusst nicht hier: Registergericht und
 * Berufsaufsicht. Ein nicht eingetragenes Einzelunternehmen in der
 * Softwareentwicklung hat weder das eine noch das andere, und ein Platzhalter,
 * der nie gefüllt wird, ist nur eine Lücke, die man irgendwann übersieht.
 * Ändert sich die Rechtsform, kommen beide zusammen mit ihrem Abschnitt dazu.
 */
export const LEGAL = {
  /** Anbieter im Sinne des § 5 DDG. */
  provider: {
    name: "Luca Arnoldi",
    /** Firmierung, wie sie im Geschäftsverkehr geführt wird. */
    company: "LAAS – Luca Arnoldi App Solutions",
    street: null as string | null,
    zip: "79576",
    city: "Weil am Rhein",
    country: { de: "Deutschland", en: "Germany" } satisfies Record<
      Locale,
      string
    >,
    /**
     * Geschäftliche Adresse. Steht hier die private Gmail, ist das rechtlich
     * zulässig, aber sie landet damit öffentlich im Impressum und in jeder
     * Adressernte — eine eigene Domain-Adresse wäre die ruhigere Wahl.
     */
    email: SITE_CONFIG.email,
    /**
     * Telefonnummer. § 5 DDG verlangt einen Weg zur „unmittelbaren
     * Kommunikation"; eine E-Mail-Adresse allein genügt nach der Rechtsprechung
     * nur, wenn Anfragen darüber zügig beantwortet werden. Eine Nummer hier ist
     * der sichere Weg.
     */
    phone: null as string | null,
    /** Umsatzsteuer-Identifikationsnummer nach § 27 a UStG. */
    vatId: null as string | null,
    /**
     * Kleinunternehmer nach § 19 UStG?
     * `true`  → Hinweis, dass keine Umsatzsteuer ausgewiesen wird.
     * `false` → die USt-IdNr. oben wird ausgewiesen.
     * `null`  → Platzhalter; die Frage ist offen.
     */
    smallBusiness: true as boolean | null,
  },

  /** Zuständige Datenschutz-Aufsichtsbehörde am Sitz des Anbieters. */
  authority: {
    name: "Landesbeauftragter für den Datenschutz und die Informationsfreiheit Baden-Württemberg",
    url: "https://www.baden-wuerttemberg.datenschutz.de",
  },

  /** Hoster — Grundlage des Abschnitts „Hosting" in der Datenschutzerklärung. */
  hosting: {
    name: "Hostinger International Ltd.",
    address: {
      de: "61 Lordou Vironos Street, 6023 Larnaca, Zypern",
      en: "61 Lordou Vironos Street, 6023 Larnaca, Cyprus",
    } satisfies Record<Locale, string>,
  },

  /**
   * Kaufmännische Eckwerte für die AGB. Fristen und Anteile je Sprache, weil
   * ihre Einheit im Satz der jeweiligen Fassung steht; Stundensatz und
   * Gerichtsstand sind in beiden Fassungen gleich.
   */
  terms: {
    /** Stundensatz netto, inklusive Währung — z. B. „95 EUR". Beide Sprachen. */
    hourlyRate: null as string | null,
    /** Zahlungsziel ab Rechnungsdatum — z. B. de „14 Tage", en „14 days". */
    paymentDays: { de: null, en: null } satisfies Record<Locale, string | null>,
    /**
     * Anzahlung bei Projektbeginn — z. B. de „30 % der Auftragssumme",
     * en „30% of the order value".
     */
    deposit: { de: null, en: null } satisfies Record<Locale, string | null>,
    /** Frist für die Abnahmeerklärung — z. B. de „10 Werktage", en „10 working days". */
    acceptanceDays: { de: null, en: null } satisfies Record<
      Locale,
      string | null
    >,
    /** Gewährleistungsfrist ab Abnahme — z. B. de „12 Monate", en „12 months". */
    warrantyPeriod: { de: null, en: null } satisfies Record<
      Locale,
      string | null
    >,
    /**
     * Kündigungsfrist laufender Wartungs- und Supportverträge — z. B.
     * de „4 Wochen", en „4 weeks".
     */
    noticePeriod: { de: null, en: null } satisfies Record<
      Locale,
      string | null
    >,
    /** Gerichtsstand bei Verträgen mit Unternehmern — z. B. „Lörrach". Beide Sprachen. */
    jurisdiction: null as string | null,
  },

  /**
   * Stand der Dokumente als ISO-Datum. Bewusst fest und kein `new Date()`: das
   * Datum soll sich ändern, wenn die Texte sich ändern — nicht bei jedem
   * Aufruf. Beim Nachfüllen der Platzhalter mit hochziehen. Lesbar macht es
   * `formatDate` je Sprache („12. August 2026" / „August 12, 2026").
   */
  updated: "2026-08-12",
};

/**
 * Slugs der Rechtsseiten, in beiden Sprachen gleich (`/agb`, `/en/agb`).
 * Fusszeile der Rechtsseiten, Kontaktkarte und Sitemap lesen diese eine Liste
 * — eine Reihenfolge, eine Quelle. Die Beschriftungen stehen im Wörterbuch.
 */
export const LEGAL_SLUGS = ["agb", "datenschutz", "impressum"] as const;

/** Slug einer Rechtsseite. Aus LEGAL_SLUGS abgeleitet, damit beide nicht auseinanderlaufen. */
export type LegalSlug = (typeof LEGAL_SLUGS)[number];
