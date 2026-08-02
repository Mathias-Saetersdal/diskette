import MediaList from './MediaList'
import KeepCaseCard from './KeepCaseCard'
import { films } from '../data/lists'

export default function FilmsList() {
  return <MediaList entries={films} CardComponent={KeepCaseCard} ariaLabel="Films, all time" heading="Filmer" />
}
