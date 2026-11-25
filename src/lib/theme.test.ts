// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect } from 'vitest'
import { controlColors, readerColors } from './theme'

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe.each([false, true])('high contrast, nightMode=%s', (nightMode) => {
  const mode = { nightMode, highContrast: true }

  it('keeps reader text at AAA (7:1)', () => {
    const c = readerColors(mode)
    const pairs = [
      [c.text, c.paper], [c.pageNumber, c.paper], [c.title, c.pageBg],
      [c.counter, c.counterBg], [c.btnColor, c.btnBg], [c.btnColor, c.btnHoverBg],
    ]
    for (const [fg, bg] of pairs) expect(contrast(fg, bg)).toBeGreaterThanOrEqual(7)
  })

  it.each([false, true])('keeps controls at AAA and outlined, active=%s', (active) => {
    const c = controlColors(mode, active)
    expect(contrast(c.color, c.bg)).toBeGreaterThanOrEqual(7)
    expect(contrast(c.color, c.hoverBg)).toBeGreaterThanOrEqual(7)
    expect(c.border).toBeTruthy()
  })
})
