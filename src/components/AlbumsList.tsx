import MediaList from './MediaList'
import AlbumCard from './AlbumCard'
import { albums } from '../data/lists'

export default function AlbumsList() {
  return <MediaList entries={albums} CardComponent={AlbumCard} ariaLabel="Albums, all time" />
}
