// Build gate: fails if any asset path string in src/data/lists.ts has no
// record in src/data/assets.generated.json. The components resolve list
// covers through that JSON (src/assetSources.ts), and its production
// fallback serves the full-size original silently — so a forgotten
// `npm run derive-assets` after adding an entry should fail the build
// here instead of shipping that fallback. package.json runs this after
// prebuild's derive-assets, so a fresh regeneration has already happened
// by the time it checks.
import { readFile } from 'node:fs/promises'
import { allEntries } from '../src/data/lists.ts'

const records: Record<string, unknown> = JSON.parse(
  await readFile(new URL('../src/data/assets.generated.json', import.meta.url), 'utf8'),
)

const listed = allEntries.flatMap((entry) =>
  [entry.cover, entry.disc, entry.spine, entry.back].filter((p): p is string => p !== undefined),
)

const missing = listed.filter((p) => !(p in records))

if (missing.length > 0) {
  console.error(`${missing.length} path(s) in lists.ts have no record in assets.generated.json:`)
  for (const p of missing) {
    console.error(`  ${p}`)
  }
  console.error('Run npm run derive-assets and commit the regenerated JSON.')
  process.exit(1)
}

console.log(`All ${listed.length} asset paths in lists.ts have derived records.`)
