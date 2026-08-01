import { useEffect, useRef, useState } from 'react'
import Case from './Case'
import FlatCase from './FlatCase'
import type { SupportedCaseFormat } from './caseGeometry'
import type { Entry } from '../data/lists'
import './FilmCard.css'

// Matches Case.css's own .case transition duration for --enlarge — the
// second stage of the sequence below waits this long before opening, so
// the hinge only starts once the grow has actually finished.
const ENLARGE_DURATION_MS = 1500

interface FilmCardProps {
  entry: Entry
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
}

/**
 * The switch between the two representations an entry can have: FlatCase
 * (closed, no 3D subtree) for every entry that isn't the list's one active
 * one, Case (the full interactive object) for the one that is. Which one
 * is active lives in FilmsList, not here — this only owns the small
 * choreography around the swap itself, plus the fixed-height slot and rank
 * number that wrap whichever one is showing.
 */
export default function FilmCard({ entry, active, onActivate, onDeactivate }: FilmCardProps) {
  const [enlarged, setEnlarged] = useState(false)
  const [open, setOpen] = useState(false)
  const caseToggleRef = useRef<HTMLButtonElement>(null)
  const flatButtonRef = useRef<HTMLButtonElement>(null)
  const prevActiveRef = useRef(active)

  // Render-time resets (not effects): all three only ever need to snap to
  // a value derived from props/the environment, which is synchronizing
  // React state with React state (or a plain synchronous browser query),
  // not with anything external like a timer.
  if (!active && open) setOpen(false)
  if (!active && enlarged) setEnlarged(false)
  // Reduced motion collapses the whole sequence to its end state
  // immediately on activation, rather than reaching it after two delays
  // whose animations have themselves been switched off — a user who's
  // asked for reduced motion shouldn't still wait through them.
  const prefersReducedMotion = active && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion && !enlarged) setEnlarged(true)
  if (prefersReducedMotion && !open) setOpen(true)

  // Case mounts small and closed, grows to twice its size, then opens —
  // the hinge only starts once it's already at full size, not at the same
  // time. This part is a real effect — it's coordinating with a timer, an
  // external API — unlike the resets above. setTimeout, not
  // requestAnimationFrame: rAF is tied to the paint cycle and simply
  // doesn't fire while the tab is backgrounded or otherwise not actively
  // compositing (confirmed directly, earlier in this same choreography
  // before it grew a second stage), which a user very plausibly could be
  // the instant after they click something. setTimeout keeps firing
  // regardless. Closing is not the reverse of this — see onToggleOpen
  // below — it deactivates immediately rather than animating a shrink and
  // close before unmounting.
  useEffect(() => {
    if (!active || prefersReducedMotion) return
    const enlargeId = setTimeout(() => setEnlarged(true), 50)
    return () => clearTimeout(enlargeId)
  }, [active, prefersReducedMotion])

  useEffect(() => {
    if (!active || !enlarged || prefersReducedMotion) return
    const openId = setTimeout(() => setOpen(true), ENLARGE_DURATION_MS)
    return () => clearTimeout(openId)
  }, [active, enlarged, prefersReducedMotion])

  // Focus follows the swap in both directions. Without this, activating
  // or deactivating a card (mouse or keyboard) drops focus to <body> the
  // instant the DOM node it was on unmounts.
  useEffect(() => {
    const wasActive = prevActiveRef.current
    prevActiveRef.current = active
    if (active && !wasActive) {
      caseToggleRef.current?.focus()
    } else if (!active && wasActive) {
      flatButtonRef.current?.focus()
    }
  }, [active])

  return (
    <div className="film-card">
      {active ? (
        <Case
          title={entry.title}
          coverSrc={entry.cover}
          coverAlt={`${entry.title} cover`}
          discSrc={entry.disc}
          discAlt={`${entry.title} disc`}
          caseFormat={entry.case as SupportedCaseFormat}
          livery={entry.livery}
          open={open}
          enlarged={enlarged}
          onToggleOpen={() => {
            if (open) {
              onDeactivate()
            } else {
              // A manual click while the sequence is still mid-flight
              // (before its own timers have fired) skips straight to the
              // end state instead of opening a still-small case out from
              // under an enlarge that hasn't finished yet.
              setEnlarged(true)
              setOpen(true)
            }
          }}
          toggleRef={caseToggleRef}
        />
      ) : (
        <FlatCase
          title={entry.title}
          coverSrc={entry.cover}
          coverAlt={`${entry.title} cover`}
          // Films only ever use dvd/bluray (docs/04-lists.md) — the same
          // restriction Case itself is scoped to.
          caseFormat={entry.case as SupportedCaseFormat}
          livery={entry.livery}
          onClick={onActivate}
          buttonRef={flatButtonRef}
        />
      )}
      <span className="film-card__rank">{entry.rank}</span>
    </div>
  )
}
