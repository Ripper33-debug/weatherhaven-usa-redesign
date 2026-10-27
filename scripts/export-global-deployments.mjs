#!/usr/bin/env node
/**
 * Export global deployment map pins to CSV for CEO / program office review.
 * Opens directly in Excel. UTF-8 BOM included for special characters.
 *
 * Usage: npm run export:deployments
 * Output: docs/global-deployment-map-pins-review.csv
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "src/data/global-deployments.json");
const OUTPUT = path.join(ROOT, "docs/global-deployment-map-pins-review.csv");

const THEATER_LABELS = {
  centcom: "CENTCOM",
  africom: "AFRICOM",
  indopacom: "INDOPACOM",
  eucom: "EUCOM",
  northcom: "NORTHCOM",
  southcom: "SOUTHCOM",
};

const COLUMNS = [
  { key: "row", header: "Row" },
  { key: "id", header: "ID (do not change — used to update the map)" },
  { key: "label", header: "Location" },
  { key: "title", header: "Program / Country" },
  { key: "address", header: "Address" },
  { key: "lat", header: "Latitude" },
  { key: "lng", header: "Longitude" },
  { key: "category", header: "Category" },
  { key: "systemCode", header: "System code" },
  { key: "systemSlug", header: "System slug" },
  { key: "environment", header: "Environment" },
  { key: "theaterId", header: "Theater code" },
  { key: "theaterLabel", header: "Theater" },
  { key: "summary", header: "Summary" },
  { key: "storyHeadline", header: "Story headline" },
  { key: "storyNarrative", header: "Story narrative" },
  { key: "ceoNotes", header: "CEO notes (edit here)" },
  { key: "flagForReview", header: "Flag for review (Y/N)" },
  { key: "correctedLocation", header: "Corrected location" },
  { key: "correctedProgram", header: "Corrected program / country" },
  { key: "correctedLatitude", header: "Corrected latitude" },
  { key: "correctedLongitude", header: "Corrected longitude" },
  { key: "correctedCategory", header: "Corrected category" },
  { key: "correctedSystemCode", header: "Corrected system code" },
  { key: "removeFromMap", header: "Remove from map (Y/N)" },
];

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function rowFromDeployment(deployment, index) {
  return {
    row: index + 1,
    id: deployment.id,
    label: deployment.label,
    title: deployment.title,
    address: deployment.address,
    lat: deployment.lat,
    lng: deployment.lng,
    category: deployment.category,
    systemCode: deployment.systemCode,
    systemSlug: deployment.systemSlug,
    environment: deployment.environment,
    theaterId: deployment.theaterId,
    theaterLabel: THEATER_LABELS[deployment.theaterId] ?? deployment.theaterId,
    summary: deployment.summary ?? "",
    storyHeadline: deployment.storyHeadline ?? "",
    storyNarrative: deployment.storyNarrative ?? "",
    ceoNotes: "",
    flagForReview: "",
    correctedLocation: "",
    correctedProgram: "",
    correctedLatitude: "",
    correctedLongitude: "",
    correctedCategory: "",
    correctedSystemCode: "",
    removeFromMap: "",
  };
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`Missing ${INPUT}`);
    process.exit(1);
  }

  const deployments = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  if (!Array.isArray(deployments)) {
    console.error("Expected an array in global-deployments.json");
    process.exit(1);
  }

  const sorted = [...deployments].sort((a, b) => {
    const title = a.title.localeCompare(b.title);
    if (title !== 0) return title;
    return a.label.localeCompare(b.label);
  });

  const header = COLUMNS.map((col) => col.header).join(",");
  const lines = sorted.map((deployment, index) => {
    const row = rowFromDeployment(deployment, index);
    return COLUMNS.map((col) => {
      if (col.key === "lat" || col.key === "lng") {
        const n = row[col.key];
        return typeof n === "number" ? n.toFixed(6) : "";
      }
      return csvEscape(row[col.key]);
    }).join(",");
  });

  const csv = `\uFEFF${header}\n${lines.join("\n")}\n`;
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, csv, "utf8");

  console.log(`Exported ${sorted.length} deployment pins to ${OUTPUT}`);
}

main();
