import { getSiteUrl } from "@/lib/site-url";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";
import { weatherhavenLogoAbsoluteUrl, weatherhavenLogoEmailDimensions } from "@/lib/brand";

/** Shield premium transactional email system — table layout, inline CSS only. */
const C = {
  bg: "#080a0c",
  panel: "#0d0f12",
  panelEdge: "#141820",
  text: "#fafafa",
  muted: "#8a9099",
  mutedDim: "rgba(255,255,255,0.45)",
  accent: "#4d9fff",
  accentDim: "rgba(77,159,255,0.35)",
  border: "rgba(255,255,255,0.08)",
  borderGlow: "rgba(77,159,255,0.22)",
} as const;

const FONT_SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FONT_SERIF =
  "'Playfair Display', Georgia, 'Times New Roman', Times, serif";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ShieldEmailRow = { label: string; value: string };

function emailHeader(eyebrow: string): string {
  const safeEyebrow = escapeHtml(eyebrow);
  const logoUrl = escapeHtml(weatherhavenLogoAbsoluteUrl(getSiteUrl()));
  const logo = weatherhavenLogoEmailDimensions(28);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:0 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle;">
                <img src="${logoUrl}" alt="Weatherhaven" width="${logo.width}" height="${logo.height}" style="display:block;border:0;outline:none;text-decoration:none;height:${logo.height}px;width:auto;max-width:${logo.width}px;" />
                <p style="margin:8px 0 0;font-family:${FONT_SANS};font-size:10px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:${C.mutedDim};">Deployable shelter systems</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="height:1px;background:linear-gradient(90deg,${C.accent} 0%,${C.accentDim} 35%,${C.border} 100%);font-size:0;line-height:0;">&nbsp;</td>
      </tr>
      <tr>
        <td style="padding:20px 0 0;">
          <p style="margin:0;font-family:${FONT_SANS};font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:${C.muted};">${safeEyebrow}</p>
        </td>
      </tr>
    </table>`;
}

function emailFooter(): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
      <tr>
        <td style="padding:0 0 20px;font-family:${FONT_SANS};font-size:13px;line-height:1.55;color:${C.muted};">
          <strong style="color:${C.text};font-weight:600;">Program desk</strong><br />
          Reply to this message for questions about your request or credentials.
        </td>
      </tr>
      <tr>
        <td style="height:1px;background:${C.border};font-size:0;line-height:0;">&nbsp;</td>
      </tr>
      <tr>
        <td style="padding:24px 0 0;font-family:${FONT_SANS};font-size:11px;line-height:1.65;color:${C.muted};">
          ${COMPANY_CONTACT.legalName}<br />
          <a href="https://www.weatherhaven.com" style="color:${C.accent};text-decoration:none;">weatherhaven.com</a>
          <span style="color:${C.mutedDim};"> · </span>
          <a href="https://www.weatherhaven.com/ContactUs" style="color:${C.accent};text-decoration:none;">Corporate contact</a>
          <span style="color:${C.mutedDim};"> · </span>
          <a href="${companyPhoneHref(COMPANY_CONTACT.phone)}" style="color:${C.accent};text-decoration:none;">${COMPANY_CONTACT.phone}</a>
        </td>
      </tr>
    </table>`;
}

