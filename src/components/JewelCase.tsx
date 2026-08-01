import { useState, type CSSProperties, type KeyboardEvent, type RefObject } from 'react'
import Disc, { DISC_DIAMETER_MM } from './Disc'
import './caseMechanism.css'
import './JewelCase.css'

// docs/03-object-spec.md Cases table: CD jewel case, 142 x 125 x 10mm,
// front face ratio 0.880. One fixed size, unlike Case.tsx's per-format
// table: every album is the same jewel case, so there is no format
// argument here to compute this from.
const HEIGHT_MM = 142
const WIDTH_MM = 125
const DEPTH_MM = 10
const FRONT_FACE_RATIO = WIDTH_MM / HEIGHT_MM
const DEPTH_RATIO = DEPTH_MM / HEIGHT_MM
// The same 120mm disc as every other case, reused from Disc.tsx rather
// than redeclared — in a 125mm panel, tighter than Blu-ray's ~4mm margin.
const DISC_TO_PANEL_RATIO = DISC_DIAMETER_MM / WIDTH_MM

interface JewelCaseProps {
  title: string
  coverSrc: string
  coverAlt: string
  discSrc: string
  discAlt: string
  /** Uncontrolled initial state, so two instances can sit side by side
      showing both closed and open without either being forced afterward. */
  defaultOpen?: boolean
  /** Focused once this mounts, if it's replacing a previous focus target. */
  toggleRef?: RefObject<HTMLButtonElement | null>
}

/**
 * A CD jewel case: closed, open and disc-out states, the same three every
 * other object has (docs/03-object-spec.md, Interactions) — no enlarge
 * stage or livery, which nothing has asked for here yet. Hard clear
 * plastic shell and lid, opaque black tray and spine, sharp corners. The
 * defining material difference from Case.tsx's keep cases: a keep case's
 * cover is printed on the outside of opaque plastic, a jewel case's is a
 * booklet sitting behind a clear lid, so the poster renders under a gloss
 * and edge-refraction layer here instead of being the outer surface
 * itself.
 *
 * Not wired into any list — self-contained open state, uncontrolled,
 * since nothing outside needs to coordinate it with sibling objects yet.
 */
export default function JewelCase({
  title,
  coverSrc,
  coverAlt,
  discSrc,
  discAlt,
  defaultOpen = false,
  toggleRef,
}: JewelCaseProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [discOut, setDiscOut] = useState(false)
  // A closed case can't have a floating disc — same render-time invariant
  // as Case.tsx, watching the prop/state that actually gates it rather
  // than branching inside a toggle handler.
  if (!open && discOut) setDiscOut(false)

  const toggleDiscOut = () => setDiscOut((was) => !was)

  const handleDiscKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      toggleDiscOut()
    }
  }

  const style = {
    '--front-face-ratio': FRONT_FACE_RATIO,
    '--depth-ratio': DEPTH_RATIO,
    '--disc-ratio': DISC_TO_PANEL_RATIO,
  } as CSSProperties

  return (
    <div className="jewel-case" data-open={open} style={style}>
      <button
        ref={toggleRef}
        type="button"
        className="jewel-case__toggle"
        aria-expanded={open}
        aria-label={`${open ? 'Close' : 'Open'} case: ${title}`}
        onClick={() => setOpen((was) => !was)}
      >
        {/* Opaque black plastic, blank — the reference photos show no
            printed spine insert, unlike a keep case's own paper spine. */}
        <div className="jewel-case__spine" aria-hidden="true" />

        <div className="jewel-case__tray-unit">
          {/*
           * The clear outer shell, full panel size. The black tray
           * (below) insets into it with a visible clear margin all
           * round — the rim the reference photos show around the tray,
           * not a tray that fills the whole panel.
           */}
          <div className="jewel-case__tray-shell" aria-hidden="true" />
          <div className="jewel-case__tray">
            {/* A moulded guide at the disc's own footprint, not a
                textured ring — jewel trays are close to flat, unlike a
                keep case's raised, tabbed rim. */}
            <div className="jewel-case__tray-guide" aria-hidden="true" />
            {/*
             * The multi-pronged clip a CD actually clips onto, not a
             * DVD-style PUSH boss — sized and positioned from the
             * reference photos, not the object spec, which doesn't give
             * this a figure.
             */}
            <div className="jewel-case__tray-rosette" aria-hidden="true" />
            {/* The two circular reliefs at the tray's bottom corners
                where a finger reaches under the disc's edge to lift it. */}
            <div className="jewel-case__tray-relief jewel-case__tray-relief--left" aria-hidden="true" />
            <div className="jewel-case__tray-relief jewel-case__tray-relief--right" aria-hidden="true" />
          </div>
          {/*
           * A sibling of .jewel-case__tray, not nested inside it: the
           * tray's own 5% inset is symmetric, so centring against the
           * full tray-unit box lands the resting disc in the same place
           * either way, but the lifted position below only lands at the
           * whole open case's true horizontal midpoint (Case.css's own
           * disc-slot lives at this same level, for the same reason).
           *
           * Same pattern as Case.tsx's disc slot otherwise: a
           * role="button" div nested in the case's own button, since a
           * real <button> can't contain another interactive element,
           * with its own keyboard handling and stopPropagation so
           * lifting the disc doesn't also close the case.
           */}
          <div
            className={`jewel-case__disc-slot${discOut ? ' is-out' : ''}`}
            role="button"
            tabIndex={open ? 0 : -1}
            aria-hidden={!open}
            aria-pressed={discOut}
            aria-label={discOut ? 'Return disc to tray' : `Lift ${title} disc`}
            onClick={(event) => {
              if (!open) return
              event.stopPropagation()
              toggleDiscOut()
            }}
            onKeyDown={handleDiscKeyDown}
          >
            <Disc src={discSrc} alt={discAlt} interactive={discOut} />
          </div>
        </div>

        <div className="jewel-case__front">
          <div className="jewel-case__front-shell">
            {/*
             * The booklet, inset from the clear shell's own edge so that
             * edge stays visible as a margin around it, per the brief:
             * the cover sits under the lid, not printed on it.
             */}
            <div className="jewel-case__front-poster">
              <img src={coverSrc} alt={coverAlt} />
              <div className="jewel-case__front-refraction" aria-hidden="true" />
            </div>
            <div className="jewel-case__front-gloss" aria-hidden="true" />
          </div>
          {/* The same clear lid's back face, seen once the case is open —
              one moulded piece, not a second material. */}
          <div className="jewel-case__front-interior" aria-hidden="true" />
        </div>
      </button>

      <div className="jewel-case__shadow" aria-hidden="true" />
    </div>
  )
}
