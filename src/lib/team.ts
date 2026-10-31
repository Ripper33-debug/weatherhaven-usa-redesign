/**
 * Weatherhaven USA's people, for the team section on /about. Empty until Weatherhaven supplies real
 * names, titles and photos (through the CMS); the section stays hidden while there's no one listed.
 * Never fill this with placeholder people.
 *
 * Shape (the CMS mirrors it): name, title, photo? (path or URL, square crop works best), email?,
 * phone?, bio? (one or two sentences), focus? (what to contact them about, e.g. "Army programs").
 */
import { cmsTeam } from "@/sanity/content";

export type TeamMember = {
  name: string;
  title: string;
  photo?: string;
  email?: string;
  phone?: string;
  bio?: string;
  focus?: string;
};

export const TEAM: TeamMember[] = [];

export async function getTeam(): Promise<TeamMember[]> {
  // People added in the content studio; none in code.
  return (await cmsTeam()) ?? TEAM;
}
