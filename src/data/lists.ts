// Diskette phase one data.
// Four lists of ten. Edited by hand. No runtime fetching.
//
// discSource is optional. Leave it out and scripts/fetch-assets.ts resolves it
// down the ladder in docs/02-asset-sources.md: retail, then generated, then
// burned. Set it explicitly only to force a result, which currently means the
// three entries that never had a physical release.
//
// note is written by Matti, one entry at a time. Films are done. Series,
// albums and games hold the placeholder "TODO: Her vil jeg skrive to
// setninger om hvorfor jeg liker dette." until he replaces each one by
// hand. scripts/check-notes.ts fails the build if any note still starts
// with TODO, so this cannot ship by accident.

export type Medium = "film" | "series" | "album" | "game";

/** Geometry only. Dimensions live in docs/03-object-spec.md. */
export type CaseFormat = "dvd" | "bluray" | "jewel" | "ps5" | "switch";

/** Colour and band treatment over a case geometry. Not a separate shape. */
export type Livery = "standard" | "ps2" | "ps3" | "ps4" | "ps5";

export type DiscSource = "retail" | "generated" | "burned";

export interface Entry {
  /** Slug. Also the asset directory name under public/assets/{medium}/. */
  id: string;
  title: string;
  /** Year of the work, not of the port or reissue. */
  year: number;
  /** End year for series that finished. Absent means running or unresolved. */
  yearEnd?: number;
  medium: Medium;
  /** Director, showrunner, artist or studio. */
  creator: string;
  rank: number;
  list: string;
  /** Platform for games. Absent for other media. */
  platform?: string;
  case: CaseFormat;
  livery: Livery;
  cover: string;
  spine?: string;
  back?: string;
  disc: string;
  /** Omit to let the fetch script resolve it. */
  discSource?: DiscSource;
  note: string;
}

/**
 * Case format follows release era rather than personal history, which is open
 * decision 1 in docs/01-project-brief.md. Rule applied: films from 2008 onward
 * get a Blu-ray case, earlier ones get a DVD keep case. Change any row where
 * the format you owned was different.
 */
