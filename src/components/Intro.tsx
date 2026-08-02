import { introText } from '../data/lists'
import './Intro.css'

export default function Intro() {
  return (
    <section className="intro" aria-label="Intro">
      <p>{introText}</p>
    </section>
  )
}
