/**
 * Reading the pins imported from Weatherhaven's deployment map (Google My Maps): labels, the
 * country and program in each title, and whether a pin marks a place or a whole country.
 * Shared by the homepage map and the hero's live readout.
 */
/** Coordinates-only labels from My Maps ("-84.41, -24.04") read better as a region. */
export function cleanLabel(label: string, lat: number): string {
  if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(label.trim())) {
    return lat < -60 ? "Antarctic interior" : "Remote site";
  }
  return label;
}

const COUNTRY_FIXES: Record<string, string> = { Gemany: "Germany" };
const PROGRAM_NAMES: Record<string, string> = {
  UN: "United Nations",
  NATO: "NATO",
  Coalition: "Coalition forces",
  "UN and Coalition": "United Nations and coalition forces",
};

/** My Maps titles read "Somalia (UN)": split into the country and the program it served. */
export function splitTitle(title: string, label: string): { country: string; program?: string } {
  let country = title;
  if (/^(commercial|defence|medical)/i.test(title)) {
    const parts = label.split(",");
    country = parts[parts.length - 1].trim();
  }
  const m = country.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (m && !/\b(UN|NATO|Coalition)\b/.test(m[2])) {
    // "Sudan (South)" is a place, not a program.
    const place = `${m[2]} ${m[1]}`.trim();
    return { country: place };
  }
  const base = (m ? m[1] : country).trim();
  const program = m?.[2]?.replace(/^including\s+/i, "").replace("&", "and").trim();
  return { country: COUNTRY_FIXES[base] ?? base, program: program ? (PROGRAM_NAMES[program] ?? program) : undefined };
}

/**
 * True when the pin marks a place (a town, a station, coordinates). Pins labelled with just their
 * country sit at the country's centre point, where local weather or time would mean little.
 */
export function isPrecisePin(d: { id: string; label: string; title: string }): boolean {
  if (MISPLACED.has(d.id)) return false;
  const label = d.label.trim();
  return label !== splitTitle(d.title, d.label).country && label !== d.title.trim();
}

/**
 * Pins whose coordinates don't match their label in the source map: "Bogota" sits about 600 km
 * from Bogotá, and "Loro" sits on Bogotá. They stay on the map but get no local weather or time
 * until the source is fixed.
 */
const MISPLACED = new Set(["colombia-bogota-colombia", "colombia-loro-colombia"]);
