// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { LanguageProvider, useLanguage } from './LanguageContext'

const STORAGE_KEY = 'firlefanz-language'

describe('LanguageProvider', () => {
  let navLangSpy: ReturnType<typeof vi.spyOn> | null = null

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    navLangSpy?.mockRestore()
    navLangSpy = null
    localStorage.clear()
  })

  function mockBrowserLanguage(lang: string | undefined) {
    navLangSpy = vi.spyOn(navigator, 'language', 'get').mockReturnValue(lang as string)
  }

  function wrapper({ children }: { children: React.ReactNode }) {
    return <LanguageProvider>{children}</LanguageProvider>
  }

  it('uses the value stored in localStorage when present and supported', () => {
    localStorage.setItem(STORAGE_KEY, 'en')
    mockBrowserLanguage('de-DE')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('en')
  })

  it('ignores localStorage when the stored language is not in the supported list', () => {
    localStorage.setItem(STORAGE_KEY, 'jp')
    mockBrowserLanguage('en-US')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('en')
  })

  it('detects German from the browser language as a fallback', () => {
    mockBrowserLanguage('de-CH')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('de')
  })

  it('detects English from the browser language as a fallback', () => {
    mockBrowserLanguage('en-GB')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('en')
  })

  it('falls back to German when the browser reports an unsupported language', () => {
    mockBrowserLanguage('fr-FR')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language).toBe('de')
  })

  it('persists the language to localStorage on mount and on change', () => {
    mockBrowserLanguage('en-US')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(localStorage.getItem(STORAGE_KEY)).toBe('en')

    act(() => result.current.setLanguage('de'))
    expect(result.current.language).toBe('de')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('de')
  })

  it('exposes the supported languages list', () => {
    mockBrowserLanguage('de-DE')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.supportedLanguages).toEqual(['de', 'en'])
  })
})
