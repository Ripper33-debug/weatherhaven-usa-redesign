import { defineArrayMember, defineField, defineType } from "sanity";
import { SYSTEM_MODELS } from "@/lib/system-models";
import { photoField, SYSTEM_OPTIONS } from "./shared";

/** A flagship program story (/stories/<slug>). Mirrors FlagshipStory in src/lib/stories.ts. */
export const story = defineType({
  name: "story",
  title: "Program story",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required().max(90) }),
    defineField({ name: "slug", title: "Web address", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "dek", title: "Summary", type: "text", rows: 3, description: "One or two sentences under the title; also used in search results.", validation: (r) => r.required().max(320) }),
    defineField({ name: "place", title: "Where", type: "string", validation: (r) => r.required() }),
    defineField({ name: "when", title: "When (short)", type: "string" }),
    defineField({ name: "order", title: "Order on the stories page", type: "number" }),
    defineField({ name: "systems", title: "Systems involved", type: "array", of: [{ type: "string", options: { list: SYSTEM_OPTIONS } }] }),
    photoField("hero", "Main photo", { required: true }),
    defineField({
      name: "heroModel",
      title: "Show a 3D model instead of the main photo",
      type: "string",
      options: { list: Object.keys(SYSTEM_MODELS).map((s) => ({ title: s.toUpperCase(), value: s })) },
      description: "Optional. The main photo is still used as the model's first frame.",
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
    }),
    defineField({ name: "photos", title: "Photo set", type: "array", of: [defineArrayMember(photoField("photo", "Photo"))] }),
    defineField({
      name: "quote",
      title: "Customer quote",
      type: "object",
      description: "Only add a quote the customer has cleared for publication. Hidden until filled in.",
      fields: [
        defineField({ name: "text", title: "Quote", type: "text", rows: 3 }),
        defineField({ name: "name", title: "Name", type: "string" }),
        defineField({ name: "role", title: "Role and organization", type: "string" }),
      ],
    }),
    defineField({ name: "note", title: "Note on sources", type: "text", rows: 2 }),
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
    }),
    defineField({ name: "deploymentStoryId", title: "Matching story on the Deployments page (anchor)", type: "string", hidden: true }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "place", media: "hero.image" } },
});
