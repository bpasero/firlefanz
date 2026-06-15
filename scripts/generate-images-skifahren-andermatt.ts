// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) { console.error('Missing OPENAI_API_KEY'); process.exit(1) }

const storyDir = path.join(rootDir, 'public/stories/skifahren-in-andermatt')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Warm palette of golden amber, soft greens, and muted earth tones. Gentle ink outlines, pastel washes, luminous highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face'
const KRISTALLINA = 'Kristallina is a snow hare with pure white fur and sparkling ice-crystal blue eyes, friendly and graceful'
const OUTFIT = 'Firlefanz wears a thick wool sweater, a cozy hat with a pom-pom, a long scarf, and padded boots. Papalapapp carries a backpack with skis strapped to it.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  { filename: STYLE_REF, prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from multiple angles (front, side, waving). Next to him, ${P}, also shown from multiple angles. Bottom row: ${KRISTALLINA} sitting and standing. Consistent art style throughout. White background. ${E}`, isStyleRef: true },
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} and ${P} skiing down a magical mountain with sparkling stardust snow flying around them. They wear ski gear and look joyful. Behind them, majestic snow-covered Alpine peaks glow in warm golden sunset light. A small snow hare (${KRISTALLINA}) watches from a snowy ledge. Magical winter wonderland atmosphere. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} in bed, just woken up, looking excitedly out the window. Outside, beautiful snowflakes dance through the air, each one sparkling like a tiny star. Morning light, cozy bedroom, warm golden tones contrasting with the white snow outside. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} at a small kitchen table drinking hot chocolate and eating buttered bread with honey. He has a dreamy, thoughtful expression, imagining a sparkling snowy mountain. Through the window, snowflakes are falling. Warm cozy kitchen, morning light. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} visiting ${P} at his kitchen table. Papalapapp holds a coffee cup and smiles warmly. Firlefanz looks excited, gesturing about skiing. Papalapapp is about to stand up to join the adventure. Warm morning kitchen scene. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} and ${P} getting ready for the journey. ${OUTFIT} Firlefanz is bundled up in winter clothes. Papalapapp is packing skis, apples, and a chocolate bar into a backpack. Both standing at the door, excited for the adventure. Snowy scene outside. ${E}` },
  { filename: 'page-5.png', prompt: `${S} ${F} and ${P} on an epic journey through a snowy landscape. ${OUTFIT} They walk over rolling snowy hills with mountains rising higher and higher in the background. The air looks crisp and fresh, snow sparkles everywhere. Seven different landscapes visible in layers — seas, deserts, mountains, rivers, forests, and snowy hills. Warm sunset light. ${E}` },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} arriving at a charming Alpine village (Andermatt) nestled between massive snow-covered mountains, like in a big white bowl. ${OUTFIT} Warm golden lights glow in windows of wooden chalets. Papalapapp points up at a mountain peak that shimmers silver. Cozy, magical winter evening. ${E}` },
  { filename: 'page-7.png', prompt: `${S} ${F} and ${P} riding in a small gondola/cable car high above snowy fir trees and frozen streams. ${OUTFIT} Firlefanz presses his nose against the glass window, looking down in wonder. At the top of the mountain, the snow sparkles like thousands of tiny stars. Breathtaking mountain panorama. ${E}` },
  { filename: 'page-8.png', prompt: `${S} ${F} and ${P} meeting ${KRISTALLINA} at the mountain summit. ${OUTFIT} Kristallina stands on a snowy ridge, holding sparkling magical skis that glow with stardust. The snow around them glitters like diamonds. Friendly, magical introduction scene. Bright snowy mountain top. ${E}` },
  { filename: 'page-9.png', prompt: `${S} ${F} skiing joyfully down a sparkling slope, stardust-like glowing sparks spraying from under the magical skis. ${P} skis alongside, laughing. ${OUTFIT} The snow shimmers and sparkles like stars. They appear to float just slightly above the snow. Dynamic, joyful, magical skiing scene. Mountain panorama in background. ${E}` },
  { filename: 'page-10.png', prompt: `${S} ${F} and ${P} sitting on a wooden bench at a mountain summit. ${KRISTALLINA} brings them steaming mugs of cocoa. ${OUTFIT} Behind them, a breathtaking panorama of endless snow-covered mountains under a sky turning orange and pink at sunset. Peaceful, warm, cozy mountain scene. ${E}` },
  { filename: 'page-11.png', prompt: `${S} ${F} hugging ${KRISTALLINA} goodbye on the snowy mountain top. ${P} stands nearby smiling. ${OUTFIT} The stardust snow sparkles around them. Warm, tender farewell scene. Soft golden light. ${E}` },
  { filename: 'page-12.png', prompt: `${S} ${F} asleep on ${P}'s back, being carried home under a starry night sky. ${OUTFIT} Snow-covered mountains in the background with the moon rising above them. A tiny sparkle of stardust on Firlefanz's nose. Peaceful, sleepy, and warm. Gentle dark blue and silver tones with warm golden highlights. ${E}` },
]

async function generate(spec: ImageSpec, referenceImages: string[]): Promise<void> {
  console.log(`Generating ${spec.filename}...`)

  const existingRefs = referenceImages.filter(p => fs.existsSync(p))

  let res: Response
  if (existingRefs.length > 0) {
    const formData = new FormData()
    formData.append('model', 'gpt-image-2')
    formData.append('prompt', spec.prompt)
    formData.append('size', '1536x1024')
    formData.append('quality', 'high')
    for (const refPath of existingRefs) {
      const imageData = fs.readFileSync(refPath)
      const refName = path.basename(refPath)
      formData.append('image[]', new Blob([imageData], { type: 'image/png' }), refName)
    }
    res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData,
    })
  } else {
    res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-2', prompt: spec.prompt, size: '1536x1024', quality: 'high' }),
    })
  }

  if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text()}`)
  const data = await res.json() as { data?: { b64_json?: string }[] }
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error('No image in response')
  const buf = Buffer.from(b64, 'base64')
  fs.writeFileSync(path.join(storyDir, spec.filename), buf)
  console.log(`  Saved ${spec.filename} (${(buf.length / 1024).toFixed(0)} KB)`)
}

const styleRefPath = path.join(storyDir, STYLE_REF)
let previousPagePath: string | null = null

for (const spec of images) {
  try {
    const refs: string[] = []

    // Always include the style reference sheet (except when generating it)
    if (!spec.isStyleRef) {
      refs.push(styleRefPath)
    }

    // Include the previous page for scene-to-scene continuity
    if (previousPagePath) {
      refs.push(previousPagePath)
    }

    await generate(spec, refs)

    // Track previous page (skip style ref from chain)
    if (!spec.isStyleRef) {
      previousPagePath = path.join(storyDir, spec.filename)
    }
  } catch (e) { console.error(`  FAILED: ${(e as Error).message}`) }
  await new Promise((r) => setTimeout(r, 2000))
}

// Clean up the style reference sheet — it's not part of the story
if (fs.existsSync(styleRefPath)) {
  fs.unlinkSync(styleRefPath)
  console.log(`\nCleaned up ${STYLE_REF}`)
}

console.log('\nDone!')
