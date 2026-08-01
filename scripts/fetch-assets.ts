// Asset pipeline for films, series and albums. Games are resolved by hand
// (docs/05-build-plan.md, step 5) — this script never touches the games
// array. Run with: tsx scripts/fetch-assets.ts [--limit=N]
//
// Every entry in src/data/lists.ts already carries its cover/disc path
// strings by hand (e.g. /assets/film/the-dark-knight/cover.png); this
// script's job is producing the files at those exact paths, not editing
// lists.ts.
//
// Sources and join keys: docs/02-asset-sources.md.

import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import sharp from 'sharp'
import { albums, films, series, type CaseFormat, type Entry } from '../src/data/lists.ts'

process.loadEnvFile('.env')

const TMDB_API_KEY = process.env.TMDB_API_KEY
const FANART_API_KEY = process.env.FANART_API_KEY

if (!TMDB_API_KEY || !FANART_API_KEY) {
  console.error('Missing TMDB_API_KEY or FANART_API_KEY in .env')
  process.exit(1)
}

// MusicBrainz requires real contact details in the User-Agent or it starts
// blocking requests — see their rate-limit policy, linked from
// docs/02-asset-sources.md.
const USER_AGENT = 'Diskette/0.1 ( colamann7@gmail.com )'

const ROOT = path.resolve(import.meta.dirname, '..')
const PUBLIC_ASSETS = path.join(ROOT, 'public', 'assets')
const CREDITS_PATH = path.join(ROOT, 'credits.json')

// Matches the disc already sitting at public/assets/film/the-dark-knight,
// fetched by hand in step 1.
const DISC_CANVAS = 1000
const COVER_HEIGHT = 1200

// Front face ratios, docs/03-object-spec.md Cases table. Only the formats
// films/series/albums actually use — ps5 and switch belong to games, out
// of scope here.
const FRONT_FACE_RATIO: Record<string, number> = {
  dvd: 0.707,
  bluray: 0.868,
  jewel: 0.88,
}

function redact(url: string): string {
  return url.replace(/([?&]api_key=)[^&]+/i, '$1REDACTED')
}

// ---------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------

// Cover Art Archive redirects to archive.org's own CDN for the actual
// image bytes, and that connection is intermittently flaky — observed
// directly while testing this script: the same URL sometimes connects and
// finishes downloading in under two seconds, and sometimes hangs on
// connect or drops mid-download, with no pattern tied to load or time of
// day. Retrying is the correct response to that, not a longer timeout.
// Callers wrap their *entire* fetch-plus-read-the-body operation in this,
// not just the initial fetch() — a connection that succeeds but then
// terminates while streaming the response needs the same retry.
async function withNetworkRetry<T>(fn: () => Promise<T>, label: string, maxAttempts = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const backoff = 500 * 2 ** attempt
      console.warn(
        `  ${label} network error (${err instanceof Error ? err.message : String(err)}), retrying in ${backoff}ms`,
      )
      await sleep(backoff)
    }
  }
  throw lastError
}

// A single shared pacing gate for TMDB and Cover Art Archive: neither
// documents a hard limit, but nothing should hammer a free API in a tight
// loop either. Pacing only — retrying is the caller's job, since it needs
// to cover reading the response body too (see withNetworkRetry's comment),
// not just establishing the connection.
let lastPoliteRequestAt = 0
async function politeFetch(url: string, init?: RequestInit): Promise<Response> {
  const wait = 300 - (Date.now() - lastPoliteRequestAt)
  if (wait > 0) await sleep(wait)
  lastPoliteRequestAt = Date.now()
  return fetch(url, init)
}

// MusicBrainz: exactly one request per second, no bursting.
let lastMusicBrainzRequestAt = 0
async function musicBrainzFetch(url: string): Promise<Response> {
  const wait = 1000 - (Date.now() - lastMusicBrainzRequestAt)
  if (wait > 0) await sleep(wait)
  lastMusicBrainzRequestAt = Date.now()
  return fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } })
}

// fanart.tv: token bucket for the steady rate, exponential backoff on
// 429/5xx, per docs/02-asset-sources.md.
const FANART_BUCKET_CAPACITY = 3
const FANART_REFILL_MS = 1000 // one token added per second
let fanartTokens = FANART_BUCKET_CAPACITY
let fanartLastRefillAt = Date.now()

