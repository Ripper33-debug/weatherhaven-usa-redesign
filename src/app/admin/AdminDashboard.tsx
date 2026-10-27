"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminDeleteUser, type AdminUserRow } from "./actions";
import type { AdminAnalyticsPayload, UserAnalyticsRow } from "@/lib/admin-analytics";
import type { InviteRow } from "@/lib/invites";
import { AdminCharts } from "./components/AdminCharts";
import { EngagementBar } from "./components/EngagementBar";
import { InvitesTable } from "./components/InvitesTable";
import { SiteClickSummary } from "./components/SiteClickSummary";
import { AdminRecentActivity } from "./components/AdminRecentActivity";
import { AdminEventBreakdown } from "./components/AdminEventBreakdown";
import { UserExpandedDetail } from "./components/UserExpandedDetail";
import { AccessRequestsTable } from "./components/AccessRequestsTable";
import { ContactLeadsTable } from "./components/ContactLeadsTable";
import { AdminOperatorPasswordCard, PlatformUsersTable } from "./components/PlatformUsersTable";
import type { AccessRequestRow } from "@/lib/accessRequests";
import type { ContactLeadRow } from "@/lib/contactLeads";
import { AdminEmailGuide } from "./components/AdminEmailGuide";
import { AdminAuditLog } from "./components/AdminAuditLog";
import type { AdminEventRow } from "@/lib/admin-event-labels";
import type { LeadQualitySummary } from "@/lib/lead-quality";
import type { UnifiedLead } from "@/lib/lead-management";
import type { LeadNoteRow } from "@/lib/leadProfiles";
import type { CatalogProductRow } from "@/lib/catalog-products";
import type { EmailSetupSnapshot } from "@/lib/email-sender";
import type { DeploymentStoryCmsRow } from "@/lib/deployment-stories";
import type { NewsReleaseRow } from "@/lib/news-releases";
import type { CompanyEventRow } from "@/lib/company-events";
import { AdminOverviewPanel } from "./components/AdminOverviewPanel";
import { AdminShell } from "./components/AdminShell";
import type { AdminNavTab } from "./components/AdminSidebar";
import { LeadDetailView } from "./components/LeadDetailView";
import { LeadPipelineTable } from "./components/LeadPipelineTable";
import { NewsReleasesAdmin } from "./components/NewsReleasesAdmin";
import { EventsAdmin } from "./components/EventsAdmin";
import { DeploymentStoriesAdmin } from "./components/DeploymentStoriesAdmin";
import { ProductsAdmin } from "./components/ProductsAdmin";
import {
  AdminBanner,
  AdminEmpty,
  AdminKpiCard,
  AdminSection,
  AdminTableShell,
  adminBtnGhost,
} from "./components/admin-ui";

const EMPTY_CLICK_SUMMARY = {
  mostClickedElement: "—",
  mostClickedPage: "—",
  totalClicksThisSession: 0,
  totalClicksAllTime: 0,
} as const;

const VALID_TABS = new Set<AdminNavTab>([
  "overview",
  "pipeline",
  "leads",
  "access",
  "invites",
  "accounts",
  "analytics",
  "news",
  "events",
  "products",
  "deployments",
]);

function tabFromParam(value: string | null): AdminNavTab {
  if (value && VALID_TABS.has(value as AdminNavTab)) return value as AdminNavTab;
  return "overview";
}

