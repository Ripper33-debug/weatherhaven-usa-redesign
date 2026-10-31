/**
 * The two contact requests with their own fields: "Engineer Call" (two or three preferred times
 * and a topic) and "CAD Drawings" (formats and intended use). The form and /api/contact-leads both
 * validate with these functions; the server then adds the details to the stored message as a short
 * block, so the lead table and the notification email need no new columns.
 */
export const ENGINEER_CALL = "Engineer Call";
export const CAD_DRAWINGS = "CAD Drawings";

export const CAD_FORMATS = [
  { value: "DWG", hint: "2D layouts for AutoCAD and similar" },
  { value: "STEP", hint: "3D models for CAD software" },
  { value: "PDF", hint: "Dimensioned drawings to print" },
] as const;
export type CadFormat = (typeof CAD_FORMATS)[number]["value"];

/** Time zones offered for a call; the visitor's own zone is added in the form if it isn't here. */
export const CALL_TIME_ZONES: readonly { value: string; label: string }[] = [
  { value: "America/New_York", label: "US Eastern" },
  { value: "America/Chicago", label: "US Central" },
  { value: "America/Denver", label: "US Mountain" },
  { value: "America/Phoenix", label: "Arizona" },
  { value: "America/Los_Angeles", label: "US Pacific" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
  { value: "Europe/London", label: "UK" },
  { value: "Europe/Berlin", label: "Central Europe" },
  { value: "Asia/Tokyo", label: "Japan" },
  { value: "Australia/Perth", label: "Western Australia" },
  { value: "Australia/Sydney", label: "Eastern Australia" },
  { value: "UTC", label: "UTC" },
];

export type CallSlot = { date: string; time: string };
export type EngineerCall = { topic: string; slots: CallSlot[]; timezone: string };
export type CadRequest = { formats: CadFormat[]; use: string; system: string };

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,59}$/;

export function isValidTimeZone(tz: string): boolean {
  if (!tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The date (YYYY-MM-DD) and time (HH:MM) it is now in a time zone. */
export function nowIn(tz: string, now: Date): { date: string; time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

function isRealDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Two or three preferred times, in the future, in a real time zone, plus a topic. */
export function validateEngineerCall(input: unknown, now: Date = new Date()): Result<EngineerCall> {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const topic = str(o.topic);
  if (topic.length < 3) return { ok: false, error: "Say what you'd like to discuss on the call." };
  if (topic.length > 300) return { ok: false, error: "Keep the call topic under 300 characters." };

  const timezone = str(o.timezone);
  if (!isValidTimeZone(timezone)) return { ok: false, error: "Choose a time zone for the call." };

  const raw = Array.isArray(o.slots) ? o.slots : [];
  if (raw.length > 3) return { ok: false, error: "Give up to three preferred times." };
  const filled = raw
    .map((s) => (s && typeof s === "object" ? (s as Record<string, unknown>) : {}))
    .map((s) => ({ date: str(s.date), time: str(s.time) }))
    .filter((s) => s.date || s.time);
  for (const s of filled) {
    if (!s.date || !s.time) return { ok: false, error: "Each preferred time needs a date and a time." };
    if (!isRealDate(s.date) || !TIME_RE.test(s.time)) return { ok: false, error: "Enter dates as YYYY-MM-DD and times as HH:MM." };
  }
  if (filled.length < 2) return { ok: false, error: "Give at least two preferred times, so one is likely to work." };

  const today = nowIn(timezone, now);
  const latest = new Date(now.getTime() + 366 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  for (const s of filled) {
    const past = s.date < today.date || (s.date === today.date && s.time <= today.time);
    if (past) return { ok: false, error: "Preferred times need to be in the future." };
    if (s.date > latest) return { ok: false, error: "Preferred times need to be within the next year." };
  }
  const keys = new Set(filled.map((s) => `${s.date} ${s.time}`));
  if (keys.size !== filled.length) return { ok: false, error: "Give different preferred times." };

  return { ok: true, value: { topic, slots: filled, timezone } };
}

/** At least one format, an intended use and the system the drawings are for. */
export function validateCadRequest(input: unknown, knownSystems?: readonly string[]): Result<CadRequest> {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const system = str(o.system);
  if (!system) return { ok: false, error: "Choose the system you need drawings for." };
  if (!SLUG_RE.test(system) || (knownSystems && !knownSystems.includes(system))) {
    return { ok: false, error: "Choose a system from the list." };
  }

  const allowed = new Set<string>(CAD_FORMATS.map((f) => f.value));
  const list = Array.isArray(o.formats) ? o.formats.map(str) : [];
  if (list.some((f) => !allowed.has(f))) return { ok: false, error: "Formats can be DWG, STEP or PDF." };
  const formats = CAD_FORMATS.map((f) => f.value).filter((f) => list.includes(f));
  if (formats.length === 0) return { ok: false, error: "Choose at least one drawing format." };

  const use = str(o.use);
  if (use.length < 3) return { ok: false, error: "Say what the drawings are for." };
  if (use.length > 500) return { ok: false, error: "Keep the intended use under 500 characters." };

  return { ok: true, value: { formats, use, system } };
}

function zoneLabel(tz: string): string {
  const known = CALL_TIME_ZONES.find((z) => z.value === tz);
  return known ? `${known.label}, ${tz}` : tz;
}

/** "Tue 4 Nov 2026 at 10:00". */
export function formatSlot(slot: CallSlot): string {
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${slot.date}T12:00:00Z`));
  return `${day.replace(",", "")} at ${slot.time}`;
}

export function engineerCallBlock(call: EngineerCall): string {
  return [
    "Engineer call request",
    `Topic: ${call.topic}`,
    `Preferred times (${zoneLabel(call.timezone)}):`,
    ...call.slots.map((s, i) => `${i + 1}. ${formatSlot(s)}`),
  ].join("\n");
}

export function cadRequestBlock(cad: CadRequest, systemName?: string): string {
  return [
    "CAD drawing request",
    `System: ${systemName ?? cad.system}`,
    `Formats: ${cad.formats.join(", ")}`,
    `Intended use: ${cad.use}`,
  ].join("\n");
}
