import { useState } from 'react'
import MediaList from './MediaList'
import GameCard from './GameCard'
import { GamesActivePortalContext } from './GamesActivePortal'
import { useSettleOnFirstView } from './useSettleOnFirstView'
import { SettleContext } from './SettleContext'
import { games } from '../data/lists'
import './GamesList.css'

/**
 * Wraps MediaList rather than passing it a perspective prop: MediaList is
 * the same component films, series and albums render through, and the
 * shared vanishing point this row's resting tilt needs (GamesList.css)
 * only has to reach .media-list, several levels below this div — CSS
 * perspective applies through untransformed intermediate boxes, so this
 * wrapper is the only new element needed for that part, and MediaList
 * itself stays completely unedited.
 *
 * .games-active-slot is the second reason for this wrapper: a container
 * outside .media-list (a sibling, not a descendant) that the active
 * card's own full Case portals into instead of rendering in its row slot
 * — GamesList.css has the reason .media-list itself can't hold it.
 * useState instead of a plain ref: the context's value has to be the
 * actual DOM node once it exists, and a ref alone doesn't trigger the
 * re-render GameCard's first portal needs; passing setActiveSlot directly
 * as the ref callback gets that render for free the moment the node
 * mounts.
 *
 * The third reason, added in build plan stage 9: a ref to watch for this
 * row's own first scroll into view, to fire the settle animation on its
 * ranked-1 entry once (SettleContext, read by GameCard). Not part of the
 * games livery/geometry/rest-angle/card-size freeze this row otherwise
 * carries — a new interaction affordance, not a change to any of those.
 * staggerMs 450: games is the fourth and last of the four lists in
 * App.tsx.
 */
export default function GamesList() {
  const [activeSlot, setActiveSlot] = useState<HTMLDivElement | null>(null)
  const [settleRef, settle] = useSettleOnFirstView<HTMLDivElement>(450)

  return (
    <div className="games-list" ref={settleRef}>
      <div ref={setActiveSlot} className="games-active-slot" />
      <GamesActivePortalContext.Provider value={activeSlot}>
        <SettleContext.Provider value={settle}>
          <MediaList entries={games} CardComponent={GameCard} ariaLabel="Games, all time" heading="Spill" />
        </SettleContext.Provider>
      </GamesActivePortalContext.Provider>
    </div>
  )
}
