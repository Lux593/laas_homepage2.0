import { Fill, ProviderAddress } from "@/components/legal/Fill";
import { LegalList, LegalTerm as Term } from "@/components/legal/LegalSection";
import type { LegalSectionData } from "@/components/legal/LegalSection";
import type { LegalDoc } from "@/content/legal";
import { LEGAL } from "@/lib/legal";

const { provider, authority, hosting } = LEGAL;

/**
 * Englische Fassung der Datenschutzerklärung. Höflichkeitsübersetzung:
 * verbindlich ist datenschutz.de.tsx. Kapitel-IDs, Reihenfolge, Querverweise
 * und Fill-Stellen wie dort; DSGVO-Artikel in der englischen Zitierweise
 * (Art. 6 Abs. 1 lit. f → Art. 6(1)(f) GDPR).
 */
const SECTIONS: LegalSectionData[] = [
  {
    id: "verantwortlicher",
    title: "Controller",
    body: (
      <>
        <p>
          The controller responsible for data processing on this website within
          the meaning of Art. 4(7) GDPR is:
        </p>
        <ProviderAddress />
        <p>
          Email: <a href={`mailto:${provider.email}`}>{provider.email}</a>
          <br />
          Phone: <Fill value={provider.phone} label="Phone number" />
        </p>
        <p>
          No data protection officer has been appointed; the statutory
          requirements for a designation under Art. 37 GDPR and § 38 of the
          German Federal Data Protection Act (BDSG) are not met.
        </p>
      </>
    ),
  },
  {
    id: "grundsatz",
    title: "Principle",
    body: (
      <p>
        This website is deliberately built to be lean. It sets no cookies,
        embeds no analytics or advertising services and creates no user
        profiles. Without any action on your part, only the data required for
        the technical delivery of the pages is processed — described under{" "}
        <a href="#hosting">Hosting</a> and{" "}
        <a href="#logfiles">Server log files</a>.
      </p>
    ),
  },
  {
    id: "hosting",
    title: "Hosting",
    body: (
      <>
        <p>
          This website is hosted by an external service provider. The personal
          data collected when the site is accessed is processed on its servers.
        </p>
        <p>
          {hosting.name}, {hosting.address.en}
        </p>
        <p>
          Processing is based on Art. 6(1)(f) GDPR. The legitimate interest lies
          in the secure, stable and efficient provision of this website by a
          professional provider. A data processing agreement pursuant to Art. 28
          GDPR is in place with the host, which ensures that the data is
          processed confidentially and only in accordance with instructions.
        </p>
      </>
    ),
  },
  {
    id: "logfiles",
    title: "Server log files",
    body: (
      <>
        <p>
          When you access this website, the hosting provider automatically
          collects information that your browser transmits and stores it in
          so-called server log files:
        </p>
        <LegalList
          items={[
            "browser type and browser version",
            "operating system used",
            "referrer URL — the previously visited page",
            "host name of the accessing computer",
            "time of the server request",
            "IP address",
          ]}
        />
        <p>
          This data is not merged with other data sources. The legal basis is
          Art. 6(1)(f) GDPR: the operator of a website has a legitimate interest
          in its technically error-free presentation and in fending off attacks
          — and for this, the log files must be recorded.
        </p>
        <p>
          Storage period:{" "}
          <Fill
            value={null}
            label="Ask the host for the log file retention period — 7 to 30 days is typical"
          />
        </p>
      </>
    ),
  },
  {
    id: "kontakt",
    title: "Contact by email",
    body: (
      <>
        <p>
          If you contact me by email, the information you provide, including the
          contact details you give there, will be stored by me for the purpose
          of handling your inquiry and in case of follow-up questions. I will
          not pass on this data without your consent.
        </p>
        <p>
          Processing is based on Art. 6(1)(b) GDPR if your inquiry is related to
          the performance of a contract or is necessary to take pre-contractual
          measures. In all other cases, processing is based on my legitimate
          interest in the effective handling of inquiries addressed to me (Art.
          6(1)(f) GDPR) or on your consent (Art. 6(1)(a) GDPR), if this has been
          requested. You can withdraw any consent you have given at any time
          with effect for the future.
        </p>
        <p>
          The data remains with me until you ask me to delete it, withdraw your
          consent or the purpose for storing it no longer applies — for example,
          once your inquiry has been fully handled. Mandatory statutory
          provisions, in particular retention periods under commercial and tax
          law, remain unaffected.
        </p>
      </>
    ),
  },
  {
    id: "schriftarten",
    title: "Fonts",
    body: (
      <p>
        This website uses the typefaces Instrument Serif and DM Sans. They are
        not loaded from a third-party server on every visit; instead, they are
        downloaded once when the site is built and then served from this
        website’s own server. Visiting this website therefore does not establish
        a connection to Google’s servers, and no data is transmitted there.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and audience measurement",
    body: (
      <p>
        This website does not set any cookies. No web analytics services,
        tracking pixels, advertising networks or embedded third-party content
        that could record your behavior are used. A consent request is therefore
        not required.
      </p>
    ),
  },
  {
    id: "externe-links",
    title: "Linked profiles",
    body: (
      <>
        <p>
          On this website you will find links to my profiles on GitHub, LinkedIn
          and Instagram. These are simple links — content from these providers
          is not embedded, and no data is transferred to them as long as you do
          not click the link.
        </p>
        <p>
          Only when you click do you leave this website. From that moment on,
          the privacy policy of the respective provider applies, and I have no
          influence over its processing. The same applies to all other external
          references on this website, such as those to the tools and clients
          named in the portfolio.
        </p>
      </>
    ),
  },
  {
    id: "rechte",
    title: "Your rights",
    body: (
      <>
        <p>You have the following rights with respect to me:</p>
        <LegalList
          items={[
            <>
              <Term>Access</Term> (Art. 15 GDPR) — which data I process about
              you, for what purpose and for how long.
            </>,
            <>
              <Term>Rectification</Term> (Art. 16 GDPR) — I must correct
              inaccurate data and complete incomplete data.
            </>,
            <>
              <Term>Erasure</Term> (Art. 17 GDPR) — insofar as no statutory
              retention obligation prevents it.
            </>,
            <>
              <Term>Restriction of processing</Term> (Art. 18 GDPR).
            </>,
            <>
              <Term>Data portability</Term> (Art. 20 GDPR) — provision in a
              common, machine-readable format.
            </>,
            <>
              <Term>Withdrawal of consent</Term> (Art. 7(3) GDPR) — at any time
              with effect for the future.
            </>,
          ]}
        />
        <p>
          An informal message to{" "}
          <a href={`mailto:${provider.email}`}>{provider.email}</a> is
          sufficient for any of these requests.
        </p>
      </>
    ),
  },
  {
    id: "widerspruch",
    title: "Right to object under Art. 21 GDPR",
    body: (
      <>
        <p>
          If data is processed on the basis of Art. 6(1)(f) GDPR — that is, on
          the basis of a legitimate interest — you have the right to object to
          this processing at any time on grounds relating to your particular
          situation. This applies in particular to the{" "}
          <a href="#logfiles">server log files</a>.
        </p>
        <p>
          Following an objection, I will no longer process the data concerned
          unless I can demonstrate compelling legitimate grounds that override
          your interests, rights and freedoms, or the processing serves the
          establishment, exercise or defense of legal claims.
        </p>
      </>
    ),
  },
  {
    id: "beschwerde",
    title: "Right to lodge a complaint with the supervisory authority",
    body: (
      <>
        <p>
          Without prejudice to any other remedy, you have the right to lodge a
          complaint with a data protection supervisory authority (Art. 77 GDPR)
          — in particular in the member state of your habitual residence, your
          place of work or the place of the alleged infringement.
        </p>
        <p>
          The supervisory authority responsible for me is the{" "}
          <a href={authority.url} target="_blank" rel="noopener noreferrer">
            {authority.name}
          </a>{" "}
          (State Commissioner for Data Protection and Freedom of Information).
        </p>
      </>
    ),
  },
  {
    id: "verschluesselung",
    title: "Encrypted transmission",
    body: (
      <p>
        For security reasons and to protect the transmission of confidential
        content, this website uses TLS encryption. You can recognize an
        encrypted connection by the browser’s address bar changing from
        “http://” to “https://” and showing a lock icon. When encryption is
        active, the data you transmit to me cannot be read by third parties.
      </p>
    ),
  },
  {
    id: "aenderungen",
    title: "Changes to this policy",
    body: (
      <p>
        This privacy policy is current as of the date stated above. If the
        website changes technically or the legal requirements change, it will be
        updated. The current version is always available here.
      </p>
    ),
  },
];

export const datenschutzEn: LegalDoc = {
  metaTitle: "Privacy Policy — Luca Arnoldi App Solutions",
  metaDescription:
    "Information under Art. 13 GDPR: which data is processed when you visit this website, on what legal basis, and what rights you have.",
  title: "PRIVACY POLICY",
  lede: "Information pursuant to Art. 13 of the General Data Protection Regulation (GDPR): which personal data is processed when you visit this website, for what purpose, on what legal basis — and what rights you have in this regard.",
  sections: SECTIONS,
};
