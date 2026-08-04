import { useContext } from 'react'
import { createPortal } from 'react-dom'
import Case from './Case'
import FlatCase from './FlatCase'
import { useCaseSequence } from './useCaseSequence'
import { ActivePortalContext } from './ActivePortal'
import type { SupportedCaseFormat } from './caseGeometry'
import type { Entry } from '../data/lists'
import './MediaCard.css'

// A series is a multi-disc box set, not a single case — its spine reads
// roughly double a single dvd case's own 14mm depth (caseGeometry.ts).
// No box set was measured for this; "roughly double" is the build plan's
// own figure, not derived from a real spec entry the way caseGeometry.ts's
// other numbers are.
const SERIES_SPINE_WIDTH_MM = 28

interface KeepCaseCardProps {
  entry: Entry
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
}

/**
 * The switch between the two representations a keep-case entry can have:
 * FlatCase (closed, at the row's own rest tilt) for every entry, Case
 * (the full interactive object) portaled in for whichever one is
 * active. Films, series and games all use it — Case itself is scoped to
 * dvd/bluray/ps5 (caseGeometry.ts's SupportedCaseFormat), which every
 * entry in all three lists falls under. Which one is active lives in
 * MediaList, not here — this only owns which Case props come from the
 * entry, plus the rank number that sits below whichever representation is
 * showing. The enlarge/open/close choreography itself lives in
 * useCaseSequence, shared with AlbumCard.
 *
 * Every row scrolls horizontally now (build plan stage 8), which is what
 * makes the portal necessary here, not just for GameCard: overflow-x:
 * auto forces overflow-y: auto along with it (MediaList.css), which
 * clips anything inside the row taller than its own resting height —
 * exactly what the active Case is, by design, once it enlarges or
 * opens. FlatCase stays mounted but hidden (its own hidden prop) rather
 * than unmounting, so the row's layout and this card's own rank number
 * don't shift when the swap happens.
 */
export default function KeepCaseCard({ entry, active, onActivate, onDeactivate }: KeepCaseCardProps) {
  const { open, enlarged, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    onDeactivate,
  })
  const portalTarget = useContext(ActivePortalContext)

  return (
    <div className="media-card">
      <FlatCase
        title={entry.title}
        coverSrc={entry.cover}
        coverAlt={`${entry.title} cover`}
        caseFormat={entry.case as SupportedCaseFormat}
        livery={entry.livery}
        onClick={onActivate}
        buttonRef={flatButtonRef}
        // Games (every entry), DVD-format films (build plan stage 2)
        // and series (every entry, stage 3) get a real spine. Blu-ray
        // -format films don't yet — their own front-face livery already
        // reads as a case without one, unlike DVD standard's plain
        // full-bleed poster.
        restTilt={
          entry.medium === 'game' ||
          (entry.medium === 'film' && entry.case === 'dvd') ||
          entry.medium === 'series'
        }
        spineTone={entry.spineTone}
        spineWidthMm={entry.medium === 'series' ? SERIES_SPINE_WIDTH_MM : undefined}
        hidden={showCase}
      />
      {showCase &&
        portalTarget &&
        createPortal(
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
          />,
          portalTarget,
        )}
      <span className="media-card__rank">{entry.rank}</span>
    </div>
  )
}
