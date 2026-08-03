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

  transpilePackages: ["three"],

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  turbopack: {
    rules: {
      "*.glsl": { loaders: ["raw-loader"], as: "*.js" },
      "*.vert": { loaders: ["raw-loader"], as: "*.js" },
      "*.frag": { loaders: ["raw-loader"], as: "*.js" },
    },
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader"],
    });
    return config;
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
    ];
  },
};

export default nextConfig;
