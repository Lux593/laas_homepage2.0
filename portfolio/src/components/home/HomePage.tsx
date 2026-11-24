import Navigation from "@/components/ui/Navigation";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import SelectedWork from "@/components/sections/SelectedWork";
import Clients from "@/components/sections/Clients";
import Process from "@/components/sections/Process";
import GiganticCTA from "@/components/sections/GiganticCTA";
import {
  getAboutRoles,
  getClients,
  getLegalLinks,
  getNavCopy,
  getProcessSteps,
  getProjects,
  getServices,
} from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, localizePath, otherLocale } from "@/lib/i18n/locales";

/**
 * Kopie ohne den Schlüssel `key`. Die Listen der Sections (Leistungen,
 * Schritte, Projekte, Rollen) reisen gemergt als eigene Prop; ohne sie hier
 * wegzunehmen, stünde jeder ihrer Texte doppelt in der Seite, die der Browser
 * lädt.
 */
function without<T extends object, K extends keyof T>(
  object: T,
  key: K,
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(object).filter(([name]) => name !== key),
  ) as Omit<T, K>;
}

/**
 * Der One-Pager einer Sprache.
 *
 * Server-Komponente: sie lädt das Wörterbuch, führt es mit den Assets aus
 * lib/constants.ts zusammen und reicht jeder Section nur ihre fertigen Texte.
 * Die Sections sind fast alle Client-Komponenten und sehen deshalb nie ein
 * Wörterbuch — es landete sonst im Bundle.
 */
export default function HomePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <main id="main-content" className="relative min-h-screen bg-bg-primary">
      <ScrollProgress />
      <Navigation
        locale={locale}
        isHome
        alternateHref={localizePath("/", otherLocale(locale))}
        copy={getNavCopy(dict)}
      />

      <div className="relative z-10">
        {/* Gemeinsamer Positions-Kontext: der Hero klebt per position:sticky darin,
            bis die cremefarbene Leistungen-Section sich vollständig über ihn
            geschoben hat. Die Klammer muss hier enden - Process und alles
            danach haben keinen eigenen Hintergrund, dort dürfte kein Hero-Rest
            mehr dahinterstehen. */}
        <div className="relative">
          <Hero copy={dict.hero} />
          <Services copy={without(dict.services, "items")} services={getServices(dict)} />
        </div>

        <Process copy={without(dict.process, "steps")} steps={getProcessSteps(dict)} />

        {/* Cream über dunklem Prozess; schwarzer Kunden-Balken trennt zu About. */}
        <SelectedWork copy={without(dict.work, "projects")} projects={getProjects(dict)} />
        <Clients label={dict.clients.sectionLabel} clients={getClients(dict)} />

        {/* About behält flachen Cream-Einstieg (kein Top-Radius) nach dem Balken —
            nur noch die untere Kante Richtung CTA. */}
        <About copy={without(dict.about, "roles")} roles={getAboutRoles(dict)} />

        <GiganticCTA copy={dict.cta} legalLinks={getLegalLinks(dict, locale)} />
      </div>
    </main>
  );
}
