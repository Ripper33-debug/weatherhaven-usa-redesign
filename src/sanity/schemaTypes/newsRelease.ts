import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineField, defineType } from "sanity";

/** A news item on /news and the homepage. Link to the full article, or write it here. */
export const newsRelease = defineType({
  name: "newsRelease",
  title: "News",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: "title", title: "Headline", type: "string", validation: (r) => r.required().max(140) }),
    defineField({ name: "slug", title: "Web address", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "publishedAt", title: "Date", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3, validation: (r) => r.required().max(400) }),
    defineField({ name: "externalUrl", title: "Link to the full article", type: "url", description: "Leave empty to publish the text below on this site." }),
    defineField({ name: "body", title: "Full text", type: "text", rows: 12 }),
  ],
  orderings: [{ title: "Newest first", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "publishedAt" } },
});
