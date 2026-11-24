import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LegalShell from "@/components/legal/LegalShell";
import { LEGAL_DOCS, legalMetadata } from "@/content/legal";
import { DEFAULT_LOCALE, hasLocale } from "@/lib/i18n/locales";
import type { LegalSlug } from "@/lib/legal";

const SLUG: LegalSlug = "impressum";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return legalMetadata(SLUG, hasLocale(lang) ? lang : DEFAULT_LOCALE);
}

export default async function ImpressumPage({
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
