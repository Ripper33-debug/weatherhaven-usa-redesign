import { describe, expect, it, vi, afterEach } from "vitest";

describe("hero-media placeholders", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("disables Mixkit placeholders when owned hero is live", async () => {
    vi.stubEnv("NEXT_PUBLIC_HERO_VIDEO_READY", "true");
    vi.resetModules();
    const { PLACEHOLDER_HOME_VIDEOS } = await import("./placeholder-media");
    expect(PLACEHOLDER_HOME_VIDEOS.enabled).toBe(false);
  });

  it("auth playlist is owned-only when hero is live", async () => {
    vi.stubEnv("NEXT_PUBLIC_HERO_VIDEO_READY", "true");
    vi.resetModules();
    const { authHeroPlaylist } = await import("./hero-media");
    expect(authHeroPlaylist()).toEqual([{ src: "/hero/hero.mp4", label: "Weatherhaven shelter" }]);
  });

  it("home hero playlist loops hero, deploy, iron patience, then built for the field", async () => {
    vi.resetModules();
    const { homeHeroPlaylist } = await import("./hero-media");
    expect(homeHeroPlaylist()).toEqual([
      { src: "/hero/hero.mp4", label: "Shelter systems built for anywhere" },
      { src: "/hero/deploy.mp4", label: "Deploy" },
      { src: "/hero/iron-patience.mp4", label: "Iron patience" },
      { src: "/hero/built-for-the-field.mp4", label: "Built for the field" },
    ]);
  });
});
