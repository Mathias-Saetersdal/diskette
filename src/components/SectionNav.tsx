import { useEffect, useState } from 'react'
import { ui, type UIStrings } from '../i18n/ui'
import { useLanguage } from '../i18n/useLanguage'
import './SectionNav.css'

// The ids stay Norwegian in both languages: they resolve through
// getElementById below and are visible in the address bar, so
// translating them would break existing links. Only the label is looked
// up per language.
const SECTIONS: { id: string; labelKey: keyof UIStrings & `${string}Heading` }[] = [
  { id: 'filmer', labelKey: 'filmsHeading' },
  { id: 'serier', labelKey: 'seriesHeading' },
  { id: 'album', labelKey: 'albumsHeading' },
  { id: 'spill', labelKey: 'gamesHeading' },
]

/**
 * Reads as a position indicator first, a jump link second: the four
 * labels are always on screen and always say where you are on the page
 * (current section marked by weight and opacity, no accent colour to
 * spend), and only secondarily happen to be clickable. Desktop only —
 * hidden below 768px with no mobile equivalent, because the section
 * headings each list already renders (MediaList.tsx's own h2) do that
 * same job on a phone, one at a time, as they scroll past.
 */
export default function SectionNav() {
  const { language } = useLanguage()
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const elements = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (elements.length === 0) return

    // A band across the viewport's own vertical middle, not scroll-offset
    // arithmetic: shrinking the root via rootMargin means a section only
    // counts once it reaches that middle rather than merely being
    // somewhere on screen. A single-pixel line (-50% both sides) sounds
    // more precise but isn't robust — the last section here never has
    // enough page left below it to push its own midpoint past that exact
    // pixel before the page runs out of scroll room, so it would sit
    // fully in view and never register. A band is forgiving enough for
    // every section to reach it, including the last.
    const isIntersecting = new Map<string, boolean>()

    const pickCurrent = () => {
      const ids = [...isIntersecting.entries()].filter(([, value]) => value).map(([id]) => id)
      if (ids.length === 0) return
      // More than one id can be in the band at once when a section is
      // short enough that its neighbour's edge reaches in too. Break the
      // tie by whichever section's own midpoint sits closest to the
      // viewport's centre, rather than whichever the browser happened to
      // report first.
      const centre = window.innerHeight / 2
      let closestId = ids[0]
      let closestDistance = Infinity
      for (const id of ids) {
        const rect = document.getElementById(id)?.getBoundingClientRect()
        if (!rect) continue
        const distance = Math.abs((rect.top + rect.bottom) / 2 - centre)
        if (distance < closestDistance) {
          closestDistance = distance
          closestId = id
        }
      }
      setActiveId(closestId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => isIntersecting.set(entry.target.id, entry.isIntersecting))
        pickCurrent()
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    const target = document.getElementById(id)
    if (!target) return
    // Set directly rather than waiting on the observer to catch up. A
    // clicked section lands at the viewport's top edge (below), which is
    // the right place to land but not the middle band pickCurrent()
    // watches — a short section pinned to the top can sit entirely above
    // that band and never trip it. The click itself already answers the
    // question of what's current, so there is nothing to wait for.
    setActiveId(id)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <nav className="section-nav" aria-label={ui[language].navAriaLabel}>
      <ul className="section-nav__list">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="section-nav__link"
              data-current={section.id === activeId}
              onClick={(event) => handleClick(event, section.id)}
            >
              {ui[language][section.labelKey]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
