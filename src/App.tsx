import FilmsList from './components/FilmsList'
import AlbumsList from './components/AlbumsList'
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
      <AlbumsList />
      <div className="burned-row">
        {burnedEntries.map((entry) => (
          <BurnedDisc key={entry.id} title={entry.title} medium={entry.medium} />
        ))}
      </div>
    </main>
  )
}

export default App
