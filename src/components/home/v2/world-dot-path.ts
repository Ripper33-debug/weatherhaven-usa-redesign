import worldDots from "@/data/world-dots.json";
import { lightAt, subsolarPoint } from "@/lib/solar";

/**
 * The land as SVG paths of zero-length segments; round line caps draw each one as a dot.
 * Loaded on demand by the deployment map, so the ~100 KB of dots isn't part of the page HTML.
 */
export function worldDotPath(): string {
  const dots = worldDots.dots as number[];
  let d = "";
  for (let i = 0; i < dots.length; i += 2) d += `M${dots[i]} ${dots[i + 1]}h0`;
  return d;
}

// ---- Natural Earth projection (d3-geo's naturalEarth1Raw, scaled as in world-dots.json) ---------

const { k, tx, ty } = worldDots.projection;
const RAD = Math.PI / 180;

function rawY(phi: number) {
  const p2 = phi * phi;
  const p4 = p2 * p2;
  return phi * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
}
function xFactor(phi: number) {
  const p2 = phi * phi;
  const p4 = p2 * p2;
  return 0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4));
}

/** Longitude/latitude (degrees) to map x/y. */
export function project(lng: number, lat: number): [number, number] {
  const phi = lat * RAD;
  return [tx + k * lng * RAD * xFactor(phi), ty - k * rawY(phi)];
}

/** Map x/y back to longitude/latitude (Newton's method, as d3 does). */
export function invert(x: number, y: number): [number, number] {
  const X = (x - tx) / k;
  const Y = (ty - y) / k;
  let phi = Y;
  for (let i = 0; i < 25; i++) {
    const p2 = phi * phi;
    const p4 = p2 * p2;
    const delta =
      (rawY(phi) - Y) /
      (1.007226 + p2 * (0.015085 * 3 + p4 * (-0.044475 * 7 + 0.028874 * 9 * p2 - 0.005916 * 11 * p4)));
    phi -= delta;
    if (Math.abs(delta) < 1e-9) break;
  }
  return [X / xFactor(phi) / RAD, phi / RAD];
}

// ---- Day and night ---------------------------------------------------------------------------

let lngLat: Float32Array | null = null;
function dotLngLat(): Float32Array {
  if (lngLat) return lngLat;
  const dots = worldDots.dots as number[];
  lngLat = new Float32Array(dots.length);
  for (let i = 0; i < dots.length; i += 2) {
    const [lng, lat] = invert(dots[i], dots[i + 1]);
    lngLat[i] = lng;
    lngLat[i + 1] = lat;
  }
  return lngLat;
}

/**
 * The land dots split by light at `date`: [daylight, twilight (sun up to 12° below the
 * horizon), night].
 */
export function dotPathsByLight(date: Date): [string, string, string] {
  const dots = worldDots.dots as number[];
  const ll = dotLngLat();
  const out: [string, string, string] = ["", "", ""];
  for (let i = 0; i < dots.length; i += 2) {
    const light = lightAt(date, ll[i + 1], ll[i]);
    const bucket = light === "daylight" ? 0 : light === "twilight" ? 1 : 2;
    out[bucket] += `M${dots[i]} ${dots[i + 1]}h0`;
  }
  return out;
}

/** Where the sun is overhead, on the map. */
export function sunOnMap(date: Date): [number, number] {
  const s = subsolarPoint(date);
  return project(s.lng, s.lat);
}
