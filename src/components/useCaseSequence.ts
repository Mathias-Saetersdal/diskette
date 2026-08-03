import { useEffect, useRef, useState } from 'react'

// Matches caseMechanism.css's own --enlarge-duration — the second stage of
// the opening sequence waits this long before opening, so the hinge only
// starts once the grow has actually finished. Closing waits the same
// length for the shrink step, in reverse.
const ENLARGE_DURATION_MS = 1500

// Matches caseMechanism.css's own .case__front / .jewel-case__front
// transition duration for the hinge. Closing waits this long for the lid
// to finish swinging shut before it starts shrinking.
const HINGE_DURATION_MS = 600

interface UseCaseSequenceArgs {
  active: boolean
  onDeactivate: () => void
  /**
   * Games row only (GameCard passes true; every other caller omits it,
   * getting today's exact instant swap). Delays showCase's own rising edge
   * by SHOW_CASE_DELAY_MS after activation, instead of it flipping true in
   * the same render active does — see the comment on showCase below for
   * why the games row specifically needs that gap and no other list does.
   */
  delayShowCase?: boolean
}

// Shorter than the enlarge effect's own 50ms activation delay, so the full
// case has already mounted and painted its closed pose by the time that
// timer fires and the enlarge actually starts — the ordering this delay
// exists to guarantee, not just an arbitrary small number.
const SHOW_CASE_DELAY_MS = 30

/**
 * The enlarge/open/close choreography shared by every card that swaps
 * between a flat closed placeholder and a full 3D case: mount small and
 * closed, grow, then open — and the exact reverse on deactivation, staying
 * mounted as the full case for the reversal's real duration rather than
 * swapping back the instant each step is triggered. Extracted from
 * KeepCaseCard.tsx (then still named FilmCard.tsx) once AlbumCard needed
 * the identical sequence for a jewel case: none of this logic ever
 * referenced Case specifically, only open/enlarged/closing state and
 * focus handoff between two refs the caller owns.
 */
