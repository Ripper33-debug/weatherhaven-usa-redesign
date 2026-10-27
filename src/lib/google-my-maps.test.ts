import { describe, expect, it } from "vitest";
import {
  GOOGLE_MY_MAPS_MID,
  googleMyMapsEmbedUrl,
  googleMyMapsViewerUrl,
} from "./google-my-maps";

describe("google-my-maps", () => {
  it("builds embed URL with map mid", () => {
    const url = googleMyMapsEmbedUrl("test-mid-id");
    expect(url).toContain("https://www.google.com/maps/d/embed?");
    expect(url).toContain("mid=test-mid-id");
    expect(url).toContain("ehbc=2D");
  });

  it("builds viewer URL", () => {
    const url = googleMyMapsViewerUrl("test-mid-id");
    expect(url).toContain("https://www.google.com/maps/d/viewer?");
    expect(url).toContain("mid=test-mid-id");
  });

  it("defaults to configured production map id", () => {
    expect(GOOGLE_MY_MAPS_MID).toBe("1WjBWwEmcEb7M-4sl1pXu_b3MwyBTUm96");
  });
});
