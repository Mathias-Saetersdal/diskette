import { useState } from 'react'
import MediaList from './MediaList'
import KeepCaseCard from './KeepCaseCard'
import { ActivePortalContext } from './ActivePortal'
import { films } from '../data/lists'
import './FilmsList.css'

/**
 * Wraps MediaList for two reasons, the same shape GamesList.tsx already
 * established: the DVD-format entries' real spine (FlatCase's restTilt
 * path) needs an ancestor with perspective set for its rotateY hinge to
 * read as depth, and — since build plan stage 8 — a container outside
 * the scrolling row for the active card's own full Case to portal into,
 * so overflow-x: auto's forced overflow-y: auto doesn't clip it once it
 * enlarges or opens. Both reach .media-list/KeepCaseCard without editing
 * either shared file. useState instead of a plain ref: the context's
 * value has to be the actual DOM node once it exists, and a ref alone
 * doesn't trigger the re-render the first portal needs.
 */
export default function FilmsList() {
  const [activeSlot, setActiveSlot] = useState<HTMLDivElement | null>(null)

  return (
    <div className="films-list">
      <div ref={setActiveSlot} className="films-active-slot" />
      <ActivePortalContext.Provider value={activeSlot}>
        <MediaList entries={films} CardComponent={KeepCaseCard} ariaLabel="Films, all time" heading="Filmer" />
      </ActivePortalContext.Provider>
    </div>
  )
}
