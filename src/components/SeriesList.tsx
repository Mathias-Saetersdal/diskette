import MediaList from './MediaList'
import KeepCaseCard from './KeepCaseCard'
import { series } from '../data/lists'

// KeepCaseCard reused directly, not a SeriesCard: every series entry is a
// DVD keep case, the exact geometry Case/FlatCase already render for five
// of the ten films, and KeepCaseCard's own props and render already come
// from generic Entry fields with no film-specific branching.
export default function SeriesList() {
  return <MediaList entries={series} CardComponent={KeepCaseCard} ariaLabel="Series, all time" heading="Serier" />
}
