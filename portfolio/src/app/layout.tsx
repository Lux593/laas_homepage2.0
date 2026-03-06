import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import AnimationProvider from "@/components/providers/AnimationProvider";
import GrainOverlay from "@/components/ui/GrainOverlay";
import Preloader from "@/components/ui/Preloader";

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
    url: "https://lucaarnoldi.com",
    title: "Luca Arnoldi — Fullstack Developer",
    description: "Ich baue digitale Erlebnisse, die faszinieren.",
    siteName: "Luca Arnoldi",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Luca Arnoldi Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luca Arnoldi — Fullstack Developer",
    description: "Ich baue digitale Erlebnisse, die faszinieren.",
    images: ["/images/og-image.png"],
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
              url: "https://lucaarnoldi.com",
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
                "AI Integration",
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
        <Preloader />
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
