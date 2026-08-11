import path from "node:path";
import type { NextConfig } from "next";

/**
 * Hostinger (hPanel → Einstellungen und erneute Bereitstellung):
 * - Framework-Voreinstellung: Next.js  → Hostinger startet `next start`
 * - Root-Verzeichnis:         portfolio
 * - Build-Befehl:             pnpm run build
 * - Paketmanager:             pnpm     → braucht pnpm-lock.yaml im Repo
 * - Ausgabeverzeichnis:       .next
 *
 * KEIN `output: "export"`. Das Framework-Preset "Next.js" fährt einen Node-Server;
 * ein Static Export erzeugt aber nur `out/` und kein `.next` — `next start` bricht
 * dann ab mit "Could not find a production build in the '.next' directory".
 *
 * Wo Dateien hingehören — die App ist ALLES unterhalb von portfolio/:
 * - Bilder/Videos NUR nach portfolio/public/. Von dort werden sie unter `/...`
 *   ausgeliefert (portfolio/public/vorschaubilder/x.png → /vorschaubilder/x.png).
 * - Ein Ordner im Repo-Root (z. B. /vorschaubilder) landet NICHT auf der Website.
 *   Er wird nur mitgeklont und macht den Deploy größer.
 * - Genau eine Lockfile: pnpm-lock.yaml. Liegt zusätzlich eine package-lock.json
 *   daneben, ist der erkannte Paketmanager mehrdeutig.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  turbopack: {
    // Pin workspace root to portfolio/. Next otherwise walks up to the git
    // parent (or a leftover lockfile) and CSS @import "tailwindcss" fails
    // because deps live only under portfolio/node_modules (Next #92452).
    root: path.join(__dirname),
    resolveAlias: {
      tailwindcss: path.join(__dirname, "node_modules/tailwindcss"),
    },
  },

  async headers() {
    return [
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        /**
         * Seiten-Antworten duerfen am CDN nicht einfrieren.
         *
         * Next schickt fuer vorgerenderte Seiten von sich aus
         * `Cache-Control: s-maxage=31536000`. Das ist auf Vercel gedacht, wo
         * der Cache bei jedem Deploy geleert wird. Hostingers CDN (hcdn)
         * leert nicht — es hat das HTML ein Jahr lang festgehalten und
         * Besuchern einen alten Build ausgeliefert, dessen gehashte
         * JS/CSS-Chunks es nach dem naechsten Deploy nicht mehr gab. Ergebnis
         * im Browser: 404 auf alle Chunks, keine Hydration, halb gestyltes
         * Markup, das kurz aufblitzt und stehen bleibt.
         *
         * max-age=0 + must-revalidate heisst: bei jedem Aufruf beim Origin
         * nachfragen. Dank ETag ist das im Normalfall ein 304 ohne Body.
         *
         * Die Regel trifft nur Dokument-Pfade — alles unter `_next/` und alles
         * mit Dateiendung ist ausgenommen. Die gehashten Build-Artefakte
         * behalten damit ihr `immutable`, sie sind ueber den Hash ohnehin
         * eindeutig und koennen nie veralten.
         */
        source: "/((?!_next/)(?!.*\\.[a-zA-Z0-9]+$).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
