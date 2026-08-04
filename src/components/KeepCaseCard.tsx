import { useContext } from 'react'
import Case from './Case'
import FlatCase from './FlatCase'
import MediaCardDetail from './MediaCardDetail'
import { useCaseSequence } from './useCaseSequence'
import { SettleContext } from './SettleContext'
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
 * FlatCase (closed, at the row's own rest tilt) for every entry that
 * isn't the list's one active one, Case (the full interactive object)
 * for the one that is — in place, in the same row slot, not portaled
 * elsewhere. Films, series and games all use it — Case itself is scoped
 * to dvd/bluray/ps5 (caseGeometry.ts's SupportedCaseFormat), which every
 * entry in all three lists falls under. Which one is active lives in
 * MediaList, not here — this only owns which Case props come from the
 * entry, plus the rank number that sits below whichever representation is
 * showing. The enlarge/open/close choreography itself lives in
 * useCaseSequence, shared with AlbumCard.
 *
 * A portal used to lift the active Case out of the scrolling row, to
 * dodge overflow-x: auto's forced overflow-y: auto clipping it once it
 * enlarged or opened. Reverted: it overlapped the section above and left
 * a hole where the card had been, worse than the clipping it fixed. The
 * clip is handled differently now — MediaList.css's own
 * .media-list:has(.case[data-enlarged='true']) rule pads the row's own
 * scroll container while any card here is enlarged, instead of moving
 * the card anywhere.
 *
 * MediaCardDetail renders here too, not once for the whole list (build
 * plan stage 5): the row scrolls, so the old single shared panel below
 * it read as detached from whichever card was actually open once that
 * card wasn't always centred under the row. Rendered only when showCase
 * is true, same condition as Case itself.
 */
export default function KeepCaseCard({ entry, active, onActivate, onDeactivate }: KeepCaseCardProps) {
  const { open, enlarged, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    onDeactivate,
  })
  const settle = useContext(SettleContext)

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
          // Every entry KeepCaseCard ever renders gets a real spine now
          // (build plan review, stage 4) — films and series, the only two
          // media this component handles (games route through GameCard
          // instead, which sets its own restTilt unconditionally the same
          // way). Bluray-format films were the one gap: FlatCase.css/tsx
          // already had a full "standard" spine variant built (the same
          // one bluray-format games use under their own console livery),
          // just never reached, since this prop stopped at dvd. No new
          // spine material needed, only turning this on for the format
          // that already had one waiting.
          restTilt
          spineTone={entry.spineTone}
          spineWidthMm={entry.medium === 'series' ? SERIES_SPINE_WIDTH_MM : undefined}
          // Rank 1 only (build plan stage 9) — never every card in the
          // row, which is exactly what settle already guards against
          // being true for more than one row at a time.
          settleOnMount={settle && entry.rank === 1}
        />
      )}
      {showCase && <MediaCardDetail entry={entry} />}
      <span className="media-card__rank">{entry.rank}</span>
    </div>
  )
}
