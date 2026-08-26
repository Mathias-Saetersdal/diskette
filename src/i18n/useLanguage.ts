import { useContext } from 'react'
import { LanguageContext } from './languageContext'
import type { LanguageContextValue } from './languageContext'

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext)
  if (value === null) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return value
}
