"use client";

import { useState } from "react";
import { adminResendInvite, adminSendInvite } from "../actions";
import type { InviteRow } from "@/lib/invites";
import {
  AdminBanner,
  AdminEmpty,
  AdminTableShell,
  adminBtnGhost,
  adminBtnPrimary,
  adminInputClass,
} from "./admin-ui";

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function InvitesTable({ initialInvites }: { initialInvites: InviteRow[] }) {
  const invites = initialInvites;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    setPending(true);
    const res = await adminSendInvite(email, name);
    setPending(false);
    if (res.ok) {
      setBanner({ type: "success", text: `Invitation sent to ${email.trim()}` });
      setEmail("");
      setName("");
      window.location.reload();
    } else {
      setBanner({ type: "error", text: res.error });
    }
  }

  async function handleResend(id: string) {
    setResendingId(id);
    const res = await adminResendInvite(id);
    setResendingId(null);
    if (res.ok) {
      setBanner({ type: "success", text: "Invitation resent." });
    } else {
      setBanner({ type: "error", text: res.error });
    }
  }

  const pendingInvites = invites.filter((i) => i.status === "pending");

  return (
    <div className="space-y-8">
      {banner ? <AdminBanner type={banner.type} message={banner.text} /> : null}

      <div className="wh-marketing-panel p-6 sm:p-8">
        <h3 className="text-sm font-medium text-white">Send invitation</h3>
        <p className="mt-1 text-sm text-[#8a9099]">Creates a pending invite and emails an accept link.</p>
        <form className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={handleInvite}>
          <div>
            <label htmlFor="invite-email" className="text-[11px] font-medium tracking-wide text-[#8a9099] uppercase">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@organization.mil"
              className={`${adminInputClass} mt-1.5`}
            />
          </div>
          <div>
            <label htmlFor="invite-name" className="text-[11px] font-medium tracking-wide text-[#8a9099] uppercase">
              Name
            </label>
            <input
              id="invite-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
              className={`${adminInputClass} mt-1.5`}
            />
          </div>
          <button type="submit" disabled={pending} className={`${adminBtnPrimary} min-h-[46px] px-8`}>
            {pending ? "Sending…" : "Invite"}
          </button>
        </form>
      </div>

      {pendingInvites.length === 0 ? (
        <AdminEmpty message="No pending invitations." />
      ) : (
        <AdminTableShell>
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#080a0c]/80 text-[11px] tracking-wide text-[#8a9099] uppercase">
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Invited</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingInvites.map((invite) => (
                <tr
                  key={invite.id}
                  className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 text-white">{invite.email}</td>
                  <td className="px-5 py-4 text-[#8a9099]">{invite.name || "—"}</td>
                  <td className="px-5 py-4 text-[#8a9099]">{formatDateTime(invite.invited_at)}</td>
                  <td className="px-5 py-4 capitalize text-[#8a9099]">{invite.status}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      disabled={resendingId === invite.id}
                      onClick={() => void handleResend(invite.id)}
                      className={adminBtnGhost}
                    >
                      Resend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      )}
    </div>
  );
}
