import type { Language } from './language'

/**
 * Every interface string that differs between the two languages, plus the
 * case aria-labels, which take the entry's title. Titles themselves are
 * never translated. The toggle strings describe the language the button
 * produces, not the one currently shown, and each carries the language it
 * is written in so the component can set lang on the button.
 */
export interface UIStrings {
  filmsHeading: string
  seriesHeading: string
  albumsHeading: string
  gamesHeading: string
  filmsAriaLabel: string
  seriesAriaLabel: string
  albumsAriaLabel: string
  gamesAriaLabel: string
  navAriaLabel: string
  introAriaLabel: string
  footerCredit: string
  languageToggleLabel: string
  languageToggleAriaLabel: string
  openCase: (title: string) => string
  closeCase: (title: string) => string
  liftDisc: (title: string) => string
  returnDisc: string
}

export const ui: Record<Language, UIStrings> = {
  nb: {
    filmsHeading: 'Filmer',
    seriesHeading: 'Serier',
    albumsHeading: 'Album',
    gamesHeading: 'Spill',
    filmsAriaLabel: 'Filmer, gjennom tidene',
    seriesAriaLabel: 'Serier, gjennom tidene',
    albumsAriaLabel: 'Album, gjennom tidene',
    gamesAriaLabel: 'Spill, gjennom tidene',
    navAriaLabel: 'Seksjoner',
    introAriaLabel: 'Intro',
    footerCredit: 'Laget av Mathias Sætersdal',
    languageToggleLabel: 'English',
    languageToggleAriaLabel: 'Switch to English',
    openCase: (title) => `Åpne eske: ${title}`,
    closeCase: (title) => `Lukk eske: ${title}`,
    liftDisc: (title) => `Løft platen til ${title}`,
    returnDisc: 'Legg platen tilbake',
  },
  en: {
    filmsHeading: 'Films',
    seriesHeading: 'Series',
    albumsHeading: 'Albums',
    gamesHeading: 'Games',
    filmsAriaLabel: 'Films, all time',
    seriesAriaLabel: 'Series, all time',
    albumsAriaLabel: 'Albums, all time',
    gamesAriaLabel: 'Games, all time',
    navAriaLabel: 'Sections',
    introAriaLabel: 'Intro',
    footerCredit: 'Made by Mathias Sætersdal',
    languageToggleLabel: 'Norsk',
    languageToggleAriaLabel: 'Bytt til norsk',
    openCase: (title) => `Open case: ${title}`,
    closeCase: (title) => `Close case: ${title}`,
    liftDisc: (title) => `Lift ${title} disc`,
    returnDisc: 'Return disc to tray',
  },
}
