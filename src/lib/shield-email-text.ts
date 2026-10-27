/** Plain-text companions for Shield transactional emails (inbox preview + accessibility). */

import { COMPANY_CONTACT } from "@/lib/company-facts";

function shell(sections: string[], footerNote?: string): string {
  const lines = [
    "WEATHERHAVEN",
    "Deployable shelter systems",
    "",
    ...sections,
    "",
    "—",
    COMPANY_CONTACT.legalName,
    "https://www.weatherhaven.com",
    `Corporate contact: https://www.weatherhaven.com/ContactUs · ${COMPANY_CONTACT.phone}`,
  ];
  if (footerNote?.trim()) {
    lines.splice(lines.length - 4, 0, "", footerNote.trim());
  }
  return lines.join("\n");
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed || trimmed === "Not provided") return "there";
  return trimmed.split(/\s+/)[0] ?? "there";
}

export function contactConfirmationEmailText(params: {
  fullName: string;
  organization: string;
  inquiryType: string;
  program?: string | null;
}): string {
  const name = firstName(params.fullName);
  const isDemo = params.inquiryType.trim() === "Demo Request";
  const programLine = params.program?.trim()
    ? `\nProgram / system: ${params.program.trim()}`
    : "";

  return shell(
    [
      isDemo ? "CAPABILITY DEMO — REQUEST LOGGED" : "ENGINEERING INQUIRY — RECEIVED",
      "",
      isDemo
        ? `Hi ${name},`
        : `Hi ${name},`,
      "",
      isDemo
        ? "Your capability briefing request is in our engineering queue. We match demos to program scope and environment."
        : "Your engineering inquiry has been routed to the Weatherhaven program team.",
      "",
      "Submission summary",
      `Organization: ${params.organization}`,
      `Inquiry type: ${params.inquiryType}${programLine}`,
      "",
      "What happens next",
      "1. An engineer reviews your request within one business day.",
      "2. We reply within 48 hours at the email you provided.",
      "3. Platform credentials are never included in this email — access is issued separately after approval.",
    ],
    "Questions? Reply to this email.",
  );
}

export function requestAccessConfirmationEmailText(params: {
  name: string;
  organization: string;
  role: string;
  reference?: string;
}): string {
  const name = firstName(params.name);
  const ref = params.reference?.trim()
    ? `\nReference ID: ${params.reference.trim()}`
    : "";

  return shell(
    [
      "PROGRAM ACCESS — REQUEST LOGGED",
      "",
      `Hi ${name},`,
      "",
      "Your submission is under program review. We verify affiliation before any technical exchange or platform credentials.",
      "",
      "Your submission",
      `Organization: ${params.organization}`,
      `Role / title: ${params.role}${ref}`,
      "",
      "Review timeline",
      "1. Program team validates organization and mission fit.",
      "2. You hear from Weatherhaven within 48 hours.",
      "3. Approved users receive a separate secure email with sign-in credentials.",
      "",
      "This confirmation does not grant platform access.",
    ],
    "Questions? Reply to this email and include your reference ID if you have one.",
  );
}

export function sofRequestAccessConfirmationEmailText(params: {
  name: string;
  reference?: string;
}): string {
  const name = firstName(params.name);
  const ref = params.reference?.trim() ?? "";

  return shell(
    [
      "SPECIAL OPERATIONS — ACCESS REQUEST RECEIVED",
      "",
      `Hi ${name},`,
      "",
      "Your request for the Weatherhaven Special Operations secure section is logged. Our program team verifies eligibility before issuing credentials.",
      ref ? `\nReference ID: ${ref}` : "",
      "",
      "If approved",
      "• You will receive a separate email with a four-digit access code.",
      "• Sign in at the SOF portal using your official email and that code.",
      "• This message does not contain credentials.",
      "",
      "Review timeline",
      "1. Program validation (typically within one business day).",
      "2. Approval email with your access code (if approved).",
      "3. Sign in at the SOF secure workspace.",
    ].filter(Boolean),
    "Questions? Reply to this email and include your reference ID.",
  );
}

export function sofAccessApprovedEmailText(params: {
  email: string;
  pin: string;
  loginUrl: string;
}): string {
  return shell(
    [
      "SPECIAL OPERATIONS — ACCESS APPROVED",
      "",
      "Your Special Forces section access is ready.",
      "",
      "Sign-in URL:",
      params.loginUrl,
      "",
      `Email: ${params.email.trim()}`,
      `Access code: ${params.pin.trim()}`,
      "",
      "Sign in with your email and the four-digit code above. Do not share this code — it enables access to program-restricted materials.",
    ],
    "Questions? Reply to this email.",
  );
}

export function platformAccessApprovedEmailText(params: {
  email: string;
  password: string;
  loginUrl: string;
}): string {
  return shell(
    [
      "PLATFORM ACCESS — APPROVED",
      "",
      "Your platform credentials are ready.",
      "",
      "Sign-in URL:",
      params.loginUrl,
      "",
      `Email: ${params.email.trim()}`,
      `Temporary password: ${params.password}`,
      "",
      "Sign in and change your password immediately after your first login.",
      "Confidential — do not forward this email or share credentials.",
    ],
    "Questions? Reply to this email.",
  );
}

export function platformInviteEmailText(params: { acceptUrl: string }): string {
  return shell(
    [
      "PLATFORM INVITATION",
      "",
      "You are invited to the Weatherhaven platform.",
      "",
      "Accept your invitation (valid 7 days):",
      params.acceptUrl,
      "",
      `Questions: ${COMPANY_CONTACT.phone} · https://www.weatherhaven.com/ContactUs`,
    ],
    "Questions? Reply to this email.",
  );
}

export function accessRequestDeniedEmailText(params: {
  name: string;
  reference?: string | null;
  isSof?: boolean;
}): string {
  const name = firstName(params.name);
  const ref = params.reference?.trim()
    ? `\nReference ID: ${params.reference.trim()}`
    : "";
  const programLine = params.isSof
    ? "Special Operations secure section"
    : "program platform";

  return shell(
    [
      "PROGRAM ACCESS — REVIEW COMPLETE",
      "",
      `Hi ${name},`,
      "",
      `Thank you for your interest in Weatherhaven. After program review, we are unable to approve access to the ${programLine} at this time.${ref}`,
      "",
      "You may still contact our program desk for engineering inquiries on the public site.",
      "If your mission scope changes, you may submit a new request in the future.",
      "",
      "Reply to this message if you believe this decision was made in error.",
    ],
    "Questions? Reply to this email.",
  );
}
