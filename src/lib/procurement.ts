/**
 * Procurement facts for the US company, for the government buyers page and the identifiers shown
 * around the site. Sources (checked October 2026):
 * - CAGE 0EYW4: Weatherhaven's own site and capability material.
 * - UEI and registered NAICS codes: Weatherhaven Resources, Inc.'s SAM.gov registration, as
 *   republished by federal contractor directories (govconinabox.com, sweetspot.so). Confirm both
 *   against SAM.gov before launch.
 * - Contract record: USAspending.gov award records and a DLA Troop Support product data sheet.
 */
export const PROCUREMENT = {
  legalName: "Weatherhaven Resources, Inc.",
  cage: "0EYW4",
  uei: "DBETGL9QKYH3",
  naics: [
    { code: "624221", title: "Temporary shelters", primary: true },
    { code: "332311", title: "Prefabricated metal building and component manufacturing" },
    { code: "332312", title: "Fabricated structural metal manufacturing" },
    { code: "332439", title: "Other metal container manufacturing" },
    { code: "314910", title: "Textile bag and canvas mills" },
    { code: "236220", title: "Commercial and institutional building construction" },
    { code: "541330", title: "Engineering services" },
    { code: "561210", title: "Facilities support services" },
    { code: "624230", title: "Emergency and other relief services" },
    { code: "423730", title: "Warm air heating and air-conditioning equipment wholesalers" },
    { code: "423990", title: "Other miscellaneous durable goods wholesalers" },
  ],
  record: [
    {
      buyer: "US Army, Letterkenny Army Depot",
      title: "Blanket purchase agreements for Containerized Kitchen parts",
      text: "Since November 2021 the Army has ordered Weatherhaven parts for the Force Sustainment Containerized Kitchen program under two blanket purchase agreements: MECC wing walls, doors, hinges and spares.",
      ids: ["W911N222A0009", "W911N222A0010"],
      source: { label: "USAspending.gov, BPA W911N222A0009", href: "https://www.usaspending.gov/award/CONT_IDV_W911N222A0009_9700/" },
    },
    {
      buyer: "Defense Logistics Agency",
      title: "Spare parts by NSN",
      text: "Weatherhaven spares carry national stock numbers and are bought by DLA, for example the MECC drive crank for winches and leveling jacks (Weatherhaven part 129361).",
      ids: ["NSN 5340-01-486-2219"],
      source: {
        label: "DLA Troop Support product data sheet",
        href: "https://www.dla.mil/Portals/104/Documents/TroopSupport/CloTex/shelters/Weatherhaven/129361.pdf",
      },
    },
    {
      buyer: "New York Air National Guard",
      title: "Polar shelters for the 109th Airlift Wing",
      text: "In August 2020 the wing that flies the LC-130 “Skibirds” ordered a 14 × 28 ft Polarhaven with an arctic foam floor and eight Polar Chief shelters.",
      ids: ["W50S8J20P0023"],
      source: { label: "USAspending.gov, award W50S8J20P0023", href: "https://www.usaspending.gov/award/CONT_AWD_W50S8J20P0023_9700_-NONE-_-NONE-/" },
    },
    {
      buyer: "Allied programs",
      title: "Canada's Headquarters Shelter System and a NATO headquarters",
      text: "1,435 headquarters shelter systems for the Canadian Armed Forces, with support options to 2042, and a deployable NATO headquarters built from EHMECC, MECC and TRECC.",
      ids: [],
      source: { label: "Deployment stories, with their sources", href: "/deployments#hqss" },
    },
  ],
  provide: [
    {
      title: "Configuration packages",
      text: "Bounded option sets and technical narratives built from your mission inputs, for a solicitation or a justification and approval.",
      link: { label: "Start one in the mission builder.", href: "/mission-solution-builder", external: false },
    },
    {
      title: "Published specifications",
      text: "Dimensions, weights, climate ratings and to-scale drawings for every system, with info sheets where Weatherhaven publishes them.",
      link: { label: "Compare systems.", href: "/configurable-solutions", external: false },
    },
    {
      title: "Test record",
      text: "TRECC completed MIL-STD-810G and safety testing at Aberdeen Test Center and is at technology readiness level 9 (TRECC-T), as published in Weatherhaven's capabilities statement.",
      link: {
        label: "Capabilities statement (PDF).",
        href: "https://usubc.org/wp-content/uploads/2026/08/Weatherhaven-2026-Capabilities-Statement-1.pdf",
        external: true,
      },
    },
    {
      title: "Technical data",
      text: "Export-controlled technical data may apply; detailed specifications are released to authorized programs on request.",
      link: { label: "Request technical data.", href: "/contact?inquiry=Program%20Requirement", external: false },
    },
    {
      title: "Special operations",
      text: "SOF programs get a separate portal with planning tools and program-level detail.",
      link: { label: "Request SOF portal access.", href: "/sof-solutions/request-access", external: false },
    },
  ],
} as const;
