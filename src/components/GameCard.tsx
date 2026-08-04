import { useContext } from 'react'
import { createPortal } from 'react-dom'
import Case from './Case'
import FlatCase from './FlatCase'
import { useCaseSequence } from './useCaseSequence'
import { GamesActivePortalContext } from './GamesActivePortal'
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
 * Games-only stand-in for KeepCaseCard, not a variant of it. KeepCaseCard
 * swaps FlatCase and Case in place, as siblings in the same row slot — the
 * games row can't do that (GamesList.tsx's own comment on
 * .games-active-slot has the reason: .media-list needs overflow-x: auto to
 * scroll ten cards sideways without shrinking them, and that forces
 * overflow-y: auto too, which clips anything inside the row taller than
 * its own resting height, i.e. exactly the enlarged or open case). So the
 * full Case renders through a portal into a container GamesList mounts
 * outside the scrolling row instead, while FlatCase stays put — kept
 * mounted rather than unmounted once the portal takes over, so the row's
 * layout and this card's own rank number don't shift; only its visibility
 * drops (FlatCase's hidden prop, FlatCase.css).
 *
 * useCaseSequence's delayShowCase is what makes the handoff a crossing
 * rather than a jump: FlatCase (with its spine, the whole reason this
 * split exists) stays the only thing visible for a beat after activation,
 * so the full case has actually mounted its closed pose in the portal
 * target before FlatCase disappears, instead of both happening on the
 * same render.
 */
export default function GameCard({ entry, active, onActivate, onDeactivate }: GameCardProps) {
  const { open, enlarged, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    onDeactivate,
    delayShowCase: true,
  })
  const portalTarget = useContext(GamesActivePortalContext)
  const settle = useContext(SettleContext)

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
        restTilt
        spineTone={entry.spineTone}
        hidden={showCase}
        // Rank 1 only (build plan stage 9) — not part of this row's own
        // livery/geometry/rest-angle/card-size freeze, a new interaction
        // affordance rather than a change to any of those.
        settleOnMount={settle && entry.rank === 1}
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
