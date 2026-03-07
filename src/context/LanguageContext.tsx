// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { createContext, useContext, useState, useEffect } from 'react'
import type { Language } from '../types/story'

const SUPPORTED: Language[] = ['de', 'en']

function detectBrowserLanguage(): Language {
  const lang = navigator.language?.split('-')[0] ?? 'de'
  return SUPPORTED.includes(lang) ? lang : 'de'
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
