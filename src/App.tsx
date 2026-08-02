import FilmsList from './components/FilmsList'
import SeriesList from './components/SeriesList'
import AlbumsList from './components/AlbumsList'
import GamesList from './components/GamesList'
import BurnedDisc from './components/BurnedDisc'
import { albums, games } from './data/lists'
import './App.css'

const burnedEntries = [...albums, ...games].filter(
  (entry) => entry.discSource === 'burned',
)

function App() {
  return (
    <main className="stage">
      <FilmsList />
      <SeriesList />
      <AlbumsList />
      <GamesList />
      <div className="burned-row">
        {burnedEntries.map((entry) => (
          <BurnedDisc key={entry.id} title={entry.title} medium={entry.medium} />
        ))}
      </div>
    </main>
  )
}

export default App
