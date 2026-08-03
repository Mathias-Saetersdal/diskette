import MediaList from './MediaList'
import KeepCaseCard from './KeepCaseCard'
import { series } from '../data/lists'
import './SeriesList.css'

/**
 * KeepCaseCard reused directly, not a SeriesCard: every series entry is a
 * DVD keep case, the exact geometry Case/FlatCase already render for
 * five of the ten films, and KeepCaseCard's own props and render already
 * come from generic Entry fields with no film-specific branching.
 *
 * Wrapped the same way FilmsList.tsx and GamesList.tsx are, for the same
 * reason: every series entry now renders through FlatCase's restTilt
 * path (build plan stage 3), which needs an ancestor with perspective
 * set for its rotateY hinge to read as depth, reaching .media-list
 * without editing that shared file.
 */
export default function SeriesList() {
  return (
    <div className="series-list">
      <MediaList entries={series} CardComponent={KeepCaseCard} ariaLabel="Series, all time" heading="Serier" />
    </div>
  )
}
