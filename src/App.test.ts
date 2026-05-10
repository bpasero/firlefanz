// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect, beforeEach } from 'vitest'
import { parseHash } from './App'

function setHash(hash: string) {
  // happy-dom accepts assignment to window.location.hash directly.
  window.location.hash = hash
}

describe('parseHash', () => {
  beforeEach(() => {
    // Reset hash between tests so prior state can't bleed in.
    history.replaceState(null, '', window.location.pathname + window.location.search)
  })

  it('returns null when the hash is empty', () => {
    expect(parseHash()).toBeNull()
  })

  it('returns null for the bare "#/" placeholder', () => {
    setHash('#/')
    expect(parseHash()).toBeNull()
  })

  it('parses "#/story-id" to page index 0 (1-based "1" → 0)', () => {
    setHash('#/der-mond')
    expect(parseHash()).toEqual({ storyId: 'der-mond', page: 0 })
  })

  it('converts the 1-based page number in the URL to a 0-based index', () => {
    setHash('#/der-mond/3')
    expect(parseHash()).toEqual({ storyId: 'der-mond', page: 2 })
  })

  it('clamps a page of 0 to 0 (since the URL is 1-based, #0 has no meaning — guard against negatives)', () => {
    setHash('#/der-mond/0')
    // URL "0" would be 1-based 0 → -1, but parseHash uses Math.max(0, ...).
    expect(parseHash()).toEqual({ storyId: 'der-mond', page: 0 })
  })

  it('clamps negative page numbers to 0', () => {
    setHash('#/der-mond/-5')
    expect(parseHash()).toEqual({ storyId: 'der-mond', page: 0 })
  })

  it('returns null when the page segment is not a number', () => {
    setHash('#/der-mond/foo')
    expect(parseHash()).toBeNull()
  })

  it('accepts a leading "#" without slash', () => {
    setHash('#der-mond/2')
    expect(parseHash()).toEqual({ storyId: 'der-mond', page: 1 })
  })

  it('accepts a leading "#/" with slash', () => {
    setHash('#/der-mond/2')
    expect(parseHash()).toEqual({ storyId: 'der-mond', page: 1 })
  })

  it('does NOT clamp the upper bound — clamping against story length happens at the caller', () => {
    // parseHash itself only normalises the integer; bounds vs. story.pages.length
    // is App's responsibility.
    setHash('#/der-mond/9999')
    expect(parseHash()).toEqual({ storyId: 'der-mond', page: 9998 })
  })
})
