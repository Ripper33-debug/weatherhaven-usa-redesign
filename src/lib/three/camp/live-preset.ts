/**
 * Turns a climate preset into "right now" at a real place: the weather that's actually falling
 * (or blowing), the sun where it actually is, and night, twilight or day to match. The camp's
 * presets are set at dusk; this keeps their look and moves it toward the real light.
 */
import * as THREE from "three";
import type { ClimatePreset, WeatherKind } from "@/lib/three/camp/environment";
import type { LiveConditions } from "@/lib/live-site";
import { sunPosition } from "@/lib/solar";

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mixHex = (a: number, b: number, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t).getHex();
const scaleHex = (a: number, k: number) => new THREE.Color(a).multiplyScalar(k).getHex();

/** What the sky is doing at the place, as one of the camp's weather effects. */
export function liveWeather(base: ClimatePreset, live: LiveConditions): WeatherKind {
  const code = (live.symbol ?? "").replace(/_(day|night|polartwilight)$/, "");
  const wind = live.windMs ?? 0;
  if (/snow/.test(code)) return /heavy/.test(code) || wind >= 10 ? "blizzard" : "snow";
  if (/thunder|heavyrain/.test(code)) return "storm";
  if (/rain|sleet/.test(code)) return "rain";
  // Dry but windy: snow lifts off polar ground, sand off the desert.
  if (base.weather === "blizzard" && wind >= 8) return "blizzard";
  if (base.weather === "dust" && wind >= 7) return "dust";
  return "none";
}

/** The preset as it looks at the place right now. */
export function livePreset(base: ClimatePreset, live: LiveConditions, now: Date): ClimatePreset {
  const sun = sunPosition(now, live.lat, live.lng);
  const el = sun.elevation;
  // 0 in daylight, 1 once the sun is 10° below the horizon.
  const night = smooth(4, -10, el);
  // Twilight glow peaks with the sun at the horizon.
  const glow = Math.max(0, 1 - Math.abs(el + 1) / 8);
  // High sun lifts the dusk look toward day.
  const day = smooth(10, 40, el) * 0.6;
  const code = live.symbol ?? "";
  const overcast = /cloudy|fog|rain|snow|sleet|thunder/.test(code) && !/partlycloudy/.test(code) ? 1 : 0;
  const foggy = /fog/.test(code);

  // The scene looks north (camera at +z): compass east is +x, so camp azimuth = 180 − compass.
  // At night the key light becomes the moon, roughly opposite the sun and high.
  const compass = night > 0.5 ? (sun.azimuth + 180) % 360 : sun.azimuth;
  const sunAz = (540 - compass) % 360;
  const sunEl = night > 0.5 ? 35 : Math.min(55, Math.max(4, el));

  const out: ClimatePreset = { ...base };
  out.weather = liveWeather(base, live);
  out.sunAz = sunAz;
  out.sunEl = sunEl;
  out.zenith = mixHex(mixHex(base.zenith, 0x1d3550, day), 0x03060c, night);
  out.horizon = mixHex(mixHex(mixHex(base.horizon, 0x6f8399, day), 0x4a525c, overcast * 0.4), 0x0b1320, night);
  out.glow = mixHex(base.glow, 0xff8a4c, glow);
  out.glowStrength = base.glowStrength * (1 - night) * (1 - overcast * 0.6) + glow * 0.9 * (1 - overcast * 0.5);
  out.key = mixHex(base.key, 0x9fb5d9, night);
  out.keyIntensity = base.keyIntensity * (1 + day * 0.4) * (1 - overcast * 0.4) * (1 - night * 0.78);
  out.hemiSky = mixHex(base.hemiSky, 0x2a3a55, night);
  out.hemiIntensity = base.hemiIntensity * (1 - night * 0.65);
  out.rimIntensity = base.rimIntensity * (1 - night * 0.5);
  out.groundA = scaleHex(base.groundA, 1 - night * 0.6);
  out.groundB = scaleHex(base.groundB, 1 - night * 0.6);
  out.envIntensity = base.envIntensity * (1 - night * 0.6);
  out.exposure = base.exposure * (1 + day * 0.15) * (1 - night * 0.1);
  if (foggy) {
    out.fogNear = base.fogNear * 0.5;
    out.fogFar = base.fogFar * 0.55;
  } else if (out.weather === "storm" || out.weather === "blizzard") {
    out.fogNear = base.fogNear * 0.75;
    out.fogFar = base.fogFar * 0.8;
  }
  out.label = `Right now at ${live.name}`;
  return out;
}
