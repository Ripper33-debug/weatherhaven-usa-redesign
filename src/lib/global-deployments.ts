/**
 * Global deployment pins imported from Google My Maps (Weatherhaven Deployments).
 * Regenerate: npm run import:deployments
 */

import deploymentsJson from "@/data/global-deployments.json";
import { GLOBAL_DEPLOYMENT_STATS as DEPLOYMENT_STATS_DISPLAY } from "@/lib/global-deployment-stats";

export type DeploymentTheaterId =
  | "centcom"
  | "africom"
  | "indopacom"
  | "eucom"
  | "northcom"
  | "southcom";

export type GlobalDeployment = {
  id: string;
  lat: number;
  lng: number;
  /** Location line from My Maps (city / country). */
  label: string;
  /** Program or country grouping from My Maps. */
  title: string;
  address: string;
  category: string;
  systemSlug: string;
  systemCode: string;
  environment: string;
  theaterId: DeploymentTheaterId;
  summary: string;
  /** Generated or CMS-synced pin story headline. */
  storyHeadline?: string;
  /** Generated or CMS-synced pin story narrative. */
  storyNarrative?: string;
};

export type DeploymentTheater = {
  id: DeploymentTheaterId;
  label: string;
  center: [number, number];
  zoom: number;
  headline: string;
  stat: string;
  detail: string;
};

export const GLOBAL_DEPLOYMENT_STATS = {
  ...DEPLOYMENT_STATS_DISPLAY,
  pins: deploymentsJson.length,
} as const;

export const DEPLOYMENT_THEATERS: DeploymentTheater[] = [
  {
    id: "centcom",
    label: "CENTCOM",
    center: [28, 48],
    zoom: 4,
    headline: "Middle East & Central Asia",
    stat: "Forward C2 & camp infrastructure",
    detail: "Expeditionary command, maintenance, and turnkey camps across desert and high-altitude theaters.",
  },
  {
    id: "africom",
    label: "AFRICOM",
    center: [2, 22],
    zoom: 3,
    headline: "Africa & adjacent waters",
    stat: "Humanitarian & expeditionary medical",
    detail: "Mobile clinics, camp systems, and redeployable shelters for contingency and relief operations.",
  },
  {
    id: "indopacom",
    label: "INDOPACOM",
    center: [8, 135],
    zoom: 3,
    headline: "Indo-Pacific",
    stat: "Maritime & tropical deployments",
    detail: "Command, medical, and maintenance shelters sized for island and littoral operating environments.",
  },
  {
    id: "eucom",
    label: "EUCOM",
    center: [52, 18],
    zoom: 4,
    headline: "Europe & Arctic approaches",
    stat: "NATO-aligned camp & HQ programs",
    detail: "Turnkey camps, expandable containers, and cold-weather packages for allied exercises and operations.",
  },
  {
    id: "northcom",
    label: "NORTHCOM",
    center: [52, -105],
    zoom: 3,
    headline: "North America",
    stat: "Arctic research & continental training",
    detail: "Polar-rated shelters and domestic training infrastructure supporting North American programs.",
  },
  {
    id: "southcom",
    label: "SOUTHCOM",
    center: [-12, -65],
    zoom: 3,
    headline: "Americas & Antarctica",
    stat: "Humanitarian & polar research",
    detail: "Relief packages, naval support camps, and ecologically sensitive polar research stations.",
  },
];

/** Scripted flythrough for homepage “Global tour”. */
export const DEPLOYMENT_TOUR_THEATER_IDS: DeploymentTheaterId[] = ["centcom", "africom", "indopacom"];

export const GLOBAL_DEPLOYMENTS = (deploymentsJson as GlobalDeployment[]).filter(
  (d) => !/russia|ukraine/i.test(`${d.label} ${d.title} ${d.address}`),
);

export function getTheaterById(id: DeploymentTheaterId): DeploymentTheater | undefined {
  return DEPLOYMENT_THEATERS.find((t) => t.id === id);
}

export function deploymentsForTheater(theaterId: DeploymentTheaterId): GlobalDeployment[] {
  return GLOBAL_DEPLOYMENTS.filter((d) => d.theaterId === theaterId);
}

export function featuredDeploymentForTheater(theaterId: DeploymentTheaterId): GlobalDeployment | undefined {
  return deploymentsForTheater(theaterId)[0];
}

export function uniqueDeploymentTitles(): number {
  return new Set(GLOBAL_DEPLOYMENTS.map((d) => d.title)).size;
}
