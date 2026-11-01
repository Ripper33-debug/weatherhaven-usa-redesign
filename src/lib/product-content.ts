/**
 * Verified public product content for the systems catalog.
 *
 * Every spec below comes from Weatherhaven's own published material (Oct 2026):
 *  - weatherhaven.com product pages            (WC)
 *  - weatherhaven.co.uk product pages            (UK)
 *  - Weatherhaven USA 2026 Capabilities Statement (CS)
 *  - the Airmax/Airbeam info sheet in /public/downloads (PDF)
 * Sources are kept per product so they can be re-checked. Where Weatherhaven's own pages
 * disagree, the US-facing source (WC / CS) wins and the conflict is noted.
 *
 * Products without published specs (Series 1.5 & 2, non-expandable ISO containers) carry
 * no numbers on purpose — never fill those in from guesswork.
 */
import type { ProductSpec } from "@/lib/products";

export type ProductFamily = "expandable" | "softwall" | "inflatable" | "polar";

export const PRODUCT_FAMILIES: {
  id: ProductFamily;
  name: string;
  summary: string;
  cover: string;
}[] = [
  {
    id: "expandable",
    name: "Expandable containers",
    summary:
      "Hard-wall shelters that ship as ISO containers, pallets or trailers and expand on site in minutes.",
    cover: "/products/ehmecc/gallery/08-EHMECC.jpg",
  },
  {
    id: "softwall",
    name: "Soft-wall shelters",
    summary:
      "Tensioned-fabric buildings and modular tentage for camps, headquarters, hospitals and maintenance, at almost any length.",
    cover: "/products/series-4/gallery/02-com-S4-PrimerCamp.PlacerDome150.jpg",
  },
  {
    id: "inflatable",
    name: "Inflatable shelters",
    summary: "Airmax inflatable shelters on airbeams that a small team inflates in minutes, with no tools and no frame to assemble.",
    cover: "/products/airbeam-lp/gallery/08-Airbeam-Low-Pressure-9.jpg",
  },
  {
    id: "polar",
    name: "Polar shelters",
    summary:
      "Insulated shelters built for the coldest places people work, in Antarctica since Weatherhaven's first camp there in 1988.",
    cover: "/products/polar-chief/gallery/01-com-PolarChief149.jpg",
  },
];

/**
 * Generated images in the media library (a cut-away render of an EHMECC command post, also the
 * old HQSS cover). They don't show real equipment, so they never appear on the site.
 */
export const EXCLUDED_PRODUCT_IMAGES: ReadonlySet<string> = new Set([
  "/products/hqss.jpg",
  "/products/ehmecc/gallery/02-EHMECC-and-Command-Post.jpg",
]);

export type ProductContent = {
  family: ProductFamily;
  name: string;
  /** Expanded product name. Shown under the name only when it spells out an acronym (see showsFullName). */
  fullName: string;
  /** One accurate sentence for cards, menus and meta descriptions. */
  description: string;
  /** The single most useful fact, shown on cards and in the systems menu. */
  keySpec: string;
  overview: string[];
  highlights: { title: string; description: string }[];
  specs: ProductSpec[];
  configurations: { title: string; description: string }[];
  /** Where the published numbers come from (kept for re-verification, not displayed). */
  sources: string[];
};

