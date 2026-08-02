import type { CaseFormat } from '../data/lists'

// dvd, bluray and ps5 are built here — jewel and switch are other
// media/livery's job (jewel has its own component, switch has no entries
// in the lists at all). Shared between Case (the full object) and FlatCase
// (the closed placeholder) — pulled into its own module, not exported from
// Case.tsx, because exporting plain values alongside a component breaks
// fast refresh for that file.
export type SupportedCaseFormat = Extract<CaseFormat, 'dvd' | 'bluray' | 'ps5'>

// docs/03-object-spec.md Cases table: H x W x D per format. ps5 is still
// marked unverified there (no real case measured yet).
export const CASE_GEOMETRY: Record<SupportedCaseFormat, { heightMm: number; widthMm: number; depthMm: number }> = {
  dvd: { heightMm: 184, widthMm: 130, depthMm: 14 },
  bluray: { heightMm: 148, widthMm: 128.5, depthMm: 12 },
  ps5: { heightMm: 148, widthMm: 135, depthMm: 14 },
}

// The tallest case in the table sets the on-screen scale: --case-h in
// Case.css is capped in viewport units, and every format's actual height
// is that cap times its own heightMm over this figure. A fixed reference,
// not one derived from whatever happens to be on screen at once — so a
// Blu-ray case is always ~80% of a DVD case's height, alone or side by
// side, per "Dimensions are real millimetres, used as ratios" (03-object-spec.md).
export const MAX_CASE_HEIGHT_MM = Math.max(...Object.values(CASE_GEOMETRY).map((format) => format.heightMm))
