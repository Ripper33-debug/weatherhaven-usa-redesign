/**
 * Step-by-step mission builder for the public site: five plain questions, then the Weatherhaven
 * systems that fit, each with the published facts behind the match.
 *
 * Every reason string restates a published spec from product-content.ts (or a public program
 * record noted inline). Nothing here invents capacities or prices; the scores only rank systems.
 * This is separate from campPlanner.ts, which the SOF deployment planner also uses.
 */
import type { ContactPrefillPayload } from "@/lib/contact-prefill";

export type MissionId = "command" | "medical" | "maintenance" | "living" | "research" | "response";
export type ClimateId = "polar" | "cold" | "temperate" | "hot" | "tropical" | "mixed";
export type PeopleId = "1-8" | "9-25" | "26-100" | "101-500" | "500+";
export type TransportId = "air" | "helo" | "road" | "sea" | "remote";
export type DurationId = "rapid" | "months" | "years";

export type GuideAnswers = {
  mission?: MissionId;
  climate?: ClimateId;
  people?: PeopleId;
  transport?: TransportId;
  duration?: DurationId;
};

export type QuestionKey = keyof GuideAnswers;

export type Question = {
  key: QuestionKey;
  /** Short label for the progress rail and the answer summary. */
  label: string;
  title: string;
  options: { id: string; label: string; hint: string }[];
};

export const QUESTIONS: Question[] = [
  {
    key: "mission",
    label: "Mission",
    title: "What will the shelters be used for?",
    options: [
      { id: "command", label: "Command post or headquarters", hint: "Operations, planning, communications" },
      { id: "medical", label: "Medical care", hint: "Triage, clinics, field hospitals" },
      { id: "maintenance", label: "Maintenance", hint: "Vehicles, aircraft, equipment" },
      { id: "living", label: "Camp life", hint: "Accommodation, kitchens, sanitation" },
      { id: "research", label: "Research or survey", hint: "Remote science and field camps" },
      { id: "response", label: "Disaster or emergency response", hint: "Shelter that has to be up today" },
    ],
  },
  {
    key: "climate",
    label: "Climate",
    title: "Where will it be?",
    options: [
      { id: "polar", label: "Polar or extreme cold", hint: "Down to −40° and below" },
      { id: "cold", label: "Cold winters and snow", hint: "Snow load and wind" },
      { id: "temperate", label: "Temperate", hint: "Rain, wind, moderate temperatures" },
      { id: "hot", label: "Desert or extreme heat", hint: "Above 100°F" },
      { id: "tropical", label: "Tropical", hint: "Heat, humidity, heavy rain" },
      { id: "mixed", label: "Several, or not decided", hint: "Needs to work anywhere" },
    ],
  },
  {
    key: "people",
    label: "People",
    title: "How many people will it support?",
    options: [
      { id: "1-8", label: "1 to 8", hint: "A small team" },
      { id: "9-25", label: "9 to 25", hint: "A section or detachment" },
      { id: "26-100", label: "26 to 100", hint: "A company-sized element" },
      { id: "101-500", label: "101 to 500", hint: "A battalion or large camp" },
      { id: "500+", label: "More than 500", hint: "A base camp" },
    ],
  },
  {
    key: "transport",
    label: "Transport",
    title: "How will it get there?",
    options: [
      { id: "air", label: "Fixed-wing airlift", hint: "C-130, C-17, 463L pallets" },
      { id: "helo", label: "Helicopter", hint: "Internal load or sling" },
      { id: "road", label: "Truck or trailer", hint: "Towed or vehicle-mounted" },
      { id: "sea", label: "Ship, rail or truck as ISO containers", hint: "Standard container logistics" },
      { id: "remote", label: "By hand, sled or snowmobile", hint: "No heavy lift on site" },
    ],
  },
  {
    key: "duration",
    label: "Duration",
    title: "How long will it stay up?",
    options: [
      { id: "rapid", label: "Days to weeks", hint: "Fast up, fast down, move again" },
      { id: "months", label: "Months", hint: "A deployment or a season" },
      { id: "years", label: "Years", hint: "Semi-permanent" },
    ],
  },
];

type Score = 0 | 1 | 2 | 3;
type Factor<K extends string> = Partial<Record<K, Score>>;