export const PRODUCT_CONTENT: Record<string, ProductContent> = {
  mecc: {
    family: "expandable",
    name: "MECC",
    fullName: "Mobile Expandable Container Configuration",
    description:
      "Weatherhaven's original expandable shelter: a 20-ft ISO container whose insulated wings fold out to nearly triple its floor space.",
    keySpec: "420 ft² from one 20-ft ISO container",
    overview: [
      "The taller EHMECC builds on its design. Each unit is built for a 15 to 20 year field life and works alone or joined with others into a larger camp.",
    ],
    highlights: [
      { title: "Two people, 10 to 15 minutes", description: "No special skills or tools to deploy or strike." },
      { title: "Moves like cargo", description: "ISO and CSC certified, stacks nine high, lifts by forklift, crane or helicopter." },
      { title: "Command post to clinic", description: "Fits out as a command post, clinic, workshop, office or accommodation module." },
    ],
    specs: [
      { label: "Packed size", value: "20 ft × 8 ft × 8 ft (8 ft 6 in high option)" },
      { label: "Deployed width", value: "243 in (8 ft model) / 255 in (8 ft 6 in model)" },
      { label: "Deployed floor area", value: "420 ft² (39 m²)" },
      { label: "Tare weight", value: "≈ 7,700 lb (8 ft) / ≈ 7,920 lb (8 ft 6 in)" },
      { label: "Setup", value: "2 people, 10–15 min, no special skills" },
      { label: "Transport", value: "ISO and CSC certified; stacks 9 high; forklift, crane, helicopter or PLS" },
      { label: "Service life", value: "15–20 years in the field" },
    ],
    configurations: [
      { title: "8 ft and 8 ft 6 in heights", description: "Two container heights to match existing ISO logistics." },
      { title: "Mini MECC", description: "A 10-ft version of the same expanding design (see BMECC)." },
    ],
    sources: [
      "https://www.weatherhaven.co.uk/mecc/",
      "https://www.weatherhaven.com/products/expandable-container/mecc",
    ],
  },
  ehmecc: {
    family: "expandable",
    name: "EHMECC",
    fullName: "Extended Height Mobile Expandable Container Configuration",
    description:
      "A 20-ft ISO container that unfolds to nearly triple its floor space and raises its roof to a 12-ft interior, with room for headquarters and large command posts.",
    keySpec: "420 ft² with 12-ft interior height",
    overview: [
      "The EHMECC takes the MECC's expanding design and lifts the roof. The extra volume suits headquarters, large command posts and equipment that won't fit under a standard ceiling.",
    ],
    highlights: [
      { title: "4,661 ft³ inside", description: "The most deployed volume of any Weatherhaven expanding container." },
      { title: "Under 10 minutes", description: "No tools, and it can deploy while still truck-mounted." },
      { title: "Air-mobile", description: "C-130, C-17, C-5 and A400M; can be underslung by helicopter." },
    ],
    specs: [
      { label: "Packed size", value: "240 × 96 × 96 in (standard 20-ft ISO)" },
      { label: "Deployed width", value: "240 in" },
      { label: "Interior height", value: "144 in (3,658 mm)" },
      { label: "Floor area / volume", value: "420 ft² / 4,661 ft³" },
      { label: "Tare weight", value: "≈ 8,483 lb (3,856 kg)" },
      { label: "Setup", value: "Under 10 min, no tools; can deploy truck-mounted" },
      { label: "Air transport", value: "C-130, C-17, C-5, A400M; helicopter underslung" },
      { label: "Certification", value: "Full CSC; ISO stacking 3 high" },
    ],
    configurations: [
      { title: "Headquarters and command posts", description: "Joins with MECC and TRECC units to form a deployable headquarters." },
    ],
    sources: ["https://www.weatherhaven.co.uk/ehmecc/", "https://www.weatherhaven.com/Military"],
  },
  bmecc: {
    family: "expandable",
    name: "BMECC",
    fullName: "BMECC 10-ft expandable container",
    description:
      "A 10-ft ISO container that expands like the MECC into 210 ft² of insulated workspace.",
    keySpec: "210 ft² from a 10-ft ISO container",
    overview: ["It suits smaller command, medical and workspace roles where a full 20-ft footprint is too much."],
    highlights: [
      { title: "Two ship as one", description: "Two units couple into one 20-ft ISO shipping module with full CSC, then deploy as separate rooms." },
      { title: "1,590 ft³ inside", description: "Insulated volume from a 10-ft container." },
      { title: "−51°C to +49°C", description: "Operating range across arctic and desert theaters." },
    ],
    specs: [
      { label: "Packed size", value: "120 × 96 × 96 in (8 ft) / 120 × 96 × 102 in (8 ft 6 in)" },
      { label: "Deployed width", value: "243 in (8 ft) / 255 in (8 ft 6 in)" },
      { label: "Deployed floor area", value: "210 ft² (19 m²)" },
      { label: "Deployed volume", value: "1,590 ft³ (45 m³)" },
      { label: "Tare weight", value: "≈ 5,500 lb (8 ft) / ≈ 5,720 lb (8 ft 6 in)" },
      { label: "Operating temperature", value: "−51°C to +49°C" },
      { label: "Transport", value: "2 units = one 20-ft ISO module; full CSC; stacks 9 high" },
    ],
    configurations: [],
    sources: ["https://www.weatherhaven.co.uk/bmecc/"],
  },
  trecc: {
    family: "expandable",
    name: "TRECC",
    fullName: "Tactical Redeployable Expanding Container Capability",
    description:
      "A patented all-aluminum shelter on a trailer, vehicle or 463L pallet that expands into a command post, workshop, clinic or sanitation unit in under three minutes.",
    keySpec: "Expands in under 3 minutes",
    overview: [
      "TRECC was co-developed with US Army DEVCOM. It is tested to MIL-STD-810G, with safety testing at Aberdeen Test Center, and TRECC-T is at technology readiness level 9.",
    ],
    highlights: [
      { title: "Under 3 minutes", description: "Two personnel; electric actuators with manual backup." },
      { title: "Trailer, vehicle or pallet", description: "Light tactical trailer, M1289 JLTV trailer or a single 463L pallet." },
      { title: "Tested", description: "MIL-STD-810G; safety testing at Aberdeen Test Center; TRL 9 (TRECC-T)." },
    ],
    specs: [
      { label: "Setup", value: "Under 3 min, 2 personnel; 24 VDC actuators, manual backup" },
      { label: "Climate", value: "−40°F to +120°F" },
      { label: "Wind rating", value: "55 mph sustained / 75 mph gusts" },
      { label: "TRECC-T (light tactical trailer)", value: "86 ft² (6–8 pers.); 1,620 lb" },
      { label: "TRECC-M (M1289 JLTV trailer)", value: "121.6 ft² (8–12 pers.); 2,200 lb" },
      { label: "TRECC-P (one 463L pallet)", value: "132 ft²; 2,205 lb tare" },
      { label: "Helicopter", value: "Under 60 in stowed height; CH-47 airlift compatible" },
      { label: "Testing", value: "MIL-STD-810G; Aberdeen Test Center; TRL 9 (TRECC-T)" },
    ],
    configurations: [
      { title: "TRECC-T", description: "Light tactical trailer. Stowed 114 × 94.5 × 57 in; deployed 181 × 97 × 82 in." },
      { title: "TRECC-M", description: "M1289 JLTV trailer. Stowed 89 × 84 × 57 in; deployed 171 × 72 × 78 in." },
      { title: "TRECC-P", description: "Single 463L pallet. Packed 104 × 84 × 60 in." },
      { title: "TRECC sanitation", description: "Off-grid field sanitation and kitchen unit; solar and 24 VDC power." },
    ],
    sources: [
      "https://usubc.org/wp-content/uploads/2026/08/Weatherhaven-2026-Capabilities-Statement-1.pdf",
      "https://www.weatherhaven.co.uk/trecc/",
    ],
  },
  ateps: {
    family: "expandable",
    name: "ATEPS",
    fullName: "Air-Transportable Expandable Pallet Shelter",
    description:
      "A hard-wall expandable shelter built on a single 463L air-cargo pallet that two people expand into an insulated workspace in under ten minutes.",
    keySpec: "One 463L pallet, up in under 10 min",
    overview: [],
    highlights: [
      { title: "Any fixed-wing aircraft", description: "Fits aircraft with more than 92 in of height clearance." },
      { title: "84 to 244 in wide", description: "Stowed on the pallet, then expanded to more than double its width." },
      { title: "7,500 lb floor", description: "D-ring tie-downs; lifts by four-point sling or forklift." },
    ],
    specs: [
      { label: "Stowed footprint", value: "84 × 104 in (one 463L pallet)" },
      { label: "Deployed footprint", value: "244 × 104 in" },
      { label: "External height", value: "91 in" },
      { label: "Weight", value: "2,500 lb" },
      { label: "Setup", value: "2 people, under 10 min" },
      { label: "Floor load", value: "Up to 7,500 lb (D-ring tie-downs)" },
      { label: "Handling", value: "4-point sling top lift; 4-way forklift pockets" },
      { label: "Air transport", value: "Fixed-wing aircraft with more than 92 in height clearance" },
    ],
    configurations: [],
    sources: ["https://www.weatherhaven.com/products/expandable-container/ateps"],
  },
  hercon: {
    family: "expandable",
    name: "HERCon",
    fullName: "Hardwall Expandable Redeployable Container",
    description:
      "A hard-wall, ISO-standard expandable building for housing, kitchens, offices and clinics that opens to up to six times its shipping footprint.",
    keySpec: "Expands up to 6× its shipping footprint",
    overview: [],
    highlights: [
      { title: "No extra packaging", description: "Ships as a standard ISO container." },
      { title: "Two units, one container", description: "Two 4-ft units couple to ship as one 8-ft ISO container, then deploy as separate rooms." },
      { title: "No foundation", description: "A team of six deploys it in minutes." },
    ],
    specs: [
      { label: "Widths", value: "4 ft and 8 ft configurations" },
      { label: "Shipping", value: "Two 4-ft units couple to ship as one 8-ft ISO container" },
      { label: "Expansion", value: "Up to 6× its shipping footprint" },
      { label: "Setup", value: "Minutes, team of six; no foundation" },
    ],
    configurations: [
      { title: "Housing and accommodation", description: "Deploys as self-contained rooms." },
      { title: "Kitchens, offices and clinics", description: "Hard-wall interiors fitted to purpose." },
    ],
    sources: ["https://www.weatherhaven.com/products/expandable-container/hercon"],
  },
  "non-expandable-iso-containers": {
    family: "expandable",
    name: "ISO containers",
    fullName: "Non-expandable ISO containers",
    description:
      "Standard ISO containers fitted out as life-support, medical, morgue and technical modules.",
    keySpec: "Fitted ISO modules for fixed roles",
    overview: [],
    highlights: [
      { title: "Standard logistics", description: "Ships, stacks and lifts like any ISO container." },
      { title: "For fixed roles", description: "Used where a role doesn't need extra floor space." },
      { title: "Joins the camp", description: "Works alongside expandable and soft-wall shelters." },
    ],
    specs: [],
    configurations: [],
    sources: [],
  },
  "series-4": {
    family: "softwall",
    name: "Series 4",
    fullName: "Series 4 tensioned fabric shelter",
    description:
      "Weatherhaven's original all-climate fabric building: a tensioned-arch shelter used on all seven continents.",
    keySpec: "8 to 30 ft wide, any length",
    overview: [],
    highlights: [
      { title: "Eleven widths, any length", description: "8 to 30 ft wide, extended in modules." },
      { title: "No tools", description: "No specialist skills needed to erect it." },
      { title: "Tropics to Antarctica", description: "Kitchens, accommodation, workshops and command space." },
    ],
    specs: [
      { label: "Widths", value: "8, 10, 12, 14, 16, 18, 20, 22, 24, 26 and 30 ft; any length" },
      { label: "Peak height", value: "7 ft (8–12 ft widths) up to 17 ft 4 in (26 ft width)" },
      { label: "Frame", value: "Aluminum or galvanized steel" },
      { label: "Cover", value: "Flame-retardant, UV-stabilized multilayer fabric" },
      { label: "Setup", value: "No tools or specialist skills" },
    ],
    configurations: [
      { title: "Standard", description: "All-climate tensioned fabric building." },
      { title: "Tropical", description: "Configured for heat and humidity." },
      { title: "Shop", description: "Extended height on a powder-coated steel frame for workshops." },
    ],
    sources: ["https://www.weatherhaven.co.uk/series-4/", "https://www.weatherhaven.com/products/soft-shelters/series-4"],
  },
  rdmss: {
    family: "softwall",
    name: "RDMSS",
    fullName: "Rapidly Deployed Modular Shelter System",
    description:
      "Weatherhaven's most advanced soft-wall shelter, the system behind Canada's HQSS program, scaling from one to four modules.",
    keySpec: "Up to 995 ft², −51°C to +49°C",
    overview: [],
    highlights: [
      { title: "1 to 4 modules", description: "From 245 ft² to 995 ft² of floor." },
      { title: "Under 20 minutes", description: "Four-module setup; under 10 minutes for one or two modules." },
      { title: "−51°C to +49°C", description: "With a 20 lb/ft² snow load." },
    ],
    specs: [
      { label: "4-module", value: "23.8 × 41.8 ft; 995 ft²; 2,156 lb in 12 bags" },
      { label: "2-module", value: "23.8 × 20.8 ft; 495 ft²; 1,426 lb in 7 bags" },
      { label: "1-module", value: "23.8 × 10.3 ft; 245 ft²; 925 lb in 6 bags" },
      { label: "Setup", value: "Under 20 min (4-module); under 10 min (1–2 modules)" },
      { label: "Crew", value: "3 people" },
      { label: "Operating temperature", value: "−51°C to +49°C" },
      { label: "Snow load", value: "20 lb/ft²" },
      { label: "Interconnection", value: "Up to 10 points; up to 10 doors and 14 windows (4-module)" },
    ],
    configurations: [
      { title: "RDMSS-O, -P and -Op", description: "Model variants for different mission profiles." },
      { title: "Larger camps", description: "Up to ten interconnection points join buildings together." },
    ],
    sources: ["https://www.weatherhaven.co.uk/rdmss/", "https://www.weatherhaven.com/products/soft-shelters/rdmss"],
  },
  mts: {
    family: "softwall",
    name: "MTS",
    fullName: "Modular Tentage System",
    description:
      "A thermally efficient modular tent system whose standard-length modules join into command posts, kitchens, accommodation and field hospitals.",
    keySpec: "Modules join into camps and hospitals",
    overview: [],
    highlights: [
      { title: "Four-person lift", description: "Each module packs into bags sized for four people to carry." },
      { title: "Pressure-rated", description: "Performs in over- and under-pressure conditions." },
      { title: "Pre-wired", description: "Code-compliant, pre-harnessed electrical system." },
    ],
    specs: [
      { label: "Packing", value: "Fabric bags sized for a maximum 4-person lift" },
      { label: "Pressurization", value: "Over- and under-pressure capable" },
      { label: "Electrical", value: "Pre-harnessed modular system; ECU and cable ports" },
      { label: "Setup", value: "No tools or specialist training" },
    ],
    configurations: [
      { title: "Field hospitals", description: "Linked modules for treatment and support space." },
      { title: "Command, kitchens and accommodation", description: "Standard modules joined to size." },
    ],
    sources: [
      "https://www.weatherhaven.com/products/soft-shelters/modular-tentage-system",
      "https://www.weatherhaven.co.uk/modular-tentage-system/",
    ],
  },
  "mex-26": {
    family: "softwall",
    name: "MEX-26",
    fullName: "Maintenance shelter, extended height, 26 ft wide",
    description:
      "A 26-ft-wide, extended-height tensioned-fabric shelter for armored-vehicle and helicopter maintenance in the field.",
    keySpec: "26-ft clear span for vehicle maintenance",
    overview: ["MEX-26 was the subject of Weatherhaven's first Canadian military contract, in 1984."],
    highlights: [
      { title: "26-ft clear span", description: "Aluminum arches sprung into tension for high wind and snow." },
      { title: "One 463L pallet", description: "The first-line system packs to 108 × 88 × 60 in." },
      { title: "No foundation", description: "Ten people erect it in three hours or less, staked or on asphalt or concrete." },
    ],
    specs: [
      { label: "Packed", value: "First-line system on one 463L pallet: 108 × 88 × 60 in" },
      { label: "Setup", value: "10 people, 3 hours or less, no special tools" },
      { label: "Frame", value: "Aluminum arches sprung into tension for high wind and snow" },
      { label: "Foundation", value: "None; staked, or on asphalt or concrete" },
    ],
    configurations: [],
    sources: ["https://www.weatherhaven.com/products/soft-shelters/mex-26"],
  },
  "series-1-5-2": {
    family: "softwall",
    name: "Series 1.5 & 2",
    fullName: "Series 1.5 and Series 2 tensioned fabric shelters",
    description: "Lighter tensioned-fabric shelters from the same family as Series 4, for expeditionary command and support.",
    keySpec: "Lighter tensioned-fabric shelters",
    overview: [],
    highlights: [],
    specs: [],
    configurations: [],
    sources: [],
  },
  "airbeam-lp": {
    family: "inflatable",
    name: "Airmax LP",
    fullName: "Airmax LP low-pressure airbeam shelter",
    description:
      "An inflatable shelter on low-pressure airbeams that one or two people put up in 5 to 10 minutes, with no poles or frame.",
    keySpec: "Up in 5–10 min, −30°C to +50°C",
    overview: [],
    highlights: [
      { title: "Field-repairable", description: "A damaged beam can be repaired on site." },
      { title: "95 km/h wind, 50 kg/m² snow", description: "Rated from −30°C to +50°C." },
      { title: "3 to 6 m wide", description: "Any length, in 2 m increments." },
    ],
    specs: [
      { label: "Deployed (main unit)", value: "600 × 570 × 280 cm" },
      { label: "Packed (main unit)", value: "1.4 × 1.2 × 1.0 m" },
      { label: "Weight (main unit)", value: "242.5 kg" },
      { label: "Temperature", value: "−30°C to +50°C" },
      { label: "Wind / snow", value: "95 km/h (Beaufort 10) / 50 kg/m²" },
      { label: "Inflation pressure", value: "130–190 mbar (1.9–2.7 psi)" },
      { label: "Setup", value: "5–10 min, 2 people recommended" },
      { label: "Size range", value: "3–6 m wide, 2 m length increments" },
    ],
    configurations: [
      { title: "Medical and triage", description: "Clear interiors for treatment space." },
      { title: "Command and accommodation", description: "Join units in 2 m increments." },
    ],
    sources: ["/downloads/inflatable-airbeam-shelter.pdf", "https://www.weatherhaven.co.uk/airmax-lp/"],
  },
  "airbeam-hp": {
    family: "inflatable",
    name: "Airmax HP",
    fullName: "Airmax HP high-pressure airbeam shelter",
    description:
      "An inflatable shelter whose high-pressure airbeams give more rigidity and wind and snow resistance than low-pressure designs.",
    keySpec: "High-pressure beams for wind and snow",
    overview: [],
    highlights: [
      { title: "Minutes, no tools", description: "A small team sets it up; reverse pumping strikes it." },
      { title: "3 to 6 m wide", description: "Any length, in 2 m increments." },
    ],
    specs: [
      { label: "Widths", value: "3, 4, 5 and 6 m; length in 2 m increments" },
      { label: "Height (center / eaves)", value: "3 / 2 m (3–4 m wide); 3 / 2.5 m (5 m); 4 / 3 m (6 m)" },
      { label: "Setup / strike", value: "Small team, minutes, no tools; reverse pumping to strike" },
    ],
    configurations: [],
    sources: ["https://www.weatherhaven.co.uk/airmax-hp/"],
  },
  polarhaven: {
    family: "polar",
    name: "Polarhaven",
    fullName: "Polarhaven polar base-camp shelter",
    description:
      "A modular, insulated tensioned-fabric shelter for long-term polar base camps, in Antarctica since 1988.",
    keySpec: "Antarctic base camps since 1988",
    overview: [
      "Polarhaven was Weatherhaven's first Antarctic camp shelter. A large Polarhaven served as the operations hub for NASA-supported under-ice robotics at Lake Bonney in Antarctica's McMurdo Dry Valleys.",
    ],
    highlights: [
      { title: "8 to 20 ft wide, any length", description: "Seven widths." },
      { title: "About 30 minutes", description: "For a 12 × 16 ft unit." },
      { title: "Choice of insulation", description: "Translucent for solar gain, or foil bubble for warmth." },
    ],
    specs: [
      { label: "Widths", value: "8, 10, 12, 14, 16, 18 and 20 ft; length unlimited" },
      { label: "Peak height", value: "7 ft (8–12 ft widths) to 11.8 ft (20 ft width)" },
      { label: "Average weight", value: "1.75 lb per ft² of floor" },
      { label: "Setup", value: "≈ 30 min for a 12 × 16 ft unit" },
      { label: "Materials", value: "Powder-coated aluminum frame; cold-weather nylon cover" },
      { label: "Insulation", value: "Translucent polyester (solar gain) or foil bubble (max thermal)" },
    ],
    configurations: [],
    sources: ["https://www.weatherhaven.co.uk/polarhaven/", "https://www.weatherhaven.com/products/soft-shelters/polar-shelters"],
  },
  "polar-chief": {
    family: "polar",
    name: "Polar Chief",
    fullName: "Polar Chief octagonal polar shelter",
    description:
      "A fully insulated octagonal shelter that Antarctic programs use as a camp kitchen, lab or office.",
    keySpec: "Comfortable at −50°C",
    overview: [],
    highlights: [
      { title: "−50°C ambient", description: "Stays comfortable inside at −50°C (−58°F)." },
      { title: "Two people, about 20 minutes", description: "One-inch aluminum frame on an umbrella hub." },
      { title: "Three bags", description: "220 lb and 42 ft³ packed." },
    ],
    specs: [
      { label: "Size", value: "14 ft across / 15.5 ft diagonal" },
      { label: "Height", value: "6.3 ft eaves / 8.5 ft center" },
      { label: "Weight / packed", value: "220 lb; 42 ft³ in 3 bags" },
      { label: "Setup", value: "≈ 20 min, 2 people" },
      { label: "Comfortable ambient temperature", value: "−50°C (−58°F)" },
      { label: "Construction", value: "1 in aluminum frame, umbrella hub; insulated 420-denier nylon cover" },
    ],
    configurations: [],
    sources: ["https://www.weatherhaven.co.uk/polar-chief/"],
  },
  endurance: {
    family: "polar",
    name: "Endurance",
    fullName: "Endurance polar expedition shelter",
    description:
      "A lightweight polar tent that one person sets up from inside in about five minutes, with clamshell ends for medevac or equipment access.",
    keySpec: "One person, about five minutes",
    overview: ["Endurance is named after Shackleton's ship."],
    highlights: [
      { title: "77 to 101 lb", description: "16 ft or 21 ft long, both 8 ft wide." },
      { title: "Sled, snowmobile or helicopter", description: "Packs to 110 in long." },
    ],
    specs: [
      { label: "Sizes", value: "16 ft or 21 ft long × 8 ft wide × 6 ft 6 in high" },
      { label: "Weight", value: "77 lb (16 ft) / 101 lb (21 ft)" },
      { label: "Packed", value: "110 × 12 × 12 in (16 ft) / 110 × 12 × 18 in (21 ft)" },
      { label: "Setup", value: "1 person, ≈ 5 min, erected from inside" },
      { label: "Transport", value: "Sled, snowmobile or helicopter" },
      { label: "Construction", value: "Aluminum frame, ripstop nylon cover, thermal liner, ballast skirt" },
    ],
    configurations: [],
    sources: ["https://www.weatherhaven.co.uk/endurance/"],
  },
};

export function getProductContent(slug: string): ProductContent | undefined {
  return PRODUCT_CONTENT[slug];
}

/**
 * The expanded name is worth showing only when it spells out an acronym ("TRECC: Tactical
 * Redeployable…"). For names like Polarhaven or Airmax LP it just repeats the name.
 */
export function showsFullName(name: string, fullName: string | undefined): fullName is string {
  if (!fullName?.trim()) return false;
  const first = name.trim().split(/\s+/)[0].toLowerCase();
  return /[A-Z]{2,}/.test(name) && !fullName.toLowerCase().includes(first);
}

/** Values that marked the old, generic placeholder spec sheet. */
const LEGACY_PLACEHOLDER_SPECS = [
  "Mission-configured (technical exchange)",
  "Hours to days (system-dependent)",
  "Sized to CONOPS",
];

export function hasLegacyPlaceholderSpecs(specs: ProductSpec[] | undefined): boolean {
  if (!specs || specs.length === 0) return true;
  return specs.some((s) => LEGACY_PLACEHOLDER_SPECS.includes(s.value.trim()));
}
