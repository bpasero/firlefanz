// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFDocument from 'pdfkit'
import sharp from 'sharp'
import type { Story } from '../src/types/story.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const storyId = process.argv[2]
if (!storyId) {
  console.error('Usage: npx tsx scripts/generate-pdf.ts <story-id>')
  console.error('Example: npx tsx scripts/generate-pdf.ts goldi-im-labyrinth')
  process.exit(1)
}

const storyDir = path.join(rootDir, 'public/stories', storyId)
const storyPath = path.join(storyDir, 'story.json')

if (!fs.existsSync(storyPath)) {
  console.error(`Story not found: ${storyPath}`)
  process.exit(1)
}

const story: Story = JSON.parse(fs.readFileSync(storyPath, 'utf-8'))
const outPath = path.join(storyDir, 'book.pdf')

// A4 portrait — image fills top half at exact 3:2 ratio, text sits below
// Trim size (final printed page): A4 portrait 210×297mm = 595.28×841.89 pt
// 3mm bleed on all sides: PDF canvas is 6mm wider and 6mm taller than trim size
// Bleed ensures artwork reaches the cut edge even with ±1–2mm cutting variation
const PAGE_W = 595.28   // pt — A4 trim width
const PAGE_H = 841.89   // pt — A4 trim height
const BLEED  = 3 * (72 / 25.4)      // 8.504 pt = 3mm

// PDF canvas dimensions (trim + bleed on all sides)
const CANVAS_W = PAGE_W + 2 * BLEED  // 612.29 pt
const CANVAS_H = PAGE_H + 2 * BLEED  // 858.90 pt

// 3mm safe-area margin inside the trim edges (left, top, right of image)
// Content within 3mm of the trim edge may be lost to cutting variation — keep images inset
const SAFE = BLEED                         // 8.504 pt = 3mm safe margin from each trim edge

const IMG_W = PAGE_W - 2 * SAFE           // 578.27 pt — image width within safe area
const IMG_H = IMG_W / 1.5                 // 385.51 pt — exact 3:2 fit, no cropping
const TEXT_Y = SAFE + IMG_H               // text panel starts below safe margin + image
const TEXT_H = PAGE_H - TEXT_Y           // slightly more space vs. old layout
const TEXT_PAD_X = 48
const TEXT_PAD_TOP = 28

// Convert trim-space coordinates to canvas-space (offset by bleed)
const cx = (x: number) => x + BLEED
const cy = (y: number) => y + BLEED

// Font paths — woff files supported by PDFKit
const fontsDir = path.join(rootDir, 'node_modules/@fontsource')
const FONT_LORA = path.join(fontsDir, 'lora/files/lora-latin-400-normal.woff')
const FONT_LORA_ITALIC = path.join(fontsDir, 'lora/files/lora-latin-400-italic.woff')
const FONT_PLAYFAIR = path.join(fontsDir, 'playfair-display/files/playfair-display-latin-700-normal.woff')
const FONT_PLAYFAIR_ITALIC = path.join(fontsDir, 'playfair-display/files/playfair-display-latin-400-italic.woff')

// Upscale an image to 300 DPI at safe-area image width using Lanczos resampling
// Source images are 1536×1024 (~185 DPI); this brings them to true 300 DPI print quality
// Width covers safe-area image width: (595.28 - 2×8.504) / 72 * 300 ≈ 2410 px
const PRINT_W = Math.round(IMG_W / 72 * 300)  // ~2410 px
const PRINT_H = Math.round(PRINT_W / 1.5)      // ~1607 px — exact 3:2 ratio

async function upscaleImage(imgPath: string): Promise<Buffer> {
  return sharp(imgPath)
    .resize(PRINT_W, PRINT_H, { kernel: 'lanczos3', fit: 'fill' })
    .jpeg({ quality: 90 })
    .toBuffer()
}

// Design tokens
const WARM_PAPER = '#fdf6e8'
const INK = '#2e1a0e'
const GOLD = '#c9a97a'
const BODY_SIZE = 18
const BODY_LINE_GAP = 9