type Profile = {
  slug: string;
  name: string;
  mission: Factor<MissionId>;
  climate: Factor<ClimateId>;
  people: Factor<PeopleId>;
  transport: Factor<TransportId>;
  duration: Factor<DurationId>;
  /** Published facts, keyed by what they support. Shown as the reasons a system fits. */
  facts: Partial<Record<`${QuestionKey}:${string}` | QuestionKey, string>>;
};

/** Systems with published specs. Missing keys score 0 (not a fit). */
const PROFILES: Profile[] = [
  {
    slug: "trecc",
    name: "TRECC",
    mission: { command: 3, medical: 2, maintenance: 2, living: 2, research: 1, response: 2 },
    climate: { polar: 2, cold: 3, temperate: 2, hot: 3, tropical: 2, mixed: 3 },
    people: { "1-8": 3, "9-25": 3, "26-100": 1 },
    transport: { air: 3, helo: 3, road: 3, sea: 1 },
    duration: { rapid: 3, months: 2, years: 1 },
    facts: {
      mission: "Fits out as a command post, workshop, clinic or off-grid sanitation and kitchen unit.",
      "climate:polar": "Rated from −40°F to +120°F, with 55 mph sustained winds.",
      climate: "Rated from −40°F to +120°F, with 55 mph sustained winds.",
      people: "TRECC-T is sized for 6–8 people; TRECC-M, on a JLTV trailer, for 8–12.",
      "transport:air": "TRECC-P travels on a single 463L pallet.",
      "transport:helo": "Under 60 in stowed height, so it is CH-47 airlift compatible.",
      "transport:road": "Rides a light tactical trailer or an M1289 JLTV trailer.",
      duration: "Two people expand it in under three minutes with 24VDC actuators.",
    },
  },
  {
    slug: "mecc",
    name: "MECC",
    mission: { command: 2, medical: 2, maintenance: 2, living: 2, research: 1, response: 1 },
    climate: { polar: 1, cold: 2, temperate: 2, hot: 2, tropical: 2, mixed: 2 },
    people: { "1-8": 2, "9-25": 3, "26-100": 2, "101-500": 1, "500+": 1 },
    transport: { air: 1, helo: 2, road: 3, sea: 3 },
    duration: { rapid: 2, months: 3, years: 3 },
    facts: {
      mission: "Fits out as a command post, clinic, workshop, office or accommodation module.",
      "mission:living": "The US Army's Containerized Kitchen program orders Weatherhaven parts, including MECC wing walls.",
      people: "Folds out from a 20-ft ISO container to 420 ft² of insulated floor.",
      "transport:sea": "Ships and stacks like any 20-ft ISO container: ISO and CSC certified, nine high.",
      "transport:road": "Moves by forklift, crane, helicopter or PLS truck.",
      "transport:helo": "Moves by forklift, crane, helicopter or PLS truck.",
      "duration:years": "Built for a 15 to 20 year field life.",
      "duration:rapid": "Two people deploy it in 10–15 minutes, no special skills.",
    },
  },
  {
    slug: "ehmecc",
    name: "EHMECC",
    mission: { command: 3, medical: 1, maintenance: 1, response: 1 },
    climate: { polar: 1, cold: 2, temperate: 2, hot: 2, tropical: 2, mixed: 2 },
    people: { "1-8": 1, "9-25": 3, "26-100": 3, "101-500": 2, "500+": 1 },
    transport: { air: 3, helo: 2, road: 3, sea: 3 },
    duration: { rapid: 2, months: 3, years: 2 },
    facts: {
      mission: "Suits headquarters and large command posts: 420 ft² with a 12-ft interior height.",
      "transport:air": "Flies on C-130, C-17, C-5 and A400M.",
      "transport:helo": "Can be underslung by helicopter.",
      "transport:road": "Deploys in under 10 minutes, even while still on the truck.",
      "transport:sea": "A standard 20-ft ISO container with full CSC certification.",
      "duration:rapid": "Deploys in under 10 minutes without tools.",
    },
  },
  {
    slug: "bmecc",
    name: "BMECC",
    mission: { command: 2, medical: 2, maintenance: 1, living: 1, research: 1, response: 1 },
    climate: { polar: 3, cold: 3, temperate: 2, hot: 3, tropical: 2, mixed: 3 },
    people: { "1-8": 3, "9-25": 2, "26-100": 1 },
    transport: { air: 1, helo: 1, road: 2, sea: 3 },
    duration: { rapid: 1, months: 2, years: 3 },
    facts: {
      mission: "Expands a 10-ft container into 210 ft² of insulated command, medical or work space.",
      climate: "Rated from −51°C to +49°C.",
      "transport:sea": "Two units couple to ship as one 20-ft ISO container.",
    },
  },
  {
    slug: "ateps",
    name: "ATEPS",
    mission: { command: 2, medical: 1, maintenance: 2, living: 1, research: 1, response: 2 },
    climate: { polar: 1, cold: 2, temperate: 2, hot: 2, tropical: 2, mixed: 2 },
    people: { "1-8": 3, "9-25": 2, "26-100": 1 },
    transport: { air: 3, helo: 1, road: 2, sea: 1 },
    duration: { rapid: 3, months: 2, years: 1 },
    facts: {
      "mission:maintenance": "Its floor carries up to 7,500 lb on D-ring tie-downs.",
      mission: "A hard-wall, insulated workspace on one air-cargo pallet.",
      "transport:air": "Flies on one 463L pallet in any fixed-wing aircraft with more than 92 in of clearance.",
      duration: "Two people expand it in under 10 minutes.",
    },
  },
  {
    slug: "hercon",
    name: "HERCon",
    mission: { command: 1, medical: 2, living: 3, research: 1, response: 3 },
    climate: { polar: 1, cold: 2, temperate: 2, hot: 2, tropical: 2, mixed: 2 },
    people: { "1-8": 1, "9-25": 2, "26-100": 3, "101-500": 3, "500+": 2 },
    transport: { road: 2, sea: 3 },
    duration: { rapid: 1, months: 2, years: 3 },
    facts: {
      mission: "Hard-wall housing, kitchens, offices and clinics that expand up to 6× their shipping footprint.",
      "transport:sea": "Ships as an ISO container with no extra packaging.",
      duration: "Stands on site with no foundation; a team of six deploys it in minutes.",
    },
  },
  {
    slug: "series-4",
    name: "Series 4",
    mission: { command: 2, medical: 1, maintenance: 2, living: 3, research: 3, response: 1 },
    climate: { polar: 3, cold: 3, temperate: 3, hot: 2, tropical: 3, mixed: 3 },
    people: { "1-8": 2, "9-25": 3, "26-100": 3, "101-500": 3, "500+": 3 },
    transport: { air: 1, helo: 1, road: 2, sea: 2, remote: 1 },
    duration: { rapid: 1, months: 3, years: 3 },
    facts: {
      mission: "Kitchens, accommodation, workshops and command space in eleven widths from 8 to 30 ft, any length.",
      "mission:research": "Houses the Beyond EPICA ice-core drill and crew at Little Dome C, Antarctica.",
      "climate:polar": "Houses the Beyond EPICA ice-core drill and crew at Little Dome C, Antarctica.",
      "climate:tropical": "Comes in a Tropical configuration for heat and humidity.",
      climate: "Used on every continent, from the tropics to Antarctic research camps.",
      people: "Eleven widths from 8 to 30 ft, extended to any length.",
      duration: "Goes up without tools or specialist skills.",
    },
  },
  {
    slug: "rdmss",
    name: "RDMSS",
    mission: { command: 3, medical: 2, maintenance: 1, living: 2, research: 1, response: 3 },
    climate: { polar: 3, cold: 3, temperate: 2, hot: 3, tropical: 2, mixed: 3 },
    people: { "1-8": 1, "9-25": 3, "26-100": 3, "101-500": 3, "500+": 2 },
    transport: { air: 3, helo: 2, road: 2, sea: 2, remote: 1 },
    duration: { rapid: 3, months: 3, years: 2 },
    facts: {
      "mission:command": "The shelter behind Canada's Headquarters Shelter System: 1,435 shelters for the Canadian Armed Forces.",
      "mission:medical": "Weatherhaven's 100-bed COVID-19 mobile health units for Canada were built from HQSS-derived shelters.",
      "mission:response": "Weatherhaven's 100-bed COVID-19 mobile health units for Canada were built from HQSS-derived shelters.",
      mission: "Scales from a 245 ft² module to a 995 ft² four-module building.",
      climate: "Rated from −51°C to +49°C, with a 20 lb/ft² snow load.",
      "transport:air": "A 995 ft² four-module building packs into 12 bags, 2,156 lb in all.",
      transport: "A 995 ft² four-module building packs into 12 bags, 2,156 lb in all.",
      duration: "Three people put up four modules in under 20 minutes.",
    },
  },
  {
    slug: "mts",
    name: "MTS",
    mission: { command: 2, medical: 3, maintenance: 1, living: 3, research: 1, response: 2 },
    climate: { polar: 1, cold: 2, temperate: 2, hot: 2, tropical: 2, mixed: 2 },
    people: { "1-8": 1, "9-25": 2, "26-100": 3, "101-500": 3, "500+": 3 },
    transport: { air: 2, helo: 1, road: 2, sea: 2, remote: 2 },
    duration: { rapid: 2, months: 3, years: 2 },
    facts: {
      "mission:medical": "Standard modules link into field hospitals, and it works under over- and under-pressure.",
      mission: "Standard-length modules join into command posts, kitchens, accommodation and field hospitals.",
      transport: "Packs into bags sized for a four-person lift.",
      duration: "Pre-wired, code-compliant electrical system; no tools or specialist training to set up.",
    },
  },
  {
    slug: "mex-26",
    name: "MEX-26",
    mission: { maintenance: 3 },
    climate: { polar: 1, cold: 2, temperate: 2, hot: 2, tropical: 2, mixed: 2 },
    people: { "9-25": 2, "26-100": 2, "101-500": 1 },
    transport: { air: 3, road: 2, sea: 1 },
    duration: { rapid: 1, months: 3, years: 2 },
    facts: {
      mission: "A 26-ft clear span for armored vehicles and helicopters.",
      climate: "Aluminum arches sprung into tension stand up to high wind and snow.",
      "transport:air": "The first-line system fits one 463L pallet.",
      duration: "No foundation: staked, or set on asphalt or concrete.",
    },
  },
  {
    slug: "airbeam-lp",
    name: "Airmax LP",
    mission: { command: 2, medical: 3, living: 2, research: 1, response: 3 },
    climate: { cold: 2, temperate: 3, hot: 3, tropical: 2, mixed: 2 },
    people: { "1-8": 3, "9-25": 3, "26-100": 1 },
    transport: { air: 2, helo: 2, road: 3, sea: 1, remote: 1 },
    duration: { rapid: 3, months: 1 },
    facts: {
      "mission:medical": "Clear interiors for treatment and triage space.",
      mission: "Joins units in 2 m increments for command, medical or accommodation space.",
      climate: "Rated from −30°C to +50°C, 95 km/h winds and 50 kg/m² snow.",
      transport: "The main unit packs to 1.4 × 1.2 × 1.0 m.",
      duration: "One or two people inflate it in 5 to 10 minutes, no tools; the beams are field-repairable.",
    },
  },
  {
    slug: "airbeam-hp",
    name: "Airmax HP",
    mission: { command: 2, medical: 2, living: 2, research: 1, response: 3 },
    climate: { polar: 1, cold: 3, temperate: 2, hot: 2, tropical: 2, mixed: 2 },
    people: { "1-8": 3, "9-25": 2, "26-100": 1 },
    transport: { air: 2, helo: 2, road: 3, sea: 1, remote: 1 },
    duration: { rapid: 3, months: 1 },
    facts: {
      climate: "High-pressure airbeams stand up better to wind and snow.",
      mission: "Widths from 3 to 6 m, lengths in 2 m increments.",
      duration: "A small team sets it up in minutes without tools, and strikes it by reverse pumping.",
    },
  },
  {
    slug: "polarhaven",
    name: "Polarhaven",
    mission: { command: 1, medical: 1, maintenance: 1, living: 3, research: 3 },
    climate: { polar: 3, cold: 3, temperate: 1, mixed: 1 },
    people: { "1-8": 2, "9-25": 3, "26-100": 2, "101-500": 1 },
    transport: { air: 2, helo: 2, road: 1, sea: 1, remote: 2 },
    duration: { rapid: 1, months: 3, years: 3 },
    facts: {
      "mission:research": "Housed the NASA-funded ENDURANCE under-ice robot on West Lake Bonney, Antarctica.",
      mission: "Long-term polar base camps, in widths from 8 to 20 ft at any length.",
      climate: "In Antarctica since Weatherhaven's first camp there in 1988.",
      transport: "Light: about 1.75 lb per ft² of floor.",
      "duration:rapid": "About 30 minutes to set up a 12 × 16 ft unit.",
      duration: "Built for long-term polar base camps.",
    },
  },
  {
    slug: "polar-chief",
    name: "Polar Chief",
    mission: { command: 1, living: 2, research: 3 },
    climate: { polar: 3, cold: 3 },
    people: { "1-8": 3, "9-25": 1 },
    transport: { air: 2, helo: 2, road: 1, remote: 3 },
    duration: { rapid: 2, months: 3, years: 1 },
    facts: {
      mission: "Used by Antarctic programs as a camp kitchen, lab or office.",
      climate: "Comfortable at −50°C ambient.",
      transport: "Packs into three bags, 220 lb in all.",
      duration: "Two people set it up in about 20 minutes.",
    },
  },
  {
    slug: "endurance",
    name: "Endurance",
    mission: { medical: 1, research: 3, response: 1 },
    climate: { polar: 3, cold: 3 },
    people: { "1-8": 3 },
    transport: { air: 1, helo: 3, remote: 3 },
    duration: { rapid: 3, months: 1 },
    facts: {
      mission: "A polar expedition tent whose clamshell ends open fully for medevac or equipment.",
      climate: "Built for polar expeditions, with a thermal liner and ballast skirt.",
      transport: "Travels by sled, snowmobile or helicopter; 77 lb for the 16-ft model.",
      duration: "One person erects it from inside in about five minutes.",
    },
  },
];

