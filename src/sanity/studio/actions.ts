/**
 * "Open on site": opens the live page a document edits, in a new tab, from the menu beside Publish.
 */
import { LaunchIcon } from "@sanity/icons/Launch";
import type { DocumentActionComponent, SanityDocument } from "sanity";

type Doc = SanityDocument & { slug?: string | { current?: string }; externalUrl?: string };

/** The site path a document shows up on, or null when it has none yet. */
export function sitePathFor(type: string, doc: Doc | null | undefined): string | null {
  if (type === "homepage") return "/";
  if (type === "teamMember") return "/about";
  if (!doc) return null;
  const slug = typeof doc.slug === "string" ? doc.slug : doc.slug?.current;
  if (type === "product") return slug ? `/configurable-solutions/${slug}` : null;
  if (type === "story") return slug ? `/stories/${slug}` : null;
  if (type === "newsRelease") return doc.externalUrl || (slug ? `/news/${slug}` : null);
  return null;
}

export const OpenOnSiteAction: DocumentActionComponent = (props) => {
  const doc = (props.published ?? props.draft) as Doc | null;
  const path = sitePathFor(props.type, doc);
  return {
    label: "Open on site",
    icon: LaunchIcon,
    disabled: !path || !props.published,
    title: !props.published ? "Publish first: the page shows published content." : undefined,
    onHandle: () => {
      if (path) window.open(path, "_blank", "noopener");
      props.onComplete();
    },
  };
};
