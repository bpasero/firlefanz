// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect } from 'vitest'
import { langFromPath, homePath, storyPath, parseLocation, swapLangPath } from './routes'

// BASE is '/' in the test environment.

describe('langFromPath', () => {
  it('returns de for the root and German paths', () => {
    expect(langFromPath('/')).toBe('de')
    expect(langFromPath('/geschichten/der-mond/')).toBe('de')
  })
  it('returns en under the /en/ prefix', () => {
    expect(langFromPath('/en')).toBe('en')
    expect(langFromPath('/en/')).toBe('en')
    expect(langFromPath('/en/geschichten/der-mond/')).toBe('en')
  })
  it('does not treat a story id starting with "en" as English', () => {
    expect(langFromPath('/geschichten/ente/')).toBe('de')
  })
})

describe('homePath', () => {
  it('maps language to the library URL', () => {
    expect(homePath('de')).toBe('/')
    expect(homePath('en')).toBe('/en/')
  })
})

describe('storyPath', () => {
  it('builds the per-story URL per language', () => {
    expect(storyPath('der-mond', 'de')).toBe('/geschichten/der-mond/')
    expect(storyPath('der-mond', 'en')).toBe('/en/geschichten/der-mond/')
  })
})

describe('parseLocation', () => {
  it('returns null story on the library routes', () => {
    expect(parseLocation('/', '')).toEqual({ lang: 'de', storyId: null, page: 0 })
    expect(parseLocation('/en/', '')).toEqual({ lang: 'en', storyId: null, page: 0 })
  })
  it('parses German story routes', () => {
    expect(parseLocation('/geschichten/der-mond/', '')).toEqual({ lang: 'de', storyId: 'der-mond', page: 0 })
    expect(parseLocation('/geschichten/der-mond', '#3')).toEqual({ lang: 'de', storyId: 'der-mond', page: 2 })
  })
  it('parses English story routes (strips the en prefix)', () => {
    expect(parseLocation('/en/geschichten/der-mond/', '#2')).toEqual({ lang: 'en', storyId: 'der-mond', page: 1 })
  })
  it('treats non-positive / non-numeric page hashes as page index 0', () => {
    expect(parseLocation('/geschichten/der-mond/', '#0').page).toBe(0)
    expect(parseLocation('/geschichten/der-mond/', '#-5').page).toBe(0)
    expect(parseLocation('/geschichten/der-mond/', '#foo').page).toBe(0)
  })
})

describe('swapLangPath', () => {
  it('swaps the library home between languages', () => {
    expect(swapLangPath('/', '', 'en')).toBe('/en/')
    expect(swapLangPath('/en/', '', 'de')).toBe('/')
  })
  it('swaps a story URL while preserving the page hash', () => {
    expect(swapLangPath('/geschichten/der-mond/', '#3', 'en')).toBe('/en/geschichten/der-mond/#3')
    expect(swapLangPath('/en/geschichten/der-mond/', '#3', 'de')).toBe('/geschichten/der-mond/#3')
  })
})
