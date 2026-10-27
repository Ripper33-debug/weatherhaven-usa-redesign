export type CapabilityCategoryId =
  | "shelter"
  | "ecu"
  | "power"
  | "flooring"
  | "c2"
  | "medical"
  | "aviation"
  | "camp";

export type CapabilityCategory = {
  id: CapabilityCategoryId;
  label: string;
  headline: string;
  paragraphs: string[];
  features: string[];
  relatedSlugs: string[];
  diagramLabel: string;
};

export const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  {
    id: "shelter",
    label: "Shelter Systems",
    headline: "Soft-wall fabric shelters and expandable containers that set up fast and redeploy for years.",
    paragraphs: [
      "Weatherhaven designs, builds and installs shelters, camps and field hospitals. Every system is meant to be struck, moved and stood up again when the mission changes.",
      "Most systems need no special tools, site preparation or foundations, which is what makes them practical in remote and extreme locations.",
    ],
    features: [
      "Soft-wall, inflatable, polar and expandable container lines",
      "Built to be redeployed again and again",
      "Compact to transport, saving fuel and lift",
    ],
    relatedSlugs: ["series-4", "mecc", "airbeam-lp"],
    diagramLabel: "Modular frame — multi-bay spine",
  },
  {
    id: "ecu",
    label: "Environmental Control",
    headline: "Shelters built for roughly −50 °C to +50 °C, from polar ice to desert heat.",
    paragraphs: [
      "Insulated walls, environmental control units and solar shades are specified together. Solar shade systems cut the cooling load, which means less generator power and fewer fuel convoys.",
      "Heating and cooling are sized for each program’s climate and use.",
    ],
    features: [
      "Arctic, temperate and desert configurations",
      "Solar shade and environmental control unit integration",
      "Protection for people and equipment in extreme heat and cold",
    ],
    relatedSlugs: ["endurance", "polarhaven", "ehmecc"],
    diagramLabel: "ECU yard — split package",
  },
  {
    id: "power",
    label: "Power Systems",
    headline: "Power distribution planned with the camp, not added after it.",
    paragraphs: [
      "Weatherhaven plans power alongside the shelters and camp layout, from needs assessment and design through installation and in-service support.",
      "Distribution, protection and grounding are laid out from a load study for each deployment.",
    ],
    features: [
      "Generator, shore power and hybrid configurations",
      "Camp-wide utility distribution",
      "Sized for maintenance, command and clinical loads",
    ],
    relatedSlugs: ["mecc", "ehmecc", "trecc"],
    diagramLabel: "PDU spine — gen-set yard",
  },
  {
    id: "flooring",
    label: "Flooring & Infrastructure",
    headline: "Floors, connectors and corridors that join single shelters into one camp.",
    paragraphs: [
      "Modular floors, interconnectors, corridors and Solarshade accessories link shelters so people and cables move between them under cover.",
      "Subfloor packages are matched to the site and to the traffic each area will take.",
    ],
    features: [
      "Subfloor packages matched to the site",
      "Cable routing and maintenance access",
      "Covered circulation between shelters",
    ],
    relatedSlugs: ["ateps", "mecc", "trecc"],
    diagramLabel: "Subfloor grid — cable chase",
  },
  {
    id: "c2",
    label: "Command & Control",
    headline: "Command posts and headquarters that go up fast and hold their climate.",
    paragraphs: [
      "Weatherhaven won Canada’s Headquarters Shelter System (HQSS) acquisition and in-service support contracts, fielding tactical shelters for command.",
      "Soft-wall and expandable configurations support tactical and joint operations center layouts, with blackout and climate control where required.",
    ],
    features: [
      "HQSS tactical headquarters shelter system",
      "Soft-wall and expandable command layouts",
      "Fast setup for expeditionary headquarters",
    ],
    relatedSlugs: ["ehmecc", "rdmss", "trecc"],
    diagramLabel: "TOC cell — comms spine",
  },
  {
    id: "medical",
    label: "Medical Configuration",
    headline: "Clinics and field hospitals for military, humanitarian and emergency response missions.",
    paragraphs: [
      "Configurations range from a single mobile clinic to a full field hospital, aligned with WHO and UN guidance for foreign field hospitals.",
      "Expandable containers travel on trucks and trailers, so medical teams can open on site quickly in remote areas.",
    ],
    features: [
      "Field hospitals and mobile clinics",
      "Fast transport and installation, flexible layouts",
      "Redeployable medical infrastructure",
    ],
    relatedSlugs: ["airbeam-lp", "bmecc", "hercon"],
    diagramLabel: "Clinical flow — utility chase",
  },
  {
    id: "aviation",
    label: "Aviation Support",
    headline: "Maintenance shelters and workshops for aircraft and vehicles, first delivered to the Canadian Forces in 1984.",
    paragraphs: [
      "Portable shelters house maintenance shops, simulation training and unmanned systems operations in remote locations.",
      "Large-span configurations give the clear height that forward maintenance work needs.",
    ],
    features: [
      "Helicopter and aviation maintenance shelters",
      "Workshop and simulator training configurations",
      "High-bay, clear-span options",
    ],
    relatedSlugs: ["mex-26", "series-4", "mecc"],
    diagramLabel: "MX bay — high clearance",
  },
  {
    id: "camp",
    label: "Camp Integration",
    headline: "Complete camps: shelter, utilities, logistics, installation, and what happens after the mission.",
    paragraphs: [
      "Weatherhaven supplies everything needed to live and work in a camp, from needs assessment and shelter design to installation and equipment.",
      "When the mission ends, systems are taken down, refurbished and stored ready for the next deployment.",
    ],
    features: [
      "Workforce, military and humanitarian camps",
      "Phased setup planned around transport",
      "Global logistics and regional support",
    ],
    relatedSlugs: ["mecc", "hercon", "rdmss"],
    diagramLabel: "Campus spine — multi-bay",
  },
];

export function getCapabilityCategory(id: CapabilityCategoryId): CapabilityCategory | undefined {
  return CAPABILITY_CATEGORIES.find((c) => c.id === id);
}
