// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { getMobileSrc, shouldUseMobileImages, useMobileImages } from './useMobileImages'

describe('getMobileSrc', () => {
  it('returns the original src untouched when useMobile is false', () => {
    expect(getMobileSrc('/stories/demo/page-1.png', false)).toBe('/stories/demo/page-1.png')
  })

  it('rewrites .png to -mobile.webp when useMobile is true', () => {
    expect(getMobileSrc('/stories/demo/page-1.png', true)).toBe('/stories/demo/page-1-mobile.webp')
  })

  it('rewrites the cover.png filename', () => {
    expect(getMobileSrc('/stories/demo/cover.png', true)).toBe('/stories/demo/cover-mobile.webp')
  })

  it('only rewrites the trailing extension, not earlier .png occurrences in the path', () => {
    expect(getMobileSrc('/stories/png-folder/page-1.png', true)).toBe('/stories/png-folder/page-1-mobile.webp')
  })

  it('leaves non-png src unchanged when useMobile is true (passes through unchanged)', () => {
    expect(getMobileSrc('/stories/demo/page-1.jpg', true)).toBe('/stories/demo/page-1.jpg')
    expect(getMobileSrc('/stories/demo/page-1.webp', true)).toBe('/stories/demo/page-1.webp')
  })
})

// shouldUseMobileImages reads window.innerWidth and a few non-standard navigator
// connection properties. Snapshot the original descriptors and restore them.
type ConnectionLike = {
  saveData?: boolean
  effectiveType?: string
}

const originalInnerWidth = window.innerWidth
let connectionRestore: (() => void) | null = null

function setInnerWidth(value: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value,
  })
}

function setConnection(conn: ConnectionLike | undefined) {
  const nav = navigator as unknown as { connection?: ConnectionLike }
  const had = Object.prototype.hasOwnProperty.call(nav, 'connection')
  const prev = nav.connection
  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    writable: true,
    value: conn,
  })
  connectionRestore = () => {
    if (had) {
      Object.defineProperty(navigator, 'connection', { configurable: true, writable: true, value: prev })
    } else {
      delete (navigator as unknown as { connection?: ConnectionLike }).connection
    }
  }
}

describe('shouldUseMobileImages', () => {
  beforeEach(() => {
    setInnerWidth(originalInnerWidth)
  })

  afterEach(() => {
    setInnerWidth(originalInnerWidth)
    connectionRestore?.()
    connectionRestore = null
  })

  it('returns true on narrow viewports (≤768px)', () => {
    setInnerWidth(412)
    setConnection(undefined)
    expect(shouldUseMobileImages()).toBe(true)
  })

  it('returns true exactly at the 768px boundary', () => {
    setInnerWidth(768)
    setConnection(undefined)
    expect(shouldUseMobileImages()).toBe(true)
  })

  it('returns false on wide viewports when no connection info is available', () => {
    setInnerWidth(1280)
    setConnection(undefined)
    expect(shouldUseMobileImages()).toBe(false)
  })

  it('returns true on wide viewports when saveData mode is on', () => {
    setInnerWidth(1280)
    setConnection({ saveData: true })
    expect(shouldUseMobileImages()).toBe(true)
  })

  it('returns true on wide viewports when effectiveType is 2g/3g/slow-2g', () => {
    setInnerWidth(1280)
    for (const effectiveType of ['slow-2g', '2g', '3g']) {
      setConnection({ effectiveType })
      expect(shouldUseMobileImages()).toBe(true)
    }
  })

  it('returns false on wide viewports with a fast connection', () => {
    setInnerWidth(1280)
    setConnection({ effectiveType: '4g', saveData: false })
    expect(shouldUseMobileImages()).toBe(false)
  })
})

// useMobileImages is a React hook that wires shouldUseMobileImages() to a state
// that is re-evaluated on connection-change events.
type ChangeHandler = () => void

function setConnectionWithListener(initial: { saveData?: boolean; effectiveType?: string }) {
  const listeners = new Set<ChangeHandler>()
  const conn = {
    ...initial,
    addEventListener: (_event: string, h: ChangeHandler) => { listeners.add(h) },
    removeEventListener: (_event: string, h: ChangeHandler) => { listeners.delete(h) },
  }
  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    writable: true,
    value: conn,
  })
  return {
    listenerCount: () => listeners.size,
    fireChange: (next: { saveData?: boolean; effectiveType?: string }) => {
      Object.assign(conn, next)
      for (const h of listeners) h()
    },
  }
}

describe('useMobileImages hook', () => {
  beforeEach(() => {
    setInnerWidth(originalInnerWidth)
  })

  afterEach(() => {
    cleanup()
    setInnerWidth(originalInnerWidth)
    connectionRestore?.()
    connectionRestore = null
  })

  it('returns false initially (state default before the effect runs)', () => {
    setInnerWidth(1280)
    setConnection(undefined)
    const { result } = renderHook(() => useMobileImages())
    // After render the effect has run and resolved to false (wide viewport, no slow connection).
    expect(result.current).toBe(false)
  })

  it('returns true after mount when the viewport is narrow', () => {
    setInnerWidth(412)
    setConnection(undefined)
    const { result } = renderHook(() => useMobileImages())
    expect(result.current).toBe(true)
  })

  it('re-evaluates when the connection emits a change event', () => {
    setInnerWidth(1280)
    const ctrl = setConnectionWithListener({ effectiveType: '4g' })
    connectionRestore = () => {
      delete (navigator as unknown as { connection?: unknown }).connection
    }

    const { result } = renderHook(() => useMobileImages())
    expect(result.current).toBe(false)

    act(() => ctrl.fireChange({ effectiveType: '2g' }))
    expect(result.current).toBe(true)

    act(() => ctrl.fireChange({ effectiveType: '4g' }))
    expect(result.current).toBe(false)
  })

  it('removes the connection change listener on unmount (no leak)', () => {
    setInnerWidth(1280)
    const ctrl = setConnectionWithListener({ effectiveType: '4g' })
    connectionRestore = () => {
      delete (navigator as unknown as { connection?: unknown }).connection
    }

    const { unmount } = renderHook(() => useMobileImages())
    expect(ctrl.listenerCount()).toBe(1)
    unmount()
    expect(ctrl.listenerCount()).toBe(0)
  })

  it('does not crash when the connection API is missing', () => {
    setInnerWidth(1280)
    setConnection(undefined)
    expect(() => renderHook(() => useMobileImages())).not.toThrow()
  })
})
