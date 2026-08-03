import type { NextConfig } from "next";

/**
 * Hostinger: App-Root ist `portfolio/` (hPanel → Root directory).
 * Static Export (`out/`) — CSS/JS liegen als echte Dateien unter `out/_next/`,
 * damit Styles auch ohne Next-Node-Proxy laden.
 *
 * hPanel:
 * - Application type: next
 * - Root directory: portfolio
 * - Build script: build
 * - Output directory: out
 */
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  compress: true,

  transpilePackages: ["three"],

  images: {
    unoptimized: true,
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
};

export default nextConfig;
