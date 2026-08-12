import { SITE_CONFIG } from "@/lib/constants";

/**
 * Alle nachfüllbaren Angaben der Rechtsseiten an genau einer Stelle.
 *
 * `null` heisst „fehlt noch". Die Texte in app/impressum, app/datenschutz und
 * app/agb greifen ausschliesslich über <Fill> auf diese Werte zu: steht hier
 * ein Wert, erscheint er im Fliesstext; steht `null`, erscheint stattdessen ein
 * markierter Platzhalter mit der Beschriftung, die am Aufrufort steht.
 *
 * Nachfüllen heisst deshalb: hier `null` durch den echten Wert ersetzen. Die
 * Rechtstexte selbst müssen dafür nicht angefasst werden, und die Markierung
 * verschwindet von allein.
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
    country: "Deutschland",
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
    address: "61 Lordou Vironos Street, 6023 Larnaca, Zypern",
  },

  /** Kaufmännische Eckwerte für die AGB. */
  terms: {
    /** Stundensatz netto, inklusive Währung — z. B. „95 EUR". */
    hourlyRate: null as string | null,
    /** Zahlungsziel ab Rechnungsdatum — z. B. „14 Tage". */
    paymentDays: null as string | null,
    /** Anzahlung bei Projektbeginn — z. B. „30 % der Auftragssumme". */
    deposit: null as string | null,
    /** Frist für die Abnahmeerklärung — z. B. „10 Werktage". */
    acceptanceDays: null as string | null,
    /** Gewährleistungsfrist ab Abnahme — z. B. „12 Monate". */
    warrantyPeriod: null as string | null,
    /** Kündigungsfrist laufender Wartungs- und Supportverträge. */
    noticePeriod: null as string | null,
    /** Gerichtsstand bei Verträgen mit Unternehmern — z. B. „Lörrach". */
    jurisdiction: null as string | null,
  },

  /**
   * Stand der Dokumente. Bewusst ein fester String und kein `new Date()`: das
   * Datum soll sich ändern, wenn die Texte sich ändern — nicht bei jedem
   * Aufruf. Beim Nachfüllen der Platzhalter mit hochziehen.
   */
  updated: "12. August 2026",
};

/** Fusszeile der Rechtsseiten und der Kontaktkarte — eine Reihenfolge, eine Quelle. */
export const LEGAL_PAGES = [
  { href: "/agb", label: "AGB" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/impressum", label: "Impressum" },
] as const;
