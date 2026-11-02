// Archival pictures shown "under the glass" beside each claim on the homepage,
// keyed by post `topic`. A topic without an entry simply shows no picture.
// Every file here is openly licensed; provenance for each lives in
// public/images/claims/credits.json and the credit line renders in the footer.
//
// Picking a picture: show the real thing, never an illustration of the myth.
// A familiar cultural artefact of the claim is fine (a roadside Sasquatch
// figure); imagery that visually asserts the false claim is not (a syringe
// stuck in a tomato for GMOs). Prefer the actual subject of the evidence
// (Golden Rice beside white rice).
export const claimPictures = {
  bigfoot: {
    src: '/images/claims/bigfoot.jpg',
    alt: 'A dark Sasquatch figure striding up a rocky hillside among pine trees',
    position: '50% 45%',
  },
  chemtrails: {
    src: '/images/claims/chemtrails.jpg',
    alt: 'An airliner high in a blue sky trailing white contrails',
    position: '58% 38%',
  },
  gmos: {
    src: '/images/claims/gmos.jpg',
    alt: 'Hands pouring golden, genetically engineered rice beside a bowl of ordinary white rice',
    position: '50% 50%',
  },
  psychics: {
    src: '/images/claims/psychics.jpg',
    alt: 'Two men at a table in 1934 during an ESP card test: one turns over cards while the other writes down the results',
    position: '50% 50%',
  },
  ufos: {
    src: '/images/claims/ufos.jpg',
    alt: 'A meteorologist holds up a large white weather balloon against a blue sky, about to release it',
    position: '50% 50%',
  },
};

// Credit line for every archival picture on the site (claims above, plus the
// Greater Lowell map in the About section).
export const pictureCredits = [
  {
    title: 'Middlesex County, Massachusetts',
    page: 'https://commons.wikimedia.org/wiki/File:Middlesex_County,_Massachusetts_-_Henry_Francis_Walling,_1856_-_Library_of_Congress_master-gmd-gmd376-g3763-g3763m-la000316Z.jpg',
    creator: 'Henry Francis Walling, 1856 (Library of Congress)',
    license: 'public domain',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    via: 'Wikimedia Commons',
  },
  {
    title: 'Coulee Corridor Scenic Byway: Sasquatch Welcoming Visitors',
    page: 'https://commons.wikimedia.org/wiki/File:Coulee_Corridor_Scenic_Byway_-_Sasquatch_Welcoming_Visitors_-_NARA_-_7717829.jpg',
    creator: 'the U.S. National Archives',
    license: 'public domain',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    via: 'Wikimedia Commons',
  },
  {
    title: 'Aircraft Contrails Closeup',
    page: 'https://commons.wikimedia.org/wiki/File:Aircraft_Contrails_Closeup.jpg',
    creator: 'Nestek',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    via: 'Wikimedia Commons',
  },
  {
    title: 'Golden Rice',
    page: 'https://commons.wikimedia.org/wiki/File:Golden_Rice.jpg',
    creator: 'International Rice Research Institute (IRRI)',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    via: 'Wikimedia Commons',
  },
  {
    title: 'Hubert Pearce with J. B. Rhine',
    page: 'https://commons.wikimedia.org/wiki/File:Hubert_Pearce_with_J._B._Rhine.png',
    creator: 'J. B. Rhine, 1934',
    license: 'public domain',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    via: 'Wikimedia Commons',
  },  {
    title: 'Launching a weather balloon at Mammoth Hot Springs',
    page: 'https://commons.wikimedia.org/wiki/File:Launching_a_weather_balloon_at_Mammoth_Hot_Springs_(29433370445).jpg',
    creator: 'NPS / Neal Herbert (Yellowstone National Park)',
    license: 'public domain',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    via: 'Wikimedia Commons',
  },
];
