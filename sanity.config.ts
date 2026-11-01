"use client";

/**
 * Weatherhaven Content: the site's editing studio, served at /studio (src/app/studio). It runs on
 * Sanity, branded and simplified for Weatherhaven's editors. Editors sign in with their Sanity
 * account; the project's CORS settings must allow this site's address.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { OpenOnSiteAction } from "./src/sanity/studio/actions";
import { STUDIO_TITLE, StudioLogo, studioTheme, WeatherhavenMark } from "./src/sanity/studio/brand";
import { structure } from "./src/sanity/studio/structure";

const SINGLETONS = new Set(["homepage"]);

export default defineConfig({
  name: "weatherhaven-usa",
  title: STUDIO_TITLE,
  icon: WeatherhavenMark,
  theme: studioTheme,
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // The homepage is one document: no "new homepage" in the create menu.
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) => [
      ...(SINGLETONS.has(schemaType)
        ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : actions),
      OpenOnSiteAction,
    ],
    // No "duplicate" or "new" for the homepage from the global create button either.
    newDocumentOptions: (prev) => prev.filter((t) => !SINGLETONS.has(t.templateId)),
  },
  studio: { components: { logo: StudioLogo } },
  plugins: [
    structureTool({ structure, title: "Content" }),
    // The query playground is a developer tool: only when running the site locally.
    ...(process.env.NODE_ENV === "development" ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
});
