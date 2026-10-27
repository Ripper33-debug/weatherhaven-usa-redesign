export const MISSION_PROFILE_STORAGE_KEY = "wh-mission-profile";

export type EnvironmentId = "arctic" | "arid" | "jungle" | "maritime" | "highalt" | "temperate";
export type MissionTypeId = "c2" | "medical" | "maintenance" | "basecamp" | "scif" | "logistics";
export type ForceSizeId = "small" | "platoon" | "company" | "battalion";
export type MobilityId = "c130" | "sling" | "ground" | "iso" | "lapes" | "multimodal";

export type MissionProfileSelections = {
  environment: EnvironmentId;
  environmentLabel: string;
  missionType: MissionTypeId;
  missionTypeLabel: string;
  forceSize: ForceSizeId;
  forceSizeLabel: string;
  mobility: MobilityId;
  mobilityLabel: string;
  recommendedTitle: string;
  recommendedDescription: string;
  estimatedSetupTime: string;
  transportConfirmation: string;
  completedAt: string;
};

export type ConfiguratorStepOption = {
  id: string;
  label: string;
  emoji: string;
  hint: string;
};

export type ConfiguratorStep = {
  step: number;
  label: string;
  headline: string;
  options: ConfiguratorStepOption[];
};

export const CONFIGURATOR_STEPS: ConfiguratorStep[] = [
  {
    step: 1,
    label: "OPERATIONAL ENVIRONMENT",
    headline: "Where will this system operate?",
    options: [
      {
        id: "arctic",
        emoji: "🏔",
        label: "Arctic / Subarctic",
        hint: "Permafrost, extreme cold, -40°F operations",
      },
      {
        id: "arid",
        emoji: "🏜",
        label: "Arid / Desert",
        hint: "High heat, sand, dust, UV exposure",
      },
      {
        id: "jungle",
        emoji: "🌴",
        label: "Jungle / Tropical",
        hint: "High humidity, rain, vegetation clearance",
      },
      {
        id: "maritime",
        emoji: "🌊",
        label: "Maritime / Littoral",
        hint: "Salt air, ship deck, amphibious ops",
      },
      {
        id: "highalt",
        emoji: "🏔",
        label: "High Altitude",
        hint: "Above 10,000ft, thin air, cold temps",
      },
      {
        id: "temperate",
        emoji: "🌍",
        label: "Temperate / European",
        hint: "Standard NATO environment",
      },
    ],
  },
  {
    step: 2,
    label: "MISSION FUNCTION",
    headline: "What is the primary operational requirement?",
    options: [
      {
        id: "c2",
        emoji: "📡",
        label: "Command & Control",
        hint: "TOC, JOC, or JSOC planning environment",
      },
      {
        id: "medical",
        emoji: "🏥",
        label: "Medical / CASEVAC",
        hint: "Role 1/2 treatment, surgical, triage",
      },
      {
        id: "maintenance",
        emoji: "🔧",
        label: "Maintenance & MX",
        hint: "Aviation, vehicle, or weapons maintenance",
      },
      {
        id: "basecamp",
        emoji: "🏕",
        label: "Expeditionary Base",
        hint: "FOB or patrol base life support",
      },
      {
        id: "scif",
        emoji: "🔒",
        label: "SCIF / Sensitive",
        hint: "Classified operations, emissions control",
      },
      {
        id: "logistics",
        emoji: "📦",
        label: "Logistics Hub",
        hint: "Supply chain, staging, distribution",
      },
    ],
  },
  {
    step: 3,
    label: "FORCE PROFILE",
    headline: "What is the scale and urgency of this requirement?",
    options: [
      {
        id: "small",
        emoji: "⚡",
        label: "Small Team / Rapid",
        hint: "4-12 personnel, deploy in under 72 hours",
      },
      {
        id: "platoon",
        emoji: "🔵",
        label: "Platoon Level",
        hint: "20-40 personnel, 7-14 day setup window",
      },
      {
        id: "company",
        emoji: "🟡",
        label: "Company Level",
        hint: "80-150 personnel, deliberate planning cycle",
      },
      {
        id: "battalion",
        emoji: "🔴",
        label: "Battalion / Task Force",
        hint: "200+ personnel, full camp infrastructure",
      },
    ],
  },
  {
    step: 4,
    label: "MOBILITY REQUIREMENT",
    headline: "How does this system need to move?",
    options: [
      {
        id: "c130",
        emoji: "✈️",
        label: "C-130 / Air Transportable",
        hint: "Fits within C-130J pallet configuration",
      },
      {
        id: "sling",
        emoji: "🚁",
        label: "Helicopter Sling Load",
        hint: "CH-47 or UH-60 lift, remote insertion",
      },
      {
        id: "ground",
        emoji: "🚛",
        label: "Ground Vehicle / LMTV",
        hint: "Road or off-road vehicle transport",
      },
      {
        id: "iso",
        emoji: "🚢",
        label: "ISO Container",
        hint: "20ft or 40ft sea container deployment",
      },
      {
        id: "lapes",
        emoji: "🪂",
        label: "LAPES / Airdrop",
        hint: "Low altitude parachute extraction",
      },
      {
        id: "multimodal",
        emoji: "🔄",
        label: "Multi-Modal",
        hint: "Combination of transport methods",
      },
    ],
  },
];

