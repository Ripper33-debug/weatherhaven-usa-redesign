import "server-only";

import type { DeploymentStoryCmsInput, DeploymentStoryCmsRow } from "@/lib/deployment-stories";
import { createAdminClient } from "@/app/api/_lib/get-admin";

function hasSupabaseAdminEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("deployment_stories") &&
    (lower.includes("does not exist") ||
      lower.includes("schema cache") ||
      lower.includes("could not find the table"))
  );
}

function formatDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "Deployment stories table not set up. Run supabase/migrations/20260605120000_deployment_stories.sql in Supabase SQL Editor.";
  }
  return "Something went wrong saving the deployment story. Check Supabase logs or try again.";
}

export async function probeDeploymentStoriesTable(): Promise<{ ready: boolean; message?: string }> {
  if (!hasSupabaseAdminEnv()) {
    return {
      ready: false,
      message: "Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("deployment_stories").select("deployment_id").limit(1);
  if (error) return { ready: false, message: formatDbError(error.message) };
  return { ready: true };
}

export async function listDeploymentStoryOverrides(): Promise<DeploymentStoryCmsRow[]> {
  if (!hasSupabaseAdminEnv()) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("deployment_stories")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(formatDbError(error.message));
  }

  return (data ?? []) as DeploymentStoryCmsRow[];
}

export async function upsertDeploymentStory(
  input: DeploymentStoryCmsInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const deploymentId = input.deployment_id.trim();
  if (!deploymentId) return { ok: false, error: "Deployment id required." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("deployment_stories").upsert(
    {
      deployment_id: deploymentId,
      headline: input.headline?.trim() || null,
      narrative: input.narrative?.trim() || null,
      image_slug: input.image_slug?.trim() || null,
      cover_image_url: input.cover_image_url?.trim() || null,
      featured: Boolean(input.featured),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "deployment_id" },
  );

  if (error) return { ok: false, error: formatDbError(error.message) };
  return { ok: true };
}

export async function deleteDeploymentStory(
  deploymentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("deployment_stories").delete().eq("deployment_id", deploymentId.trim());

  if (error) return { ok: false, error: formatDbError(error.message) };
  return { ok: true };
}
