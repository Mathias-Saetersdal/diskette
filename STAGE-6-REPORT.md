# Stage 6 report: request priority on the list view

## Step 1: current state before the change

Attributes read from the live DOM of the production bundle, grouped by
list:

- **Films (first row)**: ranks 1-2 `loading="eager"` +
  `fetchpriority="high"`; ranks 3-4 `eager`, no fetchpriority; ranks 5-10
  `lazy`, no fetchpriority.
- **Series**: all ten `lazy`, no fetchpriority.
- **Albums**: all ten `lazy`, no fetchpriority.
- **Games**: all ten `lazy`, no fetchpriority.

Above the fold at **1440x900**: the ten films-row covers, exactly (every
series/albums/games cover sits below the viewport). Above the fold at
**375x812**: films 1-6 intersect the viewport — the films row scrolls
horizontally there, so ranks 7-10 sit above the fold vertically but
outside the viewport to the right, and no second row is visible. So the
two sets are films 1-10 and films 1-6: different sets, both inside the
first row, which is what makes the "demote everything outside the first
row" rule safe on both viewports.

## Step 2: the change

- `fetchpriority="low"` on every list cover outside the films row (30
  covers: all series, albums, games).
- Films 1-2 keep `fetchpriority="high"`, unchanged. Films 3-10 keep no
  attribute. All `loading` attributes untouched.
- No request removed, no queueing JS, no IntersectionObserver.

Implementation: `CaseFrontFace`'s and `FlatCase`'s `fetchPriority` prop
widened to `'high' | 'low'` (FlatCase's boolean `priority` became the
pass-through `fetchPriority`), `FlatJewelCase` stamps `low` on its own
img, `KeepCaseCard` emits high/absent for films and `low` for series,
`GameCard` emits `low`. Verified in the built app's DOM: 40 covers, 2
high, 8 auto (all in the films row), 30 low (none in the films row), 4
eager — exactly the specified distribution.

## Step 3: measurement

### An HTTP/2 origin, yes — with two findings that frame the numbers

The production build was served over a local HTTP/2 origin: a Node
`http2.createSecureServer` with a self-signed certificate, confirmed
`protocol: "h2"` on every response. Two rig findings matter more than the
timings:

**Finding 1: the change is provably on the wire.** Chrome sends the RFC
9218 `priority` request header on h2, and the server logged it per
request. Before: 2 covers at `u=1` (the two highs), the other 38 —
in-viewport films included — at bare `i` (urgency 3 by default). After:
**all ten films-row covers arrive at `u=1`** and the 30 demoted covers at
urgency 3. Demoting the rest also led Chrome to re-evaluate the
un-demoted visible row and boost all of it to `u=1` at request time. This
header stream is exactly what Vercel's edge will receive.

**Finding 2: CDP throttling cannot register the effect, on any origin.**
`Network.emulateNetworkConditions` shares its virtual link round-robin
across active requests inside the client, downstream of everything the
server does. Confirmed empirically: a priority-honouring origin that
strictly ordered response bytes by urgency produced byte-identical
timings to a priority-ignoring one under CDP throttling. So the
stage-5-comparable numbers below are a **floor, not a result** — they
show no regression, and they cannot show the win.

### Stage-5-method numbers (CDP throttling, floor)

Foreground page, cache disabled, 1440x900, same decode instrumentation as
stage 5. h2 origin.

| Condition | Metric | Before | After |
|---|---|---|---|
| Fast 4G | last above-fold cover decoded | 1,674 ms | 1,686 ms |
| Fast 4G | last cover on page decoded | 1,714 ms | 1,725 ms |
| Fast 4G | total transferred at rest | 1,206,220 B | 1,206,272 B |
| Slow 4G | last above-fold cover decoded | 7,900 ms | 7,901 ms |
| Slow 4G | last cover on page decoded | 8,107 ms | 8,107 ms |
| Slow 4G | total transferred at rest | 1,196,638 B | 1,196,690 B |

(Totals here are larger than stage 5's 970 kB because this origin serves
JS/CSS identity-encoded where vite preview gzips them; images are
identical.)

### Origin-paced numbers (priority-honouring server, bottleneck at origin)

To get the throttle out of the client, the origin itself was paced at the
link rate (188,743 B/s for Slow 4G, 1,061,683 B/s for Fast 4G) and served
bytes strictly in urgency order, client unthrottled. No RTT emulation, so
these are not comparable to stage 5's absolute times — only before vs
after within this rig:

| Rate | Metric | Before | After |
|---|---|---|---|
| Slow-4G rate | last above-fold / last cover | 3,476 / 6,350 ms | 3,550 / 6,429 ms |
| Fast-4G rate | last above-fold / last cover | 749 / 1,281 ms | 708 / 1,305 ms |

Before and after tie here too, and the reason is worth having on record:
on this origin, equal-urgency requests are served in arrival order, and
the films row is requested first in document order anyway — so the
first row was already winning the queue *incidentally*. What the change
adds is the explicit signal (`u=1` on the whole visible row, urgency 3 on
the other 30) that makes the ordering a stated contract instead of a
side effect of DOM order, on origins whose tie-breaking or concurrency
does not happen to favour arrival order. Whether Vercel's h2 stack
honours it is exactly the measurement left for the Vercel preview, as
anticipated: I cannot produce that number locally, and the CDP-throttled
figures above are the floor.

## Step 4: nothing else moved

Per-URL comparison of the before and after runs: identical request sets
(58 requests each; the only URL difference is the hashed JS bundle name),
and **every image URL transferred byte-identical bytes — 832,241 B of
images in both runs**. The only real byte change on the page is the JS
bundle growing 45 bytes (274,083 to 274,128) from the added attribute
logic; the small drift in the "total transferred" rows above is that
plus HTTP/2 frame-overhead noise in CDP's `encodedDataLength`, run to
run. No request added, none removed.

## Constraints check

No Norwegian text touched. No series sizing or `--list-case-h` touched.
No `discSource` touched. Open case, disc, cover swap, geometry,
transforms untouched — the diff is attribute plumbing in five component
files only. For the before-measurement a temporary revert of the three
`low` emissions was built to a scratch directory outside the repo; the
files were restored byte-identical afterwards (verified by diff).

## Typecheck

`npx tsc --noEmit` exits 0 (run after the change, and again after the
before-build restore). eslint on the touched files reports nothing.

## Files created or modified

- `src/components/CaseFrontFace.tsx`
- `src/components/FlatCase.tsx`
- `src/components/FlatJewelCase.tsx`
- `src/components/KeepCaseCard.tsx`
- `src/components/GameCard.tsx`
- `STAGE-6-REPORT.md` (this file)
- (`dist/` rebuilt by `npm run build`; measurement servers and scratch
  builds lived outside the repo)
