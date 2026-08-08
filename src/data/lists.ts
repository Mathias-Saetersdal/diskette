// Diskette phase one data.
// Four lists of ten. Edited by hand. No runtime fetching.
//
// discSource is optional. Leave it out and scripts/fetch-assets.ts resolves it
// down the ladder in docs/02-asset-sources.md: retail, then generated, then
// burned. The script only prints the tier it landed on, it never writes back
// here, so a resolved-but-unforced result (retail) can still read as absent —
// harmless, since nothing downstream needs to distinguish "unresolved" from
// "resolved to the ladder's default." Set it explicitly to force a result
// (burned, for the three entries with no physical release), or to record one
// the render layer needs and the ladder's own default doesn't supply (generated,
// for entries whose disc is a cropped cover rather than a scan — see
// credits.json for provenance per entry).
//
// note is written by Matti, one entry at a time. Films are done. Series,
// albums and games hold the placeholder "TODO: Her vil jeg skrive to
// setninger om hvorfor jeg liker dette." until he replaces each one by
// hand. scripts/check-notes.ts fails the build if any note still starts
// with TODO, so this cannot ship by accident.

export type Medium = "film" | "series" | "album" | "game";

/** Geometry only. Dimensions live in docs/03-object-spec.md. */
export type CaseFormat = "dvd" | "bluray" | "jewel" | "ps5" | "switch";

/**
 * Colour, banner and spine treatment over a case geometry. Not a separate
 * shape. PS3 split into ps3-early and ps3-late: Sony changed the case
 * design mid-generation (early: translucent shell, black spine with the
 * platform wordmark; late: opaque shell, a grey header bar on the front
 * face), so it isn't one livery the way ps2/ps4/ps5 are.
 */
export type Livery = "standard" | "ps2" | "ps3-early" | "ps3-late" | "ps4" | "ps5";

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
  /**
   * The printed insert's dominant tone as a plain CSS colour, hand-picked
   * against each cover rather than sampled — no canvas per instance
   * (FlatCase.tsx, FlatJewelCase.tsx). Absent falls back to whichever
   * neutral default that spine's own livery uses (FlatCase.css,
   * FlatJewelCase.css) — a fixed grey for dvd and jewel, the platform's
   * own base colour for a console livery. Set for every game entry;
   * DVD-format films, series and albums don't have one yet (build plan
   * stages 2-4) and render their own fallback until picked by eye
   * against each cover.
   */
  spineTone?: string;
  back?: string;
  /** Absent for a burned entry: there is no disc PNG, ever, for those. */
  disc?: string;
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
    discSource: "generated",
    note: "Det krever en del disiplin å se denne fordi den er så lang, men gud bedre, det er verdt det. Serien presenterer verdensproblemer gjennom kunstneriske og meningsfulle historier med unike karakterer.",
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
    discSource: "generated",
    note: "Ikke mange serier blir bedre og bedre, men det gjør denne virkelig. Alle karakterer og plots er så goated, med ingen dårlige episoder (Flue-episoden er også tidig på sin egen måte).",
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
    discSource: "generated",
    note: "Dette er på mange måter min barndom. Dritfett konsept og karakterer, og den beste redemption arc-en jeg har opplevd gjennom Zuko.",
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
    discSource: "generated",
    note: "Fantasi på sitt beste. Enormt kul storytelling, og ellers en perfekt serie – minus siste sesong (den snakker vi ikke om).",
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
    discSource: "generated",
    note: "Kuleste superheltserien jeg har sett med masse kjente skuespillere. Ble hooked etter første episode (plot-twisten i første episode er PEAK og blir bare bedre).",
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
    discSource: "generated",
    note: "Elsker måten sesong 1 og sesong 2 er HELT annerledes. Begge er utført perfekt og virkelig minneverdige.",
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
    discSource: "generated",
    note: "Min første anime (som er et sykt sted å starte). Dark fantasy på sitt beste med den sykeste slutten (1997). Jeg visste ikke hvor jeg skulle gjøre av meg etterpå.",
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
    discSource: "generated",
    note: "Tidigste sitcom jeg har sett, men akkurat min type humor. På mange måter er min komfortserie, ettersom jeg ofte kommer tilbake til den når jeg trenger å se på noe mens jeg spiser.",
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
    discSource: "generated",
    note: "Så denne for første gang ganske nylig, men ble umiddelbart en favoritt. Har fått opp klipp av denne på TikTok i åresvis, er så mange goated moments.",
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
    discSource: "generated",
    note: "Min favoritt da jeg var mindre fordi de var litt frekke i språket. Blitt enda mer glad i det i voksen alder ettersom de tøyser mye med ting som skjer aktivt i verden.",
  },
];