export const films: Entry[] = [
  {
    id: "the-dark-knight",
    title: "The Dark Knight",
    year: 2008,
    medium: "film",
    creator: "Christopher Nolan",
    rank: 1,
    list: "all-time",
    case: "bluray",
    livery: "standard",
    cover: "/assets/film/the-dark-knight/cover.png",
    disc: "/assets/film/the-dark-knight/disc.png",
    note: "Mest ikoniske startscenen jeg har opplevd sammen med beste prestasjonen av en skuespiller gjennom tidene (Joker). Fantastisk plot, action og enestående skuespillere gjør dette til Nolan sit beste verk og dermed beste filmen gjennom tidene.",
  },
  {
    id: "interstellar",
    title: "Interstellar",
    year: 2014,
    medium: "film",
    creator: "Christopher Nolan",
    rank: 2,
    list: "all-time",
    case: "bluray",
    livery: "standard",
    cover: "/assets/film/interstellar/cover.png",
    disc: "/assets/film/interstellar/disc.png",
    note: "Beste scifi filmen laget, men en helt unik måte å fortelle den på. For en cast, musikk, skuespillere, og ikke minst visuals.",
  },
  {
    id: "fight-club",
    title: "Fight Club",
    year: 1999,
    medium: "film",
    creator: "David Fincher",
    rank: 3,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/film/fight-club/cover.png",
    disc: "/assets/film/fight-club/disc.png",
    note: "Må ha den beste plot-twisten gjennom tidene. Brad pitt på sitt beste med en av de kuleste historiene fortalt gjør denne filmen ikonisk.",
  },
  {
    id: "the-matrix",
    title: "The Matrix",
    year: 1999,
    medium: "film",
    creator: "Lana Wachowski and Lilly Wachowski",
    rank: 4,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/film/the-matrix/cover.png",
    disc: "/assets/film/the-matrix/disc.png",
    note: "Kuleste konsept på en film, sitter på kanten av setet gjennom hele filmen. Unik action og storytelling med faktastiske skuespillere gjør denne filmen ikonisk.",
  },
  {
    id: "spider-man-2",
    title: "Spider-Man 2",
    year: 2004,
    medium: "film",
    creator: "Sam Raimi",
    rank: 5,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/film/spider-man-2/cover.png",
    disc: "/assets/film/spider-man-2/disc.png",
    note: "Peter sliter med å balansere livet som helt, student, venn og kjæreste, noe som mange kan relatere til. Filmen har et godt budskap og er vel gjennomført med mange ikoniske scener og karakterer som sammen gjør dette til beste Spiderman filmen gjennom tidene",
  },
  {
    id: "spirited-away",
    title: "Spirited Away",
    year: 2001,
    medium: "film",
    creator: "Hayao Miyazaki",
    rank: 6,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/film/spirited-away/cover.png",
    disc: "/assets/film/spirited-away/disc.png",
    note: "Denne filmen er ren kunst, og åpnet øynene mine for anime som jeg er uendelig takknemlig for. Miyazaki og Studio Ghibili er på mange måter japan sin disney, bare MYE bedre",
  },
  {
    id: "blade-runner-2049",
    title: "Blade Runner 2049",
    year: 2017,
    medium: "film",
    creator: "Denis Villeneuve",
    rank: 7,
    list: "all-time",
    case: "bluray",
    livery: "standard",
    cover: "/assets/film/blade-runner-2049/cover.png",
    disc: "/assets/film/blade-runner-2049/disc.png",
    note: "For en visuell opplevelse. Dette er slik en scifi film skal lages, full av action, mysterie og en unik verdenbygging",
  },
  {
    id: "this-is-the-end",
    title: "This Is the End",
    year: 2013,
    medium: "film",
    creator: "Seth Rogen and Evan Goldberg",
    rank: 8,
    list: "all-time",
    case: "bluray",
    livery: "standard",
    cover: "/assets/film/this-is-the-end/cover.png",
    disc: "/assets/film/this-is-the-end/disc.png",
    note: "Virkelig min favoritt komedie, med alle mine favoritt skuespillere. Hver eneste scene i denne filmen er skammelig tidig, og det at de fleste scener er bare de som kødder rundt gjør det 100 ganger bedre.",
  },
  {
    id: "inception",
    title: "Inception",
    year: 2010,
    medium: "film",
    creator: "Christopher Nolan",
    rank: 9,
    list: "all-time",
    case: "bluray",
    livery: "standard",
    cover: "/assets/film/inception/cover.png",
    disc: "/assets/film/inception/disc.png",
    note: "For en mindfuck av en film, for en cast, for et album av Hans Zimmer. Denne filmen kan være litt forvirrende første gang man ser den, men når man først skjønner, så innser du hvor fantastisk storytelling kan være.",
  },
  {
    id: "superbad",
    title: "Superbad",
    year: 2007,
    medium: "film",
    creator: "Greg Mottola",
    rank: 10,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/film/superbad/cover.png",
    disc: "/assets/film/superbad/disc.png",
    note: "For en ikonisk komedie, dette var starten på en komedie sjanger som har ført til så mange andre gode komedier. Denne filmen kan sees uendelig ganger uten at man blir lei",
  },
];

/**
 * Every series is a DVD keep case, which is what a box set shipped in.
 * Open decision 2 is still open: one disc per season, or a stack.
 * fanart.tv moviedisc coverage for TV is thin, so most of these resolve to
 * generated.
 */
