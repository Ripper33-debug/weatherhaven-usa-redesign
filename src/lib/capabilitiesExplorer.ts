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
    headline: "Soft-wall, inflatable, polar and expandable container shelters that go up without special tools or foundations.",
    paragraphs: [
      "They pack down small to save fuel and airlift, and they are built to be struck and set up again for years.",
    ],
    features: [
      "Soft-wall, inflatable, polar and expandable container lines",
      "Built to be redeployed again and again",
      "Compact to transport, saving fuel and lift",
    ],
    relatedSlugs: ["series-4", "mecc", "airbeam-lp"],
    diagramLabel: "Modular frame, multi-bay spine",
  },
  {
    id: "ecu",
    label: "Environmental Control",
    headline: "Shelters rated from about −50 °C to +50 °C, with heating and cooling sized to each site.",
    paragraphs: [
      "Insulated walls, environmental control units and solar shades are specified together. A solar shade cuts the cooling load, so the generators burn less fuel and fewer convoys bring it in.",
    ],
    features: [
      "Arctic, temperate and desert configurations",
      "Solar shade and environmental control unit integration",
      "Protection for people and equipment in extreme heat and cold",
    ],
    relatedSlugs: ["endurance", "polarhaven", "ehmecc"],
    diagramLabel: "ECU yard, split package",
  },
  {
    id: "power",
    label: "Power Systems",
    headline: "Distribution, protection and grounding laid out from a load study for each camp.",
    paragraphs: [
      "Generator, shore and hybrid power are planned with the shelters and the site layout, then installed and supported in service.",
    ],
    features: [
      "Generator, shore power and hybrid configurations",
      "Camp-wide utility distribution",
      "Sized for maintenance, command and clinical loads",
    ],
    relatedSlugs: ["mecc", "ehmecc", "trecc"],
    diagramLabel: "PDU spine, gen-set yard",
  },
  {
    id: "flooring",
    label: "Flooring & Infrastructure",
    headline: "Floors, connectors and covered corridors that join separate shelters into one camp.",
    paragraphs: [
      "Subfloor packages are matched to the ground and to the traffic each area takes, with cable routes and maintenance access built in.",
    ],
    features: [
      "Subfloor packages matched to the site",
      "Cable routing and maintenance access",
      "Covered circulation between shelters",
    ],
    relatedSlugs: ["ateps", "mecc", "trecc"],
    diagramLabel: "Subfloor grid, cable chase",
  },
  {
    id: "c2",
    label: "Command & Control",
    headline: "Tactical and joint operations centers in soft-wall or expandable shelters, with blackout and climate control.",
    paragraphs: [
      "Weatherhaven supplies the Canadian Armed Forces' Headquarters Shelter System, its largest program, and built a NATO headquarters that works within an hour of arriving.",
    ],
    features: [
      "HQSS tactical headquarters shelter system",
      "Soft-wall and expandable command layouts",
      "Fast setup for expeditionary headquarters",
    ],
    relatedSlugs: ["ehmecc", "rdmss", "trecc"],
    diagramLabel: "TOC cell, comms spine",
  },
  {
    id: "medical",
    label: "Medical Configuration",
    headline: "Mobile clinics, intensive care wards and field hospitals of up to 100 beds.",
    paragraphs: [
      "Layouts follow WHO and UN guidance for foreign field hospitals. Expandable containers arrive on trucks and trailers, so a medical team can open soon after it reaches the site.",
    ],
    features: [
      "Field hospitals and mobile clinics",
      "Fast transport and installation, flexible layouts",
      "Redeployable medical infrastructure",
    ],
    relatedSlugs: ["airbeam-lp", "bmecc", "hercon"],
    diagramLabel: "Clinical flow, utility chase",
  },
  {
    id: "aviation",
    label: "Aviation Support",
    headline: "Maintenance shelters, workshops and simulator rooms for aviation units.",
    paragraphs: [
      "Large-span shelters give forward maintenance crews the clear height they need. Smaller ones house simulation training and uncrewed systems operations.",
    ],
    features: [
      "Helicopter and aviation maintenance shelters",
      "Workshop and simulator training configurations",
      "High-bay, clear-span options",
    ],
    relatedSlugs: ["mex-26", "series-4", "mecc"],
    diagramLabel: "MX bay, high clearance",
  },
  {
    id: "camp",
    label: "Camp Integration",
    headline: "Workforce, military and humanitarian camps, from needs assessment to installation.",
    paragraphs: [
      "Weatherhaven supplies what people need to live and work on site, plans the setup around the transport available, and afterwards takes the systems down, refurbishes them and stores them for the next deployment.",
    ],
    features: [
      "Workforce, military and humanitarian camps",
      "Phased setup planned around transport",
      "Global logistics and regional support",
    ],
    relatedSlugs: ["mecc", "hercon", "rdmss"],
    diagramLabel: "Campus spine, multi-bay",
  },
];

export function getCapabilityCategory(id: CapabilityCategoryId): CapabilityCategory | undefined {
  return CAPABILITY_CATEGORIES.find((c) => c.id === id);
}
