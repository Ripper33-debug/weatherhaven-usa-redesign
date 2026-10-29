import { DEPLOYMENT_STORIES, FIELD_NOTES, type DeploymentStory } from "@/lib/field-stories";

/**
 * "Programs and deployments" on each product page: the field stories that name the product, plus
 * the shorter field notes whose text names it. Nothing is added here; every word comes from
 * src/lib/field-stories.ts.
 */
export type StoryProof = {
  story: DeploymentStory;
  summary: string;
  facts: { value: string; label: string }[];
};

export type NoteProof = { place: string; text: string };

/** The first sentence of a paragraph (stories open with their most useful line). */
export function firstSentence(text: string): string {
  const m = text.match(/^(.+?[.!?])(?=\s+[A-Z“"]|$)/);
  return (m ? m[1] : text).trim();
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function proofFor(
  slug: string,
  name: string,
  specs: { value: string }[] = [],
): { stories: StoryProof[]; notes: NoteProof[] } {
  const specText = specs.map((s) => s.value).join(" | ");
  const stories = DEPLOYMENT_STORIES.filter((s) => s.systems.some((x) => x.slug === slug)).map((story) => ({
    story,
    summary: firstSentence(story.body[0] ?? ""),
    // A figure already in the product's spec table isn't repeated on the card.
    facts: (story.facts ?? []).filter((f) => !specText.includes(f.value)).slice(0, 3),
  }));
  const word = new RegExp(`(^|[^A-Za-z0-9-])${escape(name)}(?![A-Za-z0-9])`);
  const notes = FIELD_NOTES.filter((n) => word.test(n.text)).map((n) => ({ place: n.place, text: n.text }));
  return { stories, notes };
}