const WEIGHTS: Record<QuestionKey, number> = { mission: 3, climate: 2, people: 2, transport: 2, duration: 1.5 };

export type Recommendation = {
  slug: string;
  name: string;
  score: number;
  /** 0–100, relative to the best possible match. */
  fit: number;
  reasons: string[];
};

function factFor(p: Profile, key: QuestionKey, value: string): string | undefined {
  return p.facts[`${key}:${value}` as const] ?? p.facts[key];
}

/** The published fact that ties a system to one answer (the same text the results show), if any. */
export function publishedFact(slug: string, key: QuestionKey, value: string | undefined): string | undefined {
  const p = PROFILES.find((x) => x.slug === slug);
  return p && value ? factFor(p, key, value) : undefined;
}

export function isComplete(a: GuideAnswers): a is Required<GuideAnswers> {
  return QUESTIONS.every((q) => !!a[q.key]);
}

/** Systems ranked for the answers. A system that scores 0 on any answer is left out. */
export function recommend(a: Required<GuideAnswers>): Recommendation[] {
  const max = Object.values(WEIGHTS).reduce((s, w) => s + w * 3, 0);
  const ranked: Recommendation[] = [];
  for (const p of PROFILES) {
    const s = {
      mission: p.mission[a.mission] ?? 0,
      climate: p.climate[a.climate] ?? 0,
      people: p.people[a.people] ?? 0,
      transport: p.transport[a.transport] ?? 0,
      duration: p.duration[a.duration] ?? 0,
    };
    // A system that can't meet any one answer (can't be moved that way, isn't rated for the climate,
    // isn't meant to stand that long) is left out rather than ranked low.
    if (Object.values(s).some((v) => v === 0)) continue;
    const score = (Object.keys(s) as QuestionKey[]).reduce((sum, k) => sum + WEIGHTS[k] * s[k], 0);
    // Reasons: the mission fact first, then the strongest matches, without repeats.
    const order = (Object.keys(s) as QuestionKey[])
      .filter((k) => k !== "mission" && s[k] >= 2)
      .sort((x, y) => s[y] * WEIGHTS[y] - s[x] * WEIGHTS[x]);
    const reasons: string[] = [];
    for (const k of ["mission" as const, ...order]) {
      const f = factFor(p, k, a[k]);
      if (f && !reasons.includes(f)) reasons.push(f);
      if (reasons.length === 4) break;
    }
    ranked.push({ slug: p.slug, name: p.name, score, fit: Math.round((score / max) * 100), reasons });
  }
  return ranked.sort((x, y) => y.score - x.score || x.name.localeCompare(y.name));
}

