/**
 * Verified company facts and public URLs from https://www.weatherhaven.com/
 * (homepage, About Us, Company, Contact Us, Military, Medical, Commercial pages).
 *
 * This USA site uses Weatherhaven Resources Inc. (North Tonawanda, NY) as primary contact.
 */

export const COMPANY_STATS = [
  {
    value: "40+",
    label: "Years",
    detail: "Founded in 1981 in British Columbia, Canada.",
  },
  {
    value: "95+",
    label: "Countries",
    detail: "Products deployed to more than 95 countries worldwide.",
  },
  {
    value: "7",
    label: "Continents",
    detail: "Operational on all seven continents, including remote and ecologically sensitive sites.",
  },
  {
    value: "39",
    label: "Militaries served",
    detail: "Shelter systems fielded with military and allied programs worldwide.",
  },
] as const;

export const COMPANY_CREDIBILITY_LINE =
  "ISO 9001:2015 Certified · 95+ Countries Deployed · Founded 1981";

export const COMPANY_CONTACT = {
  legalName: "Weatherhaven Resources Inc.",
  headquarters: "North Tonawanda, New York",
  headquartersAddress: "889 Erie Avenue, North Tonawanda, New York 14120, United States",
  phone: "571-444-9964",
  globalLegalName: "Weatherhaven Global Resources Ltd.",
  globalHeadquarters: "Burnaby, BC, Canada",
  globalHeadquartersAddress: "#130-8610 Glenlyon Parkway, Burnaby, BC V5J 0B6, Canada",
  globalPhone: "604-451-8900",
  globalFax: "604-451-8999",
  contactPageUrl: "https://www.weatherhaven.com/ContactUs",
  secureContactUrl: "https://secure.weatherhaven.com/ContactUs",
  isoCertificateUrl:
    "https://secure.weatherhaven.com/Resources?id=vXi1D8ixYC&name=FM%20613435%20ISO9001-2015%20Certificate%20Burnaby%20and%20Brockville%202026.pdf",
  ethicsEmail: "ethicsandcompliance@weatherhaven.com",
} as const;

/** Short marketing stats row (homepage proof chapter, etc.) */
export const COMPANY_STAT_ROW = COMPANY_STATS.map((s) => ({
  value: s.value,
  label: s.label,
}));

export function companyPhoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
