import {
  buildCampPlanMessage,
  CAMP_ZONE_LABELS,
  type CampPlan,
} from "@/lib/campPlanner";
import { buildProfileSummary, type MissionBuilderState } from "@/lib/missionBuilder";

export const CAMP_PLAN_PLANNING_DISCLAIMER =
  "Planning tool — indicative only. Not a formal quote or contract offer. Submit for engineering follow-up.";

export function campPlanExportFilename(packageId: string, ext: string): string {
  const safe = packageId.replace(/[^a-zA-Z0-9-]+/g, "-");
  return `WH-CAMP-${safe}.${ext}`;
}

export function buildCampPlanLineItemRows(plan: CampPlan): string[][] {
  return plan.lineItems.map((line) => [
    String(line.qty),
    line.code,
    line.name,
    CAMP_ZONE_LABELS[line.zoneId],
    line.notes ?? "—",
  ]);
}

export function buildCampPlanProfileRows(state: MissionBuilderState): string[][] {
  return buildProfileSummary(state).map((row) => [row.label, row.value]);
}

export function buildCampPlanTextExport(state: MissionBuilderState, plan: CampPlan): string {
  return buildCampPlanMessage(state, plan);
}

export function downloadTextFile(filename: string, content: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}
