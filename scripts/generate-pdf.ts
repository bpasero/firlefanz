// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFDocument from 'pdfkit'
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

// A4 landscape for a kids' book feel
const PAGE_WIDTH = 841.89
const PAGE_HEIGHT = 595.28
const MARGIN = 40

const doc = new PDFDocument({
  size: [PAGE_WIDTH, PAGE_HEIGHT],
  margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
  info: {
    Title: story.title,
    Author: 'Benjamin Pasero',
    Creator: 'Firlefanz — Geschichten zum Einschlafen',
    Subject: `Firlefanz: ${story.title}`,
    Keywords: 'Firlefanz, Kinderbuch, Benjamin Pasero',
  },
})

const stream = fs.createWriteStream(outPath)
doc.pipe(stream)

// --- Cover page ---
const coverPath = path.join(storyDir, path.basename(story.coverImage))
if (fs.existsSync(coverPath)) {
  doc.image(coverPath, 0, 0, { width: PAGE_WIDTH, height: PAGE_HEIGHT })
}
doc
  .fill('white')
  .fontSize(48)
  .font('Helvetica-Bold')
  .text(story.title, MARGIN, PAGE_HEIGHT - 120, {
    width: PAGE_WIDTH - MARGIN * 2,
    align: 'center',
  })

doc
  .fill('rgba(255,255,255,0.7)')
  .fontSize(10)
  .font('Helvetica')
  .text('\u00A9 2026 Benjamin Pasero. Alle Rechte vorbehalten.', MARGIN, PAGE_HEIGHT - 50, {
    width: PAGE_WIDTH - MARGIN * 2,
    align: 'center',
  })

// --- Story pages ---
for (let i = 0; i < story.pages.length; i++) {
  const page = story.pages[i]
  doc.addPage()

  const imgPath = path.join(storyDir, path.basename(page.image))
  const halfWidth = PAGE_WIDTH / 2 - 10

  if (fs.existsSync(imgPath)) {
    doc.image(imgPath, MARGIN, MARGIN, {
      width: halfWidth - MARGIN,
      height: PAGE_HEIGHT - MARGIN * 2,
      fit: [halfWidth - MARGIN, PAGE_HEIGHT - MARGIN * 2],
      align: 'center',
      valign: 'center',
    })
  }

  const textX = PAGE_WIDTH / 2 + 10
  const textWidth = halfWidth - MARGIN

  doc
    .save()
    .roundedRect(textX, MARGIN, textWidth + MARGIN - 10, PAGE_HEIGHT - MARGIN * 2, 4)
    .fill('#fdf8ed')
    .restore()

  doc.fill('#3e2723').fontSize(16).font('Helvetica')
  let textY = MARGIN + 30

  for (const paragraph of page.text) {
    doc.text(paragraph, textX + 20, textY, {
      width: textWidth - 40,
      align: 'left',
      lineGap: 6,
    })
    textY = doc.y + 12
  }

  doc
    .fill('#b0896e')
    .fontSize(11)
    .font('Helvetica-Oblique')
    .text(`— ${i + 1} —`, textX, PAGE_HEIGHT - MARGIN - 10, {
      width: textWidth,
      align: 'center',
    })
}

doc.end()

stream.on('finish', () => {
  const size = (fs.statSync(outPath).size / 1024).toFixed(0)
  console.log(`PDF saved: ${outPath} (${size} KB)`)
})
