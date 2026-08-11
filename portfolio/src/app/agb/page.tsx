import type { Metadata } from "next";

import { Fill, ProviderAddress } from "@/components/legal/Fill";
import LegalPage from "@/components/legal/LegalPage";
import { LegalList } from "@/components/legal/LegalSection";
import type { LegalSectionData } from "@/components/legal/LegalSection";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "AGB — Luca Arnoldi App Solutions",
  description:
    "Allgemeine Geschäftsbedingungen für Softwareentwicklung, Prozessautomatisierung, KI-Integration und Webdesign.",
  alternates: { canonical: "/agb" },
};

const { provider, terms } = LEGAL;

/** Hervorhebung im Fliesstext — die Widerrufsbelehrung gliedert sich darüber. */
function Term({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-[#0a0a0a]">{children}</strong>;
}

const SECTIONS: LegalSectionData[] = [
  {
    id: "geltungsbereich",
    title: "Geltungsbereich",
    body: (
      <>
        <p>
          Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über
          Leistungen zwischen dem Auftragnehmer und dem Auftraggeber. Sie gelten
          gegenüber Unternehmern im Sinne des § 14 BGB ebenso wie gegenüber
          Verbrauchern im Sinne des § 13 BGB; das{" "}
          <a href="#widerruf">Widerrufsrecht</a> gilt ausschliesslich für
          Verbraucher.
        </p>
        <p>
          Abweichende, entgegenstehende oder ergänzende Bedingungen des
          Auftraggebers werden nur dann Vertragsbestandteil, wenn ihrer Geltung
          ausdrücklich in Textform zugestimmt wurde. Das gilt auch dann, wenn
          Leistungen in Kenntnis solcher Bedingungen vorbehaltlos erbracht
          werden.
        </p>
        <p>Auftragnehmer im Sinne dieser Bedingungen ist:</p>
        <ProviderAddress />
      </>
    ),
  },
  {
    id: "vertragsschluss",
    title: "Vertragsschluss",
    body: (
      <>
        <p>
          Die Darstellung der Leistungen auf dieser Website ist kein bindendes
          Angebot, sondern eine unverbindliche Aufforderung zur Anfrage.
        </p>
        <p>
          Auf eine Anfrage hin wird ein individuelles Angebot in Textform
          erstellt, das Leistungsumfang, Vergütung und Zeitrahmen beschreibt.
          Der Vertrag kommt zustande, wenn der Auftraggeber dieses Angebot in
          Textform annimmt — per E-Mail genügt. Das Angebot ist{" "}
          <Fill value={null} label="Bindefrist des Angebots, z. B. 14 Tage" /> ab
          Zugang bindend, sofern darin nichts anderes angegeben ist.
        </p>
      </>
    ),
  },
  {
    id: "leistungen",
    title: "Leistungsgegenstand",
    body: (
      <>
        <p>
          Der geschuldete Leistungsumfang ergibt sich abschliessend aus dem
          angenommenen Angebot nebst etwaiger Anlagen wie Konzept,
          Leistungsbeschreibung oder Pflichtenheft. Mündliche Nebenabreden
          bestehen nicht.
        </p>
        <p>
          Je nach Vereinbarung werden Werkleistungen (ein geschuldeter Erfolg,
          etwa eine abnahmefähige Anwendung) oder Dienstleistungen (ein
          geschuldetes Tätigwerden, etwa laufende Betreuung und Beratung)
          erbracht. Welche der beiden Formen vorliegt, benennt das Angebot.
        </p>
        <p>
          Der Auftragnehmer ist berechtigt, zur Erfüllung Dritte einzusetzen.
          Die Verantwortung gegenüber dem Auftraggeber bleibt davon unberührt.
        </p>
        <p>
          Änderungswünsche nach Vertragsschluss werden gesondert bewertet.
          Führen sie zu Mehraufwand, werden Vergütung und Termine in Textform
          angepasst, bevor die Änderung umgesetzt wird.
        </p>
      </>
    ),
  },
  {
    id: "mitwirkung",
    title: "Mitwirkung des Auftraggebers",
    body: (
      <>
        <p>
          Die Leistungserbringung setzt die Mitwirkung des Auftraggebers voraus.
          Er stellt insbesondere rechtzeitig, vollständig und kostenfrei bereit:
        </p>
        <LegalList
          items={[
            "alle für die Umsetzung erforderlichen Informationen, Inhalte, Texte und Bilddaten",
            "notwendige Zugänge zu Systemen, Servern, Konten und Schnittstellen Dritter",
            "einen benannten Ansprechpartner mit Entscheidungsbefugnis",
            "Rückmeldungen und Freigaben innerhalb der vereinbarten Fristen",
          ]}
        />
        <p>
          Der Auftraggeber steht dafür ein, dass er an den überlassenen Inhalten
          die erforderlichen Rechte besitzt und ihre Nutzung keine Rechte
          Dritter verletzt.
        </p>
        <p>
          Verzögert sich die Mitwirkung, verschieben sich die vereinbarten
          Termine entsprechend. Entstehen dadurch nachweisbare Mehraufwände,
          können diese nach Ankündigung gesondert berechnet werden.
        </p>
      </>
    ),
  },
  {
    id: "verguetung",
    title: "Vergütung und Zahlung",
    body: (
      <>
        <p>
          Die Vergütung ergibt sich aus dem Angebot — entweder als Festpreis für
          einen abgegrenzten Leistungsumfang oder nach Aufwand. Bei Abrechnung
          nach Aufwand beträgt der Stundensatz{" "}
          <Fill value={terms.hourlyRate} label="Stundensatz netto" />.
        </p>
        <p>
          Bei Projekten ab einem Volumen, das im Angebot benannt ist, wird eine
          Anzahlung von{" "}
          <Fill value={terms.deposit} label="Anzahlung bei Projektbeginn" /> bei
          Auftragserteilung fällig. Der Restbetrag wird nach Abnahme in Rechnung
          gestellt. Laufende Leistungen werden monatlich abgerechnet.
        </p>
        <p>
          Rechnungen sind ohne Abzug innerhalb von{" "}
          <Fill value={terms.paymentDays} label="Zahlungsziel" /> ab
          Rechnungsdatum zur Zahlung fällig. Alle Preise verstehen sich
          zuzüglich der jeweils geltenden gesetzlichen Umsatzsteuer, soweit
          diese auszuweisen ist.
        </p>
        <p>
          Kosten für <a href="#dritte">Leistungen Dritter</a> sind in der
          Vergütung nicht enthalten, sofern das Angebot sie nicht ausdrücklich
          ausweist.
        </p>
      </>
    ),
  },
  {
    id: "termine",
    title: "Termine und Fristen",
    body: (
      <>
        <p>
          Termine und Fristen sind nur verbindlich, wenn sie ausdrücklich in
          Textform als verbindlich vereinbart wurden. Andernfalls handelt es
          sich um unverbindliche Zeitangaben nach bestem Wissen.
        </p>
        <p>
          Ereignisse ausserhalb des Einflussbereichs des Auftragnehmers —
          insbesondere Ausfälle bei Dienstleistern, Krankheit oder höhere Gewalt
          — verlängern verbindliche Fristen um die Dauer der Behinderung
          zuzüglich einer angemessenen Anlaufzeit. Der Auftraggeber wird
          unverzüglich informiert.
        </p>
      </>
    ),
  },
  {
    id: "abnahme",
    title: "Abnahme",
    body: (
      <>
        <p>
          Bei Werkleistungen zeigt der Auftragnehmer die Fertigstellung an und
          stellt das Ergebnis zur Prüfung bereit. Der Auftraggeber prüft es
          innerhalb von{" "}
          <Fill value={terms.acceptanceDays} label="Prüffrist in Werktagen" />{" "}
          und erklärt die Abnahme in Textform oder benennt die Mängel, die ihr
          entgegenstehen.
        </p>
        <p>
          Unwesentliche Mängel berechtigen nicht zur Verweigerung der Abnahme;
          sie werden im Rahmen der Gewährleistung behoben. Nimmt der
          Auftraggeber das Ergebnis produktiv in Nutzung, ohne die Abnahme zu
          erklären, gilt es mit Ablauf der Prüffrist als abgenommen.
        </p>
        <p>
          Abgrenzbare Teilleistungen können gesondert abgenommen werden, wenn
          dies vereinbart ist.
        </p>
      </>
    ),
  },
  {
    id: "nutzungsrechte",
    title: "Nutzungsrechte",
    body: (
      <>
        <p>
          Der Auftraggeber erhält an den eigens für ihn erstellten Ergebnissen
          ein räumlich und zeitlich unbeschränktes, ausschliessliches Recht zur
          Nutzung für die vertraglich vorgesehenen Zwecke. Die Rechte gehen erst
          mit vollständiger Zahlung der vereinbarten Vergütung über; bis dahin
          wird ein widerrufliches Recht zur Nutzung zu Test- und
          Abstimmungszwecken eingeräumt.
        </p>
        <p>
          Nicht erfasst sind vorbestehende Bausteine: Bibliotheken, Frameworks,
          Werkzeuge, Vorlagen und allgemeine Verfahren, die der Auftragnehmer
          unabhängig vom Auftrag entwickelt hat oder einsetzt. An diesen wird
          ein einfaches, nicht ausschliessliches Nutzungsrecht im Rahmen des
          Vertragszwecks eingeräumt. Der Auftragnehmer bleibt berechtigt, sie in
          anderen Projekten weiterzuverwenden.
        </p>
        <p>
          Für Software Dritter — insbesondere Open-Source-Komponenten — gelten
          ausschliesslich deren jeweilige Lizenzbedingungen. Eine Übersicht der
          eingesetzten Komponenten wird auf Wunsch bereitgestellt.
        </p>
      </>
    ),
  },
  {
    id: "dritte",
    title: "Leistungen Dritter",
    body: (
      <>
        <p>
          Für den Betrieb der erstellten Lösungen sind in der Regel Leistungen
          Dritter erforderlich, etwa Hosting, Domains, Datenbanken,
          Schnittstellen, Modell- oder Softwarelizenzen. Diese werden, sofern
          nichts anderes vereinbart ist, im Namen und auf Rechnung des
          Auftraggebers bezogen; die Verträge kommen unmittelbar zwischen ihm
          und dem jeweiligen Anbieter zustande.
        </p>
        <p>
          Für Verfügbarkeit, Leistungsumfang, Preisänderungen und Einstellung
          solcher Dienste wird keine Haftung übernommen. Ändert ein Anbieter
          seine Schnittstelle oder stellt sie ein, gilt die erforderliche
          Anpassung als gesonderte, zu vergütende Leistung.
        </p>
      </>
    ),
  },
  {
    id: "gewaehrleistung",
    title: "Gewährleistung",
    body: (
      <>
        <p>
          Es gelten die gesetzlichen Bestimmungen. Bei Werkleistungen hat der
          Auftragnehmer das Recht zur Nacherfüllung; schlägt sie zweimal fehl,
          stehen dem Auftraggeber die gesetzlichen Rechte zu.
        </p>
        <p>
          Gegenüber Unternehmern beträgt die Verjährungsfrist für
          Mängelansprüche{" "}
          <Fill
            value={terms.warrantyPeriod}
            label="Gewährleistungsfrist gegenüber Unternehmern"
          />{" "}
          ab Abnahme. Gegenüber Verbrauchern gilt die gesetzliche Frist
          ungekürzt. Die Verkürzung gilt nicht bei Vorsatz, grober
          Fahrlässigkeit, arglistig verschwiegenen Mängeln sowie bei Schäden aus
          der Verletzung des Lebens, des Körpers oder der Gesundheit.
        </p>
        <p>
          Kein Mangel liegt vor, wenn eine Abweichung darauf beruht, dass der
          Auftraggeber die Software eigenmächtig verändert, in einer nicht
          vereinbarten Umgebung betrieben oder entgegen der Dokumentation
          eingesetzt hat, oder wenn die Ursache in einer{" "}
          <a href="#dritte">Leistung Dritter</a> liegt.
        </p>
        <p>
          Dass Software vollständig fehlerfrei ist, kann nach dem Stand der
          Technik nicht gewährleistet werden. Geschuldet ist die Eignung für die
          vertraglich vorausgesetzte Verwendung.
        </p>
      </>
    ),
  },
  {
    id: "haftung",
    title: "Haftung",
    body: (
      <>
        <p>
          Der Auftragnehmer haftet unbeschränkt bei Vorsatz und grober
          Fahrlässigkeit, bei der Verletzung des Lebens, des Körpers oder der
          Gesundheit, bei arglistigem Verschweigen eines Mangels, im Umfang
          einer übernommenen Garantie sowie nach dem Produkthaftungsgesetz.
        </p>
        <p>
          Bei einfacher Fahrlässigkeit haftet er nur für die Verletzung
          wesentlicher Vertragspflichten — solcher Pflichten, deren Erfüllung
          die ordnungsgemässe Durchführung des Vertrags überhaupt erst
          ermöglicht und auf deren Einhaltung der Auftraggeber regelmässig
          vertrauen darf. In diesem Fall ist die Haftung auf den bei
          Vertragsschluss vorhersehbaren, vertragstypischen Schaden begrenzt.
        </p>
        <p>Eine weitergehende Haftung ist ausgeschlossen.</p>
        <p>
          Der Auftraggeber bleibt für eine regelmässige, dem Stand der Technik
          entsprechende Datensicherung verantwortlich. Für den Verlust von Daten
          haftet der Auftragnehmer nur in dem Umfang, der bei ordnungsgemässer
          Sicherung zur Wiederherstellung erforderlich gewesen wäre.
        </p>
      </>
    ),
  },
  {
    id: "vertraulichkeit",
    title: "Vertraulichkeit und Referenzen",
    body: (
      <>
        <p>
          Beide Seiten behandeln alle im Rahmen der Zusammenarbeit bekannt
          gewordenen Geschäfts- und Betriebsgeheimnisse vertraulich und
          verwenden sie ausschliesslich für Zwecke des Vertrags. Diese Pflicht
          besteht über das Ende der Zusammenarbeit hinaus fort.
        </p>
        <p>
          Werden im Auftrag personenbezogene Daten verarbeitet, schliessen die
          Parteien zuvor einen Vertrag zur Auftragsverarbeitung nach Art. 28
          DSGVO.
        </p>
        <p>
          Der Auftragnehmer darf das Projekt nach Fertigstellung unter Nennung
          des Auftraggebers als Referenz nennen und in Ausschnitten darstellen.
          Der Auftraggeber kann dem in Textform widersprechen; vertrauliche
          Inhalte und Daten werden in keinem Fall gezeigt.
        </p>
      </>
    ),
  },
  {
    id: "laufzeit",
    title: "Laufzeit und Kündigung",
    body: (
      <>
        <p>
          Projektverträge enden mit vollständiger Erbringung und Abnahme der
          vereinbarten Leistungen.
        </p>
        <p>
          Laufende Verträge über Wartung, Betreuung oder Support können von
          beiden Seiten mit einer Frist von{" "}
          <Fill value={terms.noticePeriod} label="Kündigungsfrist" /> zum
          Monatsende gekündigt werden. Das Recht zur ausserordentlichen
          Kündigung aus wichtigem Grund bleibt unberührt.
        </p>
        <p>
          Kündigungen bedürfen der Textform. Nach Beendigung werden auf Wunsch
          alle projektbezogenen Daten und Zugänge übergeben, soweit gesetzliche
          Aufbewahrungspflichten nicht entgegenstehen.
        </p>
      </>
    ),
  },
  {
    id: "widerruf",
    title: "Widerrufsrecht für Verbraucher",
    body: (
      <>
        <p>
          Verbraucher haben bei Verträgen, die ausschliesslich über
          Fernkommunikationsmittel geschlossen werden, ein gesetzliches
          Widerrufsrecht. Verbraucher ist jede natürliche Person, die ein
          Rechtsgeschäft zu Zwecken abschliesst, die überwiegend weder ihrer
          gewerblichen noch ihrer selbständigen beruflichen Tätigkeit
          zugerechnet werden können.
        </p>
        <p>
          <Term>Widerrufsbelehrung</Term>
          <br />
          Du hast das Recht, binnen vierzehn Tagen ab Vertragsschluss ohne
          Angabe von Gründen diesen Vertrag zu widerrufen. Um dein
          Widerrufsrecht auszuüben, musst du mich — {provider.name},{" "}
          <Fill value={provider.street} label="Strasse und Hausnummer" />,{" "}
          {provider.zip} {provider.city},{" "}
          <a href={`mailto:${provider.email}`}>{provider.email}</a>,{" "}
          <Fill value={provider.phone} label="Telefonnummer" /> — mittels einer
          eindeutigen Erklärung über deinen Entschluss informieren. Zur Wahrung
          der Frist reicht es aus, dass du die Mitteilung vor Ablauf der
          Widerrufsfrist absendest.
        </p>
        <p>
          <Term>Folgen des Widerrufs</Term>
          <br />
          Widerrufst du diesen Vertrag, habe ich dir alle Zahlungen, die ich von
          dir erhalten habe, unverzüglich und spätestens binnen vierzehn Tagen
          ab dem Tag zurückzuzahlen, an dem die Mitteilung über deinen Widerruf
          bei mir eingegangen ist. Für diese Rückzahlung verwende ich dasselbe
          Zahlungsmittel, das du bei der ursprünglichen Transaktion eingesetzt
          hast, es sei denn, es wurde ausdrücklich etwas anderes vereinbart; in
          keinem Fall werden dir wegen dieser Rückzahlung Entgelte berechnet.
        </p>
        <p>
          <Term>Vorzeitiges Erlöschen</Term>
          <br />
          Hast du verlangt, dass die Leistungen während der Widerrufsfrist
          beginnen sollen, so hast du mir einen angemessenen Betrag zu zahlen,
          der dem Anteil der bis zum Widerruf erbrachten Leistungen im Vergleich
          zum Gesamtumfang der vertraglich vereinbarten Leistungen entspricht.
          Bei der Lieferung digitaler Inhalte erlischt das Widerrufsrecht, wenn
          du ausdrücklich zugestimmt hast, dass mit der Ausführung vor Ablauf
          der Frist begonnen wird, und du deine Kenntnis davon bestätigt hast,
          dass du damit dein Widerrufsrecht verlierst.
        </p>
        <p>
          Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von
          Waren, die nach Kundenspezifikation angefertigt werden oder eindeutig
          auf die persönlichen Bedürfnisse zugeschnitten sind (§ 312g Abs. 2
          Nr. 1 BGB).
        </p>
      </>
    ),
  },
  {
    id: "schluss",
    title: "Schlussbestimmungen",
    body: (
      <>
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur insoweit,
          als dadurch der Schutz zwingender Bestimmungen des Rechts des Staates
          ihres gewöhnlichen Aufenthalts nicht entzogen wird.
        </p>
        <p>
          Ist der Auftraggeber Kaufmann, juristische Person des öffentlichen
          Rechts oder öffentlich-rechtliches Sondervermögen, ist
          ausschliesslicher Gerichtsstand für alle Streitigkeiten aus dem
          Vertragsverhältnis{" "}
          <Fill value={terms.jurisdiction} label="Gerichtsstand" />.
        </p>
        <p>
          Änderungen und Ergänzungen des Vertrags bedürfen der Textform. Das
          gilt auch für die Aufhebung dieses Formerfordernisses.
        </p>
        <p>
          Sollte eine Bestimmung dieser Bedingungen unwirksam sein oder werden,
          bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt. An
          die Stelle der unwirksamen Bestimmung tritt die gesetzliche Regelung.
        </p>
      </>
    ),
  },
];

export default function AGBPage() {
  return (
    <LegalPage
      title="AGB"
      lede="Allgemeine Geschäftsbedingungen für Softwareentwicklung, Prozessautomatisierung, KI-Integration und Webdesign. Sie gelten für alle Verträge, die auf dieser Grundlage geschlossen werden."
      sections={SECTIONS}
    />
  );
}
