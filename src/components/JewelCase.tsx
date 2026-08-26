import { useEffect, useState, type CSSProperties, type KeyboardEvent, type RefObject } from 'react'
import Disc, { DISC_DIAMETER_MM } from './Disc'
import BurnedDisc from './BurnedDisc'
import { JEWEL_GEOMETRY } from './caseGeometry'
import type { DiscSource } from '../data/lists'
import './caseMechanism.css'
import './JewelCase.css'
import { ui } from '../i18n/ui'
import { useLanguage } from '../i18n/useLanguage'

// caseGeometry.ts's JEWEL_GEOMETRY: front face ratio 0.880. One fixed
// size, unlike Case.tsx's per-format table: every album is the same
// jewel case, so there is no format argument here to compute this from.
const { heightMm: HEIGHT_MM, widthMm: WIDTH_MM, depthMm: DEPTH_MM } = JEWEL_GEOMETRY
// Exported: FlatJewelCase.tsx needs the same ratio for its own closed
// placeholder and has no format table of its own to recompute it from.
export const FRONT_FACE_RATIO = WIDTH_MM / HEIGHT_MM
const DEPTH_RATIO = DEPTH_MM / HEIGHT_MM
// The same 120mm disc as every other case, reused from Disc.tsx rather
// than redeclared — in a 125mm panel, tighter than Blu-ray's ~4mm margin.
const DISC_TO_PANEL_RATIO = DISC_DIAMETER_MM / WIDTH_MM

interface JewelCaseProps {
  title: string
  coverSrc: string
  coverAlt: string
  /** Absent when discSource is 'burned' — BurnedDisc renders instead, no fetched image involved. */
  discSrc?: string
  discAlt?: string
  /** 'burned' selects BurnedDisc over a fetched Disc image; anything else, or absent, keeps the fetched disc. */
  discSource?: DiscSource
  /**
   * Controlled, not internal: a list of many cases needs exactly one open
   * at a time, which means the state that decides open/closed has to live
   * above whichever JewelCase currently exists — see AlbumsList. discOut
   * stays internal below, since JewelCase only ever mounts for the one
   * active entry and unmounting already clears it for free. Mirrors
   * Case.tsx exactly.
   */
  open: boolean
  onToggleOpen: () => void
  /**
   * Also controlled, also owned by the sequencing in AlbumCard: a case
   * grows to twice its list size before it opens, not at the same time.
   * Mirrors Case.tsx's own enlarged prop.
   */
  enlarged: boolean
  /**
   * The close sequence is running (useCaseSequence's own closing state).
   * Stamped on the root as data-closing so MediaList.css can slow the
   * margin release and stack a closing card correctly — the attribute
   * pair enlarged/open alone can't distinguish opening from closing.
   */
  closing?: boolean
  /** Focused once this mounts, if it's replacing a previous focus target. */
  toggleRef?: RefObject<HTMLButtonElement | null>
}

/**
 * A CD jewel case: closed, enlarged, open and disc-out states, the same
 * ones every other object has (docs/03-object-spec.md, Interactions) — no
 * livery, which nothing has asked for here yet. Hard clear plastic shell
 * and lid, opaque black tray and spine, sharp corners. The defining
 * material difference from Case.tsx's keep cases: a keep case's cover is
 * printed on the outside of opaque plastic, a jewel case's is a booklet
 * sitting behind a clear lid, so the poster renders under a gloss and
 * edge-refraction layer here instead of being the outer surface itself.
 */
