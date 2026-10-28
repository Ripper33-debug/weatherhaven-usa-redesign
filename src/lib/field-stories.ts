/**
 * Field stories for /deployments (separate from the CMS story types in deployment-stories.ts).
 * Every fact is taken from the sources listed with it (checked October 2026). Stories that rest
 * on Weatherhaven's own publications say so with `attribution`. Photos are Weatherhaven's; where a
 * photo shows the system rather than the deployment itself, it is captioned as representative.
 */
export type StorySector = "defense" | "medical" | "research";

export type DeploymentStory = {
  id: string;
  sector: StorySector;
  place: string;
  when: string;
  title: string;
  body: string[];
  figures: { value: string; label: string }[];
  systems: { slug: string; name: string }[];
  photo?: { src: string; alt: string; caption: string };
  quote?: { text: string; who: string };
  /** Shown when the figures come from Weatherhaven rather than a third party. */
  attribution?: string;
  sources: { label: string; href: string }[];
};

export const DEPLOYMENT_STORIES: DeploymentStory[] = [
  {
    id: "beyond-epica",
    sector: "research",
    place: "Little Dome C, Antarctica",
    when: "2021–2025",
    title: "Drilling for million-year-old ice at 3,200 m",
    body: [
      "Beyond EPICA – Oldest Ice is a European project of twelve scientific institutions from ten nations. At Little Dome C, 3,200 m above sea level, where the average summer temperature is −35°C, the team drilled 2,800 m down to bedrock through ice more than 1.2 million years old.",
      "The drill runs inside a Series 4 shelter built on Weatherhaven's 30-ft-wide truss frame, with a slot in the roof for the drill mast. The crew lives in 20-ft-wide Series 4 insulated shelters, which the project's field reports call its Weatherhaven mobile shelters.",
    ],
    figures: [
      { value: "2,800 m", label: "Ice core drilled to bedrock" },
      { value: "1.2M yrs", label: "Age of the oldest ice reached" },
      { value: "−35°C", label: "Average summer temperature on site" },
    ],
    systems: [{ slug: "series-4", name: "Series 4" }],
    photo: {
      src: "/products/series-4/gallery/13-S4-Truss-Little-Dome-EPICA-2.jpeg",
      alt: "A long Series 4 truss shelter going up on the ice at Little Dome C, with crew in red cold-weather gear",
      caption: "Series 4 truss shelter at Little Dome C. Weatherhaven photo.",
    },
    quote: {
      text: "This drill shelter has performed excellently for several years now.",
      who: "A Beyond EPICA research associate, quoted by Weatherhaven",
    },
    sources: [
      {
        label: "Institut polaire français: Beyond EPICA reaches bedrock (press release, January 2025)",
        href: "https://institut-polaire.fr/wp-content/uploads/2025/01/PR_Antarctica_Beyond_Epica_bedrock_4th-drilling-campaign_eng_final_2025.pdf",
      },
      { label: "Weatherhaven: Ice core extraction in Antarctica", href: "https://www.weatherhaven.co.uk/ice-core-extraction-in-antarctica/" },
      {
        label: "Beyond EPICA field report, December 2025",
        href: "https://eastgrip.nbi.ku.dk/beoi_field_diary/beoi_field_diary_25_26/sitreps/BELDC25_26sitrep_25.pdf",
      },
    ],
  },
  {
    id: "hqss",
    sector: "defense",
    place: "Canada",
    when: "Awarded 2017, fully operational 2021",
    title: "Headquarters shelters for the Canadian Armed Forces",
    body: [
      "In February 2017 the Government of Canada awarded Weatherhaven the Headquarters Shelter System: 1,435 shelter systems with options for 338 more, replacing up to 80% of National Defence's Tent Expandable Modular System structures. The contracts also cover up to 467 connector hubs, 442 vehicle boots, 8,500 tactical lighting kits and 100,000 m² of semi-rigid flooring.",
      "Deliveries began in 2019 and the system reached full operational capability in 2021, with in-service support options running to 2042. Each set gives a command post its operations area, planning area, offices and utility space, and the shelters are built on Weatherhaven's RDMSS.",
    ],
    figures: [
      { value: "1,435", label: "Shelter systems, with options for 338 more" },
      { value: "C$168M", label: "Both contracts, taxes in; up to C$350M with options" },
      { value: "2042", label: "Support options run to" },
    ],
    systems: [{ slug: "rdmss", name: "RDMSS" }],
    sources: [
      {
        label: "Public Services and Procurement Canada news release, February 8, 2017",
        href: "https://www.canada.ca/en/public-services-procurement/news/2017/02/government_of_canadatoacquirenewportablesheltersystems.html",
      },
      {
        label: "National Defence: Headquarters Shelter System project",
        href: "https://www.canada.ca/en/department-national-defence/services/procurement/headquarters-shelter-system.html",
      },
      { label: "Weatherhaven: Headquarters Shelter System", href: "https://www.weatherhaven.co.uk/headquarters-shelter-system/" },
    ],
  },
  {
    id: "army-containerized-kitchen",
    sector: "defense",
    place: "United States",
    when: "Army parts agreement since 2021",
    title: "Expanding walls for the US Army's Containerized Kitchen",
    body: [
      "The Army's Containerized Kitchen is a field kitchen in an expanding ISO container that can feed as many as 800 Soldiers three times a day.",
      "Since November 2021 the Army has bought Weatherhaven parts for the Force Sustainment Containerized Kitchen program at Letterkenny Army Depot under a blanket purchase agreement, with orders on the public contract record such as “CK MECC wing wall.” Weatherhaven dates the relationship to 1994, when it delivered its first MECC units to the Army's Natick labs.",
    ],
    figures: [
      { value: "800", label: "Soldiers one kitchen can feed, three times a day" },
      { value: "2021", label: "Army purchase agreement for kitchen parts" },
      { value: "1994", label: "First MECC units to US Army Natick labs (Weatherhaven)" },
    ],
    systems: [{ slug: "mecc", name: "MECC" }],
    photo: {
      src: "/products/mecc/gallery/20-MIL-MECC-7.jpg",
      alt: "A deployed MECC expandable container in military green",
      caption: "A MECC in military green. Representative photo.",
    },
    sources: [
      { label: "USAspending: Army blanket purchase agreement W911N222A0009", href: "https://www.usaspending.gov/award/CONT_IDV_W911N222A0009_9700/" },
      {
        label: "USAspending: order W911N223F0389, “CK MECC wing wall”",
        href: "https://www.usaspending.gov/award/CONT_AWD_W911N223F0389_9700_W911N222A0009_9700/",
      },
      { label: "Army.mil: CK brightens Soldiers' field training (2012)", href: "https://www.army.mil/article/86329/CK_brightens_Soldiers_field_training" },
      { label: "Weatherhaven: company history", href: "https://weatherhaven.com/AboutUs" },
    ],
  },
  {
    id: "trecc-us-army",
    sector: "defense",
    place: "United States",
    when: "Developed with US Army DEVCOM",
    title: "TRECC, built with the US Army",
    body: [
      "TRECC was co-developed with the US Army through an Other Transaction Agreement and a Cooperative Research and Development Agreement with DEVCOM. It completed MIL-STD-810G and safety testing at Aberdeen Test Center, and TRECC-T is at technology readiness level 9.",
      "Weatherhaven counts 43 field trials, including the Army Expeditionary Warrior Experiments in 2022 and 2025 and Operation Lethal Eagle with the 101st Airborne Division. It has since delivered two TRECC-M sanitation units on JLTV trailers to a US customer.",
    ],
    figures: [
      { value: "43", label: "Field trials completed" },
      { value: "TRL 9", label: "Technology readiness of TRECC-T" },
      { value: "< 3 min", label: "For two people to deploy it" },
    ],
    systems: [{ slug: "trecc", name: "TRECC" }],
    photo: {
      src: "/products/trecc/gallery/09-Trecc-Woods.jpg",
      alt: "Two TRECC shelters on trailers in a forest clearing, one expanded with its steps down",
      caption: "TRECC on light tactical trailers. Weatherhaven photo.",
    },
    attribution: "Program details as published in Weatherhaven's 2026 capabilities statement.",
    sources: [
      {
        label: "Weatherhaven 2026 capabilities statement (PDF)",
        href: "https://usubc.org/wp-content/uploads/2026/08/Weatherhaven-2026-Capabilities-Statement-1.pdf",
      },
      {
        label: "Weatherhaven: TRECC delivers trailer-mounted sanitation systems to the US",
        href: "https://www.weatherhaven.co.uk/trecc-delivers-trailer-mounted-sanitation-systems-to-the-us/",
      },
    ],
  },
  {
    id: "covid-mobile-health-units",
    sector: "medical",
    place: "Ontario, Canada",
    when: "2020–2021",
    title: "100-bed field hospitals for COVID-19",
    body: [
      "In April 2020 Public Services and Procurement Canada contracted Weatherhaven and SNC-Lavalin PAE to design, manage and deploy federal Mobile Health Units, each able to hold 100 hospital beds.",
      "In January 2021 Canada sent two to Ontario after a test deployment in Brockville. The first was handed over to Sunnybrook Health Sciences Centre in Toronto on April 5, 2021, and the second went to Hamilton Health Sciences. Weatherhaven describes each unit as two 10-bed intensive care units and eight 10-bed wards with two 600-litre-per-minute oxygen plants, in shelters derived from the Headquarters Shelter System.",
    ],
    figures: [
      { value: "100", label: "Hospital beds per unit" },
      { value: "2", label: "Units sent to Ontario in 2021" },
      { value: "1,200", label: "Litres of oxygen per minute, per unit (Weatherhaven)" },
    ],
    systems: [{ slug: "rdmss", name: "RDMSS (HQSS-derived)" }],
    sources: [
      {
        label: "Public Safety Canada news release, January 22, 2021",
        href: "https://www.canada.ca/en/public-safety-canada/news/2021/01/government-of-canada-provides-mobile-health-units-to-assist-ontario-with-covid-19-response.html",
      },
      {
        label: "PSPC briefing to the House Standing Committee on Health, June 2021",
        href: "https://www.canada.ca/en/public-services-procurement/corporate/transparency/briefing-materials/standing-committee-health/2021-06-14/other.html",
      },
      {
        label: "Weatherhaven: 100-bed turnkey field hospitals in Canada",
        href: "https://www.weatherhaven.co.uk/weatherhaven-delivers-100-bed-turnkey-field-hospitals-in-canada/",
      },
    ],
  },
  {
    id: "nasa-endurance",
    sector: "research",
    place: "Lake Bonney, Antarctica",
    when: "2008–2009",
    title: "A bot house on the ice for NASA-funded robotics",
    body: [
      "ENDURANCE, part of NASA's ASTEP program and run with Stone Aerospace, sent an autonomous underwater vehicle beneath the 12-to-15-ft ice cover of Lake Bonney, in the McMurdo Dry Valleys, to explore the 130-ft-deep lake.",
      "On the ice the team built its “Bot House” from a Polarhaven: a 16-ft-tall frame of 17 arches raised around the vehicle, which a helicopter lowered onto the platform. Weatherhaven describes the shelter as the mission's operations hub.",
    ],
    figures: [
      { value: "130 ft", label: "Depth of the lake" },
      { value: "12–15 ft", label: "Ice cover above it" },
      { value: "17", label: "Arches in the 16-ft-tall frame" },
    ],
    systems: [{ slug: "polarhaven", name: "Polarhaven" }],
    photo: {
      src: "/products/arctic-package/gallery/04-02_Blue-Polarhaven.jpg",
      alt: "A blue Polarhaven shelter on snow",
      caption: "A Polarhaven in the field. Representative photo.",
    },
    sources: [
      {
        label: "NASA Astrobiology: ENDURANCE 2009 expedition",
        href: "https://astrobiology.nasa.gov/news/check-type-endurance-2009-expedition-on-the-way-to-the-ice/",
      },
      { label: "Stone Aerospace field log, December 1, 2008", href: "https://stoneaerospace.com/endurance-mission-1-december-1-2008/" },
      { label: "Montana State University: ENDURANCE field images", href: "https://montana.edu/priscu/field-work-images/endurance.html" },
      {
        label: "Weatherhaven: Decades supporting the US National Science Foundation",
        href: "https://www.weatherhaven.co.uk/decades-proudly-supporting-us-national-science-foundation/",
      },
    ],
  },
  {
    id: "109th-airlift-wing",
    sector: "defense",
    place: "Stratton Air National Guard Base, New York",
    when: "2020",
    title: "Polar shelters for the Guard's ski-equipped LC-130s",
    body: [
      "The New York Air National Guard's 109th Airlift Wing flies LC-130 “Skibirds,” the largest ski-equipped aircraft in the world, supporting National Science Foundation research in Antarctica and Greenland.",
      "In August 2020 the wing ordered a 14 × 28 ft Polarhaven with an arctic foam floor and eight Polar Chief shelters from Weatherhaven, shipped to Stratton Air National Guard Base.",
    ],
    figures: [
      { value: "8", label: "Polar Chief shelters" },
      { value: "14 × 28 ft", label: "Polarhaven with arctic foam floor" },
      { value: "$115,438", label: "Order value, August 2020" },
    ],
    systems: [
      { slug: "polar-chief", name: "Polar Chief" },
      { slug: "polarhaven", name: "Polarhaven" },
    ],
    photo: {
      src: "/products/polar-chief/gallery/02-Polar-Chief.jpg",
      alt: "An octagonal Polar Chief shelter on snow beside equipment cases",
      caption: "A Polar Chief on the snow. Representative photo.",
    },
    sources: [
      { label: "USAspending: award W50S8J20P0023", href: "https://www.usaspending.gov/award/CONT_AWD_W50S8J20P0023_9700_-NONE-_-NONE-/" },
      {
        label: "Air National Guard: 109th Airlift Wing begins 2024 Greenland missions",
        href: "https://www.104fw.ang.af.mil/News/Article-Display/Article/3789548/new-yorks-109th-airlift-wing-begins-2024-greenland-missions/",
      },
    ],
  },
  {
    id: "nato-headquarters",
    sector: "defense",
    place: "NATO",
    when: "Deployable headquarters",
    title: "A NATO headquarters, working within an hour",
    body: [
      "For a NATO command, Weatherhaven combined EHMECC, MECC and TRECC systems into a deployable headquarters that had to ship overseas at 24 hours' notice and be operational within an hour of arriving.",
      "Inside, sixteen workstations were networked through floor boxes carrying fibre and ethernet.",
    ],
    figures: [
      { value: "24 h", label: "Notice to deploy overseas" },
      { value: "< 1 h", label: "From arrival to operational" },
      { value: "16", label: "Networked workstations" },
    ],
    systems: [
      { slug: "ehmecc", name: "EHMECC" },
      { slug: "mecc", name: "MECC" },
      { slug: "trecc", name: "TRECC" },
    ],
    photo: {
      src: "/products/ehmecc/gallery/11-NATO_EHMECC_02.jpg",
      alt: "A deployed EHMECC with tan fabric walls",
      caption: "EHMECC for NATO. Weatherhaven photo.",
    },
    attribution: "As described by Weatherhaven.",
    sources: [{ label: "Weatherhaven: Rapidly deployable NATO headquarters", href: "https://www.weatherhaven.co.uk/rapidly-deployable-nato-headquarters/" }],
  },
];

