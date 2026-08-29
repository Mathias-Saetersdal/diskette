# Stage 9 report: the late disc

## Step 1: diagnosis

### When the gate flips, what it gates, what src is before

The flag is now named `openAssetsRequested` (stage 4 renamed
`discRequested` when the full cover joined it). It flips by a render-time
cut, `if (open && !openAssetsRequested) setOpenAssetsRequested(true)`
(`src/components/Case.tsx:246-247`; the jewel twin at
`src/components/JewelCase.tsx:116-117`), so it rises in the same render
that `open` does and never falls. It gates two things: the disc's src —
`<Disc src={openAssetsRequested ? (discSrc ?? '') : ''} ...>`
(`Case.tsx:360`, `JewelCase.tsx:246`) — and the full-cover upgrade
(`Case.tsx:333`). Before it flips, the disc element's src is the empty
string, and `Disc`'s effect returns immediately on empty src
(`src/components/Disc.tsx:284`): no request exists at all until `open`.

### Mounting

The disc slot and the `Disc` component inside it are mounted for the
whole life of the `Case`, from the click-time swap onward — the slot is
deliberately never conditionally unmounted (`Case.tsx:302-305`, the
paint-order comment). What is NOT in the DOM until later is the `<img>`
inside `DiscShell`: `Disc` renders it only once its decoded object URL
state is set (`Disc.tsx:301`). So the img mounts one commit after the
src arrives *and* the load resolves; it does not unmount or remount
after that. No unmount/remount cycle exists during opening.

### Computed values at three points (read live, production build, foreground page)

Sampled per animation frame via `getComputedStyle` on
`.case__disc-slot`, cold and cached runs, localhost:

| Point | visibility | opacity | display | transform | backface-visibility |
|---|---|---|---|---|---|
| at click (~30 ms) | **hidden** | 1 | block | translate matrix, no rotation | visible |
| mid-swing (open+300 ms) | visible | 1 | block | same translate matrix | visible |
| settled (open+1200 ms) | visible | 1 | block | same translate matrix | visible |

The `hidden` at click is `.case[data-open='false'] .case__disc-slot
{ visibility: hidden }` (`caseMechanism.css:330-337`) — a shut case
paints no disc, by design. On the `data-open` flip the closed rule stops
matching and visibility returns **instantly** (the 0.55s delay in that
rule's transition list applies on the way to hidden, for closing; the
open-state rule carries no visibility transition). Measured: the slot
computes `visible` on the same sampled frame `data-open` first reads
true, both runs.

### Full open-sequence timing (measured, localhost)

