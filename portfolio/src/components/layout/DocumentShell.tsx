import { Instrument_Serif, DM_Sans } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import AnimationProvider from "@/components/providers/AnimationProvider";
import GrainOverlay from "@/components/ui/GrainOverlay";

import { SITE_CONFIG } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/locales";
import "@/app/globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-clash",
  display: "swap",
});

const dmSansBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-satoshi",
  display: "swap",
});

/**
 * Das Dokument um jede Seite: `<html>`, `<body>`, Schriften, globales CSS,
 * Sprunglink und die Provider.
 *
 * Zwei Stellen rendern es: das Root-Layout unter app/[lang] und
 * app/global-not-found.tsx. Die globale 404 läuft an allen Layouts vorbei und
 * muss ihr Dokument selbst bauen. Über diese eine Komponente können die
 * beiden nicht auseinanderlaufen — eine neue Schrift oder ein neuer Provider
 * landet automatisch auch auf der 404.
 */
export default function DocumentShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${dmSansBody.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg-primary text-text-primary font-body antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Luca Arnoldi",
              jobTitle: "Fullstack Developer",
              url: SITE_CONFIG.url,
              sameAs: [
                SITE_CONFIG.socials.github,
                SITE_CONFIG.socials.linkedin,
                SITE_CONFIG.socials.instagram,
              ],
              knowsAbout: [
                "Web Development",
                "React",
                "Next.js",
                "TypeScript",
                "Individuelle Software",
                "Prozess Automationen",
                "KI Integrationen",
                "Website Design",
              ],
            }),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-bg-primary focus:rounded-lg focus:text-sm focus:font-bold"
        >
          Zum Inhalt springen
        </a>
        <SmoothScroll>
          <AnimationProvider>
            <GrainOverlay />
            {children}
          </AnimationProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