export const series: Entry[] = [
  {
    id: "one-piece",
    title: "One Piece",
    year: 1999,
    medium: "series",
    creator: "Eiichiro Oda",
    rank: 1,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/series/one-piece/cover.png",
    disc: "/assets/series/one-piece/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "breaking-bad",
    title: "Breaking Bad",
    year: 2008,
    yearEnd: 2013,
    medium: "series",
    creator: "Vince Gilligan",
    rank: 2,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/series/breaking-bad/cover.png",
    disc: "/assets/series/breaking-bad/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "avatar-the-last-airbender",
    title: "Avatar: The Last Airbender",
    year: 2005,
    yearEnd: 2008,
    medium: "series",
    creator: "Michael Dante DiMartino and Bryan Konietzko",
    rank: 3,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/series/avatar-the-last-airbender/cover.png",
    disc: "/assets/series/avatar-the-last-airbender/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "game-of-thrones",
    title: "Game of Thrones",
    year: 2011,
    yearEnd: 2019,
    medium: "series",
    creator: "David Benioff and D. B. Weiss",
    rank: 4,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/series/game-of-thrones/cover.png",
    disc: "/assets/series/game-of-thrones/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "invincible",
    title: "Invincible",
    year: 2021,
    medium: "series",
    creator: "Robert Kirkman",
    rank: 5,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/series/invincible/cover.png",
    disc: "/assets/series/invincible/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "vinland-saga",
    title: "Vinland Saga",
    year: 2019,
    medium: "series",
    creator: "Makoto Yukimura",
    rank: 6,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/series/vinland-saga/cover.png",
    disc: "/assets/series/vinland-saga/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    // 1997 Kentaro Miura adaptation, not the 2016 series. Confirm before fetch.
    id: "berserk",
    title: "Berserk",
    year: 1997,
    yearEnd: 1998,
    medium: "series",
    creator: "Kentaro Miura",
    rank: 7,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/series/berserk/cover.png",
    disc: "/assets/series/berserk/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "its-always-sunny-in-philadelphia",
    title: "It's Always Sunny in Philadelphia",
    year: 2005,
    medium: "series",
    creator: "Rob McElhenney",
    rank: 8,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/series/its-always-sunny-in-philadelphia/cover.png",
    disc: "/assets/series/its-always-sunny-in-philadelphia/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "eastbound-and-down",
    title: "Eastbound & Down",
    year: 2009,
    yearEnd: 2013,
    medium: "series",
    creator: "Danny McBride and Jody Hill",
    rank: 9,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/series/eastbound-and-down/cover.png",
    disc: "/assets/series/eastbound-and-down/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "south-park",
    title: "South Park",
    year: 1997,
    medium: "series",
    creator: "Trey Parker and Matt Stone",
    rank: 10,
    list: "all-time",
    case: "dvd",
    livery: "standard",
    cover: "/assets/series/south-park/cover.png",
    disc: "/assets/series/south-park/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
];

/**
 * Every album is a CD jewel case: 142 x 125 x 10mm, front face ratio 0.880.
 * The Life of Pablo never had a physical release, so it is burned by
 * definition rather than by fallback.
 */
export const albums: Entry[] = [
  {
    id: "currents",
    title: "Currents",
    year: 2015,
    medium: "album",
    creator: "Tame Impala",
    rank: 1,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/currents/cover.png",
    disc: "/assets/album/currents/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "man-on-the-moon-iii-the-chosen",
    title: "Man on the Moon III: The Chosen",
    year: 2020,
    medium: "album",
    creator: "Kid Cudi",
    rank: 2,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/man-on-the-moon-iii-the-chosen/cover.png",
    disc: "/assets/album/man-on-the-moon-iii-the-chosen/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "one-of-wun",
    title: "One of Wun",
    year: 2024,
    medium: "album",
    creator: "Gunna",
    rank: 3,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/one-of-wun/cover.png",
    disc: "/assets/album/one-of-wun/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "at-long-last-asap",
    title: "At.Long.Last.A$AP",
    year: 2015,
    medium: "album",
    creator: "A$AP Rocky",
    rank: 4,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/at-long-last-asap/cover.png",
    disc: "/assets/album/at-long-last-asap/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "2014-forest-hills-drive",
    title: "2014 Forest Hills Drive",
    year: 2014,
    medium: "album",
    creator: "J. Cole",
    rank: 5,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/2014-forest-hills-drive/cover.png",
    disc: "/assets/album/2014-forest-hills-drive/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    // No official CD pressing. Burned by definition, not by fallback.
    id: "the-life-of-pablo",
    title: "The Life of Pablo",
    year: 2016,
    medium: "album",
    creator: "Kanye West",
    rank: 6,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/the-life-of-pablo/cover.png",
    disc: "/assets/album/the-life-of-pablo/disc.png",
    discSource: "burned",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "damn",
    title: "DAMN.",
    year: 2017,
    medium: "album",
    creator: "Kendrick Lamar",
    rank: 7,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/damn/cover.png",
    disc: "/assets/album/damn/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "astroworld",
    title: "Astroworld",
    year: 2018,
    medium: "album",
    creator: "Travis Scott",
    rank: 8,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/astroworld/cover.png",
    disc: "/assets/album/astroworld/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    // Released 3 October 2017 on S2OP. Cover Art Archive coverage unverified.
    id: "rommet",
    title: "Rommet",
    year: 2017,
    medium: "album",
    creator: "Store P",
    rank: 9,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/rommet/cover.png",
    disc: "/assets/album/rommet/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "konnichiwa",
    title: "Konnichiwa",
    year: 2016,
    medium: "album",
    creator: "Skepta",
    rank: 10,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/konnichiwa/cover.png",
    disc: "/assets/album/konnichiwa/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
];

/**
 * PlayStation cases across four generations.
 * PS2 shipped in a black DVD keep case, so the geometry is dvd.
 * PS3 and PS4 shipped in Blu-ray case geometry with different livery.
 * PS5 is its own format: roughly 170 x 135 x 14mm, white body, blue band.
 *
 * GameTDB covers ps3 and earlier Nintendo systems. It has no ps4 or ps5 path,
 * so seven of these ten resolve to a generated disc and two are deliberately
 * burned. Rocket League and Cuphead were never in your hands as PS5 discs.
 */
export const games: Entry[] = [
  {
    id: "elden-ring",
    title: "Elden Ring",
    year: 2022,
    medium: "game",
    creator: "FromSoftware",
    rank: 1,
    list: "all-time",
    platform: "PS5",
    case: "ps5",
    livery: "ps5",
    cover: "/assets/game/elden-ring/cover.png",
    disc: "/assets/game/elden-ring/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "call-of-duty-black-ops-ii",
    title: "Call of Duty: Black Ops II",
    year: 2012,
    medium: "game",
    creator: "Treyarch",
    rank: 2,
    list: "all-time",
    platform: "PS3",
    case: "bluray",
    livery: "ps3",
    cover: "/assets/game/call-of-duty-black-ops-ii/cover.png",
    disc: "/assets/game/call-of-duty-black-ops-ii/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "sly-3-honor-among-thieves",
    title: "Sly 3: Honor Among Thieves",
    year: 2005,
    medium: "game",
    creator: "Sucker Punch Productions",
    rank: 3,
    list: "all-time",
    platform: "PS2",
    case: "dvd",
    livery: "ps2",
    cover: "/assets/game/sly-3-honor-among-thieves/cover.png",
    disc: "/assets/game/sly-3-honor-among-thieves/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "lego-star-wars-the-complete-saga",
    title: "Lego Star Wars: The Complete Saga",
    year: 2007,
    medium: "game",
    creator: "Traveller's Tales",
    rank: 4,
    list: "all-time",
    platform: "PS3",
    case: "bluray",
    livery: "ps3",
    cover: "/assets/game/lego-star-wars-the-complete-saga/cover.png",
    disc: "/assets/game/lego-star-wars-the-complete-saga/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "call-of-duty-black-ops-iii",
    title: "Call of Duty: Black Ops III",
    year: 2015,
    medium: "game",
    creator: "Treyarch",
    rank: 5,
    list: "all-time",
    platform: "PS4",
    case: "bluray",
    livery: "ps4",
    cover: "/assets/game/call-of-duty-black-ops-iii/cover.png",
    disc: "/assets/game/call-of-duty-black-ops-iii/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "elden-ring-nightreign",
    title: "Elden Ring Nightreign",
    year: 2025,
    medium: "game",
    creator: "FromSoftware",
    rank: 6,
    list: "all-time",
    platform: "PS5",
    case: "ps5",
    livery: "ps5",
    cover: "/assets/game/elden-ring-nightreign/cover.png",
    disc: "/assets/game/elden-ring-nightreign/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    id: "dark-souls-iii",
    title: "Dark Souls III",
    year: 2016,
    medium: "game",
    creator: "FromSoftware",
    rank: 7,
    list: "all-time",
    platform: "PS4",
    case: "bluray",
    livery: "ps4",
    cover: "/assets/game/dark-souls-iii/cover.png",
    disc: "/assets/game/dark-souls-iii/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    // Played from download. Burned rather than generated.
    id: "rocket-league",
    title: "Rocket League",
    year: 2015,
    medium: "game",
    creator: "Psyonix",
    rank: 8,
    list: "all-time",
    platform: "PS4",
    case: "bluray",
    livery: "ps4",
    cover: "/assets/game/rocket-league/cover.png",
    disc: "/assets/game/rocket-league/disc.png",
    discSource: "burned",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    // Work is 2013. The PS5 version arrived in 2022.
    id: "grand-theft-auto-v",
    title: "Grand Theft Auto V",
    year: 2013,
    medium: "game",
    creator: "Rockstar North",
    rank: 9,
    list: "all-time",
    platform: "PS5",
    case: "ps5",
    livery: "ps5",
    cover: "/assets/game/grand-theft-auto-v/cover.png",
    disc: "/assets/game/grand-theft-auto-v/disc.png",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
  {
    // No PS5 physical release. Burned rather than generated.
    id: "cuphead",
    title: "Cuphead",
    year: 2017,
    medium: "game",
    creator: "Studio MDHR",
    rank: 10,
    list: "all-time",
    platform: "PS5",
    case: "ps5",
    livery: "ps5",
    cover: "/assets/game/cuphead/cover.png",
    disc: "/assets/game/cuphead/disc.png",
    discSource: "burned",
    note: "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette.",
  },
];

export const allEntries: Entry[] = [...films, ...series, ...albums, ...games];

export const lists = { films, series, albums, games } as const;
