// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { LanguageProvider, useLanguage } from './LanguageContext'

const STORAGE_KEY = 'firlefanz-language'

describe('LanguageProvider (URL-driven)', () => {
  let navLangSpy: ReturnType<typeof vi.spyOn> | null = null

  beforeEach(() => {
    localStorage.clear()
    history.replaceState(null, '', '/')
  })

  afterEach(() => {
    cleanup()
    navLangSpy?.mockRestore()
    navLangSpy = null
    localStorage.clear()
    history.replaceState(null, '', '/')
  })

  function mockBrowserLanguage(lang: string | undefined) {
    navLangSpy = vi.spyOn(navigator, 'language', 'get').mockReturnValue(lang as string)
  }

  function wrapper({ children }: { children: React.ReactNode }) {
    return <LanguageProvider>{children}</LanguageProvider>
  }

  it('is German on the root with a German browser and no stored preference', () => {
    mockBrowserLanguage('de-CH')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('de')
    expect(window.location.pathname).toBe('/')
  })

  it('keeps the bare root German for a non-German browser with no stored preference', () => {
    // The redirect is gated on the stored preference only (not navigator.language)
    // so JS-rendering crawlers are never redirected and "/" stays German.
    mockBrowserLanguage('fr-FR')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('de')
    expect(window.location.pathname).toBe('/')
  })

  it('redirects the bare root to /en/ when the stored preference is English', () => {
    localStorage.setItem(STORAGE_KEY, 'en')
    mockBrowserLanguage('de-DE')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('en')
    expect(window.location.pathname).toBe('/en/')
  })

  it('reads English from an explicit /en/ URL', () => {
    history.replaceState(null, '', '/en/')
    mockBrowserLanguage('de-DE')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('en')
  })

  it('keeps a German story URL German even with an English browser (no redirect)', () => {
    history.replaceState(null, '', '/geschichten/der-mond/')
    mockBrowserLanguage('en-US')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('de')
    expect(window.location.pathname).toBe('/geschichten/der-mond/')
  })

  it('setLanguage navigates to the equivalent URL and persists the choice', () => {
    mockBrowserLanguage('de-DE')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('de')

    act(() => result.current.setLanguage('en'))
    expect(result.current.language).toBe('en')
    expect(window.location.pathname).toBe('/en/')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('en')
  })

  it('exposes the supported languages list', () => {
    mockBrowserLanguage('de-DE')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.supportedLanguages).toEqual(['de', 'en'])
  })
})
