/**
 * Verify public resource links return HTTP 2xx.
 * Keep in sync with src/lib/resources.ts
 * Run: npm run audit:resources
 */

const RESOURCE_HREFS = [
  "https://secure.weatherhaven.com/Resources?id=vXi1D8ixYC&name=FM%20613435%20ISO9001-2015%20Certificate%20Burnaby%20and%20Brockville%202026.pdf",
  "https://www.weatherhaven.com/AboutUs",
  "https://www.weatherhaven.com/military",
  "https://www.weatherhaven.com/medical",
  "https://www.weatherhaven.com/commercial",
  "https://www.weatherhaven.com/company",
  "https://www.weatherhaven.com/ContactUs",
  "https://secure.weatherhaven.com/ContactUs",
];

let failed = 0;

for (const href of RESOURCE_HREFS) {
  try {
    const res = await fetch(href, { method: "GET", redirect: "follow" });
    const ok = res.status >= 200 && res.status < 400;
    console.log(`${ok ? "OK" : "FAIL"} ${res.status} ${href}`);
    if (!ok) failed++;
  } catch (err) {
    failed++;
    console.log(`FAIL ${href} (${err instanceof Error ? err.message : "error"})`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} resource link(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${RESOURCE_HREFS.length} resource links OK.`);
