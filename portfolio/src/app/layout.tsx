import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import AnimationProvider from "@/components/providers/AnimationProvider";
import GrainOverlay from "@/components/ui/GrainOverlay";

import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: "Luca Arnoldi — Fullstack Developer & Digital Experience Engineer",
  description:
    "Ich baue digitale Erlebnisse, die nicht nur funktionieren — sie faszinieren. Fullstack Developer spezialisiert auf React, Next.js, KI-Integration & Premium Web Experiences.",
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
    locale: "de_DE",
    url: SITE_CONFIG.url,
    title: "LAAS — Luca Arnoldi App Studio",
    description: "Herzlich Willkommen auf meiner Homepage.",
    siteName: "Luca Arnoldi App Studio",
    // Eigenes JPEG statt des Bühnenbilds: Link-Vorschauen laufen über fremde
    // Scraper, die WebP teils nicht lesen und grosse Dateien verwerfen.
    // 1200x630 ist das Format, das LinkedIn, Slack und X erwarten.
    // Inhalt: die Wortmarke aus laas-logo-full.svg, weiss auf #050505, mittig
    // mit reichlich Rand — Telegram und Co. runden die Ecken ab.
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
    description: "Herzlich Willkommen auf meiner Homepage.",
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
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
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
