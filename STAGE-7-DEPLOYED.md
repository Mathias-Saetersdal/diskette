# Stage 7 report: the deployed origin

Target: https://diskette-two.vercel.app. Report only, no code changed.

## Step 1: the derivatives exist and are served

All 194 derivative URLs in `assets.generated.json` (97 list + 97 full)
were requested against the deployed origin: **194 returned 200, zero
returned anything else.** No failing URLs.

The three sampled originals are also served:

| Path | Status |
|---|---|
| /assets/film/the-dark-knight/cover.png | 200 |
| /assets/film/the-dark-knight/disc.png | 200 |
| /assets/film/the-dark-knight/backdrop.jpg | 200 |

So the 165 MB of committed originals ships in the deployment and is
publicly reachable. Nothing on the page requests them (step 5), but they
cost deploy size and are fetchable by URL.

## Step 2: transport and headers

| | cover.list.webp | index-Blk0qfMV.js |
|---|---|---|
| HTTP version | HTTP/2 | HTTP/2 |
| content-encoding | none | br |
| cache-control | public, max-age=0, must-revalidate | public, max-age=0, must-revalidate |
| content-length / transfer | 15,752 B | 82,406 B (br); 274,128 B identity |

Both expectations hold: the WebP goes out identity-encoded (it is
already compressed internally) and the JS goes out brotli at 30% of its
raw size. No alt-svc header is sent, so Chrome stays on h2 — no HTTP/3
upgrade on this origin.

One observation outside the asked list, flagged because it costs real
RTTs: **every asset, hashed filenames included, is served with
`max-age=0, must-revalidate`.** The hashed JS/CSS and the derived WebPs
are immutable by construction, and on Slow 4G every revisit pays a
revalidation round trip per asset. Worth a Vercel header rule when
convenient; not this task's scope.

### Does the RFC 9218 signal survive to the edge?

Yes, and it visibly drives response ordering. Three unthrottled runs
against the real origin, cache disabled, recording the order in which
the 40 cover responses completed (all on h2):

| Run | Films-row covers in first 10 finishers | Mean finish rank, films row | Mean finish rank, demoted 30 |
|---|---|---|---|
| 1 | 7 of 10 | 5.5 | 24.2 |
| 2 | 9 of 10 | 6.1 | 24.0 |
| 3 | 9 of 10 | 6.1 | 24.0 |

The ten `u=1` covers complete around rank 6 of 40; the thirty urgency-3
covers around rank 24, in every run. The ordering tracks the urgency
values: Vercel's edge honours the priority signal stage 6 put on the
wire. (On this fast local link the whole cover set completes within
~100-210 ms, so the win is ordering, not seconds; the seconds show up on
slow links, which CDP throttling cannot model — stage 6's finding.)

## Step 3: Lighthouse

Mobile preset, default simulated Slow 4G throttling (150 ms RTT,
1,638 kbps, 4x CPU), three runs, per-metric medians. Performance score
0.97-0.98 across runs.

| Metric | Median |
|---|---|
| LCP | 2,350 ms |
| FCP | 1,372 ms |
| TTFB | 625 ms simulated (observed server-response-time: 17 ms) |
| TBT | 3 ms |
| CLS | 0.0022 |
| Total byte weight | 965,550 B |

**The LCP element is not an image.** Lighthouse identifies
`div#root > main.stage > section.intro > p.intro__paragraph` — the intro
text — as the LCP element at mobile size. The covers do not gate LCP at
all; LCP is TTFB plus render delay on a text node (breakdown: 82 ms
TTFB, 172 ms element render delay, the rest is the simulated JS
delivery). Byte weight by resource type, median run:

| Type | Requests | Transferred |
|---|---|---|
| image | 54 | 850,282 B |
| script | 1 | 82,633 B |
| font | 1 | 21,349 B |
| stylesheet | 1 | 8,931 B |
| other | 1 | 1,591 B |
| document | 1 | 775 B |
| total | 59 | 965,561 B |

## Step 4: the waterfall

Foreground headless Chrome, cache disabled, 375x812, CDP Slow 4G
(1.6 Mbps / 562.5 ms RTT), deployed origin. Absolute times from
navigation start:

| Event | Time |
|---|---|
| HTML response complete | 878 ms |
| JS bundle response complete | 1,954 ms |
| First cover request start | 1,988 ms |
| Last above-fold cover decode complete | 7,000 ms |
| Last cover on page decode complete | 7,213 ms |

The number asked for: **the covers start 1,110 ms after the HTML has
fully arrived**, and 34 ms after the JS bundle lands. The gap is almost
entirely the brotli'd 82 kB bundle's transfer plus one RTT — the covers
are React-rendered `<img>` elements, so none can be discovered until the
bundle executes. The 34 ms JS-to-first-request gap says parse/execute
adds nearly nothing; the wait is delivery. No image work can shrink the
1,110 ms — only earlier discovery could (preload hints in the HTML, or
markup the scanner can see), which is a design decision beyond this
report.

Decode-time caveat carried from stage 6: under CDP throttling the
emulator shares bandwidth round-robin across active requests, so the
7,000 ms above-fold figure is the no-priority floor; the edge-side
reordering confirmed in step 2 cannot register here.

## Step 5: nothing leaked

Every request the deployed page makes outside `/assets/derived/` and
`/assets/marks/`:

- `/assets/index-Blk0qfMV.js`
- `/assets/index-ykeHz9k3.css`
- `/assets/lora-latin-400-normal-DnxXpLNu.woff2`

That is the Vite bundle itself, which shares the `/assets/` prefix by
outDir convention. **Zero media files outside derived and marks: no
original PNG or JPG is requested by any component in production.** The
lookup holds end to end.

## Files created or modified

- `STAGE-7-DEPLOYED.md` (this file)