const envName: Record<EnvironmentId, string> = {
  arctic: "COLD WEATHER",
  arid: "ARID ENVIRONMENT",
  jungle: "JUNGLE",
  maritime: "MARITIME",
  highalt: "HIGH ALTITUDE",
  temperate: "TEMPERATE",
};

const forcePackage: Record<ForceSizeId, string> = {
  small: "RAPID DEPLOY PACKAGE",
  platoon: "PLATOON PACKAGE",
  company: "COMPANY PACKAGE",
  battalion: "TASK FORCE PACKAGE",
};

const setupTimeByForce: Record<ForceSizeId, string> = {
  small: "Under 72 hours (trained crew, nominal conditions)",
  platoon: "7–14 days (phased emplacement)",
  company: "3–6 weeks (deliberate planning cycle)",
  battalion: "6–12 weeks (multi-phase camp build)",
};

const transportConfirm: Record<MobilityId, string> = {
  c130: "Confirmed: C-130J palletized load plan — modules sized for tactical airlift",
  sling: "Confirmed: CH-47 / UH-60 sling-load compatible — piece weights within lift envelope",
  ground: "Confirmed: Ground vehicle / LMTV transport — convoy-staged modules",
  iso: "Confirmed: ISO container deployment — 20ft / 40ft sea movement",
  lapes: "Confirmed: LAPES / airdrop configuration — low-altitude extraction profile",
  multimodal: "Confirmed: Multi-modal transport plan — staged air, ground, and sea legs",
};

function defaultDescription(
  env: EnvironmentId,
  mission: MissionTypeId,
  force: ForceSizeId,
  mobility: MobilityId,
): string {
  const envHints: Record<EnvironmentId, string> = {
    arctic: "ECU rated for extreme cold, insulated envelope, snow-load hardware.",
    arid: "Dust mitigation, solar shading, expanded ECU sensible-load headroom.",
    jungle: "Dehumidification assist, elevated flooring, corrosion-aware hardware.",
    maritime: "Salt-air hardware, drip loops, shore-power cutover sequencing.",
    highalt: "Split ECU zoning, anchoring for ridge-line winds, thin-air derating.",
    temperate: "Standard NATO environmental band, balanced power and ECU sizing.",
  };
  const missionHints: Record<MissionTypeId, string> = {
    c2: "Planning walls, comms alcoves, blackout-capable layout discipline.",
    medical: "Patient flow separation, utility chases, clinical load power branches.",
    maintenance: "High-bay clearance, tool-control zones, separated fuel circulation.",
    basecamp: "Berthing, life support, and utility spine integrated to tempo.",
    scif: "Emissions control, RF discipline, access-controlled circulation.",
    logistics: "Staging bays, pallet discipline, sustainment power distribution.",
  };
  return `${envHints[env]} ${missionHints[mission]} Sized for ${CONFIGURATOR_STEPS[2]!.options.find((o) => o.id === force)?.hint ?? "selected force profile"}. ${transportConfirm[mobility]}`;
}

export type ConfigurationResult = {
  title: string;
  description: string;
  estimatedSetupTime: string;
  transportConfirmation: string;
};

