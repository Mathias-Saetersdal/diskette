import { introText } from '../data/lists'
import '@fontsource/lora/latin-400.css'
import './Intro.css'

/**
 * Four real paragraphs (src/data/lists.ts), rendered as four real <p>
 * elements — no more splitting one string on its first sentence boundary,
 * since introText itself carries the paragraph breaks Matti actually
 * wrote now. The last one gets its own modifier class rather than a
 * fourth generic paragraph: it stands alone rather than continuing the
 * first three, and Intro.css gives it more space above it than the
 * paragraphs get between each other, so that break reads as intentional.
 */
export default function Intro() {
  const lastIndex = introText.length - 1
  return (
    <section className="intro" aria-label="Intro">
      <h1 className="intro__title">Diskette</h1>
      {introText.map((paragraph, index) => (
        <p
          key={index}
          className={index === lastIndex ? 'intro__paragraph intro__paragraph--last' : 'intro__paragraph'}
        >
          {paragraph}
        </p>
      ))}
    </section>
  )
}
