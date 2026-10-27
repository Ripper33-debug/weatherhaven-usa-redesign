"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteDeploymentStory, adminSaveDeploymentStory } from "../actions";
import { GLOBAL_DEPLOYMENTS, getTheaterById, type GlobalDeployment } from "@/lib/global-deployments";
import type { DeploymentStoryCmsRow } from "@/lib/deployment-stories";
import { buildDeploymentStory } from "@/lib/deployment-story";
import {
  AdminBanner,
  AdminEmpty,
  AdminSection,
  AdminTableShell,
  adminBtnDanger,
  adminBtnGhost,
  adminBtnPrimary,
  adminInputClass,
} from "./admin-ui";
import { AdminPhotoUpload } from "./AdminPhotoUpload";

type FormState = {
  headline: string;
  narrative: string;
  image_slug: string;
  cover_image_url: string;
  featured: boolean;
};

function emptyForm(): FormState {
  return { headline: "", narrative: "", image_slug: "", cover_image_url: "", featured: false };
}

function formFromSources(
  deployment: GlobalDeployment,
  cms?: DeploymentStoryCmsRow,
): FormState {
  const preview = buildDeploymentStory(deployment, cms ?? null);
  return {
    headline: cms?.headline ?? deployment.storyHeadline ?? preview.headline,
    narrative: cms?.narrative ?? deployment.storyNarrative ?? preview.narrative,
    image_slug: cms?.image_slug ?? deployment.systemSlug,
    cover_image_url: cms?.cover_image_url ?? "",
    featured: cms?.featured ?? false,
  };
}

export function DeploymentStoriesAdmin({
  cmsRows,
  setup,
}: {
  cmsRows: DeploymentStoryCmsRow[];
  setup: { ready: boolean; message?: string };
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const cmsById = useMemo(
    () => Object.fromEntries(cmsRows.map((row) => [row.deployment_id, row])),
    [cmsRows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOBAL_DEPLOYMENTS.slice(0, 80);
    return GLOBAL_DEPLOYMENTS.filter(
      (d) =>
        d.id.includes(q) ||
        d.label.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q),
    ).slice(0, 80);
  }, [query]);

  const selected = selectedId
    ? GLOBAL_DEPLOYMENTS.find((d) => d.id === selectedId)
    : undefined;

  function pick(deployment: GlobalDeployment) {
    setSelectedId(deployment.id);
    setForm(formFromSources(deployment, cmsById[deployment.id]));
    setBanner(null);
  }

  async function handleSave() {
    if (!selected) return;
    setPending(true);
    setBanner(null);
    const result = await adminSaveDeploymentStory({
      deployment_id: selected.id,
      headline: form.headline,
      narrative: form.narrative,
      image_slug: form.image_slug,
      cover_image_url: form.cover_image_url,
      featured: form.featured,
    });
    setPending(false);
    if (!result.ok) {
      setBanner({ type: "error", text: result.error });
      return;
    }
    setBanner({ type: "success", text: "Deployment story saved." });
    router.refresh();
  }

  async function handleReset() {
    if (!selected) return;
    if (!cmsById[selected.id]) {
      setForm(formFromSources(selected));
      return;
    }
    setPending(true);
    const result = await adminDeleteDeploymentStory(selected.id);
    setPending(false);
    if (!result.ok) {
      setBanner({ type: "error", text: result.error });
      return;
    }
    setForm(formFromSources(selected));
    setBanner({ type: "success", text: "Reverted to bundled map story." });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {!setup.ready && setup.message ? <AdminBanner type="error" message={setup.message} /> : null}

      {banner ? <AdminBanner type={banner.type} message={banner.text} /> : null}

      <AdminSection
        title="Map pin stories"
        description={`${GLOBAL_DEPLOYMENTS.length} deployments in the global map bundle. Edit headlines and narratives here; changes override bundled copy on the live map.`}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search location, program, or id…"
              className={`${adminInputClass} mb-3`}
            />
            <AdminTableShell>
              <ul className="max-h-[520px] divide-y divide-white/[0.06] overflow-y-auto">
                {filtered.map((d) => {
                  const edited = Boolean(cmsById[d.id]);
                  const active = d.id === selectedId;
                  return (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => pick(d)}
                        className={`flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition ${
                          active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <span className="text-sm font-medium text-white">{d.storyHeadline ?? d.label}</span>
                        <span className="text-xs text-zinc-500">
                          {d.title} · {getTheaterById(d.theaterId)?.label ?? d.theaterId}
                          {edited ? " · CMS" : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </AdminTableShell>
            {query && filtered.length === 0 ? (
              <AdminEmpty message="No deployments match that search." />
            ) : null}
          </div>

          <div>
            {selected ? (
              <div className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111113] p-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{selected.id}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{selected.label}</h3>
                  <p className="text-sm text-zinc-400">
                    {selected.title} · {selected.systemCode} · {selected.category}
                  </p>
                </div>

                <label className="block text-xs text-zinc-400">
                  Story headline
                  <input
                    className={`${adminInputClass} mt-1`}
                    value={form.headline}
                    onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                  />
                </label>

                <label className="block text-xs text-zinc-400">
                  Story narrative
                  <textarea
                    className={`${adminInputClass} mt-1 min-h-[140px] resize-y`}
                    value={form.narrative}
                    onChange={(e) => setForm((f) => ({ ...f, narrative: e.target.value }))}
                  />
                </label>

                <label className="block text-xs text-zinc-400">
                  Product image slug (optional)
                  <input
                    className={`${adminInputClass} mt-1`}
                    value={form.image_slug}
                    onChange={(e) => setForm((f) => ({ ...f, image_slug: e.target.value }))}
                    placeholder={selected.systemSlug}
                  />
                </label>

                <AdminPhotoUpload
                  label="Cover photo override"
                  hint="Optional pin story hero image. Save after uploading."
                  value={form.cover_image_url}
                  onChange={(url) => setForm((f) => ({ ...f, cover_image_url: url }))}
                  context="deployments"
                  slug={selected.id}
                  disabled={pending}
                />

                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="accent-emerald-500"
                  />
                  Mark as featured deployment
                </label>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button type="button" className={adminBtnPrimary} disabled={pending} onClick={() => void handleSave()}>
                    {pending ? "Saving…" : "Save story"}
                  </button>
                  <button type="button" className={adminBtnGhost} disabled={pending} onClick={() => void handleReset()}>
                    Use bundled copy
                  </button>
                  <button type="button" className={adminBtnDanger} disabled={pending} onClick={() => setSelectedId(null)}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <AdminEmpty message="Select a map pin to edit its story." />
            )}
          </div>
        </div>
      </AdminSection>
    </div>
  );
}
