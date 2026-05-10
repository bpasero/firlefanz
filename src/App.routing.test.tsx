// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/**
 * Integration tests for App's hash-based routing. Covers:
 *  - default view (library)
 *  - deep-linking via #/story-id and #/story-id/page
 *  - page clamping vs story length
 *  - opening a story via click updates the hash
 *  - back-from-reader clears the hash
 *  - hashchange events switch stories
 *
 * These tests intentionally do NOT cover the audio-state-preservation
 * invariant in the hashchange handler (the "skip remount when pageRef
 * matches" branch); that one needs StoryReader-level inspection and
 * is better covered with a dedicated integration test.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react'
import App from './App'
import type { Story } from './types/story'

function makeStory(id: string): Story {
  return {
    id,
    title: `Title ${id}`,
    teaser: `Teaser ${id}`,
    coverImage: `/stories/${id}/cover.png`,
    prompt: 'irrelevant',
    pages: [
      { text: [`P1 ${id}`], image: `/stories/${id}/page-1.png` },
      { text: [`P2 ${id}`], image: `/stories/${id}/page-2.png` },
      { text: [`P3 ${id}`], image: `/stories/${id}/page-3.png` },
    ],
  }
}

function clearHash() {
  history.replaceState(null, '', window.location.pathname + window.location.search)
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('firlefanz-language', 'de')
  localStorage.setItem('firlefanz-night-mode', 'false')
  clearHash()

  // happy-dom does not provide window.speechSynthesis; StoryReader's audio
  // effect calls .cancel() on it and would throw without this shim.
  if (!('speechSynthesis' in window)) {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { cancel: () => {}, speak: () => {}, getVoices: () => [], addEventListener: () => {} },
    })
  }

  // Mock fetch to return a fake story keyed by URL.
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      const m = url.match(/stories\/([^/]+)\/story\.json/)
      if (!m) throw new Error(`Unexpected fetch URL: ${url}`)
      return {
        ok: true,
        json: async () => makeStory(m[1]),
      } as Response
    }),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  clearHash()
  localStorage.clear()
})

describe('App routing — default view', () => {
  it('shows the library with the hardcoded story list once fetches resolve', async () => {
    render(<App />)
    // Library tagline confirms StoryLibrary is mounted.
    await screen.findByText('Geschichten zum Einschlafen')
  })

  it('does not render the StoryReader when the hash is empty', async () => {
    render(<App />)
    await screen.findByText('Geschichten zum Einschlafen')
    // StoryReader exposes a back button containing "Bibliothek"; the library
    // does not. Use queryByRole to assert absence.
    expect(screen.queryByRole('button', { name: /Bibliothek/i })).toBeNull()
  })
})

describe('App routing — deep-link via URL hash', () => {
  it('opens the StoryReader at page 1 when the hash is "#/story-id"', async () => {
    window.location.hash = '#/der-mond'
    render(<App />)
    await screen.findByRole('button', { name: /Bibliothek/i })
    expect(screen.getByText('P1 der-mond')).toBeTruthy()
  })

  it('opens the StoryReader at the requested page when the hash is "#/story-id/N"', async () => {
    window.location.hash = '#/der-mond/2'
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P2 der-mond')).toBeTruthy()
    })
    expect(screen.getByText('2/3')).toBeTruthy()
  })

  it('clamps an out-of-bounds page number to the last page', async () => {
    window.location.hash = '#/der-mond/99'
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P3 der-mond')).toBeTruthy()
    })
    expect(screen.getByText('3/3')).toBeTruthy()
  })

  it('falls back to the library when the hash points at an unknown story id', async () => {
    window.location.hash = '#/nonexistent-story'
    render(<App />)
    await screen.findByText('Geschichten zum Einschlafen')
    expect(screen.queryByRole('button', { name: /Bibliothek/i })).toBeNull()
  })
})

describe('App routing — interaction with hash', () => {
  it('clicking a book opens the StoryReader and updates the hash to "#/<id>/1"', async () => {
    render(<App />)
    await screen.findByText('Geschichten zum Einschlafen')

    // Each book is rendered as a button with a cover image inside; click the first.
    const books = screen.getAllByRole('button').filter(
      (btn) => btn.querySelector('img') !== null,
    )
    expect(books.length).toBeGreaterThan(0)
    fireEvent.click(books[0])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Bibliothek/i })).toBeTruthy()
    })
    expect(window.location.hash).toMatch(/^#\/[\w-]+\/1$/)
  })

  it('back button from the reader returns to the library and clears the hash', async () => {
    window.location.hash = '#/der-mond/2'
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P2 der-mond')).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: /Bibliothek/i }))

    await screen.findByText('Geschichten zum Einschlafen')
    expect(window.location.hash).toBe('')
  })
})

describe('App routing — hashchange handler', () => {
  it('switches the active story when a hashchange to a different story id fires', async () => {
    window.location.hash = '#/der-mond/1'
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P1 der-mond')).toBeTruthy()
    })

    act(() => {
      window.location.hash = '#/das-urzeittal/1'
      // happy-dom fires hashchange automatically on hash mutation; if not, dispatch manually.
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    await waitFor(() => {
      expect(screen.getByText('P1 das-urzeittal')).toBeTruthy()
    })
  })

  it('clears the active story when the hash becomes empty (browser back to library)', async () => {
    window.location.hash = '#/der-mond/1'
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P1 der-mond')).toBeTruthy()
    })

    act(() => {
      history.replaceState(null, '', window.location.pathname + window.location.search)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    await screen.findByText('Geschichten zum Einschlafen')
  })
})
