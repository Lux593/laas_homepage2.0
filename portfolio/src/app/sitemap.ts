import { MetadataRoute } from "next";

import { SITE_CONFIG } from "@/lib/constants";
import { LEGAL_PAGES } from "@/lib/legal";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    // Die Rechtsseiten gehören in die Sitemap, aber nicht auf dieselbe Stufe:
    // sie ändern sich selten und sind kein Ziel, für das die Seite ranken soll.
    ...LEGAL_PAGES.map((page) => ({
      url: `${SITE_CONFIG.url}${page.href}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
