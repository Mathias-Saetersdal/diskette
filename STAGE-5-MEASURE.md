# Stage 5 measurement report

Report only. No code changed.

## Part A: spine colour delta

Method: the exact algorithm `useSpineColors` runs (32x32 resample, RGBA
read, per-channel quantisation with `Math.round(c/32)*32`, most-common
bucket wins), executed with sharp against both sources for all 40 covers.
One caveat on fidelity: the browser resamples with canvas `drawImage`,
sharp with Lanczos, so pixel-level kernels differ — but the step-32
quantisation absorbs most of that, and the figures below are the
algorithm's own output on each file.

Sampled colour is the winning (primary) bucket. Delta is derivative minus
original, per channel; distance is Euclidean over the three channels.

| Entry | Original | Derivative | ΔR,ΔG,ΔB | Distance |
|---|---|---|---|---|
| The Dark Knight | #002040 | #002020 | 0,0,-32 | 32.0 |
| Interstellar | #808080 | #808080 | 0,0,0 | 0 |
| Fight Club | #000000 | #000000 | 0,0,0 | 0 |
| The Matrix | #000000 | #002000 | 0,32,0 | 32.0 |
| Spider-Man 2 | #802020 | #802020 | 0,0,0 | 0 |
| Spirited Away | #000000 | #000000 | 0,0,0 | 0 |
| Blade Runner 2049 | #202020 | #202020 | 0,0,0 | 0 |
| This Is the End | #402020 | #402020 | 0,0,0 | 0 |
| Inception | #206080 | #206080 | 0,0,0 | 0 |
| Superbad | #ffffe0 | #ffe0e0 | 0,-32,0 | 32.0 |
| One Piece | #ffffff | #ffffff | 0,0,0 | 0 |
| Breaking Bad | #000000 | #000000 | 0,0,0 | 0 |
| Avatar: The Last Airbender | #202020 | #402020 | 32,0,0 | 32.0 |
| Game of Thrones | #202020 | #202020 | 0,0,0 | 0 |
| Invincible | #202040 | #202040 | 0,0,0 | 0 |
| Vinland Saga | #606060 | #606060 | 0,0,0 | 0 |
| Berserk | #000000 | #000000 | 0,0,0 | 0 |
| It's Always Sunny in Philadelphia | #ffa000 | #ffa000 | 0,0,0 | 0 |
| Eastbound & Down | #ffffff | #ffffff | 0,0,0 | 0 |
| South Park | #806040 | #806040 | 0,0,0 | 0 |
| Currents | #604060 | #606060 | 0,32,0 | 32.0 |
| Man on the Moon III: The Chosen | #402060 | #402060 | 0,0,0 | 0 |
| Astroworld | #a0c0c0 | #a0c0c0 | 0,0,0 | 0 |
| At.Long.Last.A$AP | #202020 | #202020 | 0,0,0 | 0 |
| Rommet | #a0a0a0 | #808080 | -32,-32,-32 | 55.4 |
| One of Wun | #404040 | #404040 | 0,0,0 | 0 |
| 2014 Forest Hills Drive | #404040 | #404040 | 0,0,0 | 0 |
| The Life of Pablo | #ff8060 | #ff8060 | 0,0,0 | 0 |
| DAMN. | #e0e0e0 | #e0e0e0 | 0,0,0 | 0 |
| Konnichiwa | #e0e0e0 | #e0e0e0 | 0,0,0 | 0 |
| Elden Ring | #202020 | #202020 | 0,0,0 | 0 |
| Call of Duty: Black Ops II | #000000 | #000000 | 0,0,0 | 0 |
| Sly 3: Honor Among Thieves | #000000 | #000000 | 0,0,0 | 0 |
| Lego Star Wars: The Complete Saga | #000000 | #000000 | 0,0,0 | 0 |
| Call of Duty: Black Ops III | #000000 | #000000 | 0,0,0 | 0 |
| Elden Ring Nightreign | #404060 | #404060 | 0,0,0 | 0 |
| Dark Souls III | #202000 | #202000 | 0,0,0 | 0 |
| Rocket League | #ffffff | #ffffff | 0,0,0 | 0 |
| Grand Theft Auto V | #c0c0c0 | #c0c0c0 | 0,0,0 | 0 |
| Cuphead | #ffc000 | #ffc000 | 0,0,0 | 0 |

