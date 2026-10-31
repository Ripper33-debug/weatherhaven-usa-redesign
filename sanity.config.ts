"use client";

/**
 * The Weatherhaven USA content studio, served at /studio (src/app/studio). Editors sign in with
 * their Sanity account; the project's CORS settings must allow this site's address.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

const SINGLETONS = new Set(["homepage"]);

export default defineConfig({
  name: "weatherhaven-usa",
  title: "Weatherhaven USA",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // The homepage is one document: no "new homepage" in the create menu.
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETONS.has(schemaType) ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action)) : actions,
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem().title("Homepage").id("homepage").child(S.document().schemaType("homepage").documentId("homepage")),
            S.divider(),
            S.documentTypeListItem("product").title("Systems"),
            S.documentTypeListItem("story").title("Program stories"),
            S.documentTypeListItem("teamMember").title("Team"),
            S.documentTypeListItem("newsRelease").title("News"),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
