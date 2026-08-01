import type { CSSProperties, RefObject } from 'react'
import { FRONT_FACE_RATIO } from './JewelCase'
import './FlatJewelCase.css'

interface FlatJewelCaseProps {
  title: string
  coverSrc: string
  coverAlt: string
  onClick: () => void
  buttonRef?: RefObject<HTMLButtonElement | null>
}

/**
 * The closed jewel case: a flat, non-3D placeholder for a list's inactive
 * entries, mirroring FlatCase.tsx's role for keep cases. Renders the same
 * booklet-under-glass material JewelCase.tsx uses for its own open front
 * face — .jewel-case__front-shell/poster/refraction/gloss (JewelCase.css)
 * are already self-contained inset:0 layers with no dependency on
 * JewelCase's 3D ancestor beyond a sized, positioned parent, so they mount
 * here unchanged rather than needing a second copy. Simpler than FlatCase:
 * jewel has one fixed size and no livery, so there is no per-format
 * geometry lookup or header treatment to branch on.
 */
export default function FlatJewelCase({ title, coverSrc, coverAlt, onClick, buttonRef }: FlatJewelCaseProps) {
  const style = { '--front-face-ratio': FRONT_FACE_RATIO } as CSSProperties

  return (
    <button
      ref={buttonRef}
      type="button"
      className="flat-jewel-case"
      style={style}
      aria-label={`Open case: ${title}`}
      onClick={onClick}
    >
      <div className="jewel-case__front-shell">
        <div className="jewel-case__front-poster">
          <img src={coverSrc} alt={coverAlt} loading="lazy" />
          <div className="jewel-case__front-refraction" aria-hidden="true" />
        </div>
        <div className="jewel-case__front-gloss" aria-hidden="true" />
      </div>
    </button>
  )
}
