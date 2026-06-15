// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen, cleanup } from '@testing-library/react'
import LanguageToggle from './LanguageToggle'
import NightModeToggle from './NightModeToggle'
import NarrationToggle from './NarrationToggle'
import FullscreenToggle from './FullscreenToggle'
import Tooltip from './Tooltip'
import { LanguageProvider } from '../context/LanguageContext'
import { NightModeProvider } from '../context/NightModeContext'

function withProviders(ui: React.ReactNode) {
  return (
    <NightModeProvider>
      <LanguageProvider>{ui}</LanguageProvider>
    </NightModeProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
  // Language is URL-driven; pin these component tests to German (stored pref +
  // root URL) so the German tooltip assertions are deterministic.
  history.replaceState(null, '', '/')
  localStorage.setItem('firlefanz-language', 'de')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  history.replaceState(null, '', '/')
})

describe('Tooltip', () => {
  it('renders the label and the wrapped child', () => {
    render(
      <Tooltip label="Hello">
        <button>child</button>
      </Tooltip>,
    )
    expect(screen.getByText('Hello')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'child' })).toBeTruthy()
  })
})

describe('LanguageToggle', () => {
  it('shows "DE" when language is German', () => {
    localStorage.setItem('firlefanz-language', 'de')
    render(withProviders(<LanguageToggle />))
    expect(screen.getByRole('button', { name: 'DE' })).toBeTruthy()
  })

  it('shows "EN" when language is English', () => {
    localStorage.setItem('firlefanz-language', 'en')
    render(withProviders(<LanguageToggle />))
    expect(screen.getByRole('button', { name: 'EN' })).toBeTruthy()
  })

  it('cycles to the next supported language on click (DE → EN)', () => {
    localStorage.setItem('firlefanz-language', 'de')
    render(withProviders(<LanguageToggle />))
    fireEvent.click(screen.getByRole('button', { name: 'DE' }))
    expect(screen.getByRole('button', { name: 'EN' })).toBeTruthy()
  })

  it('wraps around at the end of the supported list (EN → DE)', () => {
    localStorage.setItem('firlefanz-language', 'en')
    render(withProviders(<LanguageToggle />))
    fireEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('button', { name: 'DE' })).toBeTruthy()
  })

  it('renders the German tooltip when the language is German', () => {
    localStorage.setItem('firlefanz-language', 'de')
    render(withProviders(<LanguageToggle />))
    expect(screen.getByText('Sprache wechseln')).toBeTruthy()
  })

  it('renders the English tooltip when the language is English', () => {
    localStorage.setItem('firlefanz-language', 'en')
    render(withProviders(<LanguageToggle />))
    expect(screen.getByText('Switch language')).toBeTruthy()
  })
})

describe('NightModeToggle', () => {
  it('shows the moon glyph in day mode (clicking switches to night)', () => {
    localStorage.setItem('firlefanz-night-mode', 'false')
    render(withProviders(<NightModeToggle />))
    // Moon character — U+263E
    expect(screen.getByRole('button', { name: '☾' })).toBeTruthy()
  })

  it('shows the sun glyph in night mode (clicking switches to day)', () => {
    localStorage.setItem('firlefanz-night-mode', 'true')
    render(withProviders(<NightModeToggle />))
    // Sun character — U+2600
    expect(screen.getByRole('button', { name: '☀' })).toBeTruthy()
  })

  it('toggles the mode when clicked', () => {
    localStorage.setItem('firlefanz-night-mode', 'false')
    render(withProviders(<NightModeToggle />))
    fireEvent.click(screen.getByRole('button', { name: '☾' }))
    expect(screen.getByRole('button', { name: '☀' })).toBeTruthy()
  })

  it('uses the German tooltip in day mode when language is German', () => {
    localStorage.setItem('firlefanz-language', 'de')
    localStorage.setItem('firlefanz-night-mode', 'false')
    render(withProviders(<NightModeToggle />))
    expect(screen.getByText('Nachtmodus')).toBeTruthy()
  })

  it('uses the English tooltip in night mode when language is English', () => {
    localStorage.setItem('firlefanz-language', 'en')
    localStorage.setItem('firlefanz-night-mode', 'true')
    render(withProviders(<NightModeToggle />))
    expect(screen.getByText('Day mode')).toBeTruthy()
  })
})

describe('NarrationToggle', () => {
  it('shows the German "Vorlesen" tooltip when not narrating', () => {
    localStorage.setItem('firlefanz-language', 'de')
    render(withProviders(<NarrationToggle narrating={false} onToggle={() => {}} />))
    expect(screen.getByText('Vorlesen')).toBeTruthy()
  })

  it('shows the German "Vorlesen stoppen" tooltip when narrating', () => {
    localStorage.setItem('firlefanz-language', 'de')
    render(withProviders(<NarrationToggle narrating={true} onToggle={() => {}} />))
    expect(screen.getByText('Vorlesen stoppen')).toBeTruthy()
  })

  it('shows the English tooltips', () => {
    localStorage.setItem('firlefanz-language', 'en')
    const { rerender } = render(withProviders(<NarrationToggle narrating={false} onToggle={() => {}} />))
    expect(screen.getByText('Read aloud')).toBeTruthy()
    rerender(withProviders(<NarrationToggle narrating={true} onToggle={() => {}} />))
    expect(screen.getByText('Stop narration')).toBeTruthy()
  })

  it('calls onToggle when the button is clicked', () => {
    let toggled = 0
    render(withProviders(<NarrationToggle narrating={false} onToggle={() => { toggled++ }} />))
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(toggled).toBe(1)
  })
})

describe('FullscreenToggle', () => {
  it('renders nothing when the browser does not expose requestFullscreen (e.g. iOS Safari)', () => {
    const original = document.documentElement.requestFullscreen
    // @ts-expect-error — exercising the runtime feature-detect path
    document.documentElement.requestFullscreen = undefined
    const { container } = render(withProviders(<FullscreenToggle />))
    expect(container.firstChild).toBeNull()
    document.documentElement.requestFullscreen = original
  })

  it('renders a button when requestFullscreen is available', () => {
    document.documentElement.requestFullscreen = (() => Promise.resolve()) as () => Promise<void>
    render(withProviders(<FullscreenToggle />))
    // There's no accessible name (just an SVG), so query by role.
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })
})
