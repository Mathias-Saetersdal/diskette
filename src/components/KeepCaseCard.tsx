import { useContext, useEffect } from 'react'
import Case from './Case'
import FlatCase from './FlatCase'
import MediaCardDetail from './MediaCardDetail'
import { useCaseSequence } from './useCaseSequence'
import { SettleContext } from './SettleContext'
import { derivedAsset } from '../assetSources'
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
  /** Some other entry in this list is active — forwarded to useCaseSequence. */
  displaced?: boolean
  onActivate: () => void
  onDeactivate: () => void
  /**
   * Relays useCaseSequence's own showCase/open pair up to MediaList.tsx,
   * which needs them to drive the desktop row-level caption
   * (MediaCardDetail's variant='row') on the same beat this card's own
   * mobile copy already renders on. Optional so nothing else instantiating
   * this component needs updating.
   */
  onSequenceChange?: (state: { showCase: boolean; open: boolean }) => void
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
 * entry. The enlarge/open/close choreography itself lives in
 * useCaseSequence, shared with AlbumCard.
 *
 * No resting rank caption any more (frontend-design review): dropped here
 * first, films and — as a consequence of this being the shared component
 * films and series both render through — series too, then confirmed to
 * apply everywhere and dropped from AlbumCard and GameCard as well.
 * MediaCardDetail's own comment has the reasoning: position in the row
 * already carries rank at rest, the open state's own title block carries
 * the ordinal.
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
 * is true, same condition as Case itself. This is the mobile copy
 * (variant='card', the default) — MediaList.tsx renders a second,
 * desktop-only copy of its own now (variant='row'), fed by
 * onSequenceChange below.
 */
export default function KeepCaseCard({
  entry,
  active,
  displaced,
  onActivate,
  onDeactivate,
  onSequenceChange,
}: KeepCaseCardProps) {
  const { open, enlarged, closing, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    displaced,
    onDeactivate,
  })
  const settle = useContext(SettleContext)

  useEffect(() => {
    onSequenceChange?.({ showCase, open })
  }, [showCase, open, onSequenceChange])

  // Both representations paint from derivatives now: the resting card and
  // the opening case use the 260px list asset, and the open case upgrades
  // to the 512px full asset once decoded. One src, no srcset: 260 already
  // covers the widest resting cover face at DPR 3 (stage 1 measurement),
  // so a larger candidate never improves what is on screen.
  const cover = derivedAsset(entry.cover)

  return (
    <div className="media-card">
      {showCase ? (
        <Case
          title={entry.title}
          // The list derivative carries the face until open; the full
          // derivative swaps in once decoded (Case.tsx coverFullSrc).
          // Nothing loads the original cover PNG any more.
          coverSrc={cover.list}
          coverFullSrc={cover.full}
          coverAlt={`${entry.title} cover`}
          // The 512px full derivative: covers the widest on-screen disc
          // (jewel, 190.37px at 1440, scale(2) included) at DPR 3.
          // Requested only once the case reaches its open state (Case.tsx
          // discRequested); nothing prefetches it.
          discSrc={entry.disc ? derivedAsset(entry.disc).full : undefined}
          discAlt={`${entry.title} disc`}
          medium={entry.medium}
          discSource={entry.discSource}
          caseFormat={entry.case as SupportedCaseFormat}
          livery={entry.livery}
          open={open}
          enlarged={enlarged}
          closing={closing}
          onToggleOpen={onToggleOpen}
          toggleRef={caseToggleRef}
        />
      ) : (
        <FlatCase
          title={entry.title}
          coverSrc={cover.list}
          coverAlt={entry.title}
          caseFormat={entry.case as SupportedCaseFormat}
          livery={entry.livery}
          coverWidth={cover.width || undefined}
          coverHeight={cover.height || undefined}
          // Films is the first list on the one scrolling page (App.tsx),
          // so the page's first four covers in document order are films
          // ranks 1 to 4, and only those load eagerly — series (this same
          // component) and everything below stay lazy. fetchpriority high
          // on the first two only; every cover outside the films row is
          // demoted to low so the browser starves those requests instead
          // of round-robining them against the visible row (all 40 load
          // at rest — FlatCase.tsx's fetchPriority comment).
          eager={entry.medium === 'film' && entry.rank <= 4}
          fetchPriority={entry.medium === 'film' ? (entry.rank <= 2 ? 'high' : undefined) : 'low'}
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
      {showCase && <MediaCardDetail entry={entry} open={open} />}
    </div>
  )
}
