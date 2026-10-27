import type { UserAnalyticsRow } from "@/lib/admin-analytics";
import { getPageLabel } from "@/lib/page-labels";

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatClickTime(iso: string) {
  try {
    const d = new Date(iso);
    return {
      time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    };
  } catch {
    return { time: iso, date: "" };
  }
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function ElementTypeBadge({ type }: { type: string | null }) {
  return (
    <span className="inline-block border border-[rgba(255,255,255,0.12)] px-2 py-0.5 text-[11px] text-[#8a9099]">
      {type ?? "—"}
    </span>
  );
}

export function UserExpandedDetail({ user }: { user: UserAnalyticsRow }) {
  const { clickSummary, engagementBreakdown, sessionJourneys } = user.detail;

  return (
    <div className="bg-[#0d0f12] px-4 py-8 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="wh-marketing-panel p-4">
          <p className="text-xs text-[#8a9099]">Account type</p>
          <p className="mt-1 text-sm capitalize text-white">{user.accountType}</p>
        </div>
        <div className="wh-marketing-panel p-4">
          <p className="text-xs text-[#8a9099]">Avg session</p>
          <p className="mt-1 text-sm text-white">{formatDuration(user.avgSessionSeconds)}</p>
        </div>
        <div className="wh-marketing-panel p-4">
          <p className="text-xs text-[#8a9099]">Total clicks</p>
          <p className="mt-1 text-sm tabular-nums text-white">{user.totalClicks}</p>
        </div>
        <div className="wh-marketing-panel p-4">
          <p className="text-xs text-[#8a9099]">Last page</p>
          <p className="mt-1 truncate text-sm text-white">
            {user.lastSeenPage ? getPageLabel(user.lastSeenPage) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <p className="wh-label">Engagement score breakdown</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {engagementBreakdown.map((item) => (
            <div key={item.label} className="wh-marketing-panel p-4">
              <p className="text-xs text-[#8a9099]">{item.label}</p>
              <p className="mt-2 text-sm tabular-nums text-white">
                {item.points}/{item.max}
              </p>
              <div className="mt-2 h-1.5 bg-[#080a0c]">
                <div
                  className="h-full bg-[#4d9fff]"
                  style={{ width: `${item.max > 0 ? (item.points / item.max) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div>
          <p className="wh-label">Session history</p>
          <ul className="mt-4 space-y-3">
            {user.detail.sessions.length === 0 ? (
              <li className="text-sm text-[#8a9099]">No sessions recorded.</li>
            ) : (
              user.detail.sessions.map((s) => (
                <li key={s.id} className="border-b border-[rgba(255,255,255,0.06)] pb-3 text-sm last:border-0">
                  <p className="text-white">{formatDateTime(s.started_at)}</p>
                  <p className="mt-1 text-[#8a9099]">Duration: {formatDuration(s.duration_seconds)}</p>
                  {s.entry_page ? (
                    <p className="mt-1 text-xs text-[#8a9099]">Entry: {getPageLabel(s.entry_page)}</p>
                  ) : null}
                  {s.referrer ? <p className="mt-1 truncate text-xs text-[#8a9099]">Referrer: {s.referrer}</p> : null}
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <p className="wh-label">Top pages visited</p>
          <ul className="mt-4 space-y-3">
            {user.detail.topPages.length === 0 ? (
              <li className="text-sm text-[#8a9099]">No page views recorded.</li>
            ) : (
              user.detail.topPages.map((p) => (
                <li key={p.page} className="border-b border-[rgba(255,255,255,0.06)] pb-3 text-sm last:border-0">
                  <p className="text-white">{p.pageTitle || p.page}</p>
                  <p className="mt-1 text-[#8a9099]">
                    {p.visits} visits · avg {p.avgSeconds}s on page
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <p className="wh-label">Actions taken</p>
          <ul className="mt-4 max-h-[320px] space-y-3 overflow-y-auto">
            {user.detail.events.length === 0 ? (
              <li className="text-sm text-[#8a9099]">No events recorded.</li>
            ) : (
              user.detail.events.map((e) => (
                <li key={e.id} className="border-b border-[rgba(255,255,255,0.06)] pb-3 text-sm last:border-0">
                  <p className="text-white">{e.event_label}</p>
                  <p className="mt-1 text-[#8a9099]">
                    {e.event_type} · {e.page ?? "—"} · {formatDateTime(e.occurred_at)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-[rgba(255,255,255,0.08)] pt-10">
        <p className="wh-label">Session journeys</p>
        <p className="mt-2 text-xs text-[#8a9099]">Page path for recent sessions (in visit order)</p>
        <div className="mt-4 space-y-4">
          {sessionJourneys.length === 0 ? (
            <p className="text-sm text-[#8a9099]">No journeys recorded.</p>
          ) : (
            sessionJourneys.map((journey) => (
              <div key={journey.sessionId} className="wh-marketing-panel p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-white">{formatDateTime(journey.startedAt)}</p>
                  <p className="text-xs text-[#8a9099]">{formatDuration(journey.durationSeconds)}</p>
                </div>
                {journey.pages.length === 0 ? (
                  <p className="mt-3 text-sm text-[#8a9099]">No page views in this session.</p>
                ) : (
                  <ol className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    {journey.pages.map((page, index) => (
                      <li key={`${journey.sessionId}-${page.page}-${index}`} className="flex items-center gap-2">
                        {index > 0 ? <span className="text-[#8a9099]">→</span> : null}
                        <span className="rounded border border-white/10 px-2 py-1 text-white">{page.label}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-10 border-t border-[rgba(255,255,255,0.08)] pt-10">
        <p className="wh-label">Click summary</p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-[#8a9099]">Most clicked element</dt>
            <dd className="mt-1 text-sm text-white">{clickSummary.mostClickedElement}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8a9099]">Most clicked page</dt>
            <dd className="mt-1 text-sm text-[#4d9fff]">{clickSummary.mostClickedPage}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8a9099]">Clicks this session</dt>
            <dd className="mt-1 text-sm tabular-nums text-white">{clickSummary.totalClicksThisSession}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8a9099]">Clicks all time</dt>
            <dd className="mt-1 text-sm tabular-nums text-white">{clickSummary.totalClicksAllTime}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 border-t border-[rgba(255,255,255,0.08)] pt-10">
        <p className="wh-label">Click activity</p>
        <p className="mt-2 text-xs text-[#8a9099]">Last 50 clicks</p>
        <ul className="mt-4 max-h-[480px] overflow-y-auto">
          {user.detail.clicks.length === 0 ? (
            <li className="py-3 text-sm text-[#8a9099]">No clicks recorded.</li>
          ) : (
            user.detail.clicks.map((c) => {
              const { time, date } = formatClickTime(c.clicked_at);
              return (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 border-b border-[rgba(255,255,255,0.04)] py-3 last:border-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4"
                >
                  <span className="shrink-0 text-xs text-[#8a9099]">
                    {time}
                    {date ? ` · ${date}` : ""}
                  </span>
                  <span className="shrink-0 text-sm text-[#4d9fff]">{c.page ?? "—"}</span>
                  <span className="min-w-0 flex-1 text-sm text-white">&quot;{c.element_text ?? "(no text)"}&quot;</span>
                  <ElementTypeBadge type={c.element_type} />
                  {c.href ? (
                    <span className="w-full text-xs text-[#8a9099] sm:w-auto">→ {c.href}</span>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
