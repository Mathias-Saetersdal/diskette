import { useContext } from 'react'
import Case from './Case'
import FlatCase from './FlatCase'
import MediaCardDetail from './MediaCardDetail'
import { useCaseSequence } from './useCaseSequence'
import { SettleContext } from './SettleContext'
import type { SupportedCaseFormat } from './caseGeometry'
import type { Entry } from '../data/lists'
import './MediaCard.css'

interface GameCardProps {
  entry: Entry
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
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
 * not to any of those.
 */
export default function GameCard({ entry, active, onActivate, onDeactivate }: GameCardProps) {
  const { open, enlarged, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    onDeactivate,
    delayShowCase: true,
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
