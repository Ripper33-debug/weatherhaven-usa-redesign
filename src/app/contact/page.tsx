import type { Metadata } from "next";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { pageMeta } from "@/lib/page-meta";
import { ContactPageSections } from "./ContactPageSections";

export const metadata: Metadata = pageMeta({
  title: "Talk to an expert",
  description:
    "Request a capability briefing, a demo or a factory tour, or tell a Weatherhaven expert about your deployment. US office in North Tonawanda, NY.",
  path: "/contact",
});

/** Heading and lead for the request types that links ask for by name (?inquiry=…). */
const HEADERS: Record<string, { title: string; lead: string }> = {
  "Capability Briefing": {
    title: "Request a briefing",
    lead: "A capability briefing for your program, in person or online. Tell us the mission, who should attend and when suits you.",
  },
  "Demo Request": {
    title: "Request a demo",
    lead: "Ask to see a system set up. Tell us which systems interest you, and where and when suits your team.",
  },
  "Factory Tour": {
    title: "Request a factory tour",
    lead: "Visit Weatherhaven to see systems built and tested. Tell us who is coming and when.",
  },
};

const DEFAULT_HEADER = {
  title: "Talk to a Weatherhaven expert",
  lead: "Tell us the mission, the climate and the number of people. A specialist will come back with a starting configuration.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { inquiry } = await searchParams;
  const header = (typeof inquiry === "string" && HEADERS[inquiry.trim()]) || DEFAULT_HEADER;
  return (
    <>
      <V2PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]} title={header.title} lead={header.lead} />
      <ContactPageSections />
    </>
  );
}
