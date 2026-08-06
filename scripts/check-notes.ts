// Build gate: fails if any entry's note, or any paragraph of the site
// intro, is still the placeholder Matti hasn't replaced yet. src/data/
// lists.ts fills series, albums and games notes with "TODO: Her vil jeg
// skrive to setninger om hvorfor jeg liker dette." until he writes the
// real thing, and used to fill introText itself the same way before it
// became four real paragraphs — this checks every one of those
// paragraphs individually now, so a placeholder left in any single one
// still fails the build.
import { allEntries, introText } from '../src/data/lists.ts'

const unfinished = allEntries.filter((entry) => entry.note.startsWith('TODO'))
const introUnfinished = introText
  .map((paragraph, index) => ({ paragraph, index }))
  .filter(({ paragraph }) => paragraph.startsWith('TODO'))

if (unfinished.length > 0 || introUnfinished.length > 0) {
  if (unfinished.length > 0) {
    console.error(`${unfinished.length} note(s) still start with TODO:`)
    for (const entry of unfinished) {
      console.error(`  ${entry.medium}/${entry.id}`)
    }
  }
  if (introUnfinished.length > 0) {
    console.error(`${introUnfinished.length} intro paragraph(s) still start with TODO:`)
    for (const { index } of introUnfinished) {
      console.error(`  introText[${index}]`)
    }
  }
  process.exit(1)
}

console.log('All notes and the intro are filled in.')
