import MediaList from './MediaList'
import KeepCaseCard from './KeepCaseCard'
import { films } from '../data/lists'
import './FilmsList.css'

/**
 * Wraps MediaList the same way GamesList.tsx does, for the same reason:
 * DVD-format entries' real spine (FlatCase's restTilt path, build plan
 * stage 2) needs an ancestor with perspective set for its rotateY hinge
 * to read as depth rather than a flat shear, and that has to reach
 * .media-list without editing that shared file. Blu-ray-format entries
 * don't use restTilt yet, so this has no visible effect on them.
 */
export default function FilmsList() {
  return (
    <div className="films-list">
      <MediaList entries={films} CardComponent={KeepCaseCard} ariaLabel="Films, all time" heading="Filmer" />
    </div>
  )
}