/**
 * Ranking for a plan that is still being answered, used by the 3D camp to show the leading match
 * as each answer comes in. Answered questions score exactly as in recommend() (and rule a system
 * out at 0); each open question adds the system's average score across its options, so a system
 * that fits most answers ranks ahead of one that fits few. With every question answered the
 * open-question term is empty and the order matches recommend().
 */
export function rankPartial(a: GuideAnswers): { slug: string; name: string; score: number }[] {
  const ranked: { slug: string; name: string; score: number }[] = [];
  for (const p of PROFILES) {
    let score = 0;
    let out = false;
    for (const q of QUESTIONS) {
      const factor = p[q.key] as Partial<Record<string, Score>>;
      const v = a[q.key];
      if (v) {
        const s = factor[v] ?? 0;
        if (s === 0) {
          out = true;
          break;
        }
        score += WEIGHTS[q.key] * s;
      } else {
        const mean = q.options.reduce((sum, o) => sum + (factor[o.id] ?? 0), 0) / q.options.length;
        score += WEIGHTS[q.key] * mean;
      }
    }
    if (!out) ranked.push({ slug: p.slug, name: p.name, score });
  }
  return ranked.sort((x, y) => y.score - x.score || x.name.localeCompare(y.name));
}

export type Pairing = { slug: string; name: string; why: string };

