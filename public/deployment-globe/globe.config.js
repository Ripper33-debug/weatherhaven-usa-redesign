// Weatherhaven deployment globe: settings you can change without touching index.html.
window.GLOBE_CONFIG = {
  // White Weatherhaven logo (from weatherhaven.com). If the file is missing, the name shows in text instead.
  logo: 'brand/logo.png',
  // The button at the bottom of every deployment card. target '_top' opens it in the same tab when the globe is embedded on the site.
  // On the site, the contact page of whichever address the globe is served from (so a preview copy
  // sends people to its own contact page, and the live site to weatherhavenusa.com/contact).
  contact: { label: 'Talk to a Weatherhaven expert', url: location.origin + '/contact?utm_source=globe', target: '_top' },
  // As a section of another page (?embed), the globe plays its highlights loop until someone uses it,
  // then picks the loop back up after this many seconds without a click or tap. ambient: false turns the loop off.
  ambient: true, ambientIdleSeconds: 60,
  // 'map' opens on the flat map instead of the 3D globe (same as adding ?view=map to the address).
  view: 'globe',
  // Where "Open full map" goes when the globe is embedded on another page with ?embed
  fullPageUrl: '/deployments/map',
  // Brand orange (from the Weatherhaven logo) for the tour and contact buttons, and the text colour on top of it.
  accent: '#F18522', accentText: '#0A1620',
  // 'auto' steps the effects down if this computer can't keep the globe smooth. 'high' always keeps full effects; 'low' always uses the light version.
  quality: 'auto',
  // Extra or replacement photos for deployment cards, by pin ID. Images go in the photos/ folder.
  // photos: {
  //   'antarctica-base-concordia-antarctica': { src: 'photos/concordia.jpg', caption: 'Concordia Station' },
  // },
};
