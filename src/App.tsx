import Case from './components/Case'
import BurnedDisc from './components/BurnedDisc'
import { albums, games } from './data/lists'
import './App.css'

const burnedEntries = [...albums, ...games].filter(
  (entry) => entry.discSource === 'burned',
)

function App() {
  return (
    <main className="stage">
      <Case
        title="The Dark Knight"
        coverSrc="/assets/film/the-dark-knight/cover.png"
        coverAlt="The Dark Knight cover"
        discSrc="/assets/film/the-dark-knight/disc.png"
        discAlt="The Dark Knight disc"
      />
      <div className="burned-row">
        {burnedEntries.map((entry) => (
          <BurnedDisc key={entry.id} title={entry.title} medium={entry.medium} />
        ))}
      </div>
    </main>
  )
}

export default App