/** Systems that usually sit alongside the top picks for this kind of camp (also called with a
 * plan that is still being answered; open answers add nothing). */
export function pairings(a: GuideAnswers, picked: string[]): Pairing[] {
  const big = a.people === "26-100" || a.people === "101-500" || a.people === "500+";
  const out: Pairing[] = [];
  // The TRECC sanitation unit is a different job from a TRECC command post, so it can be added
  // even when the TRECC is already one of the picks.
  const add = (p: Pairing) => {
    const taken = p.name !== "TRECC sanitation" && picked.includes(p.slug);
    if (!taken && !out.some((o) => o.name === p.name)) out.push(p);
  };
  if (big && a.mission !== "living") {
    if (a.climate === "polar") add({ slug: "polarhaven", name: "Polarhaven", why: "Accommodation and mess space for a polar camp." });
    else add({ slug: "series-4", name: "Series 4", why: "Accommodation, kitchens and workshops around the main facility." });
  }
  if (a.mission === "medical" && big) {
    add({ slug: "non-expandable-iso-containers", name: "ISO container modules", why: "Fitted life-support, medical and morgue modules in standard containers." });
  }
  if (big || a.mission === "living" || a.mission === "response") {
    add({ slug: "trecc", name: "TRECC sanitation", why: "Off-grid sanitation and kitchen units on trailers, powered by solar and 24VDC." });
  }
  return out.slice(0, 2);
}

