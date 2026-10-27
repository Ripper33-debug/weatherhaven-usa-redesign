import { describe, expect, it } from "vitest";
import {
  buildAdminChartData,
  buildEngagementBreakdown,
  buildEventTypeCounts,
  buildSessionJourneys,
  computeEngagementScore,
  resolveAccountType,
} from "./admin-analytics";

describe("admin-analytics", () => {
  it("resolves account types", () => {
    expect(resolveAccountType("ops@example.com", {}, "ops@example.com")).toBe("operator");
    expect(resolveAccountType("sof@example.com", { sof_approved: true }, "ops@example.com")).toBe("sof");
    expect(resolveAccountType("user@example.com", {}, "ops@example.com")).toBe("platform");
  });

  it("builds engagement breakdown and score", () => {
    const breakdown = buildEngagementBreakdown(
      [
        {
          id: "1",
          user_id: "u1",
          email: "u@example.com",
          page: "/mission-solution-builder",
          page_title: "Mission",
          session_id: "s1",
          visited_at: new Date().toISOString(),
          time_on_page_seconds: 30,
        },
      ],
      [
        {
          id: "s1",
          user_id: "u1",
          email: "u@example.com",
          started_at: new Date().toISOString(),
          ended_at: null,
          duration_seconds: 120,
          entry_page: "/",
          referrer: null,
          user_agent: null,
        },
      ],
      [{ id: "e1", user_id: "u1", email: "u@example.com", event_type: "click", event_label: "Request Access button", page: "/", session_id: "s1", occurred_at: new Date().toISOString() }],
    );

    expect(breakdown).toHaveLength(4);
    expect(computeEngagementScore(breakdown)).toBeGreaterThan(0);
  });

  it("builds session journeys in visit order", () => {
    const journeys = buildSessionJourneys(
      [
        {
          id: "s1",
          user_id: "u1",
          email: "u@example.com",
          started_at: "2026-05-01T10:00:00Z",
          ended_at: null,
          duration_seconds: 90,
          entry_page: "/",
          referrer: null,
          user_agent: null,
        },
      ],
      [
        {
          id: "p2",
          user_id: "u1",
          email: "u@example.com",
          page: "/contact",
          page_title: "Contact",
          session_id: "s1",
          visited_at: "2026-05-01T10:05:00Z",
          time_on_page_seconds: 20,
        },
        {
          id: "p1",
          user_id: "u1",
          email: "u@example.com",
          page: "/",
          page_title: "Home",
          session_id: "s1",
          visited_at: "2026-05-01T10:00:00Z",
          time_on_page_seconds: 40,
        },
      ],
      1,
    );

    expect(journeys[0]?.pages.map((p) => p.page)).toEqual(["/", "/contact"]);
  });

  it("aggregates chart data by day", () => {
    const chart = buildAdminChartData(
      [
        {
          id: "pv1",
          user_id: "u1",
          email: "u@example.com",
          page: "/",
          page_title: "Home",
          session_id: "s1",
          visited_at: "2026-05-28T12:00:00Z",
          time_on_page_seconds: 15,
        },
      ],
      [
        {
          id: "s1",
          user_id: "u1",
          email: "u@example.com",
          started_at: "2026-05-28T12:00:00Z",
          ended_at: null,
          duration_seconds: 60,
          entry_page: "/",
          referrer: null,
          user_agent: null,
        },
      ],
      [
        {
          id: "c1",
          user_id: "u1",
          email: "u@example.com",
          session_id: "s1",
          page: "/",
          element_type: "button",
          element_text: "Contact",
          element_id: null,
          element_class: null,
          href: "/contact",
          x_position: 1,
          y_position: 2,
          clicked_at: "2026-05-28T12:01:00Z",
        },
      ],
      [
        {
          id: "e1",
          user_id: "u1",
          email: "u@example.com",
          event_type: "click",
          event_label: "View Capabilities",
          page: "/",
          session_id: "s1",
          occurred_at: "2026-05-28T12:02:00Z",
        },
      ],
    );

    expect(chart.pageViewsByDay).toHaveLength(30);
    expect(chart.sessionsByDay).toHaveLength(30);
    expect(chart.clicksByDay).toHaveLength(30);
    expect(chart.eventsByDay).toHaveLength(30);
    expect(chart.topPages[0]?.page).toBe("/");
  });

  it("counts events by type", () => {
    expect(
      buildEventTypeCounts([
        {
          id: "1",
          user_id: "u",
          email: "u@example.com",
          event_type: "click",
          event_label: "A",
          page: "/",
          session_id: null,
          occurred_at: "2026-05-28T12:00:00Z",
        },
        {
          id: "2",
          user_id: "u",
          email: "u@example.com",
          event_type: "view",
          event_label: "B",
          page: "/",
          session_id: null,
          occurred_at: "2026-05-28T12:01:00Z",
        },
      ]),
    ).toEqual([
      { type: "click", count: 1 },
      { type: "view", count: 1 },
    ]);
  });
});
