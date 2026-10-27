"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteNewsRelease, adminSaveNewsRelease } from "../actions";
import type { NewsReleaseRow } from "@/lib/news-releases";
import { formatNewsDate, newsReleaseHref, slugifyNewsTitle } from "@/lib/news-releases";
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
  id?: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  external_url: string;
  cover_image_url: string;
  status: "draft" | "published";
  published_at: string;
};

function emptyForm(): FormState {
  return {
    title: "",
    slug: "",
    summary: "",
    body: "",
    external_url: "",
    cover_image_url: "",
    status: "draft",
    published_at: "",
  };
}

function formFromRow(row: NewsReleaseRow): FormState {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary ?? "",
    body: row.body ?? "",
    external_url: row.external_url ?? "",
    cover_image_url: row.cover_image_url ?? "",
    status: row.status === "published" ? "published" : "draft",
    published_at: row.published_at ? row.published_at.slice(0, 10) : "",
  };
}

export function NewsReleasesAdmin({
  releases,
  setup,
}: {
  releases: NewsReleaseRow[];
  setup: { ready: boolean; message?: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sorted = useMemo(
    () =>
      [...releases].sort((a, b) => {
        const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bTime - aTime;
      }),
    [releases],
  );

  function startCreate() {
    setForm(emptyForm());
    setEditing(true);
    setBanner(null);
  }

  function startEdit(row: NewsReleaseRow) {
    setForm(formFromRow(row));
    setEditing(true);
    setBanner(null);
  }

  function cancelEdit() {
    setForm(emptyForm());
    setEditing(false);
  }

  async function handleSave() {
    setPending(true);
    setBanner(null);
    const slugRaw = form.slug.trim() || slugifyNewsTitle(form.title);
    const slug = slugRaw.length >= 2 ? slugRaw : slugifyNewsTitle(form.title);

    const res = await adminSaveNewsRelease({
      id: form.id,
      title: form.title,
      slug,
      summary: form.summary || undefined,
      body: form.body || undefined,
      external_url: form.external_url || undefined,
      cover_image_url: form.cover_image_url || undefined,
      status: form.status,
      published_at: form.published_at
        ? new Date(`${form.published_at}T12:00:00Z`).toISOString()
        : null,
    });
    setPending(false);
    if (res.ok) {
      setBanner({ type: "success", text: form.id ? "Release updated." : "Release created." });
      setEditing(false);
      setForm(emptyForm());
      router.refresh();
    } else {
      setBanner({ type: "error", text: res.error });
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this news release?")) return;
    setPending(true);
    const res = await adminDeleteNewsRelease(id);
    setPending(false);
    if (res.ok) {
      setBanner({ type: "success", text: "Release deleted." });
      if (form.id === id) cancelEdit();
      router.refresh();
    } else {
      setBanner({ type: "error", text: res.error });
    }
  }

  return (
    <div>
      {!setup.ready && setup.message ? (
        <AdminBanner type="error" message={setup.message} />
      ) : null}
      {banner ? <AdminBanner type={banner.type} message={banner.text} /> : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          Published releases appear on <strong className="text-white">/news</strong>, the homepage news
          section, and Events.
        </p>
        {!editing ? (
          <button type="button" onClick={startCreate} className={adminBtnPrimary}>
            New release
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mb-8 rounded-xl border border-white/[0.06] bg-[#111113] p-6">
          <h3 className="text-sm font-medium text-white">{form.id ? "Edit release" : "New release"}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block lg:col-span-2">
              <span className="text-xs text-zinc-500">Title</span>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: f.slug || slugifyNewsTitle(e.target.value),
                  }))
                }
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Slug (URL)</span>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className={`${adminInputClass} mt-1.5`}
                placeholder="auto-from-title"
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Publish date</span>
              <input
                type="date"
                value={form.published_at}
                onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-xs text-zinc-500">Summary (optional — list views)</span>
              <textarea
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                rows={2}
                className={`${adminInputClass} mt-1.5 resize-y`}
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-xs text-zinc-500">Body (optional — on-site article at /news/slug)</span>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                rows={6}
                className={`${adminInputClass} mt-1.5 resize-y`}
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-xs text-zinc-500">External URL (optional — links out instead of on-site page)</span>
              <input
                value={form.external_url}
                onChange={(e) => setForm((f) => ({ ...f, external_url: e.target.value }))}
                className={`${adminInputClass} mt-1.5`}
                placeholder="https://…"
              />
            </label>
            <AdminPhotoUpload
              label="Cover photo (optional)"
              hint="Shown on the news article page. JPEG, PNG, WebP, or GIF up to 8 MB. Save the release after uploading."
              value={form.cover_image_url}
              onChange={(url) => setForm((f) => ({ ...f, cover_image_url: url }))}
              context="news"
              slug={form.slug.trim() || slugifyNewsTitle(form.title)}
              disabled={pending}
            />
            <label className="block">
              <span className="text-xs text-zinc-500">Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))
                }
                className={`${adminInputClass} mt-1.5`}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" disabled={pending} onClick={() => void handleSave()} className={adminBtnPrimary}>
              Save release
            </button>
            <button type="button" onClick={cancelEdit} className={adminBtnGhost}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <AdminSection title="All releases" description="Drafts are visible here only.">
        {sorted.length === 0 ? (
          <AdminEmpty message="No news releases yet. Create your first release above." />
        ) : (
          <AdminTableShell>
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] tracking-wide text-zinc-500 uppercase">
                  <th className="px-5 py-3.5 font-medium">Title</th>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{row.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">/news/{row.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">{formatNewsDate(row.published_at)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] ${
                          row.status === "published"
                            ? "border-emerald-500/40 text-emerald-400"
                            : "border-zinc-600 text-zinc-500"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={newsReleaseHref(row)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={adminBtnGhost}
                        >
                          View
                        </a>
                        <button type="button" onClick={() => startEdit(row)} className={adminBtnGhost}>
                          Edit
                        </button>
                        {!row.id.startsWith("legacy-") ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => void handleDelete(row.id)}
                            className={adminBtnDanger}
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableShell>
        )}
      </AdminSection>
    </div>
  );
}
