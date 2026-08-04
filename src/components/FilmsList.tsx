import { useState } from 'react'
import MediaList from './MediaList'
import KeepCaseCard from './KeepCaseCard'
import { ActivePortalContext } from './ActivePortal'
import { useSettleOnFirstView } from './useSettleOnFirstView'
import { SettleContext } from './SettleContext'
import { films } from '../data/lists'
import './FilmsList.css'

/**
 * Wraps MediaList for three reasons, the same shape GamesList.tsx
 * already established: the DVD-format entries' real spine (FlatCase's
 * restTilt path) needs an ancestor with perspective set for its rotateY
 * hinge to read as depth; a container outside the scrolling row for the
 * active card's own full Case to portal into (build plan stage 8), so
 * overflow-x: auto's forced overflow-y: auto doesn't clip it once it
 * enlarges or opens; and, since stage 9, a ref to watch for this row's
 * own first scroll into view, to fire the settle animation on its
 * ranked-1 entry once. All three reach .media-list/KeepCaseCard without
 * editing either shared file. useState instead of a plain ref for
 * activeSlot: the context's value has to be the actual DOM node once it
 * exists, and a ref alone doesn't trigger the re-render the first portal
 * needs.
 *
 * staggerMs 0: films renders first among the four lists (App.tsx), so it
 * gets no delay — the other three stagger after it, not before.
 */
export default function FilmsList() {
  const [activeSlot, setActiveSlot] = useState<HTMLDivElement | null>(null)
  const [settleRef, settle] = useSettleOnFirstView<HTMLDivElement>(0)

  return (
    <div className="films-list" ref={settleRef}>
      <div ref={setActiveSlot} className="films-active-slot" />
      <ActivePortalContext.Provider value={activeSlot}>
        <SettleContext.Provider value={settle}>
          <MediaList entries={films} CardComponent={KeepCaseCard} ariaLabel="Films, all time" heading="Filmer" />
        </SettleContext.Provider>
      </ActivePortalContext.Provider>
    </div>
  )
}
