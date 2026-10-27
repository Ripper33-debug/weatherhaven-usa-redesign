import "server-only";

import type { AccessRequestRow } from "@/lib/accessRequests";
import type { ContactLeadRow } from "@/lib/contactLeads";
import { syncLeadProfileInputs } from "@/lib/lead-management";
import { upsertLeadProfile } from "@/app/api/_lib/lead-profiles";

/** Ensure lead_profiles rows exist for all known contact/access emails. */
export async function syncLeadProfilesFromSources(input: {
  contactLeads: ContactLeadRow[];
  accessRequests: AccessRequestRow[];
}): Promise<void> {
  const inputs = syncLeadProfileInputs(input);
  for (const row of inputs) {
    await upsertLeadProfile({
      email: row.email,
      full_name: row.full_name,
      organization: row.organization,
      pipeline_status: row.pipeline_status,
    });
  }
}
