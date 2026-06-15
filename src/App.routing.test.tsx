// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/**
 * Integration tests for App's path-based routing. Covers:
 *  - default view (library)
 *  - deep-linking via /geschichten/<id>/ and /geschichten/<id>/#page
 *  - page clamping vs story length
 *  - opening a story via click updates the URL to /geschichten/<id>/
 *  - back-from-reader returns to the root URL
 *  - popstate (story switch) and hashchange (page turn) events
 *  - back-compat: an old #/id/page hash is rewritten to the new path on load
 *
 * The remount-skip invariant (preserve audio state when a page-turn hashchange
 * targets the page pageRef already points at) is exercised at the end.
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

// Set the initial URL the way a real browser does for a fresh navigation:
// replaceState updates both pathname and hash WITHOUT firing a hashchange. (Using
// the location.hash setter would fire a hashchange that races story loading — a
// test-only artifact that never happens on a real initial page load.)
function setPath(pathWithHash: string) {
  history.replaceState(null, '', pathWithHash)
}

function clearRoute() {
  history.replaceState(null, '', '/')
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('firlefanz-language', 'de')
  localStorage.setItem('firlefanz-night-mode', 'false')
  clearRoute()

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
  clearRoute()
  localStorage.clear()
})

describe('App routing — default view', () => {
  it('shows the library with the hardcoded story list once fetches resolve', async () => {
    render(<App />)
    await screen.findByText('Geschichten zum Einschlafen')
  })

  it('does not render the StoryReader on the root URL', async () => {
    render(<App />)
    await screen.findByText('Geschichten zum Einschlafen')
    expect(screen.queryByRole('button', { name: /Bibliothek/i })).toBeNull()
  })
})

describe('App routing — deep-link via story URL', () => {
  it('opens the StoryReader at page 1 for "/geschichten/<id>/"', async () => {
    setPath('/geschichten/der-mond/')
    render(<App />)
    await screen.findByRole('button', { name: /Bibliothek/i })
    expect(screen.getByText('P1 der-mond')).toBeTruthy()
  })

  it('opens at the requested page for "/geschichten/<id>/#N"', async () => {
    setPath('/geschichten/der-mond/#2')
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P2 der-mond')).toBeTruthy()
    })
    expect(screen.getByText('2/3')).toBeTruthy()
  })

  it('clamps an out-of-bounds page number to the last page', async () => {
    setPath('/geschichten/der-mond/#99')
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P3 der-mond')).toBeTruthy()
    })
    expect(screen.getByText('3/3')).toBeTruthy()
  })

  it('falls back to the library when the path points at an unknown story id', async () => {
    setPath('/geschichten/nonexistent-story/')
    render(<App />)
    await screen.findByText('Geschichten zum Einschlafen')
    expect(screen.queryByRole('button', { name: /Bibliothek/i })).toBeNull()
  })

  it('rewrites a legacy "#/<id>/<page>" hash to the new path on load', async () => {
    setPath('/#/der-mond/2')
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P2 der-mond')).toBeTruthy()
    })
    expect(window.location.pathname).toBe('/geschichten/der-mond/')
    expect(window.location.hash).toBe('#2')
  })
})

describe('App routing — interaction with the URL', () => {
  it('clicking a book opens the StoryReader and sets the path to "/geschichten/<id>/"', async () => {
    render(<App />)
    await screen.findByText('Geschichten zum Einschlafen')

    // Each cover is rendered as an <a> link with a cover image inside; click the first.
    const links = screen.getAllByRole('link').filter((el) => el.querySelector('img') !== null)
    expect(links.length).toBeGreaterThan(0)
    fireEvent.click(links[0])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Bibliothek/i })).toBeTruthy()
    })
    expect(window.location.pathname).toMatch(/^\/geschichten\/[\w-]+\/$/)
  })

  it('back button from the reader returns to the root URL', async () => {
    setPath('/geschichten/der-mond/#2')
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P2 der-mond')).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: /Bibliothek/i }))

    await screen.findByText('Geschichten zum Einschlafen')
    expect(window.location.pathname).toBe('/')
  })
})

