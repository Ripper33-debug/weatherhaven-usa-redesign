/** Build /contact links with optional product and inquiry context. */
export function contactUrl(params?: {
  system?: string;
  inquiry?: string;
  /** Pre-fills the message field (e.g. deployment coordinates). */
  deployment?: string;
}): string {
  const q = new URLSearchParams();
  if (params?.system?.trim()) q.set("system", params.system.trim());
  if (params?.inquiry?.trim()) q.set("inquiry", params.inquiry.trim());
  if (params?.deployment?.trim()) q.set("deployment", params.deployment.trim());
  const query = q.toString();
  return query ? `/contact?${query}` : "/contact";
}
