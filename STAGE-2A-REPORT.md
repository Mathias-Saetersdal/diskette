# Stage 2a report: list covers on derived assets

## State on resume

Established from `git status`, `git diff` and the files before any change:
`src/assetSources.ts` existed, complete and valid (68 lines, all three tsc
projects passing). No build-check file existed; `scripts/` held only
check-notes.ts, derive-assets.ts and fetch-assets.ts. `package.json` carried
only the stage 1 lines. No component was touched, nothing was half-written.
`npx tsc --noEmit` exited 0 before work resumed.

## Step 1 (previously confirmed, re-verified)

The list cover was already an `<img>`, not a background-image. Keep cases:
`CaseFrontFace.tsx`, the `src` attribute on the img inside
`.case__front-poster`. Albums: `FlatJewelCase.tsx`, the img inside
`.jewel-case__front-poster`. No conversion needed, so no stop.

## Step 2 (previously done, re-verified)

`src/assetSources.ts` exports `derivedAsset(originalPath)`, typed as
`DerivedAsset`. Keys are the exact path strings from lists.ts. Missing key:
throws in dev with the key in the message; in production warns to console
and falls back to `assetUrl(originalPath)`, dimension fields 0 so callers
skip the width/height attributes. Found records get their `list`/`full`
paths run through `assetUrl` so call sites use them directly.

## Step 3: build-time check

`scripts/check-assets.ts`, in check-notes.ts's style: a top comment saying
what it gates and why, direct import of `allEntries`, a filter, every
missing path printed, exit 1. It checks every `cover`, `disc`, `spine` and
`back` path string against `src/data/assets.generated.json`.

Wired into `package.json`:

```
"build": "tsx scripts/check-notes.ts && tsx scripts/check-assets.ts && tsc -b && vite build"
```

npm's `prebuild` (derive-assets, stage 1) runs before the `build` script
line, so the check always runs against a fresh regeneration. Current run:
"All 77 asset paths in lists.ts have derived records." (40 covers, 37
discs; no entry sets `spine` or `back` yet.)

## Steps 4 and 5: wiring

Route question first: the four lists are one scrolling page, not routes.
`App.tsx` renders FilmsList, SeriesList, AlbumsList, GamesList in that
order inside one `main`. Rule applied: the first four covers on the page
overall are films ranks 1 to 4 (eager), fetchpriority="high" on films
ranks 1 and 2 only, every other cover on the page lazy.

The list cover img now gets, per the record: `src` = the `.list.webp` URL
(one src, no srcset, no sizes), `width`/`height` = the original's pixel
dimensions (intrinsic ratio only), `decoding="async"`, `alt` = the entry
title and nothing else.

How it lands per file:

- `CaseFrontFace.tsx`: four new optional props (`coverWidth`,
  `coverHeight`, `loading` defaulting to the previous hardcoded "lazy",
  `fetchPriority`, `decoding`), applied to the img only when passed. The
  open `Case` passes none of them, so the open case renders exactly as
  before, original PNG included.
- `FlatCase.tsx`: new optional `coverWidth`/`coverHeight`/`eager`/
  `priority` props, forwarded to CaseFrontFace with `decoding="async"`
  stamped on every list cover.
- `FlatJewelCase.tsx`: same attributes on its own img; always lazy, no
  priority (albums sit third on the page).
- `KeepCaseCard.tsx`, `GameCard.tsx`, `AlbumCard.tsx`: look up
  `derivedAsset(entry.cover)` and pass the list URL, dimensions and
  `alt={entry.title}` to the flat component. The open Case/JewelCase
  branch still passes `assetUrl(entry.cover)` untouched.

No CSS change was needed: `.case__front-poster img` and
`.jewel-case__front-poster img` already size the element with
`width/height: 100%` and object-fit, so the new width/height attributes
only supply the intrinsic ratio and cannot win over the CSS box.

## Step 6: verification

Fresh headless Chrome (foreground page, transitions unthrottled) at
1440x900, cache disabled via CDP `Network.enable` +
`page.setCacheEnabled(false)`, full-page load then 15s settle so lazy
loading and the idle disc preloader both play out. Numbers are dev-server
transfer sizes.

- Image request count: 92
- Total transferred image bytes: 70,690,699
- Five largest image requests (all are the disc preloader, see below):

| Request | Bytes |
|---|---|
| /assets/album/currents/disc.png | 2,850,267 |
| /assets/album/man-on-the-moon-iii-the-chosen/disc.png | 2,826,160 |
| /assets/album/astroworld/disc.png | 2,708,713 |
| /assets/series/vinland-saga/disc.png | 2,634,799 |
| /assets/album/2014-forest-hills-drive/disc.png | 2,626,272 |

- Requests under `/assets/` outside `/assets/derived/` and
  `/assets/marks/`: exactly the 37 `disc.png` originals, nothing else.
  Every one comes from `preloadDiscs.ts`, the deliberate idle cache
  warmer for the open-case disc, which starts after the load event and is
  out of this task's scope (the disc was explicitly not to be touched).
  **No cover original was requested. Nothing bypasses the cover lookup.**

Split out, the cover-side traffic is small: removing the 37 preloader
discs (69,807,593 bytes) leaves 55 image requests totalling 883,106 bytes
for all 40 derived covers plus the livery mark files. The five largest
derived cover files served:

| File | Bytes |
|---|---|
| /assets/derived/album/rommet/cover.list.webp | 38,294 |
| /assets/derived/album/currents/cover.list.webp | 33,774 |
| /assets/derived/series/vinland-saga/cover.list.webp | 29,144 |
| /assets/derived/film/spider-man-2/cover.list.webp | 26,576 |
| /assets/derived/film/this-is-the-end/cover.list.webp | 26,340 |

DOM state checked in the same run: 40 cover imgs, 4 eager, 2 with
fetchpriority="high", 40 with decoding="async", 40 with width/height
attributes, first src
`/assets/derived/film/the-dark-knight/cover.list.webp`, first alt
"The Dark Knight". No console errors or warnings, so the dev throw in
`derivedAsset` never fired: every key resolved.

## Constraints check

No Norwegian text touched. No series sizing or `--list-case-h` touched. No
`discSource` touched. No change to the open case, disc, back face, spine,
tray, marks, geometry or transforms: the only shared-file edit
(CaseFrontFace) is prop-gated and the open case passes none of the new
props. No runtime third-party API call introduced.

## Typecheck

`npx tsc --noEmit` exits 0 after all changes. `tsc -p tsconfig.app.json`
and `tsc -p tsconfig.node.json` also exit 0, and eslint over every touched
file reports nothing.

## Files created or modified

- `scripts/check-assets.ts` (created)
- `package.json` (build line gains the check-assets step)
- `src/components/CaseFrontFace.tsx`
- `src/components/FlatCase.tsx`
- `src/components/FlatJewelCase.tsx`
- `src/components/KeepCaseCard.tsx`
- `src/components/GameCard.tsx`
- `src/components/AlbumCard.tsx`
- `STAGE-2A-REPORT.md` (this file)

Created in the earlier half of this task, unchanged on resume:
`src/assetSources.ts`.
