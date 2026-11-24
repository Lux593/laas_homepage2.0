import type { Metadata, Viewport } from "next";
import DocumentShell from "@/components/layout/DocumentShell";

import { DEFAULT_LOCALE, LOCALES, hasLocale } from "@/lib/i18n/locales";
import { SITE_METADATA, SITE_VIEWPORT } from "@/lib/site-metadata";

export const metadata: Metadata = SITE_METADATA;

export const viewport: Viewport = SITE_VIEWPORT;

// Beide Sprachen werden beim Build vorgerendert: `/de/…` (vom Proxy hinter
// den Pfaden ohne Präfix bedient) und `/en/…`.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Nur diese beiden Werte sind Routen. Ein anderer Wert (`/wp-login.php`, das
// ohne Proxy direkt auf [lang] trifft) trifft damit keine Route und landet wie
// `/gibtsnicht` oder `/en/gibtsnicht` in app/global-not-found.tsx —
// serverseitig gerendert, mit Status 404. Ein notFound() aus Layout oder Page
// rendert Next 16.4 hier dagegen nur im Browser, das Server-HTML wäre eine
// leere Fehler-Shell.
export const dynamicParams = false;

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // Wegen `dynamicParams = false` kommt hier nur `de` oder `en` an. Die
  // Prüfung engt den Typ für TypeScript ein, der Fallback greift nie.
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : DEFAULT_LOCALE;

  return <DocumentShell locale={locale}>{children}</DocumentShell>;
}
