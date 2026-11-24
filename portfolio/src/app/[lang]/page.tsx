import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HomePage from "@/components/home/HomePage";
import { DEFAULT_LOCALE, hasLocale } from "@/lib/i18n/locales";
import { buildAlternates } from "@/lib/i18n/seo";

// Titel und Beschreibung kommen aus dem Root-Layout, hier nur die
// Sprachverweise: `/` und `/en` zeigen per hreflang aufeinander.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    alternates: buildAlternates("/", hasLocale(lang) ? lang : DEFAULT_LOCALE),
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return <HomePage locale={lang} />;
}
