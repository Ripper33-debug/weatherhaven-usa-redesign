import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryArticle } from "@/components/stories/StoryArticle";
import { getFlagshipStories, getFlagshipStory } from "@/lib/stories";
import { pageMeta } from "@/lib/page-meta";

// Stories added in the content studio get a page on first visit; the known ones are built ahead.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getFlagshipStories()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getFlagshipStory(slug);
  if (!story) return {};
  return pageMeta({
    title: story.title,
    description: story.dek,
    path: `/stories/${story.slug}`,
    image: story.hero.src,
    imageAlt: story.hero.alt,
  });
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stories = await getFlagshipStories();
  const index = stories.findIndex((s) => s.slug === slug);
  if (index < 0) notFound();
  const next = stories[(index + 1) % stories.length];
  return <StoryArticle story={stories[index]} next={next.slug !== slug ? next : undefined} />;
}
