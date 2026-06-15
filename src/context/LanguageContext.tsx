// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { createContext, useContext, useState, useEffect } from 'react'
import type { Language } from '../types/story'

const SUPPORTED: Language[] = ['de', 'en']

// Pick the default language from the browser preference:
// German only for German-speaking locales (Germany, Switzerland, Austria —
// de-DE, de-CH, de-AT, and Swiss German "gsw"); English for everyone else.
function detectBrowserLanguage(): Language {
  const lang = (navigator.language ?? '').toLowerCase()
  if (lang.startsWith('de') || lang.startsWith('gsw')) return 'de'
  return 'en'
}

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  supportedLanguages: Language[]
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'de',
  setLanguage: () => {},
  supportedLanguages: SUPPORTED,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('firlefanz-language')
    if (stored && SUPPORTED.includes(stored)) return stored
    return detectBrowserLanguage()
  })

  useEffect(() => {
    localStorage.setItem('firlefanz-language', language)
    // Keep the document language in sync so screen readers and search engines
    // see the language the visitor is actually reading in.
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageState, supportedLanguages: SUPPORTED }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
