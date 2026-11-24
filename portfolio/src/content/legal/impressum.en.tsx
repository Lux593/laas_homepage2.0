import { Fill, ProviderAddress } from "@/components/legal/Fill";
import type { LegalSectionData } from "@/components/legal/LegalSection";
import type { LegalDoc } from "@/content/legal";
import { LEGAL } from "@/lib/legal";

const { provider } = LEGAL;

/**
 * Englische Fassung des Impressums. Höflichkeitsübersetzung: verbindlich ist
 * impressum.de.tsx. Kapitel-IDs, Reihenfolge und Fill-Stellen wie dort.
 */
const SECTIONS: LegalSectionData[] = [
  {
    id: "anbieter",
    title: "Provider",
    body: <ProviderAddress />,
  },
  {
    id: "kontakt",
    title: "Contact",
    body: (
      <>
        <p>
          Email: <a href={`mailto:${provider.email}`}>{provider.email}</a>
        </p>
        <p>
          Phone: <Fill value={provider.phone} label="Phone number" />
        </p>
      </>
    ),
  },
  {
    id: "umsatzsteuer",
    title: "VAT",
    body:
      provider.smallBusiness === null ? (
        <p>
          <Fill
            value={null}
            label="Small business under § 19 UStG — yes or no?"
          />{" "}
          This determines whether the VAT identification number or the notice on
          the small business scheme appears here.
        </p>
      ) : provider.smallBusiness ? (
        <p>
          As a small business (Kleinunternehmer) within the meaning of § 19 of
          the German VAT Act (UStG), no VAT is charged, and accordingly none is
          shown on invoices.
        </p>
      ) : (
        <p>
          VAT identification number pursuant to § 27 a of the German VAT Act
          (Umsatzsteuergesetz):{" "}
          <Fill value={provider.vatId} label="VAT ID number" />
        </p>
      ),
  },
  {
    id: "verantwortlich",
    title: "Responsible for content under § 18(2) MStV",
    body: (
      <p>
        {provider.name}, <Fill value={provider.street} label="Street address" />
        , {provider.zip} {provider.city}
      </p>
    ),
  },
  {
    id: "streitbeilegung",
    title: "Consumer dispute resolution",
    body: (
      <>
        <p>
          I am neither willing nor obliged to participate in dispute resolution
          proceedings before a consumer arbitration board (§ 36(1) no. 1 VSBG).
        </p>
        <p>
          A reference to the European Commission’s online dispute resolution
          platform is omitted: the platform ceased operations on July 20, 2025.
        </p>
      </>
    ),
  },
  {
    id: "haftung-inhalte",
    title: "Liability for content",
    body: (
      <>
        <p>
          As a service provider, I am responsible for my own content on these
          pages under general law pursuant to § 7(1) DDG. Under §§ 8 to 10 DDG,
          however, I am not obliged as a service provider to monitor third-party
          information that is transmitted or stored, or to investigate
          circumstances that indicate unlawful activity.
        </p>
        <p>
          Obligations to remove or block the use of information under general
          law remain unaffected. Liability in this respect, however, is only
          possible from the point in time at which a specific infringement
          becomes known. As soon as I become aware of such infringements, I will
          remove this content immediately.
        </p>
      </>
    ),
  },
  {
    id: "haftung-links",
    title: "Liability for links",
    body: (
      <>
        <p>
          This website contains links to external third-party websites whose
          content I have no influence over. I therefore cannot accept any
          liability for this third-party content. The respective provider or
          operator of the linked pages is always responsible for their content.
        </p>
        <p>
          The linked pages were checked for possible legal violations at the
          time of linking; no unlawful content was apparent. Permanent
          monitoring of the content of the linked pages is not reasonable
          without concrete indications of an infringement. As soon as I become
          aware of infringements, I will remove such links immediately.
        </p>
      </>
    ),
  },
  {
    id: "urheberrecht",
    title: "Copyright",
    body: (
      <>
        <p>
          The content and works created by me on these pages are subject to
          German copyright law. Reproduction, editing, distribution and any kind
          of exploitation beyond the limits of copyright law require my written
          consent. Downloads and copies of this site are permitted only for
          private, non-commercial use.
        </p>
        <p>
          Insofar as the content on this site was not created by me, the
          copyrights of third parties are respected. In particular, third-party
          content is identified as such. Should you nevertheless become aware of
          a copyright infringement, please let me know. As soon as I become
          aware of infringements, I will remove such content immediately.
        </p>
      </>
    ),
  },
];

export const impressumEn: LegalDoc = {
  metaTitle: "Legal Notice — Luca Arnoldi App Solutions",
  metaDescription:
    "Provider identification under § 5 DDG: provider, contact, VAT and responsibility for the content of this website.",
  title: "LEGAL NOTICE",
  lede: "Information pursuant to § 5 of the German Digital Services Act (Digitale-Dienste-Gesetz, DDG) and § 18(2) of the Interstate Media Treaty (Medienstaatsvertrag, MStV).",
  sections: SECTIONS,
};
