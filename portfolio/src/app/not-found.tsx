import type { Metadata } from "next";

import LegalPage from "@/components/legal/LegalPage";
import { NAV_ITEMS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Seite nicht gefunden — Luca Arnoldi App Solutions",
  // Eine Fehlerseite gehört nicht in den Index. `follow` bleibt an, damit die
  // Wege zurück auf die Startseite trotzdem gelesen werden.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <LegalPage
      eyebrow="Fehler 404"
      title="NICHTS ZU SEHEN"
      lede="Diese Seite gibt es nicht — jedenfalls nicht mehr, oder noch nicht. Vielleicht hat sich ein Tippfehler in die Adresse geschlichen, vielleicht ist der Link älter als die Seite dahinter."
      showUpdated={false}
    >
      {/* Kein LegalSection: die Fehlerseite ist kein Dokument mit Kapiteln,
          sondern eine Kreuzung. Die Haarlinie oben zitiert trotzdem den
          Rhythmus der Rechtsseiten, damit beide erkennbar zusammengehören. */}
      <div className="mt-12 border-t border-[#0a0a0a]/10 pt-8 md:mt-16 md:pt-10">
        <span className="block font-mono text-caption uppercase tracking-[0.2em] text-[#9a9a9a]">
          Wohin stattdessen
        </span>

        <nav
          aria-label="Bereiche der Startseite"
          className="mt-6 flex flex-col"
        >
          {/* <a> aus demselben Grund wie in LegalPage: die Ziele sind Anker auf
              der Startseite, und die will frisch aufgebaut werden. */}
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={`/${item.href}`}
              className="group flex items-baseline justify-between gap-6 border-b border-[#0a0a0a]/10 py-4 font-display text-[clamp(1.25rem,2.6vw,1.75rem)] font-bold tracking-tight text-[#0a0a0a] transition-colors duration-300 hover:text-[#A07850]"
            >
              {item.label}
              <span
                aria-hidden
                className="font-body text-body-sm font-normal text-[#9a9a9a] transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          ))}
        </nav>
      </div>
    </LegalPage>
  );
}
