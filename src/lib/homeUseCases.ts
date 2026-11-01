export type UseCaseSpec = {
  label: string;
  value: string;
};

export type UseCaseCard = {
  tag: string;
  title: string;
  desc: string;
  paragraphs: string[];
  specs: UseCaseSpec[];
  learnMoreHref: string;
  specSheetHref: string;
};

export const HOME_USE_CASES: UseCaseCard[] = [
  {
    tag: "MILITARY",
    title: "Military Camps & C2",
    desc: "Sheltering troops and command elements wherever they are deployed — on all seven continents.",
    paragraphs: [
      "Weatherhaven portable shelters are built for exceptional performance in remote locations and harsh climates.",
      "From accommodation and maintenance shops to tactical camps and operations centers, systems are engineered to be repeatedly deployed anywhere in the world.",
      "Shelters can be rapidly deployed — from setup to fully operational in as little as 20 minutes for selected configurations.",
    ],
    specs: [
      { label: "Theater reach", value: "All seven continents" },
      { label: "Deployment", value: "Rapid setup and takedown" },
      { label: "Configurations", value: "C2, workshops, camps, UAV/satellite" },
      { label: "Climate", value: "-50°C to +50°C (system-dependent)" },
      { label: "Support", value: "Design through in-service support" },
      { label: "Heritage", value: "Canadian military programs since 1984" },
    ],
    learnMoreHref: "/configurable-solutions/ehmecc",
    specSheetHref: "https://www.weatherhaven.com/military",
  },
  {
    tag: "BASE INFRASTRUCTURE",
    title: "Turnkey Camp Systems",
    desc: "Full camp infrastructure — shelter, utilities, logistics, installation, and demobilization.",
    paragraphs: [
      "Turnkey shelter systems include need assessment, design, installation, and equipment for workforce, military, and exploration camps.",
      "Weatherhaven demobilizes, refurbishes, and stores systems at mission end — ready for the next deployment.",
      "Notable deployments include large-scale camps for Kosovo, Afghanistan, Peru Navy emergency camps, and UN humanitarian missions.",
    ],
    specs: [
      { label: "Scope", value: "Shelter, utilities, logistics" },
      { label: "Lifecycle", value: "Install · demobilize · refurbish · store" },
      { label: "Markets", value: "Military, commercial, humanitarian" },
      { label: "Transport", value: "Air, ground, and sea" },
      { label: "Regions", value: "Global regional offices" },
      { label: "Experience", value: "Since 1981" },
    ],
    learnMoreHref: "/configurable-solutions/ateps",
    specSheetHref: "https://www.weatherhaven.com/commercial",
  },
  {
    tag: "MEDICAL",
    title: "Medical & Field Hospitals",
    desc: "Mobile clinics and field hospitals meeting WHO and UN foreign field hospital guidelines.",
    paragraphs: [
      "Medical shelter solutions support field hospitals, clinics, emergency response, and CBRN configurations.",
      "Systems are easy to transport, quick to install, and flexible in design for rapid response to almost any medical need.",
      "Expandable containers can be fully deployed on trucks and trailers to deliver medical services as quickly as possible.",
    ],
    specs: [
      { label: "Applications", value: "Hospitals, clinics, emergency response" },
      { label: "Standards", value: "WHO / UN field hospital alignment" },
      { label: "Deployment", value: "Truck, trailer, and ground options" },
      { label: "Climate", value: "Integrated environmental control" },
      { label: "Users", value: "Military, humanitarian, commercial" },
      { label: "Redeployable", value: "Yes — worldwide" },
    ],
    learnMoreHref: "/configurable-solutions/bmecc",
    specSheetHref: "https://www.weatherhaven.com/medical",
  },
  {
    tag: "AVIATION MX",
    title: "Maintenance & Workshops",
    desc: "Maintenance shelters for aviation, vehicles, and simulation training in forward environments.",
    paragraphs: [
      "Weatherhaven's first helicopter maintenance shelter (MEX-26) launched military work in 1984.",
      "Maintenance shops and workshop configurations support aviation and vehicle programs in expeditionary settings.",
      "Large-span softwall shelters provide high-bay clearance for forward operating maintenance.",
    ],
    specs: [
      { label: "Applications", value: "Aviation, vehicle, simulation" },
      { label: "Span", value: "Large-span softwall options" },
      { label: "Climate", value: "-50°C to +50°C bands" },
      { label: "Mobility", value: "Air and ground transport" },
      { label: "Setup", value: "Rapid field emplacement" },
      { label: "Integration", value: "Camp and utility spines" },
    ],
    learnMoreHref: "/configurable-solutions/mts",
    specSheetHref: "https://www.weatherhaven.com/military",
  },
  {
    tag: "COLD WEATHER",
    title: "Arctic & Extreme Cold",
    desc: "Shelter systems from -50°C to +50°C — proven in polar research, mining, and military theaters.",
    paragraphs: [
      "No climate is too harsh and no location too remote — Weatherhaven shelters protect personnel and equipment across extreme temperature bands.",
      "Polarhaven and arctic packages support Antarctic research, northern mining, and cold-weather military operations.",
      "Products provide shelter for a significant share of base camps in Antarctica and northern exploration programs.",
    ],
    specs: [
      { label: "Temperature", value: "-50°C to +50°C" },
      { label: "Polar", value: "Antarctic and Arctic programs" },
      { label: "Heritage", value: "Polarhaven since 1988" },
      { label: "Transport", value: "Compact, lightweight logistics" },
      { label: "Sites", value: "Remote and ecologically sensitive" },
      { label: "Redeployable", value: "Yes" },
    ],
    learnMoreHref: "/configurable-solutions/endurance",
    specSheetHref: "https://www.weatherhaven.com/commercial",
  },
  {
    tag: "HUMANITARIAN",
    title: "Humanitarian & Disaster Relief",
    desc: "Rapid-deploy camps for UN, NGO, and government disaster response worldwide.",
    paragraphs: [
      "Weatherhaven supports government and non-government agencies with peacekeeping and humanitarian camp capabilities.",
      "UN partnerships include redeploying arctic camps to the Kuwait–Iraq demilitarized zone (1990) and Haiti relief with UN and Brazil (2010).",
      "Turnkey camps field medical, berthing, and logistics cells when infrastructure is destroyed or absent.",
    ],
    specs: [
      { label: "Customers", value: "UN, NGOs, government agencies" },
      { label: "Response", value: "Rapid-deploy turnkey camps" },
      { label: "Medical", value: "Clinics and field hospitals" },
      { label: "Scale", value: "Mission-dependent" },
      { label: "Lifecycle", value: "Install · demobilize · refurbish" },
      { label: "Reach", value: "95+ countries" },
    ],
    learnMoreHref: "/configurable-solutions/hercon",
    specSheetHref: "https://www.weatherhaven.com/medical",
  },
];
