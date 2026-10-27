import { describe, expect, it } from "vitest";
import {
  chartPointsToSparkline,
  countsByDay,
  lastNDayKeys,
  seriesTrendPercent,
} from "./admin-dashboard-metrics";

describe("admin-dashboard-metrics", () => {
  it("counts items by day", () => {
    const today = lastNDayKeys(1)[0];
    const counts = countsByDay([today, today, `${today}T12:00:00Z`], 7);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(3);
  });

  it("computes trend percent from series halves", () => {
    expect(seriesTrendPercent([1, 1, 1, 1, 4, 4, 4, 4])).toBe(300);
    expect(seriesTrendPercent([0, 0, 0, 0])).toBe(0);
  });

  it("maps chart points to sparkline values", () => {
    expect(chartPointsToSparkline([{ count: 1 }, { count: 5 }, { count: 3 }], 2)).toEqual([5, 3]);
  });
});
