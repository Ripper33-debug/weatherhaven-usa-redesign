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
    headline:
      "Portable turnkey shelters and camps — softwall tensioned fabric and expandable containers engineered for rapid setup and redeployment.",
    paragraphs: [
      "Weatherhaven designs, manufactures, and installs portable turnkey shelters, camps, and field hospitals with a focus on mobility, performance, and sustainable environmental development.",
      "Structures require no special tools, site preparations, or foundations beyond general construction knowledge — supporting remote and extreme environments.",
    ],
    features: [
      "Softwall and expandable container shelter lines",
      "Redeployable systems for repeated worldwide deployment",
      "Lightweight, compact transport to reduce fuel and site impact",
    ],
    relatedSlugs: ["series-4", "non-expandable-iso-containers", "ateps"],
    diagramLabel: "Modular frame — multi-bay spine",
  },
  {
    id: "ecu",
    label: "Environmental Control",
    headline: "Climate protection from -50°C to +50°C — designed for the world's harshest environments.",
    paragraphs: [
      "Weatherhaven shelters are designed to provide protection from extreme temperature and weather, including solar shade systems that reduce power generation and fuel convoy requirements.",
      "Thermal packages are sized from envelope loads and theater requirements for each program.",
    ],
    features: [
      "Arctic through desert operational bands",
      "Solar shade and ECU integration",
      "Efficient protection for workers and equipment in extreme heat",
    ],
    relatedSlugs: ["endurance", "polarhaven", "ehmecc"],
    diagramLabel: "ECU yard — split package",
  },
  {
    id: "power",
    label: "Power Systems",
    headline: "Integrated power for deployed operations — composed with shelter and camp utility spines.",
    paragraphs: [
      "Power distribution is integrated with turnkey camp and shelter systems — from need assessment and design through installation and in-service support.",
      "PDU branches, surge isolation, and grounding plans follow load studies for each deployment.",
    ],
    features: [
      "Generator, shore power, and hybrid configurations",
      "Camp-scale utility distribution",
      "Sized for maintenance, C2, and clinical loads",
    ],
    relatedSlugs: ["ehmecc", "ateps", "series-4"],
    diagramLabel: "PDU spine — gen-set yard",
  },
  {
    id: "flooring",
    label: "Flooring & Infrastructure",
    headline: "Modular flooring, interconnectors, corridors, and Solarshade accessories for full system integration.",
    paragraphs: [
      "Modular flooring, interconnectors, corridors, and accessories integrate shelters into cohesive camp systems.",
      "Subfloor and site-class packages match traffic lanes, cable egress, and operational requirements.",
    ],
    features: [
      "Site-class-dependent subfloor packages",
      "Cable egress and maintenance access",
      "Camp circulation and utility spine integration",
    ],
    relatedSlugs: ["ateps", "mecc", "trecc"],
    diagramLabel: "Subfloor grid — cable chase",
  },
  {
    id: "c2",
    label: "Command & Control",
    headline:
      "Headquarters Shelter System (HQSS) and command configurations — modular, climate-protected, and expeditionary.",
    paragraphs: [
      "Weatherhaven was awarded Canada's Headquarters Shelter System (HQSS) acquisition and in-service support contracts — fielding advanced tactical shelter for command environments.",
      "Softwall and expandable command configurations support TOC and JOC layouts with blackout and climate control where required.",
    ],
    features: [
      "HQSS tactical headquarters shelter system",
      "Softwall command and C2-ready layouts",
      "Rapid emplacement for expeditionary headquarters",
    ],
    relatedSlugs: ["ehmecc", "series-4", "non-expandable-iso-containers"],
    diagramLabel: "TOC cell — comms spine",
  },
  {
    id: "medical",
    label: "Medical Configuration",
    headline:
      "Mobile medical shelters and field hospitals aligned with WHO and UN foreign field hospital guidelines.",
    paragraphs: [
      "From mobile clinics to field hospitals, Weatherhaven provides medical shelter solutions for military, humanitarian, and emergency response missions.",
      "Expandable containers can deploy on trucks and trailers for fast on-site medical services in remote areas.",
    ],
    features: [
      "Field hospitals and mobile clinics",
      "Rapid transport, installation, and flexible layouts",
      "Redeployable medical infrastructure worldwide",
    ],
    relatedSlugs: ["airbeam-lp", "bmecc", "hercon"],
    diagramLabel: "Clinical flow — utility chase",
  },
  {
    id: "aviation",
    label: "Aviation Support",
    headline:
      "Maintenance shelters and workshops for aviation and vehicle support — including helicopter maintenance since 1984.",
    paragraphs: [
      "Portable shelters support maintenance shops, simulation training, and unmanned systems operations in remote locations.",
      "Large-span configurations provide high-bay clearance for forward operating maintenance environments.",
    ],
    features: [
      "Helicopter and aviation maintenance shelters",
      "Workshop and simulation training configurations",
      "High-bay and recovery lane options",
    ],
    relatedSlugs: ["mts", "mecc", "mex-26"],
    diagramLabel: "MX bay — high clearance",
  },
  {
    id: "camp",
    label: "Camp Integration",
    headline:
      "Turnkey camp systems — shelter, utilities, logistics, installation, demobilization, refurbishment, and storage.",
    paragraphs: [
      "Weatherhaven provides everything needed to live and work in turnkey shelter systems — from needs assessment and shelter design to installation and equipment.",
      "At mission end, systems can be demobilized, refurbished, and stored ready for the next deployment.",
    ],
    features: [
      "Workforce, military, and humanitarian camp integration",
      "Phased emplacement aligned to lift windows",
      "Global logistics and regional support teams",
    ],
    relatedSlugs: ["ateps", "hercon", "trecc"],
    diagramLabel: "Campus spine — multi-bay",
  },
];

export function getCapabilityCategory(id: CapabilityCategoryId): CapabilityCategory | undefined {
  return CAPABILITY_CATEGORIES.find((c) => c.id === id);
}
