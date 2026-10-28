import worldDots from "@/data/world-dots.json";

/**
 * The land as one SVG path of zero-length segments; round line caps draw each one as a dot.
 * Loaded on demand by the deployment map, so the ~100 KB path isn't part of the page HTML.
 */
export function worldDotPath(): string {
  const dots = worldDots.dots as number[];
  let d = "";
  for (let i = 0; i < dots.length; i += 2) d += `M${dots[i]} ${dots[i + 1]}h0`;
  return d;
}
