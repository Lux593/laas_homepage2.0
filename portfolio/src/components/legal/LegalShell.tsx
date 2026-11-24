import LegalPage from "@/components/legal/LegalPage";
import type { LegalSectionData } from "@/components/legal/LegalSection";
import { getLegalLinks, getNavCopy } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/format";
import { type Locale, localizePath, otherLocale } from "@/lib/i18n/locales";
import { LEGAL, type LegalSlug } from "@/lib/legal";

/**
 * Server-Hülle um LegalPage: lädt das Wörterbuch und reicht der
 * Client-Komponente nur die fertigen Texte — Navigation, Rahmentexte,
 * Rechtslinks und das formatierte Standdatum.
 *
 * Die Rechtsseiten und die 404 rendern diese Hülle statt LegalPage direkt,
 * damit kein Wörterbuch im Browser-Bundle landet.
 */
export default function LegalShell({
  locale,
  current,
  title,
  lede,
  sections,
  children,
  showUpdated,
  eyebrow,
}: {
  locale: Locale;
  current: LegalSlug | null;
  title: string;
  lede: string;
  sections?: LegalSectionData[];
  children?: React.ReactNode;
  showUpdated?: boolean;
  eyebrow?: string;
}) {
  const dict = getDictionary(locale);

  return (
    <LegalPage
      locale={locale}
      current={current}
      alternateHref={localizePath(
        current ? `/${current}` : "/",
        otherLocale(locale),
      )}
      nav={getNavCopy(dict)}
      chrome={dict.legalChrome}
      legalLinks={getLegalLinks(dict, locale)}
      updated={formatDate(LEGAL.updated, locale)}
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      showUpdated={showUpdated}
      sections={sections}
    >
      {children}
    </LegalPage>
  );
}
