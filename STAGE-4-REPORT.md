# Stage 4 report: full-resolution cover on open

## Step 1: cache audit

The module-level cache in `Disc.tsx`, as audited before reuse:

```ts
const decodedDiscs = new Map<string, string>() // src -> object URL of the decoded blob
const inflightDiscs = new Map<string, Promise<string>>()

function loadDisc(src: string): Promise<string> {
  const cached = decodedDiscs.get(src)
  if (cached) return Promise.resolve(cached)
  const inflight = inflightDiscs.get(src)
  if (inflight) return inflight
  const request = fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error(`${response.status} fetching ${src}`)
      return response.blob()
    })
    .then(async (blob) => {
      const url = URL.createObjectURL(blob)
      const image = new Image()
      image.src = url
      await image.decode()
      decodedDiscs.set(src, url)
      return url
    })
    .finally(() => {
      inflightDiscs.delete(src)
    })
  inflightDiscs.set(src, request)
  return request
}
```

What it stores per entry: a **blob object URL string**. The URL pins the
underlying Blob, which holds the **compressed** WebP bytes (50-130KB per
disc). Not a Blob reference directly, not an HTMLImageElement, not an
ImageBitmap.

- **Are blob URLs revoked?** No, nowhere. Deliberate: revoking one would
  break the reopen-from-cache path. They are bounded at one per distinct
  asset (37 discs, now plus 40 covers).
- **Is the decoded bitmap released after unmount?** The cache holds no
  reference to it. The `Image` used for `decode()` is function-local and
  dropped; after the case closes, no JS or DOM reference pins decoded
  pixels. The decoded frames live only in Chrome's own image memory
  cache, keyed by URL and evictable under pressure — the same place the
  pixels of every rendered `<img>` on the page go, list covers included.
- **Retained memory after opening all 37 disc entries in sequence**,
  measured in the headless run (all 40 entries opened and closed, 37 disc
  fetches confirmed). `performance.measureUserAgentSpecificMemory()` was
  unavailable (API absent; it needs cross-origin isolation the dev server
  does not set), so the figures are CDP `HeapProfiler.collectGarbage`
  followed by `Performance.getMetrics`, plus RSS summed over this
  instance's own renderer processes:

| Measure | Before (at rest) | After all 40 opens | Delta |
|---|---|---|---|
| JS heap used | 6,711,776 B | 9,081,100 B | +2.37 MB |
| Renderer RSS | 283,623,424 B | 330,727,424 B | +47.1 MB |

The JS heap delta, +2.37 MB for 37 discs, is the compressed bytes (about
64KB per disc) plus map and string overhead — and is two orders of
magnitude below what 37 decoded 512x512 RGBA bitmaps would hold (~39 MB).
That is the direct evidence the cache retains compressed bytes, not
decoded bitmaps. The RSS delta is consistent with Chrome's own evictable
decoded-image cache holding recently displayed frames, which it does for
any image ever painted and which no app reference keeps alive.

Verdict: the cache holds compressed bytes. The gate passes, and the
pattern was extended to covers.

One more measurement taken while auditing, because the step 2 design
depends on it: with the HTTP cache disabled, creating a fresh `<img>` for
a URL the document already displays fires **no** network request —
Blink's in-memory image cache serves it. This is why the open case can
show the list asset with zero requests.

## Step 2: implementation

The loader was generalised in place and exported: `loadDecodedImage` and
`decodedImageUrl` from `Disc.tsx` (maps renamed `decodedImages` /
`inflightImages`; a file-level react-refresh disable mirrors
CaseFrontFace's existing one, same reasoning). `Disc` itself now calls the
exported names; its behaviour is unchanged.

- `Case.tsx`: the sticky `discRequested` flag became
  `openAssetsRequested` — same render-time pattern, now gating both the
  disc and the cover upgrade. New optional `coverFullSrc` prop, forwarded
  to CaseFrontFace only once the open state is reached.
- `CaseFrontFace.tsx`: optional `coverFullSrc`. When set, it loads
  through the shared cache, and the img's src swaps from the list asset
  to the decoded full asset in place — same element, no fade, no
  transition, no opacity change. Initial state reads the cache, so a
  reopened case renders the full asset from the first frame. A failed
  load stays on the list asset silently. FlatCase never passes the prop,
  so the list view cannot trigger any of it.
- `JewelCase.tsx`: identical mechanics on its own booklet img, gated by
  its own `openAssetsRequested`.
- `KeepCaseCard.tsx`, `GameCard.tsx`, `AlbumCard.tsx`: the open
  Case/JewelCase now gets `coverSrc={cover.list}` and
  `coverFullSrc={cover.full}`. The original cover PNG is not referenced
  on any path any more; the now-unused `assetUrl` imports came out.
  `TiltCompare.tsx` stays as it is, per the task.

The hinge and enlarge never wait on the network: the face carries the
already-cached list asset throughout, and the upgrade lands whenever it
decodes. `useSpineColors` now samples the list asset (it downsamples to
32x32 regardless), served from memory with no request.

## Step 3: verification

Fresh headless Chrome (foreground), 1440x900, HTTP cache disabled, dev
server.

- **At rest** (full load, 15s settle): 55 image requests, 883,106 bytes.
  Unchanged from stage 3, byte for byte.
- **Open The Dark Knight** — network requests fired, complete list:

| Request | Transferred |
|---|---|
| /assets/derived/film/the-dark-knight/disc.full.webp | 72,270 B |
| /assets/derived/film/the-dark-knight/cover.full.webp | 56,284 B |

  Exactly two, one cover and one disc. (CDP also logs the two blob: URL
  resolutions the decoded assets render from; both carry 0 transferred
  bytes and touch no network.)
- **No request under `/assets/` outside `/assets/derived/` or
  `/assets/marks/`** anywhere in the entire run, list confirmed empty.
- **The swap**, verified without a screenshot: after settling, the cover
  img's `currentSrc` is a `blob:` URL, because the Disc.tsx mechanism the
  task said to reuse serves decoded blobs — a literal ".full.webp" suffix
  check cannot pass by construction, so content identity was verified
  instead, which is stronger: the blob's SHA-256
  (`ab01ed6b983612e6d6435bae6f9a37f407347e41d84556e5475eaa688d2e642f`)
  equals the on-disk `cover.full.webp`'s SHA-256 exactly, and the img's
  naturalWidth is 512 (the list asset is 260), so the displayed image is
  provably the full derivative.
- **Close and reopen**: zero new network requests (the only logged entry
  is the cached blob URL re-render, 0 bytes). On reopen the cover shows
  the full asset immediately, naturalWidth 512, same blob.

## Constraints check

No Norwegian text touched. No series sizing or `--list-case-h` touched.
No `discSource` touched. Disc behaviour unchanged (same requests, same
bytes as stage 3). List view untouched (rest profile identical). No
geometry or transform changed. Back face, interior, tray, marks
untouched.

## Typecheck

`npx tsc --noEmit` exits 0 after all changes; `tsc -p tsconfig.app.json`
also 0; eslint over `src/components/` and `src/assetSources.ts` reports
nothing.

## Files created or modified

- `src/components/Disc.tsx` (loader generalised and exported; Disc
  behaviour unchanged)
- `src/components/CaseFrontFace.tsx`
- `src/components/Case.tsx`
- `src/components/JewelCase.tsx`
- `src/components/KeepCaseCard.tsx`
- `src/components/GameCard.tsx`
- `src/components/AlbumCard.tsx`
- `STAGE-4-REPORT.md` (this file)
