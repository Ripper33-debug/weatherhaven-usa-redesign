export const MAX_FIELD_LENGTH = 500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTML_TAG_RE = /<[^>]*>/;

export type ValidationResult = { ok: true; value: string } | { ok: false; error: string };

function reject(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

export function containsHtmlOrScript(value: string): boolean {
  if (HTML_TAG_RE.test(value)) return true;
  const lower = value.toLowerCase();
  return lower.includes("<script") || lower.includes("javascript:");
}

export function validateEmailField(value: unknown, fieldName = "Email"): ValidationResult {
  if (typeof value !== "string") return reject(`${fieldName} is required.`);
  const trimmed = value.trim();
  if (!trimmed) return reject(`${fieldName} is required.`);
  if (trimmed.length > MAX_FIELD_LENGTH) {
    return reject(`${fieldName} must be ${MAX_FIELD_LENGTH} characters or fewer.`);
  }
  if (containsHtmlOrScript(trimmed)) {
    return reject(`${fieldName} must not contain HTML or script content.`);
  }
  if (!EMAIL_RE.test(trimmed)) {
    return reject(`${fieldName} must be a valid email address.`);
  }
  return { ok: true, value: trimmed.toLowerCase() };
}

export function validateStringField(
  value: unknown,
  fieldName: string,
  { required = true, maxLength = MAX_FIELD_LENGTH }: { required?: boolean; maxLength?: number } = {},
): ValidationResult {
  if (value === null || value === undefined || value === "") {
    if (!required) return { ok: true, value: "" };
    return reject(`${fieldName} is required.`);
  }
  if (typeof value !== "string") return reject(`${fieldName} must be text.`);
  const trimmed = value.trim();
  if (!trimmed && required) return reject(`${fieldName} is required.`);
  if (trimmed.length > maxLength) {
    return reject(`${fieldName} must be ${maxLength} characters or fewer.`);
  }
  if (containsHtmlOrScript(trimmed)) {
    return reject(`${fieldName} must not contain HTML or script content.`);
  }
  return { ok: true, value: trimmed };
}

export function validateOptionalStringField(
  value: unknown,
  fieldName: string,
  maxLength = MAX_FIELD_LENGTH,
): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: "" };
  }
  return validateStringField(value, fieldName, { required: false, maxLength });
}

export function validateRecordPayload(
  value: unknown,
  fieldName = "Payload",
): { ok: true; value: Record<string, unknown> | undefined } | { ok: false; error: string } {
  if (value === null || value === undefined) {
    return { ok: true, value: undefined };
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    return reject(`${fieldName} must be an object.`);
  }
  const serialized = JSON.stringify(value);
  if (serialized.length > MAX_FIELD_LENGTH * 4) {
    return reject(`${fieldName} is too large.`);
  }
  if (containsHtmlOrScript(serialized)) {
    return reject(`${fieldName} must not contain HTML or script content.`);
  }
  return { ok: true, value: value as Record<string, unknown> };
}
