"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateContactLeadStatus } from "../actions";
import type { ContactLeadRow } from "@/lib/contactLeads";
import {
  AdminBanner,
  AdminEmpty,
  AdminTableShell,
  adminBtnGhost,
  adminBtnMuted,
  adminBtnSuccess,
} from "./admin-ui";

function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "new").toLowerCase();
  const classes =
    s === "in progress" || s === "in_progress"
      ? "border-blue-400/40 bg-blue-400/10 text-blue-300"
      : s === "closed"
        ? "border-white/15 bg-white/5 text-[#8a9099]"
        : "border-[#4d9fff]/40 bg-[#4d9fff]/10 text-[#4d9fff]";
  const label =
    s === "in progress" || s === "in_progress" ? "In progress" : s === "closed" ? "Closed" : "New";
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${classes}`}>
      {label}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function ContactLeadsTable({ leads }: { leads: ContactLeadRow[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function setStatus(id: string, status: string) {
    setPendingId(id);
    setBanner(null);
    const res = await adminUpdateContactLeadStatus(id, status);
    setPendingId(null);
    if (res.ok) {
      setBanner({ type: "success", text: `Status updated to ${status}.` });
      router.refresh();
    } else {
      setBanner({ type: "error", text: res.error });
    }
  }

  if (leads.length === 0) {
    return <AdminEmpty message="No engineering inquiries yet." />;
  }

  return (
    <div>
      {banner ? <AdminBanner type={banner.type} message={banner.text} /> : null}
      <AdminTableShell>
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#080a0c]/80 text-[11px] tracking-wide text-[#8a9099] uppercase">
              <th className="px-5 py-3.5 font-medium">Name</th>
              <th className="px-5 py-3.5 font-medium">Email</th>
              <th className="px-5 py-3.5 font-medium">Organization</th>
              <th className="px-5 py-3.5 font-medium">Inquiry</th>
              <th className="px-5 py-3.5 font-medium">Subject</th>
              <th className="px-5 py-3.5 font-medium">Submitted</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((row) => {
              const isClosed = (row.status ?? "new").toLowerCase() === "closed";
              return (
                <Fragment key={row.id}>
                  <tr
                    className={`border-b border-white/[0.06] transition-colors hover:bg-white/[0.02] ${isClosed ? "opacity-50" : ""}`}
                  >
                    <td className="px-5 py-4 font-medium text-white">{row.full_name ?? "—"}</td>
                    <td className="px-5 py-4 text-[#8a9099]">
                      {row.email ? (
                        <a href={`mailto:${row.email}`} className="text-[#4d9fff] hover:underline">
                          {row.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#8a9099]">{row.organization ?? "—"}</td>
                    <td className="px-5 py-4 text-[#8a9099]">{row.inquiry_type ?? "—"}</td>
                    <td className="max-w-[200px] truncate px-5 py-4 text-white" title={row.subject ?? undefined}>
                      {row.subject ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-[#8a9099]">{formatDate(row.submitted_at)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={pendingId === row.id || isClosed}
                          onClick={() => void setStatus(row.id, "in progress")}
                          className={adminBtnSuccess}
                        >
                          In progress
                        </button>
                        <button
                          type="button"
                          disabled={pendingId === row.id || isClosed}
                          onClick={() => void setStatus(row.id, "closed")}
                          className={adminBtnMuted}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                          className={adminBtnGhost}
                        >
                          {expandedId === row.id ? "Hide" : "View"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === row.id && (
                    <tr className={isClosed ? "opacity-50" : ""}>
                      <td colSpan={8} className="border-t border-white/[0.06] bg-[#080a0c]/60 px-6 py-5 text-sm text-[#8a9099]">
                        <p>
                          <span className="text-white">Email:</span>{" "}
                          {row.email ? (
                            <a href={`mailto:${row.email}`} className="text-[#4d9fff] hover:underline">
                              {row.email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </p>
                        <p className="mt-2">
                          <span className="text-white">Role:</span> {row.role || "—"}
                        </p>
                        <p className="mt-2">
                          <span className="text-white">Program:</span> {row.program || "—"}
                        </p>
                        <p className="mt-2">
                          <span className="text-white">Contact:</span> {row.contact_method || "—"}
                          {row.phone ? ` · ${row.phone}` : ""}
                        </p>
                        <p className="mt-3 whitespace-pre-wrap">
                          <span className="text-white">Message:</span>
                          <br />
                          {row.message || "—"}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
