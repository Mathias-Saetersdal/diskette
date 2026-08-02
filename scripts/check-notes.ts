// Build gate: fails if any entry's note, or the site intro, is still the
// placeholder Matti hasn't replaced yet. src/data/lists.ts fills series,
// albums and games notes with "TODO: Her vil jeg skrive to setninger om
// hvorfor jeg liker dette." and introText with "TODO: Her skriver jeg
// introen." until he writes the real thing — this is what stops either
// placeholder from shipping by accident.
import { allEntries, introText } from '../src/data/lists.ts'

const unfinished = allEntries.filter((entry) => entry.note.startsWith('TODO'))
const introUnfinished = introText.startsWith('TODO')

if (unfinished.length > 0 || introUnfinished) {
  if (unfinished.length > 0) {
    console.error(`${unfinished.length} note(s) still start with TODO:`)
    for (const entry of unfinished) {
      console.error(`  ${entry.medium}/${entry.id}`)
    }
  }
  if (introUnfinished) {
    console.error('introText still starts with TODO')
  }
  process.exit(1)
}

console.log('All notes and the intro are filled in.')
