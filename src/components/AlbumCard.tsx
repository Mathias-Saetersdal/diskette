import JewelCase from './JewelCase'
import FlatJewelCase from './FlatJewelCase'
import { useCaseSequence } from './useCaseSequence'
import type { Entry } from '../data/lists'
// Reuses FilmCard's own layout rules unchanged: the case (or flat case)
// plus a rank number below it, bottom-aligned as one stack, has nothing
// film-specific in it. Renaming the film-card/film-card__rank classes to
// something medium-neutral isn't needed for this to work and would touch
// more files for a cosmetic-only gain, so the names stay as they are — a
// known minor imperfection, not a silent one.
import './FilmCard.css'

interface AlbumCardProps {
  entry: Entry
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
}

/**
 * The album equivalent of FilmCard: the switch between FlatJewelCase
 * (closed, no 3D subtree) and JewelCase (the full interactive object),
 * using the same useCaseSequence choreography FilmCard uses for keep
 * cases. Every jewel case is one fixed size with no livery, so there's no
 * caseFormat/livery to pass through here, unlike Case's props.
 */
export default function AlbumCard({ entry, active, onActivate, onDeactivate }: AlbumCardProps) {
  const { open, enlarged, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    onDeactivate,
  })

  return (
    <div className="film-card">
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
      <span className="film-card__rank">{entry.rank}</span>
    </div>
  )
}
