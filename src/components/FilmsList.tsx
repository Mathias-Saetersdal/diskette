import MediaList from './MediaList'
import KeepCaseCard from './KeepCaseCard'
import { useSettleOnFirstView } from './useSettleOnFirstView'
import { SettleContext } from './SettleContext'
import { films } from '../data/lists'
import './FilmsList.css'
import { ui } from '../i18n/ui'
import { useLanguage } from '../i18n/useLanguage'

/**
 * Wraps MediaList for two reasons, the same shape GamesList.tsx already
 * established: the DVD-format entries' real spine (FlatCase's restTilt
 * path) needs an ancestor with perspective set for its rotateY hinge to
 * read as depth; and a ref to watch for this row's own first scroll into
 * view, to fire the settle animation on its ranked-1 entry once (build
 * plan stage 9). Both reach .media-list/KeepCaseCard without editing
 * either shared file.
 *
 * A third reason — a container outside the scrolling row for the active
 * card's own full Case to portal into — was here too (stage 8) and is
 * gone: the portal overlapped the section above and left a hole where
 * the card had been, reverted in favour of Case expanding in place
 * (KeepCaseCard.tsx, MediaList.css's own
 * .media-list:has(.case[data-enlarged='true']) rule).
 *
 * staggerMs 0: films renders first among the four lists (App.tsx), so it
 * gets no delay — the other three stagger after it, not before.
 */
export default function FilmsList() {
  const { language } = useLanguage()
  const [settleRef, settle] = useSettleOnFirstView<HTMLDivElement>(0)

  return (
    <div className="films-list" ref={settleRef}>
      <SettleContext.Provider value={settle}>
        <MediaList
          entries={films}
          CardComponent={KeepCaseCard}
          ariaLabel={ui[language].filmsAriaLabel}
          heading={ui[language].filmsHeading}
          id="filmer"
        />
      </SettleContext.Provider>
    </div>
  )
}
