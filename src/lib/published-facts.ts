import { PRODUCT_CONTENT } from "@/lib/product-content";

/**
 * A pointer into a system's published content (src/lib/product-content.ts). The tested and
 * compare pages show only text that a ref resolves to, so every cell traces to a published figure;
 * published-facts.test.ts fails if a ref no longer matches.
 *
 * `text` must appear in the named field (case and spacing aside). `prefix`, when given, must
 * appear in the spec label or highlight title and is shown before the text ("4-module: 995 ft²").
 */
export type FactRef = {
  slug: string;
  field: "spec" | "highlight" | "description" | "keySpec" | "configuration" | "overview";
  /** Spec label, or highlight/configuration title, for those fields. */
  label?: string;
  text: string;
  prefix?: string;
};

const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

/** The full published string a ref points into, or undefined if the field or label is gone. */
export function refSource(ref: FactRef): string | undefined {
  const p = PRODUCT_CONTENT[ref.slug];
  if (!p) return undefined;
  switch (ref.field) {
    case "spec":
      return p.specs.find((s) => s.label === ref.label)?.value;
    case "highlight": {
      const h = p.highlights.find((x) => x.title === ref.label);
      return h ? `${h.title}. ${h.description}` : undefined;
    }
    case "configuration": {
      const c = p.configurations.find((x) => x.title === ref.label);
      return c ? `${c.title}. ${c.description}` : undefined;
    }
    case "description":
      return p.description;
    case "keySpec":
      return p.keySpec;
    case "overview":
      return p.overview.join(" ");
  }
}

/** True when the ref's text (and prefix) still appear in the published content. */
export function refHolds(ref: FactRef): boolean {
  const source = refSource(ref);
  if (!source || !norm(source).includes(norm(ref.text))) return false;
  if (ref.prefix && !norm(ref.label ?? "").includes(norm(ref.prefix))) return false;
  return true;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The text to show for a ref: its words as published, with a capital first letter. */
export function refText(ref: FactRef): string {
  return capitalize(ref.text.trim());
}

export function systemName(slug: string): string {
  return PRODUCT_CONTENT[slug]?.name ?? slug;
}

export function systemHref(slug: string): string {
  return `/configurable-solutions/${slug}`;
}
