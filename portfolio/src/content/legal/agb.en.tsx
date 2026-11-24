import { Fill, ProviderAddress } from "@/components/legal/Fill";
import { LegalList, LegalTerm as Term } from "@/components/legal/LegalSection";
import type { LegalSectionData } from "@/components/legal/LegalSection";
import type { LegalDoc } from "@/content/legal";
import { LEGAL } from "@/lib/legal";

const { provider, terms } = LEGAL;

/**
 * Englische Fassung der AGB. Höflichkeitsübersetzung: verbindlich ist
 * agb.de.tsx. Kapitel-IDs, Reihenfolge, Querverweise und Fill-Stellen wie
 * dort. Auftragnehmer → contractor, Auftraggeber → client, Unternehmer →
 * entrepreneur (§ 14 BGB), Textform → text form.
 */
const SECTIONS: LegalSectionData[] = [
  {
    id: "geltungsbereich",
    title: "Scope",
    body: (
      <>
        <p>
          These General Terms and Conditions apply to all contracts for services
          between the contractor and the client. They apply to entrepreneurs
          (Unternehmer) within the meaning of § 14 of the German Civil Code
          (BGB) as well as to consumers within the meaning of § 13 BGB; the{" "}
          <a href="#widerruf">right of withdrawal</a> applies exclusively to
          consumers.
        </p>
        <p>
          Deviating, conflicting or supplementary terms of the client only
          become part of the contract if their validity has been expressly
          agreed to in text form (Textform). This also applies if services are
          provided without reservation in the knowledge of such terms.
        </p>
        <p>The contractor within the meaning of these terms is:</p>
        <ProviderAddress />
      </>
    ),
  },
  {
    id: "vertragsschluss",
    title: "Conclusion of contract",
    body: (
      <>
        <p>
          The presentation of services on this website does not constitute a
          binding offer, but a non-binding invitation to submit an inquiry.
        </p>
        <p>
          Upon inquiry, an individual offer is prepared in text form that
          describes the scope of services, remuneration and time frame. The
          contract is concluded when the client accepts this offer in text form
          — email is sufficient. The offer is binding for{" "}
          <Fill
            value={null}
            label="Binding period of the offer, e.g., 14 days"
          />{" "}
          from receipt, unless otherwise stated therein.
        </p>
      </>
    ),
  },
  {
    id: "leistungen",
    title: "Subject matter of services",
    body: (
      <>
        <p>
          The scope of services owed is conclusively determined by the accepted
          offer together with any annexes, such as a concept, service
          description or functional specification (Pflichtenheft). There are no
          oral side agreements.
        </p>
        <p>
          Depending on the agreement, either work performance (Werkleistungen: a
          specific result is owed, such as an application ready for acceptance)
          or services (Dienstleistungen: an activity is owed, such as ongoing
          support and consulting) are provided. The offer specifies which of the
          two applies.
        </p>
        <p>
          The contractor is entitled to engage third parties to perform the
          contract. This does not affect the contractor’s responsibility toward
          the client.
        </p>
        <p>
          Change requests after conclusion of the contract are assessed
          separately. If they result in additional effort, remuneration and
          deadlines are adjusted in text form before the change is implemented.
        </p>
      </>
    ),
  },
  {
    id: "mitwirkung",
    title: "Client’s cooperation",
    body: (
      <>
        <p>
          Performance of the services requires the client’s cooperation. In
          particular, the client provides the following in a timely manner,
          completely and free of charge:
        </p>
        <LegalList
          items={[
            "all information, content, texts and image data required for implementation",
            "necessary access to systems, servers, accounts and interfaces of third parties",
            "a designated contact person with decision-making authority",
            "feedback and approvals within the agreed deadlines",
          ]}
        />
        <p>
          The client warrants that they hold the necessary rights to the content
          provided and that its use does not infringe the rights of third
          parties.
        </p>
        <p>
          If the client’s cooperation is delayed, the agreed deadlines are
          postponed accordingly. Any demonstrable additional effort resulting
          from this may be charged separately after prior notice.
        </p>
      </>
    ),
  },
  {
    id: "verguetung",
    title: "Remuneration and payment",
    body: (
      <>
        <p>
          The remuneration is set out in the offer — either as a fixed price for
          a defined scope of services or on a time-and-materials basis. For
          time-and-materials billing, the hourly rate is{" "}
          <Fill value={terms.hourlyRate} label="Hourly rate, net" />.
        </p>
        <p>
          For projects at or above a volume specified in the offer, a deposit of{" "}
          <Fill value={terms.deposit} label="Deposit at project start" /> is due
          when the order is placed. The remaining amount is invoiced after
          acceptance. Ongoing services are billed monthly.
        </p>
        <p>
          Invoices are payable without deduction within{" "}
          <Fill value={terms.paymentDays} label="Payment term" /> of the invoice
          date. All prices are exclusive of the applicable statutory VAT,
          insofar as VAT must be shown.
        </p>
        <p>
          Costs for <a href="#dritte">third-party services</a> are not included
          in the remuneration unless the offer expressly lists them.
        </p>
      </>
    ),
  },
  {
    id: "termine",
    title: "Dates and deadlines",
    body: (
      <>
        <p>
          Dates and deadlines are only binding if they have been expressly
          agreed as binding in text form. Otherwise, they are non-binding time
          estimates given to the best of the contractor’s knowledge.
        </p>
        <p>
          Events beyond the contractor’s control — in particular outages at
          service providers, illness or force majeure — extend binding deadlines
          by the duration of the impediment plus a reasonable start-up period.
          The client will be informed without undue delay.
        </p>
      </>
    ),
  },
  {
    id: "abnahme",
    title: "Acceptance",
    body: (
      <>
        <p>
          For work performance, the contractor gives notice of completion and
          makes the result available for review. The client reviews it within{" "}
          <Fill
            value={terms.acceptanceDays}
            label="Review period in working days"
          />{" "}
          and either declares acceptance in text form or names the defects that
          prevent it.
        </p>
        <p>
          Insignificant defects do not entitle the client to refuse acceptance;
          they are remedied under the warranty. If the client puts the result
          into productive use without declaring acceptance, it is deemed
          accepted when the review period expires.
        </p>
        <p>
          Separable partial services can be accepted separately if this has been
          agreed.
        </p>
      </>
    ),
  },
  {
    id: "nutzungsrechte",
    title: "Rights of use",
    body: (
      <>
        <p>
          For the results created specifically for them, the client receives an
          exclusive right of use, unrestricted in terms of territory and time,
          for the purposes provided for in the contract. The rights only pass
          upon full payment of the agreed remuneration; until then, a revocable
          right of use for testing and coordination purposes is granted.
        </p>
        <p>
          This does not cover pre-existing components: libraries, frameworks,
          tools, templates and general methods that the contractor has developed
          or uses independently of the order. For these, a simple, non-exclusive
          right of use is granted within the scope of the contractual purpose.
          The contractor remains entitled to reuse them in other projects.
        </p>
        <p>
          Third-party software — in particular open-source components — is
          governed exclusively by its respective license terms. An overview of
          the components used will be provided on request.
        </p>
      </>
    ),
  },
  {
    id: "dritte",
    title: "Third-party services",
    body: (
      <>
        <p>
          Operating the solutions created usually requires third-party services,
          such as hosting, domains, databases, interfaces, model or software
          licenses. Unless otherwise agreed, these are procured in the name and
          for the account of the client; the contracts are concluded directly
          between the client and the respective provider.
        </p>
        <p>
          No liability is assumed for the availability, scope of services, price
          changes or discontinuation of such services. If a provider changes or
          discontinues its interface, the necessary adaptation is deemed a
          separate service subject to remuneration.
        </p>
      </>
    ),
  },
  {
    id: "gewaehrleistung",
    title: "Warranty",
    body: (
      <>
        <p>
          The statutory provisions apply. For work performance, the contractor
          has the right to subsequent performance; if it fails twice, the client
          is entitled to the statutory rights.
        </p>
        <p>
          For entrepreneurs, the limitation period for claims based on defects
          is{" "}
          <Fill
            value={terms.warrantyPeriod}
            label="Warranty period for entrepreneurs"
          />{" "}
          from acceptance. For consumers, the full statutory period applies. The
          shortened period does not apply in cases of intent, gross negligence
          or fraudulently concealed defects, or to damage resulting from injury
          to life, body or health.
        </p>
        <p>
          There is no defect if a deviation results from the client having
          modified the software on their own authority, operated it in an
          environment that was not agreed or used it contrary to the
          documentation, or if the cause lies in a{" "}
          <a href="#dritte">third-party service</a>.
        </p>
        <p>
          According to the state of the art, it cannot be guaranteed that
          software is completely free of errors. What is owed is suitability for
          the use presupposed under the contract.
        </p>
      </>
    ),
  },
  {
    id: "haftung",
    title: "Liability",
    body: (
      <>
        <p>
          The contractor is liable without limitation for intent and gross
          negligence, for injury to life, body or health, for fraudulent
          concealment of a defect, to the extent of any guarantee assumed, and
          under the German Product Liability Act (Produkthaftungsgesetz).
        </p>
        <p>
          In cases of simple negligence, the contractor is only liable for the
          breach of essential contractual obligations — obligations whose
          fulfillment makes the proper performance of the contract possible in
          the first place and on whose observance the client may regularly rely.
          In this case, liability is limited to the foreseeable damage typical
          for this type of contract at the time the contract was concluded.
        </p>
        <p>Any further liability is excluded.</p>
        <p>
          The client remains responsible for regular data backups in line with
          the state of the art. For loss of data, the contractor is only liable
          to the extent that would have been required to restore the data had it
          been properly backed up.
        </p>
      </>
    ),
  },
  {
    id: "vertraulichkeit",
    title: "Confidentiality and references",
    body: (
      <>
        <p>
          Both parties treat all business and trade secrets that become known to
          them in the course of the collaboration as confidential and use them
          exclusively for the purposes of the contract. This obligation
          continues beyond the end of the collaboration.
        </p>
        <p>
          If personal data is processed on the client’s behalf, the parties
          first conclude a data processing agreement pursuant to Art. 28 GDPR.
        </p>
        <p>
          After completion, the contractor may cite the project as a reference,
          stating the client’s name, and present excerpts of it. The client may
          object to this in text form; confidential content and data are never
          shown.
        </p>
      </>
    ),
  },
  {
    id: "laufzeit",
    title: "Term and termination",
    body: (
      <>
        <p>
          Project contracts end upon complete performance and acceptance of the
          agreed services.
        </p>
        <p>
          Continuing contracts for maintenance, ongoing care or support may be
          terminated by either party with a notice period of{" "}
          <Fill value={terms.noticePeriod} label="Notice period" /> to the end
          of a month. The right to extraordinary termination for good cause
          remains unaffected.
        </p>
        <p>
          Notices of termination must be given in text form. After the contract
          ends, all project-related data and access credentials will be handed
          over on request, insofar as statutory retention obligations do not
          prevent this.
        </p>
      </>
    ),
  },
  {
    id: "widerruf",
    title: "Right of withdrawal for consumers",
    body: (
      <>
        <p>
          Consumers have a statutory right of withdrawal for contracts concluded
          exclusively by means of distance communication. A consumer is any
          natural person who enters into a legal transaction for purposes that
          can predominantly be attributed neither to their commercial nor to
          their self-employed professional activity.
        </p>
        <p>
          <Term>Withdrawal policy</Term>
          <br />
          You have the right to withdraw from this contract within fourteen days
          of its conclusion without giving any reason. To exercise your right of
          withdrawal, you must inform me — {provider.name},{" "}
          <Fill value={provider.street} label="Street address" />,{" "}
          {provider.zip} {provider.city},{" "}
          <a href={`mailto:${provider.email}`}>{provider.email}</a>,{" "}
          <Fill value={provider.phone} label="Phone number" /> — of your
          decision by means of an unequivocal statement. To meet the withdrawal
          deadline, it is sufficient for you to send your communication before
          the withdrawal period has expired.
        </p>
        <p>
          <Term>Effects of withdrawal</Term>
          <br />
          If you withdraw from this contract, I must reimburse all payments I
          have received from you without undue delay and no later than fourteen
          days from the day on which I received notice of your withdrawal. For
          this reimbursement, I will use the same means of payment that you used
          for the original transaction, unless expressly agreed otherwise; in no
          case will you be charged any fees for this reimbursement.
        </p>
        <p>
          <Term>Early expiry</Term>
          <br />
          If you have requested that the services begin during the withdrawal
          period, you must pay me a reasonable amount corresponding to the
          proportion of the services provided up to the withdrawal compared to
          the total scope of the services provided for in the contract. In the
          case of the supply of digital content, the right of withdrawal expires
          if you have expressly consented to performance beginning before the
          end of the withdrawal period and have acknowledged that you thereby
          lose your right of withdrawal.
        </p>
        <p>
          There is no right of withdrawal for contracts for the supply of goods
          that are made to customer specifications or are clearly tailored to
          personal needs (§ 312g(2) no. 1 BGB).
        </p>
      </>
    ),
  },
  {
    id: "schluss",
    title: "Final provisions",
    body: (
      <>
        <p>
          The law of the Federal Republic of Germany applies, excluding the UN
          Convention on Contracts for the International Sale of Goods (CISG).
          For consumers, this choice of law applies only insofar as it does not
          deprive them of the protection of mandatory provisions of the law of
          the state of their habitual residence.
        </p>
        <p>
          If the client is a merchant (Kaufmann), a legal entity under public
          law or a special fund under public law, the exclusive place of
          jurisdiction for all disputes arising from the contractual
          relationship is{" "}
          <Fill value={terms.jurisdiction} label="Place of jurisdiction" />.
        </p>
        <p>
          Amendments and additions to the contract must be made in text form.
          This also applies to any waiver of this form requirement.
        </p>
        <p>
          Should any provision of these terms be or become invalid, the validity
          of the remaining provisions remains unaffected. The invalid provision
          is replaced by the statutory provision.
        </p>
      </>
    ),
  },
];

export const agbEn: LegalDoc = {
  metaTitle: "Terms and Conditions — Luca Arnoldi App Solutions",
  metaDescription:
    "General terms and conditions for software development, process automation, AI integration and web design.",
  title: "TERMS AND CONDITIONS",
  lede: "General terms and conditions for software development, process automation, AI integration and web design. They apply to all contracts concluded on this basis.",
  sections: SECTIONS,
};