async function takeFanartToken(): Promise<void> {
  for (;;) {
    const elapsed = Date.now() - fanartLastRefillAt
    const refill = Math.floor(elapsed / FANART_REFILL_MS)
    if (refill > 0) {
      fanartTokens = Math.min(FANART_BUCKET_CAPACITY, fanartTokens + refill)
      fanartLastRefillAt = Date.now()
    }
    if (fanartTokens > 0) {
      fanartTokens -= 1
      return
    }
    await sleep(FANART_REFILL_MS - (elapsed % FANART_REFILL_MS))
  }
}

async function fanartFetch(pathAndQuery: string): Promise<Response | null> {
  const url = `https://webservice.fanart.tv/v3${pathAndQuery}${pathAndQuery.includes('?') ? '&' : '?'}api_key=${FANART_API_KEY}`
  const maxAttempts = 4
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await takeFanartToken()
    const backoff = 500 * 2 ** attempt
    let res: Response
    try {
      res = await fetch(url)
    } catch (err) {
      console.warn(
        `  fanart.tv network error (${err instanceof Error ? err.message : String(err)}), retrying in ${backoff}ms: ${redact(url)}`,
      )
      await sleep(backoff)
      continue
    }
    if (res.status === 429 || res.status >= 500) {
      console.warn(`  fanart.tv ${res.status}, retrying in ${backoff}ms: ${redact(url)}`)
      await sleep(backoff)
      continue
    }
    return res
  }
  console.warn(`  fanart.tv exhausted retries: ${redact(url)}`)
  return null
}

interface ExecFileError extends Error {
  code?: number | string
}

function curlDownload(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    execFile(
      'curl',
      ['-sL', '--max-time', '20', '--fail', url],
      { encoding: 'buffer', maxBuffer: 1024 * 1024 * 100 },
      (error, stdout) => {
        if (error) reject(error)
        else resolve(stdout)
      },
    )
  })
}

// Binary downloads shell out to curl rather than using fetch/https
// directly. Observed directly while building this script: Node's own
// networking stack was demonstrably unreliable against archive.org's CDN
// (the identical URL sometimes returned in under two seconds and
// sometimes hung on connect or dropped mid-stream, with no pattern tied
// to load or time of day), while curl succeeded on the first try against
// every one of those same URLs in direct testing. This covers every
// binary asset in the script (TMDB posters/backdrops, fanart.tv discs,
// Cover Art Archive covers), not just the archive.org case that surfaced
// it, since they share this one function.
async function downloadBuffer(url: string): Promise<Buffer | null> {
  const wait = 300 - (Date.now() - lastPoliteRequestAt)
  if (wait > 0) await sleep(wait)
  lastPoliteRequestAt = Date.now()

  return withNetworkRetry(async () => {
    try {
      return await curlDownload(url)
    } catch (err) {
      // curl --fail exits 22 specifically for a real HTTP 4xx/5xx — that's
      // "no asset," not a glitch, so it isn't retried. Anything else
      // (timeout, connection reset, DNS) is exactly the flakiness above.
      if ((err as ExecFileError).code === 22) return null
      throw err
    }
  }, url)
}

// ---------------------------------------------------------------------
// TMDB — films and series
// ---------------------------------------------------------------------

interface TmdbSearchResult {
  id: number
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
}

