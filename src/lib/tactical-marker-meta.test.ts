import { describe, expect, it } from "vitest";
import { decodeMarkerNotes, encodeMarkerNotes, markerDisplayLabel } from "./tactical-marker-meta";

describe("tactical-marker-meta", () => {
  it("round-trips system slug in notes", () => {
    const encoded = encodeMarkerNotes("hqss", "Desert FOB");
    expect(encoded).toBe("wh:system:hqss\nDesert FOB");
    expect(decodeMarkerNotes(encoded)).toEqual({ systemSlug: "hqss", text: "Desert FOB" });
  });

  it("handles notes without system", () => {
    expect(decodeMarkerNotes("Plain note")).toEqual({ systemSlug: null, text: "Plain note" });
  });

  it("builds display labels", () => {
    expect(markerDisplayLabel(0, null, "HQSS")).toBe("HQSS · Point 1");
    expect(markerDisplayLabel(2, "Custom", null)).toBe("Custom");
  });
});
