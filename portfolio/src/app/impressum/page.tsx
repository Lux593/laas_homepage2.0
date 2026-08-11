import type { Metadata } from "next";

import { Fill, ProviderAddress } from "@/components/legal/Fill";
import LegalPage from "@/components/legal/LegalPage";
import type { LegalSectionData } from "@/components/legal/LegalSection";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Impressum — Luca Arnoldi App Solutions",
  description:
    "Anbieterkennzeichnung nach § 5 DDG: Anbieter, Kontakt, Umsatzsteuer und Verantwortlichkeit für die Inhalte dieser Website.",
  alternates: { canonical: "/impressum" },
};

const { provider } = LEGAL;

const SECTIONS: LegalSectionData[] = [
  {
    id: "anbieter",
    title: "Anbieter",
    body: <ProviderAddress />,
  },
  {
    id: "kontakt",
    title: "Kontakt",
    body: (
      <>
        <p>
          E-Mail: <a href={`mailto:${provider.email}`}>{provider.email}</a>
        </p>
        <p>
          Telefon: <Fill value={provider.phone} label="Telefonnummer" />
        </p>
      </>
    ),
  },
  {
    id: "umsatzsteuer",
    title: "Umsatzsteuer",
    body:
      provider.smallBusiness === null ? (
        <p>
          <Fill
            value={null}
            label="Kleinunternehmer nach § 19 UStG — ja oder nein?"
          />{" "}
          Davon hängt ab, ob hier die Umsatzsteuer-Identifikationsnummer steht
          oder der Hinweis auf die Kleinunternehmerregelung.
        </p>
      ) : provider.smallBusiness ? (
        <p>
          Als Kleinunternehmer im Sinne des § 19 UStG wird keine Umsatzsteuer
          berechnet und daher auch keine in Rechnungen ausgewiesen.
        </p>
      ) : (
        <p>
          Umsatzsteuer-Identifikationsnummer nach § 27 a Umsatzsteuergesetz:{" "}
          <Fill value={provider.vatId} label="USt-IdNr." />
        </p>
      ),
  },
  {
    id: "verantwortlich",
    title: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
    body: (
      <p>
        {provider.name},{" "}
        <Fill value={provider.street} label="Strasse und Hausnummer" />,{" "}
        {provider.zip} {provider.city}
      </p>
    ),
  },
  {
    id: "streitbeilegung",
    title: "Verbraucherstreitbeilegung",
    body: (
      <>
        <p>
          Ich bin weder bereit noch verpflichtet, an Streitbeilegungsverfahren
          vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 Abs. 1
          Nr. 1 VSBG).
        </p>
        <p>
          Ein Hinweis auf die Online-Streitbeilegungsplattform der Europäischen
          Kommission entfällt: Die Plattform hat ihren Betrieb am 20. Juli 2025
          eingestellt.
        </p>
      </>
    ),
  },
  {
    id: "haftung-inhalte",
    title: "Haftung für Inhalte",
    body: (
      <>
        <p>
          Als Diensteanbieter bin ich nach § 7 Abs. 1 DDG für eigene Inhalte auf
          diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8
          bis 10 DDG bin ich als Diensteanbieter jedoch nicht verpflichtet,
          übermittelte oder gespeicherte fremde Informationen zu überwachen oder
          nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
          hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
          Informationen nach den allgemeinen Gesetzen bleiben davon unberührt.
          Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
          Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
          entsprechender Rechtsverletzungen entferne ich diese Inhalte umgehend.
        </p>
      </>
    ),
  },
  {
    id: "haftung-links",
    title: "Haftung für Links",
    body: (
      <>
        <p>
          Dieses Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden
          Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
          Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
        </p>
        <p>
          Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche
          Rechtsverstösse überprüft; rechtswidrige Inhalte waren nicht erkennbar.
          Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne
          konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
          Bekanntwerden von Rechtsverletzungen entferne ich derartige Links
          umgehend.
        </p>
      </>
    ),
  },
  {
    id: "urheberrecht",
    title: "Urheberrecht",
    body: (
      <>
        <p>
          Die durch mich erstellten Inhalte und Werke auf diesen Seiten
          unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung,
          Verbreitung und jede Art der Verwertung ausserhalb der Grenzen des
          Urheberrechts bedürfen meiner schriftlichen Zustimmung. Downloads und
          Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
          Gebrauch gestattet.
        </p>
        <p>
          Soweit die Inhalte auf dieser Seite nicht von mir erstellt wurden,
          werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte
          Dritter als solche gekennzeichnet. Solltest du trotzdem auf eine
          Urheberrechtsverletzung aufmerksam werden, bitte ich um einen
          entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
          entferne ich derartige Inhalte umgehend.
        </p>
      </>
    ),
  },
];

export default function ImpressumPage() {
  return (
    <LegalPage
      title="IMPRESSUM"
      lede="Angaben nach § 5 des Digitale-Dienste-Gesetzes (DDG) und § 18 Abs. 2 des Medienstaatsvertrags (MStV)."
      sections={SECTIONS}
    />
  );
}
