import type { Metadata } from "next";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { pageMeta } from "@/lib/page-meta";
import { ContactPageSections } from "./ContactPageSections";

export const metadata: Metadata = pageMeta({
  title: "Talk to an expert",
  description:
    "Tell a Weatherhaven expert about your deployment. US office in North Tonawanda, NY; replies usually within 48 hours.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]}
        title="Talk to a Weatherhaven expert"
        lead="Tell us the mission, the climate and the number of people. A specialist will come back with a starting configuration."
      />
      <ContactPageSections />
    </>
  );
}