function emailShell(options: {
  eyebrow: string;
  bodyHtml: string;
  preheader?: string;
  variant?: "default" | "secure";
}): string {
  const preheader = options.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(options.preheader)}</div>`
    : "";
  const secureBadge =
    options.variant === "secure"
      ? `<tr><td style="padding:0 0 16px;"><span style="display:inline-block;padding:6px 12px;border:1px solid ${C.borderGlow};background:rgba(77,159,255,0.08);font-family:${FONT_SANS};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${C.accent};">Secure delivery</span></td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Playfair+Display:wght@500&amp;display=swap" rel="stylesheet" />
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${C.bg};-webkit-text-size-adjust:100%;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};">
    <tr>
      <td align="center" style="padding:48px 16px 56px;">
        <!-- Outer glow frame -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border:1px solid ${C.border};background-color:${C.panel};">
          <!-- Top accent rail -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${C.accent} 0%,#2a6bb8 50%,${C.accentDim} 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Geometric corner detail -->
          <tr>
            <td style="padding:0;background:linear-gradient(135deg,rgba(77,159,255,0.06) 0%,transparent 42%);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 36px 0;">
                    ${emailHeader(options.eyebrow)}
                    ${secureBadge}
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 36px 36px;">
                    ${options.bodyHtml}
                    ${emailFooter()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Subtle bottom mark -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin-top:20px;">
          <tr>
            <td align="center" style="font-family:${FONT_SANS};font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.2);">
              Engineered for expeditionary operations
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function headline(text: string): string {
  return `<h1 style="margin:0 0 18px;font-family:${FONT_SERIF};font-size:34px;font-weight:500;line-height:1.12;letter-spacing:-0.02em;color:${C.text};">${text}</h1>`;
}

function lead(text: string): string {
  return `<p style="margin:0 0 20px;font-family:${FONT_SANS};font-size:17px;line-height:1.65;color:${C.muted};">${text}</p>`;
}

function copy(text: string): string {
  return `<p style="margin:0 0 14px;font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${C.muted};">${text}</p>`;
}

function premiumPanel(title: string, innerHtml: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;border:1px solid ${C.border};background:linear-gradient(165deg,${C.panelEdge} 0%,${C.panel} 55%,${C.bg} 100%);">
      <tr>
        <td style="width:3px;background:${C.accent};font-size:0;line-height:0;">&nbsp;</td>
        <td style="padding:22px 24px;">
          <p style="margin:0 0 14px;font-family:${FONT_SANS};font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${C.muted};">${escapeHtml(title)}</p>
          ${innerHtml}
        </td>
      </tr>
    </table>`;
}

function timelineSteps(steps: string[]): string {
  const rows = steps
    .map(
      (step, i) => `
      <tr>
        <td width="28" valign="top" style="padding:0 14px 16px 0;font-family:${FONT_SANS};font-size:12px;font-weight:600;color:${C.accent};">
          ${String(i + 1).padStart(2, "0")}
        </td>
        <td valign="top" style="padding:0 0 16px;font-family:${FONT_SANS};font-size:14px;line-height:1.55;color:${C.muted};">
          ${step}
        </td>
      </tr>`,
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">
      ${rows}
    </table>`;
}

function dataGrid(rows: ShieldEmailRow[]): string {
  const tr = rows
    .map(
      (row) => `
      <tr>
        <td style="padding:12px 0;width:36%;vertical-align:top;font-family:${FONT_SANS};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${C.mutedDim};border-bottom:1px solid ${C.border};">
          ${escapeHtml(row.label)}
        </td>
        <td style="padding:12px 0;font-family:${FONT_SANS};font-size:15px;line-height:1.5;color:${C.text};border-bottom:1px solid ${C.border};">
          ${row.value.includes("<") ? row.value : escapeHtml(row.value)}
        </td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">${tr}</table>`;
}

function summaryFields(lines: { label: string; value: string }[]): string {
  const items = lines
    .map(
      (line) => `
      <p style="margin:0 0 12px;font-family:${FONT_SANS};font-size:14px;line-height:1.5;">
        <span style="display:block;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${C.mutedDim};margin-bottom:4px;">${escapeHtml(line.label)}</span>
        <span style="color:${C.text};">${line.value}</span>
      </p>`,
    )
    .join("");
  return items;
}

function ctaButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;">
      <tr>
        <td style="background-color:${C.text};border-radius:2px;">
          <a href="${safeHref}" style="display:inline-block;padding:15px 32px;font-family:${FONT_SANS};font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;color:${C.bg};">
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>`;
}

function secondaryLink(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `
    <p style="margin:14px 0 0;font-family:${FONT_SANS};font-size:13px;line-height:1.5;text-align:left;">
      <a href="${safeHref}" style="color:${C.accent};text-decoration:none;border-bottom:1px solid ${C.accentDim};">${safeLabel}</a>
    </p>`;
}

/** Highlighted credential block — reliable in Gmail mobile. */
function credentialHighlight(label: string, valueHtml: string, large = false): string {
  const fontSize = large ? "32px" : "16px";
  const letterSpacing = large ? "0.28em" : "0.06em";
  const padding = large ? "28px 20px" : "18px 20px";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 0;border:1px solid ${C.borderGlow};background:rgba(77,159,255,0.06);">
      <tr>
        <td style="padding:${padding};text-align:center;">
          <p style="margin:0 0 12px;font-family:${FONT_SANS};font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${C.muted};">${escapeHtml(label)}</p>
          <p style="margin:0;font-family:ui-monospace,Menlo,Consolas,'Courier New',monospace;font-size:${fontSize};font-weight:600;letter-spacing:${letterSpacing};line-height:1.3;color:${C.accent};">
            ${valueHtml}
          </p>
        </td>
      </tr>
    </table>`;
}

function referenceBadge(reference: string): string {
  const ref = escapeHtml(reference.trim());
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
      <tr>
        <td style="padding:10px 16px;border:1px solid ${C.border};background:${C.panelEdge};">
          <span style="font-family:${FONT_SANS};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${C.mutedDim};">Reference&nbsp;</span>
          <span style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;font-weight:600;letter-spacing:0.08em;color:${C.accent};">${ref}</span>
        </td>
      </tr>
    </table>`;
}

function statusPill(text: string): string {
  return `<span style="display:inline-block;margin:0 0 20px;padding:8px 14px;border:1px solid ${C.borderGlow};background:rgba(77,159,255,0.1);font-family:${FONT_SANS};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${C.accent};">${escapeHtml(text)}</span>`;
}

function firstNameFrom(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed || trimmed === "Not provided") return "there";
  return escapeHtml(trimmed.split(/\s+/)[0] ?? "there");
}

/** Contact / demo — confirmation to submitter */
export function contactConfirmationEmail(params: {
  fullName: string;
  organization: string;
  inquiryType: string;
  program?: string | null;
}): string {
  const first = firstNameFrom(params.fullName);
  const isDemo = params.inquiryType.trim() === "Demo Request";
  const lines = [
    { label: "Organization", value: escapeHtml(params.organization) },
    { label: "Inquiry type", value: escapeHtml(params.inquiryType) },
  ];
  if (params.program?.trim()) {
    lines.push({ label: "Program / system", value: escapeHtml(params.program.trim()) });
  }

  const body = `
    ${statusPill(isDemo ? "Demo request logged" : "Inquiry received")}
    ${headline(isDemo ? `We&rsquo;ll schedule your demo, ${first}.` : `Message received, ${first}.`)}
    ${lead(
      isDemo
        ? "Your capability briefing request is in our engineering queue. We match demos to program scope and environment."
        : "Your engineering inquiry has been routed to the Weatherhaven program team.",
    )}
    ${premiumPanel("Submission summary", summaryFields(lines))}
    ${premiumPanel(
      "What happens next",
      timelineSteps([
        "An engineer reviews your request within one business day.",
        "We reply within <strong style=\"color:${C.text};\">48 hours</strong> at the email you provided.",
        "Platform credentials are never included in this email — access is issued separately after approval.",
      ]),
    )}
    ${secondaryLink("https://www.weatherhaven.com", "Explore weatherhaven.com →")}
  `;

  return emailShell({
    eyebrow: isDemo ? "Capability demo" : "Engineering inquiry",
    preheader: isDemo
      ? "Your demo request is confirmed — our team will respond within 48 hours."
      : "We received your inquiry — our program team will respond within 48 hours.",
    bodyHtml: body,
  });
}

/** Contact — internal notification */
export function contactAdminEmail(rows: ShieldEmailRow[]): string {
  const submitterEmail = rows.find((r) => r.label === "Email")?.value ?? "";
  const body = `
    ${statusPill("New lead")}
    ${headline("Engineering inquiry")}
    ${lead("Submitted via the website contact form. Reply directly to the submitter.")}
    ${premiumPanel("Lead details", dataGrid(rows))}
    ${ctaButton(`mailto:${escapeHtml(submitterEmail)}`, "Reply to submitter")}
  `;
  return emailShell({
    eyebrow: "Internal · Sales engineering",
    preheader: "New contact lead — action required",
    bodyHtml: body,
  });
}

/** Request access / mission builder — confirmation */
export function requestAccessConfirmationEmail(params: {
  name: string;
  organization: string;
  role: string;
  reference?: string;
}): string {
  const first = firstNameFrom(params.name);
  const lines = [
    { label: "Organization", value: escapeHtml(params.organization) },
    { label: "Role / title", value: escapeHtml(params.role) },
  ];
  const refBlock = params.reference?.trim() ? referenceBadge(params.reference) : "";

  const body = `
    ${statusPill("Request logged")}
    ${refBlock}
    ${headline(`Access request received, ${first}.`)}
    ${lead("Your submission is under program review. We verify affiliation before any technical exchange or platform credentials.")}
    ${premiumPanel("Your submission", summaryFields(lines))}
    ${premiumPanel(
      "Review timeline",
      timelineSteps([
        "Program team validates organization and mission fit.",
        "You hear from Weatherhaven within <strong style=\"color:${C.text};\">48 hours</strong>.",
        "Approved users receive a separate secure email with sign-in credentials.",
      ]),
    )}
    ${copy("This confirmation does not grant platform access.")}
  `;

  return emailShell({
    eyebrow: "Program access",
    preheader: params.reference?.trim()
      ? `Request ${params.reference.trim()} received — review in progress.`
      : "Your access request was received — our program team will respond within 48 hours.",
    bodyHtml: body,
  });
}

/** SOF secure section — access request confirmation (no credentials). */
export function sofRequestAccessConfirmationEmail(params: {
  name: string;
  reference?: string;
}): string {
  const first = firstNameFrom(params.name);
  const refBlock = params.reference?.trim() ? referenceBadge(params.reference) : "";

  const body = `
    ${statusPill("SOF request logged")}
    ${refBlock}
    ${headline(`Request received, ${first}.`)}
    ${lead("Your request for the Weatherhaven Special Operations secure section is in review. We verify eligibility before issuing a four-digit access code.")}
    ${premiumPanel(
      "If approved",
      timelineSteps([
        "You receive a <strong style=\"color:${C.text};\">separate email</strong> with your four-digit access code.",
        "Sign in at the SOF portal with your official email and that code.",
        "This message does not contain credentials or grant access.",
      ]),
    )}
    ${premiumPanel(
      "Review timeline",
      timelineSteps([
        "Program validation — typically within one business day.",
        "Approval email with access code (if approved).",
        "Secure workspace at <strong style=\"color:${C.text};\">Special Operations</strong> on weatherhavenusa.com.",
      ]),
    )}
    ${copy("Keep your reference ID handy when following up with our team.")}
  `;

  return emailShell({
    eyebrow: "Special Operations",
    preheader: params.reference?.trim()
      ? `SOF request ${params.reference.trim()} received — credentials sent only if approved.`
      : "Your SOF access request was received — credentials sent only if approved.",
    bodyHtml: body,
    variant: "secure",
  });
}

/** Request access — internal notification */
export function requestAccessAdminEmail(params: {
  name: string;
  rows: ShieldEmailRow[];
  source?: string;
}): string {
  const source = escapeHtml(params.source?.trim() || "Request access");
  const body = `
    ${statusPill(source)}
    ${headline(escapeHtml(params.name))}
    ${lead("New program access submission from weatherhavenusa.com")}
    ${premiumPanel("Submission data", dataGrid(params.rows))}
  `;
  return emailShell({
    eyebrow: "Internal · Program intake",
    preheader: `New ${source} submission`,
    bodyHtml: body,
  });
}

/** SOF secure section — four-digit access code */
export function sofAccessApprovedEmail(params: {
  email: string;
  pin: string;
  loginUrl?: string;
}): string {
  const login = escapeHtml(params.loginUrl ?? `${getSiteUrl()}/sof-solutions/login`);
  const pin = escapeHtml(params.pin.trim());
  const body = `
    ${statusPill("Access approved")}
    ${headline("Your SOF secure access is ready")}
    ${lead("Sign in with your official email and the four-digit code below. This is for the <strong style=\"color:${C.text};\">Special Operations</strong> workspace only — not the admin platform.")}
    ${credentialHighlight("Access code", pin, true)}
    ${premiumPanel(
      "Sign-in details",
      summaryFields([
        { label: "Sign-in URL", value: `<a href="${login}" style="color:${C.accent};text-decoration:none;word-break:break-all;">${login}</a>` },
        { label: "Email", value: escapeHtml(params.email) },
      ]),
    )}
    ${ctaButton(login, "Sign in to SOF section")}
    ${copy("Confidential. Do not forward this email or share your access code.")}
  `;

  return emailShell({
    eyebrow: "Special Operations",
    preheader: "Your four-digit SOF access code is ready — sign in at the secure portal.",
    variant: "secure",
    bodyHtml: body,
  });
}

/** Platform access approved */
export function platformAccessApprovedEmail(params: {
  email: string;
  password: string;
  loginUrl?: string;
}): string {
  const login = escapeHtml(params.loginUrl ?? `${getSiteUrl()}/login`);
  const password = escapeHtml(params.password);
  const body = `
    ${statusPill("Access approved")}
    ${headline("Your admin platform access is ready")}
    ${lead("These credentials are for the <strong style=\"color:${C.text};\">admin platform</strong> (program tools and dashboard) — not the SOF secure section. Change your password immediately after your first sign-in.")}
    ${credentialHighlight("Temporary password", password)}
    ${premiumPanel(
      "Sign-in details",
      summaryFields([
        { label: "Sign-in URL", value: `<a href="${login}" style="color:${C.accent};text-decoration:none;word-break:break-all;">${login}</a>` },
        { label: "Email", value: escapeHtml(params.email) },
      ]),
    )}
    ${ctaButton(login, "Sign in to platform")}
    ${copy(`<strong style="color:${C.text};">Confidential.</strong> Do not forward this email or share credentials.`)}
  `;

  return emailShell({
    eyebrow: "Platform access",
    preheader: "Your admin platform credentials are ready — change your password after first sign-in.",
    variant: "secure",
    bodyHtml: body,
  });
}

/** Access request not approved — customer notification */
export function accessRequestDeniedEmail(params: {
  name: string;
  organization?: string | null;
  reference?: string | null;
  isSof?: boolean;
}): string {
  const first = firstNameFrom(params.name);
  const refBlock = params.reference?.trim() ? referenceBadge(params.reference) : "";
  const programLine = params.isSof
    ? "Special Operations secure section"
    : "program platform";

  const body = `
    ${statusPill("Review complete")}
    ${refBlock}
    ${headline(`Update on your access request, ${first}.`)}
    ${lead(`Thank you for your interest in Weatherhaven. After program review, we are unable to approve access to the ${programLine} at this time.`)}
    ${premiumPanel(
      "What this means",
      timelineSteps([
        "This decision does not reflect on your organization&rsquo;s standing with Weatherhaven broadly.",
        "You may still reach our program desk for engineering inquiries or capability briefings on the public site.",
        "If your mission scope changes, you may submit a new request in the future.",
      ]),
    )}
    ${copy("Reply to this message if you believe this decision was made in error — include your reference ID if you have one.")}
  `;

  return emailShell({
    eyebrow: params.isSof ? "Special Operations" : "Program access",
    preheader: params.reference?.trim()
      ? `Access request ${params.reference.trim()} — not approved at this time.`
      : "Your access request was reviewed — not approved at this time.",
    bodyHtml: body,
  });
}

/** Platform invitation */
export function platformInviteEmail(params: { acceptUrl: string }): string {
  const url = escapeHtml(params.acceptUrl);
  const body = `
    ${statusPill("Invitation pending")}
    ${headline("You&rsquo;re invited to the platform")}
    ${lead("Accept within <strong style=\"color:${C.text};\">7 days</strong> to configure your account and access deployable infrastructure planning tools.")}
    ${ctaButton(url, "Accept invitation")}
    ${copy("This link is single-use. If it expires, contact the program desk to request a new invitation.")}
    ${secondaryLink("https://www.weatherhaven.com/ContactUs", "Corporate contact →")}
  `;

  return emailShell({
    eyebrow: "Platform invitation",
    preheader: "Accept your Weatherhaven platform invitation within 7 days.",
    variant: "secure",
    bodyHtml: body,
  });
}
