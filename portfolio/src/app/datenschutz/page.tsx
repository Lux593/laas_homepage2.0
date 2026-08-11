import type { Metadata } from "next";

import { Fill, ProviderAddress } from "@/components/legal/Fill";
import LegalPage from "@/components/legal/LegalPage";
import { LegalList } from "@/components/legal/LegalSection";
import type { LegalSectionData } from "@/components/legal/LegalSection";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — Luca Arnoldi App Solutions",
  description:
    "Informationen nach Art. 13 DSGVO: welche Daten beim Besuch dieser Website verarbeitet werden, auf welcher Rechtsgrundlage und welche Rechte du hast.",
  alternates: { canonical: "/datenschutz" },
};

const { provider, authority, hosting } = LEGAL;

/** Hervorhebung im Fliesstext — die Rechte-Liste lebt davon. */
function Term({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-[#0a0a0a]">{children}</strong>
  );
}

const SECTIONS: LegalSectionData[] = [
  {
    id: "verantwortlicher",
    title: "Verantwortlicher",
    body: (
      <>
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne
          des Art. 4 Nr. 7 DSGVO ist:
        </p>
        <ProviderAddress />
        <p>
          E-Mail: <a href={`mailto:${provider.email}`}>{provider.email}</a>
          <br />
          Telefon: <Fill value={provider.phone} label="Telefonnummer" />
        </p>
        <p>
          Ein Datenschutzbeauftragter ist nicht bestellt; die gesetzlichen
          Voraussetzungen für eine Benennung nach Art. 37 DSGVO und § 38 BDSG
          liegen nicht vor.
        </p>
      </>
    ),
  },
  {
    id: "grundsatz",
    title: "Grundsatz",
    body: (
      <p>
        Diese Website ist bewusst schlank gebaut. Sie setzt keine Cookies,
        bindet keine Analyse- oder Werbedienste ein und erstellt keine
        Nutzungsprofile. Ohne dein Zutun werden ausschliesslich die Daten
        verarbeitet, die für die technische Auslieferung der Seiten erforderlich
        sind — beschrieben unter <a href="#hosting">Hosting</a> und{" "}
        <a href="#logfiles">Server-Logfiles</a>.
      </p>
    ),
  },
  {
    id: "hosting",
    title: "Hosting",
    body: (
      <>
        <p>
          Diese Website wird bei einem externen Dienstleister gehostet. Die
          personenbezogenen Daten, die beim Aufruf der Seite anfallen, werden
          auf dessen Servern verarbeitet.
        </p>
        <p>
          {hosting.name}, {hosting.address}
        </p>
        <p>
          Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
          Das berechtigte Interesse liegt in einer sicheren, stabilen und
          effizienten Bereitstellung dieses Angebots durch einen professionellen
          Anbieter. Mit dem Hoster besteht ein Vertrag über die
          Auftragsverarbeitung nach Art. 28 DSGVO, der die weisungsgebundene und
          vertrauliche Verarbeitung der Daten sicherstellt.
        </p>
      </>
    ),
  },
  {
    id: "logfiles",
    title: "Server-Logfiles",
    body: (
      <>
        <p>
          Beim Aufruf dieser Website erhebt der Hosting-Anbieter automatisch
          Informationen, die dein Browser übermittelt, und speichert sie in
          sogenannten Server-Logfiles:
        </p>
        <LegalList
          items={[
            "Browsertyp und Browserversion",
            "verwendetes Betriebssystem",
            "Referrer-URL — die zuvor besuchte Seite",
            "Hostname des zugreifenden Rechners",
            "Uhrzeit der Serveranfrage",
            "IP-Adresse",
          ]}
        />
        <p>
          Eine Zusammenführung dieser Daten mit anderen Datenquellen findet
          nicht statt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO: der
          Betreiber einer Website hat ein berechtigtes Interesse an der
          technisch fehlerfreien Darstellung und der Abwehr von Angriffen — dazu
          müssen die Logfiles erfasst werden.
        </p>
        <p>
          Speicherdauer:{" "}
          <Fill
            value={null}
            label="Aufbewahrungsfrist der Logfiles beim Hoster erfragen — üblich sind 7 bis 30 Tage"
          />
        </p>
      </>
    ),
  },
  {
    id: "kontakt",
    title: "Kontaktaufnahme per E-Mail",
    body: (
      <>
        <p>
          Nimmst du per E-Mail Kontakt auf, werden deine Angaben inklusive der
          von dir dort angegebenen Kontaktdaten zur Bearbeitung der Anfrage und
          für den Fall von Anschlussfragen bei mir gespeichert. Diese Daten gebe
          ich nicht ohne deine Einwilligung weiter.
        </p>
        <p>
          Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO,
          sofern deine Anfrage mit der Erfüllung eines Vertrags zusammenhängt
          oder zur Durchführung vorvertraglicher Massnahmen erforderlich ist. In
          allen übrigen Fällen beruht die Verarbeitung auf meinem berechtigten
          Interesse an der effektiven Bearbeitung der an mich gerichteten
          Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf deiner Einwilligung
          (Art. 6 Abs. 1 lit. a DSGVO), sofern diese abgefragt wurde. Eine
          erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft
          widerrufen.
        </p>
        <p>
          Die Daten verbleiben bei mir, bis du zur Löschung aufforderst, deine
          Einwilligung widerrufst oder der Zweck der Speicherung entfällt — etwa
          nach abgeschlossener Bearbeitung deiner Anfrage. Zwingende gesetzliche
          Bestimmungen, insbesondere handels- und steuerrechtliche
          Aufbewahrungsfristen, bleiben unberührt.
        </p>
      </>
    ),
  },
  {
    id: "schriftarten",
    title: "Schriftarten",
    body: (
      <p>
        Diese Website verwendet die Schriften Instrument Serif und DM Sans. Sie
        werden nicht bei jedem Aufruf von einem fremden Server geladen, sondern
        beim Erstellen der Seite einmalig heruntergeladen und anschliessend vom
        eigenen Server ausgeliefert. Beim Besuch dieser Website wird deshalb
        keine Verbindung zu Servern von Google aufgebaut, und es werden keine
        Daten dorthin übertragen.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies und Reichweitenmessung",
    body: (
      <p>
        Diese Website setzt keine Cookies. Es kommen keine Webanalyse-Dienste,
        keine Tracking-Pixel, keine Werbenetzwerke und keine eingebetteten
        Inhalte Dritter zum Einsatz, die dein Verhalten aufzeichnen könnten.
        Eine Einwilligungsabfrage ist daher nicht erforderlich.
      </p>
    ),
  },
  {
    id: "externe-links",
    title: "Verlinkte Profile",
    body: (
      <>
        <p>
          Auf dieser Website findest du Links zu meinen Profilen bei GitHub,
          LinkedIn und Instagram. Es handelt sich um einfache Verlinkungen —
          Inhalte dieser Anbieter werden nicht eingebettet, und es findet keine
          Datenübertragung dorthin statt, solange du den Link nicht anklickst.
        </p>
        <p>
          Erst mit dem Klick verlässt du diese Website. Ab diesem Moment gilt die
          Datenschutzerklärung des jeweiligen Anbieters, auf dessen Verarbeitung
          ich keinen Einfluss habe. Dasselbe gilt für alle weiteren externen
          Verweise in diesem Angebot, etwa auf die Werkzeuge und Kunden, die im
          Portfolio genannt sind.
        </p>
      </>
    ),
  },
  {
    id: "rechte",
    title: "Deine Rechte",
    body: (
      <>
        <p>Dir stehen gegenüber mir folgende Rechte zu:</p>
        <LegalList
          items={[
            <>
              <Term>Auskunft</Term> (Art. 15 DSGVO) — welche Daten ich über dich
              verarbeite, zu welchem Zweck und wie lange.
            </>,
            <>
              <Term>Berichtigung</Term> (Art. 16 DSGVO) — unrichtige Daten muss
              ich korrigieren, unvollständige vervollständigen.
            </>,
            <>
              <Term>Löschung</Term> (Art. 17 DSGVO) — soweit keine gesetzliche
              Aufbewahrungspflicht entgegensteht.
            </>,
            <>
              <Term>Einschränkung der Verarbeitung</Term> (Art. 18 DSGVO).
            </>,
            <>
              <Term>Datenübertragbarkeit</Term> (Art. 20 DSGVO) — Herausgabe in
              einem gängigen, maschinenlesbaren Format.
            </>,
            <>
              <Term>Widerruf einer Einwilligung</Term> (Art. 7 Abs. 3 DSGVO) —
              jederzeit mit Wirkung für die Zukunft.
            </>,
          ]}
        />
        <p>
          Für alle diese Anliegen genügt eine formlose Nachricht an{" "}
          <a href={`mailto:${provider.email}`}>{provider.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: "widerspruch",
    title: "Widerspruchsrecht nach Art. 21 DSGVO",
    body: (
      <>
        <p>
          Werden Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeitet
          — also gestützt auf ein berechtigtes Interesse —, hast du das Recht,
          aus Gründen, die sich aus deiner besonderen Situation ergeben,
          jederzeit Widerspruch gegen diese Verarbeitung einzulegen. Das gilt
          insbesondere für die <a href="#logfiles">Server-Logfiles</a>.
        </p>
        <p>
          Nach einem Widerspruch verarbeite ich die betroffenen Daten nicht
          mehr, es sei denn, ich kann zwingende schutzwürdige Gründe nachweisen,
          die deine Interessen, Rechte und Freiheiten überwiegen, oder die
          Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von
          Rechtsansprüchen.
        </p>
      </>
    ),
  },
  {
    id: "beschwerde",
    title: "Beschwerderecht bei der Aufsichtsbehörde",
    body: (
      <>
        <p>
          Unbeschadet anderer Rechtsbehelfe steht dir ein Beschwerderecht bei
          einer Datenschutz-Aufsichtsbehörde zu (Art. 77 DSGVO) — insbesondere
          in dem Mitgliedstaat deines Aufenthaltsorts, deines Arbeitsplatzes
          oder des Orts des mutmasslichen Verstosses.
        </p>
        <p>
          Die für mich zuständige Aufsichtsbehörde ist der{" "}
          <a href={authority.url} target="_blank" rel="noopener noreferrer">
            {authority.name}
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "verschluesselung",
    title: "Verschlüsselte Übertragung",
    body: (
      <p>
        Diese Website nutzt aus Sicherheitsgründen und zum Schutz der
        Übertragung vertraulicher Inhalte eine TLS-Verschlüsselung. Eine
        verschlüsselte Verbindung erkennst du daran, dass die Adresszeile des
        Browsers von „http://“ auf „https://“ wechselt und ein Schloss-Symbol
        zeigt. Ist die Verschlüsselung aktiv, können die Daten, die du an mich
        übermittelst, nicht von Dritten mitgelesen werden.
      </p>
    ),
  },
  {
    id: "aenderungen",
    title: "Änderungen dieser Erklärung",
    body: (
      <p>
        Diese Datenschutzerklärung entspricht dem oben genannten Stand. Ändert
        sich die Website technisch oder ändern sich die rechtlichen Vorgaben,
        wird sie angepasst. Die jeweils aktuelle Fassung ist immer hier
        abrufbar.
      </p>
    ),
  },
];

export default function DatenschutzPage() {
  return (
    <LegalPage
      title="DATENSCHUTZ"
      lede="Informationen nach Art. 13 der Datenschutz-Grundverordnung: welche personenbezogenen Daten beim Besuch dieser Website verarbeitet werden, wozu, auf welcher Rechtsgrundlage — und welche Rechte du dagegen hast."
      sections={SECTIONS}
    />
  );
}
