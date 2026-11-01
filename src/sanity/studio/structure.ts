/**
 * The studio's left-hand menu: the homepage, systems by family (as the site groups them), program
 * stories, news and the team, in the order an editor reaches for them.
 */
import { CaseIcon } from "@sanity/icons/Case";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { HomeIcon } from "@sanity/icons/Home";
import { PackageIcon } from "@sanity/icons/Package";
import { UsersIcon } from "@sanity/icons/Users";
import type { StructureResolver } from "sanity/structure";
import { SYSTEMS_BY_FAMILY } from "@/lib/site-nav";
import { HelpPane } from "./HelpPane";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Weatherhaven Content")
    .items([
      S.listItem()
        .title("Homepage")
        .id("homepage")
        .icon(HomeIcon)
        .child(S.document().schemaType("homepage").documentId("homepage").title("Homepage")),
      S.divider(),
      S.listItem()
        .title("Systems")
        .id("systems")
        .icon(PackageIcon)
        .child(
          S.list()
            .title("Systems")
            .items([
              ...SYSTEMS_BY_FAMILY.map((family) =>
                S.listItem()
                  .title(family.name)
                  .id(`family-${family.id}`)
                  .icon(PackageIcon)
                  .child(
                    S.documentTypeList("product")
                      .title(family.name)
                      .filter('_type == "product" && slug in $slugs')
                      .params({ slugs: family.systems.map((s) => s.slug) })
                      .defaultOrdering([{ field: "slug", direction: "asc" }]),
                  ),
              ),
              S.divider(),
              S.documentTypeListItem("product").title("All systems").icon(PackageIcon),
            ]),
        ),
      S.documentTypeListItem("story").title("Program stories").icon(EarthGlobeIcon),
      S.listItem()
        .title("News")
        .id("news")
        .icon(DocumentTextIcon)
        .child(S.documentTypeList("newsRelease").title("News").defaultOrdering([{ field: "publishedAt", direction: "desc" }])),
      S.documentTypeListItem("teamMember").title("Team").icon(UsersIcon),
      S.divider(),
      S.listItem()
        .title("How editing works")
        .id("help")
        .icon(CaseIcon)
        .child(S.component(HelpPane).title("How editing works")),
    ]);

