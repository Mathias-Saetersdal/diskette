# Stage 3 report: disc loads on open

## Step 1: the preloader before deletion

`src/preloadDiscs.ts` in full, as it stood:

```ts
import { allEntries } from './data/lists'
import { assetUrl } from './assetUrl'

/**
 * Warms the browser cache for every disc scan after the page has loaded.
 * Disc PNGs run 2-3MB each and nothing renders them until a case mounts
 * at click time, so without this the disc arrived visibly late into an
 * already-open case — an empty tray for the first second of every cold
 * open. Covers don't need this: the closed cards already load all of
 * them at startup.
 *
 * One image at a time, in list order, started only after window load
 * (plus an idle beat where the browser offers one): sequential requests
 * never compete with the page's own startup traffic or with each other,
 * they just trickle the cache full in the background. Failures skip to
 * the next disc — a missing scan is the fetch pipeline's business, not
 * this preloader's.
 */
export function preloadDiscs() {
  const sources = allEntries.filter((entry) => entry.disc).map((entry) => assetUrl(entry.disc!))

  let index = 0
  const next = () => {
    if (index >= sources.length) return
    const img = new Image()
    // Low network priority where supported: this is cache warming, never
    // something the user is waiting on — the mounted disc's own
    // fetchpriority="high" request wins if both are ever in flight.
    img.fetchPriority = 'low'
    img.onload = next
    img.onerror = next
    img.src = sources[index]
    index += 1
  }

  const start = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => next(), { timeout: 3000 })
    } else {
      setTimeout(next, 1500)
    }
  }

  if (document.readyState === 'complete') {
    start()
  } else {
    window.addEventListener('load', start, { once: true })
  }
}
```

Import and call sites, all of them:

- `src/App.tsx:10` imported it; `src/App.tsx:17` called it once from a
  `useEffect` on mount. The trigger chain was: App mount, then window
  load, then a `requestIdleCallback` beat (3s timeout fallback), then one
  sequential `Image()` fetch per disc.
- `src/components/Disc.tsx:219` referenced it in a comment only.

Side effects: none beyond the browser HTTP cache. It sets no state, no
module export is read anywhere, and its `Image()` objects never enter the
DOM. No component reads anything the preloader produces, so there was
nothing to stop for.

## Step 2: removal

`src/preloadDiscs.ts` deleted. `App.tsx` lost the import, the `useEffect`
call and the now-unused `useEffect` react import. Nothing replaces it: no
idle prefetch, no warming, no speculative fetch of any kind remains.

## Step 3: load on open

The disc slot stays always-mounted inside `Case`/`JewelCase` (its DOM
position drives paint order during the close swing; untouched), but its
`src` is now empty until the case enters its open state:

- `Case.tsx` and `JewelCase.tsx` each gain a sticky `discRequested` flag,
  set by the same render-time pattern as the existing `interiorOnTop`:
  flips true when `open` does, never falls, so the disc stays in the tray
  under the closing lid. `<Disc src={discRequested ? discSrc : ''} ...>`.
- `Disc.tsx` now resolves its src through a module-level cache: fetch,
  blob, `img.decode()`, then render. Decoding completes before the img
  mounts, so the disc appears whole on its first painted frame, no fade.
  The module map outlives the Case (which unmounts on close), so closing
  and reopening renders from the cache with zero network, even with the
  HTTP cache disabled. An in-flight map dedupes concurrent requests for
  the same src (also covers StrictMode's double effect in dev). A failed
  fetch is caught: the case opens, the tray renders empty, nothing throws,
  and the failure is not cached so the next open retries.
- `KeepCaseCard.tsx`, `GameCard.tsx`, `AlbumCard.tsx` pass
  `derivedAsset(entry.disc).full` (the 512px `.full.webp`) instead of the
  original PNG. Entries with no disc still pass `undefined` and render as
  before. Burned entries never touch any of this (`BurnedDisc` branch,
  unchanged).

One deliberate leftover: `TiltCompare.tsx`, the dev-only `/tilt-compare`
route (main.tsx:14), still passes `assetUrl(entry.disc)` originals. It is
not the list page, renders nothing in production use, and touching it was
out of scope. It now simply loads its discs at open like everything else.

## Step 4: verification

Fresh headless Chrome (foreground page), 1440x900, HTTP cache disabled via
CDP, dev server. Transfer sizes are dev-server bytes.

- **At rest** after full load plus a 15 second settle: 55 image requests,
  883,106 bytes, identical to the stage 2a cover-only baseline. Requests
  matching `*disc*`: one, `/assets/marks/blu-ray-disc-white.png`, which is
  the Blu-ray livery mark whose filename happens to contain "disc". Zero
  disc asset requests.
- **Open The Dark Knight**: exactly one disc request fired,
  `/assets/derived/film/the-dark-knight/disc.full.webp`, 72,270 bytes
  transferred.
- **Close and reopen the same case**: the request list is unchanged. No
  second fetch, with the HTTP cache disabled.
- **Open Interstellar**: exactly one new request,
  `/assets/derived/film/interstellar/disc.full.webp`, 68,252 bytes.
- No page errors in any phase.

Transparency, read back from pixels rather than a screenshot:

The live rendered disc img (the decoded blob in the open case) was drawn
to a canvas in-page and sampled: hub centre alpha 0, corners alpha 0,
printed area alpha 255. The initial single-pixel ring sample came back
opaque, so the claim was checked properly against the originals with
sharp instead of trusted from one pixel: these retail scans print into
parts of the 15-46mm ring band, so per-pixel values there legitimately
mix semi-transparent and opaque, and single pixels also shift under the
1000px to 512px resample. The robust check integrates the whole clear
ring annulus (radius 7.25% to 18% of width) and the hub disc:

| File | Ring annulus mean alpha | Hub mean alpha |
|---|---|---|
| film/the-dark-knight/disc.png (original) | 244 | 0 |
| derived .../disc.full.webp | 244 | 0 |
| film/blade-runner-2049/disc.png (original) | 244 | 0 |
| derived .../disc.full.webp | 243 | 0 |

The hub hole is hard transparent in every derivative and the ring band's
transparency profile matches the original to within 1/255 on average.
Nothing is filled.

## Constraints check

No Norwegian text touched. No series sizing or `--list-case-h` touched.
No `discSource` touched. No geometry or transform changed. List view
untouched (the rest-state request profile is byte-identical to stage
2a's). The open-case cover still loads the original, per scope; that is
the next task.

## Typecheck

`npx tsc --noEmit` exits 0. `tsc -p tsconfig.app.json --noEmit` also
exits 0, and eslint over every touched file reports nothing.

## Files created or modified

- `src/preloadDiscs.ts` (deleted)
- `src/App.tsx`
- `src/components/Disc.tsx`
- `src/components/Case.tsx`
- `src/components/JewelCase.tsx`
- `src/components/KeepCaseCard.tsx`
- `src/components/GameCard.tsx`
- `src/components/AlbumCard.tsx`
- `STAGE-3-REPORT.md` (this file)
