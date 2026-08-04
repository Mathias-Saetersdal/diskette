import MediaList from './MediaList'
import AlbumCard from './AlbumCard'
import { albums } from '../data/lists'
import './AlbumsList.css'

/**
 * Wrapped the same way FilmsList.tsx, SeriesList.tsx and GamesList.tsx
 * are, for the same reason: FlatJewelCase's real spine (build plan
 * stage 4) needs an ancestor with perspective set for its rotateY hinge
 * to read as depth, reaching .media-list without editing that shared
 * file.
 */
export default function AlbumsList() {
  return (
    <div className="albums-list">
      <MediaList entries={albums} CardComponent={AlbumCard} ariaLabel="Albums, all time" heading="Album" />
    </div>
  )
}
