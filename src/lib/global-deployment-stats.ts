/** Homepage map section stats — no JSON import (keeps client bundle small). */
export const GLOBAL_DEPLOYMENT_STATS = {
  countries: "95+",
  continents: "7",
  years: "45+",
  /** Keep in sync with src/data/global-deployments.json (npm run import:deployments). */
  pins: 155,
} as const;
