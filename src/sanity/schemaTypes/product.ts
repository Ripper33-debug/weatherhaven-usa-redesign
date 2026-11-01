import { PackageIcon } from "@sanity/icons/Package";
import { defineField, defineType } from "sanity";
import { productCover } from "@/lib/product-covers";
import { thumbnail } from "@/sanity/studio/LegacyPhotoInput";
import { labelValueArray, SYSTEM_OPTIONS, titleTextArray } from "./shared";

/** Text and figures for one system's page. Anything left empty keeps what the site shows today. */
export const product = defineType({
  name: "product",
  title: "System",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "text", title: "Text", default: true },
    { name: "specs", title: "Specs" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "System",
      type: "string",
      options: { list: SYSTEM_OPTIONS },
      validation: (r) => r.required(),
      description: "Which system page this edits.",
      group: "settings",
    }),
    defineField({ name: "fullName", title: "Full name", type: "string", group: "text" }),
    defineField({ name: "description", title: "One-sentence description", type: "text", rows: 3, group: "text" }),
    defineField({ name: "keySpec", title: "Headline figure", type: "string", description: "Shown on the system's card, e.g. “420 ft² from one 20-ft ISO container”.", group: "text" }),
    { ...labelValueArray("specs", "Specifications", { label: "Label", value: "Value" }), group: "specs" },
    { ...titleTextArray("highlights", "Highlights"), group: "text" },
    defineField({ name: "overview", title: "Overview paragraphs", type: "array", of: [{ type: "text", rows: 4 }], group: "text" }),
    { ...titleTextArray("configurations", "Configurations"), group: "specs" },
    defineField({
      name: "engineeringChecked",
      title: "Figures checked by engineering",
      type: "object",
      group: "specs",
      fields: [
        defineField({ name: "by", title: "Checked by", type: "string" }),
        defineField({ name: "on", title: "Date", type: "date" }),
      ],
    }),
  ],
  preview: {
    select: { slug: "slug", subtitle: "keySpec" },
    prepare: ({ slug, subtitle }) => ({
      title: SYSTEM_OPTIONS.find((o) => o.value === slug)?.title || slug,
      subtitle,
      media: slug ? thumbnail(productCover(slug)) : undefined,
    }),
  },
  orderings: [{ title: "System", name: "slug", by: [{ field: "slug", direction: "asc" }] }],
});
