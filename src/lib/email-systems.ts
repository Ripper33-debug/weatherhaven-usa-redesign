/** Shared copy — which subsystem sends which email (Resend vs Supabase Auth). */

export const EMAIL_SYSTEMS = {
  resend: {
    title: "Program email (Resend)",
    description:
      "Contact confirmations, access requests, approvals, invitations, and operator-initiated platform passwords.",
    env: ["RESEND_API_KEY", "EMAIL_FROM", "NOTIFY_TO"],
  },
  supabaseAuth: {
    title: "Sign-in & password reset (Supabase Auth)",
    description:
      "Forgot password on /login and recovery links. Connect Supabase SMTP to Resend and set redirect URL to /auth/reset-password.",
    env: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SITE_URL"],
  },
} as const;

export const FORGOT_PASSWORD_FOOTER =
  "Reset links are sent from Weatherhaven Programs on your verified domain when Supabase SMTP is connected to Resend. Program inquiries and approvals are delivered separately through the same sender.";

export const FORGOT_PASSWORD_SENT_NOTE =
  "If an account exists for this address, you will receive a reset link shortly. Check spam and allow a few minutes for delivery.";
