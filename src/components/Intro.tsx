import { introText } from '../data/lists'
import '@fontsource/lora/latin-400.css'
import './Intro.css'

// The premise, then the mechanism: introText's own first sentence states
// what this collection is; everything after explains how it's built (the
// ranking, the note, the per-medium object). That's a real seam already in
// the writing, not one this component invents, so it's what the type
// treatment below makes visible. Split on the first sentence boundary
// rather than storing lead/body as two separate strings in lists.ts —
// introText stays the single, unedited string Matti wrote, this only reads
// it in two pieces.
const sentenceEnd = introText.indexOf('. ')
const lead = sentenceEnd === -1 ? introText : introText.slice(0, sentenceEnd + 1)
const body = sentenceEnd === -1 ? '' : introText.slice(sentenceEnd + 2)

export default function Intro() {
  return (
    <section className="intro" aria-label="Intro">
      <p className="intro__lead">{lead}</p>
      {body && <p className="intro__body">{body}</p>}
    </section>
  )
}
