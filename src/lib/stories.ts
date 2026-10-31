/**
 * Flagship program stories (/stories/<slug>): three programs told in depth.
 *
 * Every fact here is already on the site, with the same sources: src/lib/field-stories.ts,
 * product-content.ts, buyer-segments.ts, news-releases.ts and the homepage timeline. Claims known
 * only from Weatherhaven's own material keep that label (`own: true` on the source, and the story's
 * `note`). Photos are captioned with what they show; where there is no field photograph (HQSS), the
 * story opens on the system's 3D model and says so.
 *
 * Shape (the CMS mirrors it field for field):
 * - slug, title, dek, place, when?
 * - systems: product slugs (src/lib/products.ts)
 * - hero: { src, alt, caption, model? } (model = a slug from SYSTEM_MODELS: the page shows the 3D
 *   viewer, with src as its still)
 * - numbers: { value, label }[] (two to four)
 * - timeline: { date, text }[] (oldest first)
 * - sections: { heading, paragraphs[] }[]
 * - photos: { src, alt, caption }[] (the photo set; hidden when empty)
 * - quote?: { text, name, role? } (hidden when absent)
 * - note?: where claims without a public source come from
 * - sources: { label, href, own? }[] (own = Weatherhaven's own material)
 * - deploymentStoryId?: the matching story's anchor on /deployments
 */
import { cmsStories } from "@/sanity/content";

export type StoryImage = { src: string; alt: string; caption: string };

export type FlagshipStory = {
  slug: string;
  title: string;
  /** One or two sentences under the title, also used on the index and as the meta description. */
  dek: string;
  place: string;
  when?: string;
  /** Product slugs, in the order they're linked. */
  systems: string[];
  hero: StoryImage & { model?: string };
  numbers: { value: string; label: string }[];
  timeline: { date: string; text: string }[];
  sections: { heading: string; paragraphs: string[] }[];
  photos: StoryImage[];
  quote?: { text: string; name: string; role?: string };
  note?: string;
  sources: { label: string; href: string; own?: boolean }[];
  deploymentStoryId?: string;
};

const CAPABILITIES_STATEMENT_PDF = "https://usubc.org/wp-content/uploads/2026/08/Weatherhaven-2026-Capabilities-Statement-1.pdf";

