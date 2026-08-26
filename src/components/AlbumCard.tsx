import { useContext, useEffect } from 'react'
import JewelCase from './JewelCase'
import FlatJewelCase from './FlatJewelCase'
import MediaCardDetail from './MediaCardDetail'
import { useCaseSequence } from './useCaseSequence'
import { SettleContext } from './SettleContext'
import { assetUrl } from '../assetUrl'
import type { Entry } from '../data/lists'
// The layout rules (this card's own box, bottom-aligned within the row)
// have nothing case-shape-specific in them, so they live in their own
// medium-neutral file rather than KeepCaseCard's — this is a jewel case,
// not a keep case, and importing something named after the other geometry
// here would be exactly the kind of misleading reuse KeepCaseCard itself
// was renamed to stop being.
import './MediaCard.css'

interface AlbumCardProps {
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
 * The album equivalent of KeepCaseCard: the switch between FlatJewelCase
 * (closed, at the row's own rest tilt) and JewelCase (the full
 * interactive object), in place, in the same row slot — using the same
 * useCaseSequence choreography KeepCaseCard uses for keep cases. Every
 * jewel case is one fixed size with no livery, so there's no caseFormat/
 * livery to pass through here, unlike Case's props — spineTone is the
 * one exception, the same per-entry hand-picked colour keep cases
 * already use for their own printed insert.
 *
 * A portal used to lift the active JewelCase out of the scrolling row,
 * to dodge overflow-x: auto's forced overflow-y: auto clipping it once
 * it enlarged or opened. Reverted, same as KeepCaseCard.tsx: it
 * overlapped the section above and left a hole where the card had been.
 * MediaList.css's own .media-list:has(.jewel-case[data-enlarged='true'])
 * rule pads the row's own scroll container instead now.
 *
 * MediaCardDetail renders here too, not once for the whole list (build
 * plan stage 5) — same reasoning as KeepCaseCard.tsx's own copy of this
 * comment. This is the mobile copy (variant='card'); MediaList.tsx
 * renders the desktop copy (variant='row') itself, fed by
 * onSequenceChange below.
 */
export default function AlbumCard({ entry, active, displaced, onActivate, onDeactivate, onSequenceChange }: AlbumCardProps) {
  const { open, enlarged, showCase, caseToggleRef, flatButtonRef, onToggleOpen } = useCaseSequence({
    active,
    displaced,
    onDeactivate,
  })
  const settle = useContext(SettleContext)

  useEffect(() => {
    onSequenceChange?.({ showCase, open })
  }, [showCase, open, onSequenceChange])

  return (
    <div className="media-card">
      {showCase ? (
        <JewelCase
          title={entry.title}
          coverSrc={assetUrl(entry.cover)}
          coverAlt={`${entry.title} cover`}
          discSrc={entry.disc ? assetUrl(entry.disc) : undefined}
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
          coverSrc={assetUrl(entry.cover)}
          coverAlt={`${entry.title} cover`}
          onClick={onActivate}
          buttonRef={flatButtonRef}
          spineTone={entry.spineTone}
          // Rank 1 only (build plan stage 9).
          settleOnMount={settle && entry.rank === 1}
        />
      )}
      {showCase && <MediaCardDetail entry={entry} open={open} />}
    </div>
  )
}
