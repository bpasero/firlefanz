// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8')
const apiKey = envContent.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim()
if (!apiKey) { console.error('Missing OPENAI_API_KEY in .env'); process.exit(1) }

const storyDir = path.join(rootDir, 'public/stories/die-ritterburg')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Warm palette of golden amber, soft greens, and muted earth tones. Gentle ink outlines, pastel washes, luminous highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face'
const GRAF = 'Graf Ritterhold is a tall kindly older human knight with a neat silver beard, a broad warm smile, and a shining silver breastplate'
const SILBERSTERN = 'Silberstern is a graceful white unicorn with a flowing silver mane and a softly glowing silver horn'
const OUTFIT = 'Firlefanz wears a green hat, brown boots, and a warm jacket, holding a wooden walking stick. Papalapapp wears a scarf and carries a backpack.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  { filename: STYLE_REF, prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from multiple angles (front, side, waving). Next to him, ${P}, also shown from multiple angles. Bottom row: ${GRAF} in armour, shown standing upright and smiling. Next to him, ${SILBERSTERN} standing gracefully, horn glowing softly. Consistent art style throughout. White background. ${E}`, isStyleRef: true },
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} in knight armour riding ${SILBERSTERN} across a meadow in front of the grand Burg Silbermond castle. Silver banners wave from tall towers, a drawbridge over a sparkling moat. ${P} cheering from the side. Heroic, magical, warm golden light. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} in bed, stretching and waking up. Golden morning sunlight streams through the window. A dreamy thought bubble shows a tall castle with silver flags. Cozy small bedroom, warm light, cheerful expression. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} at a small kitchen table eating millet porridge with pears and drinking a cup of warm milk. He gazes dreamily out the window with a happy expression. Warm cozy kitchen, morning light. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} running up to ${P} who sits on a doorstep with a morning coffee. ${P} has a warm smile and is raising an eyebrow knowingly. A small signpost in the background points to distant mountains (no text on the sign). Sunny morning, colourful flowers. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} fully dressed for travel — green hat, brown boots, warm jacket, wooden walking stick. ${P} with scarf and backpack. Both standing at the cottage door, excited and ready for adventure. ${E}` },
  { filename: 'page-5.png', prompt: `${S} ${F} and ${P} on an epic journey — crossing a wide glittering sea on a friendly whale's back with seagulls circling above. Behind them on the horizon: distant golden deserts and mountain peaks. ${OUTFIT} Sense of wonder and scale. ${E}` },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} arriving before the magnificent Burg Silbermond castle. Tall stone towers with silver pennants, a lowered drawbridge over a sparkling moat. ${GRAF} stands at the gate, arms outstretched in welcome. ${OUTFIT} Warm golden evening light. ${E}` },
  { filename: 'page-7.png', prompt: `${S} Inside the grand castle hall, ${F} kneels before ${GRAF} who gently touches his shoulder with a sword in a solemn knighting ceremony. Rows of knights in shining armour stand at attention on each side. Warm candlelight and colourful banners decorate the hall. Solemn yet warm moment. ${E}` },
  { filename: 'page-8.png', prompt: `${S} ${F} receives gifts from smiling knights: a long lance with a blue pennant and a round silver shield with a golden star. ${SILBERSTERN} is led into the hall, glowing horn, silver mane, nuzzling Firlefanz gently. ${GRAF} looks on with a beaming smile. Magical warm light. ${E}` },
  { filename: 'page-9.png', prompt: `${S} A festive outdoor tournament on a sunny meadow. Colourful tents, waving banners, crowds cheering. ${F} rides ${SILBERSTERN} into the arena, holding a lance with a blue pennant, silver shield on arm. ${P} waves enthusiastically from the stands. ${E}` },
  { filename: 'page-10.png', prompt: `${S} ${F} on ${SILBERSTERN} raises a lance triumphantly as the clear winner of the tournament. ${GRAF} places a laurel wreath on Firlefanz's head. Cheering crowd, colourful pennants, confetti in the air. Joyful, warm, celebratory scene. ${E}` },
  { filename: 'page-11.png', prompt: `${S} A warm feast inside the castle great hall. ${F}, ${P}, ${GRAF} and many knights sit around a long table with plates, goblets and a grand castle-shaped cake. Candles and banners, laughter and warmth. ${SILBERSTERN} peeks in through a tall window, silver horn glowing. ${E}` },
  { filename: 'page-12.png', prompt: `${S} ${F} rides ${SILBERSTERN} homeward under a starry night sky. ${P} walks cheerfully alongside. A lance with blue pennant and silver shield are strapped to Silberstern's side. In the distance behind them, Burg Silbermond glows softly under the moon. Peaceful, sleepy, magical night scene. ${E}` },
]

async function generate(spec: ImageSpec, referenceImages: string[]): Promise<void> {
  console.log(`Generating ${spec.filename}...`)

  const existingRefs = referenceImages.filter(p => fs.existsSync(p))

  let res: Response
  if (existingRefs.length > 0) {
    const formData = new FormData()
    formData.append('model', 'gpt-image-1')
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
      body: JSON.stringify({ model: 'gpt-image-1', prompt: spec.prompt, size: '1536x1024', quality: 'high' }),
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
