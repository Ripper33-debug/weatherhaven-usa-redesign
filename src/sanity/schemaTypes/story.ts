import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { defineArrayMember, defineField, defineType } from "sanity";
import { SYSTEM_MODELS } from "@/lib/system-models";
import { thumbnail } from "@/sanity/studio/LegacyPhotoInput";
import { photoField, SYSTEM_OPTIONS } from "./shared";

/** A flagship program story (/stories/<slug>). Mirrors FlagshipStory in src/lib/stories.ts. */
export const story = defineType({
  name: "story",
  title: "Program story",
  type: "document",
  icon: EarthGlobeIcon,
  groups: [
    { name: "story", title: "Story", default: true },
    { name: "photos", title: "Photos" },
    { name: "facts", title: "Numbers and dates" },
    { name: "sources", title: "Sources" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required().max(90), group: "story" }),
    defineField({ name: "slug", title: "Web address", type: "slug", options: { source: "title" }, validation: (r) => r.required(), group: "settings", description: "Changing it breaks links people have already shared." }),
    defineField({ name: "dek", title: "Summary", type: "text", rows: 3, description: "One or two sentences under the title; also used in search results.", validation: (r) => r.required().max(320), group: "story" }),
    defineField({ name: "place", title: "Where", type: "string", validation: (r) => r.required(), group: "story" }),
    defineField({ name: "when", title: "When (short)", type: "string", group: "story" }),
    defineField({ name: "order", title: "Order on the stories page", type: "number", group: "settings" }),
    defineField({ name: "systems", title: "Systems involved", type: "array", of: [{ type: "string", options: { list: SYSTEM_OPTIONS } }], group: "story" }),
    { ...photoField("hero", "Main photo", { required: true }), group: "photos" },
    defineField({
      name: "heroModel",
      title: "Show a 3D model instead of the main photo",
      type: "string",
      options: { list: Object.keys(SYSTEM_MODELS).map((s) => ({ title: s.toUpperCase(), value: s })) },
      description: "Optional. The main photo is still used as the model's first frame.",
      group: "photos",
    }),
    defineField({
      name: "numbers",
      title: "Key numbers",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "value", title: "Number", type: "string", validation: (r) => r.required() }),
            defineField({ name: "label", title: "What it measures", type: "string", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
      validation: (r) => r.max(4),
      group: "facts",
    }),
    defineField({
      name: "timeline",
      title: "Timeline",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "date", title: "Date", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "What happened", type: "text", rows: 2, validation: (r) => r.required() }),
          ],
          preview: { select: { title: "date", subtitle: "text" } },
        }),
      ],
      group: "facts",
    }),
    defineField({
      name: "sections",
      title: "Story sections",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string", validation: (r) => r.required() }),
            defineField({ name: "paragraphs", title: "Paragraphs", type: "array", of: [{ type: "text", rows: 4 }] }),
          ],
          preview: { select: { title: "heading" } },
        }),
      ],
      group: "story",
    }),
    defineField({ name: "photos", title: "Photo set", type: "array", of: [defineArrayMember(photoField("photo", "Photo"))], group: "photos" }),
    defineField({
      name: "quote",
      title: "Customer quote",
      type: "object",
      description: "Only add a quote the customer has cleared for publication. Hidden until filled in.",
      group: "story",
      fields: [
        defineField({ name: "text", title: "Quote", type: "text", rows: 3 }),
        defineField({ name: "name", title: "Name", type: "string" }),
        defineField({ name: "role", title: "Role and organization", type: "string" }),
      ],
    }),
    defineField({ name: "note", title: "Note on sources", type: "text", rows: 2, group: "sources" }),
    defineField({
      name: "sources",
      title: "Sources",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "href", title: "Link", type: "url", validation: (r) => r.required().uri({ allowRelative: true, scheme: ["http", "https"] }) }),
            defineField({ name: "own", title: "Weatherhaven's own material", type: "boolean" }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
      group: "sources",
    }),
    defineField({ name: "deploymentStoryId", title: "Matching story on the Deployments page (anchor)", type: "string", hidden: true }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", subtitle: "place", image: "hero.image", legacy: "hero.legacySrc" },
    // An uploaded photo, or the site's current one.
    prepare: ({ title, subtitle, image, legacy }) => ({ title, subtitle, media: image ?? thumbnail(legacy) }),
  },
});
