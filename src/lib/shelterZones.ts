export type ShelterZoneId = "walls" | "roof" | "ecu" | "power" | "entrance" | "interior";

export type ShelterZone = {
  id: ShelterZoneId;
  groupId: string;
  name: string;
  tooltipSpec: string;
  title: string;
  bullets: string[];
  learnMoreHref: string;
};

export const SHELTER_ZONES: ShelterZone[] = [
  {
    id: "walls",
    groupId: "zone-walls",
    name: "WALL STRUCTURE",
    tooltipSpec: "Modular soft-wall panels — 8ft configurable height",
    title: "Modular Wall Structure",
    bullets: [
      "Aluminum arch frame with tensioned fabric envelope",
      "8 ft configurable wall height — combinable multi-bay spans",
      "Anchoring kits for soil, concrete, and dispersed sites",
      "Compatible with rigid vestibule and utility spine interfaces",
    ],
    learnMoreHref: "/configurable-solutions",
  },
  {
    id: "roof",
    groupId: "zone-roof",
    name: "ROOF SYSTEM",
    tooltipSpec: "Tensioned fabric — rated -40°F to 120°F",
    title: "Roof Panel System",
    bullets: [
      "Tensioned fabric membrane rated -40°F to 120°F",
      "Snow-load hardware sets for high-latitude deployments",
      "Solar shading packages for hot / arid theaters",
      "Integrated cable egress paths for ECU and lighting",
    ],
    learnMoreHref: "/configurable-solutions",
  },
  {
    id: "ecu",
    groupId: "zone-ecu",
    name: "ECU UNIT",
    tooltipSpec: "Environmental control — 5-ton capacity, dual-mode",
    title: "Environmental Control Unit",
    bullets: [
      "5-ton capacity dual-mode ECU package",
      "Winterization and dust-mitigation kits per theater",
      "Redundant zoning for ridge-line or maritime humidity swings",
      "Quiet-hours profiles coordinated with power shed lists",
    ],
    learnMoreHref: "/configurable-solutions",
  },
  {
    id: "power",
    groupId: "zone-power",
    name: "POWER SYSTEM",
    tooltipSpec: "Integrated PDU — 60kW, shore or gen power",
    title: "Power Distribution",
    bullets: [
      "Integrated PDU — 60 kW shore or gen-set power",
      "Tactical gen-set, hybrid storage, or shore interconnect postures",
      "Cable derating schedules for heat and dust exposure",
      "Lighting branches for maintenance and tactical lux bands",
    ],
    learnMoreHref: "/configurable-solutions",
  },
  {
    id: "entrance",
    groupId: "zone-entrance",
    name: "ENTRY VESTIBULE",
    tooltipSpec: "Airlock configuration — positive pressure capable",
    title: "Entry & Vestibule",
    bullets: [
      "Airlock configuration — positive pressure capable",
      "Dust and decontamination paths at high-traffic entries",
      "Blackout-compatible door hardware where programs require",
      "Visitor and equipment circulation lanes from CONOPS",
    ],
    learnMoreHref: "/configurable-solutions",
  },
  {
    id: "interior",
    groupId: "zone-interior",
    name: "INTERIOR LAYOUT",
    tooltipSpec: "Mission-configurable floor plan — 800 sq ft",
    title: "Interior Layout",
    bullets: [
      "Mission-configurable floor plan — 800 sq ft baseline",
      "Berthing, maintenance, and sensitive workflow separation",
      "Flooring packages matched to site class and traffic lanes",
      "Layout engineering from mission threads—not catalog rows",
    ],
    learnMoreHref: "/mission-solution-builder",
  },
];

export function getShelterZone(id: ShelterZoneId): ShelterZone {
  return SHELTER_ZONES.find((z) => z.id === id)!;
}
