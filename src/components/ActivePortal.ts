import { createContext } from 'react'

/**
 * The DOM node a list's active card portals its full case into, once
 * showCase has risen — one context definition, shared by KeepCaseCard
 * (films, series) and AlbumCard (albums), with each list wrapper
 * (FilmsList, SeriesList, AlbumsList) providing its own node as the
 * value for its own subtree. React scopes a context read to its nearest
 * ancestor Provider, so three separate <MediaList> trees under three
 * separate Providers never see each other's slot, the same isolation
 * three separate context definitions would give, without declaring three.
 *
 * Games keeps its own separate GamesActivePortal.ts/GameCard.tsx
 * unchanged — the games row is frozen, and duplicating this definition
 * there rather than importing this one keeps that freeze real rather
 * than nominal.
 *
 * A separate file rather than living in one of the list components: any
 * of them importing it from a sibling list component would be exactly
 * the circular import GamesActivePortal.ts's own comment already
 * describes avoiding.
 */
export const ActivePortalContext = createContext<HTMLDivElement | null>(null)
