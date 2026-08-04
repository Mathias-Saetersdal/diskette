import { useContext } from 'react'
import { createPortal } from 'react-dom'
import JewelCase from './JewelCase'
import FlatJewelCase from './FlatJewelCase'
import { useCaseSequence } from './useCaseSequence'
import { ActivePortalContext } from './ActivePortal'
import type { Entry } from '../data/lists'
// The layout rules (case, then a rank number below it, bottom-aligned as
// one stack) have nothing case-shape-specific in them, so they live in
// their own medium-neutral file rather than KeepCaseCard's — this is a
// jewel case, not a keep case, and importing something named after the
// other geometry here would be exactly the kind of misleading reuse
// KeepCaseCard itself was renamed to stop being.
import './MediaCard.css'

interface AlbumCardProps {
  entry: Entry
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
}

/**
 * The album equivalent of KeepCaseCard: the switch between FlatJewelCase
 * (closed, at the row's own rest tilt) and JewelCase (the full
 * interactive object, portaled in for whichever entry is active), using
 * the same useCaseSequence choreography KeepCaseCard uses for keep
 * cases. Every jewel case is one fixed size with no livery, so there's no
 * caseFormat/livery to pass through here, unlike Case's props —
 * spineTone is the one exception, the same per-entry hand-picked colour
 * keep cases already use for their own printed insert.
 *
 * The albums row scrolls horizontally now (build plan stage 8), which is
 * what makes the portal necessary here, not just for GameCard: overflow
 * -x: auto forces overflow-y: auto along with it (MediaList.css), which
 * clips anything inside the row taller than its own resting height —
 * exactly what the active JewelCase is, by design, once it enlarges or
 * opens.
 */
export default function AlbumCard({ entry, active, onActivate, onDeactivate }: AlbumCardProps) {
  const { open, enlarged, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    onDeactivate,
  })
  const portalTarget = useContext(ActivePortalContext)

  return (
    <div className="media-card">
      <FlatJewelCase
        title={entry.title}
        coverSrc={entry.cover}
        coverAlt={`${entry.title} cover`}
        onClick={onActivate}
        buttonRef={flatButtonRef}
        spineTone={entry.spineTone}
        hidden={showCase}
      />
      {showCase &&
        portalTarget &&
        createPortal(
          <JewelCase
            title={entry.title}
            coverSrc={entry.cover}
            coverAlt={`${entry.title} cover`}
            discSrc={entry.disc}
            discAlt={`${entry.title} disc`}
            discSource={entry.discSource}
            open={open}
            enlarged={enlarged}
            onToggleOpen={onToggleOpen}
            toggleRef={caseToggleRef}
          />,
          portalTarget,
        )}
      <span className="media-card__rank">{entry.rank}</span>
    </div>
  )
}