async function tmdbSearch(
  kind: 'movie' | 'tv',
  title: string,
  year: number,
): Promise<TmdbSearchResult | null> {
  const url = `https://api.themoviedb.org/3/search/${kind}?query=${encodeURIComponent(title)}`
  const data = await withNetworkRetry(async () => {
    const res = await politeFetch(url, {
      headers: { Authorization: `Bearer ${TMDB_API_KEY}`, Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as { results?: TmdbSearchResult[] }
  }, url)
  if (!data) return null
  const results = data.results ?? []
  // The exact reason docs/04-lists.md flags Berserk and One Piece: without
  // filtering by year, the search's first hit is often a different
  // adaptation entirely.
  const dateField = kind === 'movie' ? 'release_date' : 'first_air_date'
  const match = results.find((r) => r[dateField]?.startsWith(String(year)))
  return match ?? results[0] ?? null
}

interface FanartDisc {
  url: string
  disc_type?: string
  width?: string
  height?: string
}

async function fanartMovieDisc(tmdbId: number): Promise<FanartDisc[]> {
  const data = await withNetworkRetry(async () => {
    const res = await fanartFetch(`/movies/${tmdbId}`)
    if (!res || !res.ok) return null
    return (await res.json()) as { moviedisc?: FanartDisc[] }
  }, `fanart.tv movies/${tmdbId}`)
  return data?.moviedisc ?? []
}

function pickBestDisc(discs: FanartDisc[], caseFormat: CaseFormat): FanartDisc | null {
  if (discs.length === 0) return null
  const matchingType = discs.filter((d) => d.disc_type === caseFormat)
  const pool = matchingType.length > 0 ? matchingType : discs
  return [...pool].sort((a, b) => {
    const areaA = Number(a.width ?? 0) * Number(a.height ?? 0)
    const areaB = Number(b.width ?? 0) * Number(b.height ?? 0)
    return areaB - areaA
  })[0]
}

// ---------------------------------------------------------------------
// MusicBrainz / Cover Art Archive / fanart.tv — albums
// ---------------------------------------------------------------------

interface MbReleaseGroup {
  id: string
}

async function musicBrainzReleaseGroup(title: string, artist: string): Promise<string | null> {
  const query = `releasegroup:"${title}" AND artist:"${artist}"`
  const url = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(query)}&fmt=json&limit=5`
  const data = await withNetworkRetry(async () => {
    const res = await musicBrainzFetch(url)
    if (!res.ok) return null
    return (await res.json()) as { 'release-groups'?: MbReleaseGroup[] }
  }, url)
  return data?.['release-groups']?.[0]?.id ?? null
}

async function fetchCoverArtArchive(releaseGroupMbid: string): Promise<Buffer | null> {
  return downloadBuffer(`https://coverartarchive.org/release-group/${releaseGroupMbid}/front`)
}

interface FanartCdart {
  url: string
}

// docs/02-asset-sources.md: "in v3 and v3.1 the response returns albums as
// an object keyed by id. In v3.2 it returns an array of objects each
// carrying release_group_id." The script can't pin a version through the
// URL the way the movies endpoint implies it can, so this handles either
// shape rather than assuming one.
async function fanartAlbumCdart(releaseGroupMbid: string): Promise<FanartCdart[]> {
  const data: unknown = await withNetworkRetry(async () => {
    const res = await fanartFetch(`/music/albums/${releaseGroupMbid}`)
    if (!res || !res.ok) return null
    return res.json()
  }, `fanart.tv music/albums/${releaseGroupMbid}`)
  if (Array.isArray(data)) {
    const entry = data.find(
      (item): item is { release_group_id: string; cdart?: FanartCdart[] } =>
        typeof item === 'object' && item !== null && 'release_group_id' in item &&
        (item as { release_group_id?: unknown }).release_group_id === releaseGroupMbid,
    )
    return entry?.cdart ?? []
  }
  if (data && typeof data === 'object') {
    const entry = (data as Record<string, { cdart?: FanartCdart[] } | undefined>)[releaseGroupMbid]
    return entry?.cdart ?? []
  }
  return []
}

// ---------------------------------------------------------------------
// Normalisation (sharp)
// ---------------------------------------------------------------------

async function hasRealTransparency(buffer: Buffer): Promise<boolean> {
  const image = sharp(buffer)
  const meta = await image.metadata()
  if (!meta.hasAlpha) return false
  const stats = await image.stats()
  const alpha = stats.channels[stats.channels.length - 1]
  // A disc scan with a baked-in solid background reports alpha with a
  // minimum near 255 everywhere; docs/02-asset-sources.md: "Transparent
  // PNGs only for discs."
  return alpha.min < 250
}

async function saveRetailDisc(buffer: Buffer, outPath: string): Promise<void> {
  await sharp(buffer)
    .resize(DISC_CANVAS, DISC_CANVAS, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath)
}

async function saveGeneratedDisc(coverPath: string, outPath: string): Promise<void> {
  // The circle clip, hub-hole mask and specular sweep are already applied
  // at render time by Disc.css regardless of source shape (see its
  // comments), so this only needs to produce a clean square crop, not
  // re-implement that pipeline here.
  await sharp(coverPath).resize(DISC_CANVAS, DISC_CANVAS, { fit: 'cover' }).png().toFile(outPath)
}

async function saveCover(buffer: Buffer, outPath: string, caseFormat: CaseFormat): Promise<void> {
  const ratio = FRONT_FACE_RATIO[caseFormat] ?? 0.75
  const height = COVER_HEIGHT
  const width = Math.round(height * ratio)
  await sharp(buffer).resize(width, height, { fit: 'cover' }).png().toFile(outPath)
}

async function saveBackdrop(buffer: Buffer, outPath: string): Promise<void> {
  await sharp(buffer).resize({ width: 1280, withoutEnlargement: true }).jpeg({ quality: 85 }).toFile(outPath)
}

// ---------------------------------------------------------------------
// credits.json
// ---------------------------------------------------------------------

interface CreditRecord {
  source: string
  url: string
  licence: string
}
type Credits = Record<string, Record<string, CreditRecord>>

async function loadCredits(): Promise<Credits> {
  try {
    return JSON.parse(await readFile(CREDITS_PATH, 'utf-8')) as Credits
  } catch {
    return {}
  }
}

// ---------------------------------------------------------------------
// Per-entry resolution
// ---------------------------------------------------------------------

interface ResultRow {
  id: string
  coverFound: boolean
  discTier: string
  failure?: string
}

async function resolveFilmOrSeries(entry: Entry, credits: Credits): Promise<ResultRow> {
  const dir = path.join(PUBLIC_ASSETS, entry.medium, entry.id)
  await mkdir(dir, { recursive: true })
  const assetCredits: Record<string, CreditRecord> = {}
  const failures: string[] = []
  let coverFound = false
  let discTier = entry.discSource ? `skipped (${entry.discSource})` : 'failed'

  const kind = entry.medium === 'film' ? 'movie' : 'tv'
  const match = await tmdbSearch(kind, entry.title, entry.year)

  if (!match) {
    failures.push('no TMDB match')
    return { id: entry.id, coverFound, discTier, failure: failures.join('; ') }
  }

  if (match.poster_path) {
    const buf = await downloadBuffer(`https://image.tmdb.org/t/p/original${match.poster_path}`)
    if (buf) {
      await saveCover(buf, path.join(dir, 'cover.png'), entry.case)
      coverFound = true
      assetCredits.cover = {
        source: 'TMDB',
        url: `https://www.themoviedb.org/${kind}/${match.id}`,
        licence: 'TMDB, free tier, non-commercial, attribution required',
      }
    } else {
      failures.push('poster download failed')
    }
  } else {
    failures.push('no TMDB poster')
  }

  if (match.backdrop_path) {
    const buf = await downloadBuffer(`https://image.tmdb.org/t/p/w1280${match.backdrop_path}`)
    if (buf) {
      await saveBackdrop(buf, path.join(dir, 'backdrop.jpg'))
      assetCredits.backdrop = {
        source: 'TMDB',
        url: `https://www.themoviedb.org/${kind}/${match.id}`,
        licence: 'TMDB, free tier, non-commercial, attribution required',
      }
    }
  }

  if (!entry.discSource) {
    const discs = await fanartMovieDisc(match.id)
    const chosen = pickBestDisc(discs, entry.case)
    let accepted = false
    if (chosen) {
      const buf = await downloadBuffer(chosen.url)
      if (buf && (await hasRealTransparency(buf))) {
        await saveRetailDisc(buf, path.join(dir, 'disc.png'))
        discTier = 'retail'
        accepted = true
        assetCredits.disc = { source: 'fanart.tv', url: chosen.url, licence: 'fanart.tv, attribution required' }
      }
    }
    if (!accepted) {
      if (coverFound) {
        await saveGeneratedDisc(path.join(dir, 'cover.png'), path.join(dir, 'disc.png'))
        discTier = 'generated'
        assetCredits.disc = {
          source: 'Generated from cover art',
          url: assetCredits.cover?.url ?? '',
          licence: 'Derived from TMDB cover, see cover credit',
        }
      } else {
        discTier = 'failed'
        failures.push('no disc source and no cover to generate from')
      }
    }
  }

  if (Object.keys(assetCredits).length > 0) {
    credits[entry.id] = { ...credits[entry.id], ...assetCredits }
  }

  return { id: entry.id, coverFound, discTier, failure: failures.join('; ') || undefined }
}

async function resolveAlbum(entry: Entry, credits: Credits): Promise<ResultRow> {
  const dir = path.join(PUBLIC_ASSETS, entry.medium, entry.id)
  await mkdir(dir, { recursive: true })
  const assetCredits: Record<string, CreditRecord> = {}
  const failures: string[] = []
  let coverFound = false
  let discTier = entry.discSource ? `skipped (${entry.discSource})` : 'failed'

  const mbid = await musicBrainzReleaseGroup(entry.title, entry.creator)
  if (!mbid) {
    failures.push('no MusicBrainz release-group match')
    return { id: entry.id, coverFound, discTier, failure: failures.join('; ') }
  }

  const coverBuf = await fetchCoverArtArchive(mbid)
  if (coverBuf) {
    await saveCover(coverBuf, path.join(dir, 'cover.png'), entry.case)
    coverFound = true
    assetCredits.cover = {
      source: 'Cover Art Archive',
      url: `https://coverartarchive.org/release-group/${mbid}/front`,
      licence: 'Cover Art Archive / Internet Archive',
    }
  } else {
    // Rommet's coverage was explicitly flagged as unverified in
    // docs/04-lists.md — an empty result here is an anticipated outcome,
    // not necessarily a bug.
    failures.push('no Cover Art Archive image')
  }

  if (!entry.discSource) {
    const cdarts = await fanartAlbumCdart(mbid)
    const chosen = cdarts[0] ?? null
    let accepted = false
    if (chosen) {
      const buf = await downloadBuffer(chosen.url)
      if (buf && (await hasRealTransparency(buf))) {
        await saveRetailDisc(buf, path.join(dir, 'disc.png'))
        discTier = 'retail'
        accepted = true
        assetCredits.disc = { source: 'fanart.tv', url: chosen.url, licence: 'fanart.tv, attribution required' }
      }
    }
    if (!accepted) {
      if (coverFound) {
        await saveGeneratedDisc(path.join(dir, 'cover.png'), path.join(dir, 'disc.png'))
        discTier = 'generated'
        assetCredits.disc = {
          source: 'Generated from cover art',
          url: assetCredits.cover?.url ?? '',
          licence: 'Derived from Cover Art Archive cover, see cover credit',
        }
      } else {
        discTier = 'failed'
        failures.push('no disc source and no cover to generate from')
      }
    }
  }

  if (Object.keys(assetCredits).length > 0) {
    credits[entry.id] = { ...credits[entry.id], ...assetCredits }
  }

  return { id: entry.id, coverFound, discTier, failure: failures.join('; ') || undefined }
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

function parseLimit(): number | undefined {
  const arg = process.argv.find((a) => a.startsWith('--limit='))
  if (!arg) return undefined
  const n = Number(arg.slice('--limit='.length))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

// Targets a specific set of ids, e.g. re-running just the ones a previous
// pass recorded as failed rather than spending the rate-limit budget on
// entries that already succeeded.
function parseOnly(): Set<string> | undefined {
  const arg = process.argv.find((a) => a.startsWith('--only='))
  if (!arg) return undefined
  return new Set(arg.slice('--only='.length).split(','))
}

function printTable(rows: ResultRow[]): void {
  const idWidth = Math.max(5, ...rows.map((r) => r.id.length))
  const tierWidth = Math.max(4, ...rows.map((r) => r.discTier.length))
  const header = `${'entry'.padEnd(idWidth)}  cover  ${'tier'.padEnd(tierWidth)}  failure`
  console.log('\n' + header)
  console.log('-'.repeat(header.length))
  for (const row of rows) {
    console.log(
      `${row.id.padEnd(idWidth)}  ${(row.coverFound ? 'yes' : 'no').padEnd(5)}  ${row.discTier.padEnd(tierWidth)}  ${row.failure ?? ''}`,
    )
  }
  console.log('')
}

async function main() {
  const limit = parseLimit()
  const only = parseOnly()
  const all = [...films, ...series, ...albums]
  const worklist: Entry[] = (only ? all.filter((e) => only.has(e.id)) : all).slice(0, limit)
  const total = films.length + series.length + albums.length
  console.log(
    `Processing ${worklist.length} of ${total} entries${limit ? ` (--limit=${limit})` : ''}${only ? ` (--only=${[...only].join(',')})` : ''}.\n`,
  )

  const credits = await loadCredits()
  const rows: ResultRow[] = []

  for (const entry of worklist) {
    console.log(`${entry.id} (${entry.medium})...`)
    try {
      const row =
        entry.medium === 'album' ? await resolveAlbum(entry, credits) : await resolveFilmOrSeries(entry, credits)
      rows.push(row)
    } catch (err) {
      rows.push({
        id: entry.id,
        coverFound: false,
        discTier: 'failed',
        failure: err instanceof Error ? err.message : String(err),
      })
    }
  }

  await writeFile(CREDITS_PATH, JSON.stringify(credits, null, 2) + '\n', 'utf-8')
  printTable(rows)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
