import type { Metadata } from "next";
import { listCompanyEvents } from "@/app/api/_lib/company-events";
import { listNewsReleases } from "@/app/api/_lib/news-releases";
import { EventsPageContent } from "./EventsPageContent";

export const metadata: Metadata = {
  title: "Events & Briefings — Weatherhaven USA",
  description:
    "Scheduled capability briefings, virtual walkthroughs, and trade-show meetings for deployable shelter and camp solutions.",
};

export const revalidate = 300;

export default async function EventsPage() {
  const [events, newsReleases] = await Promise.all([
    listCompanyEvents({ publishedOnly: true }),
    listNewsReleases({ publishedOnly: true, limit: 12 }),
  ]);
  return <EventsPageContent events={events} newsReleases={newsReleases} />;
}
