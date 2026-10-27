/** Sparkline + trend helpers for admin overview KPI cards. */

export function lastNDayKeys(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function countsByDay(isoDates: (string | null | undefined)[], days: number): number[] {
  const keys = lastNDayKeys(days);
  const map = new Map(keys.map((k) => [k, 0]));
  for (const iso of isoDates) {
    if (!iso) continue;
    const key = iso.slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return keys.map((k) => map.get(k) ?? 0);
}

/** Percent change: recent half vs earlier half of series. */
export function seriesTrendPercent(values: number[]): number | null {
  if (values.length < 4) return null;
  const mid = Math.floor(values.length / 2);
  const earlier = values.slice(0, mid).reduce((a, b) => a + b, 0);
  const recent = values.slice(mid).reduce((a, b) => a + b, 0);
  if (earlier === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - earlier) / earlier) * 1000) / 10;
}

export function chartPointsToSparkline(points: { count: number }[], take = 14): number[] {
  const slice = points.slice(-take);
  return slice.map((p) => p.count);
}