function formatDurationShort(seconds: number) {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function accountTypeLabel(type: UserAnalyticsRow["accountType"]) {
  if (type === "operator") return "Operator";
  if (type === "sof") return "SOF";
  return "Platform";
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

function countPendingAccess(requests: AccessRequestRow[]) {
  return requests.filter((r) => (r.status ?? "pending").toLowerCase() === "pending").length;
}

function countNewLeads(leads: ContactLeadRow[]) {
  return leads.filter((l) => {
    const s = (l.status ?? "new").toLowerCase();
    return s === "new" || s === "";
  }).length;
}

export function AdminDashboard({
  analytics,
  initialAuthUsers,
  accessRequests,
  contactLeads,
  invites,
  adminEmail,
  operatorEmail,
  isOperatorSession,
  leadQuality,
  adminEvents,
  unifiedLeads,
  leadNotes,
  newsReleases,
  newsSetup,
  companyEvents,
  eventsSetup,
  catalogProducts,
  catalogSetup,
  deploymentStories,
  deploymentStoriesSetup,
  emailSetup,
}: {
  analytics: AdminAnalyticsPayload;
  initialAuthUsers: AdminUserRow[];
  accessRequests: AccessRequestRow[];
  contactLeads: ContactLeadRow[];
  invites: InviteRow[];
  adminEmail: string;
  operatorEmail: string | undefined;
  isOperatorSession: boolean;
  leadQuality: LeadQualitySummary;
  adminEvents: AdminEventRow[];
  unifiedLeads: UnifiedLead[];
  leadNotes: LeadNoteRow[];
  newsReleases: NewsReleaseRow[];
  newsSetup: { ready: boolean; message?: string };
  companyEvents: CompanyEventRow[];
  eventsSetup: { ready: boolean; message?: string };
  catalogProducts: CatalogProductRow[];
  catalogSetup: { ready: boolean; message?: string };
  deploymentStories: DeploymentStoryCmsRow[];
  deploymentStoriesSetup: { ready: boolean; message?: string };
  emailSetup: EmailSetupSnapshot;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = tabFromParam(searchParams.get("tab"));
  const selectedLeadEmail = searchParams.get("lead")?.trim().toLowerCase() ?? null;
  const setTab = (id: AdminNavTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    params.delete("lead");
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  };
  const [users, setUsers] = useState(initialAuthUsers);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const pendingAccess = countPendingAccess(accessRequests);
  const newLeads = countNewLeads(contactLeads);
  const pendingInvites = invites.filter((i) => i.status === "pending").length;
  const pipelineAttention = unifiedLeads.filter(
    (l) => l.hasPendingAccess || l.hasOpenInquiry,
  ).length;

  const selectedLead = selectedLeadEmail
    ? unifiedLeads.find((l) => l.email === selectedLeadEmail) ?? null
    : null;

  const analyticsById = useMemo(() => {
    const map = new Map<string, UserAnalyticsRow>();
    analytics.users.forEach((u) => map.set(u.id, u));
    return map;
  }, [analytics.users]);

  const tableRows = useMemo(
    () =>
      users.map((auth) => {
        const row = analyticsById.get(auth.id);
        return {
          id: auth.id,
          email: auth.email ?? row?.email ?? "—",
          accountType: row?.accountType ?? "platform",
          createdAt: auth.created_at || row?.createdAt || "",
          lastLogin: auth.last_sign_in_at ?? row?.lastLogin ?? null,
          lastSeenPage: row?.lastSeenPage ?? null,
          totalSessions: row?.totalSessions ?? 0,
          totalPageViews: row?.totalPageViews ?? 0,
          totalClicks: row?.totalClicks ?? 0,
          avgSessionSeconds: row?.avgSessionSeconds ?? 0,
          engagementScore: row?.engagementScore ?? 0,
          detail:
            row?.detail ??
            ({
              sessions: [],
              sessionJourneys: [],
              topPages: [],
              events: [],
              clicks: [],
              clickSummary: { ...EMPTY_CLICK_SUMMARY },
              engagementBreakdown: [],
            } satisfies UserAnalyticsRow["detail"]),
        } satisfies UserAnalyticsRow;
      }),
    [users, analyticsById],
  );

  async function handleRemove(userId: string) {
    setBanner(null);
    const res = await adminDeleteUser(userId);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (expandedId === userId) setExpandedId(null);
      setBanner({ type: "success", text: "User removed." });
    } else {
      setBanner({ type: "error", text: "Failed to remove user." });
    }
  }

  return (
    <AdminShell
      activeTab={tab}
      onTabChange={setTab}
      counts={{
        pipeline: pipelineAttention,
        leads: newLeads,
        access: pendingAccess,
        invites: pendingInvites,
      }}
      operatorEmail={operatorEmail}
      pendingTotal={pendingAccess + newLeads}
      searchEnabled
    >
      {tab === "pipeline" && selectedLead ? (
        <LeadDetailView
          lead={selectedLead}
          contactLeads={contactLeads}
          accessRequests={accessRequests}
          notes={leadNotes.filter(
            (n) => n.lead_email.trim().toLowerCase() === selectedLead.email,
          )}
          adminEvents={adminEvents}
        />
      ) : null}

      {tab === "pipeline" && !selectedLead ? (
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">Lead pipeline</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Unified view of every contact — inquiries, access requests, notes, and follow-ups.
              </p>
            </div>
            <a
              href="/api/admin/export-leads"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
            >
              Export CSV
            </a>
          </div>
          <LeadPipelineTable leads={unifiedLeads} />
        </div>
      ) : null}

      {tab === "overview" && (
        <AdminOverviewPanel
          operatorEmail={operatorEmail}
          leadQuality={leadQuality}
          analytics={analytics}
          accessRequests={accessRequests}
          contactLeads={contactLeads}
        />
      )}

      {tab === "leads" && (
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AdminSection
            id="admin-panel-leads"
            title="Engineering inquiries"
            description="Contact form and capability briefing requests from the marketing site."
          >
            <ContactLeadsTable leads={contactLeads} />
          </AdminSection>
        </div>
      )}

      {tab === "access" && (
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AdminSection id="admin-panel-access" title="Program access" description="Approve or deny platform access requests.">
            <AccessRequestsTable requests={accessRequests} />
          </AdminSection>
          <AdminSection
            title="Operator activity log"
            description="Approvals, denials, and credential resets recorded for program accountability."
          >
            <AdminAuditLog events={adminEvents} />
          </AdminSection>
        </div>
      )}

      {tab === "invites" && (
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AdminSection id="admin-panel-invites" title="Invitations" description="Invite users directly and manage pending invitations.">
            <InvitesTable initialInvites={invites} />
          </AdminSection>
        </div>
      )}

      {tab === "accounts" && (
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AdminSection
            id="admin-panel-accounts"
            title="Accounts & passwords"
            description="Reset platform passwords (/login) or SOF member codes (/sof-solutions/login)."
          >
            <AdminEmailGuide setup={emailSetup} />
            <AdminOperatorPasswordCard
              adminEmail={adminEmail}
              operatorEmail={operatorEmail}
              isOperatorSession={isOperatorSession}
            />
            <PlatformUsersTable users={users} onUsersChange={setUsers} />
          </AdminSection>
        </div>
      )}

      {tab === "products" && (
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">Shelter systems</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage the configurable solutions catalog — copy, status, and sort order.
            </p>
          </div>
          <ProductsAdmin products={catalogProducts} setup={catalogSetup} />
        </div>
      )}

      {tab === "news" && (
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">News releases</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Publish program updates and press releases to the public site.
            </p>
          </div>
          <NewsReleasesAdmin releases={newsReleases} setup={newsSetup} />
        </div>
      )}

      {tab === "events" && (
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">Events & briefings</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Schedule capability briefings and link them to news releases on /events.
            </p>
          </div>
          <EventsAdmin events={companyEvents} setup={eventsSetup} />
        </div>
      )}

      {tab === "deployments" && (
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">Map pin stories</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Edit deployment narratives on the global map. Bundled copy ships with the site; CMS saves override the bundle.
            </p>
          </div>
          <DeploymentStoriesAdmin cmsRows={deploymentStories} setup={deploymentStoriesSetup} />
        </div>
      )}

      {tab === "analytics" && (
        <div id="admin-panel-analytics" className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8" role="tabpanel">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">Analytics</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Signed-in member activity — sessions, page paths, clicks, and tracked CTAs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <AdminKpiCard label="Active today" value={analytics.summary.activeToday} />
            <AdminKpiCard label="Sessions (30d)" value={analytics.summary.totalSessions30d} />
            <AdminKpiCard label="Page views" value={analytics.summary.totalPageViews} />
            <AdminKpiCard label="Total clicks" value={analytics.summary.totalClicks} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <AdminKpiCard label="Tracked events" value={analytics.summary.totalEvents} />
            <AdminKpiCard
              label="Avg session"
              value={formatDurationShort(analytics.summary.avgSessionSeconds)}
              hint="Completed sessions (30d)"
            />
            <AdminKpiCard
              label="SOF members"
              value={analytics.summary.sofMembers}
              hint={`${analytics.summary.platformMembers} platform · ${analytics.summary.operators} operator`}
            />
            <AdminKpiCard label="Total accounts" value={analytics.summary.totalUsers} />
          </div>

          <AdminCharts chartData={analytics.chartData} />

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <AdminRecentActivity items={analytics.recentActivity} />
            <AdminEventBreakdown items={analytics.eventTypeCounts} />
          </div>

          <SiteClickSummary items={analytics.topClickedElements} />

          <AdminSection
            title="User engagement"
            description="Per-account metrics. Expand a row for session journeys, engagement breakdown, and click history."
          >
            {banner ? <AdminBanner type={banner.type} message={banner.text} /> : null}
            {tableRows.length === 0 ? (
              <AdminEmpty message="No platform users yet." />
            ) : (
              <AdminTableShell>
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-[#080a0c]/80 text-[11px] tracking-wide text-zinc-500 uppercase">
                      <th className="px-5 py-3.5 font-medium">Email</th>
                      <th className="px-5 py-3.5 font-medium">Type</th>
                      <th className="px-5 py-3.5 font-medium">Created</th>
                      <th className="px-5 py-3.5 font-medium">Last login</th>
                      <th className="px-5 py-3.5 font-medium">Sessions</th>
                      <th className="px-5 py-3.5 font-medium">Views</th>
                      <th className="px-5 py-3.5 font-medium">Clicks</th>
                      <th className="px-5 py-3.5 font-medium">Engagement</th>
                      <th className="px-5 py-3.5 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <Fragment key={row.id}>
                        <tr className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.02]">
                          <td className="px-5 py-4 font-medium text-white">{row.email}</td>
                          <td className="px-5 py-4 text-zinc-500">{accountTypeLabel(row.accountType)}</td>
                          <td className="px-5 py-4 text-zinc-500">{formatDateTime(row.createdAt)}</td>
                          <td className="px-5 py-4 text-zinc-500">{formatDateTime(row.lastLogin)}</td>
                          <td className="px-5 py-4 tabular-nums text-white">{row.totalSessions}</td>
                          <td className="px-5 py-4 tabular-nums text-white">{row.totalPageViews}</td>
                          <td className="px-5 py-4 tabular-nums text-white">{row.totalClicks}</td>
                          <td className="px-5 py-4">
                            <EngagementBar score={row.engagementScore} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                                className={adminBtnGhost}
                              >
                                {expandedId === row.id ? "Hide" : "Details"}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRemove(row.id)}
                                className={adminBtnGhost}
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedId === row.id && (
                          <tr>
                            <td colSpan={9} className="bg-[#080a0c]/60 p-0">
                              <UserExpandedDetail user={row} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </AdminTableShell>
            )}
          </AdminSection>
        </div>
      )}
    </AdminShell>
  );
}
