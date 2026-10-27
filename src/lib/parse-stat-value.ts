/** Parse marketing stat strings like "45+" into count-up target + suffix. */
export function parseStatValue(value: string): { target: number; suffix: string } {
  const m = value.trim().match(/^(\d+)(.*)$/);
  if (!m) return { target: 0, suffix: value };
  return { target: Number(m[1]), suffix: m[2] ?? "" };
}
