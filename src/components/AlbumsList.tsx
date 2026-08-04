import { useState } from 'react'
import MediaList from './MediaList'
import AlbumCard from './AlbumCard'
import { ActivePortalContext } from './ActivePortal'
import { useSettleOnFirstView } from './useSettleOnFirstView'
import { SettleContext } from './SettleContext'
import { albums } from '../data/lists'
import './AlbumsList.css'

/**
 * Wrapped the same way FilmsList.tsx, SeriesList.tsx and GamesList.tsx
 * are, for the same reasons: FlatJewelCase's real spine (build plan
 * stage 4) needs an ancestor with perspective set for its rotateY hinge
 * to read as depth; a container outside the scrolling row for the
 * active card's own full JewelCase to portal into (stage 8); and a ref
 * to watch for this row's own first scroll into view, to fire the
 * settle animation on its ranked-1 entry once (stage 9).
 *
 * staggerMs 300: albums is the third of the four lists in App.tsx.
 */
export default function AlbumsList() {
  const [activeSlot, setActiveSlot] = useState<HTMLDivElement | null>(null)
  const [settleRef, settle] = useSettleOnFirstView<HTMLDivElement>(300)

  return (
    <div className="albums-list" ref={settleRef}>
      <div ref={setActiveSlot} className="albums-active-slot" />
      <ActivePortalContext.Provider value={activeSlot}>
        <SettleContext.Provider value={settle}>
          <MediaList entries={albums} CardComponent={AlbumCard} ariaLabel="Albums, all time" heading="Album" />
        </SettleContext.Provider>
      </ActivePortalContext.Provider>
    </div>
  )
}
