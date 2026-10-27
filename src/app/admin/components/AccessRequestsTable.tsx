"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminApproveAccessRequest,
  adminDenyAccessRequest,
  adminResetPlatformPassword,
  adminResetSofAccessCode,
} from "../actions";
import type { AccessRequestRow } from "@/lib/accessRequests";
import { isSofAccessRequest } from "@/lib/sof-auth";
import {
  AdminBanner,
  AdminEmpty,
  AdminTableShell,
  adminBtnDanger,
  adminBtnGhost,
  adminBtnSuccess,
} from "./admin-ui";

function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "pending").toLowerCase();
  const classes =
    s === "approved"
      ? "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80]"
      : s === "denied"
        ? "border-white/15 bg-white/5 text-[#8a9099]"
        : "border-[#4d9fff]/40 bg-[#4d9fff]/10 text-[#4d9fff]";
  const label = s === "approved" ? "Approved" : s === "denied" ? "Denied" : "Pending";
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

export function AccessRequestsTable({ requests }: { requests: AccessRequestRow[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleApprove(row: AccessRequestRow) {
    if (!row.email) return;
    setPendingId(row.id);
    setBanner(null);
    const res = await adminApproveAccessRequest(row.id, row.email, row.program);
    if (!res.ok) {
      setPendingId(null);
      setBanner({ type: "error", text: res.error });
      return;
    }

    if (res.sofPin) {
      setBanner({
        type: "success",
        text: res.emailSent
          ? `SOF member ready. Access code emailed to ${row.email}.`
          : "SOF member ready. Access code generated — configure RESEND_API_KEY to email automatically.",
      });
    } else {
      setBanner({
        type: "success",
        text: res.emailSent
          ? `User created and platform password emailed to ${row.email} for /login.`
          : "User created. Platform password generated — configure RESEND_API_KEY to email automatically.",
      });
    }

    setPendingId(null);
    router.refresh();
  }

  async function handleResetSofCode(row: AccessRequestRow) {
    if (!row.email) return;
    setPendingId(row.id);
    setBanner(null);
    const res = await adminResetSofAccessCode(row.email);
    setPendingId(null);
    if (!res.ok) {
      setBanner({ type: "error", text: res.error });
      return;
    }
    setBanner({
      type: "success",
      text: res.emailSent
        ? `New SOF code emailed to ${row.email}.`
        : "SOF code reset — configure RESEND_API_KEY to email automatically.",
    });
    router.refresh();
  }

  async function handleResetPlatformPassword(row: AccessRequestRow) {
    if (!row.email) return;
    setPendingId(row.id);
    setBanner(null);
    const res = await adminResetPlatformPassword(row.email);
    setPendingId(null);
    if (!res.ok) {
      setBanner({ type: "error", text: res.error });
      return;
    }
    setBanner({
      type: "success",
      text: res.emailSent
        ? `Platform password emailed to ${row.email} for /login.`
        : "Platform password reset — configure RESEND_API_KEY to email automatically.",
    });
    router.refresh();
  }

  async function handleDeny(id: string) {
    setPendingId(id);
    setBanner(null);
    const res = await adminDenyAccessRequest(id);
    setPendingId(null);
    if (res.ok) {
      setBanner({
        type: "success",
        text: res.emailSent
          ? "Request denied. Notification emailed to the requester."
          : "Request denied. (Email not sent — check RESEND_API_KEY or requester email.)",
      });
      router.refresh();
    } else {
      setBanner({ type: "error", text: res.error });
    }
  }

  if (requests.length === 0) {
    return <AdminEmpty message="No access requests yet." />;
  }

  return (
    <div>
      {banner ? <AdminBanner type={banner.type} message={banner.text} /> : null}
      <p className="mb-4 text-xs text-[#8a9099]">
        SOF requests: approve to email a <strong className="text-white">4-digit code</strong>. Use{" "}
        <strong className="text-white">Accounts & passwords</strong> or the buttons below to reset platform or SOF
        credentials.
      </p>
      <AdminTableShell>
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#080a0c]/80 text-[11px] tracking-wide text-[#8a9099] uppercase">
              <th className="px-5 py-3.5 font-medium">Name</th>
              <th className="px-5 py-3.5 font-medium">Organization</th>
              <th className="px-5 py-3.5 font-medium">Email</th>
              <th className="px-5 py-3.5 font-medium">Role</th>
              <th className="px-5 py-3.5 font-medium">Submitted</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((row) => {
              const isDenied = (row.status ?? "pending").toLowerCase() === "denied";
              const isApproved = (row.status ?? "pending").toLowerCase() === "approved";
              const isSof = isSofAccessRequest(row.program);
              return (
                <Fragment key={row.id}>
                  <tr
                    className={`border-b border-white/[0.06] transition-colors hover:bg-white/[0.02] ${isDenied ? "opacity-50" : ""}`}
                  >
                    <td className="px-5 py-4 font-medium text-white">{row.full_name ?? "—"}</td>
                    <td className="px-5 py-4 text-[#8a9099]">{row.organization ?? "—"}</td>
                    <td className="px-5 py-4 text-white">{row.email ?? "—"}</td>
                    <td className="px-5 py-4 text-[#8a9099]">{row.role ?? "—"}</td>
                    <td className="px-5 py-4 text-[#8a9099]">{formatDate(row.submitted_at)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} />
                      {isSof ? (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-[#4d9fff]">SOF</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={pendingId === row.id || row.status === "approved" || isDenied}
                          onClick={() => void handleApprove(row)}
                          className={adminBtnSuccess}
                        >
                          Approve
                        </button>
                        {isApproved && row.email ? (
                          <>
                            <button
                              type="button"
                              disabled={pendingId === row.id}
                              onClick={() => void handleResetPlatformPassword(row)}
                              className={adminBtnGhost}
                            >
                              Reset platform password
                            </button>
                            {isSof ? (
                              <button
                                type="button"
                                disabled={pendingId === row.id}
                                onClick={() => void handleResetSofCode(row)}
                                className={adminBtnGhost}
                              >
                                Reset SOF code
                              </button>
                            ) : null}
                          </>
                        ) : null}
                        <button
                          type="button"
                          disabled={pendingId === row.id || row.status === "denied"}
                          onClick={() => void handleDeny(row.id)}
                          className={adminBtnDanger}
                        >
                          Deny
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
                    <tr className={isDenied ? "opacity-50" : ""}>
                      <td colSpan={7} className="border-t border-white/[0.06] bg-[#080a0c]/60 px-6 py-5 text-sm text-[#8a9099]">
                        <p>
                          <span className="text-white">Program:</span> {row.program || "—"}
                        </p>
                        <p className="mt-3 whitespace-pre-wrap">
                          <span className="text-white">Requirements:</span>
                          <br />
                          {row.requirements || "—"}
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
