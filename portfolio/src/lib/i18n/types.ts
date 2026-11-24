/**
 * Form der Wörterbücher (`dictionaries/de.ts`, später `en.ts`).
 *
 * Nur Strings und Listen von Strings: was sprachneutral ist (Pfade, Farben,
 * Firmennamen), steht in lib/constants.ts und kommt über die IDs dazu, siehe
 * lib/i18n/content.ts. Listen mit IDs sind `Record`s über die ID-Unions aus
 * constants — fehlt einer Sprache ein Eintrag, bricht der Build.
 *
 * Werte mit `{name}` sind Vorlagen. Gefüllt werden sie mit `format()` in der
 * Komponente, die den Text ausgibt, weil sich Funktionen nicht vom Server an
 * Client-Komponenten übergeben lassen.
 */

import type {
  ClientId,
  NavHash,
  ProcessStepId,
  ProjectId,
  RoleId,
  ServiceId,
} from "../constants.ts";
import type { LegalSlug } from "../legal.ts";
import type { Locale } from "./locales.ts";

type Feature = { title: string; description: string };

export type Dictionary = {
  meta: {
    title: string;
    description: string;
    ogDescription: string;
    knowsAbout: string[];
  };
  common: { skipToContent: string; logoAlt: string };
  nav: {
    items: Record<NavHash, string>;
    menuToggle: string;
    languageNav: string;
    languageNames: Record<Locale, string>;
  };
  hero: {
    greeting: string;
    focusLabel: string;
    rotatingWords: string[];
    scrollHint: string;
  };
  services: {
    eyebrow: string;
    headline: string;
    statement: string;
    sectionLabel: string;
    /** Vorlage mit `{statement}`. */
    landscapeLabel: string;
    /** Vorlage mit `{value}` (0–100): Stellung der Ziehkante, vorgelesen. */
    landscapeValue: string;
    items: Record<ServiceId, { title: string; description: string }>;
  };
  process: {
    eyebrow: string;
    headline: string;
    /** Vorlage mit `{subtitle}`. */
    mediaLabel: string;
    /** Knoten der Kreismarke, die ProcessCycle zeigt, solange ein Schritt
     *  noch kein Standbild hat — einer je Schritt, in Schrittfolge. */
    cycleLabels: string[];
    steps: Record<
      ProcessStepId,
      { title: string; subtitle: string; description: string; points: Feature[] }
    >;
  };
  work: {
    eyebrow: string;
    headline: string;
    gallery: GalleryLabels;
    projects: Record<
      ProjectId,
      {
        title: string;
        subtitle: string;
        features: Feature[];
        /** Ein Titel je Aufnahme, in der Reihenfolge von PROJECT_ASSETS. */
        galleryTitles: string[];
      }
    >;
  };
  clients: { sectionLabel: string; names: Record<ClientId, string> };
  about: {
    eyebrow: string;
    headline: string;
    greeting: string;
    subtitle: string[];
    rolesHeading: string;
    toolsHeading: string;
    portraitAlt: string;
    roles: Record<RoleId, string>;
  };
  cta: {
    headline: string;
    subline: string;
    button: string;
    /** Vorlage mit `{platform}`. */
    socialLabel: string;
  };
  legalLinks: Record<LegalSlug, string>;
  legalChrome: LegalChrome;
  notFound: {
    metaTitle: string;
    eyebrow: string;
    title: string;
    lede: string;
    whereTo: string;
    sectionsLabel: string;
  };
};

export type GalleryLabels = {
  previous: string;
  next: string;
  list: string;
  /** Vorlage mit `{current}` und `{total}`. */
  item: string;
};

export type LegalChrome = {
  eyebrow: string;
  updatedLabel: string;
  backHome: string;
  moreLegal: string;
  tocLabel: string;
  tocHeading: string;
  /** Vorlage mit `{label}`. */
  fillLabel: string;
  streetLabel: string;
  translationNotice: { text: string; linkLabel: string } | null;
};

export type NavCopy = {
  items: { label: string; href: NavHash }[];
  menuToggle: string;
  logoAlt: string;
  languageNav: string;
  languageNames: Record<Locale, string>;
};

/** Ein Link der Rechts-Fusszeile, fertig für die Sprache der Seite. */
export type LegalLink = { slug: LegalSlug; href: string; label: string };