export const FLAGSHIP_STORIES: FlagshipStory[] = [
  {
    slug: "trecc-us-army",
    deploymentStoryId: "trecc-us-army",
    title: "TRECC, developed with the US Army",
    dek: "An all-aluminum shelter that rides on a trailer, a vehicle or a 463L pallet and expands into a command post in under three minutes. Co-developed with US Army DEVCOM and tested to MIL-STD-810G.",
    place: "United States",
    when: "developed with US Army DEVCOM",
    systems: ["trecc"],
    hero: {
      src: "/products/trecc/gallery/08-TRECC-and-Car.jpg",
      alt: "A stowed TRECC on its trailer behind a JLTV on frosty ground, mountains behind",
      caption: "A stowed TRECC on its trailer, behind a JLTV.",
    },
    numbers: [
      { value: "Under 3 min", label: "To expand, with two people" },
      { value: "43", label: "Field trials completed" },
      { value: "TRL 9", label: "Technology readiness of TRECC-T" },
      { value: "−40 to +120 °F", label: "Rated temperature range" },
    ],
    timeline: [
      { date: "2022", text: "Army Expeditionary Warrior Experiment 2022." },
      { date: "2024", text: "Project Convergence 2024." },
      { date: "2025", text: "Army Expeditionary Warrior Experiment 2025." },
      { date: "March 2026", text: "TRECC sanitation units announced: off-grid sanitation and kitchen units a JLTV can tow." },
      { date: "September 2026", text: "Shown at DVD 2026, at UTAC Millbrook in the UK, with two new MECC modules." },
      { date: "September 2026", text: "At Land Forces 2026 in Perth, Weatherhaven and Supacat announce a partnership pairing TRECC-T with Supacat high-mobility vehicles." },
      { date: "October 2026", text: "Presented at the Battlefield 2027 defense innovation showcase in Washington, D.C." },
      { date: "2027", text: "TRECC-T field trials with Supacat vehicles planned." },
    ],
    sections: [
      {
        heading: "Built with the Army",
        paragraphs: [
          "TRECC was co-developed with the US Army under an Other Transaction Agreement and a Cooperative Research and Development Agreement with DEVCOM. It has passed MIL-STD-810G environmental testing and safety testing at Aberdeen Test Center, and TRECC-T is at technology readiness level 9.",
        ],
      },
      {
        heading: "Tested where it will be used",
        paragraphs: [
          "It has been through the Army Expeditionary Warrior Experiments in 2022 and 2025, Project Convergence 2024 and Operation Lethal Eagle with the 101st Airborne Division: 43 field trials in all.",
        ],
      },
      {
        heading: "Three ways to move it",
        paragraphs: [
          "TRECC-T rides on a light tactical trailer, stowed at 114 × 94.5 × 57 in. TRECC-M goes on an M1289 JLTV trailer at 89 × 84 × 57 in, and TRECC-P on a single 463L pallet at 104 × 84 × 60 in. Under 60 in stowed, it can be airlifted by a CH-47.",
        ],
      },
      {
        heading: "Command post, workshop, clinic or sanitation unit",
        paragraphs: [
          "Two people expand it in under three minutes on 24 VDC electric actuators, with a manual backup. It is rated from −40 °F to +120 °F, in 55 mph sustained winds and 75 mph gusts.",
          "The sanitation version runs off-grid on solar and 24 VDC power and sets up in under 15 minutes. Two built to work with JLTVs have gone to a US customer.",
        ],
      },
    ],
    photos: [
      {
        src: "/products/trecc/gallery/04-TRECC-1.jpg",
        alt: "A stowed TRECC on its trailer beside a deployed one with its steps down",
        caption: "Stowed and deployed, side by side.",
      },
      {
        src: "/products/trecc/gallery/12-TRECC-T_interior_white_light_03.jpg",
        alt: "Inside a TRECC-T: white walls, two black desks and folding chairs",
        caption: "A TRECC-T set up with desks.",
      },
      {
        src: "/products/trecc/gallery/06-TRECC-3.jpg",
        alt: "Two TRECCs in a forest clearing with an armoured vehicle behind them",
        caption: "Two TRECCs in the field, one expanded.",
      },
      {
        src: "/products/trecc/gallery/03-Multiple-TRECC.jpg",
        alt: "A row of stowed TRECCs on trailers inside a hall",
        caption: "TRECCs on their trailers before delivery.",
      },
    ],
    note: "Weatherhaven publishes TRECC's development and trial record in its 2026 capabilities statement; the test reports themselves aren't public.",
    sources: [
      { label: "Weatherhaven 2026 capabilities statement (PDF)", href: CAPABILITIES_STATEMENT_PDF, own: true },
      {
        label: "Weatherhaven: TRECC trailer-mounted sanitation systems",
        href: "https://weatherhaven.com/Article?name=TRECC%20Trailer-Mounted%20Sanitation%20Systems%20",
        own: true,
      },
      {
        label: "Weatherhaven: next-generation MECC modules and TRECC at DVD 2026",
        href: "https://weatherhaven.com/Article?name=Weatherhaven%20DVD%202026",
        own: true,
      },
      {
        label: "Weatherhaven and Supacat partner to advance redeployable infrastructure",
        href: "https://weatherhaven.com/Article?name=Weatherhaven%20and%20Supacat%20Partnership",
        own: true,
      },
      {
        label: "Weatherhaven: TRECC at the Battlefield 2027 showcase",
        href: "https://weatherhaven.com/Article?name=Weatherhaven%20Battlefield",
        own: true,
      },
    ],
  },
  {
    slug: "canada-hqss",
    deploymentStoryId: "hqss",
    title: "1,435 headquarters shelters for the Canadian Armed Forces",
    dek: "Canada's Headquarters Shelter System gives each command post its operations area, planning area, offices and utility space, on Weatherhaven's RDMSS. Awarded in 2017, now in service with support options to 2042.",
    place: "Canada",
    when: "since 2017",
    systems: ["rdmss"],
    hero: {
      model: "rdmss",
      src: "/models/rdmss/rdmss-poster-deployed.jpg",
      alt: "3D model of a deployed RDMSS soft-wall shelter",
      caption:
        "The RDMSS, the shelter behind HQSS. “Show inside” opens a command post. There are no field photographs of HQSS on this site yet.",
    },
    numbers: [
      { value: "1,435", label: "Headquarters shelters for the Canadian Armed Forces" },
      { value: "C$168M", label: "Acquisition and in-service support contracts, taxes included" },
      { value: "C$350M", label: "Potential value if every option is exercised" },
      { value: "2042", label: "Support options run to" },
    ],
    timeline: [
      { date: "January 2017", text: "Canada awards Weatherhaven the Headquarters Shelter System, with options for 338 more shelter systems." },
      { date: "2019", text: "Deliveries begin." },
      {
        date: "April 2020",
        text: "Canada contracts Weatherhaven and SNC-Lavalin PAE to design, manage and deploy 100-bed Mobile Health Units, in shelters derived from HQSS.",
      },
      { date: "April 5, 2021", text: "The first unit is handed over to Sunnybrook Health Sciences Centre in Toronto; the second goes to Hamilton Health Sciences." },
      { date: "Today", text: "In-service support, with support options to 2042." },
    ],
    sections: [
      {
        heading: "What Canada bought",
        paragraphs: [
          "The shelters replace up to 80% of National Defence's Tent Expandable Modular System structures. The project also covers up to 467 connector hubs, 442 vehicle boots, 8,500 tactical lighting kits and 100,000 m² of semi-rigid flooring.",
        ],
      },
      {
        heading: "A command post that packs into bags",
        paragraphs: [
          "Each set is built on the RDMSS, which scales from one module of 245 ft² to four modules of 995 ft². Three people put up a four-module building in under 20 minutes, and one or two modules in under ten. It is rated from −51 °C to +49 °C with a 20 lb/ft² snow load, and up to ten interconnection points join buildings into larger headquarters.",
        ],
      },
      {
        heading: "From command posts to hospital wards",
        paragraphs: [
          "In 2020, shelters derived from HQSS became Canada's federal Mobile Health Units. Each 100-bed unit has two 10-bed intensive care units, eight 10-bed wards and two 600-litre-per-minute oxygen plants. Canada sent two to Ontario in 2021, to Sunnybrook in Toronto and to Hamilton Health Sciences.",
        ],
      },
      {
        heading: "The same shelter elsewhere",
        paragraphs: [
          "Weatherhaven reports delivering 110 RDMSS military shelters to Ukraine, 55 two-module and 55 four-module, in ten weeks on two 747 cargo flights.",
        ],
      },
    ],
    photos: [],
    note: "The Ukraine delivery is described only in Weatherhaven's own material.",
    sources: [
      {
        label: "Public Services and Procurement Canada news release, February 8, 2017",
        href: "https://www.canada.ca/en/public-services-procurement/news/2017/02/government_of_canadatoacquirenewportablesheltersystems.html",
      },
      {
        label: "National Defence: Headquarters Shelter System project",
        href: "https://www.canada.ca/en/department-national-defence/services/procurement/headquarters-shelter-system.html",
      },
      {
        label: "Public Safety Canada news release, January 22, 2021",
        href: "https://www.canada.ca/en/public-safety-canada/news/2021/01/government-of-canada-provides-mobile-health-units-to-assist-ontario-with-covid-19-response.html",
      },
      {
        label: "PSPC briefing to the House Standing Committee on Health, June 2021",
        href: "https://www.canada.ca/en/public-services-procurement/corporate/transparency/briefing-materials/standing-committee-health/2021-06-14/other.html",
      },
    ],
  },
  {
    slug: "beyond-epica",
    deploymentStoryId: "beyond-epica",
    title: "Drilling for million-year-old ice in Antarctica",
    dek: "At Little Dome C, Beyond EPICA drilled 2,800 m of ice to bedrock inside a Series 4 shelter and recovered a climate record reaching back 1.2 million years.",
    place: "Little Dome C, Antarctica",
    when: "2021–2025",
    systems: ["series-4", "polarhaven"],
    hero: {
      src: "/products/series-4/gallery/12-S4-Truss-Little-Dome-EPICA-1.jpeg",
      alt: "A long white Series 4 truss shelter with orange end bands on the Antarctic ice, two people in red cold-weather gear beside it",
      caption: "The Series 4 drill shelter at Little Dome C.",
    },
    numbers: [
      { value: "2,800 m", label: "Ice core drilled to bedrock" },
      { value: "1.2M years", label: "Climate record recovered" },
      { value: "−35 °C", label: "Average summer temperature on site" },
      { value: "3,200 m", label: "Elevation of the drill site" },
    ],
    timeline: [
      { date: "1988", text: "Weatherhaven's first Antarctic camp." },
      {
        date: "2008–2009",
        text: "The NASA-funded ENDURANCE team's “Bot House” on West Lake Bonney is a Polarhaven, raised around an autonomous underwater vehicle.",
      },
      {
        date: "2020",
        text: "The New York Air National Guard's 109th Airlift Wing, which flies LC-130 “Skibirds” for science in Antarctica and Greenland, orders a Polarhaven and eight Polar Chiefs.",
      },
      { date: "2021", text: "Beyond EPICA begins drilling at Little Dome C." },
      { date: "January 2025", text: "The drill reaches bedrock at 2,800 m." },
    ],
    sections: [
      {
        heading: "Twelve institutions, ten nations",
        paragraphs: [
          "Beyond EPICA – Oldest Ice brings together twelve scientific institutions from ten nations. At Little Dome C the team drilled down to bedrock and recovered a climate record reaching back 1.2 million years.",
        ],
      },
      {
        heading: "A drill hall on the ice",
        paragraphs: [
          "The drill runs inside a Series 4 shelter on a 30-ft-wide truss frame, with a slot in the roof for the drill mast. Series 4 goes up without tools or specialist skills, in widths from 8 to 30 ft and any length.",
        ],
      },
      {
        heading: "Living at −35 °C",
        paragraphs: [
          "The crew lives in 20-ft-wide insulated Series 4 shelters. The average summer temperature on site is −35 °C.",
        ],
      },
      {
        heading: "In Antarctica since 1988",
        paragraphs: [
          "Weatherhaven's first Antarctic camp went up in 1988. Since then its shelters have housed ice-core drilling, under-ice robotics and field camps for research programs at both poles, among them the Australian Antarctic Division's ice-core camp at Mount Brown South.",
        ],
      },
    ],
    photos: [
      {
        src: "/products/series-4/gallery/13-S4-Truss-Little-Dome-EPICA-2.jpeg",
        alt: "The long Series 4 truss frame going up on the ice, crew in red cold-weather gear",
        caption: "The drill shelter going up.",
      },
      {
        src: "/products/series-4/gallery/15-S4-Truss-Little-Dome-EPICA.jpeg",
        alt: "The end doors of the Series 4 drill shelter open onto a timber floor and the inner frame",
        caption: "Inside the end doors.",
      },
      {
        src: "/products/series-4/gallery/14-S4-Truss-Little-Dome-EPICA-3.jpeg",
        alt: "The end wall of the Series 4 drill shelter against a blue sky, frame members visible",
        caption: "The end wall and truss frame.",
      },
    ],
    quote: {
      text: "This drill shelter has performed excellently for several years now.",
      name: "A Beyond EPICA research associate",
    },
    sources: [
      {
        label: "Institut polaire français: Beyond EPICA reaches bedrock (press release, January 2025)",
        href: "https://institut-polaire.fr/wp-content/uploads/2025/01/PR_Antarctica_Beyond_Epica_bedrock_4th-drilling-campaign_eng_final_2025.pdf",
      },
      {
        label: "Beyond EPICA field report, December 2025",
        href: "https://eastgrip.nbi.ku.dk/beoi_field_diary/beoi_field_diary_25_26/sitreps/BELDC25_26sitrep_25.pdf",
      },
      {
        label: "NASA Astrobiology: ENDURANCE 2009 expedition",
        href: "https://astrobiology.nasa.gov/news/check-type-endurance-2009-expedition-on-the-way-to-the-ice/",
      },
      { label: "USAspending: award W50S8J20P0023 (109th Airlift Wing)", href: "https://www.usaspending.gov/award/CONT_AWD_W50S8J20P0023_9700_-NONE-_-NONE-/" },
      {
        label: "Australian Antarctic Division: tents, shelters and huts",
        href: "https://www.antarctica.gov.au/antarctic-operations/field-operations/tents-shelters-and-huts/",
      },
    ],
  },
];

export async function getFlagshipStories(): Promise<FlagshipStory[]> {
  // The content studio's stories replace these once it has any.
  const cms = await cmsStories();
  if (cms) return cms;
  return FLAGSHIP_STORIES;
}

export async function getFlagshipStory(slug: string): Promise<FlagshipStory | undefined> {
  return (await getFlagshipStories()).find((s) => s.slug === slug);
}

/** The flagship story that expands a /deployments story, for "Read the story" links (static data). */
export function flagshipStoryFor(deploymentStoryId: string): FlagshipStory | undefined {
  return FLAGSHIP_STORIES.find((s) => s.deploymentStoryId === deploymentStoryId);
}

/** Flagship stories that involve a system, for its product page. */
export function flagshipStoriesForSystem(slug: string): FlagshipStory[] {
  return FLAGSHIP_STORIES.filter((s) => s.systems.includes(slug));
}
