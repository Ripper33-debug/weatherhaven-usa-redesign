#!/usr/bin/env node
/**
 * Enrich src/data/global-deployments.json with storyHeadline + storyNarrative per pin.
 * Run: node scripts/generate-deployment-stories.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DATA = path.join(ROOT, "src/data/global-deployments.json");

const THEATERS = {
  centcom: "CENTCOM",
  africom: "AFRICOM",
  indopacom: "INDOPACOM",
  eucom: "EUCOM",
  northcom: "NORTHCOM",
  southcom: "SOUTHCOM",
};

function programCount(all, title) {
  return all.filter((d) => d.title === title).length;
}

function headlineFor(d) {
  const label = d.label.trim();
  if (d.title === "Antarctica" && label.includes("Antarctica")) {
    return label.replace(/, Antarctica$/i, "").trim() || label;
  }
  const comma = label.indexOf(",");
  if (comma > 0) {
    const city = label.slice(0, comma).trim();
    if (city.length > 2) return city;
  }
  return label;
}

function defenceNarrative(d, scale, theater) {
  const { title, label, systemCode } = d;
  const theaterName = THEATERS[theater] ?? theater;
  const scaleLine =
    scale > 1 ? ` This site is one of ${scale} documented Weatherhaven positions supporting ${title}.` : "";

  if (/NATO/i.test(title)) {
    return `NATO expeditionary forces at ${label} used ${systemCode} deployable shelters for forward command, staff accommodation, and mission support — modular infrastructure that could advance with the alliance footprint without permanent construction in the ${theaterName} theater.${scaleLine}`;
  }
  if (/UN/i.test(title)) {
    return `United Nations operations at ${label} relied on ${systemCode} redeployable shelters to house peacekeeping staff, observers, and mission support elements — semi-permanent presence built for rotation and redeployment across harsh or remote terrain.${scaleLine}`;
  }
  if (/Coalition/i.test(title)) {
    return `Coalition operations at ${label} were sustained by ${systemCode} field infrastructure — headquarters nodes, logistics space, and force protection compatible with expeditionary movement as the battlespace evolved.${scaleLine}`;
  }
  if (/US|U\.S\.|United States/i.test(title)) {
    return `U.S. and allied programs at ${label} employed ${systemCode} systems for training, forward presence, and contingency response — shelter infrastructure sized for rapid setup and takedown in the ${theaterName} area of operations.${scaleLine}`;
  }
  return `Defence and peacekeeping programs at ${label} under ${title} used Weatherhaven ${systemCode} shelters for command, accommodation, and operational support — engineered for redeployment when the mission moved.${scaleLine}`;
}

function medicalNarrative(d, scale) {
  const { title, label, systemCode } = d;
  const scaleLine =
    scale > 1 ? ` One of ${scale} medical or relief sites documented for ${title}.` : "";

  if (/NATO|Coalition|UN/i.test(title)) {
    return `Humanitarian and medical response at ${label} required expeditionary care capacity fast — ${systemCode} shelters provided treatment space, triage, and support facilities that could stand up before fixed hospitals were available.${scaleLine}`;
  }
  return `Disaster relief and medical missions at ${label} deployed ${systemCode} infrastructure to extend care and staging capacity in ${title} — rapidly erected shelters for treatment, logistics, and staff in demanding field conditions.${scaleLine}`;
}

function commercialNarrative(d, scale) {
  const { title, label, systemCode } = d;
  const scaleLine = scale > 1 ? ` Among ${scale} documented ${title} positions worldwide.` : "";

  if (d.title === "Antarctica" || /antarctica/i.test(label)) {
    return `Polar research and support activity at ${label} depends on shelters engineered for extreme cold, wind, and environmental protection — ${systemCode} systems that operate where conventional construction is impractical or prohibited.${scaleLine}`;
  }
  if (/arctic|polar|greenland|norway|canada|alaska/i.test(label)) {
    return `Arctic and high-latitude programs at ${label} used ${systemCode} cold-weather capable shelters for research, logistics, and remote workforce support — designed for redeployment and minimal site impact.${scaleLine}`;
  }
  return `Commercial, industrial, and scientific programs at ${label} under ${title} used Weatherhaven ${systemCode} deployable infrastructure for remote workforce housing, equipment protection, and mission support away from established bases.${scaleLine}`;
}

function narrativeFor(d, all) {
  const scale = programCount(all, d.title);
  const theater = d.theaterId;

  switch (d.category) {
    case "Defence/Peacekeeping":
      return defenceNarrative(d, scale, theater);
    case "Medical/Disaster Relief":
      return medicalNarrative(d, scale);
    case "Commercial/Scientific":
      return commercialNarrative(d, scale);
    default:
      return `Weatherhaven ${d.systemCode} systems supported ${d.title} at ${d.label} — a ${d.category.toLowerCase()} deployment in ${d.environment.toLowerCase()} conditions.`;
  }
}

const FLAGSHIP = {
  "afghanistan-nato-kabul-afghanistan": {
    storyHeadline: "Forward headquarters, Kabul",
    storyNarrative:
      "HQSS tactical headquarters supported NATO expeditionary command in Afghanistan — modular, climate-controlled infrastructure built to redeploy as missions shifted across the CENTCOM theater.",
  },
  "iraq-coalition-iraq": {
    storyHeadline: "Coalition sustainment footprint",
    storyNarrative:
      "Weatherhaven camp and command systems sustained coalition operations across Iraq — turnkey infrastructure sized for expeditionary logistics and force protection.",
  },
  "ukraine-nato-kyiv-ukraine": {
    storyHeadline: "Kyiv — allied support corridor",
    storyNarrative:
      "Deployable shelter infrastructure positioned to support NATO-aligned humanitarian and defence programs as Ukraine faced sustained operational demand.",
  },
  "ukraine-nato-odesa-ukraine": {
    storyHeadline: "Odesa — medical & relief capacity",
    storyNarrative:
      "Softwall medical shelters extended expeditionary care and disaster-relief capacity on the Black Sea coast — rapid setup where fixed infrastructure was unavailable.",
  },
  "antarctica-davis-station-antarctica": {
    storyHeadline: "Davis Station, Antarctica",
    storyNarrative:
      "Polar-rated Weatherhaven systems operate where conventional construction fails — supporting scientific research in one of the planet's most ecologically sensitive environments.",
  },
  "antarctica-fort-n-sgto-cabral-antarctica": {
    storyHeadline: "Fortín Sgto Cabral",
    storyNarrative:
      "A redeployable scientific camp in Antarctica — engineered for extreme cold, wind load, and strict environmental stewardship far from any supply chain.",
  },
  "antarctica-mcmurdo-station-antarctica": {
    storyHeadline: "McMurdo Station",
    storyNarrative:
      "The largest Antarctic research hub depends on robust field infrastructure — Weatherhaven shelters support logistics, workforce, and scientific operations on the Ross Ice Shelf.",
  },
};

function main() {
  const deployments = JSON.parse(fs.readFileSync(DATA, "utf8"));
  let updated = 0;

  for (const d of deployments) {
    const flagship = FLAGSHIP[d.id];
    if (flagship) {
      d.storyHeadline = flagship.storyHeadline;
      d.storyNarrative = flagship.storyNarrative;
    } else {
      d.storyHeadline = headlineFor(d);
      d.storyNarrative = narrativeFor(d, deployments);
    }
    updated += 1;
  }

  fs.writeFileSync(DATA, `${JSON.stringify(deployments, null, 2)}\n`, "utf8");
  console.log(`Wrote story copy for ${updated} deployment pins → ${path.relative(ROOT, DATA)}`);
}

main();
