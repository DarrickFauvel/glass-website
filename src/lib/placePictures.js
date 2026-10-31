// Pictures of the Greater Lowell area for the About section, in two sets the
// visitor switches between: everyday places around the region, and local
// landmarks of skeptical interest. The homepage cross-fades through the chosen
// set; the region set's starting picture is chosen at random on each load.
//
// Every file is openly licensed and cropped to 1180×600 in
// public/images/places/. Each entry's `credit` feeds the footer credit line.
// Captions make factual claims, so keep them sourced (see `source`).

const BY_SA_4 = { license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0' };
const PD = { license: 'public domain', licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/' };
const CC0 = { license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' };

/** @typedef {{ src: string, alt: string, caption: string, credit: { title: string, page: string, creator: string, license: string, licenseUrl: string, via: string }, source?: string }} PlacePicture */

/** @type {PlacePicture[]} */
export const everydayPlaces = [
  {
    src: '/images/places/lowell-merrimack-canal.jpg',
    alt: 'The Merrimack Canal running between green lawns and tall leafy trees, a brick building on the left',
    caption: 'Lowell: the Merrimack Canal downtown.',
    credit: { title: 'Merrimack Canal from Merrimack St Bridge', page: 'https://commons.wikimedia.org/wiki/File:Merrimack_Canal_from_Merrimack_St_Bridge.jpg', creator: 'Bernie Ongewe', ...BY_SA_4, via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/billerica-winning-pond.jpg',
    alt: 'Still water of Winning Pond reflecting white clouds and a blue sky, with a wooded far shore',
    caption: 'Billerica: Winning Pond.',
    credit: { title: 'Winning Pond, Billerica MA', page: 'https://commons.wikimedia.org/wiki/File:Winning_Pond,_Billerica_MA.jpg', creator: 'John Phelan', ...BY_SA_4, via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/chelmsford-rail-trail.jpg',
    alt: 'A paved trail running through woods with leaves starting to turn, two walkers in the distance',
    caption: 'Chelmsford: the Bruce Freeman Rail Trail in October.',
    credit: { title: '22, Bruce Freeman Rail Trail, Chelmsford MA', page: 'https://commons.wikimedia.org/wiki/File:22,_Bruce_Freeman_Rail_Trail,_Chelmsford_MA.jpg', creator: 'John Phelan', ...BY_SA_4, via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/dracut-farm.jpg',
    alt: 'An open hayfield under a cloudy sky, with a hay wagon at the edge and a tree line beyond',
    caption: 'Dracut: one of the town’s working farms.',
    credit: { title: 'Yes there are still farms in Dracut', page: 'https://commons.wikimedia.org/wiki/File:Yes_there_are_still_farms_in_Dracut_-_panoramio.jpg', creator: 'Bernie Ongewe', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0', via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/tewksbury-bandstand.jpg',
    alt: 'A green and yellow Victorian bandstand on a town common, ringed by flowers under shade trees',
    caption: 'Tewksbury: the bandstand on the town common.',
    credit: { title: 'Bandstand on Town Common – Tewksbury, Massachusetts', page: 'https://commons.wikimedia.org/wiki/File:Bandstand_on_Town_Common_-_Tewksbury,_Massachusetts_-_DSC00069.JPG', creator: 'Daderot', ...PD, via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/tyngsborough-bridge.jpg',
    alt: 'The green arched Tyngsborough Bridge reflected in the calm Merrimack River in low evening light',
    caption: 'Tyngsborough: the bridge over the Merrimack.',
    credit: { title: 'Tyngsborough Bridge', page: 'https://commons.wikimedia.org/wiki/File:Tyngsborough_Bridge.jpg', creator: 'GraniteStateBirds', ...CC0, via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/westford-pond.jpg',
    alt: 'A small pond reflecting evergreens and a red-leaved tree',
    caption: 'Westford: a pond in spring.',
    credit: { title: 'Westford pond', page: 'https://commons.wikimedia.org/wiki/File:Westford_pond.jpg', creator: 'liz west', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0', via: 'Wikimedia Commons' },
  },
];

/** @type {PlacePicture[]} */
export const skepticalLandmarks = [
  {
    src: '/images/places/westford-knight.jpg',
    alt: 'The Westford Knight site: a glass cover over a marked ledge, a bronze knight effigy, and a granite marker among stone posts',
    caption: 'Westford: the “Westford Knight,” said to be a 14th-century Scottish knight carved in the ledge. A Harvard Peabody Museum review found mostly glacial scratches, with a sword hilt punched in perhaps as late as the 1800s.',
    source: 'https://en.wikipedia.org/wiki/Westford_Knight',
    credit: { title: 'Westford Knight Site – Westford, Massachusetts', page: 'https://commons.wikimedia.org/wiki/File:Westford_Knight_Site_-_Westford,_Massachusetts_-_DSC09073.jpg', creator: 'Daderot', ...CC0, via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/lowell-ayers-sarsaparilla.jpg',
    alt: 'A Victorian trade card for Ayer’s Sarsaparilla: a convalescent woman in a chair with her family, text promising it purifies the blood',
    caption: 'Lowell: Ayer’s Sarsaparilla promised to purify the blood and restore health. J.C. Ayer & Co. made it in Lowell and sold it worldwide.',
    source: 'https://en.wikipedia.org/wiki/James_Cook_Ayer',
    credit: { title: 'Ayer’s Sarsaparilla', page: 'https://commons.wikimedia.org/wiki/File:Ayer%27s_Sarsaparilla_(6875537025).jpg', creator: 'National Library of Medicine', license: 'no known copyright restrictions', licenseUrl: 'https://www.flickr.com/commons/usage/', via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/lowell-ayer-lion.jpg',
    alt: 'A life-size marble lion resting on a stone base in a leafy cemetery',
    caption: 'Lowell Cemetery: the marble lion over J.C. Ayer’s grave, the most successful patent-medicine maker of his age.',
    source: 'https://en.wikipedia.org/wiki/James_Cook_Ayer',
    credit: { title: 'The Ayer Lion Monument, Lowell Cemetery', page: 'https://commons.wikimedia.org/wiki/File:The_Ayer_Lion_Monument,_Lowell_Cemetery,_Lowell,_MA_(August_2019).jpg', creator: 'Martin Aligata', ...PD, via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/lowell-hoods-sarsaparilla.jpg',
    alt: 'A Victorian trade card for Hood’s Sarsaparilla showing a lion family, with the slogan “makes the weak strong”',
    caption: 'Lowell: “Hood’s Sarsaparilla makes the weak strong.” C.I. Hood brewed it in Lowell from the 1870s.',
    source: 'https://hatch.kookscience.com/wiki/C._I._Hood',
    credit: { title: 'Hood’s Sarsaparilla, 100 doses, one dollar', page: 'https://commons.wikimedia.org/wiki/File:Hood%27s_Sarsaparilla,_100_doses,_one_dollar._Hood%27s_Sarsaparilla_makes_the_weak_strong._The_lion_at_home._-_DPLA_-_5fe462519b062cf780be99ee84f1a147_(page_1).jpg', creator: 'Boston Public Library', ...PD, via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/lowell-witch-bonney.jpg',
    alt: 'A green bronze statue of a woman holding a cloak spread wide above her, set against a granite monument',
    caption: 'Lowell Cemetery: the “Witch Bonney.” Legend says she changes through October. She’s an 1898 bronze by F. Edwin Elwell.',
    source: 'https://commons.wikimedia.org/wiki/File:Bonney_Monument,_Lowell_Cemetery,_Lowell,_MA_-_March_2016.JPG',
    credit: { title: 'Bonney Monument, Lowell Cemetery', page: 'https://commons.wikimedia.org/wiki/File:Bonney_Monument,_Lowell_Cemetery,_Lowell,_MA_-_March_2016.JPG', creator: 'Marty Aligata', ...PD, via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/lowell-worthen-house.jpg',
    alt: 'The Worthen House, a yellow clapboard tavern with dormer windows above a brick ground floor and green awnings',
    caption: 'Lowell: the Worthen House, one of the city’s oldest taverns. Staff tell of a ghost they call “Matthew” on the upper floors.',
    source: 'https://en.wikipedia.org/wiki/Worthen_House_(Lowell,_Massachusetts)',
    credit: { title: 'Lowell, MA 18', page: 'https://commons.wikimedia.org/wiki/File:Lowell,_MA_18.jpg', creator: 'Bernie Ongewe', ...BY_SA_4, via: 'Wikimedia Commons' },
  },
  {
    src: '/images/places/salem-nh-sacrificial-table.jpg',
    alt: 'A large flat grooved stone slab on stone supports among dry-stone walls and autumn leaves',
    caption: 'Salem, N.H.: the “sacrificial table” at America’s Stonehenge, most likely a farm stone for leaching lye or pressing cider.',
    source: 'https://en.wikipedia.org/wiki/America%27s_Stonehenge',
    credit: { title: 'Lye-leaching Stone at America’s Stonehenge', page: 'https://commons.wikimedia.org/wiki/File:Lye-leaching_Stone_at_America%27s_Stonehenge.jpg', creator: 'Richard Haddad', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0', via: 'Wikimedia Commons' },
  },
];

export const placeCredits = [...everydayPlaces, ...skepticalLandmarks].map((p) => p.credit);
