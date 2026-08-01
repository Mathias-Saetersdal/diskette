import FilmsList from './components/FilmsList'
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
      <div className="burned-row">
        {burnedEntries.map((entry) => (
          <BurnedDisc key={entry.id} title={entry.title} medium={entry.medium} />
        ))}
      </div>
    </main>
  )
}

export default App
