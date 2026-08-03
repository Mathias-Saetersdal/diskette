import { createContext } from 'react'

/**
 * The DOM node GameCard portals the active Case into, once showCase has
 * risen (GamesList.tsx renders the node, GameCard.tsx reads it). A
 * separate file rather than living in GamesList.tsx itself: GamesList
 * renders GameCard, so GameCard importing the context straight from
 * GamesList.tsx would be a circular import. null outside GamesList's own
 * provider, and GameCard treats that as "nowhere to portal to yet" rather
 * than throwing.
 */
export const GamesActivePortalContext = createContext<HTMLDivElement | null>(null)