export function buildConfigurationResult(
  environment: EnvironmentId,
  missionType: MissionTypeId,
  forceSize: ForceSizeId,
  mobility: MobilityId,
): ConfigurationResult {
  if (environment === "arctic") {
    return {
      title: "Arctic Package — Weatherhaven cold weather system proven at -50°C",
      description:
        "Cold-weather shelter system rated from -50°C to +50°C — proven in polar, mining, and military operations worldwide.",
      estimatedSetupTime: setupTimeByForce[forceSize],
      transportConfirmation: transportConfirm[mobility],
    };
  }

  if (missionType === "c2" || missionType === "scif") {
    return {
      title: "HQSS — Headquarters Shelter System",
      description:
        "Headquarters Shelter System — Canada's most advanced tactical shelter. Unmatched speed, modularity, and climate protection.",
      estimatedSetupTime: setupTimeByForce[forceSize],
      transportConfirmation: transportConfirm[mobility],
    };
  }

  if (missionType === "medical") {
    return {
      title: "Expandable Container Medical Clinic",
      description: "Hospital-grade expandable container clinic with rapid deployment and integrated systems.",
      estimatedSetupTime: setupTimeByForce[forceSize],
      transportConfirmation: transportConfirm[mobility],
    };
  }

  if (missionType === "maintenance") {
    return {
      title: "Large-Span Maintenance Shelter",
      description: "Large-span softwall shelter for aviation and vehicle maintenance support in forward operating environments.",
      estimatedSetupTime: setupTimeByForce[forceSize],
      transportConfirmation: transportConfirm[mobility],
    };
  }

  if (forceSize === "small") {
    return {
      title: "Softwall Rapid Deploy Package",
      description:
        "Softwall tensioned fabric shelters deployable in hours across all seven continents for small-team rapid operations.",
      estimatedSetupTime: setupTimeByForce.small,
      transportConfirmation: transportConfirm[mobility],
    };
  }

  if (forceSize === "battalion" || missionType === "basecamp") {
    return {
      title: "Turnkey Camp System",
      description: "Full camp infrastructure — shelter, utilities, logistics, installation, and demobilization support.",
      estimatedSetupTime: setupTimeByForce[forceSize],
      transportConfirmation: transportConfirm[mobility],
    };
  }

  const envLabel = envName[environment];
  const missionLabel =
    missionType === "logistics"
      ? "LOGISTICS"
      : "MISSION";

  return {
    title: `${envLabel} ${missionLabel} — ${forcePackage[forceSize]}`,
    description: defaultDescription(environment, missionType, forceSize, mobility),
    estimatedSetupTime: setupTimeByForce[forceSize],
    transportConfirmation: transportConfirm[mobility],
  };
}

export function buildMissionProfile(
  environment: EnvironmentId,
  environmentLabel: string,
  missionType: MissionTypeId,
  missionTypeLabel: string,
  forceSize: ForceSizeId,
  forceSizeLabel: string,
  mobility: MobilityId,
  mobilityLabel: string,
): MissionProfileSelections {
  const config = buildConfigurationResult(environment, missionType, forceSize, mobility);
  return {
    environment,
    environmentLabel,
    missionType,
    missionTypeLabel,
    forceSize,
    forceSizeLabel,
    mobility,
    mobilityLabel,
    recommendedTitle: config.title,
    recommendedDescription: config.description,
    estimatedSetupTime: config.estimatedSetupTime,
    transportConfirmation: config.transportConfirmation,
    completedAt: new Date().toISOString(),
  };
}

/** @deprecated Use buildConfigurationResult */
export function buildRecommendedTitle(
  environment: EnvironmentId,
  missionType: MissionTypeId,
  forceSize: ForceSizeId,
): string {
  return buildConfigurationResult(environment, missionType, forceSize, "c130").title;
}

export function saveMissionProfile(profile: MissionProfileSelections): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MISSION_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* quota / private mode */
  }
}

export function loadMissionProfile(): MissionProfileSelections | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MISSION_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MissionProfileSelections & {
      timeline?: string;
      timelineLabel?: string;
    };
    if (parsed.timeline && !parsed.forceSize) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearMissionProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(MISSION_PROFILE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Map homepage configurator picks to Mission Solution Builder demo fields. */
export function mapProfileToBuilderInputs(profile: MissionProfileSelections) {
  const climateMap: Record<EnvironmentId, "cold" | "hot" | "maritime" | "mountain"> = {
    arctic: "cold",
    arid: "hot",
    jungle: "mountain",
    maritime: "maritime",
    highalt: "cold",
    temperate: "mountain",
  };
  const missionMap: Record<MissionTypeId, "hq" | "medical" | "fad" | "training"> = {
    c2: "hq",
    medical: "medical",
    maintenance: "fad",
    basecamp: "training",
    scif: "hq",
    logistics: "fad",
  };
  const crewMap: Record<ForceSizeId, number> = {
    small: 12,
    platoon: 32,
    company: 120,
    battalion: 200,
  };
  return {
    climate: climateMap[profile.environment],
    mission: missionMap[profile.missionType],
    crew: crewMap[profile.forceSize],
  };
}