/** Shorter notes, each with one source. */
export const FIELD_NOTES: { place: string; text: string; source: { label: string; href: string }; byWeatherhaven?: boolean }[] = [
  {
    place: "Tanquary Fiord, Nunavut",
    text: "Parks Canada's lodging in Quttinirpaaq National Park is a Weatherhaven unit: a rugged insulated tent with a solid floor, interior walls and four double bedrooms.",
    source: { label: "Parks Canada", href: "https://parks.canada.ca/pn-np/nu/quttinirpaaq/visit/services" },
  },
  {
    place: "Mount Brown South, Antarctica",
    text: "The Australian Antarctic Division's ice-core camp ran its drill under a Weatherhaven tent.",
    source: { label: "Australian Antarctic Division", href: "https://www.antarctica.gov.au/antarctic-operations/field-operations/tents-shelters-and-huts/" },
  },
  {
    place: "Quellaveco, Peru",
    text: "A 912-person turnkey camp of Series 4 shelters above 4,500 m, supporting Anglo American's copper project.",
    source: { label: "Weatherhaven", href: "https://www.weatherhaven.co.uk/912-person-high-altitude-full-turnkey-camp-delivered-in-peru/" },
    byWeatherhaven: true,
  },
  {
    place: "Ukraine",
    text: "110 RDMSS military shelters, 55 two-module and 55 four-module, delivered in ten weeks on two 747 cargo flights.",
    source: { label: "Weatherhaven", href: "https://www.weatherhaven.co.uk/weatherhaven-delivers-110-vital-rdmss-shelters-to-ukraine/" },
    byWeatherhaven: true,
  },
];

export function sourceHost(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}
