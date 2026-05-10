// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/**
 * Watermark story images with copyright metadata and steganographic encoding.
 *
 * Usage:
 *   npx tsx scripts/watermark-images.ts [story-id]
 *
 * If no story-id is given, all stories are watermarked.
 *
 * Two layers of protection:
 * 1. EXIF/PNG metadata — copyright, author, description fields
 * 2. LSB steganography — encodes a message into the least significant bits
 *    of the red channel pixels. Invisible to the eye, survives casual copying.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const storiesDir = path.join(rootDir, 'public/stories')

const COPYRIGHT = '© 2026 Benjamin Pasero. All rights reserved.'
const STEGO_MESSAGE = 'Copyright Benjamin Pasero https://github.com/bpasero/firlefanz'

// --- LSB Steganography ---

export function encodeMessage(message: string): Buffer {
  const msgBytes = Buffer.from(message, 'utf-8')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(msgBytes.length, 0)
  return Buffer.concat([lenBuf, msgBytes])
}

export function embedLSB(pixelData: Buffer, message: Buffer): Buffer {
  const bits: number[] = []
  for (const byte of message) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1)
    }
  }

  if (bits.length > pixelData.length) {
    throw new Error('Image too small for message')
  }

  for (let i = 0; i < bits.length; i++) {
    pixelData[i] = (pixelData[i] & 0xfe) | bits[i]
  }

  return pixelData
}

export function extractLSB(pixelData: Buffer): string | null {
  const lenBits: number[] = []
  for (let i = 0; i < 32; i++) {
    lenBits.push(pixelData[i] & 1)
  }
  let msgLen = 0
  for (const bit of lenBits) {
    msgLen = (msgLen << 1) | bit
  }

  if (msgLen <= 0 || msgLen > 10000) return null

  const msgBits: number[] = []
  for (let i = 32; i < 32 + msgLen * 8; i++) {
    if (i >= pixelData.length) return null
    msgBits.push(pixelData[i] & 1)
  }

  const bytes: number[] = []
  for (let i = 0; i < msgBits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | msgBits[i + j]
    }
    bytes.push(byte)
  }

  return Buffer.from(bytes).toString('utf-8')
}

// --- Main ---

async function watermarkImage(filePath: string): Promise<void> {
  const image = sharp(filePath)
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })

  const msgBuffer = encodeMessage(STEGO_MESSAGE)
  const pixelData = Buffer.from(data)
  embedLSB(pixelData, msgBuffer)

  await sharp(pixelData, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png({ compressionLevel: 9 })
    .withExifMerge({
      IFD0: {
        Copyright: COPYRIGHT,
        Artist: 'Benjamin Pasero',
        ImageDescription: `Firlefanz - Geschichten zum Einschlafen`,
      },
    })
    .toFile(filePath + '.tmp')

  fs.renameSync(filePath + '.tmp', filePath)
}

async function verifyImage(filePath: string): Promise<string | null> {
  const { data } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true })
  return extractLSB(Buffer.from(data))
}

async function processStory(storyDir: string): Promise<void> {
  const storyName = path.basename(storyDir)
  const images = fs.readdirSync(storyDir).filter((f) => f.endsWith('.png'))

  if (images.length === 0) return

  console.log(`\nWatermarking: ${storyName} (${images.length} images)`)

  for (const img of images) {
    const filePath = path.join(storyDir, img)
    process.stdout.write(`  ${img}...`)
    await watermarkImage(filePath)

    const decoded = await verifyImage(filePath)
    if (decoded === STEGO_MESSAGE) {
      console.log(' OK (verified)')
    } else {
      console.log(' WARNING: verification failed')
    }
  }
}

// Run the CLI only when this file is invoked directly (not when imported by tests).
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const targetId = process.argv[2]
  let storyDirs: string[]

  if (targetId) {
    const dir = path.join(storiesDir, targetId)
    if (!fs.existsSync(dir)) {
      console.error(`Story not found: ${targetId}`)
      process.exit(1)
    }
    storyDirs = [dir]
  } else {
    storyDirs = fs
      .readdirSync(storiesDir)
      .filter((d) => {
        const full = path.join(storiesDir, d)
        return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, 'story.json'))
      })
      .map((d) => path.join(storiesDir, d))
  }

  console.log(`Watermark: "${STEGO_MESSAGE}"`)
  console.log(`Metadata: "${COPYRIGHT}"`)

  for (const dir of storyDirs) {
    await processStory(dir)
  }

  console.log('\nDone!')
}