/**
 * Every album is a CD jewel case: 142 x 125 x 10mm, front face ratio 0.880.
 * The Life of Pablo never had a physical release, so it is burned by
 * definition rather than by fallback. fanart.tv cdart coverage came back
 * thin across the board — every other album resolved to generated.
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
    discSource: "generated",
    note: "Hele dette albumet er en vibe ass. No skips, kommer aldri til å bli lei av min favorittartist sitt beste album.",
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
    discSource: "generated",
    note: "Det 3. albumet i serien, og for en avslutning. Denne topper de andre ettersom alle sangene er bangers. (Når denne fyren begynner å nynne🥹)",
  },
  {
    id: "astroworld",
    title: "Astroworld",
    year: 2018,
    medium: "album",
    creator: "Travis Scott",
    rank: 3,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/astroworld/cover.png",
    disc: "/assets/album/astroworld/disc.png",
    discSource: "generated",
    note: "Antall ganger dette albumet er blitt blastet fra start til slutt er mange. Peak Travis med ingen skips og the heavy hitters, hitter HARDT.",
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
    discSource: "generated",
    note: "Mr. A$AP sitt beste og mest ikoniske album. Min mest spilte artist gjennom tidene av en grunn, og dette er det beste han har laget.",
  },
  {
    // Released 3 October 2017 on S2OP. Cover Art Archive coverage unverified.
    id: "rommet",
    title: "Rommet",
    year: 2017,
    medium: "album",
    creator: "Store P",
    rank: 5,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/rommet/cover.png",
    disc: "/assets/album/rommet/disc.png",
    discSource: "generated",
    note: "Beste norske albumet laget. En spacy vibe med fengende og syk lyrikk. Minner meg om en norsk Kid Cudi.",
  },
  {
    id: "one-of-wun",
    title: "One of Wun",
    year: 2024,
    medium: "album",
    creator: "Gunna",
    rank: 6,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/one-of-wun/cover.png",
    disc: "/assets/album/one-of-wun/disc.png",
    discSource: "generated",
    note: "Har slepet litt på Gunna, men fy søren, dette albumet er så rått. Et rap album men bare bangers.",
  },
  {
    id: "2014-forest-hills-drive",
    title: "2014 Forest Hills Drive",
    year: 2014,
    medium: "album",
    creator: "J. Cole",
    rank: 7,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/2014-forest-hills-drive/cover.png",
    disc: "/assets/album/2014-forest-hills-drive/disc.png",
    discSource: "generated",
    note: "J Cole back in the day var the goat med dette albumet. For en vibe dette albumet er, har meg tilbake til 2014/2015 hver gang.",
  },
  {
    // No official CD pressing. Burned by definition, not by fallback.
    id: "the-life-of-pablo",
    title: "The Life of Pablo",
    year: 2016,
    medium: "album",
    creator: "Kanye West",
    rank: 8,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/the-life-of-pablo/cover.png",
    discSource: "burned",
    note: "Dette for meg er peak Kanye. Noen få skips på dette albumet med de som hitter, HITTER HARDT.",
  },
  {
    id: "damn",
    title: "DAMN.",
    year: 2017,
    medium: "album",
    creator: "Kendrick Lamar",
    rank: 9,
    list: "all-time",
    case: "jewel",
    livery: "standard",
    cover: "/assets/album/damn/cover.png",
    disc: "/assets/album/damn/disc.png",
    discSource: "generated",
    note: "For et rått og komplett rapalbum av en av de beste til å gjøre det. Milevis bedre enn Drake BTW.",
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
    discSource: "generated",
    note: "Britisk rap/grime på japanske tracks. Burde på mange måter ikke funke men er så jævlig fett.",
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
    // Hand-picked against the cover: muted gold-bronze, off the ring and
    // the title lettering. Not sampled.
    spineTone: "#7a5a2e",
    disc: "/assets/game/elden-ring/disc.png",
    discSource: "generated",
    note: "Dette er et umenneskelig fett spill, jeg har aldri vært så imponert av noe i mitt liv. Dette er virkelig kunst, og ingen spill har gitt meg mer satisfaction.",
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
    livery: "ps3-late",
    cover: "/assets/game/call-of-duty-black-ops-ii/cover.png",
    // Hand-picked: the monochrome cover's neutral grey. Not sampled.
    spineTone: "#3a3a3a",
    disc: "/assets/game/call-of-duty-black-ops-ii/disc.png",
    discSource: "generated",
    note: "Beste skytespillet gjennom tidene men beste zombie spillmodus i ett. Dette er mye av min barndom, og jeg er så heldig å få oppleve det på nytt i voksen alder med kompiser på grunn av PS5-porten.",
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
    // Hand-picked: the comic-art night sky's dominant blue. Not sampled.
    spineTone: "#2a4d8f",
    disc: "/assets/game/sly-3-honor-among-thieves/disc.png",
    discSource: "generated",
    note: "Mitt favorittspill som liten og har en spesiell plass i mitt hjerte. Var skamfett at d fulgte med 3D-briller (blå og rød).",
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
    livery: "ps3-early",
    cover: "/assets/game/lego-star-wars-the-complete-saga/cover.png",
    // Hand-picked: the gold "LEGO STAR WARS" title lettering. Not sampled.
    spineTone: "#c9a227",
    disc: "/assets/game/lego-star-wars-the-complete-saga/disc.png",
    discSource: "generated",
    note: "Som stor Star Wars-fan er det selvforklarende at jeg elsket dette spillet som liten. Veldig gøy å spille med min søster og venner.",
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
    // Hand-picked: the dark, warm ash/fire tones behind the soldier. Not
    // sampled.
    spineTone: "#332a24",
    disc: "/assets/game/call-of-duty-black-ops-iii/disc.png",
    discSource: "generated",
    note: "Eneste Cod med jetpacks jeg fucket med. Grindet dette religiøst og er stolt av å si at jeg fikk dark matter.",
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
    // Hand-picked: the cold, pale moonlit blue behind the figure. Not
    // sampled.
    spineTone: "#5a7a9e",
    disc: "/assets/game/elden-ring-nightreign/disc.png",
    discSource: "generated",
    note: "Som enorm fan av Elden ring så lå d i kortene at jeg kom til å elske dette spillet. Er litt repetitivt, men også veldig avhengighetsskapende og har skapt mange gode minner med venner her.",
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
    // Hand-picked: the amber-brown fire and ash around the knight. Not
    // sampled.
    spineTone: "#7a5a26",
    disc: "/assets/game/dark-souls-iii/disc.png",
    discSource: "generated",
    note: "Det første jeg spilte etter at jeg var ferdig med Elden Ring, og det skuffet virkelig ikke. For en verdensbygging! Det er virkelig kunst på mange måter.",
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
    // Hand-picked: the dominant cyan-blue racing streak. Not sampled.
    spineTone: "#1a9fd9",
    discSource: "burned",
    note: "Et ganske artig arcade-fotballbilspill, men med et enormt skillgap. Har så mange timer på dette spillet med kompiser, hvor vi ler oss ihjel av hvor dårlige vi er.",
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
    // Hand-picked: a warm tan-orange averaged off the mosaic panels. Not
    // sampled.
    spineTone: "#a8763f",
    disc: "/assets/game/grand-theft-auto-v/disc.png",
    discSource: "generated",
    note: "Virkelig et banebrytende spill med dritbra story og endeløs moro med venner. Å gjøre bankran og races med kompiser har skapt så mange gode minner.",
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
    // Hand-picked: the dominant bright yellow background. Not sampled.
    spineTone: "#f4c542",
    discSource: "burned",
    note: "Gøyeste co-op spillet jeg har spilt med en klassisk og kunstnerisk arkitektur. Har gitt meg minner for livet.",
  },
];

export const allEntries: Entry[] = [...films, ...series, ...albums, ...games];

export const lists = { films, series, albums, games } as const;

// Site-level intro copy, written by Matti, four separate paragraphs rather
// than one block of prose Intro.tsx used to split on the first sentence
// boundary — that heuristic doesn't apply now that the paragraph breaks are
// real ones Matti wrote, not implied by punctuation. Same placeholder
// convention as note above: scripts/check-notes.ts fails the build while
// any paragraph here still starts with TODO, so it cannot ship unwritten by
// accident.
export const introText = [
  "Dette er favorittfilmene, seriene, albumene og spillene mine. Ti stykk rangert. Jeg har laget siden fordi jeg hadde lyst, ikke fordi noen ba om den.",
  "En film, et album og et spill er kunst på hver sin måte. De blir sjelden behandlet som det. Her ligger de som mediene de kom i.",
  "Rangeringen er ikke objektiv. Den er full av nostalgi. Noe står høyt fordi det faktisk er godt laget, og noe står høyt fordi jeg opplevde det i riktig alder. Jeg skiller ikke alltid mellom de to.",
  "Døm meg gjerne. Er du sterkt uenig, si fra på",
];
