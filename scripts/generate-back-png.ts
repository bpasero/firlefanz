// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import type { Story } from '../src/types/story.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const storyId = process.argv[2]
if (!storyId) {
  console.error('Usage: npx tsx scripts/generate-back-png.ts <story-id>')
  console.error('Example: npx tsx scripts/generate-back-png.ts der-osterhase')
  process.exit(1)
}

const storyDir = path.join(rootDir, 'public/stories', storyId)
const storyPath = path.join(storyDir, 'story.json')
if (!fs.existsSync(storyPath)) {
  console.error(`Story not found: ${storyPath}`)
  process.exit(1)
}

const story: Story = JSON.parse(fs.readFileSync(storyPath, 'utf-8'))

// 148×210mm at 300 DPI
const W = Math.round(148 / 25.4 * 300)    // 1748 px
const H = Math.round(210 / 25.4 * 300)    // 2480 px
const H_PAD = Math.round(12 / 25.4 * 300) //  142 px — 12mm horizontal padding
const V_PAD = Math.round(14 / 25.4 * 300) //  165 px — 14mm vertical padding

// Register fonts
const fontsDir = path.join(rootDir, 'node_modules/@fontsource')
GlobalFonts.registerFromPath(path.join(fontsDir, 'fredoka/files/fredoka-latin-600-normal.woff'), 'Fredoka')
GlobalFonts.registerFromPath(path.join(fontsDir, 'fredoka/files/fredoka-latin-ext-600-normal.woff'), 'Fredoka')
GlobalFonts.registerFromPath(path.join(fontsDir, 'lora/files/lora-latin-400-normal.woff'), 'Lora')
GlobalFonts.registerFromPath(path.join(fontsDir, 'lora/files/lora-latin-ext-400-normal.woff'), 'Lora')
GlobalFonts.registerFromPath(path.join(fontsDir, 'lora/files/lora-latin-400-italic.woff'), 'Lora-Italic')
GlobalFonts.registerFromPath(path.join(fontsDir, 'lora/files/lora-latin-ext-400-italic.woff'), 'Lora-Italic')

const WARM_PAPER = '#fdf6e8'
const GOLD       = '#c9a97a'
const INK        = '#2e1a0e'

const TEASER_SIZE = 72
const TEASER_LINE_H = Math.round(TEASER_SIZE * 1.55)
const SERIES_SIZE = 44
const TITLE_SIZE  = 60

// Word-wrap using canvas text measurement
function wrapText(ctx: ReturnType<typeof createCanvas>['getContext'], text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const word of words) {
    const candidate = cur ? `${cur} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth) { cur = candidate }
    else { if (cur) lines.push(cur); cur = word }
  }
  if (cur) lines.push(cur)
  return lines
}

// ── Build canvas ─────────────────────────────────────────────────────────────

console.log(`Generating back PNG for "${story.title}"…`)

const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

// Warm paper background
ctx.fillStyle = WARM_PAPER
ctx.fillRect(0, 0, W, H)

// ── Top area: series label ───────────────────────────────────────────────────

const TOP_RULE_Y = V_PAD
ctx.strokeStyle = GOLD
ctx.lineWidth = 2
ctx.beginPath()
ctx.moveTo(H_PAD, TOP_RULE_Y)
ctx.lineTo(W - H_PAD, TOP_RULE_Y)
ctx.stroke()

ctx.font = `italic ${SERIES_SIZE}px Lora-Italic`
ctx.fillStyle = GOLD
ctx.textAlign = 'center'
ctx.textBaseline = 'alphabetic'
ctx.fillText('Firlefanz \u2014 Geschichten zum Einschlafen', W / 2, TOP_RULE_Y + 68)

const TOP_RULE2_Y = TOP_RULE_Y + 100
ctx.beginPath()
ctx.moveTo(H_PAD, TOP_RULE2_Y)
ctx.lineTo(W - H_PAD, TOP_RULE2_Y)
ctx.stroke()

// ── Teaser text — centred vertically in the middle area ──────────────────────

const BOTTOM_RULE_Y = H - V_PAD - 80 - TITLE_SIZE - 40  // reserve space for title at bottom
const middleTop    = TOP_RULE2_Y + 60
const middleBottom = BOTTOM_RULE_Y - 60

ctx.font = `${TEASER_SIZE}px Lora`
ctx.fillStyle = INK
ctx.textAlign = 'center'
ctx.textBaseline = 'alphabetic'

const teaserLines  = wrapText(ctx, story.teaser, W - 2 * H_PAD)
const teaserBlockH = teaserLines.length * TEASER_LINE_H
const teaserStartY = middleTop + Math.round((middleBottom - middleTop - teaserBlockH) / 2) + TEASER_SIZE

for (let i = 0; i < teaserLines.length; i++) {
  ctx.fillText(teaserLines[i], W / 2, teaserStartY + i * TEASER_LINE_H)
}

// ── Bottom area: decorative rule + title ─────────────────────────────────────

ctx.strokeStyle = GOLD
ctx.lineWidth = 2
ctx.beginPath()
ctx.moveTo(H_PAD, BOTTOM_RULE_Y)
ctx.lineTo(W - H_PAD, BOTTOM_RULE_Y)
ctx.stroke()

ctx.font = `600 ${TITLE_SIZE}px Fredoka`
ctx.fillStyle = INK
ctx.textAlign = 'center'
ctx.textBaseline = 'alphabetic'
ctx.fillText(story.title, W / 2, BOTTOM_RULE_Y + 80)

const BOTTOM_RULE2_Y = BOTTOM_RULE_Y + 80 + 40
ctx.strokeStyle = GOLD
ctx.lineWidth = 2
ctx.beginPath()
ctx.moveTo(H_PAD, BOTTOM_RULE2_Y)
ctx.lineTo(W - H_PAD, BOTTOM_RULE2_Y)
ctx.stroke()

// ── Save ─────────────────────────────────────────────────────────────────────

const outPath = path.join(storyDir, 'back_148x210.png')
const pngBuf = await canvas.encode('png')
fs.writeFileSync(outPath, pngBuf)

const size = (fs.statSync(outPath).size / 1024).toFixed(0)
console.log(`Saved: ${outPath} (${size} KB)`)
