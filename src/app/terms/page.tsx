import type { Metadata } from "next";
import { LegalDocumentLayout } from "@/components/legal/LegalDocumentLayout";
import { COMPANY_CONTACT } from "@/lib/company-facts";
import { company } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms governing use of the ${company.shortName} marketing website and program portals.`,
  alternates: { canonical: "/terms" },
};

export default function TermsOfUsePage() {
  return (
    <LegalDocumentLayout
      title="Terms of Use"
      subtitle="By accessing this website you agree to these terms. If you do not agree, do not use the site."
      updated="May 31, 2026"
    >
      <section>
        <h2 className="text-lg font-medium text-white">Purpose of the site</h2>
        <p className="mt-3">
          This website provides general information about {company.shortName} deployable shelter systems, capabilities,
          and program access pathways. It is intended for authorized government, commercial, and partner audiences.
          Content is informational and does not constitute an offer, contract, or specification unless executed under
          separate written agreement.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Authorized use</h2>
        <p className="mt-3">You agree not to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Attempt unauthorized access to admin, SOF secure, or internal areas</li>
          <li>Probe, scan, or test site vulnerabilities except with our written permission</li>
          <li>Scrape, harvest, or automate submissions in violation of rate limits</li>
          <li>Misrepresent your identity, organization, or program affiliation</li>
          <li>Upload classified, export-controlled, or malicious content through public forms</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">SOF secure area</h2>
        <p className="mt-3">
          Access to SOF-restricted product information requires administrator approval. Credentials are personal and
          must not be shared. Technical data in the secure catalog may be subject to U.S. export-control laws and
          program distribution rules.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Intellectual property</h2>
        <p className="mt-3">
          Text, images, logos, product descriptions, and site design are owned by or licensed to {company.name} and
          protected by applicable intellectual-property laws. You may not reproduce materials for commercial use
          without permission.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Disclaimer</h2>
        <p className="mt-3">
          Site content is provided &quot;as is&quot; without warranties of any kind. Performance figures, imagery, and
          configurations are illustrative and may vary by contract, theater, and engineering release. Reference to
          military organizations or visual style does not imply endorsement.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Limitation of liability</h2>
        <p className="mt-3">
          To the fullest extent permitted by law, {company.name} and its affiliates are not liable for indirect,
          incidental, or consequential damages arising from use of this website.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Governing law</h2>
        <p className="mt-3">
          These terms are governed by the laws applicable to {COMPANY_CONTACT.legalName} operations in the United
          States, without regard to conflict-of-law principles. Disputes shall be resolved in competent courts unless
          otherwise required by applicable procurement regulations for contracted customers.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Contact</h2>
        <p className="mt-3">
          Questions about these terms:{" "}
          <a href={COMPANY_CONTACT.contactPageUrl} className="text-[#4d9fff] hover:underline">
            Contact Weatherhaven
          </a>
          . Ethics and compliance: {COMPANY_CONTACT.ethicsEmail}.
        </p>
      </section>
    </LegalDocumentLayout>
  );
}
