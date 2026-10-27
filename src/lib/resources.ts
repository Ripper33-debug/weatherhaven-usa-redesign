import { COMPANY_CONTACT } from "@/lib/company-facts";

export type ResourceDocType = "Capabilities Brief" | "Spec Sheet" | "Technical Drawing" | "Field Report";
export type ResourceClassification = "Unclassified" | "CUI";

export type ResourceDocument = {
  id: string;
  title: string;
  system: string;
  docType: ResourceDocType;
  classification: ResourceClassification;
  format: string;
  size: string;
  href: string;
};

/** Public resources linked from weatherhaven.com (link audit: all URLs HTTP 200 as of 2026-06). */
export const RESOURCE_DOCUMENTS: ResourceDocument[] = [
  {
    id: "iso",
    title: "ISO 9001:2015 Certificate — Burnaby and Brockville",
    system: "Quality",
    docType: "Capabilities Brief",
    classification: "Unclassified",
    format: "PDF",
    size: "—",
    href: COMPANY_CONTACT.isoCertificateUrl,
  },
  {
    id: "about",
    title: "About Weatherhaven",
    system: "Corporate",
    docType: "Capabilities Brief",
    classification: "Unclassified",
    format: "Web",
    size: "—",
    href: "https://www.weatherhaven.com/AboutUs",
  },
  {
    id: "military",
    title: "Military Shelter Solutions",
    system: "Military",
    docType: "Capabilities Brief",
    classification: "Unclassified",
    format: "Web",
    size: "—",
    href: "https://www.weatherhaven.com/military",
  },
  {
    id: "medical",
    title: "Medical Shelter Solutions",
    system: "Medical",
    docType: "Capabilities Brief",
    classification: "Unclassified",
    format: "Web",
    size: "—",
    href: "https://www.weatherhaven.com/medical",
  },
  {
    id: "commercial",
    title: "Commercial & Workforce Camps",
    system: "Commercial",
    docType: "Capabilities Brief",
    classification: "Unclassified",
    format: "Web",
    size: "—",
    href: "https://www.weatherhaven.com/commercial",
  },
  {
    id: "company",
    title: "Company & Global Offices",
    system: "Corporate",
    docType: "Field Report",
    classification: "Unclassified",
    format: "Web",
    size: "—",
    href: "https://www.weatherhaven.com/company",
  },
  {
    id: "contact",
    title: "Contact Weatherhaven — Regional Offices",
    system: "Corporate",
    docType: "Spec Sheet",
    classification: "Unclassified",
    format: "Web",
    size: "—",
    href: COMPANY_CONTACT.contactPageUrl,
  },
  {
    id: "secure-contact",
    title: "Program Inquiries (Secure Contact Form)",
    system: "Platform",
    docType: "Capabilities Brief",
    classification: "Unclassified",
    format: "Web",
    size: "—",
    href: COMPANY_CONTACT.secureContactUrl,
  },
];

export const RESOURCE_DOC_TYPES = ["All", "Capabilities Brief", "Spec Sheet", "Technical Drawing", "Field Report"] as const;
export const RESOURCE_CLASSIFICATIONS = ["All", "Unclassified", "CUI"] as const;
