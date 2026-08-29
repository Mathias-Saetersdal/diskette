# Stage 8a report: immutable caching headers

## Step 1: existing config

No `vercel.json` exists in the repo (checked at the root; `ls` confirms
no such file). Nothing to overwrite, so the task proceeded.

## Step 2: the config

`vercel.json` created at the repo root with exactly the two rules asked
for:

```json
{
  "headers": [
    {
      "source": "/assets/derived/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/assets/index-(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

No rule for `index.html` (it keeps revalidating so a new deploy is
seen). No rule for `/assets/marks/` (unhashed filenames, replaceable in
place).

### Filename pattern check

`vite.config.ts` contains no `rollupOptions` and no output naming of any
kind — only the react plugin and `base: '/'` — so Vite's defaults apply
(`assets/[name]-[hash][ext]`). The emitted files confirm it:
`dist/assets/index-Blk0qfMV.js` and `dist/assets/index-ykeHz9k3.css`,
the same names stage 7 observed on the origin. Both match
`/assets/index-(.*)`. The pattern is correct as specified.

### The fonts

The four self-hosted font files land under `/assets/` but outside both
patterns:

```
lora-latin-400-normal-DnxXpLNu.woff2
lora-latin-400-normal-DBJS-Hc6.woff
permanent-marker-latin-400-normal-BF23djCy.woff2
permanent-marker-latin-400-normal-BnZj5c41.woff
```

They **are** content-hashed — the `DnxXpLNu` / `DBJS-Hc6` / `BF23djCy` /
`BnZj5c41` segments are Vite build hashes, and the CSS references them by
these exact names — so they are immutable by construction too and
currently keep paying the revalidation round trip. The task scoped the
file to two patterns only, so the rule is proposed here rather than
added. Paste-ready third entry:

```json
{
  "source": "/assets/(lora|permanent-marker)-(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

(Scoped to the two font family prefixes rather than a blanket
`/assets/(.*)`, which would wrongly sweep in `/assets/marks/` and the
committed originals.)

## Step 3: local verification, and where it stops

`npm run build` completes cleanly: both gates pass, the bundle emits as
`index-Blk0qfMV.js` / `index-ykeHz9k3.css`, exit 0.

`vercel.json` headers are applied by Vercel's edge, not by `vite
preview`, so the effect cannot be verified locally and no attempt was
made. After pushing, check against https://diskette-two.vercel.app:

1. `curl -sI https://diskette-two.vercel.app/assets/derived/film/the-dark-knight/cover.list.webp | grep -i cache-control`
   — must now read `public, max-age=31536000, immutable`.
2. `curl -sI https://diskette-two.vercel.app/assets/index-Blk0qfMV.js | grep -i cache-control`
   — must now read `public, max-age=31536000, immutable`. (The hash
   changes on the next deploy; take the name from the served HTML.)
3. `curl -sI https://diskette-two.vercel.app/ | grep -i cache-control`
   — must still read `public, max-age=0, must-revalidate`. If this one
   ever shows the year-long value, roll the config back before anything
   else: a cached index.html hides every future deploy.

## Constraints check

One file created, nothing else touched: no code, no components, no build
scripts, no Norwegian text, no sizing variables, no discSource.

## Typecheck

`npx tsc --noEmit` exits 0 (no code changed; run as instructed).

## Files created or modified

- `vercel.json` (created)
- `STAGE-8A-REPORT.md` (this file)
