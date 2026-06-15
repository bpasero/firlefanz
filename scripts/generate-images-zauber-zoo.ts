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

const storyDir = path.join(rootDir, 'public/stories/der-zauber-zoo')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Warm palette of golden amber, soft greens, and muted earth tones. Gentle ink outlines, pastel washes, luminous highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face'
const MELODINA = 'Melodina is a tall giraffe with a long shimmering golden neck, gentle eyes, and a serene expression'
const BRUNO = 'Brummbär Bruno is a big round cozy bear with paint-stained paws and a friendly sleepy face'
const SCHLANGE = 'The Schlummerschlange (Dream Snake) is a small friendly snake with soft patterned scales, knitting tiny blankets with her tail'
const SCHILDFRIED = 'Herr Schildfried is an ancient enormous tortoise with a small pair of round glasses on his nose, wise and gentle'
const OUTFIT = 'Firlefanz wears a green hat, brown boots, and a warm jacket, holding a wooden walking stick. Papalapapp wears a scarf and carries a bag of cookies.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  { filename: STYLE_REF, prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from multiple angles (front, side, waving). Next to him, ${P}, also shown from multiple angles. Bottom row: ${MELODINA} standing gracefully. Next to her, ${SCHILDFRIED} with his glasses. Next to him, ${BRUNO} holding a paintbrush. Consistent art style throughout. White background. ${E}`, isStyleRef: true },
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} and ${P} standing at the edge of a glowing lake (Schlummersee) at sunset. Behind them, a magical open zoo with no fences — ${MELODINA} in the background, ${BRUNO} painting nearby, and ${SCHILDFRIED} on a mossy rock. Warm golden light reflecting off the water. Magical, inviting, peaceful. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} in bed, rubbing his eyes, just woken up. A dreamy thought bubble shows a singing giraffe. Morning sunlight through the window. Cozy small bedroom, warm golden light. Curious, wondering expression. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} at a small kitchen table eating honey bread and drinking warm milk. He has a thoughtful expression, chin resting on one hand, remembering something. A tiny colorful butterfly visible outside the window. Warm cozy kitchen, morning light. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} visiting ${P} who is watering flowers in a small garden. Papalapapp smiles warmly and sets down a watering can. Sunny morning, colorful flowers. Papalapapp is about to grab his scarf to join the adventure. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} wearing a green hat, brown boots, warm jacket, holding a walking stick. ${P} with a scarf and a bag of cookies. Both standing at the door, ready for adventure, excited expressions. ${E}` },
  { filename: 'page-5.png', prompt: `${S} ${F} and ${P} in the Kicherberge (Giggle Mountains) — rounded, friendly mountains with faces in the rocks that are giggling. ${OUTFIT} Firlefanz is sitting on a rock laughing, the rock has a cheerful giggling expression. Warm sunset colors, whimsical, playful. ${E}` },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} walking through the Flüsterwald (Whispering Forest) — tall trees with silver shimmering leaves. ${OUTFIT} An ancient oak tree seems to whisper to them. Soft ethereal light, mysterious but gentle. A faint golden glow visible in the distance between the trees. ${E}` },
  { filename: 'page-7.png', prompt: `${S} ${F} and ${P} arriving at Schlummersee — a lake glowing softly like warm milk. ${OUTFIT} An old wooden sign reads nothing (no text). Behind the lake, a magical open zoo with gentle paths winding between trees and flower meadows. No fences, no cages. Warm golden evening light. Peaceful and inviting. ${E}` },
  { filename: 'page-8.png', prompt: `${S} ${F} and ${P} meeting ${MELODINA} in the Magic Zoo. ${OUTFIT} Melodina bends her long shimmering neck down toward little Firlefanz, humming. Visible sound waves or musical notes in the air. Lush green surroundings, warm light, magical atmosphere. ${E}` },
  { filename: 'page-9.png', prompt: `${S} ${BRUNO} sitting on the grass painting a canvas showing clouds and a moon, paint on his paws. Next to him, ${SCHLANGE} knitting a tiny blanket. ${F} and ${P} watching with delight. ${OUTFIT} Warm afternoon light, lush zoo setting with flowers. Cozy and creative scene. ${E}` },
  { filename: 'page-10.png', prompt: `${S} ${SCHILDFRIED} standing before ${F} and ${P}, welcoming them with a warm smile. ${OUTFIT} Schildfried is enormous and ancient, with his little round glasses. The Magic Zoo stretches behind him — open meadows, gentle paths, animals roaming freely. Warm golden light. ${E}` },
  { filename: 'page-11.png', prompt: `${S} Sunset scene at Schlummersee. All animals gathered around ${SCHILDFRIED} who is telling a story. ${MELODINA} lying in the grass, ${BRUNO} with brushes aside, ${SCHLANGE} curled up. ${F} and ${P} among them, looking sleepy. ${OUTFIT} The lake glows golden. Warm, drowsy, magical evening atmosphere. ${E}` },
  { filename: 'page-12.png', prompt: `${S} ${F} asleep on ${P}'s back, being carried home under a starry night sky. ${OUTFIT} In the distance behind them, Schlummersee glows softly. Stars shine like tiny night lights. The scene is peaceful, sleepy, and warm. Gentle dark blue and gold tones. ${E}` },
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
