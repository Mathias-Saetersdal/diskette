import type { CSSProperties, RefObject } from 'react'
import type { Livery } from '../data/lists'
import { CASE_GEOMETRY, MAX_CASE_HEIGHT_MM, type SupportedCaseFormat } from './caseGeometry'
import CaseFrontFace from './CaseFrontFace'
import './FlatCase.css'

interface FlatCaseProps {
  title: string
  coverSrc: string
  coverAlt: string
  caseFormat: SupportedCaseFormat
  livery: Livery
  onClick: () => void
  /** Focused when this placeholder remounts after the case it replaced closes. */
  buttonRef?: RefObject<HTMLButtonElement | null>
}

/**
 * The closed representation for every entry that isn't the active one in a
 * list: the same printed front face Case shows when open, CaseFrontFace,
 * with nothing else around it. No transform-style: preserve-3d, no
 * perspective, no filter — those are exactly what "no 3D subtree" rules
 * out, and what makes mounting ten of these at once cheap where ten Cases
 * would not be. Sized off the same CASE_GEOMETRY/MAX_CASE_HEIGHT_MM Case
 * itself uses, so a flat DVD placeholder and a flat Blu-ray placeholder
 * stand at the correct relative heights next to each other and next to
 * whichever entry is open.
 */
export default function FlatCase({ title, coverSrc, coverAlt, caseFormat, livery, onClick, buttonRef }: FlatCaseProps) {
  const { heightMm, widthMm } = CASE_GEOMETRY[caseFormat]
  const style = {
    '--front-face-ratio': widthMm / heightMm,
    '--height-scale': heightMm / MAX_CASE_HEIGHT_MM,
  } as CSSProperties

  return (
    <button
      ref={buttonRef}
      type="button"
      className="flat-case"
      style={style}
      aria-label={`Open case: ${title}`}
      onClick={onClick}
    >
      <CaseFrontFace coverSrc={coverSrc} coverAlt={coverAlt} caseFormat={caseFormat} livery={livery} />
    </button>
  )
}
