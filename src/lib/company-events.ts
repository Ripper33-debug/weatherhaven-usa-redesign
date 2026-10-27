/** Fallback events when DB is unavailable or migration not yet run. */
export const LEGACY_COMPANY_EVENTS = [
  {
    slug: "expeditionary-camp-briefing-june-2026",
    title: "Expeditionary camp capability briefing",
    summary:
      "Virtual technical exchange for program offices evaluating redeployable camp solutions — mission type, environment, mobility, and indicative footprints.",
    event_type: "capability_briefing" as const,
    schedule_type: "scheduled" as const,
    starts_at: "2026-06-18T18:00:00.000Z",
    ends_at: "2026-06-18T19:30:00.000Z",
    timezone: "America/New_York",
    location: "Virtual — Microsoft Teams",
    registration_url: null as string | null,
    related_news_slug: "expeditionary-camp-capability-brief",
    cover_image_url:
      "https://eiec269001.blob.core.windows.net/site-content/expandablecontainer1.jpg",
    status: "published" as const,
  },
  {
    slug: "mission-builder-walkthrough-july-2026",
    title: "Mission Solution Builder walkthrough",
    summary:
      "Live demo of indicative camp planning — inputs, layout zones, parts list, and PDF export for procurement packages.",
    event_type: "webinar" as const,
    schedule_type: "scheduled" as const,
    starts_at: "2026-07-09T15:00:00.000Z",
    ends_at: "2026-07-09T16:00:00.000Z",
    timezone: "America/New_York",
    location: "Virtual — Microsoft Teams",
    registration_url: null,
    related_news_slug: "mission-solution-builder-launch",
    cover_image_url: "https://eiec269001.blob.core.windows.net/site-content/softshelter6.jpg",
    status: "published" as const,
  },
  {
    slug: "camp-planning-office-hours",
    title: "Camp planning office hours",
    summary:
      "Recurring virtual sessions for stakeholders using the Mission Solution Builder — schedule via Contact.",
    event_type: "capability_briefing" as const,
    schedule_type: "on_demand" as const,
    starts_at: null as string | null,
    ends_at: null,
    timezone: "America/New_York",
    location: "Virtual — schedule via Contact",
    registration_url: null,
    related_news_slug: "mission-solution-builder-launch",
    cover_image_url: "https://eiec269001.blob.core.windows.net/site-content/softshelter6.jpg",
    status: "published" as const,
  },
] as const;

export type CompanyEventType =
  | "capability_briefing"
  | "trade_show"
  | "webinar"
  | "program_meeting";

export type CompanyEventScheduleType = "scheduled" | "on_demand";

export type CompanyEventStatus = "draft" | "published";

export type CompanyEventRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  event_type: string;
  schedule_type: string;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string | null;
  location: string | null;
  registration_url: string | null;
  related_news_slug: string | null;
  cover_image_url: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
};

export type CompanyEventInsert = {
  slug: string;
  title: string;
  summary?: string | null;
  event_type?: CompanyEventType;
  schedule_type?: CompanyEventScheduleType;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string | null;
  location?: string | null;
  registration_url?: string | null;
  related_news_slug?: string | null;
  cover_image_url?: string | null;
  status?: CompanyEventStatus;
};

export const COMPANY_EVENT_TYPE_LABELS: Record<CompanyEventType, string> = {
  capability_briefing: "Capability briefing",
  trade_show: "Trade show",
  webinar: "Webinar",
  program_meeting: "Program meeting",
};

export function companyEventTypeLabel(type: string): string {
  return COMPANY_EVENT_TYPE_LABELS[type as CompanyEventType] ?? "Event";
}

export function slugifyEventTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base.length >= 2 ? base : "event";
}

export function legacyRowsAsCompanyEvents(): CompanyEventRow[] {
  return LEGACY_COMPANY_EVENTS.map((row, index) => ({
    id: `legacy-event-${index}`,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    event_type: row.event_type,
    schedule_type: row.schedule_type,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    timezone: row.timezone,
    location: row.location,
    registration_url: row.registration_url,
    related_news_slug: row.related_news_slug,
    cover_image_url: row.cover_image_url,
    status: row.status,
    created_at: row.starts_at,
    updated_at: row.starts_at,
  }));
}

export function formatEventDate(iso: string | null | undefined, timezone?: string | null): string {
  if (!iso) return "On request";
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone?.trim() || "America/New_York",
    });
  } catch {
    return iso;
  }
}

export function formatEventDateBadge(iso: string | null | undefined, timezone?: string | null): {
  month: string;
  day: string;
  weekday: string;
} {
  if (!iso) {
    return { month: "TBD", day: "—", weekday: "On request" };
  }
  try {
    const d = new Date(iso);
    return {
      month: d.toLocaleString("en-US", { month: "short", timeZone: timezone?.trim() || "America/New_York" }),
      day: d.toLocaleString("en-US", { day: "numeric", timeZone: timezone?.trim() || "America/New_York" }),
      weekday: d.toLocaleString("en-US", { weekday: "short", timeZone: timezone?.trim() || "America/New_York" }),
    };
  } catch {
    return { month: "TBD", day: "—", weekday: "Event" };
  }
}

export function partitionCompanyEvents(events: CompanyEventRow[], now = new Date()) {
  const upcoming: CompanyEventRow[] = [];
  const onDemand: CompanyEventRow[] = [];
  const past: CompanyEventRow[] = [];

  for (const event of events) {
    if (event.schedule_type === "on_demand") {
      onDemand.push(event);
      continue;
    }
    if (!event.starts_at) {
      onDemand.push(event);
      continue;
    }
    const start = new Date(event.starts_at);
    if (Number.isNaN(start.getTime())) {
      onDemand.push(event);
      continue;
    }
    if (start >= now) upcoming.push(event);
    else past.push(event);
  }

  upcoming.sort(
    (a, b) => new Date(a.starts_at ?? 0).getTime() - new Date(b.starts_at ?? 0).getTime(),
  );
  past.sort(
    (a, b) => new Date(b.starts_at ?? 0).getTime() - new Date(a.starts_at ?? 0).getTime(),
  );
  onDemand.sort((a, b) => a.title.localeCompare(b.title));

  return { upcoming, onDemand, past };
}

export function relatedNewsSlugsFromEvents(events: CompanyEventRow[]): string[] {
  const slugs = new Set<string>();
  for (const event of events) {
    const slug = event.related_news_slug?.trim();
    if (slug) slugs.add(slug);
  }
  return [...slugs];
}
