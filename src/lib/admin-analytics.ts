import { getPageLabel } from "@/lib/page-labels";
import { fetchRawAdminAnalyticsData } from "@/app/api/_lib/admin-data";

export type AnalyticsSession = {
  id: string;
  user_id: string;
  email: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  entry_page: string | null;
  referrer: string | null;
  user_agent: string | null;
};

export type AnalyticsPageView = {
  id: string;
  user_id: string;
  email: string | null;
  page: string;
  page_title: string | null;
  session_id: string | null;
  visited_at: string;
  time_on_page_seconds: number | null;
};

export type AnalyticsEvent = {
  id: string;
  user_id: string;
  email: string | null;
  event_type: string;
  event_label: string;
  page: string | null;
  session_id: string | null;
  occurred_at: string;
};

export type ClickEvent = {
  id: string;
  user_id: string;
  email: string | null;
  session_id: string | null;
  page: string | null;
  element_type: string | null;
  element_text: string | null;
  element_id: string | null;
  element_class: string | null;
  href: string | null;
  x_position: number | null;
  y_position: number | null;
  clicked_at: string;
};

export type ClickSummary = {
  mostClickedElement: string;
  mostClickedPage: string;
  totalClicksThisSession: number;
  totalClicksAllTime: number;
};

export type TopClickedElement = {
  elementText: string;
  page: string;
  count: number;
};

export type SessionJourney = {
  sessionId: string;
  startedAt: string;
  durationSeconds: number | null;
  entryPage: string | null;
  pages: { page: string; label: string; visitedAt: string; seconds: number | null }[];
};

export type EngagementBreakdownItem = {
  label: string;
  points: number;
  max: number;
};

export type UserAnalyticsDetail = {
  sessions: AnalyticsSession[];
  sessionJourneys: SessionJourney[];
  topPages: { page: string; pageTitle: string; visits: number; avgSeconds: number }[];
  events: AnalyticsEvent[];
  clicks: ClickEvent[];
  clickSummary: ClickSummary;
  engagementBreakdown: EngagementBreakdownItem[];
};

export type UserAccountType = "operator" | "sof" | "platform";

export type UserAnalyticsRow = {
  id: string;
  email: string;
  accountType: UserAccountType;
  createdAt: string;
  lastLogin: string | null;
  lastSeenPage: string | null;
  totalSessions: number;
  totalPageViews: number;
  totalClicks: number;
  avgSessionSeconds: number;
  engagementScore: number;
  detail: UserAnalyticsDetail;
};

export type AdminAnalyticsSummary = {
  totalUsers: number;
  activeToday: number;
  totalPageViews: number;
  totalEvents: number;
  totalClicks: number;
  totalSessions30d: number;
  avgSessionSeconds: number;
  sofMembers: number;
  platformMembers: number;
  operators: number;
};

export type RecentActivityItem = {
  id: string;
  kind: "page_view" | "event" | "click" | "session_start";
  email: string;
  accountType: UserAccountType;
  label: string;
  page: string | null;
  occurredAt: string;
};

export type EventTypeCount = {
  type: string;
  count: number;
};

export type AdminAnalyticsPayload = {
  summary: AdminAnalyticsSummary;
  topClickedElements: TopClickedElement[];
  eventTypeCounts: EventTypeCount[];
  recentActivity: RecentActivityItem[];
  users: UserAnalyticsRow[];
  chartData: AdminChartData;
};

export type ChartDayPoint = {
  date: string;
  label: string;
  count: number;
};

export type TopPageBar = {
  page: string;
  label: string;
  count: number;
  avgSeconds: number;
};

export type AdminChartData = {
  pageViewsByDay: ChartDayPoint[];
  activeUsersByDay: ChartDayPoint[];
  sessionsByDay: ChartDayPoint[];
  clicksByDay: ChartDayPoint[];
  eventsByDay: ChartDayPoint[];
  topPages: TopPageBar[];
};

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDayLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function withinDays(iso: string, days: number): boolean {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(iso).getTime() >= cutoff;
}

export function resolveAccountType(
  email: string | undefined,
  metadata: Record<string, unknown> | undefined,
  adminEmailLower: string | undefined,
): UserAccountType {
  const normalized = email?.trim().toLowerCase();
  if (adminEmailLower && normalized === adminEmailLower) return "operator";
  if (metadata?.sof_approved === true) return "sof";
  return "platform";
}

