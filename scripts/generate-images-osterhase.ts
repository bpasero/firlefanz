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

const storyDir = path.join(rootDir, 'public/stories/der-osterhase')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Warm spring palette of soft greens, sky blues, bright tulip reds, sunny yellows, and gentle violets. Gentle ink outlines, pastel washes, luminous highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face and a scarf'
const OSTERHASE = 'The Osterhase (Easter Bunny) is a soft, fluffy snow-white rabbit with long floppy ears, a pink nose, and gentle warm eyes, carrying a woven wicker basket filled with colourful painted Easter eggs'
const OUTFIT = 'Firlefanz wears a yellow spring jacket, light blue hiking boots, and a straw hat, and holds a wooden walking stick with a colourful ribbon'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  { filename: STYLE_REF, isStyleRef: true, prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from multiple angles (front, side, back, waving). Beside him: ${P}, also from multiple angles. Bottom row: ${OSTERHASE} shown from front and side, holding a wicker basket. White background. Consistent art style throughout. ${E}` },
  { filename: 'cover.png', prompt: `${S} Book cover: ${F} and ${OSTERHASE} standing together in a sunlit meadow full of colourful Easter eggs — red, blue, yellow, violet, striped, dotted. Rainbow tulips and golden daffodils everywhere. Firlefanz holds a violet egg with golden stars. Soft morning sunlight, magical and joyful spring scene. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} just waking up in his cosy bedroom, rubbing his eyes and looking out the window with wide eyes. Through the window, a small garden is visible with colourful Easter eggs scattered on the green grass — red, blue, yellow, green, all gleaming in the morning light. Warm golden morning atmosphere, curtains gently swaying. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} at a small wooden kitchen table eating a bowl of warm oatmeal drizzled with honey. He has a thoughtful, wondering expression. A small colourful Easter egg sits on the table beside his bowl. Soft spring morning light through a window, cosy kitchen. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} visiting ${P}, who sits on a sunny porch in a chair with a steaming coffee cup. A bright red Easter egg sits on the little porch table beside the cup. Papalapapp smiles warmly and gestures toward distant spring mountains. Firlefanz looks excited. Colourful spring garden in the background. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} standing in front of a mirror, dressed for adventure: yellow spring jacket, light blue hiking boots, a straw hat, and a wooden walking stick with a colourful ribbon. He gives a proud nod. Next to him ${P} wraps a scarf around his neck. Warm, bright hallway. ${E}` },
  { filename: 'page-5.png', prompt: `${S} Epic panoramic journey scene: ${F} and ${P} walking across a vast, colourful spring landscape. ${OUTFIT} They cross a turquoise sea on stepping stones, climb a snow-capped mountain with blooming flowers, and pass through a golden flower forest. Bright colours, sense of adventure and distance. ${E}` },
  { filename: 'page-6.png', prompt: `${S} A sweeping valley bursting with rainbow colours: giant red and yellow tulips, golden daffodils. Colourful Easter eggs everywhere on green meadows — red, blue, violet, orange, striped, dotted. ${F} and ${P} stand at the valley's edge in awe. ${OUTFIT} In the meadow below, ${OSTERHASE} is visible with a wicker basket. Bright, joyful, magical spring landscape. ${E}` },
  { filename: 'page-7.png', prompt: `${S} ${F} and ${P} meeting ${OSTERHASE} in the colourful Easter meadow. The Easter Bunny's long floppy ears frame a warm welcoming smile. Firlefanz stares with big round eyes at a beautiful violet egg the bunny holds up. ${OUTFIT} Colourful eggs scattered around them. Bright, cheerful spring atmosphere. ${E}` },
  { filename: 'page-8.png', prompt: `${S} Cosy workshop scene: ${F} and ${P} sit at a long wooden workbench beside ${OSTERHASE}. Open paint pots in red, blue, yellow, violet, gold. ${F} carefully paints a violet egg with a fine brush, adding golden dots. Papalapapp paints an egg with tiny cups. Easter Bunny watches proudly. Warm workshop light, colourful and joyful. ${E}` },
  { filename: 'page-9.png', prompt: `${S} ${F}, ${P}, and ${OSTERHASE} in a green spring meadow hiding colourful Easter eggs — tucking them between flowers, under bushes, behind mossy stones. Each character holds or places an egg carefully. Tulips and daffodils everywhere. Afternoon sunshine, warm and playful. ${E}` },
  { filename: 'page-10.png', prompt: `${S} Warm farewell scene: ${OSTERHASE} places a special violet egg with golden stars gently into ${F}'s outstretched hands. ${P} watches with a soft smile. The Easter Land valley glows in warm amber evening light behind them. Firlefanz looks at the egg with wonder and gratitude. ${E}` },
  { filename: 'page-11.png', prompt: `${S} ${F}'s cosy bedroom at night. A violet egg with golden stars sits on the windowsill, glowing softly in the moonlight like a tiny treasure. ${P} sits beside ${F} who is tucked under a warm blanket, eyes drooping, sleepy smile. Moonlight and starlight through the window. Deep blue and gold tones, peaceful and dreamy. ${E}` },
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
