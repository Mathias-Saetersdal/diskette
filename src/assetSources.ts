import records from './data/assets.generated.json'
import { assetUrl } from './assetUrl'

/**
 * One record per committed original, produced by scripts/derive-assets.ts
 * into src/data/assets.generated.json. list and full arrive here as the
 * root-absolute derived paths and leave derivedAsset() as ready URLs, run
 * through assetUrl the same way every other asset path already is.
 */
export interface DerivedAsset {
  /** URL of the 260px list derivative, ready for an img src. */
  list: string
  /** URL of the 512px full derivative. */
  full: string
  /** Real encoded width of the list derivative. Under 260 if the original was narrower. */
  listWidth: number
  /** Real encoded width of the full derivative. Under 512 if the original was narrower. */
  fullWidth: number
  /** Original's pixel width. 0 on the production fallback, meaning unknown. */
  width: number
  /** Original's pixel height. 0 on the production fallback, meaning unknown. */
  height: number
  thumbhash: string
  dominant: string
}

const table: Record<string, DerivedAsset> = records

/**
 * Looks up the derived-asset record for a path string exactly as it
 * appears in src/data/lists.ts (e.g. "/assets/film/the-dark-knight/
 * cover.png"). The generated JSON is keyed by those same strings, so no
 * transformation happens here.
 *
 * A missing key throws in dev: it means derive-assets hasn't run since
 * the entry was added, and scripts/check-assets.ts blocks a production
 * build for the same reason. In production it warns and falls back to
 * the committed original, which is still served from public/assets, so
 * the cover renders rather than leaving a hole. The fallback's dimension
 * fields are 0; callers skip width/height attributes when they see that.
 */
export function derivedAsset(originalPath: string): DerivedAsset {
  const record = table[originalPath]
  if (record) {
    return {
      ...record,
      list: assetUrl(record.list),
      full: assetUrl(record.full),
    }
  }
  if (import.meta.env.DEV) {
    throw new Error(
      `No record in assets.generated.json for ${originalPath}. Run npm run derive-assets.`,
    )
  }
  console.warn(`No derived asset for ${originalPath}, serving the original.`)
  const original = assetUrl(originalPath)
  return {
    list: original,
    full: original,
    listWidth: 0,
    fullWidth: 0,
    width: 0,
    height: 0,
    thumbhash: '',
    dominant: '#000000',
  }
}