function countByDay<T>(items: T[], getDay: (item: T) => string, days: string[]): ChartDayPoint[] {
  const counts = new Map<string, number>();
  for (const day of days) counts.set(day, 0);
  for (const item of items) {
    const day = getDay(item);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return days.map((date) => ({
    date,
    label: formatDayLabel(date),
    count: counts.get(date) ?? 0,
  }));
}

export function buildAdminChartData(
  pageViews: AnalyticsPageView[],
  sessions: AnalyticsSession[],
  clicks: ClickEvent[],
  events: AnalyticsEvent[],
): AdminChartData {
  const days = lastNDays(30);
  const userDaySets = new Map<string, Set<string>>();

  for (const day of days) {
    userDaySets.set(day, new Set());
  }

  for (const s of sessions) {
    const day = dayKey(s.started_at);
    if (userDaySets.has(day)) {
      userDaySets.get(day)!.add(s.user_id);
    }
  }

  const pageCounts = new Map<string, { count: number; totalSeconds: number; timed: number }>();
  for (const pv of pageViews) {
    const existing = pageCounts.get(pv.page) ?? { count: 0, totalSeconds: 0, timed: 0 };
    existing.count += 1;
    if (pv.time_on_page_seconds != null) {
      existing.totalSeconds += pv.time_on_page_seconds;
      existing.timed += 1;
    }
    pageCounts.set(pv.page, existing);
  }

  return {
    pageViewsByDay: countByDay(pageViews, (pv) => dayKey(pv.visited_at), days),
    activeUsersByDay: days.map((date) => ({
      date,
      label: formatDayLabel(date),
      count: userDaySets.get(date)?.size ?? 0,
    })),
    sessionsByDay: countByDay(sessions, (s) => dayKey(s.started_at), days),
    clicksByDay: countByDay(clicks, (c) => dayKey(c.clicked_at), days),
    eventsByDay: countByDay(events, (e) => dayKey(e.occurred_at), days),
    topPages: [...pageCounts.entries()]
      .map(([page, v]) => ({
        page,
        label: getPageLabel(page),
        count: v.count,
        avgSeconds: v.timed > 0 ? Math.round(v.totalSeconds / v.timed) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}

function buildClickSummary(userClicks: ClickEvent[], userSessions: AnalyticsSession[]): ClickSummary {
  const latestSessionId = userSessions[0]?.id ?? null;
  const sessionClicks = latestSessionId
    ? userClicks.filter((c) => c.session_id === latestSessionId)
    : [];

  const elementCounts = new Map<string, number>();
  const pageCounts = new Map<string, number>();

  for (const c of userClicks) {
    const label = c.element_text || "(no text)";
    elementCounts.set(label, (elementCounts.get(label) ?? 0) + 1);
    const page = c.page || "—";
    pageCounts.set(page, (pageCounts.get(page) ?? 0) + 1);
  }

  let mostClickedElement = "—";
  let mostClickedPage = "—";
  let maxEl = 0;
  let maxPage = 0;

  for (const [text, count] of elementCounts) {
    if (count > maxEl) {
      maxEl = count;
      mostClickedElement = text;
    }
  }
  for (const [page, count] of pageCounts) {
    if (count > maxPage) {
      maxPage = count;
      mostClickedPage = page;
    }
  }

  return {
    mostClickedElement,
    mostClickedPage,
    totalClicksThisSession: sessionClicks.length,
    totalClicksAllTime: userClicks.length,
  };
}

function buildTopClickedElements(allClicks: ClickEvent[]): TopClickedElement[] {
  const counts = new Map<string, { elementText: string; page: string; count: number }>();

  for (const c of allClicks) {
    const elementText = c.element_text || "(no text)";
    const page = c.page || "—";
    const key = `${elementText}::${page}`;
    const existing = counts.get(key) ?? { elementText, page, count: 0 };
    existing.count += 1;
    counts.set(key, existing);
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 15);
}

export function buildEngagementBreakdown(
  pageViews: AnalyticsPageView[],
  sessions: AnalyticsSession[],
  events: AnalyticsEvent[],
): EngagementBreakdownItem[] {
  const uniquePages = new Set(pageViews.map((p) => p.page)).size;
  const pagesScore = Math.min(uniquePages * 10, 60);

  const recentSessions = sessions.filter((s) => withinDays(s.started_at, 30)).length;
  const sessionScore = Math.min(recentSessions * 5, 20);

  const requestAccessClick = events.some((e) => e.event_label === "Request Access button");
  const requestScore = requestAccessClick ? 10 : 0;

  const missionBuilderVisit = pageViews.some((p) => p.page.includes("/mission-solution-builder"));
  const missionScore = missionBuilderVisit ? 10 : 0;

  return [
    { label: "Unique pages visited", points: pagesScore, max: 60 },
    { label: "Sessions (30d)", points: sessionScore, max: 20 },
    { label: "Request access intent", points: requestScore, max: 10 },
    { label: "Mission builder visit", points: missionScore, max: 10 },
  ];
}

export function computeEngagementScore(breakdown: EngagementBreakdownItem[]): number {
  return Math.min(100, breakdown.reduce((sum, item) => sum + item.points, 0));
}

function buildTopPages(pageViews: AnalyticsPageView[]) {
  const byPage = new Map<string, { title: string; visits: number; totalSeconds: number; counted: number }>();

  for (const pv of pageViews) {
    const existing = byPage.get(pv.page) ?? {
      title: pv.page_title ?? pv.page,
      visits: 0,
      totalSeconds: 0,
      counted: 0,
    };
    existing.visits += 1;
    if (pv.time_on_page_seconds != null) {
      existing.totalSeconds += pv.time_on_page_seconds;
      existing.counted += 1;
    }
    byPage.set(pv.page, existing);
  }

  return [...byPage.entries()]
    .map(([page, v]) => ({
      page,
      pageTitle: v.title,
      visits: v.visits,
      avgSeconds: v.counted > 0 ? Math.round(v.totalSeconds / v.counted) : 0,
    }))
    .sort((a, b) => b.visits - a.visits);
}

export function buildSessionJourneys(
  sessions: AnalyticsSession[],
  pageViews: AnalyticsPageView[],
  limit = 5,
): SessionJourney[] {
  return sessions.slice(0, limit).map((session) => {
    const pages = pageViews
      .filter((pv) => pv.session_id === session.id)
      .sort((a, b) => new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime())
      .map((pv) => ({
        page: pv.page,
        label: getPageLabel(pv.page),
        visitedAt: pv.visited_at,
        seconds: pv.time_on_page_seconds,
      }));

    return {
      sessionId: session.id,
      startedAt: session.started_at,
      durationSeconds: session.duration_seconds,
      entryPage: session.entry_page,
      pages,
    };
  });
}

function averageSessionSeconds(sessions: AnalyticsSession[]): number {
  const completed = sessions.filter((s) => s.duration_seconds != null && s.duration_seconds > 0);
  if (completed.length === 0) return 0;
  const total = completed.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0);
  return Math.round(total / completed.length);
}

export function buildEventTypeCounts(events: AnalyticsEvent[]): EventTypeCount[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    const key = e.event_type || "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildRecentActivity(
  authUsers: { id: string; email?: string; user_metadata?: Record<string, unknown> }[],
  pageViews: AnalyticsPageView[],
  events: AnalyticsEvent[],
  clicks: ClickEvent[],
  sessions: AnalyticsSession[],
  adminEmailLower: string | undefined,
  limit = 50,
): RecentActivityItem[] {
  const typeByUser = new Map<string, UserAccountType>();
  for (const u of authUsers) {
    typeByUser.set(u.id, resolveAccountType(u.email, u.user_metadata, adminEmailLower));
  }

  const emailByUser = new Map(authUsers.map((u) => [u.id, u.email ?? "—"]));

  const items: RecentActivityItem[] = [
    ...pageViews.map((pv) => ({
      id: `pv-${pv.id}`,
      kind: "page_view" as const,
      email: pv.email ?? emailByUser.get(pv.user_id) ?? "—",
      accountType: typeByUser.get(pv.user_id) ?? "platform",
      label: `Viewed ${getPageLabel(pv.page)}`,
      page: pv.page,
      occurredAt: pv.visited_at,
    })),
    ...events.map((e) => ({
      id: `ev-${e.id}`,
      kind: "event" as const,
      email: e.email ?? emailByUser.get(e.user_id) ?? "—",
      accountType: typeByUser.get(e.user_id) ?? "platform",
      label: `${e.event_type}: ${e.event_label}`,
      page: e.page,
      occurredAt: e.occurred_at,
    })),
    ...clicks.map((c) => ({
      id: `cl-${c.id}`,
      kind: "click" as const,
      email: c.email ?? emailByUser.get(c.user_id) ?? "—",
      accountType: typeByUser.get(c.user_id) ?? "platform",
      label: `Clicked "${c.element_text ?? "(no text)"}"`,
      page: c.page,
      occurredAt: c.clicked_at,
    })),
    ...sessions.map((s) => ({
      id: `ss-${s.id}`,
      kind: "session_start" as const,
      email: s.email ?? emailByUser.get(s.user_id) ?? "—",
      accountType: typeByUser.get(s.user_id) ?? "platform",
      label: `Session started${s.entry_page ? ` on ${getPageLabel(s.entry_page)}` : ""}`,
      page: s.entry_page,
      occurredAt: s.started_at,
    })),
  ];

  return items
    .filter((item) => withinDays(item.occurredAt, 14))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);
}

export async function fetchAdminAnalytics(adminEmail?: string): Promise<AdminAnalyticsPayload> {
  const [{ data: authData }, { data: sessions }, { data: pageViews }, { data: events }, { data: clicks }] =
    await fetchRawAdminAnalyticsData();

  const allSessions = (sessions ?? []) as AnalyticsSession[];
  const allPageViews = (pageViews ?? []) as AnalyticsPageView[];
  const allEvents = (events ?? []) as AnalyticsEvent[];
  const allClicks = (clicks ?? []) as ClickEvent[];
  const authUsers = authData?.users ?? [];
  const adminEmailLower = adminEmail?.trim().toLowerCase();

  const sessions30d = allSessions.filter((s) => withinDays(s.started_at, 30));

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const activeUserIds = new Set<string>();

  for (const s of allSessions) {
    if (new Date(s.started_at).getTime() >= oneDayAgo) {
      activeUserIds.add(s.user_id);
    }
  }
  for (const u of authUsers) {
    if (u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() >= oneDayAgo) {
      activeUserIds.add(u.id);
    }
  }

  let sofMembers = 0;
  let platformMembers = 0;
  let operators = 0;

  const users: UserAnalyticsRow[] = authUsers.map((u) => {
    const accountType = resolveAccountType(u.email, u.user_metadata, adminEmailLower);
    if (accountType === "sof") sofMembers += 1;
    else if (accountType === "operator") operators += 1;
    else platformMembers += 1;

    const userSessions = allSessions.filter((s) => s.user_id === u.id);
    const userPageViews = allPageViews.filter((p) => p.user_id === u.id);
    const userEvents = allEvents.filter((e) => e.user_id === u.id);
    const userClicks = allClicks.filter((c) => c.user_id === u.id);

    const lastSession = userSessions[0];
    const lastLogin = u.last_sign_in_at ?? lastSession?.started_at ?? null;
    const lastSeenPage = userPageViews[0]?.page ?? null;
    const engagementBreakdown = buildEngagementBreakdown(userPageViews, userSessions, userEvents);

    return {
      id: u.id,
      email: u.email ?? "—",
      accountType,
      createdAt: u.created_at ?? "",
      lastLogin,
      lastSeenPage,
      totalSessions: userSessions.length,
      totalPageViews: userPageViews.length,
      totalClicks: userClicks.length,
      avgSessionSeconds: averageSessionSeconds(userSessions),
      engagementScore: computeEngagementScore(engagementBreakdown),
      detail: {
        sessions: userSessions.slice(0, 10),
        sessionJourneys: buildSessionJourneys(userSessions, userPageViews, 5),
        topPages: buildTopPages(userPageViews),
        events: userEvents.slice(0, 50),
        clicks: userClicks.slice(0, 50),
        clickSummary: buildClickSummary(userClicks, userSessions),
        engagementBreakdown,
      },
    };
  });

  users.sort((a, b) => b.engagementScore - a.engagementScore);

  return {
    summary: {
      totalUsers: authUsers.length,
      activeToday: activeUserIds.size,
      totalPageViews: allPageViews.length,
      totalEvents: allEvents.length,
      totalClicks: allClicks.length,
      totalSessions30d: sessions30d.length,
      avgSessionSeconds: averageSessionSeconds(sessions30d),
      sofMembers,
      platformMembers,
      operators,
    },
    topClickedElements: buildTopClickedElements(allClicks),
    eventTypeCounts: buildEventTypeCounts(allEvents),
    recentActivity: buildRecentActivity(
      authUsers,
      allPageViews,
      allEvents,
      allClicks,
      allSessions,
      adminEmailLower,
    ),
    users,
    chartData: buildAdminChartData(allPageViews, allSessions, allClicks, allEvents),
  };
}
