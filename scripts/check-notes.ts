// Build gate: fails if any entry's note is still the placeholder Matti
// hasn't replaced yet. src/data/lists.ts fills series, albums and games
// with "TODO: Her vil jeg skrive to setninger om hvorfor jeg liker dette."
// until he writes the real thing, one entry at a time — this is what stops
// that placeholder from shipping by accident.
import { allEntries } from '../src/data/lists.ts'

const unfinished = allEntries.filter((entry) => entry.note.startsWith('TODO'))

if (unfinished.length > 0) {
  console.error(`${unfinished.length} note(s) still start with TODO:`)
  for (const entry of unfinished) {
    console.error(`  ${entry.medium}/${entry.id}`)
  }
  process.exit(1)
}

console.log('All notes are filled in.')
