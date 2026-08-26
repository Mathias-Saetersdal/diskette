// Build gate: fails if any entry's note, or any paragraph of the site
// intro, is still the placeholder Matti hasn't replaced yet — in either
// language. src/data/lists.ts fills series, albums and games notes with
// "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette."
// until he writes the real thing, and used to fill introText itself the
// same way before it became four real paragraphs — this checks every one
// of those paragraphs individually now, so a placeholder left in any
// single one still fails the build. noteEn and introTextEn get the same
// gate, plus an empty-string check: an empty translation renders as a
// missing note rather than a visible TODO, so it would otherwise ship
// silently.
import { allEntries, introText, introTextEn } from '../src/data/lists.ts'

const unfinished = allEntries.filter(
  (entry) => entry.note.startsWith('TODO') || entry.noteEn.startsWith('TODO') || entry.noteEn === '',
)
const introUnfinished = [
  ...introText.map((paragraph, index) => ({ paragraph, index, name: 'introText' })),
  ...introTextEn.map((paragraph, index) => ({ paragraph, index, name: 'introTextEn' })),
].filter(({ paragraph }) => paragraph.startsWith('TODO') || paragraph === '')

if (unfinished.length > 0 || introUnfinished.length > 0) {
  if (unfinished.length > 0) {
    console.error(`${unfinished.length} note(s) still start with TODO or are empty:`)
    for (const entry of unfinished) {
      console.error(`  ${entry.medium}/${entry.id}`)
    }
  }
  if (introUnfinished.length > 0) {
    console.error(`${introUnfinished.length} intro paragraph(s) still start with TODO or are empty:`)
    for (const { name, index } of introUnfinished) {
      console.error(`  ${name}[${index}]`)
    }
  }
  process.exit(1)
}

console.log('All notes and the intro are filled in, in both languages.')
