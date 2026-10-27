import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getAdminEmail, isAdminEmail } from "@/lib/auth-admin";
import { fetchAdminAnalytics } from "@/lib/admin-analytics";
import { listAdminEvents } from "@/lib/admin-events";
import { listAccessRequests } from "@/lib/accessRequests";
import { listContactLeads } from "@/lib/contactLeads";
import { fetchLeadQualitySummary } from "@/lib/lead-quality";
import { listInvites } from "@/lib/invites";
import { buildUnifiedLeads } from "@/lib/lead-management";
import { listLeadProfiles, listAllLeadNotes } from "@/lib/leadProfiles";
import { listAuthUsers } from "@/app/api/_lib/list-auth-users";
import { listCatalogProducts, probeCatalogProductsTable } from "@/app/api/_lib/catalog-products";
import {
  listDeploymentStoryOverrides,
  probeDeploymentStoriesTable,
} from "@/app/api/_lib/deployment-stories";
import { listNewsReleases, probeNewsReleasesTable } from "@/app/api/_lib/news-releases";
import { listCompanyEvents, probeCompanyEventsTable } from "@/app/api/_lib/company-events";
import { syncLeadProfilesFromSources } from "@/app/api/_lib/sync-lead-profiles";
import { createClient } from "@/lib/supabase/server";
import { getEmailFrom, getNotifyTo, isEmailConfigured } from "@/lib/email-config";
import { buildEmailSetupSnapshot } from "@/lib/email-sender";
import { getSiteUrl } from "@/lib/site-url";
import { AdminDashboard } from "./AdminDashboard";
import type { AdminUserRow } from "./actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/");
  }

  const [analytics, authList, accessRequests, contactLeads, invites, adminEvents] = await Promise.all([
    fetchAdminAnalytics(getAdminEmail()),
    listAuthUsers(1000),
    listAccessRequests(),
    listContactLeads(),
    listInvites(),
    listAdminEvents(200),
  ]);

  await syncLeadProfilesFromSources({ contactLeads, accessRequests }).catch(() => {
    /* lead_profiles table may not exist until migration runs */
  });
  const leadProfiles = await listLeadProfiles();
  const leadNotes = await listAllLeadNotes();
  const unifiedLeads = buildUnifiedLeads({
    contactLeads,
    accessRequests,
    profiles: leadProfiles,
  });

  const leadQuality = await fetchLeadQualitySummary(contactLeads, accessRequests);
  const [newsReleases, newsSetup, companyEvents, eventsSetup, catalogProducts, catalogSetup, deploymentStories, deploymentStoriesSetup] =
    await Promise.all([
      listNewsReleases(),
      probeNewsReleasesTable(),
      listCompanyEvents(),
      probeCompanyEventsTable(),
      listCatalogProducts(),
      probeCatalogProductsTable(),
      listDeploymentStoryOverrides(),
      probeDeploymentStoriesTable(),
    ]);

  const adminEmailLower = getAdminEmail()?.toLowerCase();
  const initialUsers: AdminUserRow[] = (authList.data?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at ?? "",
    last_sign_in_at: u.last_sign_in_at,
    isOperator: Boolean(adminEmailLower && u.email?.trim().toLowerCase() === adminEmailLower),
  }));

  const emailSetup = buildEmailSetupSnapshot({
    emailFrom: getEmailFrom(),
    resendConfigured: isEmailConfigured(),
    siteUrl: getSiteUrl(),
    notifyTo: getNotifyTo(),
  });

  return (
    <Suspense fallback={<p className="p-10 text-sm text-zinc-500">Loading dashboard…</p>}>
        <AdminDashboard
          analytics={analytics}
          initialAuthUsers={initialUsers}
          accessRequests={accessRequests}
          contactLeads={contactLeads}
          invites={invites}
          adminEmail={getAdminEmail() ?? ""}
          operatorEmail={user.email}
          isOperatorSession
          leadQuality={leadQuality}
          adminEvents={adminEvents}
          unifiedLeads={unifiedLeads}
          leadNotes={leadNotes}
          newsReleases={newsReleases}
          newsSetup={newsSetup}
          companyEvents={companyEvents}
          eventsSetup={eventsSetup}
          catalogProducts={catalogProducts}
          catalogSetup={catalogSetup}
          deploymentStories={deploymentStories}
          deploymentStoriesSetup={deploymentStoriesSetup}
          emailSetup={emailSetup}
        />
    </Suspense>
  );
}