export function useCaseSequence({ active, onDeactivate, delayShowCase = false }: UseCaseSequenceArgs) {
  const [enlarged, setEnlarged] = useState(false)
  const [open, setOpen] = useState(false)
  // Whether the swap from the flat placeholder to the full case has
  // actually fired yet, on the activation side only. Separate from
  // showCase itself (below), which also has to answer for closing.
  const [showCaseNow, setShowCaseNow] = useState(false)
  // Tracks the close sequence's own lifetime, separately from open and
  // enlarged: those two reach their end state (false) the instant each
  // step is triggered, not when it's finished playing. Deriving showCase
  // from open/enlarged directly (an earlier version did this) meant the
  // card swapped back to the flat placeholder the moment the shrink was
  // requested, not 1.5s later when it actually finished — a jump instead
  // of a transition, because the element hosting the transition was
  // destroyed before it ever got a frame to animate. closing stays true
  // for the sequence's full real duration instead.
  const [closing, setClosing] = useState(false)
  const caseToggleRef = useRef<HTMLButtonElement>(null)
  const flatButtonRef = useRef<HTMLButtonElement>(null)
  const prevShowCaseRef = useRef(active)

  // Not gated on active: it needs to answer "is reduced motion on" during
  // closing too, when active is already false.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Render-time cuts (not effects): all synchronize React state with
  // either a plain synchronous browser query or with nothing but React
  // state, not with anything external like a timer.
  //
  // Reduced motion collapses each direction straight to its end state,
  // closing included — there's no sequence to wait through, so nothing
  // should still be mounted a moment later.
  if (active && prefersReducedMotion && !enlarged) setEnlarged(true)
  if (active && prefersReducedMotion && !open) setOpen(true)
  if (!active && prefersReducedMotion && (open || enlarged || closing)) {
    setOpen(false)
    setEnlarged(false)
    setClosing(false)
  }
  // showCaseNow's rising edge: instant for every caller except a delayed
  // one under real motion — which is every caller today except the games
  // row (delayShowCase defaults to false) and every caller once reduced
  // motion is on (there's no gap to hold open at all, matching the cuts
  // above). The one case that's genuinely NOT instant — delayShowCase
  // true, real motion — is left to the effect below instead.
  if (active && (!delayShowCase || prefersReducedMotion) && !showCaseNow) setShowCaseNow(true)
  // Falling edge, unconditional: closing (below) is what keeps the full
  // case mounted through the reverse animation's real duration regardless
  // of what this flag does, so this only has to answer "has the forward
  // swap begun," not "how long should the case stay around afterward."
  if (!active && showCaseNow) setShowCaseNow(false)
  // Reactivating cancels any close sequence still in flight, so a quick
  // reopen doesn't leave closing stuck true — which would otherwise block
  // the "closing begins" cut below from ever firing again on a later,
  // genuine deactivation.
  if (active && closing) setClosing(false)
  // Closing begins the moment there's something to reverse, independent
  // of how far the reversal has actually gotten — this is what keeps the
  // card mounted as the full case for the sequence's real duration (see
  // showCase below), not just until open/enlarged first flip.
  if (!active && !prefersReducedMotion && !closing && (open || enlarged)) setClosing(true)
  // Closing's first step, full motion: swing the lid shut. Unlike
  // opening's initial small delay before it starts enlarging (needed so a
  // freshly mounted case doesn't appear "born already open"), there's
  // nothing to wait for here — the case is already mounted and open, so
  // the swing can start on the very render that deactivates it. A no-op
  // if it deactivated mid-opening, before the hinge ever ran: open is
  // already false, so this doesn't fire.
  if (!active && !prefersReducedMotion && open) setOpen(false)

  // Case mounts small and closed, grows to twice its size, then opens —
  // the hinge only starts once it's already at full size, not at the same
  // time. This part is a real effect — it's coordinating with a timer, an
  // external API — unlike the cuts above. setTimeout, not
  // requestAnimationFrame: rAF is tied to the paint cycle and simply
  // doesn't fire while the tab is backgrounded or otherwise not actively
  // compositing, which a user very plausibly could be the instant after
  // they click something. setTimeout keeps firing regardless.
  useEffect(() => {
    if (!active || prefersReducedMotion) return
    const enlargeId = setTimeout(() => setEnlarged(true), 50)
    return () => clearTimeout(enlargeId)
  }, [active, prefersReducedMotion])

  // The one path the cut above leaves alone: delayShowCase true, real
  // motion. Holds the flat placeholder mounted a beat longer so the full
  // case has mounted and taken its closed pose — this timer fires before
  // the enlarge effect's own 50ms one does — rather than the two swapping
  // in the same render activation happens in. A reopen or a deactivation
  // before this fires cleans it up via the dependency change below; the
  // falling-edge cut above already reset showCaseNow synchronously in that
  // case, so there's nothing left for a late timer to do anyway.
  useEffect(() => {
    if (!active || !delayShowCase || prefersReducedMotion) return
    const showCaseId = setTimeout(() => setShowCaseNow(true), SHOW_CASE_DELAY_MS)
    return () => clearTimeout(showCaseId)
  }, [active, delayShowCase, prefersReducedMotion])

  useEffect(() => {
    if (!active || !enlarged || prefersReducedMotion) return
    const openId = setTimeout(() => setOpen(true), ENLARGE_DURATION_MS)
    return () => clearTimeout(openId)
  }, [active, enlarged, prefersReducedMotion])

  // Closing's second step: wait for the lid to finish swinging shut, then
  // shrink back down — the exact reverse of the two opening effects
  // above, same wait, same shrink, opposite order. Keyed on active alone
  // (with enlarged only as a "nothing left to undo" guard, not something
  // this should re-fire over): deactivating mid-opening, before the hinge
  // ever ran, still waits the same beat here rather than skipping it —
  // the front leaf's own transition is a no-op when open was already
  // false, so there's nothing visible to wait for either way, and folding
  // that distinction back out keeps this from depending on open at all.
  useEffect(() => {
    if (active || prefersReducedMotion || !enlarged) return
    const shrinkId = setTimeout(() => setEnlarged(false), HINGE_DURATION_MS)
    return () => clearTimeout(shrinkId)
  }, [active, enlarged, prefersReducedMotion])

  // Closing's third step: once the shrink has actually been given its
  // full duration to play, closing is finally done and the card can
  // safely swap back to the flat placeholder (showCase below) — this is
  // the wait that was missing before, the reason the shrink used to get
  // replaced by an instant jump the moment it started rather than after
  // it finished. Guarded on open/enlarged both being false, i.e. every
  // step of the reversal has actually fired, not just been requested.
  useEffect(() => {
    if (active || prefersReducedMotion || !closing || open || enlarged) return
    const finishId = setTimeout(() => setClosing(false), ENLARGE_DURATION_MS)
    return () => clearTimeout(finishId)
  }, [active, open, enlarged, closing, prefersReducedMotion])

  // Stays mounted as the full case for as long as it's the active entry
  // and showCaseNow has actually risen (immediately, unless delayShowCase
  // held it back a beat), or for as long as closing is still running its
  // full sequence — not just until open/enlarged first reach false, which
  // happens the instant each step is triggered rather than when it's
  // finished playing.
  const showCase = showCaseNow || closing

  // Focus follows the actual swap, in both directions — not the intent to
  // swap. Without this, activating a card drops focus to <body> the
  // instant the flat placeholder unmounts; keying deactivation off active
  // directly (rather than showCase) would try to focus a flat button that
  // hasn't mounted yet, since the close sequence keeps the full case
  // around for a while after active itself already went false.
  useEffect(() => {
    const wasShowingCase = prevShowCaseRef.current
    prevShowCaseRef.current = showCase
    if (showCase && !wasShowingCase) {
      caseToggleRef.current?.focus()
    } else if (!showCase && wasShowingCase) {
      flatButtonRef.current?.focus()
    }
  }, [showCase])

  const onToggleOpen = () => {
    // Ignored once deactivation has begun: the case is mid-close, still
    // mounted only so it can finish that animation, not a live control
    // any more. It becomes one again, fresh, the moment it remounts as
    // the flat placeholder.
    if (!active) return
    if (open) {
      onDeactivate()
    } else {
      // A manual click while the sequence is still mid-flight (before its
      // own timers have fired) skips straight to the end state instead of
      // opening a still-small case out from under an enlarge that hasn't
      // finished yet.
      setEnlarged(true)
      setOpen(true)
    }
  }

  return { open, enlarged, showCase, caseToggleRef, flatButtonRef, onToggleOpen }
}
