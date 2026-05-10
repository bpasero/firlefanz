// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/**
 * Sanity tests for the PDF page geometry. Broken values here silently produce
 * book PDFs that print with the wrong bleed, the wrong DPI, or content cut by
 * the trim — none of which is caught by visual review until a printed proof
 * arrives weeks later.
 */

import { describe, it, expect } from 'vitest'
import {
  PAGE_W,
  PAGE_H,
  BLEED,
  CANVAS_W,
  CANVAS_H,
  SAFE,
  IMG_W,
  IMG_H,
  TEXT_Y,
  TEXT_H,
  PRINT_W,
  PRINT_H,
} from './generate-pdf.ts'

const PT_PER_MM = 72 / 25.4

describe('PDF page geometry', () => {
  it('uses A4 portrait trim size in PostScript points (210×297mm)', () => {
    // ISO 216 A4: 210mm × 297mm. PDFKit uses 72 pt/inch.
    expect(PAGE_W).toBeCloseTo(210 * PT_PER_MM, 1) // ~595.28
    expect(PAGE_H).toBeCloseTo(297 * PT_PER_MM, 1) // ~841.89
    expect(PAGE_H).toBeGreaterThan(PAGE_W) // portrait, not landscape
  })

  it('uses a 3mm bleed on every edge', () => {
    expect(BLEED).toBeCloseTo(3 * PT_PER_MM, 3) // ~8.504
  })

  it('canvas is exactly trim + 2 × bleed on each axis', () => {
    expect(CANVAS_W).toBeCloseTo(PAGE_W + 2 * BLEED, 6)
    expect(CANVAS_H).toBeCloseTo(PAGE_H + 2 * BLEED, 6)
  })

  it('canvas is wider and taller than the trim', () => {
    expect(CANVAS_W).toBeGreaterThan(PAGE_W)
    expect(CANVAS_H).toBeGreaterThan(PAGE_H)
  })

  it('safe area equals the bleed (3mm inset from the trim edge)', () => {
    // Content within 3mm of the trim edge may be lost to cutting variation.
    expect(SAFE).toBe(BLEED)
  })

  it('image width fills the trim width minus a safe margin on each side', () => {
    expect(IMG_W).toBeCloseTo(PAGE_W - 2 * SAFE, 6)
    // Should be roughly 578.27 pt (≈ 204mm).
    expect(IMG_W / PT_PER_MM).toBeCloseTo(204, 0)
  })

  it('image height holds the cover-art 3:2 aspect ratio (no cropping)', () => {
    expect(IMG_W / IMG_H).toBeCloseTo(1.5, 6)
  })

  it('text panel begins immediately below the image (safe + image)', () => {
    expect(TEXT_Y).toBeCloseTo(SAFE + IMG_H, 6)
  })

  it('text panel height is the trim height minus the text Y origin', () => {
    expect(TEXT_H).toBeCloseTo(PAGE_H - TEXT_Y, 6)
    expect(TEXT_H).toBeGreaterThan(0)
  })

  it('the image plus the text panel together exactly fill the trim height', () => {
    // SAFE (top) + IMG_H + TEXT_H == PAGE_H
    expect(SAFE + IMG_H + TEXT_H).toBeCloseTo(PAGE_H, 6)
  })

  it('print pixel dimensions resolve to ~300 DPI of the safe-area image width', () => {
    // 300 DPI of IMG_W (in inches): IMG_W / 72 * 300
    expect(PRINT_W).toBe(Math.round((IMG_W / 72) * 300))
    // Sanity: ~2410 px (matches the comment in the script).
    expect(PRINT_W).toBeGreaterThan(2350)
    expect(PRINT_W).toBeLessThan(2450)
  })

  it('print height holds the same 3:2 aspect ratio as the layout', () => {
    expect(PRINT_W / PRINT_H).toBeCloseTo(1.5, 1)
  })
})
