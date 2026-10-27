import { afterEach, describe, expect, it, vi } from "vitest";

describe("home-video-bands", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses owned TRECC clip for mission band when hero is live", async () => {
    vi.stubEnv("NEXT_PUBLIC_HERO_VIDEO_READY", "true");
    vi.resetModules();
    const { homeMissionBandVideo } = await import("./home-video-bands");
    expect(homeMissionBandVideo()).toEqual({
      src: "/hero/iron-patience.mp4",
      poster: "/products/trecc.jpg",
      label: "Iron patience in the field",
    });
  });

  it("uses Mixkit mission band when owned hero is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_HERO_VIDEO_READY", "false");
    vi.resetModules();
    const { homeMissionBandVideo } = await import("./home-video-bands");
    expect(homeMissionBandVideo().src).toContain("mixkit.co");
  });

  it("hides proof band when owned hero replaces Mixkit placeholders", async () => {
    vi.stubEnv("NEXT_PUBLIC_HERO_VIDEO_READY", "true");
    vi.resetModules();
    const { homeProofBandVideo } = await import("./home-video-bands");
    expect(homeProofBandVideo()).toBeNull();
  });
});
