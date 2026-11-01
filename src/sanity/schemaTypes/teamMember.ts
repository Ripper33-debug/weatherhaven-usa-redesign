import { UsersIcon } from "@sanity/icons/Users";
import { defineField, defineType } from "sanity";

/** A person on the About page's team section (hidden on the site until at least one is published). */
export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Job title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "focus", title: "Works on", type: "string", description: "e.g. US Army programs, contracts, field engineering." }),
    defineField({ name: "email", title: "Email", type: "string", validation: (r) => r.email() }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "bio", title: "Short bio", type: "text", rows: 4, validation: (r) => r.max(600) }),
    defineField({ name: "order", title: "Order", type: "number" }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "title", media: "photo" } },
});
