// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import StoryLibrary from './StoryLibrary'
import { NightModeProvider } from '../context/NightModeContext'
import { LanguageProvider } from '../context/LanguageContext'
import type { Story } from '../types/story'

function makeStory(id: string): Story {
  return {
    id,
    title: `Titel ${id}`,
    teaser: `Teaser ${id}`,
    coverImage: `/stories/${id}/cover.png`,
    prompt: 'irrelevant',
    pages: [{ text: ['Seite eins.'], image: `/stories/${id}/page-1.png` }],
  }
}

const stories = [makeStory('der-mond'), makeStory('die-ritterburg')]

function renderLibrary(onSelect = vi.fn()) {
  render(
    <NightModeProvider>
      <LanguageProvider>
        <StoryLibrary stories={stories} onSelectStory={onSelect} />
      </LanguageProvider>
    </NightModeProvider>,
  )
  return onSelect
}

// Cover anchors that point at a story (excludes the in-page "back" links etc.).
function storyLinks() {
  return screen
    .getAllByRole('link')
    .filter((a) => (a.getAttribute('href') ?? '').includes('geschichten/'))
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('firlefanz-night-mode', 'false')
  history.replaceState(null, '', '/')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  history.replaceState(null, '', '/')
})

describe('StoryLibrary covers', () => {
  it('renders covers as German story anchors by default', () => {
    renderLibrary()
    const links = storyLinks()
    expect(links.length).toBeGreaterThan(0)
    for (const a of links) {
      expect(a.getAttribute('href')).toMatch(/^\/geschichten\/[\w-]+\/$/)
    }
  })

  it('renders English anchors under the /en/ prefix when the language is English', () => {
    history.replaceState(null, '', '/en/')
    renderLibrary()
    const links = storyLinks()
    expect(links.length).toBeGreaterThan(0)
    for (const a of links) {
      expect(a.getAttribute('href')).toMatch(/^\/en\/geschichten\/[\w-]+\/$/)
    }
  })

  it('a plain left-click is intercepted for SPA nav (preventDefault) and calls onSelectStory', () => {
    const onSelect = renderLibrary()
    const link = storyLinks()[0]
    // fireEvent.click returns false when the handler called preventDefault().
    const notPrevented = fireEvent.click(link)
    expect(notPrevented).toBe(false)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('a modifier-click (e.g. cmd/ctrl) is left to the browser (no preventDefault, no onSelect)', () => {
    const onSelect = renderLibrary()
    const link = storyLinks()[0]
    const notPrevented = fireEvent.click(link, { ctrlKey: true })
    expect(notPrevented).toBe(true) // default NOT prevented → opens in new tab natively
    expect(onSelect).not.toHaveBeenCalled()
  })
})
