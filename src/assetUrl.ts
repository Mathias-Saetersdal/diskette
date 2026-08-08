/**
 * Prefixes a root-absolute public/ asset path with Vite's own base
 * (import.meta.env.BASE_URL, set from vite.config.ts's base). Vite only
 * rewrites asset references it processes itself (JS imports, index.html's
 * own href/src attributes, CSS url()). A plain string like "/assets/x.png"
 * used as a React <img src> value is never touched by that pipeline, so it
 * resolves against the domain root and 404s under any non-root base. This
 * site currently deploys at the domain root (base: '/'), so BASE_URL is a
 * no-op today, but a previous subpath deploy (github.io/diskette/) hit
 * exactly this 404 on every cover and disc image, so the wrapper stays in
 * place for whichever base is configured.
 *
 * Every entry field and constant that holds one of these paths
 * (src/data/lists.ts's cover/disc, CaseFrontFace.tsx's platform marks,
 * Footer.tsx's source logos) keeps storing the plain root-absolute
 * string — this only wraps it at the point each gets read into a
 * component prop, so the data files themselves stay free of build
 * tooling concerns.
 */
export function assetUrl(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
