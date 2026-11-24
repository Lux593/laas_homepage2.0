import type { Metadata, Viewport } from "next";

import { SITE_CONFIG } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, OG_LOCALE, otherLocale } from "@/lib/i18n/locales";
import { type PagePath, absoluteUrl, buildAlternates } from "@/lib/i18n/seo";
import type { Dictionary } from "@/lib/i18n/types";

/**
 * Grund-Metadaten der Seite in der Sprache des Wörterbuchs.
 *
 * Zwei Dateien nutzen sie: das Root-Layout unter app/[lang] und
 * app/global-not-found.tsx. Die globale 404 hängt unter keinem Layout und
 * erbt deshalb nichts — ohne diesen gemeinsamen Stand fehlten ihr
 * Beschreibung, Vorschaubild und Favicon.
 *
 * Titel und Name im Vorschaubild sind die Marke und bleiben in jeder Sprache.
 *
 * Sprachverweise (`alternates`) und og:url stehen nicht hier, sondern über
 * pageMetadata in jeder Seite: nur die Seite kennt ihren eigenen Pfad. Die
 * 404 setzt beides nicht.
 */
export const siteMetadata = (dict: Dictionary, locale: Locale): Metadata => ({
  metadataBase: new URL(SITE_CONFIG.url),
  title: dict.meta.title,
  description: dict.meta.description,
  keywords: [
    "Fullstack Developer",
    "Web Developer",
    "React",
    "Next.js",
    "TypeScript",
    "AI Integration",
    "Digital Experience",
  ],
  authors: [{ name: "Luca Arnoldi" }],
  openGraph: siteOpenGraph(dict, locale),
  twitter: {
    card: "summary_large_image",
    title: "LAAS — Luca Arnoldi App Studio",
    description: dict.meta.ogDescription,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
});

/**
 * Was eine Seite mit eigener Adresse zu siteMetadata ergänzt: Sprachverweise
 * und og:url, beide auf ihre kanonische URL.
 *
 * og:url lesen Facebook und LinkedIn als Adresse des geteilten Links und
 * holen die Vorschau dort neu ab. Stünde es im Layout, zeigte jede Seite auf
 * die deutsche Startseite.
 *
 * `openGraph` kommt vollständig mit: Next mischt es aus Layout und Seite
 * nicht, sondern ersetzt es als Ganzes — mit `url` allein verlöre die Seite
 * Bild, Titel und og:locale.
 */
export function pageMetadata(path: PagePath, locale: Locale): Metadata {
  const alternates = buildAlternates(path, locale);
  return {
    alternates,
    openGraph: {
      ...siteOpenGraph(getDictionary(locale), locale),
      url: absoluteUrl(alternates.canonical),
    },
  };
}

/** og-Grundstand ohne `url`: siteMetadata und pageMetadata teilen ihn. */
function siteOpenGraph(
  dict: Dictionary,
  locale: Locale,
): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    locale: OG_LOCALE[locale],
    alternateLocale: OG_LOCALE[otherLocale(locale)],
    title: "LAAS — Luca Arnoldi App Studio",
    description: dict.meta.ogDescription,
    siteName: "Luca Arnoldi App Studio",
    // Eigenes JPEG statt des Bühnenbilds: Link-Vorschauen laufen über fremde
    // Scraper, die WebP teils nicht lesen und grosse Dateien verwerfen.
    // 1200x630 ist das Format, das LinkedIn, Slack und X erwarten.
    // Inhalt: die Wortmarke aus laas-logo-full.svg im Marken-Off-White
    // (#f2ede4, --color-panel) auf #050505, mittig mit reichlich Rand —
    // Telegram und Co. runden die Ecken ab.
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LAAS — Luca Arnoldi App Studio",
      },
    ],
  };
}

export const SITE_VIEWPORT: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};
