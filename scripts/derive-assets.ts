// Build-time asset derivatives. Reads the committed originals under the
// public assets directory and writes resized WebP copies plus a metadata
// record per original into src/data/assets.generated.json. Originals stay
// committed; derivatives are regenerated at build (package.json prebuild).
// Run with: tsx scripts/derive-assets.ts [--force] [--only=<substring>]
//
// No network. This script only reads files the fetch script already
// committed, per the fetch-once rule in docs/02-asset-sources.md.

import { mkdir, readdir, stat, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { rgbaToThumbHash } from 'thumbhash'
import { allEntries } from '../src/data/lists.ts'

// Widths are measured against the rendered site, not guessed. 260 covers
// the widest resting cover face (jewel, 99px layout desktop / 84px mobile)
// at DPR 3. 512 covers the widest open face (jewel, 193.66px on screen at
// 1440) and the widest disc (jewel, 190.37px on screen at 1440) at DPR 3.
// The open figures already include the scale(2) enlarge transform
// (caseMechanism.css).
const LIST_WIDTH = 260
const LIST_QUALITY = 80
const FULL_WIDTH = 512
const FULL_QUALITY = 82

// Transparency must survive: discs carry a punched hub hole and a clear
// inner ring as real alpha (docs/02-asset-sources.md, "Transparent PNGs
// only for discs"). alphaQuality stays at 100 for both variants.
const ALPHA_QUALITY = 100
const WEBP_EFFORT = 5

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GENERATED_JSON = path.join(REPO_ROOT, 'src', 'data', 'assets.generated.json')

interface AssetRecord {
  list: string
  full: string
  listWidth: number
  fullWidth: number
  width: number
  height: number
  thumbhash: string
  dominant: string
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

/**
 * The directory the root-absolute path strings in lists.ts resolve
 * against. Discovered by probing the first entry's own cover path under
 * the conventional static roots rather than hardcoding "public", so a
 * moved publicDir fails loudly here instead of silently deriving nothing.
 */
function discoverServeRoot(): string {
  const sample = allEntries[0]?.cover
  if (!sample) fail('src/data/lists.ts has no entries to take a sample path from.')
  for (const candidate of ['public', 'static', '.']) {
    const root = path.join(REPO_ROOT, candidate)
    if (existsSync(path.join(root, sample))) return root
  }
  fail(
    `Could not find the assets directory: no static root contains ${sample}. ` +
      'Checked public/, static/ and the repo root.',
  )
}

/** Every path string lists.ts carries that should exist on disk. */
function listedPaths(): string[] {
  const paths: string[] = []
  for (const entry of allEntries) {
    paths.push(entry.cover)
    if (entry.disc) paths.push(entry.disc)
    if (entry.spine) paths.push(entry.spine)
    if (entry.back) paths.push(entry.back)
  }
  return paths
}

/**
 * Recursively collect original asset files. Skips .DS_Store, the marks
 * directory (shared UI chrome, left as is) and the derived output tree
 * itself. src/assets/ never appears here at all: the walk is rooted at
 * the served assets directory, which src/ is not part of.
 */
async function collectOriginals(assetsDir: string): Promise<string[]> {
  const files: string[] = []
  async function walk(dir: string) {
    for (const dirent of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, dirent.name)
      if (dirent.isDirectory()) {
        const rel = path.relative(assetsDir, full)
        if (rel === 'marks' || rel === 'derived') continue
        await walk(full)
      } else if (dirent.name !== '.DS_Store') {
        files.push(full)
      }
    }
  }
  await walk(assetsDir)
  return files.sort()
}

function toHex(value: number): string {
  return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')
}

/** Encode one WebP variant and return its real output width. */
async function encodeVariant(
  source: string,
  outPath: string,
  targetWidth: number,
  quality: number,
  inputHasAlpha: boolean,
): Promise<number> {
  await mkdir(path.dirname(outPath), { recursive: true })
  // withoutEnlargement: never upscale. A narrower original encodes at its
  // own width and the record carries that real number for srcset.
  await sharp(source)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality, alphaQuality: ALPHA_QUALITY, effort: WEBP_EFFORT })
    .toFile(outPath)
  const outMeta = await sharp(outPath).metadata()
  if (inputHasAlpha && !outMeta.hasAlpha) {
    fail(`Alpha channel lost encoding ${source} -> ${outPath}. Refusing to continue.`)
  }
  if (!outMeta.width) fail(`No width reported for encoded output ${outPath}.`)
  return outMeta.width
}

