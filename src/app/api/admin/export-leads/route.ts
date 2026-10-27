import { NextResponse } from "next/server";
import { listAccessRequests } from "@/lib/accessRequests";
import { listContactLeads } from "@/lib/contactLeads";
import { buildUnifiedLeads } from "@/lib/lead-management";
import { listLeadProfiles } from "@/lib/leadProfiles";
import { isAdminEmail } from "@/lib/auth-admin";
import { unifiedLeadsToCsv } from "@/lib/export-leads-csv";
import { createClient } from "@/lib/supabase/server";
import { guardApiRead } from "@/lib/api-guard";

export async function GET(request: Request) {
  const limited = guardApiRead(request);
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [contactLeads, accessRequests, profiles] = await Promise.all([
    listContactLeads(),
    listAccessRequests(),
    listLeadProfiles(),
  ]);

  const leads = buildUnifiedLeads({ contactLeads, accessRequests, profiles });
  const csv = unifiedLeadsToCsv(leads);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="weatherhaven-leads-${stamp}.csv"`,
    },
  });
}