- **Identical primaries: 34 of 40.**
- **Largest delta: Rommet, #a0a0a0 to #808080, distance 55.4** — one
  quantisation step down on all three channels, still the same grey.
- **Mean delta across all 40: 5.39** (Euclidean, out of a possible 441).
- Every non-zero delta is exactly one 32-step bucket flip in one to three
  channels; on the actual spine these primaries are then multiplied by
  0.55 before painting, roughly halving the visible difference again.
- The secondary colour (the gradient's second stop) moves more: mean
  distance 27.86, worst 186.6 (Elden Ring Nightreign). The secondary is
  chosen as "first bucket more than 60 away from the primary", a
  tie-break that flips to a different candidate bucket easily; its share
  of the painted spine is the darkened tail of a vertical gradient.

## Part B: production measurement under throttling

`npm run build` ran clean — the notes gate passed ("All notes and the
intro are filled in, in both languages"), so nothing was bypassed. Bundle:
274.07 kB JS (82.17 kB gzip), 39.99 kB CSS (8.10 kB gzip). Measured
against `vite preview` on port 4173, foreground headless Chrome, 1440x900,
HTTP cache disabled. Ten covers (the films row) sit above the fold at this
viewport; all 40 covers load at rest since the page height sits inside
Chrome's lazy-load distance thresholds. Times are from navigation start to
the img's `decode()` promise resolving. Emulated conditions are the Chrome
DevTools presets: Fast 4G = 9 Mbps down, 1.5 Mbps up, 165 ms RTT; Slow 4G
= 1.6 Mbps down, 750 kbps up, 562.5 ms RTT.

| Condition | Last above-fold cover decoded | Last cover on page decoded | Total transferred at rest |
|---|---|---|---|
| No throttling | 258 ms | 302 ms | 971,869 B |
| Fast 4G | 1,325 ms | 2,344 ms | 970,063 B |
| Slow 4G | 5,301 ms | 8,400 ms | 970,063 B |

Of the ~970 kB total, images are 857,639 B; the rest is JS, CSS and
fonts. Compression on the WebP files: none — the responses carry
`content-type: image/webp` and no `content-encoding` header. `vite
preview` serves them identity-encoded, which is correct: WebP is already
internally compressed (VP8/VP8L) and a transfer encoding on top would
add CPU for no byte savings. The gzip in the build output applies to JS
and CSS only.

Open one case (The Dark Knight) under Slow 4G:

| Gap | Time |
|---|---|
| Click to case open (choreography: enlarge then hinge) | 2,357 ms |
| Click to full cover swap landing | 3,538 ms |
| Click to disc appearing | 3,617 ms |

The open-state requests start when `open` flips (about 2.4 s after the
click under this RTT), so the network gap proper is roughly 1.2 s for the
cover and 1.3 s for the disc, both in flight in parallel, landing about a
second after the hinge finishes. The face carries the list asset and the
interaction never blocks.

## Part C: back images

Confirmed: no entry in `src/data/lists.ts` sets a `back` path (zero
`back:` fields), and no component references the backdrop files (the only
matches for "backdrop" in `src/` are the generated JSON's records). The 20
`backdrop.jpg` originals came in with the fetch pipeline and sit unused.

What derive-assets spends on them:

- Originals: 20 files, 3,554,611 bytes (committed, and staying — the
  fetch-once rule).
- Derivatives produced: 40 files (20 list + 20 full), 665,476 bytes,
  git-ignored, plus 20 records in `assets.generated.json` that nothing
  reads.
- Time per build run: a normal `npm run build` triggers the idempotent
  path, where all 97 originals skip on mtime — the whole derive step took
  0.24 s wall, of which the backdrops cost effectively nothing. A cold or
  `--force` regeneration spends measurably on them: `--force
  --only=backdrop` took 1.39 s wall (about 1.1 s of encoding after tsx
  startup), which is the per-build cost only when derivatives are rebuilt
  from scratch (fresh checkout, CI without the ignored `derived/` tree,
  or `--force`).

So the standing cost is: ~0.67 MB of ignored derivative output, ~1.1 s on
every cold build, and 20 dead records, for images no entry can currently
display.

## Files created or modified

- `STAGE-5-MEASURE.md` (this file)

No code, data, or config was touched. The derive-assets runs above only
regenerated git-ignored derivatives and rewrote `assets.generated.json`
with identical content (`git status` unchanged for tracked files beyond
what earlier stages already list).
