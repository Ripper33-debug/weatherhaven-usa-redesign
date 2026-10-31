import { describe, expect, it } from "vitest";
import {
  cadRequestBlock,
  engineerCallBlock,
  formatSlot,
  isValidTimeZone,
  nowIn,
  validateCadRequest,
  validateEngineerCall,
} from "@/lib/contact-requests";

// 2026-10-31 14:00 UTC = 10:00 in New York (EDT).
const NOW = new Date("2026-10-31T14:00:00Z");

const call = (slots: { date: string; time: string }[], extra: Record<string, unknown> = {}) => ({
  topic: "Power and climate control for a TRECC command post",
  timezone: "America/New_York",
  slots,
  ...extra,
});

describe("validateEngineerCall", () => {
  it("accepts two or three future times and keeps only filled slots", () => {
    const r = validateEngineerCall(
      call([
        { date: "2026-11-03", time: "10:00" },
        { date: "2026-11-04", time: "14:30" },
        { date: "", time: "" },
      ]),
      NOW,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.slots).toHaveLength(2);
  });

  it("needs at least two times", () => {
    const r = validateEngineerCall(call([{ date: "2026-11-03", time: "10:00" }]), NOW);
    expect(r).toEqual({ ok: false, error: expect.stringContaining("at least two") });
  });

  it("rejects times in the past in the caller's time zone", () => {
    // 09:30 today in New York has already passed at 10:00.
    const r = validateEngineerCall(
      call([
        { date: "2026-10-31", time: "09:30" },
        { date: "2026-11-04", time: "14:30" },
      ]),
      NOW,
    );
    expect(r).toEqual({ ok: false, error: expect.stringContaining("future") });
    // Later today is fine.
    expect(
      validateEngineerCall(
        call([
          { date: "2026-10-31", time: "15:00" },
          { date: "2026-11-04", time: "14:30" },
        ]),
        NOW,
      ).ok,
    ).toBe(true);
  });

  it("rejects bad dates, half-filled slots, duplicates, more than three and far-future times", () => {
    expect(validateEngineerCall(call([{ date: "2026-02-30", time: "10:00" }, { date: "2026-11-04", time: "10:00" }]), NOW).ok).toBe(false);
    expect(validateEngineerCall(call([{ date: "2026-11-03", time: "" }, { date: "2026-11-04", time: "10:00" }]), NOW).ok).toBe(false);
    expect(validateEngineerCall(call([{ date: "2026-11-03", time: "25:00" }, { date: "2026-11-04", time: "10:00" }]), NOW).ok).toBe(false);
    expect(validateEngineerCall(call([{ date: "2026-11-03", time: "10:00" }, { date: "2026-11-03", time: "10:00" }]), NOW).ok).toBe(false);
    const four = Array.from({ length: 4 }, (_, i) => ({ date: `2026-11-0${i + 3}`, time: "10:00" }));
    expect(validateEngineerCall(call(four), NOW).ok).toBe(false);
    expect(validateEngineerCall(call([{ date: "2028-01-03", time: "10:00" }, { date: "2026-11-04", time: "10:00" }]), NOW).ok).toBe(false);
  });

  it("needs a topic and a real time zone", () => {
    const slots = [
      { date: "2026-11-03", time: "10:00" },
      { date: "2026-11-04", time: "10:00" },
    ];
    expect(validateEngineerCall(call(slots, { topic: " " }), NOW).ok).toBe(false);
    expect(validateEngineerCall(call(slots, { topic: "x".repeat(301) }), NOW).ok).toBe(false);
    expect(validateEngineerCall(call(slots, { timezone: "Mars/Olympus" }), NOW).ok).toBe(false);
    expect(validateEngineerCall(null, NOW).ok).toBe(false);
  });
});

describe("validateCadRequest", () => {
  const known = ["trecc", "mecc"];
  it("accepts formats in a fixed order and trims the use", () => {
    const r = validateCadRequest({ system: "trecc", formats: ["PDF", "DWG"], use: "  Site layout for a battalion command post " }, known);
    expect(r).toEqual({ ok: true, value: { system: "trecc", formats: ["DWG", "PDF"], use: "Site layout for a battalion command post" } });
  });

  it("needs a known system, at least one allowed format and a use", () => {
    expect(validateCadRequest({ system: "", formats: ["DWG"], use: "Layout" }, known).ok).toBe(false);
    expect(validateCadRequest({ system: "nope", formats: ["DWG"], use: "Layout" }, known).ok).toBe(false);
    expect(validateCadRequest({ system: "trecc", formats: [], use: "Layout" }, known).ok).toBe(false);
    expect(validateCadRequest({ system: "trecc", formats: ["DXF"], use: "Layout" }, known).ok).toBe(false);
    expect(validateCadRequest({ system: "trecc", formats: ["STEP"], use: "" }, known).ok).toBe(false);
    // Without a list, any well-formed slug passes (CMS products the static list doesn't know).
    expect(validateCadRequest({ system: "new-system", formats: ["STEP"], use: "Layout" }).ok).toBe(true);
    expect(validateCadRequest({ system: "Bad Slug!", formats: ["STEP"], use: "Layout" }).ok).toBe(false);
  });
});

describe("message blocks", () => {
  it("formats the call request with its time zone", () => {
    const block = engineerCallBlock({
      topic: "Power",
      timezone: "America/New_York",
      slots: [
        { date: "2026-11-03", time: "10:00" },
        { date: "2026-11-04", time: "14:30" },
      ],
    });
    expect(block).toBe(
      "Engineer call request\nTopic: Power\nPreferred times (US Eastern, America/New_York):\n1. Tue 3 Nov 2026 at 10:00\n2. Wed 4 Nov 2026 at 14:30",
    );
  });

  it("formats the CAD request", () => {
    expect(cadRequestBlock({ system: "trecc", formats: ["DWG", "STEP"], use: "Layout" }, "TRECC")).toBe(
      "CAD drawing request\nSystem: TRECC\nFormats: DWG, STEP\nIntended use: Layout",
    );
  });

  it("helpers", () => {
    expect(isValidTimeZone("Europe/London")).toBe(true);
    expect(isValidTimeZone("")).toBe(false);
    expect(nowIn("America/New_York", NOW)).toEqual({ date: "2026-10-31", time: "10:00" });
    expect(formatSlot({ date: "2026-12-25", time: "09:05" })).toBe("Fri 25 Dec 2026 at 09:05");
  });
});
