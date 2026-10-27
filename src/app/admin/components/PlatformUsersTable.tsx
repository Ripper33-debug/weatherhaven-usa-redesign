"use client";

import { useState } from "react";
import { adminDeleteUser, adminResetPlatformPassword, adminResetSofAccessCode, type AdminUserRow } from "../actions";
import {
  AdminBanner,
  AdminEmpty,
  AdminTableShell,
  adminBtnDanger,
  adminBtnGhost,
  adminBtnPrimary,
} from "./admin-ui";

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

export function AdminOperatorPasswordCard({
  adminEmail,
  operatorEmail,
  isOperatorSession,
}: {
  adminEmail: string;
  operatorEmail: string | undefined;
  isOperatorSession: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!adminEmail.trim()) {
    return (
      <div className="mb-6 rounded border border-amber-500/30 bg-amber-950/20 px-5 py-4 text-sm text-amber-100">
        Set <code className="text-white">ADMIN_EMAIL</code> in your environment to identify the operator account.
      </div>
    );
  }

  async function resetMyPassword() {
    if (!confirm(`Send a new platform password to ${adminEmail}? You will use it at /login.`)) return;
    setPending(true);
    setMessage(null);
    const res = await adminResetPlatformPassword(adminEmail);
    setPending(false);
    if (!res.ok) {
      setMessage({ type: "error", text: res.error });
      return;
    }
    setMessage({
      type: "success",
      text: res.emailSent
        ? `New password sent via Resend to ${adminEmail}. Sign in at /login.`
        : "Password updated in Supabase. Configure RESEND_API_KEY and EMAIL_FROM to email the new password automatically.",
    });
  }

  return (
    <div className="mb-8 rounded border border-[#4d9fff]/25 bg-[#4d9fff]/5 px-5 py-5 sm:px-6">
      <h3 className="text-sm font-medium text-white">Your operator account</h3>
      <p className="mt-2 text-sm text-[#8a9099]">
        Admin sign-in at <span className="text-white">/login</span> uses a platform password (not the SOF four-digit
        code). Operator email: <span className="font-medium text-white">{adminEmail}</span>
        {isOperatorSession ? null : (
          <span className="block mt-1 text-amber-200/90">
            You are signed in as {operatorEmail ?? "unknown"} — reset below only updates {adminEmail}.
          </span>
        )}
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => void resetMyPassword()}
        className={`mt-4 ${adminBtnPrimary} disabled:opacity-60`}
      >
        {pending ? "Resetting…" : "Reset my admin password & email"}
      </button>
      {message ? (
        <p className={`mt-3 text-sm ${message.type === "error" ? "text-red-300" : "text-[#4ade80]"}`}>{message.text}</p>
      ) : null}
    </div>
  );
}

export function PlatformUsersTable({
  users,
  onUsersChange,
}: {
  users: AdminUserRow[];
  onUsersChange: (next: AdminUserRow[]) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleResetPlatform(email: string, userId: string) {
    if (!confirm(`Reset platform password for ${email}? They sign in at /login.`)) return;
    setPendingId(userId);
    setBanner(null);
    const res = await adminResetPlatformPassword(email);
    setPendingId(null);
    if (!res.ok) {
      setBanner({ type: "error", text: res.error });
      return;
    }
    setBanner({
      type: "success",
      text: res.emailSent
        ? `Platform password emailed to ${email}.`
        : "Platform password reset — configure RESEND_API_KEY to email automatically.",
    });
  }

  async function handleResetSof(email: string, userId: string) {
    if (!confirm(`Reset SOF four-digit code for ${email}? They sign in at /sof-solutions/login.`)) return;
    setPendingId(userId);
    setBanner(null);
    const res = await adminResetSofAccessCode(email);
    setPendingId(null);
    if (!res.ok) {
      setBanner({ type: "error", text: res.error });
      return;
    }
    setBanner({
      type: "success",
      text: res.emailSent
        ? `New SOF code emailed to ${email}.`
        : "SOF code reset — configure RESEND_API_KEY to email automatically.",
    });
  }

  async function handleRemove(userId: string, email: string | undefined) {
    if (!confirm(`Remove account ${email ?? userId}? This cannot be undone.`)) return;
    setPendingId(userId);
    setBanner(null);
    const res = await adminDeleteUser(userId);
    setPendingId(null);
    if (!res.ok) {
      setBanner({ type: "error", text: res.error });
      return;
    }
    onUsersChange(users.filter((u) => u.id !== userId));
    setBanner({ type: "success", text: "User removed." });
  }

  if (users.length === 0) {
    return <AdminEmpty message="No platform users yet. Approve access requests or send invites." />;
  }

  return (
    <div>
      {banner ? <AdminBanner type={banner.type} message={banner.text} /> : null}
      <p className="mb-4 text-xs text-[#8a9099]">
        <strong className="text-white">Platform password</strong> → <code className="text-[#c5c9ce]">/login</code>{" "}
        (staff, admin, general platform).{" "}
        <strong className="text-white">SOF code</strong> →{" "}
        <code className="text-[#c5c9ce]">/sof-solutions/login</code> (four-digit member access).
      </p>
      <AdminTableShell>
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#080a0c]/80 text-[11px] tracking-wide text-[#8a9099] uppercase">
              <th className="px-5 py-3.5 font-medium">Email</th>
              <th className="px-5 py-3.5 font-medium">Created</th>
              <th className="px-5 py-3.5 font-medium">Last login</th>
              <th className="px-5 py-3.5 font-medium text-right">Password actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((row) => {
              const email = row.email ?? "";
              const busy = pendingId === row.id;
              return (
                <tr key={row.id} className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">
                    {email || "—"}
                    {row.isOperator ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-[#4d9fff]">Operator</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-[#8a9099]">{formatDateTime(row.created_at)}</td>
                  <td className="px-5 py-4 text-[#8a9099]">{formatDateTime(row.last_sign_in_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      {email ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleResetPlatform(email, row.id)}
                            className={adminBtnGhost}
                            title="New password for /login"
                          >
                            Reset platform password
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleResetSof(email, row.id)}
                            className={adminBtnGhost}
                            title="New four-digit code for /sof-solutions/login"
                          >
                            Reset SOF code
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleRemove(row.id, row.email)}
                        className={adminBtnDanger}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