export default function JewelCase({
  title,
  coverSrc,
  coverAlt,
  discSrc,
  discAlt,
  discSource,
  open,
  enlarged,
  closing = false,
  onToggleOpen,
  toggleRef,
}: JewelCaseProps) {
  const { language } = useLanguage()
  const [discOut, setDiscOut] = useState(false)
  // A closed case can't have a floating disc — same render-time invariant
  // as Case.tsx, watching the prop/state that actually gates it rather
  // than branching inside a toggle handler.
  if (!open && discOut) setDiscOut(false)

  // Both mirror Case.tsx exactly — see that component's own comments for
  // the full reasoning. slotAfterFront is the disc slot's DOM side,
  // managed so the reorder it drives never shares a commit with a
  // transition-starting style change (which teleported the lift and
  // snapped the closing lid); interiorOnTop defers the face swap past
  // the closing swing, so the mirrored booklet never paints on top of
  // the still-open leaf in engines that paint DOM order without
  // backface culling.
  const [slotAfterFront, setSlotAfterFront] = useState(false)
  useEffect(() => {
    if (!open || discOut || !slotAfterFront) return
    const id = setTimeout(() => setSlotAfterFront(false), 600) // return transition, caseMechanism.css
    return () => clearTimeout(id)
  }, [open, discOut, slotAfterFront])

  const [interiorOnTop, setInteriorOnTop] = useState(false)
  if (open && !interiorOnTop) setInteriorOnTop(true)
  useEffect(() => {
    if (open || !interiorOnTop) return
    const id = setTimeout(() => setInteriorOnTop(false), 600) // hinge duration, caseMechanism.css
    return () => clearTimeout(id)
  }, [open, interiorOnTop])

  const toggleDiscOut = () => {
    if (discOut) {
      setDiscOut(false)
    } else {
      // Two-phase lift, reorder first — Case.tsx's slotAfterFront comment
      // has the full reasoning.
      setSlotAfterFront(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setDiscOut(true)))
    }
  }

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

  const frontShell = (
    <div className="jewel-case__front-shell" key="front-shell">
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
  )

  /*
   * A direct child of the toggle, keyed so React moves this exact node
   * when its position in the children list changes below — before the
   * front leaf while the disc rests in the tray, after it while the disc
   * is out. Mirrors Case.tsx exactly; that component's own copy of this
   * comment has the full reasoning (engines that paint a preserve-3d
   * scene in DOM order instead of depth-sorting it).
   *
   * Same pattern as Case.tsx's disc slot otherwise: a role="button" div
   * nested in the case's own button, since a real <button> can't contain
   * another interactive element, with its own keyboard handling and
   * stopPropagation so lifting the disc doesn't also close the case.
   */
  const discSlot = (
    <div
      key="disc-slot"
      className={`jewel-case__disc-slot${discOut ? ' is-out' : ''}`}
      role="button"
      tabIndex={open ? 0 : -1}
      aria-hidden={!open}
      aria-pressed={discOut}
      aria-label={discOut ? ui[language].returnDisc : ui[language].liftDisc(title)}
      onClick={(event) => {
        if (!open) return
        event.stopPropagation()
        toggleDiscOut()
      }}
      onKeyDown={handleDiscKeyDown}
    >
      {discSource === 'burned' ? (
        <BurnedDisc title={title} medium="album" interactive={discOut} />
      ) : (
        <Disc src={discSrc ?? ''} alt={discAlt ?? ''} interactive={discOut} />
      )}
    </div>
  )

  return (
    <div className="jewel-case" data-open={open} data-enlarged={enlarged} data-closing={closing} style={style}>
      <button
        ref={toggleRef}
        type="button"
        className="jewel-case__toggle"
        aria-expanded={open}
        aria-label={open ? ui[language].closeCase(title) : ui[language].openCase(title)}
        onClick={onToggleOpen}
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
        </div>

        {!slotAfterFront && discSlot}

        <div className="jewel-case__front" key="front">
          {/*
           * The two faces swap DOM order with `open`, keyed so React
           * moves the nodes rather than remounting them — same reasoning
           * as Case.tsx's own front leaf: in engines that paint the 3D
           * scene in DOM order with no backface culling, the face that
           * should be showing has to paint last, the booklet while closed
           * and the clear back face while open. Engines that cull
           * correctly never show both at once, so the order is invisible
           * to them.
           */}
          {interiorOnTop && frontShell}
          {/* The same clear lid's back face, seen once the case is open —
              one moulded piece, not a second material. */}
          <div className="jewel-case__front-interior" aria-hidden="true" key="interior" />
          {!interiorOnTop && frontShell}
        </div>

        {slotAfterFront && discSlot}
      </button>

      <div className="jewel-case__shadow" aria-hidden="true" />
    </div>
  )
}
