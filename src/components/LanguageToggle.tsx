import { ui } from '../i18n/ui'
import { useLanguage } from '../i18n/useLanguage'
import './LanguageToggle.css'

/**
 * The one control that switches the whole page's language. Labelled with
 * the language it produces, not the one currently shown, and its
 * aria-label is written in that same language — so the button also
 * carries that language's own lang attribute, letting a screen reader
 * pronounce "English" as English and "Bytt til norsk" as Norwegian.
 * Fixed top right as SectionNav's counterpart on the left, but never
 * hidden at narrow widths the way that nav is: on a phone this is the
 * only way to change language.
 */
export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  const offered = language === 'nb' ? 'en' : 'nb'
  return (
    <button
      type="button"
      className="language-toggle"
      lang={offered}
      aria-label={ui[language].languageToggleAriaLabel}
      onClick={() => setLanguage(offered)}
    >
      {ui[language].languageToggleLabel}
    </button>
  )
}
