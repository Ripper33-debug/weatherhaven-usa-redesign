import { describe, expect, it } from "vitest";
import { MISSION_BUILDER_DEFAULTS } from "@/lib/missionBuilder";
import { generateCampPlan } from "@/lib/campPlanner";
import { PRODUCTS } from "@/lib/products";
import { buildCampPlanPdfDocument } from "@/lib/campPlanPdf";
import {
  buildCampPlanLineItemRows,
  buildCampPlanTextExport,
  campPlanExportFilename,
} from "@/lib/campPlanExport";

const state = {
  ...MISSION_BUILDER_DEFAULTS,
  environment: "desert",
  primaryFunction: "c2",
  personnelCount: "48",
  contactName: "Test",
  contactOrg: "Unit",
  contactEmail: "test@example.mil",
};

const plan = generateCampPlan(state, PRODUCTS);

describe("campPlanExport", () => {
  it("builds a stable export filename", () => {
    expect(campPlanExportFilename("WH-2026-ABC", "pdf")).toBe("WH-CAMP-WH-2026-ABC.pdf");
  });

  it("includes line items in table rows", () => {
    const rows = buildCampPlanLineItemRows(plan);
    expect(rows.length).toBe(plan.lineItems.length);
    expect(rows[0]?.[0]).toBe(String(plan.lineItems[0]?.qty));
  });

  it("text export includes package id and ROM", () => {
    const text = buildCampPlanTextExport(state, plan);
    expect(text).toContain(plan.packageId);
    expect(text).toContain(plan.rom.label);
  });

  it("generates a multi-section PDF document", () => {
    const doc = buildCampPlanPdfDocument(state, plan);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    const blob = doc.output("arraybuffer");
    expect(blob.byteLength).toBeGreaterThan(1000);
  });
});
