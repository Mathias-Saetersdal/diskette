import Intro from './components/Intro'
import FilmsList from './components/FilmsList'
import SeriesList from './components/SeriesList'
import AlbumsList from './components/AlbumsList'
import GamesList from './components/GamesList'
import './App.css'

function App() {
  return (
    <main className="stage">
      <Intro />
      <FilmsList />
      <SeriesList />
      <AlbumsList />
      <GamesList />
    </main>
  )
}

export default App
