import { useState } from 'react'
import MediaList from './MediaList'
import KeepCaseCard from './KeepCaseCard'
import { ActivePortalContext } from './ActivePortal'
import { useSettleOnFirstView } from './useSettleOnFirstView'
import { SettleContext } from './SettleContext'
import { series } from '../data/lists'
import './SeriesList.css'

/**
 * KeepCaseCard reused directly, not a SeriesCard: every series entry is a
 * DVD keep case, the exact geometry Case/FlatCase already render for
 * five of the ten films, and KeepCaseCard's own props and render already
 * come from generic Entry fields with no film-specific branching.
 *
 * Wrapped the same way FilmsList.tsx and GamesList.tsx are, for the same
 * reasons: every series entry renders through FlatCase's restTilt path
 * (build plan stage 3), which needs an ancestor with perspective set for
 * its rotateY hinge to read as depth; a container outside the scrolling
 * row for the active card's own full Case to portal into (stage 8); and
 * a ref to watch for this row's own first scroll into view, to fire the
 * settle animation on its ranked-1 entry once (stage 9).
 *
 * staggerMs 150: series is the second of the four lists in App.tsx —
 * films' own 0ms plus a beat, so the two don't crack open together if
 * both happen to be on screen at once.
 */
export default function SeriesList() {
  const [activeSlot, setActiveSlot] = useState<HTMLDivElement | null>(null)
  const [settleRef, settle] = useSettleOnFirstView<HTMLDivElement>(150)

  return (
    <div className="series-list" ref={settleRef}>
      <div ref={setActiveSlot} className="series-active-slot" />
      <ActivePortalContext.Provider value={activeSlot}>
        <SettleContext.Provider value={settle}>
          <MediaList entries={series} CardComponent={KeepCaseCard} ariaLabel="Series, all time" heading="Serier" />
        </SettleContext.Provider>
      </ActivePortalContext.Provider>
    </div>
  )
}
