import { allEntries } from './data/lists'
import { assetUrl } from './assetUrl'

/**
 * Warms the browser cache for every disc scan after the page has loaded.
 * Disc PNGs run 2-3MB each and nothing renders them until a case mounts
 * at click time, so without this the disc arrived visibly late into an
 * already-open case — an empty tray for the first second of every cold
 * open. Covers don't need this: the closed cards already load all of
 * them at startup.
 *
 * One image at a time, in list order, started only after window load
 * (plus an idle beat where the browser offers one): sequential requests
 * never compete with the page's own startup traffic or with each other,
 * they just trickle the cache full in the background. Failures skip to
 * the next disc — a missing scan is the fetch pipeline's business, not
 * this preloader's.
 */
export function preloadDiscs() {
  const sources = allEntries.filter((entry) => entry.disc).map((entry) => assetUrl(entry.disc!))

  let index = 0
  const next = () => {
    if (index >= sources.length) return
    const img = new Image()
    // Low network priority where supported: this is cache warming, never
    // something the user is waiting on — the mounted disc's own
    // fetchpriority="high" request wins if both are ever in flight.
    img.fetchPriority = 'low'
    img.onload = next
    img.onerror = next
    img.src = sources[index]
    index += 1
  }

  const start = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => next(), { timeout: 3000 })
    } else {
      setTimeout(next, 1500)
    }
  }

  if (document.readyState === 'complete') {
    start()
  } else {
    window.addEventListener('load', start, { once: true })
  }
}
