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
 * Films, series and games all use it — Case itself is scoped to
 * dvd/bluray/ps5 (caseGeometry.ts's SupportedCaseFormat), which every
 * entry in all three lists falls under. Which one is active lives in
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
          // Games (every entry) and DVD-format films (build plan stage
          // 2): both get a real spine. Blu-ray-format films don't yet —
          // their own front-face livery already reads as a case without
          // one, unlike DVD standard's plain full-bleed poster.
          restTilt={entry.medium === 'game' || (entry.medium === 'film' && entry.case === 'dvd')}
          spineTone={entry.spineTone}
        />
      )}
      <span className="media-card__rank">{entry.rank}</span>
    </div>
  )
}
