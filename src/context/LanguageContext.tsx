// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { createContext, useContext, useState, useEffect } from 'react'
import type { Language } from '../types/story'
import { homePath, langFromPath, swapLangPath } from '../lib/routes'

const SUPPORTED: Language[] = ['de', 'en']
const STORAGE_KEY = 'firlefanz-language'

// The language is encoded in the URL (the /en/ prefix). The default is German:
// "/" and every German story URL render German with no redirect, so a German
// visitor always gets German and crawlers always see "/" as the German page.
//
// On the *bare* home root only, a returning visitor who previously chose English
// is sent to /en/. This is gated on the stored preference (NOT navigator.language)
// on purpose: a JS-rendering crawler has no localStorage, so it is never
// redirected and "/" stays unambiguously the German canonical. A first-time
// non-German visitor sees German at "/" and can switch via the toggle (and lands
// on /en/ directly from English search results via hreflang).
function resolveInitialLanguage(): Language {
  if (langFromPath(window.location.pathname) === 'en') return 'en'
  if (window.location.pathname !== homePath('de')) return 'de' // a German story URL
  if (localStorage.getItem(STORAGE_KEY) === 'en') {
    history.replaceState(null, '', homePath('en'))
    return 'en'
  }
  return 'de'
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
  const [language, setLanguageState] = useState<Language>(resolveInitialLanguage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
    // Keep the document language in sync so screen readers and search engines
    // see the language the visitor is actually reading in.
    document.documentElement.lang = language
  }, [language])

  // Keep the context in sync with the URL on browser back/forward.
  useEffect(() => {
    const sync = () => setLanguageState(langFromPath(window.location.pathname))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  // Switching language navigates to the equivalent URL in the target language and
  // notifies the router (App listens for popstate) so the open story stays open.
  const setLanguage = (lang: Language) => {
    if (lang === language) return
    history.pushState(null, '', swapLangPath(window.location.pathname, window.location.hash, lang))
    setLanguageState(lang)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, supportedLanguages: SUPPORTED }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
