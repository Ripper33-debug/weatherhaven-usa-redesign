import { describe, expect, it } from "vitest";
import { TACTICAL_DEPLOYMENT_LOCATIONS } from "@/lib/tactical-deployment-locations";
import {
  buildDeploymentExportRows,
  deploymentExportFilename,
  deploymentLocationsToCsv,
} from "@/lib/tactical-deployment-export";

describe("tactical-deployment-export", () => {
  it("builds CSV with preset and user rows", () => {
    const rows = buildDeploymentExportRows(TACTICAL_DEPLOYMENT_LOCATIONS.slice(0, 2), [
      {
        id: "m1",
        label: "User site",
        notes: "wh:system:hqss\nCamp package WH-CAMP-1",
        latitude: 10,
        longitude: 20,
        created_at: "2026-06-07T12:00:00.000Z",
      },
    ]);
    expect(rows).toHaveLength(3);
    const csv = deploymentLocationsToCsv(rows);
    expect(csv.split("\n")[0]).toContain("Name,Latitude,Longitude");
    expect(csv).toContain("Fort Liberty, USA");
    expect(csv).toContain("User site");
  });

  it("uses dated export filename", () => {
    expect(deploymentExportFilename(new Date("2026-06-07T15:00:00.000Z"))).toBe(
      "weatherhaven-deployments-2026-06-07.csv",
    );
  });
});
