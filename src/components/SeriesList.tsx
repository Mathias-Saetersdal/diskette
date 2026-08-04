import { useState } from 'react'
import MediaList from './MediaList'
import KeepCaseCard from './KeepCaseCard'
import { ActivePortalContext } from './ActivePortal'
import { series } from '../data/lists'
import './SeriesList.css'

/**
 * KeepCaseCard reused directly, not a SeriesCard: every series entry is a
 * DVD keep case, the exact geometry Case/FlatCase already render for
 * five of the ten films, and KeepCaseCard's own props and render already
 * come from generic Entry fields with no film-specific branching.
 *
 * Wrapped the same way FilmsList.tsx and GamesList.tsx are, for the same
 * reason: every series entry renders through FlatCase's restTilt path
 * (build plan stage 3), which needs an ancestor with perspective set for
 * its rotateY hinge to read as depth, and — since stage 8 — a container
 * outside the scrolling row for the active card's own full Case to
 * portal into.
 */
export default function SeriesList() {
  const [activeSlot, setActiveSlot] = useState<HTMLDivElement | null>(null)

  return (
    <div className="series-list">
      <div ref={setActiveSlot} className="series-active-slot" />
      <ActivePortalContext.Provider value={activeSlot}>
        <MediaList entries={series} CardComponent={KeepCaseCard} ariaLabel="Series, all time" heading="Serier" />
      </ActivePortalContext.Provider>
    </div>
  )
}
