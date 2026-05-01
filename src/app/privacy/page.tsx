import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How WeedZilla collects, uses, and protects your information.",
};

const CONTACT_EMAIL = "daniel@faust.earth";
const EFFECTIVE_DATE = "1 May 2025";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-carbon">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mt-1">Effective {EFFECTIVE_DATE}</p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          WeedZilla is a community platform for Australian bush regenerators to share weed
          identification and removal progress. This policy explains what personal information
          we collect, how we use it, and your rights.
        </p>

        <Section title="What we collect">
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>
              <strong className="text-carbon">Email address</strong> — collected when you
              create an account, used for authentication and essential service emails only.
            </li>
            <li>
              <strong className="text-carbon">Display name</strong> — the public name you
              choose when signing up.
            </li>
            <li>
              <strong className="text-carbon">Profile avatar</strong> — an optional photo
              you may upload to your profile.
            </li>
            <li>
              <strong className="text-carbon">Uploaded images and post content</strong> —
              photos, captions, species tags, and site descriptions you submit to the feed.
            </li>
            <li>
              <strong className="text-carbon">Votes and comments</strong> — your interactions
              with other posts.
            </li>
            <li>
              <strong className="text-carbon">Usage data</strong> — basic post view counts.
              We do not use third-party analytics trackers.
            </li>
          </ul>
        </Section>

        <Section title="Why we collect it">
          <p className="text-sm text-gray-600 leading-relaxed">
            We collect only what is necessary to operate the platform:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mt-2">
            <li>Your email and password are required to create and secure your account.</li>
            <li>Your display name and avatar identify you to other community members.</li>
            <li>
              Images and post content are the core of the platform — sharing weed
              identification and before-and-after restoration photos.
            </li>
            <li>Votes and comments enable community interaction and weekly rankings.</li>
          </ul>
        </Section>

        <Section title="What is publicly visible">
          <p className="text-sm text-gray-600 leading-relaxed">
            WeedZilla is a public community forum. The following content is visible to
            everyone, including visitors who are not logged in:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mt-2">
            <li>All uploaded photos and post content</li>
            <li>Your display name and avatar</li>
            <li>Your comments and vote counts</li>
            <li>Your public profile page</li>
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            Your email address is never displayed publicly.
          </p>
        </Section>

        <Section title="Third-party services">
          <p className="text-sm text-gray-600 leading-relaxed">
            We use the following third-party services to operate WeedZilla:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mt-2">
            <li>
              <strong className="text-carbon">Supabase</strong> — hosts our database,
              authentication, and file storage. Your account data and uploaded images are
              stored on Supabase infrastructure. See{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-eucalypt underline hover:text-eucalypt-dark"
              >
                supabase.com/privacy
              </a>
              .
            </li>
            <li>
              <strong className="text-carbon">Resend</strong> — used to send transactional
              emails (e.g. password reset). We share only your email address with Resend for
              this purpose. See{" "}
              <a
                href="https://resend.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-eucalypt underline hover:text-eucalypt-dark"
              >
                resend.com/privacy
              </a>
              .
            </li>
          </ul>
        </Section>

        <Section title="We do not sell your data">
          <p className="text-sm text-gray-600 leading-relaxed">
            We do not sell, rent, or share your personal information with advertisers or
            other third parties for commercial purposes. Your data is used solely to
            operate the WeedZilla platform.
          </p>
        </Section>

        <Section title="Data retention">
          <p className="text-sm text-gray-600 leading-relaxed">
            Your account and content remain on the platform until you request deletion.
            Posts you delete are removed from public view immediately. If you delete your
            account, your profile and content will be removed from the platform.
          </p>
        </Section>

        <Section title="Your rights and account deletion">
          <p className="text-sm text-gray-600 leading-relaxed">
            You have the right to access, correct, or delete the personal information we
            hold about you. To request account deletion or a copy of your data, email us
            at:
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-block mt-2 text-sm font-medium text-eucalypt hover:text-eucalypt-dark underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            We will action deletion requests within 30 days.
          </p>
        </Section>

        <Section title="Contact">
          <p className="text-sm text-gray-600 leading-relaxed">
            If you have any questions about this privacy policy or how your data is
            handled, please contact us at:
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-block mt-2 text-sm font-medium text-eucalypt hover:text-eucalypt-dark underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
        </Section>

        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          This policy may be updated from time to time. Continued use of WeedZilla after
          changes are posted constitutes acceptance of the revised policy.
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
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-carbon">{title}</h2>
      {children}
    </section>
  );
}