export function labelFor(key: QuestionKey, id: string | undefined): string {
  return QUESTIONS.find((q) => q.key === key)?.options.find((o) => o.id === id)?.label ?? "";
}

/** Pre-fills the contact form with the answers and the recommendation. */
export function guideContactPrefill(a: Required<GuideAnswers>, recs: Recommendation[]): ContactPrefillPayload {
  const top = recs[0];
  const lines = [
    "From the mission builder on weatherhavenusa.com:",
    ...QUESTIONS.map((q) => `${q.label}: ${labelFor(q.key, a[q.key])}`),
    "",
    `Suggested systems: ${recs.slice(0, 3).map((r) => r.name).join(", ")}`,
  ];
  return {
    inquiry_type: "Program Requirement",
    program: `Mission builder: ${labelFor("mission", a.mission)}`,
    subject: `${labelFor("mission", a.mission)}, ${labelFor("people", a.people)} people, ${labelFor("climate", a.climate).toLowerCase()}`.slice(0, 160),
    message: lines.join("\n"),
    system: top?.slug,
  };
}

export const ANSWER_PARAMS: Record<QuestionKey, string> = {
  mission: "mission",
  climate: "climate",
  people: "people",
  transport: "transport",
  duration: "duration",
};

/** Reads valid answers from URL search params. */
export function answersFromParams(get: (name: string) => string | null): GuideAnswers {
  const a: GuideAnswers = {};
  for (const q of QUESTIONS) {
    const v = get(ANSWER_PARAMS[q.key]);
    if (v && q.options.some((o) => o.id === v)) (a as Record<string, string>)[q.key] = v;
  }
  return a;
}
