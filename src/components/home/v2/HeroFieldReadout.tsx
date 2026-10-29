import { signedDegrees, toFahrenheit, type FieldExtremes, type FieldReading } from "@/lib/field-readout";

/**
 * One line under the hero: the coldest and hottest places on the deployment map in MET Norway's
 * latest forecast (fetched on the server and cached for 30 minutes). No clock or coordinates; the
 * point is the spread of climates, not the instrument.
 */
function temp(r: FieldReading) {
  return `${signedDegrees(toFahrenheit(r.tempC))} °F`;
}

export function HeroFieldReadout({ field }: { field: FieldExtremes }) {
  return (
    <p className="max-w-[72ch]">
      <span className="text-snow">
        {temp(field.cold)} at {field.cold.name}; {temp(field.hot)} at {field.hot.name}.
      </span>{" "}
      Both are Weatherhaven deployment sites. Latest forecast from{" "}
      <a href="https://www.met.no/en" className="underline decoration-line-strong underline-offset-2 hover:text-snow">
        MET Norway
      </a>
      .
    </p>
  );
}
