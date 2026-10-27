import { EMAIL_SYSTEMS } from "@/lib/email-systems";
import type { EmailSetupSnapshot } from "@/lib/email-sender";
import { RESEND_SMTP } from "@/lib/email-sender";

function EnvPills({ keys }: { keys: readonly string[] }) {
  return (
    <p className="mt-2 flex flex-wrap gap-1.5">
      {keys.map((key) => (
        <code
          key={key}
          className="rounded border border-white/[0.08] bg-black/30 px-1.5 py-0.5 text-[10px] text-zinc-400"
        >
          {key}
        </code>
      ))}
    </p>
  );
}

function SetupRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="shrink-0 text-[10px] font-medium tracking-wide text-zinc-600 uppercase">{label}</span>
      <code className="break-all text-xs text-zinc-300">{value}</code>
    </div>
  );
}

export function AdminEmailGuide({ setup }: { setup: EmailSetupSnapshot }) {
  return (
    <div className="mb-8 rounded-xl border border-white/[0.06] bg-[#111113] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-emerald-400 uppercase">Email systems</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
            Program mail uses <span className="text-zinc-200">Resend</span>. Sign-in and forgot password use{" "}
            <span className="text-zinc-200">Supabase Auth</span> — connect Supabase SMTP to Resend so recovery mail
            matches your branded sender.
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase ${
            setup.resendConfigured
              ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
              : "border-amber-500/30 bg-amber-950/40 text-amber-200"
          }`}
        >
          {setup.resendConfigured ? "Resend configured" : "Resend not configured"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/[0.06] bg-[#0c0c0e] p-4">
          <h4 className="text-sm font-medium text-white">{EMAIL_SYSTEMS.resend.title}</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{EMAIL_SYSTEMS.resend.description}</p>
          <EnvPills keys={EMAIL_SYSTEMS.resend.env} />
          <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
            <SetupRow label="Sender" value={setup.emailFrom || "Set EMAIL_FROM in Vercel"} />
            {setup.notifyTo ? <SetupRow label="Notify" value={setup.notifyTo} /> : null}
          </div>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-[#0c0c0e] p-4">
          <h4 className="text-sm font-medium text-white">{EMAIL_SYSTEMS.supabaseAuth.title}</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{EMAIL_SYSTEMS.supabaseAuth.description}</p>
          <EnvPills keys={EMAIL_SYSTEMS.supabaseAuth.env} />
          <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
            <SetupRow label="Site URL" value={setup.siteUrl} />
            <SetupRow label="Redirect URL" value={setup.resetRedirectUrl} />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-4">
        <h4 className="text-sm font-medium text-emerald-200">Supabase SMTP → Resend (copy into Supabase dashboard)</h4>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
          Authentication → Emails → SMTP settings. Use the same API key as <code className="text-zinc-400">RESEND_API_KEY</code>{" "}
          for the password field.
        </p>
        <div className="mt-3 space-y-2">
          <SetupRow label="Sender name" value={setup.senderName} />
          <SetupRow label="Sender email" value={setup.senderEmail} />
          <SetupRow label="Host" value={RESEND_SMTP.host} />
          <SetupRow label="Port" value={String(RESEND_SMTP.port)} />
          <SetupRow label="Username" value={RESEND_SMTP.username} />
          <SetupRow label="Password" value="Your RESEND_API_KEY" />
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-600">
        Full checklist: <code className="text-zinc-500">docs/EMAIL_SETUP.md</code> · Branded recovery template:{" "}
        <code className="text-zinc-500">supabase/auth-email-templates/recovery.html</code>
      </p>
    </div>
  );
}
