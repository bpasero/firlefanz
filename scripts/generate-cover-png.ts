// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas'
import type { Story } from '../src/types/story.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const storyId = process.argv[2]
if (!storyId) {
  console.error('Usage: npx tsx scripts/generate-cover-png.ts <story-id>')
  console.error('Example: npx tsx scripts/generate-cover-png.ts der-osterhase')
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
const IMG_H = Math.round(W / 1.5)          // 1165 px — 3:2 ratio
const TEXT_Y = IMG_H
const TEXT_H = H - IMG_H                   // 1315 px
const H_PAD = Math.round(10 / 25.4 * 300) //  118 px — 10mm padding

// Register fonts from @fontsource
// Both latin and latin-ext must be registered to cover basic Latin + German umlauts
const fontsDir = path.join(rootDir, 'node_modules/@fontsource')
GlobalFonts.registerFromPath(path.join(fontsDir, 'fredoka/files/fredoka-latin-600-normal.woff'), 'Fredoka')
GlobalFonts.registerFromPath(path.join(fontsDir, 'fredoka/files/fredoka-latin-ext-600-normal.woff'), 'Fredoka')
GlobalFonts.registerFromPath(path.join(fontsDir, 'lora/files/lora-latin-400-italic.woff'), 'Lora')

const TITLE_SIZE  = 110
const SERIES_SIZE = 44
const LINE_H      = Math.round(TITLE_SIZE * 1.35)

const WARM_PAPER = '#fdf6e8'
const GOLD       = '#c9a97a'
const INK        = '#2e1a0e'

// Word-wrap using actual canvas text measurement
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

console.log(`Generating cover PNG for "${story.title}"…`)

// Scale cover image to fill the image area
const coverSrc = path.join(storyDir, path.basename(story.coverImage))
if (!fs.existsSync(coverSrc)) {
  console.error(`Cover image not found: ${coverSrc}`)
  process.exit(1)
}
const coverBuf = await sharp(coverSrc)
  .resize(W, IMG_H, { kernel: 'lanczos3', fit: 'fill' })
  .png()
  .toBuffer()

const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

// Warm paper background
ctx.fillStyle = WARM_PAPER
ctx.fillRect(0, 0, W, H)

// Cover image
const coverImg = await loadImage(coverBuf)
ctx.drawImage(coverImg, 0, 0, W, IMG_H)

// Gold rule at image/text boundary
ctx.fillStyle = GOLD
ctx.fillRect(0, TEXT_Y, W, 4)

// Series label
ctx.font = `italic ${SERIES_SIZE}px Lora`
ctx.fillStyle = GOLD
ctx.textAlign = 'center'
ctx.textBaseline = 'alphabetic'
const SERIES_Y = TEXT_Y + 90
ctx.fillText('Firlefanz \u2014 Geschichten zum Einschlafen', W / 2, SERIES_Y)

// Decorative rule
const RULE_Y = SERIES_Y + 58
ctx.strokeStyle = GOLD
ctx.lineWidth = 2
ctx.beginPath()
ctx.moveTo(H_PAD, RULE_Y)
ctx.lineTo(W - H_PAD, RULE_Y)
ctx.stroke()

// Story title — word-wrapped, centred in remaining panel space
ctx.font = `600 ${TITLE_SIZE}px Fredoka`
ctx.fillStyle = INK
ctx.textAlign = 'center'
ctx.textBaseline = 'alphabetic'

const titleLines  = wrapText(ctx, story.title, W - 2 * H_PAD)
const titleBlockH = titleLines.length * LINE_H
const titleTopY   = RULE_Y + 60 + Math.round((TEXT_H - (RULE_Y - TEXT_Y) - 60 - titleBlockH) / 2) + TITLE_SIZE

for (let i = 0; i < titleLines.length; i++) {
  ctx.fillText(titleLines[i], W / 2, titleTopY + i * LINE_H)
}

// ── Save ─────────────────────────────────────────────────────────────────────

const outPath = path.join(storyDir, 'cover_148x210.png')
const pngBuf = await canvas.encode('png')
fs.writeFileSync(outPath, pngBuf)

const size = (fs.statSync(outPath).size / 1024).toFixed(0)
console.log(`Saved: ${outPath} (${size} KB)`)
