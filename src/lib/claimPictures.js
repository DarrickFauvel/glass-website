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
  magicians: {
    src: '/images/claims/magicians.jpg',
    alt: 'Detail of an orange and blue poster for a Harry Houdini show exposing fake mediums: Houdini’s smiling face beside a small figure of him on stage among painted flames',
    position: '50% 50%',
  },
  prayer: {
    src: '/images/claims/prayer.jpg',
    alt: 'Detail of a painting from the 1840s: an elderly woman’s hands pressed together in prayer against a lace shawl, above a white bowl',
    position: '50% 50%',
  },
  psychics: {
    src: '/images/claims/psychics.jpg',
    alt: 'Detail of a red stage poster for the mentalist Alexander, “The Man Who Knows”: a staring face beneath a large jewelled turban',
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
    title: 'Alexander the man who knows',
    page: 'https://commons.wikimedia.org/wiki/File:Alexander_the_man_who_knows_LCCN2014636877.jpg',
    creator: 'an unknown artist, before 1923 (Library of Congress)',
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
  {
    title: 'Do spirits return? Houdini says no - and proves it',
    page: 'https://commons.wikimedia.org/wiki/File:Do_spirits_return%3F_Houdini_says_no_-_and_proves_it_3_shows_in_one_-_magic,_illusions,_escapes,_fraud_mediums_exposed._LCCN2014636902.tif',
    creator: 'an unknown artist, 1909 (Library of Congress)',
    license: 'public domain',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    via: 'Wikimedia Commons',
  },
  {
    title: 'Old woman is praying before her meal',
    page: 'https://commons.wikimedia.org/wiki/File:Katarina_Ivanovi%C4%87_-_Starica_se_moli_pred_obed_(1843-45).jpg',
    creator: 'Katarina Ivanović, 1843–45',
    license: 'public domain',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    via: 'Wikimedia Commons',
  },
  {
    title: 'Harry Houdini, half-length portrait, facing front',
    page: 'https://commons.wikimedia.org/wiki/File:Harry_Houdini,_half-length_portrait,_facing_front_LCCN96518797.jpg',
    creator: 'an unknown photographer, 1906 (Library of Congress)',
    license: 'public domain',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    via: 'Wikimedia Commons',
  },
  {
    title: 'James Randi at Conway Hall 2',
    page: 'https://commons.wikimedia.org/wiki/File:James_Randi_at_Conway_Hall_2.jpg',
    creator: 'John Turner',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    via: 'Wikimedia Commons',
  },
  {
    title: 'Astronomer Carl Sagan in 1987, crop',
    page: 'https://commons.wikimedia.org/wiki/File:Astronomer_Carl_Sagan_in_1987,_crop.jpg',
    creator: 'Kenneth C. Zirkel',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    via: 'Wikimedia Commons',
  },
  {
    title: '2022 Eugenie Scott',
    page: 'https://commons.wikimedia.org/wiki/File:2022_Eugenie_Scott.jpg',
    creator: 'Veryolduvai',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    via: 'Wikimedia Commons',
  },
];
