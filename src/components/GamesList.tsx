import MediaList from './MediaList'
import KeepCaseCard from './KeepCaseCard'
import { games } from '../data/lists'

export default function GamesList() {
  return <MediaList entries={games} CardComponent={KeepCaseCard} ariaLabel="Games, all time" />
}
