import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { quickLookHref, sceneViewerHref } from "@/components/three/TreccArButton";

describe("TRECC AR links", () => {
  it("open Quick Look at true size", () => {
    expect(quickLookHref("tan")).toBe("/models/ar/trecc-deployed-tan.usdz#allowsContentScaling=0");
  });

  it("open Scene Viewer in AR, unresizable, with a way back", () => {
    const href = sceneViewerHref("https://weatherhavenusa.com", "arctic", "https://weatherhavenusa.com/configurable-solutions/trecc?ar=arctic");
    expect(href.startsWith("intent://arvr.google.com/scene-viewer/1.0?file=https%3A%2F%2Fweatherhavenusa.com%2Fmodels%2Far%2Ftrecc-deployed-arctic.glb&")).toBe(true);
    expect(href).toContain("mode=ar_preferred");
    expect(href).toContain("resizable=false");
    expect(href).toContain("package=com.google.android.googlequicksearchbox");
    expect(href).toContain("S.browser_fallback_url=https%3A%2F%2Fweatherhavenusa.com%2Fconfigurable-solutions%2Ftrecc%3Far%3Darctic;end;");
  });

  it("has a model file for every finish on both platforms", () => {
    for (const finish of ["green", "tan", "arctic"]) {
      for (const ext of ["glb", "usdz"]) {
        const f = path.join(process.cwd(), "public/models/ar", `trecc-deployed-${finish}.${ext}`);
        expect(fs.existsSync(f), f).toBe(true);
        expect(fs.statSync(f).size).toBeLessThan(10_000_000);
      }
    }
  });
});
