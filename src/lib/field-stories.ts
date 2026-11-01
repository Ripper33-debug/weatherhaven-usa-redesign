/**
 * Field stories for /deployments (separate from the CMS story types in deployment-stories.ts).
 * Facts were checked against the listed sources in October 2026. Only third-party sources are
 * listed on the page; program details that come from Weatherhaven's own material (the TRECC
 * program, the NATO headquarters, the Quellaveco and Ukraine notes) carry no source line.
 * Photos are captioned with what they show, never as the deployment when they aren't.
 *
 * `weight` sets how much room a story gets: one lead, a few features with photographs,
 * and short briefs.
 */
export type StorySector = "defense" | "medical" | "research";

export type DeploymentStory = {
  id: string;
  sector: StorySector;
  weight: "lead" | "feature" | "brief";
  place: string;
  when?: string;
  title: string;
  body: string[];
  /** At most two numbers a buyer would care about; most stories carry theirs in the text. */
  facts?: { value: string; label: string }[];
  systems: { slug: string; name: string }[];
  photo?: { src: string; alt: string; caption: string };
  quote?: { text: string; who: string };
  /** Third-party sources only. */
  sources: { label: string; href: string }[];
};

export const DEPLOYMENT_STORIES: DeploymentStory[] = [
  {
    id: "hqss",
    sector: "defense",
    weight: "lead",
    place: "Canada",
    when: "awarded 2017",
    title: "1,435 headquarters shelters for the Canadian Armed Forces",
    body: [
      "Canada awarded Weatherhaven the Headquarters Shelter System in January 2017, with options for 338 more shelter systems. They replace up to 80% of National Defence's Tent Expandable Modular System structures. The project also covers up to 467 connector hubs, 442 vehicle boots, 8,500 tactical lighting kits and 100,000 m² of semi-rigid flooring.",
      "Each set gives a command post its operations area, planning area, offices and utility space, on Weatherhaven's RDMSS. Deliveries began in 2019, and the program is now in in-service support, with support options to 2042.",
    ],
    facts: [
      { value: "C$168M", label: "Acquisition and in-service support contracts, taxes included" },
      { value: "C$350M", label: "Potential value if every option is exercised" },
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
    ],
  },
  {
    id: "trecc-us-army",
    sector: "defense",
    weight: "feature",
    place: "United States",
    when: "developed with US Army DEVCOM",
    title: "TRECC, developed with the US Army",
    body: [
      "TRECC was co-developed with the US Army under an Other Transaction Agreement and a Cooperative Research and Development Agreement with DEVCOM. It has passed MIL-STD-810G and safety testing at Aberdeen Test Center.",
      "It has been through the Army Expeditionary Warrior Experiments in 2022 and 2025, Project Convergence 2024 and Operation Lethal Eagle with the 101st Airborne Division. Two TRECC sanitation systems built to work with JLTVs have gone to a US customer.",
    ],
    facts: [
      { value: "43", label: "Field trials completed" },
      { value: "TRL 9", label: "Technology readiness of TRECC‑T" },
    ],
    systems: [{ slug: "trecc", name: "TRECC" }],
    photo: {
      src: "/products/trecc/gallery/09-Trecc-Woods.jpg",
      alt: "Two TRECC shelters on trailers in a forest clearing, one expanded with its steps down",
      caption: "Two TRECCs on light tactical trailers, one expanded.",
    },
    sources: [],
  },
  {
    id: "beyond-epica",
    sector: "research",
    weight: "feature",
    place: "Little Dome C, Antarctica",
    when: "2021–2025",
    title: "Drilling for million-year-old ice at 3,200 m",
    body: [
      "Beyond EPICA – Oldest Ice brings together twelve scientific institutions from ten nations. At Little Dome C the team drilled down to bedrock and recovered a climate record reaching back 1.2 million years.",
      "The drill runs inside a Series 4 shelter on a 30-ft-wide truss frame, with a slot in the roof for the drill mast. The crew lives in 20-ft-wide insulated Series 4 shelters.",
    ],
    facts: [
      { value: "2,800 m", label: "Ice core drilled to bedrock" },
      { value: "−35 °C", label: "Average summer temperature on site" },
    ],
    systems: [{ slug: "series-4", name: "Series 4" }],
    photo: {
      src: "/products/series-4/gallery/13-S4-Truss-Little-Dome-EPICA-2.jpeg",
      alt: "A long Series 4 truss shelter going up on the ice at Little Dome C, with crew in red cold-weather gear",
      caption: "The Series 4 drill shelter going up at Little Dome C.",
    },
    quote: {
      text: "This drill shelter has performed excellently for several years now.",
      who: "A Beyond EPICA research associate",
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
    ],
  },
  {
    id: "nato-headquarters",
    sector: "defense",
    weight: "feature",
    place: "NATO",
    title: "A NATO headquarters that works within an hour of arriving",
    body: [
      "For a NATO command, Weatherhaven combined EHMECC, MECC and TRECC systems into a deployable headquarters that had to ship overseas at 24 hours' notice and be operational within an hour of arriving. Its sixteen workstations are networked through floor boxes carrying fiber and ethernet.",
    ],
    systems: [
      { slug: "ehmecc", name: "EHMECC" },
      { slug: "mecc", name: "MECC" },
      { slug: "trecc", name: "TRECC" },
    ],
    photo: {
      src: "/products/ehmecc/gallery/11-NATO_EHMECC_02.jpg",
      alt: "A deployed EHMECC with tan fabric walls",
      caption: "An EHMECC built for NATO.",
    },
    sources: [],
  },
  {
    id: "army-containerized-kitchen",
    sector: "defense",
    weight: "brief",
    place: "Letterkenny Army Depot, Pennsylvania",
    when: "since 2021",
    title: "Expanding walls for the US Army's Containerized Kitchen",
    body: [
      "The Army's Containerized Kitchen can feed up to 800 Soldiers three times a day. Since November 2021 the Army has bought its Weatherhaven parts, such as the MECC wing walls, under a blanket purchase agreement at Letterkenny Army Depot. The first MECCs went to US Army Natick Labs in 1994.",
    ],
    systems: [{ slug: "mecc", name: "MECC" }],
    sources: [
      { label: "USAspending: Army blanket purchase agreement W911N222A0009", href: "https://www.usaspending.gov/award/CONT_IDV_W911N222A0009_9700/" },
      {
        label: "USAspending: order W911N223F0389, “CK MECC wing wall”",
        href: "https://www.usaspending.gov/award/CONT_AWD_W911N223F0389_9700_W911N222A0009_9700/",
      },
      { label: "Army.mil: CK brightens Soldiers' field training (2012)", href: "https://www.army.mil/article/86329/CK_brightens_Soldiers_field_training" },
    ],
  },
  {
    id: "109th-airlift-wing",
    sector: "defense",
    weight: "brief",
    place: "Stratton Air National Guard Base, New York",
    when: "2020",
    title: "Polar shelters for the Guard's LC-130 “Skibird” wing",
    body: [
      "The New York Air National Guard's 109th Airlift Wing flies LC-130 “Skibirds,” the largest ski-equipped aircraft in the world, for American science in Antarctica and the National Science Foundation in Greenland. In August 2020 the wing ordered a 14 × 28 ft Polarhaven with an arctic foam floor and eight Polar Chief shelters.",
    ],
    systems: [
      { slug: "polarhaven", name: "Polarhaven" },
      { slug: "polar-chief", name: "Polar Chief" },
    ],
    sources: [
      { label: "USAspending: award W50S8J20P0023", href: "https://www.usaspending.gov/award/CONT_AWD_W50S8J20P0023_9700_-NONE-_-NONE-/" },
      {
        label: "Air National Guard: 109th Airlift Wing begins 2024 Greenland missions",
        href: "https://www.104fw.ang.af.mil/News/Article-Display/Article/3789548/new-yorks-109th-airlift-wing-begins-2024-greenland-missions/",
      },
    ],
  },
  {
    id: "covid-mobile-health-units",
    sector: "medical",
    weight: "brief",
    place: "Ontario, Canada",
    when: "2020–2021",
    title: "100-bed field hospitals for COVID-19",
    body: [
      "In April 2020 Public Services and Procurement Canada contracted Weatherhaven and SNC-Lavalin PAE to design, manage and deploy federal Mobile Health Units of 100 beds each. Canada sent two to Ontario in 2021: the first was handed over to Sunnybrook Health Sciences Centre in Toronto on April 5, the second to Hamilton Health Sciences.",
      "Each unit has two 10-bed intensive care units, eight 10-bed wards and two 600-liter-per-minute oxygen plants, in shelters derived from the Headquarters Shelter System.",
    ],
    systems: [{ slug: "rdmss", name: "RDMSS" }],
    sources: [
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
    id: "nasa-endurance",
    sector: "research",
    weight: "brief",
    place: "West Lake Bonney, Antarctica",
    when: "2008–2009",
    title: "A bot house on the ice for NASA-funded robotics",
    body: [
      "ENDURANCE, part of NASA's ASTEP program, was led by the University of Illinois at Chicago with Stone Aerospace. It sent an autonomous underwater vehicle beneath the 12-to-15-ft ice of West Lake Bonney, in the McMurdo Dry Valleys, to map the 130-ft-deep lake. The team's “Bot House” on the ice was a Polarhaven: a 16-ft-tall frame of 17 arches raised around the vehicle, which a helicopter lowered onto the platform.",
    ],
    systems: [{ slug: "polarhaven", name: "Polarhaven" }],
    sources: [
      {
        label: "NASA Astrobiology: ENDURANCE 2009 expedition",
        href: "https://astrobiology.nasa.gov/news/check-type-endurance-2009-expedition-on-the-way-to-the-ice/",
      },
      { label: "Stone Aerospace field log, December 1, 2008", href: "https://stoneaerospace.com/endurance-mission-1-december-1-2008/" },
      { label: "Montana State University: ENDURANCE field images", href: "https://montana.edu/priscu/field-work-images/endurance.html" },
    ],
  },
];

/** Shorter notes. A source is listed only when it is a third party. */
export const FIELD_NOTES: { place: string; text: string; source?: { label: string; href: string } }[] = [
  {
    place: "Tanquary Fiord, Nunavut",
    text: "Parks Canada's lodging in Quttinirpaaq National Park is a Weatherhaven unit: an insulated tent with a solid floor, interior walls and four double bedrooms.",
    source: { label: "Parks Canada", href: "https://parks.canada.ca/pn-np/nu/quttinirpaaq/visit/services" },
  },
  {
    place: "Mount Brown South, Antarctica",
    text: "The Australian Antarctic Division's ice-core camp ran its drill under a Weatherhaven tent.",
    source: { label: "Australian Antarctic Division", href: "https://www.antarctica.gov.au/antarctic-operations/field-operations/tents-shelters-and-huts/" },
  },
  {
    place: "Quellaveco, Peru",
    text: "A 912-person turnkey camp of Series 4 shelters above 4,500 m for Anglo American's copper project.",
  },
  {
    place: "Ukraine",
    text: "Weatherhaven reports delivering 110 RDMSS military shelters, 55 two-module and 55 four-module, in ten weeks on two 747 cargo flights.",
  },
];

export function sourceHost(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}
