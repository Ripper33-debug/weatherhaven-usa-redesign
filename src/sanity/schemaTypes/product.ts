import { defineField, defineType } from "sanity";
import { labelValueArray, SYSTEM_OPTIONS, titleTextArray } from "./shared";

/** Text and figures for one system's page. Anything left empty keeps what the site shows today. */
export const product = defineType({
  name: "product",
  title: "System",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "System",
      type: "string",
      options: { list: SYSTEM_OPTIONS },
      validation: (r) => r.required(),
      description: "Which system page this edits.",
    }),
    defineField({ name: "fullName", title: "Full name", type: "string" }),
    defineField({ name: "description", title: "One-sentence description", type: "text", rows: 3 }),
    defineField({ name: "keySpec", title: "Headline figure", type: "string", description: "Shown on the system's card, e.g. “420 ft² from one 20-ft ISO container”." }),
    labelValueArray("specs", "Specifications", { label: "Label", value: "Value" }),
    titleTextArray("highlights", "Highlights"),
    defineField({ name: "overview", title: "Overview paragraphs", type: "array", of: [{ type: "text", rows: 4 }] }),
    titleTextArray("configurations", "Configurations"),
    defineField({
      name: "engineeringChecked",
      title: "Figures checked by engineering",
      type: "object",
      fields: [
        defineField({ name: "by", title: "Checked by", type: "string" }),
        defineField({ name: "on", title: "Date", type: "date" }),
      ],
    }),
  ],
  preview: {
    select: { slug: "slug", subtitle: "keySpec" },
    prepare: ({ slug, subtitle }) => ({ title: SYSTEM_OPTIONS.find((o) => o.value === slug)?.title || slug, subtitle }),
  },
  orderings: [{ title: "System", name: "slug", by: [{ field: "slug", direction: "asc" }] }],
});
