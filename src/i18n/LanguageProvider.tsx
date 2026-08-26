import { useEffect, useState, type ReactNode } from 'react'
import type { Language } from './language'
import { LanguageContext } from './languageContext'

const STORAGE_KEY = 'diskette-language'

/**
 * Norwegian for everyone, deterministically — the stored preference is
 * the only thing that overrides it, never navigator.language. Only the
 * two exact values are accepted back from storage, so a stale or
 * tampered key falls through to the default instead of leaking into
 * document.documentElement.lang.
 */
function initialLanguage(): Language {
  // try/catch, not a capability check: private browsing can make the
  // access itself throw, and a thrown error here would take the whole
  // page down over a preference.
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'nb' || stored === 'en') return stored
  } catch {
    // Storage unavailable: the default below covers it.
  }
  return 'nb'
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  // Runs on mount too, not only on change: index.html already ships
  // lang="nb", so this is a no-op for the default first paint, and the
  // correction for a visitor whose stored preference is English.
  useEffect(() => {
    document.documentElement.lang = language
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Storage unavailable: the preference just doesn't survive a
      // reload, which is the best available behaviour.
    }
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}
