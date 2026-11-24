import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HomePage from "@/components/home/HomePage";
import { DEFAULT_LOCALE, hasLocale } from "@/lib/i18n/locales";
import { pageMetadata } from "@/lib/site-metadata";

// Titel und Beschreibung kommen aus dem Root-Layout, hier Sprachverweise und
// og:url: `/` und `/en` zeigen per hreflang aufeinander, jede auf sich selbst.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("/", hasLocale(lang) ? lang : DEFAULT_LOCALE);
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // Engt nur den Typ ein: `dynamicParams = false` am Layout lässt nur de/en durch.
  if (!hasLocale(lang)) notFound();

  return <HomePage locale={lang} />;
}
