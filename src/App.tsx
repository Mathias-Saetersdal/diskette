import FilmsList from './components/FilmsList'
import BurnedDisc from './components/BurnedDisc'
import JewelCase from './components/JewelCase'
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
      {/* Temporary: JewelCase preview, both states, not part of any list yet. */}
      <div className="jewel-case-stack">
        <JewelCase
          title="Currents"
          coverSrc="/assets/album/currents/cover.png"
          coverAlt="Currents cover"
          discSrc="/assets/album/currents/disc.png"
          discAlt="Currents disc"
        />
        <JewelCase
          title="Currents"
          coverSrc="/assets/album/currents/cover.png"
          coverAlt="Currents cover"
          discSrc="/assets/album/currents/disc.png"
          discAlt="Currents disc"
          defaultOpen
        />
      </div>
      {/*
       * Temporary: closed-cover comparison. Currents is 1056x1200, ratio
       * 0.880, matching the jewel case's own front-face-ratio (125/142 =
       * 0.8802) almost exactly. Rommet is one of the three album covers
       * that isn't: 1200x1200, a true square. Both closed, so there's no
       * hinge overlap to worry about side by side, unlike the open/closed
       * pair above.
       */}
      <div className="jewel-case-compare">
        <JewelCase
          title="Currents"
          coverSrc="/assets/album/currents/cover.png"
          coverAlt="Currents cover"
          discSrc="/assets/album/currents/disc.png"
          discAlt="Currents disc"
        />
        <JewelCase
          title="Rommet"
          coverSrc="/assets/album/rommet/cover.png"
          coverAlt="Rommet cover"
          discSrc="/assets/album/rommet/disc.png"
          discAlt="Rommet disc"
        />
      </div>
    </main>
  )
}

export default App
