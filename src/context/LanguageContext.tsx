// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { createContext, useContext, useState, useEffect } from 'react'
import type { Language } from '../types/story'
import { homePath, langFromPath, swapLangPath } from '../lib/routes'

const SUPPORTED: Language[] = ['de', 'en']
const STORAGE_KEY = 'firlefanz-language'

// Pick the default language from the browser preference:
// German only for German-speaking locales (Germany, Switzerland, Austria —
// de-DE, de-CH, de-AT, and Swiss German "gsw"); English for everyone else.
function detectBrowserLanguage(): Language {
  const lang = (navigator.language ?? '').toLowerCase()
  if (lang.startsWith('de') || lang.startsWith('gsw')) return 'de'
  return 'en'
}

// The language is encoded in the URL (the /en/ prefix). On the *bare* home root
// only — where no language is expressed yet — fall back to the stored preference,
// then the browser locale, and reflect that choice in the URL. This is a JS-only
// redirect of the home root, so crawlers indexing the static German "/" still see
// German; per-story URLs are always explicit and never redirect.
function resolveInitialLanguage(): Language {
  const fromUrl = langFromPath(window.location.pathname)
  if (fromUrl === 'en') return 'en'
  if (window.location.pathname !== homePath('de')) return 'de' // a German story URL
  const stored = localStorage.getItem(STORAGE_KEY)
  const pref = stored && SUPPORTED.includes(stored) ? stored : detectBrowserLanguage()
  if (pref === 'en') {
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
