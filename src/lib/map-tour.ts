/**
 * The homepage map's guided tour: the deployments with public sources, in an order that makes a
 * sensible flight around the world. Every stop is one of the field stories or field notes on
 * /deployments (src/lib/field-stories.ts), so the figures, systems and sources here are the same
 * ones, checked there. The one-line summaries only restate those stories.
 *
 * Where a story names a specific place (a drill site, a base, a test centre, a hospital), the stop
 * is marked there. Where it only names a country, or the exact site isn't published, the stop is
 * an `area`: the map marks the region, and no local time or weather is shown.
 */
import { DEPLOYMENT_STORIES, FIELD_NOTES } from "@/lib/field-stories";

export type TourKind = "military" | "humanitarian" | "scientific";

export type TourStop = {
  id: string;
  kind: TourKind;
  /** Where, as the map labels it. */
  where: string;
  lat: number;
  lng: number;
  /** A country or region rather than a site: no local time or weather. */
  area?: boolean;
  when?: string;
  title: string;
  line: string;
  figures: { value: string; label: string }[];
  systems: { slug: string; name: string }[];
  sources: { label: string; href: string }[];
  /** Said under the sources when the facts come from Weatherhaven's own material. */
  attribution?: string;
  /** Link to the full story on /deployments. */
  more: string;
};

type StoryStop = {
  story: string;
  where: string;
  lat: number;
  lng: number;
  area?: boolean;
  line: string;
  /** Which of the story's figures to show (two fit beside the map), by position. */
  figures: number[];
};

type NoteStop = {
  note: string;
  id: string;
  kind: TourKind;
  title: string;
  where: string;
  lat: number;
  lng: number;
  area?: boolean;
  systems?: { slug: string; name: string }[];
};

const SECTOR_KIND = { defense: "military", medical: "humanitarian", research: "scientific" } as const;

/**
 * Coordinates: Little Dome C from the Beyond EPICA field diary (75.29917° S, 122.44516° E); West
 * Lake Bonney from the McMurdo Dry Valleys LTER site list; Mount Brown South from Climate of the
 * Past 20, 969 (2024); Tanquary Fiord at its airstrip and camp; the rest at the named base, depot,
 * test centre or hospital.
 */
const ROUTE: (StoryStop | NoteStop)[] = [
  {
    story: "beyond-epica",
    where: "Little Dome C, Antarctica",
    lat: -75.29917,
    lng: 122.44516,
    line: "Twelve institutions from ten nations drilled 2,800 m down to bedrock for a climate record reaching back 1.2 million years. The drill ran inside a Series 4 shelter on Weatherhaven's 30-ft-wide truss frame, with a slot in the roof for the mast.",
    figures: [0, 1],
  },
  {
    story: "nasa-endurance",
    where: "West Lake Bonney, Antarctica",
    lat: -77.7202,
    lng: 162.3051,
    line: "The NASA-funded ENDURANCE project sent an autonomous underwater vehicle beneath 12 to 15 ft of ice to explore this 130-ft-deep lake. The team's “Bot House” on the ice was a Polarhaven, 17 arches raised around the vehicle.",
    figures: [0, 1],
  },
  {
    note: "Mount Brown South, Antarctica",
    id: "mount-brown-south",
    kind: "scientific",
    title: "An Australian ice-core camp",
    where: "Mount Brown South, Antarctica",
    lat: -69.111,
    lng: 86.312,
  },
  {
    note: "Ukraine",
    id: "ukraine",
    kind: "military",
    title: "110 military shelters in ten weeks",
    where: "Ukraine",
    lat: 49.0,
    lng: 31.4,
    area: true,
    systems: [{ slug: "rdmss", name: "RDMSS" }],
  },
  {
    note: "Tanquary Fiord, Nunavut",
    id: "tanquary-fiord",
    kind: "scientific",
    title: "Parks Canada lodging in Quttinirpaaq National Park",
    where: "Tanquary Fiord, Nunavut",
    lat: 81.4094,
    lng: -76.8817,
  },
  {
    story: "hqss",
    where: "Canada",
    lat: 56.0,
    lng: -96.0,
    area: true,
    line: "Canada ordered 1,435 Headquarters Shelter Systems in 2017, with options for 338 more, to replace up to 80% of National Defence's older modular tents. They are built on Weatherhaven's RDMSS, with support options running to 2042.",
    figures: [0, 2],
  },
  {
    story: "covid-mobile-health-units",
    where: "Toronto, Ontario",
    lat: 43.7224,
    lng: -79.3754,
    line: "Canada committed two 100-bed Mobile Health Units to Ontario in 2021. The first was handed over to Sunnybrook Health Sciences Centre in Toronto on April 5, 2021, and the second went to Hamilton Health Sciences.",
    figures: [0, 1],
  },
  {
    story: "109th-airlift-wing",
    where: "Stratton Air National Guard Base, New York",
    lat: 42.8525,
    lng: -73.9289,
    line: "The 109th Airlift Wing flies LC-130 “Skibirds” for American science in Antarctica and Greenland. In August 2020 it ordered eight Polar Chief shelters and a 14 × 28 ft Polarhaven with an arctic foam floor.",
    figures: [0, 1],
  },
  {
    story: "army-containerized-kitchen",
    where: "Letterkenny Army Depot, Pennsylvania",
    lat: 39.99,
    lng: -77.7,
    line: "Since November 2021 the Army has bought Weatherhaven parts for its Containerized Kitchen, which can feed up to 800 Soldiers three times a day, under a purchase agreement at Letterkenny Army Depot.",
    figures: [0, 1],
  },
  {
    story: "trecc-us-army",
    where: "Aberdeen Test Center, Maryland",
    lat: 39.466,
    lng: -76.13,
    line: "TRECC was co-developed with the US Army's DEVCOM and completed MIL-STD-810G and safety testing at Aberdeen Test Center. Two people deploy it in under three minutes.",
    figures: [0, 1],
  },
  {
    note: "Quellaveco, Peru",
    id: "quellaveco",
    kind: "scientific",
    title: "A 912-person camp above 4,500 m",
    where: "Quellaveco, Peru",
    lat: -17.1,
    lng: -70.6,
    area: true,
    systems: [{ slug: "series-4", name: "Series 4" }],
  },
];

function build(): TourStop[] {
  return ROUTE.map((r) => {
    if ("story" in r) {
      const s = DEPLOYMENT_STORIES.find((x) => x.id === r.story);
      if (!s) throw new Error(`Tour stop for a missing story: ${r.story}`);
      return {
        id: s.id,
        kind: SECTOR_KIND[s.sector],
        where: r.where,
        lat: r.lat,
        lng: r.lng,
        area: r.area,
        when: s.when,
        title: s.title,
        line: r.line,
        figures: r.figures.map((i) => s.figures[i]),
        systems: s.systems,
        sources: s.sources,
        attribution: s.attribution,
        more: `/deployments#${s.id}`,
      };
    }
    const n = FIELD_NOTES.find((x) => x.place === r.note);
    if (!n) throw new Error(`Tour stop for a missing field note: ${r.note}`);
    return {
      id: r.id,
      kind: r.kind,
      where: r.where,
      lat: r.lat,
      lng: r.lng,
      area: r.area,
      title: r.title,
      line: n.text,
      figures: [],
      systems: r.systems ?? [],
      sources: [n.source],
      attribution: n.byWeatherhaven ? "As described by Weatherhaven." : undefined,
      more: "/deployments#more-from-the-field",
    };
  });
}

export const TOUR_STOPS: TourStop[] = build();