describe('App routing — history events', () => {
  it('switches the active story when popstate navigates to a different story', async () => {
    setPath('/geschichten/der-mond/#1')
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P1 der-mond')).toBeTruthy()
    })

    act(() => {
      setPath('/geschichten/das-urzeittal/#1')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await waitFor(() => {
      expect(screen.getByText('P1 das-urzeittal')).toBeTruthy()
    })
  })

  it('clears the active story when popstate returns to the library', async () => {
    setPath('/geschichten/der-mond/#1')
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('P1 der-mond')).toBeTruthy()
    })

    act(() => {
      setPath('/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await screen.findByText('Geschichten zum Einschlafen')
  })
})

describe('App routing — remount-skip invariant (audio-state preservation)', () => {
  // App only updates initialPage (part of StoryReader's React `key`, so a change
  // forces a remount) when the new page differs from pageRef.current. In-app page
  // turns set pageRef.current first and then update the hash, so the resulting
  // hashchange must be a no-op for the remount logic — otherwise StoryReader is
  // recreated on every page turn and audio / narration state is lost.

  function narrationButton(): HTMLButtonElement {
    const label = screen.queryByText('Vorlesen') ?? screen.getByText('Vorlesen stoppen')
    return label.parentElement!.querySelector('button') as HTMLButtonElement
  }

  it('preserves narration state when a hashchange targets the same page (in-app turn)', async () => {
    setPath('/geschichten/der-mond/#2')
    render(<App />)
    await screen.findByText('P2 der-mond')

    fireEvent.click(narrationButton())
    expect(screen.getByText('Vorlesen stoppen')).toBeTruthy()

    // The hashchange that fires after an in-app page turn — the hash matches what
    // App.handlePageChange would have already set, so pageRef.current === parsed.page.
    act(() => {
      window.location.hash = '#2'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(screen.getByText('Vorlesen stoppen')).toBeTruthy()
  })

  it('resets narration state when a hashchange targets a different page (browser back)', async () => {
    setPath('/geschichten/der-mond/#2')
    render(<App />)
    await screen.findByText('P2 der-mond')

    fireEvent.click(narrationButton())
    expect(screen.getByText('Vorlesen stoppen')).toBeTruthy()

    act(() => {
      window.location.hash = '#3'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    await screen.findByText('P3 der-mond')
    expect(screen.getByText('Vorlesen')).toBeTruthy()
    expect(screen.queryByText('Vorlesen stoppen')).toBeNull()
  })

  it('resets narration state when popstate targets a different story', async () => {
    setPath('/geschichten/der-mond/#1')
    render(<App />)
    await screen.findByText('P1 der-mond')

    fireEvent.click(narrationButton())
    expect(screen.getByText('Vorlesen stoppen')).toBeTruthy()

    act(() => {
      setPath('/geschichten/das-urzeittal/#1')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await screen.findByText('P1 das-urzeittal')
    expect(screen.getByText('Vorlesen')).toBeTruthy()
  })
})

describe('App routing — English URLs', () => {
  it('opens the English reader from a /en/geschichten/<id>/ deep-link', async () => {
    setPath('/en/geschichten/der-mond/#2')
    render(<App />)
    // Reader is mounted (page text falls back to German in the test fixture) and
    // the English back-button label confirms the active language is English.
    await screen.findByText('P2 der-mond')
    expect(screen.getByText('2/3')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Library/i })).toBeTruthy()
    expect(document.documentElement.lang).toBe('en')
  })

  it('toggling language inside a story keeps the story open and flips the URL prefix', async () => {
    setPath('/geschichten/der-mond/')
    render(<App />)
    await screen.findByText('P1 der-mond')
    expect(screen.getByRole('button', { name: /Bibliothek/i })).toBeTruthy()

    // The DE/EN pill in the reader header switches language.
    fireEvent.click(screen.getByRole('button', { name: /^DE$/ }))

    await screen.findByRole('button', { name: /Library/i })
    expect(window.location.pathname).toBe('/en/geschichten/der-mond/')
    expect(screen.getByText('P1 der-mond')).toBeTruthy() // same story still open
  })

  it('toggling language mid-story preserves the current page (hash)', async () => {
    setPath('/geschichten/der-mond/#2')
    render(<App />)
    await screen.findByText('P2 der-mond')
    expect(screen.getByText('2/3')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /^DE$/ }))

    await screen.findByRole('button', { name: /Library/i })
    expect(window.location.pathname).toBe('/en/geschichten/der-mond/')
    expect(window.location.hash).toBe('#2')
    expect(screen.getByText('2/3')).toBeTruthy() // still on page 2
  })
})
