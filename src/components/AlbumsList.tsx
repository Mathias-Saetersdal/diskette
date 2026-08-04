import { useState } from 'react'
import MediaList from './MediaList'
import AlbumCard from './AlbumCard'
import { ActivePortalContext } from './ActivePortal'
import { albums } from '../data/lists'
import './AlbumsList.css'

/**
 * Wrapped the same way FilmsList.tsx, SeriesList.tsx and GamesList.tsx
 * are, for the same reasons: FlatJewelCase's real spine (build plan
 * stage 4) needs an ancestor with perspective set for its rotateY hinge
 * to read as depth, and — since stage 8 — a container outside the
 * scrolling row for the active card's own full JewelCase to portal
 * into, so overflow-x: auto's forced overflow-y: auto doesn't clip it.
 */
export default function AlbumsList() {
  const [activeSlot, setActiveSlot] = useState<HTMLDivElement | null>(null)

  return (
    <div className="albums-list">
      <div ref={setActiveSlot} className="albums-active-slot" />
      <ActivePortalContext.Provider value={activeSlot}>
        <MediaList entries={albums} CardComponent={AlbumCard} ariaLabel="Albums, all time" heading="Album" />
      </ActivePortalContext.Provider>
    </div>
  )
}
