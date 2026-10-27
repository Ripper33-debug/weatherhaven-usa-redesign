const SYSTEM_PREFIX = "wh:system:";

/** Encode optional product slug into marker notes (DB has no product column). */
export function encodeMarkerNotes(systemSlug: string | null, userNotes: string): string | null {
  const text = userNotes.trim();
  if (!systemSlug) return text || null;
  const header = `${SYSTEM_PREFIX}${systemSlug}`;
  if (!text) return header;
  return `${header}\n${text}`;
}

export function decodeMarkerNotes(notes: string | null): {
  systemSlug: string | null;
  text: string;
} {
  if (!notes?.trim()) return { systemSlug: null, text: "" };
  const lines = notes.split("\n");
  const first = lines[0]?.trim() ?? "";
  if (first.startsWith(SYSTEM_PREFIX)) {
    const slug = first.slice(SYSTEM_PREFIX.length).trim();
    return {
      systemSlug: slug || null,
      text: lines.slice(1).join("\n").trim(),
    };
  }
  return { systemSlug: null, text: notes.trim() };
}

export function markerDisplayLabel(
  index: number,
  customLabel: string | null,
  productName: string | null,
): string {
  if (customLabel?.trim()) return customLabel.trim();
  if (productName) return `${productName} · Point ${index + 1}`;
  return `Deployment point ${index + 1}`;
}
