import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Child Safety Policy",
  description: "WeedZilla's policy on child sexual abuse and exploitation (CSAE).",
};

const LAST_UPDATED = "2 May 2026";
const CONTACT_EMAIL = "daniel@faust.earth";

export default function CsaePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 space-y-8">

        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-carbon">
            Child Safety Policy
          </h1>
          <p className="text-sm text-gray-400">
            WeedZilla &mdash; Last updated {LAST_UPDATED}
          </p>
        </div>

        <Section title="Our commitment">
          <p>
            WeedZilla has a zero-tolerance policy toward child sexual abuse and
            exploitation (CSAE) in any form. Child sexual abuse material (CSAM)
            and any content that sexualises, exploits, or endangers minors is
            strictly prohibited on this platform.
          </p>
          <p>
            This prohibition applies to all content submitted to WeedZilla,
            including photographs, videos, captions, comments, and any other
            user-generated material.
          </p>
        </Section>

        <Section title="Prohibited content">
          <p>The following content is expressly prohibited:</p>
          <ul>
            <li>
              Child sexual abuse material (CSAM) of any kind, including
              generated or AI-produced imagery
            </li>
            <li>
              Content that sexually exploits, grooms, or endangers a child
            </li>
            <li>
              Any material that depicts or facilitates the sexual abuse or
              exploitation of minors
            </li>
          </ul>
          <p>
            Accounts found to have submitted prohibited content will be
            immediately and permanently banned.
          </p>
        </Section>

        <Section title="Reporting content">
          <p>
            Any user can report content directly within the app using the report
            button available on every post and comment. Reports are reviewed by
            platform administrators and actioned promptly.
          </p>
          <p>
            Content confirmed to be in violation of this policy is removed from
            the platform. Where content constitutes or may constitute CSAM, it
            will be reported to the relevant authorities (see below) in addition
            to being removed.
          </p>
        </Section>

        <Section title="Reporting to authorities">
          <p>
            WeedZilla is operated from Australia. Any content identified as
            CSAM, or content reasonably suspected to be CSAM, will be reported
            to:
          </p>
          <ul>
            <li>
              <strong>Australian Federal Police (AFP)</strong> &mdash;{" "}
              <a
                href="https://www.afp.gov.au/crimes/child-protection"
                target="_blank"
                rel="noopener noreferrer"
                className="text-eucalypt underline hover:text-eucalypt-dark"
              >
                afp.gov.au
              </a>
            </li>
            <li>
              <strong>
                Australian Centre to Counter Child Exploitation (ACCCE)
              </strong>{" "}
              &mdash;{" "}
              <a
                href="https://www.accce.gov.au/report"
                target="_blank"
                rel="noopener noreferrer"
                className="text-eucalypt underline hover:text-eucalypt-dark"
              >
                accce.gov.au/report
              </a>
            </li>
          </ul>
          <p>
            We cooperate fully with law enforcement investigations relating to
            child safety.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            To report a child safety concern directly, or if you believe CSAM
            has been submitted to WeedZilla, please contact us immediately at:
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-block mt-1 font-medium text-eucalypt hover:text-eucalypt-dark underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-3">
            Reports submitted by email are treated with the highest priority and
            are reviewed as a matter of urgency.
          </p>
        </Section>

        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          This policy is reviewed periodically and updated as required to
          reflect changes in legislation, platform features, or best practice
          guidance.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-carbon">{title}</h2>
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1.5 [&_strong]:text-carbon">
        {children}
      </div>
    </section>
  );
}
