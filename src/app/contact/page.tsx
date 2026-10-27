import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { ContactPageSections } from "./ContactPageSections";

export const metadata: Metadata = {
  title: "Contact — Weatherhaven USA",
  description: "Talk to a Weatherhaven Expert about deployable shelter and camp requirements.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#080a0c] text-white">
      <PageHero
        label="Contact"
        title="Talk to a Weatherhaven Expert."
        description="Share your requirement and a member of our team will respond within 48 hours."
      />
      <ContactPageSections />
    </div>
  );
}
