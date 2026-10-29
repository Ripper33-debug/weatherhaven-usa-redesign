/**
 * Who Weatherhaven serves, one page per kind of buyer (/who-we-serve/<slug>).
 *
 * Every fact here comes from content already on the site: the deployment stories and field notes
 * (src/lib/field-stories.ts), the contract record (src/lib/procurement.ts), product content and
 * the confirmed deployment list behind the map (src/data/confirmed-pins.json). Nothing is added
 * that those don't say. A segment with little on record gets a shorter page, not filler.
 */
import confirmed from "@/data/confirmed-pins.json";
import { PROCUREMENT } from "@/lib/procurement";

type Pin = { program: string; category: string };
const PINS = confirmed as Pin[];

/** Confirmed sites on the map, counted only where the list's own fields make the match exact. */
export const SITE_COUNTS = {
  nato: PINS.filter((p) => /\bNATO\b/.test(p.program)).length,
  un: PINS.filter((p) => /\(UN\b/.test(p.program)).length,
  medical: PINS.filter((p) => p.category === "Medical/Disaster Relief").length,
  antarctica: PINS.filter((p) => p.program === "Antarctica").length,
  greenland: PINS.filter((p) => p.program === "Greenland").length,
};

export type BuyerRecord = {
  /** Place, date or buyer line above the title. */
  where: string;
  title: string;
  text: string;
  /** Award, agreement and stock numbers, shown in monospace. */
  ids?: readonly string[];
  /** Anchor of the full story on /deployments. */
  story?: string;
  /** A third-party source, when there is one. */
  source?: { label: string; href: string };
};

export type BuyerSystem = { slug: string; why: string };

export type BuyerSegment = {
  slug: string;
  /** Short name for menus, lists and the breadcrumb. */
  label: string;
  /** One line for the index list. */
  note: string;
  title: string;
  lead: string;
  record: BuyerRecord[];
  /** A sentence on confirmed map sites, when the count is exact. */
  sites?: string;
  systems: BuyerSystem[];
  /** Heading over the systems; says how they relate to this buyer. */
  systemsHeading: string;
  /** A related capability area on /capabilities. */
  capability?: { href: string; label: string };
  /** Special operations: point to the portal instead of a public record. */
  portal?: boolean;
  /** Prefills the contact form's subject line. */
  briefing: string;
};

const [ARMY_BPA, DLA_SPARES, ANG_AWARD] = PROCUREMENT.record;

export const BUYER_SEGMENTS: BuyerSegment[] = [
  {
    slug: "us-army",
    label: "US Army",
    note: "TRECC, developed with DEVCOM, and parts for the Containerized Kitchen",
    title: "US Army programs",
    lead: "Weatherhaven co-developed TRECC with US Army DEVCOM, and the Army buys MECC parts for its Containerized Kitchen under two blanket purchase agreements.",
    record: [
      {
        where: "United States, developed with US Army DEVCOM",
        title: "TRECC, developed with the US Army",
        text: "Co-developed under an Other Transaction Agreement and a Cooperative Research and Development Agreement with DEVCOM. TRECC has passed MIL-STD-810G and safety testing at Aberdeen Test Center, and has been through 43 field trials, including the Army Expeditionary Warrior Experiments in 2022 and 2025, Project Convergence 2024 and Operation Lethal Eagle with the 101st Airborne Division.",
        story: "trecc-us-army",
      },
      {
        where: ARMY_BPA.buyer,
        title: "Containerized Kitchen parts",
        text: `${ARMY_BPA.text} The first MECCs went to US Army Natick Labs in 1994.`,
        ids: ARMY_BPA.ids,
        story: "army-containerized-kitchen",
        source: ARMY_BPA.source,
      },
      {
        where: DLA_SPARES.buyer,
        title: "MECC spares by NSN",
        text: DLA_SPARES.text,
        ids: DLA_SPARES.ids,
        source: DLA_SPARES.source,
      },
    ],
    systemsHeading: "Systems on these programs",
    systems: [
      { slug: "trecc", why: "Co-developed with DEVCOM. Rides a light tactical trailer, an M1289 JLTV trailer or a single 463L pallet." },
      { slug: "mecc", why: "Wing walls, doors and hinges for the Containerized Kitchen, bought since 2021." },
    ],
    briefing: "Briefing request: US Army",
  },
  {
    slug: "air-force",
    label: "Air Force and Air National Guard",
    note: "Polar shelters for the 109th Airlift Wing, and shelters that fly on one pallet",
    title: "Air Force and Air National Guard",
    lead: "The New York Air National Guard's 109th Airlift Wing, which flies ski-equipped LC-130s for polar science, ordered a Polarhaven and eight Polar Chief shelters in 2020. For airlift, ATEPS and TRECC-P each pack onto a single 463L pallet.",
    record: [
      {
        where: `${ANG_AWARD.buyer}, Stratton Air National Guard Base, 2020`,
        title: ANG_AWARD.title,
        text: ANG_AWARD.text,
        ids: ANG_AWARD.ids,
        story: "109th-airlift-wing",
        source: ANG_AWARD.source,
      },
    ],
    systemsHeading: "Systems for air units",
    systems: [
      { slug: "polarhaven", why: "A 14 × 28 ft unit with an arctic foam floor went to the 109th Airlift Wing." },
      { slug: "polar-chief", why: "Eight went to the 109th. Stays comfortable inside at −50 °C." },
      { slug: "ateps", why: "A hard-wall shelter on one 463L pallet that fits aircraft with more than 92 in of clearance." },
      { slug: "ehmecc", why: "Air-mobile on the C-130, C-17, C-5 and A400M, or underslung by helicopter." },
      { slug: "mex-26", why: "A 26-ft clear span for maintenance that packs onto one 463L pallet." },
    ],
    capability: { href: "/capabilities#aviation", label: "Aviation support" },
    briefing: "Briefing request: Air Force / Air National Guard",
  },
  {
    slug: "special-operations",
    label: "Special operations",
    note: "Small, air-mobile systems, with program detail in the SOF portal",
    title: "Special operations",
    lead: "Program detail, planning tools and restricted data for special operations programs are in a separate portal. Access is by request.",
    record: [],
    portal: true,
    systemsHeading: "Systems sized for small teams and airlift",
    systems: [
      { slug: "trecc", why: "Under 60 in tall stowed, for CH-47 airlift. Two people expand it in under three minutes." },
      { slug: "ateps", why: "A hard-wall shelter on one 463L pallet, expanded by two people in under ten minutes." },
      { slug: "bmecc", why: "From a 10-ft ISO container; two units couple to ship as one 20-ft module." },
      { slug: "endurance", why: "One person sets it up in about five minutes." },
    ],
    briefing: "Briefing request: special operations",
  },
  {
    slug: "nato-allies",
    label: "NATO, UN and allied forces",
    note: "A deployable NATO headquarters, UN mission sites and shelters for Ukraine",
    title: "NATO, UN and allied forces",
    lead: "Weatherhaven built a deployable NATO headquarters from EHMECC, MECC and TRECC systems, delivered 110 RDMSS military shelters to Ukraine, and has shelters at confirmed sites on NATO and UN missions.",
    record: [
      {
        where: "NATO",
        title: "A NATO headquarters that works within an hour of arriving",
        text: "EHMECC, MECC and TRECC systems combined into a deployable headquarters that had to ship overseas at 24 hours' notice and be operational within an hour of arriving. Its sixteen workstations are networked through floor boxes carrying fibre and ethernet.",
        story: "nato-headquarters",
      },
      {
        where: "Ukraine",
        title: "110 RDMSS military shelters",
        text: "55 two-module and 55 four-module RDMSS shelters, delivered in ten weeks on two 747 cargo flights.",
      },
    ],
    sites: `${SITE_COUNTS.nato} confirmed sites on the deployment map are on NATO missions and ${SITE_COUNTS.un} are on UN missions.`,
    systemsHeading: "Systems in this work",
    systems: [
      { slug: "ehmecc", why: "Part of the NATO headquarters; 420 ft² with a 12-ft interior height." },
      { slug: "mecc", why: "Part of the NATO headquarters; 420 ft² from one 20-ft ISO container." },
      { slug: "trecc", why: "Part of the NATO headquarters; expands in under three minutes." },
      { slug: "rdmss", why: "The 110 military shelters for Ukraine, in two- and four-module sets." },
    ],
    capability: { href: "/capabilities#c2", label: "Command and control" },
    briefing: "Briefing request: NATO / allied forces",
  },
  {
    slug: "canada",
    label: "Canadian Armed Forces",
    note: "The Headquarters Shelter System: 1,435 shelter systems",
    title: "Canadian Armed Forces",
    lead: "Weatherhaven is headquartered in Burnaby, British Columbia. Its largest program is the Canadian Armed Forces' Headquarters Shelter System, and its first Canadian military contract, in 1984, was for the MEX-26.",
    record: [
      {
        where: "Canada, awarded 2017",
        title: "1,435 headquarters shelters",
        text: "Canada awarded the Headquarters Shelter System in January 2017: 1,435 shelter systems with options for 338 more, replacing up to 80% of National Defence's Tent Expandable Modular System structures. The acquisition and in-service support contracts total about C$168M, taxes included. Deliveries began in 2019 and the program is in in-service support, with support options to 2042.",
        story: "hqss",
        source: {
          label: "Public Services and Procurement Canada news release, February 8, 2017",
          href: "https://www.canada.ca/en/public-services-procurement/news/2017/02/government_of_canadatoacquirenewportablesheltersystems.html",
        },
      },
      {
        where: "Canada, 1984",
        title: "The first Canadian military contract",
        text: "MEX-26 was the subject of Weatherhaven's first Canadian military contract, in 1984.",
      },
    ],
    systemsHeading: "Systems on these programs",
    systems: [
      { slug: "rdmss", why: "The system behind HQSS, from one to four modules and 245 to 995 ft² of floor." },
      { slug: "mex-26", why: "A 26-ft clear span for vehicle maintenance; Weatherhaven's first Canadian military contract." },
    ],
    capability: { href: "/capabilities#c2", label: "Command and control" },
    briefing: "Briefing request: Canadian Armed Forces",
  },
  {
    slug: "emergency-medical",
    label: "Emergency management and medical",
    note: "100-bed field hospitals for COVID-19",
    title: "Emergency management and medical",
    lead: "Field hospitals, clinics and emergency shelter. In 2021 Canada deployed two 100-bed Mobile Health Units, designed and deployed by Weatherhaven with SNC-Lavalin PAE, to hospitals in Toronto and Hamilton.",
    record: [
      {
        where: "Ontario, Canada, 2020–2021",
        title: "100-bed field hospitals for COVID-19",
        text: "In April 2020 Public Services and Procurement Canada contracted Weatherhaven and SNC-Lavalin PAE to design, manage and deploy federal Mobile Health Units of 100 beds each. Each unit has two 10-bed intensive care units, eight 10-bed wards and two 600-litre-per-minute oxygen plants, in shelters derived from the Headquarters Shelter System.",
        story: "covid-mobile-health-units",
        source: {
          label: "Public Safety Canada news release, January 22, 2021",
          href: "https://www.canada.ca/en/public-safety-canada/news/2021/01/government-of-canada-provides-mobile-health-units-to-assist-ontario-with-covid-19-response.html",
        },
      },
    ],
    sites: `${SITE_COUNTS.medical} confirmed sites on the deployment map are medical or disaster-relief deployments.`,
    systemsHeading: "Systems for medical and relief work",
    systems: [
      { slug: "rdmss", why: "The Mobile Health Units' shelters are derived from it." },
      { slug: "mts", why: "Standard modules link into field hospitals, with treatment and support space." },
      { slug: "airbeam-lp", why: "Inflatable shelters with clear interiors for treatment and triage, up in 5 to 10 minutes." },
      { slug: "bmecc", why: "A 10-ft expandable container for smaller medical and workspace roles." },
    ],
    capability: { href: "/capabilities#medical", label: "Medical configuration" },
    briefing: "Briefing request: emergency management / medical",
  },
  {
    slug: "polar-research",
    label: "Polar and scientific research",
    note: "Ice-core drilling at 3,200 m and Antarctic camps since 1988",
    title: "Polar and scientific research",
    lead: "Polarhaven has been in Antarctica since 1988. Weatherhaven shelters house ice-core drilling, under-ice robotics and field camps for research programs in Antarctica and the Arctic.",
    record: [
      {
        where: "Little Dome C, Antarctica, 2021–2025",
        title: "Drilling for million-year-old ice at 3,200 m",
        text: "Beyond EPICA, a project of twelve institutions from ten nations, drilled 2,800 m to bedrock inside a Series 4 shelter on a 30-ft truss frame, with a slot in the roof for the drill mast. The crew lives in insulated Series 4 shelters.",
        story: "beyond-epica",
        source: {
          label: "Institut polaire français: Beyond EPICA reaches bedrock (press release, January 2025)",
          href: "https://institut-polaire.fr/wp-content/uploads/2025/01/PR_Antarctica_Beyond_Epica_bedrock_4th-drilling-campaign_eng_final_2025.pdf",
        },
      },
      {
        where: "West Lake Bonney, Antarctica, 2008–2009",
        title: "A bot house on the ice for NASA-funded robotics",
        text: "The ENDURANCE team's “Bot House” on the lake ice was a Polarhaven: a 16-ft-tall frame of 17 arches raised around an autonomous underwater vehicle.",
        story: "nasa-endurance",
        source: { label: "NASA Astrobiology: ENDURANCE 2009 expedition", href: "https://astrobiology.nasa.gov/news/check-type-endurance-2009-expedition-on-the-way-to-the-ice/" },
      },
      {
        where: "Mount Brown South, Antarctica",
        title: "An ice-core drill camp",
        text: "The Australian Antarctic Division's ice-core camp ran its drill under a Weatherhaven tent.",
        source: { label: "Australian Antarctic Division", href: "https://www.antarctica.gov.au/antarctic-operations/field-operations/tents-shelters-and-huts/" },
      },
      {
        where: "Tanquary Fiord, Nunavut",
        title: "Park lodging in the high Arctic",
        text: "Parks Canada's lodging in Quttinirpaaq National Park is a Weatherhaven unit: an insulated tent with a solid floor, interior walls and four double bedrooms.",
        source: { label: "Parks Canada", href: "https://parks.canada.ca/pn-np/nu/quttinirpaaq/visit/services" },
      },
    ],
    sites: `${SITE_COUNTS.antarctica} confirmed sites on the deployment map are in Antarctica and ${SITE_COUNTS.greenland} are in Greenland.`,
    systemsHeading: "Systems for polar work",
    systems: [
      { slug: "polarhaven", why: "Modular insulated shelters for long-term base camps." },
      { slug: "polar-chief", why: "An insulated octagonal kitchen, lab or office, comfortable at −50 °C." },
      { slug: "endurance", why: "One person sets it up in about five minutes." },
      { slug: "series-4", why: "The Beyond EPICA drill shelter and crew quarters." },
    ],
    briefing: "Briefing request: polar / research",
  },
  {
    slug: "industrial-camps",
    label: "Remote industrial camps",
    note: "A 912-person camp above 4,500 m in Peru",
    title: "Remote industrial and workforce camps",
    lead: "Workforce camps planned from needs assessment to installation, then taken down, refurbished and stored for the next job.",
    record: [
      {
        where: "Quellaveco, Peru",
        title: "A 912-person camp above 4,500 m",
        text: "A turnkey camp of Series 4 shelters for Anglo American's copper project.",
      },
    ],
    systemsHeading: "Systems for workforce camps",
    systems: [
      { slug: "series-4", why: "The Quellaveco camp's shelters; 8 to 30 ft wide and any length." },
      { slug: "hercon", why: "Hard-wall housing, kitchens, offices and clinics that open to up to six times their shipping footprint." },
      { slug: "mts", why: "Standard modules joined into kitchens and accommodation." },
    ],
    capability: { href: "/capabilities#camp", label: "Camp integration" },
    briefing: "Briefing request: workforce camp",
  },
];

export function buyerSegment(slug: string): BuyerSegment | undefined {
  return BUYER_SEGMENTS.find((s) => s.slug === slug);
}

export const buyerHref = (slug: string) => `/who-we-serve/${slug}`;

export function briefingHref(segment: BuyerSegment): string {
  return `/contact?inquiry=Capability%20Briefing&subject=${encodeURIComponent(segment.briefing)}`;
}
