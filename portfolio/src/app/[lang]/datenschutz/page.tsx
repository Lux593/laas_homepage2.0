import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LegalShell from "@/components/legal/LegalShell";
import { LEGAL_DOCS } from "@/content/legal";
import { DEFAULT_LOCALE, hasLocale, localizePath } from "@/lib/i18n/locales";
import type { LegalSlug } from "@/lib/legal";

const SLUG: LegalSlug = "datenschutz";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : DEFAULT_LOCALE;
  const doc = LEGAL_DOCS[SLUG][locale];

  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    // Jede Sprache ist ihre eigene kanonische URL: /datenschutz und /en/datenschutz.
    alternates: { canonical: localizePath(`/${SLUG}`, locale) },
  };
}

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const doc = LEGAL_DOCS[SLUG][lang];

  return (
    <LegalShell
      locale={lang}
      current={SLUG}
      title={doc.title}
      lede={doc.lede}
      sections={doc.sections}
    />
  );
}
