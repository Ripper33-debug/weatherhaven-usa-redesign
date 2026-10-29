import { describe, expect, it } from "vitest";
import { TOUR_STOPS } from "@/lib/map-tour";
import { DEPLOYMENT_STORIES, FIELD_NOTES } from "@/lib/field-stories";

describe("map tour", () => {
  it("visits each documented place once, with a source for every stop", () => {
    expect(TOUR_STOPS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(TOUR_STOPS.map((s) => s.id)).size).toBe(TOUR_STOPS.length);
    for (const s of TOUR_STOPS) {
      expect(s.sources.length, s.id).toBeGreaterThan(0);
      for (const src of s.sources) expect(src.href, s.id).toMatch(/^https:\/\//);
      expect(Math.abs(s.lat), s.id).toBeLessThanOrEqual(90);
      expect(Math.abs(s.lng), s.id).toBeLessThanOrEqual(180);
    }
  });

  it("uses the story's own title, figures, systems and sources", () => {
    for (const stop of TOUR_STOPS) {
      const story = DEPLOYMENT_STORIES.find((s) => s.id === stop.id);
      if (!story) continue;
      expect(stop.title).toBe(story.title);
      // Two of the story's own figures, in the story's order.
      expect(stop.figures.length).toBeLessThanOrEqual(2);
      const at = stop.figures.map((f) => story.figures.indexOf(f));
      expect(at.every((i) => i >= 0)).toBe(true);
      expect([...at].sort()).toEqual(at);
      expect(stop.systems).toEqual(story.systems);
      expect(stop.sources).toEqual(story.sources);
      expect(stop.attribution).toBe(story.attribution);
      expect(stop.more).toBe(`/deployments#${story.id}`);
    }
  });

  it("only restates the story: every number in a summary is in the story", () => {
    for (const stop of TOUR_STOPS) {
      const story = DEPLOYMENT_STORIES.find((s) => s.id === stop.id);
      const note = FIELD_NOTES.find((n) => n.text === stop.line);
      if (!story) {
        // Field notes are shown word for word.
        expect(note, stop.id).toBeDefined();
        continue;
      }
      const text = [...story.body, ...story.figures.map((f) => `${f.value} ${f.label}`), story.title].join(" ");
      const numbers = stop.line.match(/\d[\d,.]*/g) ?? [];
      for (const n of numbers) expect(text, `${stop.id}: ${n}`).toContain(n.replace(/[.,]$/, ""));
    }
  });

  it("marks the published coordinates of the research sites", () => {
    const at = (id: string) => TOUR_STOPS.find((s) => s.id === id)!;
    expect(at("beyond-epica").lat).toBeCloseTo(-75.299, 2);
    expect(at("beyond-epica").lng).toBeCloseTo(122.445, 2);
    expect(at("nasa-endurance").lat).toBeCloseTo(-77.72, 2);
    expect(at("mount-brown-south").lng).toBeCloseTo(86.312, 2);
  });

  it("shows no local weather for stops that only name a country or an unpublished site", () => {
    const areas = TOUR_STOPS.filter((s) => s.area).map((s) => s.id);
    expect(areas).toEqual(expect.arrayContaining(["hqss", "ukraine", "quellaveco"]));
    expect(TOUR_STOPS.find((s) => s.id === "beyond-epica")?.area).toBeFalsy();
  });
});
