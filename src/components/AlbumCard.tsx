import JewelCase from './JewelCase'
import FlatJewelCase from './FlatJewelCase'
import { useCaseSequence } from './useCaseSequence'
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
 * (closed, no 3D subtree) and JewelCase (the full interactive object),
 * using the same useCaseSequence choreography KeepCaseCard uses for keep
 * cases. Every jewel case is one fixed size with no livery, so there's no
 * caseFormat/livery to pass through here, unlike Case's props.
 */
export default function AlbumCard({ entry, active, onActivate, onDeactivate }: AlbumCardProps) {
  const { open, enlarged, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    onDeactivate,
  })

  return (
    <div className="media-card">
      {showCase ? (
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
        />
      ) : (
        <FlatJewelCase
          title={entry.title}
          coverSrc={entry.cover}
          coverAlt={`${entry.title} cover`}
          onClick={onActivate}
          buttonRef={flatButtonRef}
        />
      )}
      <span className="media-card__rank">{entry.rank}</span>
    </div>
  )
}
