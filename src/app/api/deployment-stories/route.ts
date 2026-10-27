import { NextResponse } from "next/server";
import { listDeploymentStoryOverrides } from "@/app/api/_lib/deployment-stories";
import { guardApiRead } from "@/lib/api-guard";

export const revalidate = 60;

/** Public map pin story CMS overrides keyed by deployment_id. */
export async function GET(request: Request) {
  const limited = guardApiRead(request);
  if (limited) return limited;

  try {
    const rows = await listDeploymentStoryOverrides();
    const overrides = Object.fromEntries(rows.map((row) => [row.deployment_id, row]));
    return NextResponse.json({ overrides });
  } catch {
    return NextResponse.json({ overrides: {} });
  }
}
