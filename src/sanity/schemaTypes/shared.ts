import { defineArrayMember, defineField } from "sanity";
import { WEATHERHAVEN_PRODUCT_LINES } from "@/lib/weatherhaven-product-lines";

/** The site's systems, for fields that pick one (the slug is what the site's URLs use). */
export const SYSTEM_OPTIONS = WEATHERHAVEN_PRODUCT_LINES.map((p) => ({ title: p.name, value: p.slug }));

/**
 * A photo: upload one in the Studio, or keep the site's existing file (`legacySrc`, filled in by the
 * import). An uploaded image wins.
 */
export const photoField = (name: string, title: string, opts: { required?: boolean } = {}) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true } }),
      defineField({
        name: "legacySrc",
        title: "Existing photo on the site",
        type: "string",
        description: "Filled in by the import. Upload a photo above to replace it.",
        readOnly: true,
      }),
      defineField({ name: "alt", title: "Describe the photo (for screen readers)", type: "string", validation: (r) => r.required() }),
      defineField({ name: "caption", title: "Caption", type: "string" }),
    ],
    validation: opts.required
      ? (r) => r.custom((v: { image?: unknown; legacySrc?: string } | undefined) => (v?.image || v?.legacySrc ? true : "Add a photo"))
      : undefined,
  });

export const labelValueArray = (name: string, title: string, labels: { label: string; value: string }) =>
  defineField({
    name,
    title,
    type: "array",
    of: [
      defineArrayMember({
        type: "object",
        fields: [
          defineField({ name: "label", title: labels.label, type: "string", validation: (r) => r.required() }),
          defineField({ name: "value", title: labels.value, type: "string", validation: (r) => r.required() }),
        ],
        preview: { select: { title: "label", subtitle: "value" } },
      }),
    ],
  });

export const titleTextArray = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [
      defineArrayMember({
        type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
          defineField({ name: "description", title: "Text", type: "text", rows: 3 }),
        ],
        preview: { select: { title: "title", subtitle: "description" } },
      }),
    ],
  });
