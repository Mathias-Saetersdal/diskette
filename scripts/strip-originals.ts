// Postbuild gate: strips the committed originals out of dist/ after vite
// build has copied public/ into it, so the deployment ships derivatives
// only. Allowlist, not denylist — a media directory added later fails
// toward being excluded from the deploy, not toward shipping 165MB of
// originals unnoticed. Runs via package.json's postbuild, so it is part
// of every `npm run build`; public/ itself is never touched and a rerun
// of vite build recreates dist from it.
//
// What survives under dist/assets/:
//   - everything under derived/ (the generated WebPs)
//   - everything under marks/ (shared UI chrome, unhashed, replaceable)
//   - Vite build outputs at the top level, identified by all three of:
//     a plain file directly in dist/assets/, a Vite content-hash suffix
//     ("-" plus 8 hash chars before the extension), and a bundle
//     extension (js, css, woff, woff2). The extension list is the hard
//     line: media is png/jpg/webp, which are never bundle extensions, so
//     media can never pass the test. A future bundled asset type (say an
//     imported svg) would fail it and be deleted — visible immediately,
//     both in the kept-files log below and as a 404 in preview — and the
//     fix is extending the extension list here.
import { readdir, stat, unlink, rmdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(REPO_ROOT, 'dist')
const ASSETS = path.join(DIST, 'assets')
const KEPT_DIRS = new Set(['derived', 'marks'])
const BUNDLE_FILE = /-[A-Za-z0-9_-]{8}\.(js|css|woff2?)$/

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

async function walkFiles(dir: string): Promise<string[]> {
  const out: string[] = []
  for (const dirent of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, dirent.name)
    if (dirent.isDirectory()) out.push(...(await walkFiles(full)))
    else out.push(full)
  }
  return out
}

/** Delete every file under dir, then the directory tree itself. */
async function deleteTree(dir: string): Promise<{ files: number; bytes: number }> {
  let files = 0
  let bytes = 0
  for (const dirent of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, dirent.name)
    if (dirent.isDirectory()) {
      const sub = await deleteTree(full)
      files += sub.files
      bytes += sub.bytes
    } else {
      try {
        bytes += (await stat(full)).size
        await unlink(full)
        files += 1
      } catch (error) {
        console.error(`Failed to delete ${full}:`)
        console.error(error)
        process.exit(1)
      }
    }
  }
  try {
    await rmdir(dir)
  } catch (error) {
    console.error(`Failed to remove directory ${dir}:`)
    console.error(error)
    process.exit(1)
  }
  return { files, bytes }
}

async function main() {
  // Never run against a half-built dist: the derivatives and marks must
  // already be in place or this build is broken upstream of here.
  if (!existsSync(ASSETS)) fail(`${ASSETS} does not exist. Run vite build first.`)
  const derivedDir = path.join(ASSETS, 'derived')
  if (!existsSync(derivedDir)) fail(`${derivedDir} does not exist. Refusing to strip a half-built dist.`)
  if ((await walkFiles(derivedDir)).length === 0) {
    fail(`${derivedDir} is empty. Refusing to strip a half-built dist.`)
  }
  if (!existsSync(path.join(ASSETS, 'marks'))) {
    fail(`${path.join(ASSETS, 'marks')} does not exist. Refusing to strip a half-built dist.`)
  }

  let deletedFiles = 0
  let deletedBytes = 0
  const keptTopLevel: string[] = []

  for (const dirent of await readdir(ASSETS, { withFileTypes: true })) {
    const full = path.join(ASSETS, dirent.name)
    if (dirent.isDirectory()) {
      if (KEPT_DIRS.has(dirent.name)) continue
      const sub = await deleteTree(full)
      deletedFiles += sub.files
      deletedBytes += sub.bytes
    } else if (BUNDLE_FILE.test(dirent.name)) {
      keptTopLevel.push(dirent.name)
    } else {
      // Top-level file that is not a Vite bundle output (a stray
      // .DS_Store the originals tree carried, or an asset type this
      // allowlist does not know). Excluded, loudly countable.
      try {
        deletedBytes += (await stat(full)).size
        await unlink(full)
        deletedFiles += 1
      } catch (error) {
        console.error(`Failed to delete ${full}:`)
        console.error(error)
        process.exit(1)
      }
    }
  }

  let remainingBytes = 0
  for (const file of await walkFiles(DIST)) {
    remainingBytes += (await stat(file)).size
  }

  console.log(`stripped originals from dist/assets`)
  console.log(`files deleted: ${deletedFiles}`)
  console.log(`bytes deleted: ${deletedBytes}`)
  console.log(`bytes remaining under dist/: ${remainingBytes}`)
  console.log(`kept at top level of dist/assets/ (${keptTopLevel.length}):`)
  for (const name of keptTopLevel.sort()) {
    console.log(`  ${name}`)
  }
}

await main()
