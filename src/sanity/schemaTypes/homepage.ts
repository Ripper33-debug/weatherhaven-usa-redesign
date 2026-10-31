import { defineField, defineType } from "sanity";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({ name: "heroHeadline", title: "Headline", type: "string", validation: (r) => r.required().max(90) }),
    defineField({ name: "heroLead", title: "Intro paragraph", type: "text", rows: 4, validation: (r) => r.max(420) }),
    defineField({ name: "filmCaption", title: "Caption under the film", type: "string" }),
    defineField({ name: "ctaHeading", title: "Closing section: heading", type: "string", validation: (r) => r.max(60) }),
    defineField({ name: "ctaText", title: "Closing section: text", type: "text", rows: 3, validation: (r) => r.max(300) }),
  ],
  preview: { prepare: () => ({ title: "Homepage" }) },
});
