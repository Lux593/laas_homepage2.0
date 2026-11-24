import type { Metadata, Viewport } from "next";

import { SITE_CONFIG } from "@/lib/constants";
import { type Locale, OG_LOCALE, otherLocale } from "@/lib/i18n/locales";
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
 * Die Sprachverweise (`alternates`) stehen nicht hier, sondern in jeder Seite:
 * nur die Seite kennt ihren eigenen Pfad. Die 404 setzt keine.
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
  openGraph: {
    type: "website",
    locale: OG_LOCALE[locale],
    alternateLocale: OG_LOCALE[otherLocale(locale)],
    url: SITE_CONFIG.url,
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
  },
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

export const SITE_VIEWPORT: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};