async function buildRecord(source: string, key: string, derivedDir: string): Promise<AssetRecord> {
  const meta = await sharp(source).metadata()
  if (!meta.width || !meta.height) fail(`Could not read dimensions of ${source}.`)
  const hasAlpha = meta.hasAlpha === true

  const base = path.basename(source, path.extname(source))
  const relDir = path.dirname(key.replace(/^\/assets\//, ''))
  const listOut = path.join(derivedDir, relDir, `${base}.list.webp`)
  const fullOut = path.join(derivedDir, relDir, `${base}.full.webp`)

  const listWidth = await encodeVariant(source, listOut, LIST_WIDTH, LIST_QUALITY, hasAlpha)
  const fullWidth = await encodeVariant(source, fullOut, FULL_WIDTH, FULL_QUALITY, hasAlpha)

  // Thumbhash wants raw RGBA at 100px or under on both axes.
  const { data, info } = await sharp(source)
    .resize(100, 100, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const hash = rgbaToThumbHash(info.width, info.height, data)
  const thumbhash = Buffer.from(hash).toString('base64')

  const { dominant } = await sharp(source).stats()
  const dominantHex = `#${toHex(dominant.r)}${toHex(dominant.g)}${toHex(dominant.b)}`

  const toKeyPath = (p: string) => `/assets/derived/${path.relative(derivedDir, p).split(path.sep).join('/')}`
  return {
    list: toKeyPath(listOut),
    full: toKeyPath(fullOut),
    listWidth,
    fullWidth,
    width: meta.width,
    height: meta.height,
    thumbhash,
    dominant: dominantHex,
  }
}

async function main() {
  const force = process.argv.includes('--force')
  // Same flag shape as scripts/fetch-assets.ts: --only=<value>. A separate
  // "--only value" form is accepted too.
  const onlyEq = process.argv.find((a) => a.startsWith('--only='))
  const onlyIdx = process.argv.indexOf('--only')
  const only = onlyEq
    ? onlyEq.slice('--only='.length)
    : onlyIdx !== -1
      ? process.argv[onlyIdx + 1]
      : undefined
  if (onlyIdx !== -1 && !only) fail('--only needs a substring.')

  const serveRoot = discoverServeRoot()
  const assetsDir = path.join(serveRoot, 'assets')
  const derivedDir = path.join(assetsDir, 'derived')

  // Every path lists.ts points at must exist before anything derives.
  const missing = listedPaths().filter((p) => !existsSync(path.join(serveRoot, p)))
  if (missing.length > 0) {
    console.error('Paths in src/data/lists.ts with no file on disk:')
    for (const p of missing) console.error(`  ${p}`)
    process.exit(1)
  }

  const originals = await collectOriginals(assetsDir)
  if (originals.length === 0) fail(`No originals found under ${assetsDir}.`)

  const previous: Record<string, AssetRecord> = existsSync(GENERATED_JSON)
    ? JSON.parse(await readFile(GENERATED_JSON, 'utf8'))
    : {}

  const records: Record<string, AssetRecord> = {}
  let processed = 0
  let skipped = 0
  let totalOriginalBytes = 0

  for (const source of originals) {
    const key = `/${path.relative(serveRoot, source).split(path.sep).join('/')}`
    const sourceStat = await stat(source)
    totalOriginalBytes += sourceStat.size

    if (only && !key.includes(only)) {
      // Out of scope for this run. Keep whatever record it already had.
      if (previous[key]) records[key] = previous[key]
      skipped += 1
      continue
    }

    const base = path.basename(source, path.extname(source))
    const relDir = path.dirname(path.relative(assetsDir, source))
    const listOut = path.join(derivedDir, relDir, `${base}.list.webp`)
    const fullOut = path.join(derivedDir, relDir, `${base}.full.webp`)

    const isFresh = async (outPath: string) =>
      existsSync(outPath) && (await stat(outPath)).mtimeMs > sourceStat.mtimeMs

    if (!force && previous[key] && (await isFresh(listOut)) && (await isFresh(fullOut))) {
      records[key] = previous[key]
      skipped += 1
      continue
    }

    try {
      records[key] = await buildRecord(source, key, derivedDir)
    } catch (error) {
      console.error(`Failed deriving ${source}:`)
      console.error(error)
      process.exit(1)
    }
    processed += 1
  }

  // A record whose original vanished is dropped, loudly, never silently.
  for (const key of Object.keys(previous)) {
    if (!(key in records)) {
      console.warn(`Dropping record for ${key}: no original on disk any more.`)
    }
  }

  const sorted: Record<string, AssetRecord> = {}
  for (const key of Object.keys(records).sort()) sorted[key] = records[key]
  await writeFile(GENERATED_JSON, `${JSON.stringify(sorted, null, 2)}\n`)

  // Derived bytes and the largest outputs, read from the files the final
  // records actually point at.
  let totalDerivedBytes = 0
  const derivedSizes: { file: string; bytes: number }[] = []
  for (const record of Object.values(sorted)) {
    for (const rel of [record.list, record.full]) {
      const file = path.join(serveRoot, rel)
      const bytes = (await stat(file)).size
      totalDerivedBytes += bytes
      derivedSizes.push({ file: rel, bytes })
    }
  }
  derivedSizes.sort((a, b) => b.bytes - a.bytes)

  const reduction = ((1 - totalDerivedBytes / totalOriginalBytes) * 100).toFixed(1)
  console.log(`files processed: ${processed}`)
  console.log(`files skipped: ${skipped}`)
  console.log(`total original bytes: ${totalOriginalBytes}`)
  console.log(`total derived bytes: ${totalDerivedBytes}`)
  console.log(`reduction: ${reduction}%`)
  console.log('largest derived files:')
  for (const { file, bytes } of derivedSizes.slice(0, 5)) {
    console.log(`  ${file}  ${bytes}`)
  }
}

await main()
