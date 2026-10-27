"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteCompanyEvent, adminSaveCompanyEvent } from "../actions";
import {
  COMPANY_EVENT_TYPE_LABELS,
  formatEventDate,
  slugifyEventTitle,
  type CompanyEventRow,
  type CompanyEventScheduleType,
  type CompanyEventType,
} from "@/lib/company-events";
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

type FormState = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  event_type: CompanyEventType;
  schedule_type: CompanyEventScheduleType;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location: string;
  registration_url: string;
  related_news_slug: string;
  cover_image_url: string;
  status: "draft" | "published";
};

function emptyForm(): FormState {
  return {
    title: "",
    slug: "",
    summary: "",
    event_type: "capability_briefing",
    schedule_type: "scheduled",
    starts_at: "",
    ends_at: "",
    timezone: "America/New_York",
    location: "",
    registration_url: "",
    related_news_slug: "",
    cover_image_url: "",
    status: "draft",
  };
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function formFromRow(row: CompanyEventRow): FormState {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary ?? "",
    event_type: (row.event_type as CompanyEventType) || "capability_briefing",
    schedule_type: (row.schedule_type as CompanyEventScheduleType) || "scheduled",
    starts_at: toLocalInput(row.starts_at),
    ends_at: toLocalInput(row.ends_at),
    timezone: row.timezone ?? "America/New_York",
    location: row.location ?? "",
    registration_url: row.registration_url ?? "",
    related_news_slug: row.related_news_slug ?? "",
    cover_image_url: row.cover_image_url ?? "",
    status: row.status === "published" ? "published" : "draft",
  };
}

export function EventsAdmin({
  events,
  setup,
}: {
  events: CompanyEventRow[];
  setup: { ready: boolean; message?: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sorted = useMemo(
    () =>
      [...events].sort((a, b) => {
        const aTime = a.starts_at ? new Date(a.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.starts_at ? new Date(b.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }),
    [events],
  );

  async function handleSave() {
    setPending(true);
    setBanner(null);
    const result = await adminSaveCompanyEvent({
      ...form,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    });
    setPending(false);
    if (!result.ok) {
      setBanner({ type: "error", text: result.error });
      return;
    }
    setBanner({ type: "success", text: editing ? "Event updated." : "Event created." });
    setForm(emptyForm());
    setEditing(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this event?")) return;
    setPending(true);
    const result = await adminDeleteCompanyEvent(id);
    setPending(false);
    if (!result.ok) {
      setBanner({ type: "error", text: result.error });
      return;
    }
    setBanner({ type: "success", text: "Event deleted." });
    if (form.id === id) {
      setForm(emptyForm());
      setEditing(false);
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {!setup.ready && setup.message ? (
        <AdminBanner type="error" message={setup.message} />
      ) : null}
      {banner ? <AdminBanner type={banner.type} message={banner.text} /> : null}

      <AdminSection title={editing ? "Edit event" : "New event"} description="Published events appear on /events with dates and related news links.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-xs text-zinc-400">
            Title
            <input
              className={adminInputClass}
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                  slug: editing ? f.slug : slugifyEventTitle(e.target.value),
                }))
              }
            />
          </label>
          <label className="block text-xs text-zinc-400">
            Slug
            <input className={adminInputClass} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          </label>
          <label className="block text-xs text-zinc-400 md:col-span-2">
            Summary
            <textarea
              className={`${adminInputClass} min-h-[80px]`}
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
          </label>
          <label className="block text-xs text-zinc-400">
            Type
            <select
              className={adminInputClass}
              value={form.event_type}
              onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value as CompanyEventType }))}
            >
              {Object.entries(COMPANY_EVENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-zinc-400">
            Schedule
            <select
              className={adminInputClass}
              value={form.schedule_type}
              onChange={(e) => setForm((f) => ({ ...f, schedule_type: e.target.value as CompanyEventScheduleType }))}
            >
              <option value="scheduled">Scheduled date</option>
              <option value="on_demand">On request</option>
            </select>
          </label>
          {form.schedule_type === "scheduled" ? (
            <>
              <label className="block text-xs text-zinc-400">
                Starts
                <input
                  type="datetime-local"
                  className={adminInputClass}
                  value={form.starts_at}
                  onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                />
              </label>
              <label className="block text-xs text-zinc-400">
                Ends
                <input
                  type="datetime-local"
                  className={adminInputClass}
                  value={form.ends_at}
                  onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
                />
              </label>
            </>
          ) : null}
          <label className="block text-xs text-zinc-400">
            Timezone
            <input className={adminInputClass} value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))} />
          </label>
          <label className="block text-xs text-zinc-400">
            Location
            <input className={adminInputClass} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </label>
          <label className="block text-xs text-zinc-400 md:col-span-2">
            Registration URL (optional)
            <input className={adminInputClass} value={form.registration_url} onChange={(e) => setForm((f) => ({ ...f, registration_url: e.target.value }))} />
          </label>
          <label className="block text-xs text-zinc-400">
            Related news slug
            <input className={adminInputClass} value={form.related_news_slug} onChange={(e) => setForm((f) => ({ ...f, related_news_slug: e.target.value }))} />
          </label>
          <label className="block text-xs text-zinc-400">
            Cover image URL
            <input className={adminInputClass} value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} />
          </label>
          <label className="block text-xs text-zinc-400">
            Status
            <select
              className={adminInputClass}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className={adminBtnPrimary} disabled={pending} onClick={() => void handleSave()}>
            {pending ? "Saving…" : editing ? "Update event" : "Create event"}
          </button>
          {editing ? (
            <button
              type="button"
              className={adminBtnGhost}
              onClick={() => {
                setForm(emptyForm());
                setEditing(false);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </AdminSection>

      <AdminSection title="Scheduled events" description="Sorted by start date. Run supabase/seed_company_events.sql for sample data.">
        {sorted.length === 0 ? (
          <AdminEmpty message="No events yet." />
        ) : (
          <AdminTableShell>
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id} className="border-b border-white/[0.06]">
                    <td className="px-5 py-3 text-zinc-400">
                      {row.schedule_type === "on_demand"
                        ? "On request"
                        : formatEventDate(row.starts_at, row.timezone)}
                    </td>
                    <td className="px-5 py-3 font-medium text-white">{row.title}</td>
                    <td className="px-5 py-3 text-zinc-400">{row.event_type.replace(/_/g, " ")}</td>
                    <td className="px-5 py-3 text-zinc-400">{row.status}</td>
                    <td className="px-5 py-3 text-right">
                      <button type="button" className={`${adminBtnGhost} mr-2`} onClick={() => { setForm(formFromRow(row)); setEditing(true); }}>
                        Edit
                      </button>
                      {!row.id.startsWith("legacy-") ? (
                        <button type="button" className={adminBtnDanger} onClick={() => void handleDelete(row.id)}>
                          Delete
                        </button>
                      ) : null}
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
