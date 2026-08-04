import { createContext } from 'react'

/**
 * Whether this row's settle-on-first-view animation (build plan stage 9,
 * useSettleOnFirstView.ts) has fired — read by each row's own card
 * component, which applies it only to the entry ranked 1. One context
 * definition, shared the same way ActivePortal.ts's own comment
 * explains: each list wrapper provides its own value to its own
 * subtree, so four separate rows never see each other's timing.
 */
export const SettleContext = createContext(false)
