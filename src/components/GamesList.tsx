import MediaList from './MediaList'
import GameCard from './GameCard'
import { useSettleOnFirstView } from './useSettleOnFirstView'
import { SettleContext } from './SettleContext'
import { games } from '../data/lists'
import './GamesList.css'
import { ui } from '../i18n/ui'
import { useLanguage } from '../i18n/useLanguage'

/**
 * Wraps MediaList rather than passing it a perspective prop: MediaList is
 * the same component films, series and albums render through, and the
 * shared vanishing point this row's resting tilt needs (GamesList.css)
 * only has to reach .media-list, several levels below this div — CSS
 * perspective applies through untransformed intermediate boxes, so this
 * wrapper is the only new element needed for that part, and MediaList
 * itself stays completely unedited.
 *
 * The second reason: a ref to watch for this row's own first scroll into
 * view, to fire the settle animation on its ranked-1 entry once
 * (SettleContext, read by GameCard, build plan stage 9). Not part of the
 * games livery/geometry/rest-angle/card-size freeze this row otherwise
 * carries — a new interaction affordance, not a change to any of those.
 * staggerMs 450: games is the fourth and last of the four lists in
 * App.tsx.
 *
 * .games-active-slot — a container outside .media-list for the active
 * card's own full Case to portal into — was here too (stage 8) and is
 * gone: the portal overlapped the section above and left a hole where
 * the card had been, reverted in favour of Case expanding in place
 * (GameCard.tsx, MediaList.css's own
 * .media-list:has(.case[data-enlarged='true']) rule).
 */
export default function GamesList() {
  const { language } = useLanguage()
  const [settleRef, settle] = useSettleOnFirstView<HTMLDivElement>(450)

  return (
    <div className="games-list" ref={settleRef}>
      <SettleContext.Provider value={settle}>
        <MediaList entries={games} CardComponent={GameCard} ariaLabel={ui[language].gamesAriaLabel} heading={ui[language].gamesHeading} id="spill" />
      </SettleContext.Provider>
    </div>
  )
}
