import Case from './Case'
import FlatCase from './FlatCase'
import { useCaseSequence } from './useCaseSequence'
import type { SupportedCaseFormat } from './caseGeometry'
import type { Entry } from '../data/lists'
import './MediaCard.css'

interface KeepCaseCardProps {
  entry: Entry
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
}

/**
 * The switch between the two representations a keep-case entry can have:
 * FlatCase (closed, no 3D subtree) for every entry that isn't the list's
 * one active one, Case (the full interactive object) for the one that is.
 * Films and series both use it — both are dvd/bluray keep-case geometry,
 * the exact restriction Case itself is scoped to (docs/04-lists.md). Games
 * are not: PS5 and Switch aren't keep cases, so a future game card needs
 * its own component rather than reusing this one under a name that would
 * no longer describe what it renders. Which one is active lives in
 * MediaList, not here — this only owns which Case props come from the
 * entry, plus the rank number that sits below whichever representation is
 * showing. The enlarge/open/close choreography itself lives in
 * useCaseSequence, shared with AlbumCard.
 */
export default function KeepCaseCard({ entry, active, onActivate, onDeactivate }: KeepCaseCardProps) {
  const { open, enlarged, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    onDeactivate,
  })

  return (
    <div className="media-card">
      {showCase ? (
        <Case
          title={entry.title}
          coverSrc={entry.cover}
          coverAlt={`${entry.title} cover`}
          discSrc={entry.disc}
          discAlt={`${entry.title} disc`}
          medium={entry.medium}
          discSource={entry.discSource}
          caseFormat={entry.case as SupportedCaseFormat}
          livery={entry.livery}
          open={open}
          enlarged={enlarged}
          onToggleOpen={onToggleOpen}
          toggleRef={caseToggleRef}
        />
      ) : (
        <FlatCase
          title={entry.title}
          coverSrc={entry.cover}
          coverAlt={`${entry.title} cover`}
          caseFormat={entry.case as SupportedCaseFormat}
          livery={entry.livery}
          onClick={onActivate}
          buttonRef={flatButtonRef}
        />
      )}
      <span className="media-card__rank">{entry.rank}</span>
    </div>
  )
}
