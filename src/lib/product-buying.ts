import { PROCUREMENT } from "@/lib/procurement";
import { COMPANY_CONTACT } from "@/lib/company-facts";
import { DEPLOYMENT_STORIES } from "@/lib/field-stories";

/**
 * "How to buy" on each product page: only purchases and contract vehicles that are on public
 * record for that product (USAspending, DLA, PSPC). Products with nothing on record get the plain
 * route through the US company instead. Numbers and sources come from src/lib/procurement.ts and
 * src/lib/field-stories.ts, looked up by contract number so a wording change there can't break it.
 */
export type BuyingRecord = {
  buyer: string;
  text: string;
  /** Contract, order or stock numbers, shown as codes. */
  ids: string[];
  source?: { label: string; href: string };
};

function recordSource(id: string): BuyingRecord["source"] {
  const r = PROCUREMENT.record.find((x) => (x.ids as readonly string[]).includes(id));
  return r && r.source.href.startsWith("http") ? { label: r.source.label, href: r.source.href } : undefined;
}

function storySource(storyId: string, index = 0): BuyingRecord["source"] {
  const s = DEPLOYMENT_STORIES.find((x) => x.id === storyId)?.sources[index];
  return s ? { label: s.label, href: s.href } : undefined;
}

const ANG_POLAR: BuyingRecord = {
  buyer: "New York Air National Guard, 109th Airlift Wing",
  text: "Award for a 14 × 28 ft Polarhaven with an arctic foam floor and eight Polar Chief shelters, August 2020.",
  ids: ["W50S8J20P0023"],
  source: recordSource("W50S8J20P0023"),
};

const BUYING: Record<string, BuyingRecord[]> = {
  mecc: [
    {
      buyer: "US Army, Letterkenny Army Depot",
      text: "Containerized Kitchen parts, including MECC wing walls, under two blanket purchase agreements since November 2021.",
      ids: ["W911N222A0009", "W911N222A0010"],
      source: recordSource("W911N222A0009"),
    },
    {
      buyer: "Defense Logistics Agency",
      text: "MECC spare parts carry national stock numbers, for example the drive crank for the winches and leveling jacks (Weatherhaven part 129361).",
      ids: ["NSN 5340-01-486-2219"],
      source: recordSource("NSN 5340-01-486-2219"),
    },
  ],
  polarhaven: [ANG_POLAR],
  "polar-chief": [ANG_POLAR],
  rdmss: [
    {
      buyer: "Canadian Armed Forces",
      text: "The Headquarters Shelter System contract with Public Services and Procurement Canada is built on RDMSS.",
      ids: [],
      source: storySource("hqss", 0),
    },
  ],
};

export function buyingRecordsFor(slug: string): BuyingRecord[] {
  return BUYING[slug] ?? [];
}

export function specSheetPath(slug: string): string {
  return `/configurable-solutions/${slug}/spec-sheet`;
}

/**
 * A mailto: link a program office can forward to its contracting office. No recipient is filled
 * in; the body carries the key specs, the identifiers and a link to the printable sheet.
 */
export function specMailto(
  p: { slug: string; name: string; fullName?: string; description: string; specs: { label: string; value: string }[] },
  origin: string,
): string {
  const title = p.fullName ? `${p.name} (${p.fullName})` : p.name;
  const lines = [
    title,
    p.description,
    "",
    ...(p.specs.length ? ["Key specifications", ...p.specs.slice(0, 8).map((s) => `- ${s.label}: ${s.value}`), ""] : []),
    `Printable spec sheet: ${origin.replace(/\/$/, "")}${specSheetPath(p.slug)}`,
    "",
    `Supplier: ${PROCUREMENT.legalName}`,
    `CAGE ${PROCUREMENT.cage}, UEI ${PROCUREMENT.uei}`,
    COMPANY_CONTACT.headquartersAddress.replace(", United States", ""),
    COMPANY_CONTACT.phone,
  ];
  const subject = `${p.name} specifications from Weatherhaven`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\r\n"))}`;
}
