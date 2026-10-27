import type { Metadata } from "next";
import { LegalDocumentLayout } from "@/components/legal/LegalDocumentLayout";
import { COMPANY_CONTACT } from "@/lib/company-facts";
import { company } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${company.shortName} collects, uses, and protects information on this website.`,
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      subtitle="This policy describes how we handle information when you visit weatherhavenusa.com, request program access, or use authenticated SOF areas."
      updated="May 31, 2026"
    >
      <section>
        <h2 className="text-lg font-medium text-white">Who we are</h2>
        <p className="mt-3">
          This website is operated by {COMPANY_CONTACT.legalName} ({company.shortName}). For privacy inquiries
          contact us through{" "}
          <a href={COMPANY_CONTACT.contactPageUrl} className="text-[#4d9fff] hover:underline">
            Weatherhaven Contact
          </a>{" "}
          or{" "}
          <a href={`tel:${COMPANY_CONTACT.phone.replace(/[^\d+]/g, "")}`} className="text-[#4d9fff] hover:underline">
            {COMPANY_CONTACT.phone}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Information we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-white">Contact and lead forms</strong> — name, email, organization, role,
            program interest, and messages you submit through request-access, contact, or SOF intake forms.
          </li>
          <li>
            <strong className="text-white">Account data</strong> — email address and authentication metadata when you
            sign in to admin or SOF secure areas (managed through Supabase Auth).
          </li>
          <li>
            <strong className="text-white">Usage analytics</strong> — page views, clicks, and session identifiers
            used to improve site performance and understand marketing intent. We do not sell personal information.
          </li>
          <li>
            <strong className="text-white">Technical logs</strong> — IP address, browser type, and timestamps in
            server logs for security, rate limiting, and abuse prevention.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">How we use information</h2>
        <p className="mt-3">We use collected information to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Respond to engineering, program, and access requests</li>
          <li>Provision and manage authorized user accounts</li>
          <li>Send transactional emails (access approvals, confirmations, operator notifications)</li>
          <li>Secure the platform, enforce rate limits, and investigate abuse</li>
          <li>Improve website content and measure aggregate engagement</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Sharing and processors</h2>
        <p className="mt-3">
          We use trusted service providers including hosting (Vercel), database and authentication (Supabase), email
          delivery (Resend), and optional error monitoring (Sentry). These processors handle data only to provide
          services to us under contractual safeguards.
        </p>
        <p className="mt-3">
          We may disclose information when required by law, to protect rights and safety, or in connection with a
          corporate transaction subject to appropriate confidentiality obligations.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Export-controlled and SOF content</h2>
        <p className="mt-3">
          Authenticated SOF areas may display technical descriptions subject to export-control and program-distribution
          rules. Access is limited to approved members. Do not copy, forward, or redistribute restricted content outside
          your authorized program without written approval.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Retention</h2>
        <p className="mt-3">
          Lead and access-request records are retained while relevant to active programs and legal obligations.
          Authentication logs and analytics are retained for operational and security periods consistent with our
          internal policies.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Your choices</h2>
        <p className="mt-3">
          You may request correction or deletion of personal information submitted through forms by contacting our
          program desk. Account holders may sign out at any time; SOF and admin access can be revoked by operators.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Cookies</h2>
        <p className="mt-3">
          We use essential cookies for authentication and CSRF protection, and may use analytics cookies to understand
          site usage. You can control non-essential cookies through your browser settings.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Changes</h2>
        <p className="mt-3">
          We may update this policy periodically. Material changes will be reflected on this page with an updated date.
        </p>
      </section>
    </LegalDocumentLayout>
  );
}
