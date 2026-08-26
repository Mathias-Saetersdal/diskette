import { createContext } from 'react'
import type { Language } from './language'

export interface LanguageContextValue {
  language: Language
  setLanguage: (next: Language) => void
}

/**
 * Context object only, provider separate — same split SettleContext.ts
 * already uses, so fast refresh keeps working on the provider file.
 * null default: reading this outside the provider is a programming
 * error, and useLanguage.ts throws on it rather than silently rendering
 * the fallback language.
 */
export const LanguageContext = createContext<LanguageContextValue | null>(null)
