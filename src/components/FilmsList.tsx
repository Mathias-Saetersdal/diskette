import MediaList from './MediaList'
import FilmCard from './FilmCard'
import { films } from '../data/lists'

export default function FilmsList() {
  return <MediaList entries={films} CardComponent={FilmCard} ariaLabel="Films, all time" />
}
