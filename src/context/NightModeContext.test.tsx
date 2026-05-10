// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { NightModeProvider, useNightMode } from './NightModeContext'

const STORAGE_KEY = 'firlefanz-night-mode'

describe('NightModeProvider', () => {
  let mqlSpy: ReturnType<typeof vi.spyOn> | null = null

  function mockPrefersDark(matches: boolean) {
    mqlSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? matches : false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList)
  }

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.style.backgroundColor = ''
  })

  afterEach(() => {
    cleanup()
    mqlSpy?.mockRestore()
    mqlSpy = null
    localStorage.clear()
    document.documentElement.style.backgroundColor = ''
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return <NightModeProvider>{children}</NightModeProvider>
  }

  it('defaults to the OS prefers-color-scheme: dark setting when no value is stored', () => {
    mockPrefersDark(true)
    const { result } = renderHook(() => useNightMode(), { wrapper })
    expect(result.current.nightMode).toBe(true)
  })

  it('defaults to light when the OS reports no dark preference and no value is stored', () => {
    mockPrefersDark(false)
    const { result } = renderHook(() => useNightMode(), { wrapper })
    expect(result.current.nightMode).toBe(false)
  })

  it('localStorage takes precedence over OS preference', () => {
    localStorage.setItem(STORAGE_KEY, 'false')
    mockPrefersDark(true)
    const { result } = renderHook(() => useNightMode(), { wrapper })
    expect(result.current.nightMode).toBe(false)
  })

  it('parses the stored "true" string as boolean true', () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    mockPrefersDark(false)
    const { result } = renderHook(() => useNightMode(), { wrapper })
    expect(result.current.nightMode).toBe(true)
  })

  it('toggleNightMode flips the value and persists to localStorage', () => {
    mockPrefersDark(false)
    const { result } = renderHook(() => useNightMode(), { wrapper })
    expect(result.current.nightMode).toBe(false)

    act(() => result.current.toggleNightMode())
    expect(result.current.nightMode).toBe(true)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true')

    act(() => result.current.toggleNightMode())
    expect(result.current.nightMode).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false')
  })

  it('mutates documentElement.style.backgroundColor to match the current mode', () => {
    mockPrefersDark(false)
    const { result } = renderHook(() => useNightMode(), { wrapper })
    expect(document.documentElement.style.backgroundColor).toBe('#edd3a4')

    act(() => result.current.toggleNightMode())
    expect(document.documentElement.style.backgroundColor).toBe('#14100c')
  })
})
