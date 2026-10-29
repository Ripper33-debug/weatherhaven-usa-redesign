/**
 * Data for the track record page (/deployments/record): contracts on public record, and every
 * confirmed site from the deployment map.
 *
 * Contracts come only from facts already sourced in procurement.ts and field-stories.ts (government
 * award records and news releases). Programs known only from Weatherhaven's own material (the NATO
 * headquarters, TRECC development, Ukraine, Quellaveco) are left out of this table.
 *
 * Sites come from src/data/confirmed-pins.json (the globe's confirmed list). The data has no year or
 * system per site, so the table doesn't show either.
 */
import confirmed from "@/data/confirmed-pins.json";
import { PROCUREMENT } from "@/lib/procurement";

export type ContractRow = {
  /** Year of award, or "Current" for an ongoing purchasing route. */
  year: string;
  buyer: string;
  what: string;
  /** Award, agreement, order or stock numbers, exactly as on the record. */
  ids: string[];
  sources: { label: string; href: string }[];
  /** Deployment story on /deployments, when there is one. */
  story?: string;
};

const procurementSource = (buyer: string) => {
  const r = PROCUREMENT.record.find((x) => x.buyer === buyer);
  if (!r) throw new Error(`No procurement record for ${buyer}`);
  return r.source;
};

export const PUBLIC_CONTRACTS: ContractRow[] = [
  {
    year: "Current",
    buyer: "Defense Logistics Agency",
    what: "Weatherhaven spares by national stock number, for example the MECC drive crank for winches and leveling jacks (Weatherhaven part 129361)",
    ids: ["NSN 5340-01-486-2219"],
    sources: [procurementSource("Defense Logistics Agency")],
  },
  {
    year: "2021",
    buyer: "US Army, Letterkenny Army Depot",
    what: "Two blanket purchase agreements for Containerized Kitchen parts: MECC wing walls, doors, hinges and spares. Orders include CK MECC wing walls.",
    ids: ["W911N222A0009", "W911N222A0010", "W911N223F0389"],
    sources: [
      { label: "USAspending: BPA W911N222A0009", href: "https://www.usaspending.gov/award/CONT_IDV_W911N222A0009_9700/" },
      {
        label: "USAspending: order W911N223F0389",
        href: "https://www.usaspending.gov/award/CONT_AWD_W911N223F0389_9700_W911N222A0009_9700/",
      },
    ],
    story: "army-containerized-kitchen",
  },
  {
    year: "2020",
    buyer: "New York Air National Guard, 109th Airlift Wing",
    what: "A 14 × 28 ft Polarhaven with an arctic foam floor and eight Polar Chief shelters",
    ids: ["W50S8J20P0023"],
    sources: [procurementSource("New York Air National Guard")],
    story: "109th-airlift-wing",
  },
  {
    year: "2020",
    buyer: "Public Services and Procurement Canada",
    what: "Federal Mobile Health Units of 100 beds each, designed, managed and deployed with SNC-Lavalin PAE",
    ids: [],
    sources: [
      {
        label: "PSPC briefing to the House Standing Committee on Health, June 2021",
        href: "https://www.canada.ca/en/public-services-procurement/corporate/transparency/briefing-materials/standing-committee-health/2021-06-14/other.html",
      },
    ],
    story: "covid-mobile-health-units",
  },
  {
    year: "2017",
    buyer: "Public Services and Procurement Canada",
    what: "Headquarters Shelter System for the Canadian Armed Forces: 1,435 shelter systems, with acquisition and in-service support contracts of about C$168M, taxes included",
    ids: [],
    sources: [
      {
        label: "PSPC news release, February 8, 2017",
        href: "https://www.canada.ca/en/public-services-procurement/news/2017/02/government_of_canadatoacquirenewportablesheltersystems.html",
      },
    ],
    story: "hqss",
  },
];

type ConfirmedPin = { id: string; location: string; program: string; category: string; theaterCode: string };

export type SiteRow = { id: string; country: string; place: string; region: string; type: string };

const REGIONS: Record<string, string> = {
  northcom: "North America",
  southcom: "Latin America and the Caribbean",
  eucom: "Europe",
  africom: "Africa",
  centcom: "Middle East and Central Asia",
  indopacom: "Asia-Pacific",
};

/** Region names in the order the filter lists them. */
export const SITE_REGIONS = [
  "North America",
  "Latin America and the Caribbean",
  "Europe",
  "Africa",
  "Middle East and Central Asia",
  "Asia-Pacific",
  "Antarctica",
] as const;

const TYPES: Record<string, string> = {
  "Defence/Peacekeeping": "Defence and peacekeeping",
  "Medical/Disaster Relief": "Medical and disaster relief",
  "Commercial/Scientific": "Commercial and scientific",
};

export const SITE_TYPES = Object.values(TYPES);

function regionOf(p: ConfirmedPin): string {
  // The map files Antarctic stations under the Indo-Pacific theater; list them on their own.
  if (p.program === "Antarctica" || /antarctica/i.test(p.location)) return "Antarctica";
  return REGIONS[p.theaterCode] ?? "Other";
}

export const FIELDED_SITES: SiteRow[] = (confirmed as ConfirmedPin[])
  .map((p) => ({
    id: p.id,
    country: p.program,
    place: p.location,
    region: regionOf(p),
    type: TYPES[p.category] ?? p.category,
  }))
  .sort(
    (a, b) =>
      SITE_REGIONS.indexOf(a.region as (typeof SITE_REGIONS)[number]) -
        SITE_REGIONS.indexOf(b.region as (typeof SITE_REGIONS)[number]) ||
      a.country.localeCompare(b.country) ||
      a.place.localeCompare(b.place),
  );
