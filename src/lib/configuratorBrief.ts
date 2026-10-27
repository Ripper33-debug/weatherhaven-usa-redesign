export type Mission = "fad" | "training" | "hq" | "medical";
export type Climate = "hot" | "cold" | "maritime" | "mountain";
export type Power = "grid" | "tactical" | "hybrid";

export type BriefInputs = {
  mission: Mission;
  climate: Climate;
  power: Power;
  crew: number;
};

const missionTitle: Record<Mission, string> = {
  fad: "Forward support / refueling operations",
  training: "Training & certification",
  hq: "Command & planning",
  medical: "Medical & stabilization",
};

const climateTitle: Record<Climate, string> = {
  hot: "Hot / arid",
  cold: "Cold / high latitude",
  maritime: "Maritime / littoral",
  mountain: "Mountain / dispersed",
};

const powerTitle: Record<Power, string> = {
  grid: "Shore / grid tie",
  tactical: "Tactical generators",
  hybrid: "Hybrid microgrid",
};

/** Unclassified advisory synthesis for the mission solution builder. */
export function buildConfiguratorBrief(i: BriefInputs) {
  const mission = missionTitle[i.mission];
  const environment = climateTitle[i.climate];
  const power = powerTitle[i.power];
  const crew = i.crew;

  const footprintLabel =
    crew <= 12
      ? "Alpha — soft-wall cluster (2–3 cells + utility spine)"
      : crew <= 36
        ? "Bravo — rigid-frame spine (4–6 cells + ECU yard)"
        : "Charlie — multi-bay campus (redundant utility loops)";

  const shelterClassTitle =
    crew <= 12 ? "Alpha-class expeditionary footprint" : crew <= 36 ? "Bravo-class modular spine" : "Charlie-class multi-bay campus";

  const notionalCells = crew <= 12 ? "2–3" : crew <= 36 ? "4–6" : "7–10";
  const notionalFloor =
    crew <= 12
      ? "≈1.8–2.4k ft² conditioned (planning-level order of magnitude)"
      : crew <= 36
        ? "≈4–6k ft² conditioned (planning-level order of magnitude)"
        : "≈8–12k ft² conditioned (planning-level order of magnitude)";

  const envKit =
    i.climate === "cold"
      ? "Insulated envelope package, snow-load hardware set, vestibule airlocks, ECU winterization kit."
      : i.climate === "maritime"
        ? "Corrosion-resistant exterior hardware, elevated subfloor, cable drip loops, dehumidification assist."
        : i.climate === "mountain"
          ? "Anchoring kit, wind bracing schedule, split ECU zoning for ridge-line temperature swings."
          : "Solar shading package, dust mitigation at vestibules, expanded ECU sensible-load headroom.";

  const pwrArch =
    i.power === "hybrid"
      ? "Hybrid stack: tactical gen-set plus battery storage, inverter staging, prioritized shed list for silent hours."
      : i.power === "grid"
        ? "Shore interconnect: main PDU, branch panels, surge isolation, ground reference plan for equipment racks."
        : "Tactical power: parallel gen-set concept, refuel window planning, cable derating for heat and dust exposure.";

  const missionAlignment =
    i.mission === "fad"
      ? "Circulation separated for fuel handling versus maintenance; recovery lane for disabled equipment; crane-assisted bay option when lift is available."
      : i.mission === "medical"
        ? "Patient flow with dirty and clean separation; utility chase for medical racks; optional negative-pressure kit where programs require it."
        : i.mission === "hq"
          ? "Planning wall backing, comms alcove acoustic treatment, controlled visitor path, raceway discipline for future kit."
          : "Observer lanes, AAR room footprint, secure equipment stow aligned to training throughput.";

  const bomSample = [
    `Deployable shelter cells ×${notionalCells} (${footprintLabel})`,
    "Subfloor / leveling package (site-class dependent)",
    "ECU pair or split package per environmental band",
    i.power === "hybrid" ? "Battery enclosure and inverter skid (configuration-dependent)" : "PDU and panel package per power baseline",
    "Interior lighting (tactical and maintenance lux bands)",
    "Anchoring and ballast consumables per environment kit",
  ];

  const logistics =
    i.climate === "maritime"
      ? "Seaworthy crating assumptions; corrosion inspection on receipt; staged shore power cutover plan."
      : "Palletized movement plan with piece weights compatible with common tactical lift classes.";

  const phases = [
    { t: "Phase 0 — Site recon", d: "Confirm access routes, crane points if used, and grounding strategy." },
    { t: "Phase 1 — Emplacement", d: "Lay subfloor grid, set primary cells, establish temporary power if required." },
    { t: "Phase 2 — Close-in", d: "ECU tie-in, PDU energization, vestibule and circulation hardening." },
    { t: "Phase 3 — Acceptance", d: "Functional checks, training touchpoint, punch list for engineering review." },
  ];

  const risks = [
    "Timelines assume trained crews and nominal weather windows.",
    "Environmental loads are qualitative; engineering validation is required before procurement.",
    "Power and ECU selections require nameplate verification and site survey.",
  ];

  const recommendedMissionPackage = `${mission} for ${environment} operations: ${crew}-person baseline, ${power} power posture, and logistics tempo captured from the mission narrative—not a catalog selection. Configuration proceeds from CONOPS, theater constraints, and sustainment goals.`;

  const shelterSystemApproach = `${shelterClassTitle}. ${footprintLabel}. ${notionalFloor}. Operational fit: ${missionAlignment}`;

  const powerBaseline = `Baseline: ${power}. ${pwrArch}`;

  const environmentalConsiderations = envKit;

  const sustainmentSupportNotes = [
    logistics,
    `Materiel staging: ${bomSample[0]}; ECU and distribution sized to environmental band.`,
    `${phases[3].t}: ${phases[3].d} Documentation and training packages scale to maintenance echelon.`,
    "Sustainment posture: spares recommendations track utilization assumptions and environmental exposure between resupply cycles.",
    risks[1],
  ];

  const advisoryExecutiveSummary = `Advisory configuration brief (unclassified): Weatherhaven recommends starting from mission profile (${mission}), operating environment (${environment}), personnel baseline (${crew}), mobility and timeline assumptions captured in workshop, and sustainment posture—then composing shelter, ECU, power distribution, flooring, and layout engineering as configurable building blocks rather than fixed catalog rows.`;

  const recommendedStartingPoint = `${footprintLabel} sized to ${crew} personnel: combine ${notionalCells} notional shelter cells with utility spine, ECU yard, and ${power} power discipline as the opening trade space—not a final bill of materials.`;

  const layoutFlooringEngineering = `Subfloor and flooring are configuration building blocks: leveling grid, cable egress, and traffic lanes follow circulation derived from CONOPS (${missionAlignment}). Berthing versus maintenance versus sensitive workflows drive separation and vestibule sequencing before envelope details freeze.`;

  const configurationBuildingBlocks = [
    `Shelter / envelope cells ×${notionalCells} — configurable module mix, not a single SKU`,
    "ECU and environmental stack — matched to envelope sensible/latent band and redundancy goals",
    "Power distribution & lighting — PDU branches, tactical vs silent-hour profiles",
    "Flooring & integration — site-class-dependent subfloor with disciplined cable paths",
    "Layout engineering — master circulation, separation, and life-support interfaces",
  ];

  const nextStepCta =
    "Request a controlled technical exchange: bring clearance posture, program vehicle, and theater constraints so engineering can validate loads, MEP coordination, and export posture before any detailed configuration is released.";

  return {
    mission,
    environment,
    power,
    crew,
    footprintLabel,
    notionalFloor,
    advisoryExecutiveSummary,
    recommendedStartingPoint,
    recommendedMissionPackage,
    shelterSystemApproach,
    layoutFlooringEngineering,
    configurationBuildingBlocks,
    powerBaseline,
    environmentalConsiderations,
    sustainmentSupportNotes,
    nextStepCta,
    envKit,
    pwrArch,
    missionAlignment,
    bomSample,
    logistics,
    phases,
    risks,
  };
}