| Event | Elapsed from click |
|---|---|
| Case mounts (flat card swaps out) | ~13 ms |
| `data-enlarged` flips (scroll-settle fallback + enlarge starts) | ~518 ms |
| enlarge runs (`--enlarge-duration`, caseMechanism.css) | 1,500 ms |
| `data-open` flips, hinge starts (0.6 s swing) | ~2,020 ms |
| disc slot computes visible | same frame as `data-open` |
| interior first visible to the user | ~2,050-2,200 ms (lid clears the tray's disc centre once past ~60 deg, ~0.2 s into the swing) |

The ~518 ms is `SCROLL_SETTLE_FALLBACK_MS` (500) in
`useCaseSequence.ts:22,192` — enlarge waits for scroll settle; then the
1.5 s enlarge timer (`useCaseSequence.ts:218`) fires `setOpen`.

### Layers and backfaces

The disc slot is a direct child of the toggle's preserve-3d space at
`translateZ(1px)` over the tray plane (`caseMechanism.css:297-314`); the
tray face and the disc share the same 3D context and neither sits behind
the swinging lid's backface: the lid's own backface handling
(`caseMechanism.css`'s `.case__front-art` visibility swap at 0.17/0.2 s)
affects the cover face only. `backface-visibility` computes `visible` on
the slot throughout. Screenshots taken through a cached swing confirm
the render: at open+30 ms the disc is already painted in the tray behind
the lifting lid, and by open+280 ms it is fully revealed.

### So what causes bug 2

Two candidates fit the report; the measurements separate them:

1. **Request timing (confirmed).** The request starts only when `open`
   flips, ~2 s after click. Any latency puts the landing inside or after
   the 0.6 s swing: stage 3 measured the disc arriving 1,260 ms after
   `open` under Slow 4G — after the swing has ended. And "even when
   cached" fits the same cause: until stage 8a's vercel.json deploys,
   every asset is served `max-age=0, must-revalidate`, so an HTTP-cached
   disc still pays one conditional-request round trip after `open` flips
   — hundreds of ms against a 600 ms swing. Only the same-session module
   cache (reopening without a reload) avoids the network, and that path
   measures clean: img mounted, complete and painted on the first open
   frame.
2. **Paint/occlusion (rejected by evidence).** Computed visibility,
   opacity, transform and backface are all permissive from the first
   open frame; screenshots show the disc painted 30 ms into the swing
   when the data is local. There is no CSS delay, no backface hiding, no
   paint-order gap on the opening path.

The distinguishing test, for the record: reopen the same case without
reloading (module cache) — disc present from frame one; reload the page
and open with a warm HTTP cache — disc late by one RTT. That is the
signature of cause 1 and cannot be produced by cause 2.

## Step 2: the bug 1 fix

The disc request now leaves at click, in the same tick the interaction
begins. Each card's activate handler warms the shared cache before
signalling activation:

```tsx
const activate = () => {
  if (discFull) loadDecodedImage(discFull).catch(() => {})
  onActivate()
}
```

(`KeepCaseCard.tsx`, `GameCard.tsx`, `AlbumCard.tsx`; `discFull` is
`derivedAsset(entry.disc).full`, computed once and reused for the Case
prop.) Everything downstream is unchanged: `Disc` still receives its src
only at `open` and reads the same module cache, so loaded-once-stays-
loaded, no refetch on reopen, no blocking of the hinge, and silent
failure with an empty tray all hold. Still the `.full.webp` derivative;
no preload of any kind for unclicked cases (the warm fires inside the
click handler only); burned entries have no `disc` field and skip it.
The choreography is untouched.

Measured with the step 1 method (fresh page per run, cache disabled,
production build):

| Condition | Disc request leaves | `data-open` flips | Disc decoded and paintable |
|---|---|---|---|
| No throttling | click + 6 ms | click + 2,028 ms | click + 2,028 ms (first open frame) |
| Slow 4G (562.5 ms RTT) | click + 5 ms | click + 2,024 ms | click + 2,024 ms (first open frame) |

The network now runs entirely inside the choreography's own ~2 s: even
Slow 4G's ~1.2 s fetch finishes ~0.8 s before the interior can be seen.
Click-to-disc-paint equals click-to-open in both conditions; before the
fix, Slow 4G put the disc 1,260 ms *after* open (stage 3).

## Step 3: bug 2, what the fix would be

Nothing separate remains to fix. The named cause of bug 2 is the same
request timing bug 1 had — there is no paint-order, transform,
backface-visibility or 3D-hierarchy defect to repair, and I am not
proposing any change to those. Two residues, for completeness:

- On a connection where RTT plus transfer exceeds the ~2 s between click
  and open, the disc can still land mid-swing. The only mitigations
  would be delaying the hinge on the decode or preloading before click —
  both against this task's own rules, and not recommended.
- Deploying stage 8a's `vercel.json` removes the `max-age=0`
  revalidation round trip that made the "even cached" case visible in
  the first place; it is already written and waiting.

## Constraints check

No Norwegian text, series sizing, `--list-case-h` or `discSource`
touched. No geometry or transform changed — the diff is three card
files, click-handler and comment lines only.

## Typecheck

`npx tsc --noEmit` exits 0 after every change; eslint on the three
touched files reports nothing.

## Files created or modified

- `src/components/KeepCaseCard.tsx`
- `src/components/GameCard.tsx`
- `src/components/AlbumCard.tsx`
- `STAGE-9-REPORT.md` (this file)
- (`dist/` rebuilt for the measurements)
