import { notFound } from "next/navigation";

import HomePage from "@/components/home/HomePage";
import { hasLocale } from "@/lib/i18n/locales";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return <HomePage locale={lang} />;
}
