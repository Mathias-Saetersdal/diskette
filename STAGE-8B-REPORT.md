# Stage 8b report: strip originals from dist

## The allowlist

`scripts/strip-originals.ts`, wired as `postbuild` in package.json so it
runs at the end of every `npm run build`. It deletes everything under
`dist/assets/` that is not:

- under `dist/assets/derived/`
- under `dist/assets/marks/`
- a Vite build output at the top level of `dist/assets/`

### How a Vite output is identified, and why the test cannot misfire

A kept top-level file must pass all three of:

1. It is a plain **file directly in `dist/assets/`** (media lives in
   subdirectories, `film/<id>/...` and so on — `find public/assets
   -maxdepth 1 -type f` finds only a stray `.DS_Store`).
2. Its name carries a **Vite content-hash suffix**: `-` plus eight hash
   characters before the extension (`index-Blk0qfMV.js`), Vite's default
   `[name]-[hash][extname]` with no rollupOptions overriding it.
3. Its extension is a **bundle extension: js, css, woff, woff2**.

The third test is the hard line. Media in this pipeline is png, jpg and
webp — never a bundle extension — so no media file can pass the test
regardless of where it sits or what its name looks like. And the failure
direction is the one asked for: anything that fails is deleted, so a
future bundled asset of a new type (say an svg imported through `src/`)
would be excluded, and visibly so — it appears missing from the
kept-files list the script prints into every build log, and 404s in
preview. The fix then is extending the extension list, consciously.

### Guards and failure behaviour

- Hard failure if `dist/assets/` or `dist/assets/derived/` is missing,
  or if `derived/` contains zero files.
- Hard failure if `dist/assets/marks/` is missing.
- Every delete is individually error-checked: any failure prints the
  path and the error and exits non-zero.
- Summary printed: files deleted, bytes deleted, bytes remaining under
  `dist/`, and the full list of kept top-level files.

## Verification

### Summary output (identical in the standalone run and the full `npm run build`)

```
stripped originals from dist/assets
files deleted: 99
bytes deleted: 164810382
bytes remaining under dist/: 6987858
kept at top level of dist/assets/ (6):
  index-Blk0qfMV.js
  index-ykeHz9k3.css
  lora-latin-400-normal-DBJS-Hc6.woff
  lora-latin-400-normal-DnxXpLNu.woff2
  permanent-marker-latin-400-normal-BF23djCy.woff2
  permanent-marker-latin-400-normal-BnZj5c41.woff
```

The 99 deleted files are the 97 originals plus the two `.DS_Store` files
the committed tree carries; 164,810,382 bytes equals the originals'
164,798,086 plus the 12,296 of `.DS_Store`, exactly.

### dist/assets/ at depth 1 after the strip

```
derived/
marks/
index-Blk0qfMV.js
index-ykeHz9k3.css
lora-latin-400-normal-DBJS-Hc6.woff
lora-latin-400-normal-DnxXpLNu.woff2
permanent-marker-latin-400-normal-BF23djCy.woff2
permanent-marker-latin-400-normal-BnZj5c41.woff
```

### Sizes, counts, marks

- `dist/` before the strip: 208,312 KB. After: **8,296 KB** (du); the
  script's own byte count of remaining files is 6,987,858 B.
- `dist/assets/derived` contains exactly **194 files**.
- All 21 files under `dist/assets/marks` survive, by name:
  blu-ray-disc-white.png, fanart-tv-logo.svg, gametdb-logo.png,
  musicbrainz-logo.svg, playstation-logo.svg, ps-logo-black.svg,
  ps-logo-white.svg, ps2-logo-white.svg, ps2-logo.svg, ps3-grey-logo.png,
  ps3-logo-new-white.svg, ps3-logo-new.svg, ps3-logo-old-white.svg,
  ps3-logo-old.svg, ps4-logo.svg, ps4-wordmark-white.png,
  ps4-wordmark.png, ps5-logo.svg, ps5-wordmark-dark.png,
  ps5-wordmark.png, tmdb-logo.svg.

### Preview of the stripped dist

`vite preview` on the stripped `dist/`, cache disabled, main page loaded
and one case opened (so the disc and full-cover paths run too): **63
responses, every one 200, nothing 404s.** Breakdown: 42 under
`/assets/derived/` (40 list covers plus the opened case's
disc.full.webp and cover.full.webp), 14 under `/assets/marks/`, the JS,
CSS and one font, the document, the favicon, and the two blob: URLs the
decoded assets render from.

## Tilt-compare

The expected disc-original 404 **does not happen — the route dies
earlier.** `/tilt-compare` crashes on mount with
`Error: useLanguage must be used inside LanguageProvider`: main.tsx
deliberately renders TiltCompare outside the provider ("renders no
translated strings"), but `Case`, which TiltCompare mounts, has called
`useLanguage` since the language toggle landed. The route renders
nothing (zero `.case` nodes, empty body) and makes only three requests
(document, CSS, JS), all 200. This breakage predates this task and is
unrelated to the strip.

For the keep-or-kill decision: even if the provider crash were fixed,
TiltCompare mounts every Case with `open={false}` and a no-op toggle, so
under stage 3's open-gating its `assetUrl(entry.disc)` originals would
never be requested at all — only its `assetUrl(entry.cover)` cover
originals would fire, and those would now 404 under the stripped dist.
Nothing fixed here, per the task.

## URLs to test on a preview deployment after you push

| URL (path on the preview origin) | Expected |
|---|---|
| /assets/derived/film/the-dark-knight/cover.list.webp | 200 |
| /assets/derived/film/the-dark-knight/disc.full.webp | 200 |
| /assets/marks/blu-ray-disc-white.png | 200 |
| /assets/film/the-dark-knight/cover.png | **404** |

## Constraints check

No Norwegian text touched. No discSource touched. Files touched: the new
script, one package.json line, and this report — `public/` is never
read from destructively and never written; only `dist/` (a build
artifact) is modified, by the postbuild step itself. Nothing committed,
nothing pushed.

## Typecheck

`npx tsc --noEmit` exits 0; `tsc -p tsconfig.node.json` (the project
covering `scripts/`) also exits 0; eslint on the new script reports
nothing.

## Files created or modified

- `scripts/strip-originals.ts` (created)
- `package.json` (one line: the `postbuild` script)
- `STAGE-8B-REPORT.md` (this file)
- (`dist/` rebuilt and stripped by the build chain)
