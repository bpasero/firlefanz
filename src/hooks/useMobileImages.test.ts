// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getMobileSrc, shouldUseMobileImages } from './useMobileImages'

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
