# Asset sources

Where cover art, disc art and metadata come from. Written for phase one, where assets are fetched once and committed. Phase three changes the licensing picture entirely, noted at the bottom.

## The fallback ladder

Every entry resolves its disc through this order. The first hit wins.

1. **Retail scan.** A scan or digital recreation of the actual disc that shipped in the case.
2. **Generated.** Cover art cropped to a circle, hub hole punched, sheen overlay applied.
3. **Burned.** A blank recordable disc with the title written on it in marker.

The third tier is also a style option, not only a fallback. See `03-object-spec.md`.

## Films and series

**TMDB** (themoviedb.org)
Posters, backdrops, metadata, search. Free API key, registration required. The free tier is non-commercial and requires attribution. Poster art is the front of the case.

**fanart.tv**
The disc source. Its `moviedisc` category holds scans and digital recreations of retail DVD, Blu-ray, 3D and UHD Blu-ray discs, served as transparent PNGs. Records are keyed by IMDB or TMDB id, so it joins cleanly to TMDB.

- Endpoint shape: `https://webservice.fanart.tv/v3/movies/{tmdb_or_imdb_id}?api_key=KEY`
- Use v3.2. It returns image dimensions, which matters for picking the highest-resolution disc.
- Each disc entry carries a `disc_type` field (`dvd`, `bluray`, `4k`) and a `disc` number for multi-disc releases. Use `disc_type` to decide which case the entry gets.
- Appending `/preview` to an image URL returns a 200px version. Use it while prototyping so I am not pulling full-size PNGs on every reload.
- Rate limited with a token bucket and exponential backoff. Fetch in a script with delays, not in a loop from the browser.

Coverage: strong for well-known films, thin for obscure ones and for TV. Expect to generate discs for several series entries.

## Albums

**MusicBrainz**
Metadata and release identifiers. No API key. Requires a descriptive User-Agent header with contact details, and one request per second. Read their rate-limit page before writing the fetch script.

**Cover Art Archive**
Album covers, tied to MusicBrainz release and release-group ids. Free, no key. This is the front of the jewel case and the booklet.

**fanart.tv again**
Its `cdart` category is transparent PNG discs matched to albums by MusicBrainz release-group id. This is the spinning CD asset, already made by a community that built it for exactly this purpose. Kodi media centres spin these today.

- Endpoint shape: `https://webservice.fanart.tv/v3/music/albums/{release_group_mbid}?api_key=KEY`
- Structural warning: in v3 and v3.1 the response returns albums as an object keyed by id. In v3.2 it returns an array of objects each carrying `release_group_id`. Write the parser against one version and pin it.

## Games

**IGDB** (via Twitch)
Metadata, cover art, platforms, release dates. Requires a Twitch developer account and OAuth client credentials. Well documented, generous limits.

**SteamGridDB**
Alternative and supplement for cover art, especially for games with no physical release. Free API key.

**GameTDB**
The disc source for console games. Artwork packs update weekly and downloads need no signup. URL scheme is predictable:

```
https://art.gametdb.com/{system}/{media}/{region}/{gameID}.png
example: https://art.gametdb.com/3ds/cart/US/AREE.png
```

Systems include `wii`, `wiiu`, `ds`, `3ds`, `ps3`, `switch`. Media includes `cover`, `coverfull`, `disc`, `cart`, `disccustom`. Coverage skews Nintendo and PlayStation. Xbox and PC are weak.

Note the `cart` media type. A DS or Switch entry gets a cartridge, not a disc. That is a better object than a generated disc and worth supporting.

**The Cover Project**
Printable replacement covers, high quality, but organised by upload id with no relation to platform or game id, and it now requires human verification before downloading. Do not automate against it. Usable manually for a handful of stubborn entries.

## Practical notes

**Join keys are the hard part.** TMDB id to IMDB id to fanart.tv is clean. MusicBrainz release-group id to fanart.tv is clean. IGDB to GameTDB has no shared identifier and needs fuzzy title-and-platform matching, so expect to resolve game discs partly by hand. With ten games that is an afternoon, not a problem.

**Store the provenance.** Every committed asset gets a record of where it came from and under what terms. A `credits.json` alongside the assets, surfaced in a colophon page. This costs nothing now and saves the project later.

**Transparent PNGs only for discs.** A disc with a baked-in white background cannot be composited onto a case interior.

**Normalise before committing.** Discs to a square canvas at a fixed size, centred, hub hole aligned. Covers to the aspect ratio of their case format. Doing this once in a script beats correcting it in CSS forty times.

## Licensing

Phase one is a personal site displaying cover art for media I own or have watched, with attribution. Low risk in practice, the same position as any film blog.

Phase three is different. TMDB's free tier is explicitly non-commercial. fanart.tv, MusicBrainz and GameTDB all carry their own terms. A public platform where strangers build lists puts the project in the same territory as Letterboxd and Discogs, which operate on negotiated API terms plus attribution. Resolve this before phase three starts, not during.
