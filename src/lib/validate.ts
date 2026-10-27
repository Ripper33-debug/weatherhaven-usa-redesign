export function sanitizeString(str: string, maxLength = 500): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRequired(fields: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return `${key} is required`;
    }
  }
  return null;
}
