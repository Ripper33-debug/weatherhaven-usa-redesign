import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CampPlan, CampZoneLayout } from "@/lib/campPlanner";
import {
  buildCampPlanLineItemRows,
  buildCampPlanProfileRows,
  CAMP_PLAN_PLANNING_DISCLAIMER,
  campPlanExportFilename,
} from "@/lib/campPlanExport";
import type { MissionBuilderState } from "@/lib/missionBuilder";

const LAYOUT_COLS = 4;
const LAYOUT_CELL_MM = 18;
const LAYOUT_GAP_MM = 2;
const LAYOUT_PAD_MM = 4;

const ZONE_FILL_RGB: Record<string, [number, number, number]> = {
  entry: [77, 159, 255],
  command: [59, 130, 246],
  medical: [16, 185, 129],
  maintenance: [245, 158, 11],
  accommodation: [148, 163, 184],
  sustainment: [168, 85, 247],
  logistics: [96, 165, 250],
  power: [203, 213, 225],
};

function zoneSort(a: CampZoneLayout, b: CampZoneLayout): number {
  return a.row - b.row || a.col - b.col || a.label.localeCompare(b.label);
}

function drawCampLayout(doc: jsPDF, plan: CampPlan, startY: number): number {
  const zones = [...plan.zones].sort(zoneSort);
  const maxRow = Math.max(0, ...zones.map((z) => z.row + z.rowSpan));
  const gridW = LAYOUT_PAD_MM * 2 + LAYOUT_COLS * LAYOUT_CELL_MM + (LAYOUT_COLS - 1) * LAYOUT_GAP_MM;
  const gridH =
    LAYOUT_PAD_MM * 2 + (maxRow + 1) * LAYOUT_CELL_MM + maxRow * LAYOUT_GAP_MM;
  const originX = 14;
  const originY = startY;

  doc.setDrawColor(40, 44, 52);
  doc.setFillColor(13, 15, 18);
  doc.roundedRect(originX, originY, gridW, gridH, 2, 2, "FD");

  for (const zone of zones) {
    const rgb = ZONE_FILL_RGB[zone.id] ?? [120, 120, 120];
    const x = originX + LAYOUT_PAD_MM + zone.col * (LAYOUT_CELL_MM + LAYOUT_GAP_MM);
    const y = originY + LAYOUT_PAD_MM + zone.row * (LAYOUT_CELL_MM + LAYOUT_GAP_MM);
    const w = zone.colSpan * LAYOUT_CELL_MM + (zone.colSpan - 1) * LAYOUT_GAP_MM;
    const h = zone.rowSpan * LAYOUT_CELL_MM + (zone.rowSpan - 1) * LAYOUT_GAP_MM;

    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.setDrawColor(77, 159, 255);
    doc.setGState(doc.GState({ opacity: 0.35 }));
    doc.roundedRect(x, y, w, h, 1, 1, "FD");
    doc.setGState(doc.GState({ opacity: 1 }));

    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    const label = zone.label.length > 22 ? `${zone.label.slice(0, 20)}…` : zone.label;
    doc.text(label, x + 2, y + 5, { maxWidth: w - 4 });
  }

  doc.setTextColor(0, 0, 0);
  return originY + gridH + 8;
}

export function buildCampPlanPdfDocument(state: MissionBuilderState, plan: CampPlan): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Weatherhaven — Indicative Camp Package", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Package ID: ${plan.packageId}`, margin, y);
  doc.text(new Date().toLocaleDateString("en-US", { dateStyle: "medium" }), pageW - margin, y, {
    align: "right",
  });
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(plan.title, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(plan.subtitle, margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Mission profile", margin, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["Parameter", "Value"]],
    body: buildCampPlanProfileRows(state),
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [13, 15, 18], textColor: [255, 255, 255] },
    theme: "grid",
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Indicative camp layout", margin, y);
  y += 6;
  y = drawCampLayout(doc, plan, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Parts list (ROM planning)", margin, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["Qty", "Code", "System", "Zone", "Notes"]],
    body: buildCampPlanLineItemRows(plan),
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [13, 15, 18], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 22 },
      4: { cellWidth: 35 },
    },
    theme: "grid",
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  if (y > 250) {
    doc.addPage();
    y = 18;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Program pricing", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(plan.rom.label, margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const romLines = doc.splitTextToSize(plan.rom.disclaimer, pageW - margin * 2);
  doc.text(romLines, margin, y);
  y += romLines.length * 4 + 6;

  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "italic");
  const disclaimerLines = doc.splitTextToSize(CAMP_PLAN_PLANNING_DISCLAIMER, pageW - margin * 2);
  doc.text(disclaimerLines, margin, y);

  return doc;
}

export function downloadCampPlanPdf(state: MissionBuilderState, plan: CampPlan): void {
  if (typeof window === "undefined") return;
  const doc = buildCampPlanPdfDocument(state, plan);
  doc.save(campPlanExportFilename(plan.packageId, "pdf"));
}
