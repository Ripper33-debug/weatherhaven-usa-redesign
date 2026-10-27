import { describe, expect, it } from "vitest";
import {
  companyEventTypeLabel,
  formatEventDateBadge,
  legacyRowsAsCompanyEvents,
  partitionCompanyEvents,
  relatedNewsSlugsFromEvents,
  slugifyEventTitle,
} from "./company-events";

describe("company-events", () => {
  it("slugifies titles", () => {
    expect(slugifyEventTitle("June Capability Briefing!")).toBe("june-capability-briefing");
  });

  it("labels event types", () => {
    expect(companyEventTypeLabel("capability_briefing")).toBe("Capability briefing");
  });

  it("partitions upcoming, on-demand, and past events", () => {
    const events = legacyRowsAsCompanyEvents();
    const { upcoming, onDemand, past } = partitionCompanyEvents(events, new Date("2026-06-01T12:00:00Z"));
    expect(upcoming.length).toBeGreaterThanOrEqual(2);
    expect(onDemand.length).toBeGreaterThanOrEqual(1);
    expect(past.length).toBe(0);

    const later = partitionCompanyEvents(events, new Date("2026-09-01T12:00:00Z"));
    expect(later.past.length).toBeGreaterThanOrEqual(2);
  });

  it("builds date badges for scheduled events", () => {
    const badge = formatEventDateBadge("2026-06-18T18:00:00.000Z", "America/New_York");
    expect(badge.month).toBeTruthy();
    expect(badge.day).not.toBe("—");
  });

  it("collects related news slugs", () => {
    const slugs = relatedNewsSlugsFromEvents(legacyRowsAsCompanyEvents());
    expect(slugs).toContain("expeditionary-camp-capability-brief");
  });
});
