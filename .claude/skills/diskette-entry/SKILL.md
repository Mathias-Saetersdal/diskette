---
name: diskette-entry
description: Add one entry to a list in src/data/lists.ts (films, series, albums, or games) with the correct case format, livery, disc source, and asset pipeline. Use this whenever adding, inserting, or ranking a new film, series, album, or game entry, or fetching assets for one entry by id.
---

Adding one entry to `src/data/lists.ts`. Grounded in the real `Entry` type there, the real flags in `scripts/fetch-assets.ts`, `credits.json`'s real shape, and `docs/02-asset-sources.md`.

## Case and livery

Set from release year and medium, not guessed per entry:

- Film, year >= 2008: `case: "bluray"`. Earlier: `case: "dvd"`. Livery `"standard"`.
- Series: always `case: "dvd"` (box set), livery `"standard"`.
- Album: always `case: "jewel"`, livery `"standard"`.
- Game, by platform: PS2 -> `dvd` / `ps2`. PS3 -> `bluray` / `ps3-early` or `ps3-late` (early: translucent launch shell; late: opaque shell, grey header — pick by which case the release actually shipped in, not by year alone). PS4 -> `bluray` / `ps4`. PS5 -> `ps5` / `ps5`.

Source: `docs/03-object-spec.md`'s Cases table and Livery section, `docs/04-lists.md`.

## discSource

Leave it unset. The fetch script resolves it down the ladder in `docs/02-asset-sources.md` (retail, then generated, then burned) and only prints which tier it landed on — it never writes back to `lists.ts`. Set `discSource: "burned"` by hand only when told a real disc never existed for that entry. Never set `"retail"` or `"generated"` by hand to force a result.

## Games are the one manual path

`scripts/fetch-assets.ts` never touches the games array (its own top comment says so). Source game covers by hand (IGDB or SteamGridDB), the disc from GameTDB where it covers PS3, generated otherwise (`docs/02-asset-sources.md`'s Games section). Add a matching `credits.json` entry by hand too, since the script won't write one for games.

## Films, series, albums: run the script

After adding the entry to `lists.ts`, scope the fetch to just it:

```
tsx scripts/fetch-assets.ts --only=<entry-id>
```

`--only` takes comma-separated ids and is real, just not mentioned in the script's own top-of-file comment (which only documents `--limit=N`). The script downloads over curl, never `fetch()` — archive.org's CDN was observed hanging or dropping mid-transfer under Node's own networking, curl didn't. Keep it that way if touching the script.

The script handles normalisation (`sharp`, square canvas, centred, transparent PNG) and the `credits.json` entry (source, url, licence, keyed by id) itself. Nothing to do by hand for these three media beyond checking the output looks right.

## note

Leave it as the placeholder. Matti writes notes by hand, one entry at a time; `scripts/check-notes.ts` fails the build on any note still starting with `TODO`, so an untouched placeholder is correct, not an oversight to fix.
