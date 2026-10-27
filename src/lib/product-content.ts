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
      "Hard-wall shelters that ship as ISO containers, pallets or trailers and unfold to two or three times their footprint in minutes.",
    cover: "/products/ehmecc/gallery/13-NATO_EHMECCs_deployed.jpg",
  },
  {
    id: "softwall",
    name: "Soft-wall shelters",
    summary:
      "Tensioned-fabric buildings and modular tentage for camps, headquarters, hospitals and maintenance, at almost any length.",
    cover: "/products/series-4/gallery/20-Series-4-Truss.jpg",
  },
  {
    id: "inflatable",
    name: "Inflatable shelters",
    summary: "Airbeam shelters a small team inflates in minutes, with no tools and no frame to assemble.",
    cover: "/products/airbeam-lp/gallery/09-Airbeam-Low-Pressure-10.jpg",
  },
  {
    id: "polar",
    name: "Polar shelters",
    summary:
      "Insulated shelters built for the coldest places people work, used by national Antarctic programs since 1988.",
    cover: "/products/polarhaven/gallery/01-IMG_0691.jpg",
  },
];

export type ProductContent = {
  family: ProductFamily;
  name: string;
  /** Expanded product name, as Weatherhaven publishes it. */
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

const CONFIGURE_NOTE = {
  title: "Configured to your requirement",
  description:
    "Interior fit-out, environmental control, power and flooring are specified with a Weatherhaven expert for each program.",
};

export const PRODUCT_CONTENT: Record<string, ProductContent> = {
  mecc: {
    family: "expandable",
    name: "MECC",
    fullName: "Mobile Expandable Container Configuration",
    description:
      "Weatherhaven's original expandable shelter: a 20-ft ISO container whose insulated wings fold out to triple its floor space.",
    keySpec: "420 ft² from one 20-ft ISO container",
    overview: [
      "The MECC ships, stacks and lifts like any 20-ft ISO container. On site, two people fold out its insulated wings in about 10 to 15 minutes, tripling the floor space with no special skills or tools.",
      "It is built for a 15 to 20 year field life and fits out as a command post, clinic, workshop, office or accommodation module, alone or joined into a larger camp.",
    ],
    highlights: [
      { title: "Triples its footprint", description: "From a standard 20-ft ISO container to 420 ft² of insulated floor." },
      { title: "Two people, about 15 minutes", description: "No special skills or tools to deploy or strike." },
      { title: "Moves like cargo", description: "ISO and CSC certified, stacks nine high, lifts by forklift, crane or helicopter." },
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
      CONFIGURE_NOTE,
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
      "A 20-ft ISO container that unfolds to triple its floor space and raises its roof to a 12-ft interior: room for a full headquarters.",
    keySpec: "420 ft² with 12-ft interior height",
    overview: [
      "The EHMECC takes the MECC's expanding design and lifts the roof, giving 144 inches of interior height across 420 ft² of floor. The extra volume suits headquarters, large command posts and equipment that won't fit under a standard ceiling.",
      "It deploys in under 10 minutes without tools, even while still mounted on a truck, and moves through the ISO system and by C-130, C-17, C-5 or A400M.",
    ],
    highlights: [
      { title: "12-ft interior height", description: "The most deployed volume of any Weatherhaven expanding container." },
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
      CONFIGURE_NOTE,
    ],
    sources: ["https://www.weatherhaven.co.uk/ehmecc/", "https://www.weatherhaven.com/Military"],
  },
  bmecc: {
    family: "expandable",
    name: "BMECC",
    fullName: "BMECC 10-ft expandable container",
    description:
      "A 10-ft ISO version of the MECC that expands to 210 ft² of insulated workspace; two units ship together as one 20-ft container.",
    keySpec: "210 ft² from a 10-ft ISO container",
    overview: [
      "The BMECC brings the MECC's expanding wings to a 10-ft container. Two units couple to ship as a single 20-ft ISO module, then deploy as separate rooms.",
      "It is rated from −51°C to +49°C and suits smaller command, medical and workspace roles where a full 20-ft footprint is too much.",
    ],
    highlights: [
      { title: "Two ship as one", description: "Two BMECCs make one 20-ft ISO shipping module with full CSC." },
      { title: "210 ft² deployed", description: "1,590 ft³ of insulated volume from a 10-ft container." },
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
    configurations: [CONFIGURE_NOTE],
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
      "TRECC is an all-aluminum expanding shelter that rides on a trailer, a vehicle or a single 463L pallet. Two people deploy it in under three minutes using 24VDC electric actuators, with a manual backup.",
      "It was co-developed with US Army DEVCOM and tested to MIL-STD-810G, and is fitted out as a command post, workshop, clinic or off-grid sanitation and kitchen unit.",
    ],
    highlights: [
      { title: "Under 3 minutes", description: "Two personnel; electric actuators with manual backup." },
      { title: "Rides on what you drive", description: "Light tactical trailer, M1289 JLTV trailer or a single 463L pallet." },
      { title: "Tested", description: "MIL-STD-810G; safety testing at Aberdeen Test Center; TRL 9 (TRECC-T)." },
    ],
    specs: [
      { label: "Setup", value: "Under 3 min, 2 personnel; 24VDC actuators, manual backup" },
      { label: "Climate", value: "−40°F to +120°F" },
      { label: "Wind rating", value: "55 mph sustained / 75 mph gusts" },
      { label: "TRECC-T (light tactical trailer)", value: "86 ft² (6–8 pers.); 1,620 lb" },
      { label: "TRECC-M (M1289 JLTV trailer)", value: "121.6 ft² (8–12 pers.); 2,200 lb" },
      { label: "TRECC-P (one 463L pallet)", value: "132 ft²; 2,205 lb tare" },
      { label: "Helicopter", value: "Under 60 in packed height for internal CH-47 carry" },
      { label: "Testing", value: "MIL-STD-810G; Aberdeen Test Center; TRL 9 (TRECC-T)" },
    ],
    configurations: [
      { title: "TRECC-T", description: "Light tactical trailer. Stowed 114 × 94.5 × 57 in; deployed 181 × 97 × 82 in." },
      { title: "TRECC-M", description: "M1289 JLTV trailer. Stowed 89 × 84 × 57 in; deployed 171 × 72 × 78 in." },
      { title: "TRECC-P", description: "Single 463L pallet. Packed 104 × 84 × 60 in." },
      { title: "TRECC sanitation", description: "Off-grid field sanitation and kitchen unit; solar and 24VDC power." },
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
    overview: [
      "ATEPS packs a hard-wall shelter onto one 463L pallet so it flies on any fixed-wing aircraft with more than 92 inches of clearance. Two people expand it to more than double its width in under ten minutes.",
      "Its floor carries up to 7,500 lb on D-ring tie-downs, and it lifts by four-point sling or forklift.",
    ],
    highlights: [
      { title: "Flies on one pallet", description: "Stowed on a single 463L pallet, 84 × 104 in." },
      { title: "Two people, under 10 min", description: "Expands to 244 × 104 in." },
      { title: "Heavy-duty floor", description: "Rated up to 7,500 lb with D-ring tie-downs." },
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
    configurations: [CONFIGURE_NOTE],
    sources: ["https://www.weatherhaven.com/products/expandable-container/ateps"],
  },
  hercon: {
    family: "expandable",
    name: "HERCon",
    fullName: "Hardwall Expandable Redeployable Container",
    description:
      "A hard-wall, ISO-standard expandable building for housing, kitchens, offices and clinics that opens to up to six times its shipping footprint.",
    keySpec: "Expands up to 6× its shipping footprint",
    overview: [
      "HERCon is a hard-wall building that ships as an ISO container with no extra packaging. Two 4-ft-wide units couple to ship as one 8-ft container, then deploy as two separate rooms.",
      "A team of six stands it up in minutes with no foundation, for housing, kitchens, offices, clinics and emergency accommodation.",
    ],
    highlights: [
      { title: "Up to 6× the footprint", description: "Expands far beyond its shipping size." },
      { title: "Ships as cargo", description: "Two 4-ft units couple into one 8-ft ISO container." },
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
      CONFIGURE_NOTE,
    ],
    sources: ["https://www.weatherhaven.com/products/expandable-container/hercon"],
  },
  "non-expandable-iso-containers": {
    family: "expandable",
    name: "ISO containers",
    fullName: "Non-expandable ISO containers",
    description:
      "Fixed-footprint ISO container modules fitted out for life support, medical, morgue and technical roles alongside expandable shelters.",
    keySpec: "Fitted ISO modules for fixed roles",
    overview: [
      "Where a role doesn't need extra floor space, Weatherhaven fits out standard ISO containers as life-support, medical, morgue and technical modules that integrate with the rest of a camp.",
    ],
    highlights: [
      { title: "Standard logistics", description: "Moves like any ISO container." },
      { title: "Purpose-fitted", description: "Life support, medical, morgue and technical interiors." },
      { title: "Camp-ready", description: "Integrates with expandable and soft-wall shelters." },
    ],
    specs: [],
    configurations: [CONFIGURE_NOTE],
    sources: [],
  },
  "series-4": {
    family: "softwall",
    name: "Series 4",
    fullName: "Series 4 tensioned fabric shelter",
    description:
      "Weatherhaven's original all-climate fabric building: a tensioned-arch shelter 8 to 30 ft wide, used on all seven continents.",
    keySpec: "8 to 30 ft wide, any length",
    overview: [
      "Series 4 is a tensioned-arch fabric building on an aluminum or galvanized steel frame. It comes in eleven widths from 8 to 30 ft and extends to any length, and goes up without tools or specialist skills.",
      "Camps on every continent use it for kitchens, accommodation, workshops and command space.",
    ],
    highlights: [
      { title: "Any length", description: "Eleven widths from 8 to 30 ft, extended in modules." },
      { title: "No tools", description: "No specialist skills needed to erect it." },
      { title: "Every continent", description: "Proven from the tropics to Antarctic research camps." },
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
    overview: [
      "RDMSS scales from a single 245 ft² module to a 995 ft² four-module building that three people put up in under 20 minutes. It is the shelter behind Canada's Headquarters Shelter System (HQSS) program.",
      "It is rated from −51°C to +49°C and carries a 20 lb/ft² snow load, with up to ten interconnection points for larger camps.",
    ],
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
      { title: "Headquarters (HQSS)", description: "The basis of Canada's HQSS acquisition." },
      CONFIGURE_NOTE,
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
    overview: [
      "MTS modules share a standard length so they link into larger structures: command posts, kitchens, accommodation and field hospitals. Each packs into bags sized for a four-person lift.",
      "It performs under over- and under-pressure conditions and comes with a pre-harnessed, code-compliant electrical system, with ports for environmental control units and cabling.",
    ],
    highlights: [
      { title: "Modular", description: "Standard-length modules join into larger buildings." },
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
    overview: [
      "MEX-26 was the subject of Weatherhaven's first Canadian military contract, in 1984. Its aluminum arches are sprung into tension to stand up to high wind and snow over a 26-ft clear span.",
      "The first-line system fits on one 463L pallet and ten people erect it in three hours or less, staked or on asphalt or concrete, with no foundation.",
    ],
    highlights: [
      { title: "26-ft clear span", description: "Room for armored vehicles and helicopters." },
      { title: "One pallet", description: "First-line system packs to 108 × 88 × 60 in." },
      { title: "No foundation", description: "Staked, or set on asphalt or concrete." },
    ],
    specs: [
      { label: "Packed", value: "First-line system on one 463L pallet: 108 × 88 × 60 in" },
      { label: "Setup", value: "10 people, 3 hours or less, no special tools" },
      { label: "Frame", value: "Aluminum arches sprung into tension for high wind and snow" },
      { label: "Foundation", value: "None; staked, or on asphalt or concrete" },
    ],
    configurations: [CONFIGURE_NOTE],
    sources: ["https://www.weatherhaven.com/products/soft-shelters/mex-26"],
  },
  "series-1-5-2": {
    family: "softwall",
    name: "Series 1.5 & 2",
    fullName: "Series 1.5 and Series 2 tensioned fabric shelters",
    description: "Lighter tensioned-fabric shelters from the same family as Series 4, for expeditionary command and support.",
    keySpec: "Lighter tensioned-fabric shelters",
    overview: [
      "Series 1.5 and Series 2 are lighter tensioned-fabric shelters from the Series 4 family, used for expeditionary command and support. Ask a Weatherhaven expert for current sizes and availability.",
    ],
    highlights: [
      { title: "Lighter frame", description: "From the Series 4 family." },
      { title: "Expeditionary", description: "For command and support roles." },
      { title: "Talk to an expert", description: "Current sizes and availability on request." },
    ],
    specs: [],
    configurations: [CONFIGURE_NOTE],
    sources: [],
  },
  "airbeam-lp": {
    family: "inflatable",
    name: "Airmax LP",
    fullName: "Airmax LP low-pressure airbeam shelter",
    description:
      "A field-repairable inflatable shelter that one or two people deploy in 5 to 10 minutes, rated from −30°C to +50°C.",
    keySpec: "Up in 5–10 min, −30°C to +50°C",
    overview: [
      "Airmax LP replaces poles and frames with low-pressure airbeams. One or two people inflate it in 5 to 10 minutes, and it is field-repairable if a beam is damaged.",
      "It is rated for 95 km/h winds and 50 kg/m² snow, in widths from 3 to 6 m and lengths in 2 m increments.",
    ],
    highlights: [
      { title: "5 to 10 minutes", description: "Two people recommended; no tools." },
      { title: "Weather-rated", description: "95 km/h wind (Beaufort 10) and 50 kg/m² snow." },
      { title: "Field-repairable", description: "Low-pressure beams can be repaired on site." },
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
    overview: [
      "Airmax HP uses high-pressure airbeams for a stiffer structure that stands up better to wind and snow. A small team sets it up in minutes without tools and strikes it by reverse pumping.",
    ],
    highlights: [
      { title: "Stiffer structure", description: "High-pressure beams resist wind and snow." },
      { title: "Minutes, no tools", description: "Small-team setup; reverse pumping to strike." },
      { title: "Scalable", description: "3 to 6 m wide, lengths in 2 m increments." },
    ],
    specs: [
      { label: "Widths", value: "3, 4, 5 and 6 m; length in 2 m increments" },
      { label: "Height (centre / eaves)", value: "3 / 2 m (3–4 m wide); 3 / 2.5 m (5 m); 4 / 3 m (6 m)" },
      { label: "Setup / strike", value: "Small team, minutes, no tools; reverse pumping to strike" },
    ],
    configurations: [CONFIGURE_NOTE],
    sources: ["https://www.weatherhaven.co.uk/airmax-hp/"],
  },
  polarhaven: {
    family: "polar",
    name: "Polarhaven",
    fullName: "Polarhaven polar base-camp shelter",
    description:
      "A modular, insulated tensioned-fabric shelter for long-term polar base camps, used by national Antarctic programs since 1988.",
    keySpec: "Antarctic base camps since 1988",
    overview: [
      "Polarhaven was Weatherhaven's first Antarctic camp shelter, in 1988. It comes in seven widths from 8 to 20 ft at any length, with translucent insulation for solar gain or foil-bubble insulation for maximum warmth.",
      "A large Polarhaven served as the operations hub for NASA-supported under-ice robotics at Lake Bonney in Antarctica's McMurdo Dry Valleys.",
    ],
    highlights: [
      { title: "Any length", description: "Widths from 8 to 20 ft." },
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
    configurations: [CONFIGURE_NOTE],
    sources: ["https://www.weatherhaven.co.uk/polarhaven/", "https://www.weatherhaven.com/products/soft-shelters/polar-shelters"],
  },
  "polar-chief": {
    family: "polar",
    name: "Polar Chief",
    fullName: "Polar Chief octagonal polar shelter",
    description:
      "A fully insulated octagonal polar shelter, used by Antarctic programs as a camp kitchen, lab or office, that two people set up in about 20 minutes.",
    keySpec: "Comfortable at −50°C",
    overview: [
      "Polar Chief is an insulated octagonal shelter on a one-inch aluminum frame with an umbrella hub. Two people set it up in about 20 minutes, and it stays comfortable at −50°C ambient.",
      "Antarctic programs use it as a camp kitchen, lab or office.",
    ],
    highlights: [
      { title: "−50°C", description: "Comfortable ambient temperature rating." },
      { title: "About 20 minutes", description: "Two people, umbrella-hub frame." },
      { title: "Packs into three bags", description: "220 lb, 42 ft³." },
    ],
    specs: [
      { label: "Size", value: "14 ft across / 15.5 ft diagonal" },
      { label: "Height", value: "6.3 ft eaves / 8.5 ft centre" },
      { label: "Weight / packed", value: "220 lb; 42 ft³ in 3 bags" },
      { label: "Setup", value: "≈ 20 min, 2 people" },
      { label: "Comfortable ambient temperature", value: "−50°C (−58°F)" },
      { label: "Construction", value: "1 in aluminum frame, umbrella hub; insulated 420-denier nylon cover" },
    ],
    configurations: [CONFIGURE_NOTE],
    sources: ["https://www.weatherhaven.co.uk/polar-chief/"],
  },
  endurance: {
    family: "polar",
    name: "Endurance",
    fullName: "Endurance polar expedition shelter",
    description:
      "A lightweight polar tent that one person sets up from inside in about five minutes, with clamshell ends for medevac or equipment access.",
    keySpec: "One person, about five minutes",
    overview: [
      "Endurance is named after Shackleton's ship. One person erects it from the inside in about five minutes, and its clamshell ends open for medevac or equipment access.",
      "It comes in 16 ft and 21 ft lengths, weighs 77 to 101 lb, and travels by sled, snowmobile or helicopter.",
    ],
    highlights: [
      { title: "One person", description: "Erected from inside in about five minutes." },
      { title: "Clamshell ends", description: "Open fully for medevac or equipment." },
      { title: "Light", description: "77 lb (16 ft) or 101 lb (21 ft)." },
    ],
    specs: [
      { label: "Sizes", value: "16 ft or 21 ft long × 8 ft wide × 6 ft 6 in high" },
      { label: "Weight", value: "77 lb (16 ft) / 101 lb (21 ft)" },
      { label: "Packed", value: "110 × 12 × 12 in (16 ft) / 110 × 12 × 18 in (21 ft)" },
      { label: "Setup", value: "1 person, ≈ 5 min, erected from inside" },
      { label: "Transport", value: "Sled, snowmobile or helicopter" },
      { label: "Construction", value: "Aluminum frame, ripstop nylon cover, thermal liner, ballast skirt" },
    ],
    configurations: [
      { title: "16 ft and 21 ft", description: "Two lengths, same 8 ft width." },
    ],
    sources: ["https://www.weatherhaven.co.uk/endurance/"],
  },
};

export function getProductContent(slug: string): ProductContent | undefined {
  return PRODUCT_CONTENT[slug];
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
