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

interface GameCardProps {
  entry: Entry
  active: boolean
  /** Some other entry in this list is active — forwarded to useCaseSequence. */
  displaced?: boolean
  onActivate: () => void
  onDeactivate: () => void
  /**
   * Relays useCaseSequence's own showCase/open pair up to MediaList.tsx —
   * same reasoning as KeepCaseCard.tsx's own copy of this prop.
   */
  onSequenceChange?: (state: { showCase: boolean; open: boolean }) => void
}

/**
 * Games-only stand-in for KeepCaseCard, not a variant of it — the one
 * real difference is useCaseSequence's delayShowCase (below), games
 * only, so this stays its own file rather than folding into
 * KeepCaseCard's own conditional. Swaps FlatCase and Case in place, as
 * siblings in the same row slot, the same shape KeepCaseCard.tsx uses
 * for films and series.
 *
 * A portal used to lift the active Case out of the scrolling row, into
 * a container GamesList mounted outside it, to dodge overflow-x: auto's
 * forced overflow-y: auto clipping the case once it enlarged or opened.
 * Reverted: it overlapped the section above and left a hole where the
 * card had been. MediaList.css's own
 * .media-list:has(.case[data-enlarged='true']) rule pads the row's own
 * scroll container instead now, while any card in it is enlarged.
 *
 * delayShowCase is still what makes the handoff a crossing rather than a
 * jump: FlatCase (with its spine, the reason this delay exists) stays
 * the only thing visible for a beat after activation, so the full case
 * has actually mounted its closed pose before FlatCase disappears from
 * this same slot, instead of both happening on the same render — a
 * concern about timing, not about where Case ends up, so it didn't go
 * away when the portal did.
 *
 * MediaCardDetail renders here too, not once for the whole list (build
 * plan stage 5) — same reasoning as KeepCaseCard.tsx's own copy of this
 * comment. Not part of this row's own livery/geometry/rest-angle/
 * card-size freeze, a layout change to where the description renders,
 * not to any of those. This is the mobile copy (variant='card');
 * MediaList.tsx renders the desktop copy (variant='row') itself, fed by
 * onSequenceChange below.
 */
export default function GameCard({ entry, active, displaced, onActivate, onDeactivate, onSequenceChange }: GameCardProps) {
  const { open, enlarged, closing, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    displaced,
    onDeactivate,
    delayShowCase: true,
  })
  const settle = useContext(SettleContext)

  useEffect(() => {
    onSequenceChange?.({ showCase, open })
  }, [showCase, open, onSequenceChange])

  const cover = derivedAsset(entry.cover)

  return (
    <div className="media-card">
      {showCase ? (
        <Case
          title={entry.title}
          // List derivative until open, full derivative after decode —
          // see KeepCaseCard.tsx's identical props.
          coverSrc={cover.list}
          coverFullSrc={cover.full}
          coverAlt={`${entry.title} cover`}
          // The 512px full derivative, requested only at open — see
          // KeepCaseCard.tsx's identical prop.
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
          // The 260px list derivative (src/assetSources.ts) — the open
          // Case above keeps the original. Games sit last on the page, so
          // every cover here is lazy with no fetch priority.
          coverSrc={cover.list}
          coverAlt={entry.title}
          caseFormat={entry.case as SupportedCaseFormat}
          livery={entry.livery}
          coverWidth={cover.width || undefined}
          coverHeight={cover.height || undefined}
          // Games are the last list on the page, never the first row:
          // demoted so these never compete with the visible covers for
          // bandwidth (FlatCase.tsx's fetchPriority comment).
          fetchPriority="low"
          onClick={onActivate}
          buttonRef={flatButtonRef}
          restTilt
          spineTone={entry.spineTone}
          // Rank 1 only (build plan stage 9) — not part of this row's own
          // livery/geometry/rest-angle/card-size freeze, a new interaction
          // affordance rather than a change to any of those.
          settleOnMount={settle && entry.rank === 1}
        />
      )}
      {showCase && <MediaCardDetail entry={entry} open={open} />}
    </div>
  )
}
