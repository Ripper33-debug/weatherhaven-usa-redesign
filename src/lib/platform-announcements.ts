export type PlatformAnnouncement = {
  title: string;
  date: string;
  tag: "New" | "Update" | "Coming soon";
};

export const PLATFORM_ANNOUNCEMENTS: PlatformAnnouncement[] = [
  {
    title: "Product photography across the systems catalog",
    date: "May 2026",
    tag: "New",
  },
  {
    title: "Deployment planner — link markers to shelter systems",
    date: "May 2026",
    tag: "New",
  },
  {
    title: "Mission Solution Builder — PDF camp package export",
    date: "Jun 2026",
    tag: "New",
  },
];
