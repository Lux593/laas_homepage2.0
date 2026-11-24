import { MetadataRoute } from "next";

import { LOCALES } from "@/lib/i18n/locales";
import { PAGE_PATHS, absoluteUrl, buildAlternates } from "@/lib/i18n/seo";

export const dynamic = "force-static";

/**
 * Jede Seite zweimal, deutsch und englisch. Jeder Eintrag nennt beide
 * Fassungen als Sprachvarianten — aus derselben Funktion, mit der die Seiten
 * ihre hreflang-Verweise setzen, damit Sitemap und Seiten nicht
 * auseinanderlaufen.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGE_PATHS.flatMap((path) => {
    const { de, en } = buildAlternates(path, "de").languages;
    const languages = { de: absoluteUrl(de), en: absoluteUrl(en) };
    // Die Rechtsseiten gehören in die Sitemap, aber nicht auf dieselbe Stufe:
    // sie ändern sich selten und sind kein Ziel, für das die Seite ranken soll.
    const isHome = path === "/";

    return LOCALES.map((locale) => ({
      url: languages[locale],
      lastModified: new Date(),
      changeFrequency: isHome ? ("monthly" as const) : ("yearly" as const),
      priority: isHome ? 1 : 0.3,
      alternates: { languages },
    }));
  });
}
