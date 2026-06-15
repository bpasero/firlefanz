// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, fireEvent, screen, act, cleanup } from '@testing-library/react'
import StoryReader from './StoryReader'
import { NightModeProvider } from '../context/NightModeContext'
import { LanguageProvider } from '../context/LanguageContext'
import type { Story } from '../types/story'

// Minimal story with three pages so we can exercise both boundaries (first / last)
// as well as a middle page.
const fakeStory: Story = {
  id: 'fake',
  title: 'Test Geschichte',
  teaser: 'Eine Test-Geschichte.',
  coverImage: '/stories/fake/cover.png',
  prompt: 'irrelevant',
  pages: [
    { text: ['Seite eins.'], image: '/stories/fake/page-1.png' },
    { text: ['Seite zwei.'], image: '/stories/fake/page-2.png' },
    { text: ['Seite drei.'], image: '/stories/fake/page-3.png' },
  ],
  translations: {
    en: {
      title: 'Test Story',
      teaser: 'A test story.',
      pages: [{ text: ['Page one.'] }, { text: ['Page two.'] }, { text: ['Page three.'] }],
    },
  },
}

function renderReader(props: Partial<React.ComponentProps<typeof StoryReader>> = {}) {
  const onBack = props.onBack ?? vi.fn()
  const onPageChange = props.onPageChange ?? vi.fn()
  const result = render(
    <NightModeProvider>
      <LanguageProvider>
        <StoryReader
          story={props.story ?? fakeStory}
          initialPage={props.initialPage ?? 0}
          onBack={onBack}
          onPageChange={onPageChange}
        />
      </LanguageProvider>
    </NightModeProvider>,
  )
  return { ...result, onBack, onPageChange }
}

// Drive the page-flip animation to completion by firing animationend on the
// flipping page element. The component listens for animationend with an
// `e.target === e.currentTarget` guard, so we dispatch on the element with
// a "flip" inline style attribute.
function completeFlipAnimation(container: HTMLElement) {
  // The flipping page is the one with `transform-style: preserve-3d` and an animation
  // tag. There's exactly one such element while a flip is in progress.
  const flippingEl = container.querySelector<HTMLElement>('[style*="preserve-3d"]')
  if (!flippingEl) return
  act(() => {
    fireEvent.animationEnd(flippingEl, { target: flippingEl })
  })
}

beforeEach(() => {
  // Language is URL-driven; reset to the German root each test (the /en/ tests
  // below redirect the URL, which must not leak into the next test).
  history.replaceState(null, '', '/')
  localStorage.setItem('firlefanz-language', 'de')
  localStorage.setItem('firlefanz-night-mode', 'false')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  history.replaceState(null, '', '/')
})

describe('StoryReader — header', () => {
  it('renders the localized title', () => {
    renderReader()
    expect(screen.getByText('Test Geschichte')).toBeTruthy()
  })

  it('renders the title in English when the language is "en"', () => {
    localStorage.setItem('firlefanz-language', 'en')
    renderReader()
    expect(screen.getByText('Test Story')).toBeTruthy()
  })

  it('renders the page counter as "1/3" on the first page', () => {
    renderReader()
    expect(screen.getByText('1/3')).toBeTruthy()
  })

  it('renders the page counter as "2/3" when initialPage is 1', () => {
    renderReader({ initialPage: 1 })
    expect(screen.getByText('2/3')).toBeTruthy()
  })

  it('calls onBack when the back button is clicked', () => {
    const { onBack } = renderReader()
    const backBtn = screen.getByRole('button', { name: /Bibliothek/i })
    fireEvent.click(backBtn)
    expect(onBack).toHaveBeenCalledOnce()
  })
})

describe('StoryReader — page text', () => {
  it('shows the first page text by default', () => {
    renderReader()
    expect(screen.getByText('Seite eins.')).toBeTruthy()
  })

  it('shows the page text matching initialPage when provided', () => {
    renderReader({ initialPage: 2 })
    expect(screen.getByText('Seite drei.')).toBeTruthy()
  })

  it('shows English text when the language is "en"', () => {
    localStorage.setItem('firlefanz-language', 'en')
    renderReader()
    expect(screen.getByText('Page one.')).toBeTruthy()
  })
})

describe('StoryReader — keyboard navigation', () => {
  it('ArrowRight advances to the next page and fires onPageChange(1)', () => {
    const { container, onPageChange } = renderReader()
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' })
    })
    completeFlipAnimation(container)
    expect(onPageChange).toHaveBeenCalledWith(1)
    expect(screen.getByText('Seite zwei.')).toBeTruthy()
  })

  it('ArrowLeft from page 2 returns to page 1', () => {
    const { container, onPageChange } = renderReader({ initialPage: 1 })
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowLeft' })
    })
    completeFlipAnimation(container)
    expect(onPageChange).toHaveBeenCalledWith(0)
    expect(screen.getByText('Seite eins.')).toBeTruthy()
  })

  it('ArrowRight on the last page is a no-op (isLast guard)', () => {
    const { onPageChange } = renderReader({ initialPage: 2 })
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' })
    })
    expect(onPageChange).not.toHaveBeenCalled()
    expect(screen.getByText('Seite drei.')).toBeTruthy()
  })

  it('ArrowLeft on the first page is a no-op (isFirst guard)', () => {
    const { onPageChange } = renderReader({ initialPage: 0 })
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowLeft' })
    })
    expect(onPageChange).not.toHaveBeenCalled()
    expect(screen.getByText('Seite eins.')).toBeTruthy()
  })

  it('ignores other keys (e.g. ArrowUp)', () => {
    const { onPageChange } = renderReader()
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowUp' })
    })
    expect(onPageChange).not.toHaveBeenCalled()
  })
})

describe('StoryReader — nav buttons', () => {
  it('"prev" button is disabled on the first page', () => {
    renderReader({ initialPage: 0 })
    // First nav button (rsaquo/lsaquo) — find by character content.
    const prev = screen.getByRole('button', { name: '‹' }) as HTMLButtonElement
    expect(prev.disabled).toBe(true)
  })

  it('"next" button on the last page returns to the library', () => {
    const { onBack, onPageChange } = renderReader({ initialPage: 2 })
    const next = screen.getByRole('button', { name: 'Zurück zur Bibliothek' }) as HTMLButtonElement
    expect(next.disabled).toBe(false)
    fireEvent.click(next)
    expect(onBack).toHaveBeenCalledOnce()
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('"next" button advances the page', () => {
    const { container, onPageChange } = renderReader()
    const next = screen.getByRole('button', { name: 'Nächste Seite' })
    fireEvent.click(next)
    completeFlipAnimation(container)
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('"prev" button retreats a page', () => {
    const { container, onPageChange } = renderReader({ initialPage: 1 })
    const prev = screen.getByRole('button', { name: '‹' })
    fireEvent.click(prev)
    completeFlipAnimation(container)
    expect(onPageChange).toHaveBeenCalledWith(0)
  })
})

describe('StoryReader — flip lock', () => {
  it('a second nav while a flip is already in progress is ignored', () => {
    const { onPageChange } = renderReader()
    // First nav starts a flip but we DO NOT complete it.
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' })
    })
    // Second nav while flipping should be a no-op (flip guard at turnPage).
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' })
    })
    // Without animation completion, onPageChange has not fired even once.
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('after the flip animation completes, onPageChange is called once', () => {
    const { container, onPageChange } = renderReader()
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' })
    })
    completeFlipAnimation(container)
    expect(onPageChange).toHaveBeenCalledOnce()
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})