;(async () => {

const doc = new PDFDocument({
  size: [CANVAS_W, CANVAS_H],   // canvas includes 3mm bleed on all sides
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  info: {
    Title: story.title,
    Creator: 'Firlefanz — Geschichten zum Einschlafen',
    Subject: `Firlefanz: ${story.title}`,
    Keywords: 'Firlefanz, Kinderbuch',
  },
})

doc.registerFont('Lora', FONT_LORA)
doc.registerFont('Lora-Italic', FONT_LORA_ITALIC)
doc.registerFont('Playfair', FONT_PLAYFAIR)
doc.registerFont('Playfair-Italic', FONT_PLAYFAIR_ITALIC)

const stream = fs.createWriteStream(outPath)
doc.pipe(stream)

// ── Cover page ──────────────────────────────────────────────────────────────
// Same structure as story pages: image at top (3:2, no cropping), warm panel below with title

// Warm paper background for entire canvas (including bleed zone)
doc.save().rect(0, 0, CANVAS_W, CANVAS_H).fill(WARM_PAPER).restore()

const coverPath = path.join(storyDir, path.basename(story.coverImage))
if (fs.existsSync(coverPath)) {
  console.log('Upscaling cover image to 300 DPI…')
  const coverBuf = await upscaleImage(coverPath)
  // Image inset 3mm from trim edges on left, top, right (safe area)
  doc.image(coverBuf, cx(SAFE), cy(SAFE), { width: IMG_W, height: IMG_H })
}

// Gold rule at image/text boundary (full canvas width)
doc.save().rect(0, cy(TEXT_Y), CANVAS_W, 1.5).fill(GOLD).restore()

// Warm paper background for text area — extends into bleed on left + right + bottom
doc.save().rect(0, cy(TEXT_Y), CANVAS_W, TEXT_H + BLEED).fill(WARM_PAPER).restore()

// "Firlefanz" series label
doc
  .fill(GOLD)
  .font('Lora-Italic')
  .fontSize(11)
  .text('Firlefanz — Geschichten zum Einschlafen', cx(50), cy(TEXT_Y + 36), {
    width: PAGE_W - 100,
    align: 'center',
  })

// Decorative rule under series label
const coverRuleY = cy(TEXT_Y + 58)
doc
  .save()
  .moveTo(cx(TEXT_PAD_X), coverRuleY)
  .lineTo(cx(PAGE_W - TEXT_PAD_X), coverRuleY)
  .strokeColor(GOLD)
  .lineWidth(0.5)
  .stroke()
  .restore()

// Story title — large Playfair, centred in the remaining space
const titleY = coverRuleY + 28
doc
  .fill(INK)
  .font('Playfair')
  .fontSize(42)
  .text(story.title, cx(50), titleY, {
    width: PAGE_W - 100,
    align: 'center',
    lineGap: 8,
  })




// ── Dedication page ──────────────────────────────────────────────────────────
doc.addPage()
doc.save().rect(0, 0, CANVAS_W, CANVAS_H).fill(WARM_PAPER).restore()

doc
  .fill(INK)
  .font('Playfair-Italic')
  .fontSize(22)
  .text('Für Madsi von deinem Papi', 0, cy(PAGE_H / 2 - 22), {
    width: CANVAS_W,
    align: 'center',
    lineGap: 6,
  })

doc
  .fill(GOLD)
  .font('Lora-Italic')
  .fontSize(11)
  .text('Zürich, 2026', 0, cy(PAGE_H / 2 + 18), { width: CANVAS_W, align: 'center' })

// ── Story pages ──────────────────────────────────────────────────────────────
for (let i = 0; i < story.pages.length; i++) {
  const page = story.pages[i]
  doc.addPage()

  // Top: illustration inset 3mm from trim edges on left, top, right (safe area)
  const imgPath = path.join(storyDir, path.basename(page.image))
  if (fs.existsSync(imgPath)) {
    console.log(`Upscaling page ${i + 1} image to 300 DPI…`)
    const imgBuf = await upscaleImage(imgPath)
    doc.image(imgBuf, cx(SAFE), cy(SAFE), { width: IMG_W, height: IMG_H })
  }

  // Thin gold rule between image and text panel (full canvas width)
  doc.save().rect(0, cy(TEXT_Y), CANVAS_W, 1.5).fill(GOLD).restore()

  // Warm paper background for text area — extends into bleed on left + right + bottom
  doc.save().rect(0, cy(TEXT_Y), CANVAS_W, TEXT_H + BLEED).fill(WARM_PAPER).restore()

  // Running title (small, gold, centred)
  doc
    .fill(GOLD)
    .font('Playfair-Italic')
    .fontSize(9)
    .text(story.title, cx(TEXT_PAD_X), cy(TEXT_Y + TEXT_PAD_TOP - 2), {
      width: PAGE_W - TEXT_PAD_X * 2,
      align: 'center',
    })

  // Gold rule under title
  const ruleY = cy(TEXT_Y + TEXT_PAD_TOP + 14)
  doc
    .save()
    .moveTo(cx(TEXT_PAD_X), ruleY)
    .lineTo(cx(PAGE_W - TEXT_PAD_X), ruleY)
    .strokeColor(GOLD)
    .lineWidth(0.5)
    .stroke()
    .restore()

  // Body text
  const bodyTop = ruleY + 14
  const bodyBottom = cy(PAGE_H - 44)   // reserve space for page number
  const maxH = bodyBottom - bodyTop

  doc.fill(INK).font('Lora').fontSize(BODY_SIZE)

  let textY = bodyTop
  for (const paragraph of page.text) {
    if (textY >= bodyBottom) break
    doc.text(paragraph, cx(TEXT_PAD_X), textY, {
      width: PAGE_W - TEXT_PAD_X * 2,
      align: 'left',
      lineGap: BODY_LINE_GAP,
      height: maxH - (textY - bodyTop),
      ellipsis: false,
    })
    textY = doc.y + 12
  }

  // Gold rule above page number
  const numRuleY = cy(PAGE_H - 36)
  doc
    .save()
    .moveTo(cx(TEXT_PAD_X * 2), numRuleY)
    .lineTo(cx(PAGE_W - TEXT_PAD_X * 2), numRuleY)
    .strokeColor(GOLD)
    .lineWidth(0.5)
    .stroke()
    .restore()

  // Page number
  doc
    .fill(GOLD)
    .font('Lora-Italic')
    .fontSize(11)
    .text(`\u2014 ${i + 1} \u2014`, cx(TEXT_PAD_X), cy(PAGE_H - 28), {
      width: PAGE_W - TEXT_PAD_X * 2,
      align: 'center',
    })

}

// ── End page ─────────────────────────────────────────────────────────────────
doc.addPage()
doc.save().rect(0, 0, CANVAS_W, CANVAS_H).fill(WARM_PAPER).restore()

doc
  .fill(INK)
  .font('Playfair')
  .fontSize(48)
  .text('Ende', 0, cy(PAGE_H / 2 - 30), { width: CANVAS_W, align: 'center' })

doc
  .save()
  .moveTo(CANVAS_W / 2 - 40, cy(PAGE_H / 2 + 28))
  .lineTo(CANVAS_W / 2 + 40, cy(PAGE_H / 2 + 28))
  .strokeColor(GOLD)
  .lineWidth(0.5)
  .stroke()
  .restore()

doc.end()

await new Promise<void>((resolve, reject) => {
  stream.on('finish', () => {
    const size = (fs.statSync(outPath).size / 1024).toFixed(0)
    console.log(`PDF saved: ${outPath} (${size} KB)`)
    resolve()
  })
  stream.on('error', reject)
})

})().catch(err => { console.error(err); process.exit(1) })
