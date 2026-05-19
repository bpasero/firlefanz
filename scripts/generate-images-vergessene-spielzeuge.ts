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

const storyDir = path.join(rootDir, 'public/stories/die-stadt-der-vergessenen-spielzeuge')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly'
const B = 'Brummel is a large old teddy bear with thin fur in places, tiny glasses, and a warm smile'
const OUTFIT = 'Firlefanz wears a green hat, brown boots, and a warm jacket, holding a walking stick, with a small bag carrying a toy train. Papalapapp wears a scarf and carries a bag of cookies.'
const OUTFIT_PAGE = 'page-5.png'

interface ImageSpec {
  filename: string
  prompt: string
  isOutfitPage?: boolean
  useOutfitRef?: boolean
}

const images: ImageSpec[] = [
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} standing at the entrance of a tiny colorful city made of building blocks, paper roofs, and marble streets. An old teddy bear with glasses welcomes him. Toys peek from windows. Magical, warm, inviting. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} in bed, looking up at the ceiling. Morning light. A faint sound from the attic above. Curious expression, cozy small bedroom. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} on a dusty attic, surrounded by old boxes and draped cloths. He holds a small red wooden toy train with chipped paint. Warm light from a small window. Wonder and curiosity. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} at a kitchen table eating honey bread and drinking warm milk. A small red wooden toy train sits next to his plate. Cozy kitchen, warm morning light, thoughtful expression. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} visiting ${P} in a cozy living room. Papalapapp sits in an armchair with coffee, examining a small red wooden toy train. Warm, friendly atmosphere. Papalapapp about to stand up. ${E}` },
  { filename: 'page-5.png', prompt: `${S} ${F} wearing green hat, boots, jacket, holding walking stick. ${P} with scarf and bag of cookies. Both at the door ready for adventure. Firlefanz has a small bag with the toy train inside. ${E}`, isOutfitPage: true },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} on an epic journey through a fantasy landscape. ${OUTFIT} Along the path are small lost items: a colored pencil, a marble, a tiny doll shoe. Golden desert, mountains, gentle waves, blooming meadows. Warm sunset colors. ${E}`, useOutfitRef: true },
  { filename: 'page-7.png', prompt: `${S} A magical tiny city behind a gentle hill, nestled between ancient trees. Houses made of colorful building blocks, roofs of bright paper, streets paved with glass marbles. ${F} and ${P} approaching. ${OUTFIT} Warm glowing lights in windows. Enchanting, miniature, cozy. ${E}`, useOutfitRef: true },
  { filename: 'page-8.png', prompt: `${S} ${B} standing at a small city gate made of stacked building blocks. He wears tiny round glasses and has a warm smile. His fur is worn but lovable. ${F} and ${P} arrive, looking up at him. ${OUTFIT} Welcoming atmosphere. ${E}`, useOutfitRef: true },
  { filename: 'page-9.png', prompt: `${S} A lively toy town square. Stuffed animals run a small shop trading buttons and ribbons. Wooden figures play tag in a small plaza. An old doll with one shoe reads stories to smaller toys. ${F}, ${P} and ${B} walking through. ${OUTFIT} Charming, bustling, warm. ${E}`, useOutfitRef: true },
  { filename: 'page-10.png', prompt: `${S} ${F} holding out a small red wooden toy train to ${B}. ${OUTFIT} Brummel looks at it with tears of joy in his eyes, gently taking it in his paws. Emotional, warm reunion moment. Soft lighting. ${E}`, useOutfitRef: true },
  { filename: 'page-11.png', prompt: `${S} ${F}, ${P}, ${B} and various toys sitting together on a town square, sharing cookies. ${OUTFIT} A small red toy train circles around them happily. Toys singing together. Warm evening light, cozy, communal. ${E}`, useOutfitRef: true },
  { filename: 'page-12.png', prompt: `${S} ${P} carrying sleeping ${F} on his back, walking home under a starry sky. ${OUTFIT} ${B} waves goodbye from the toy city gate in the background. Firlefanz holds a tiny wooden cube in his hand. Peaceful, sleepy, the toy city glows warmly behind them. ${E}`, useOutfitRef: true },
]

async function generate(spec: ImageSpec, referenceImagePath: string | null = null): Promise<void> {
  console.log(`Generating ${spec.filename}...`)
  let res: Response
  if (referenceImagePath && fs.existsSync(referenceImagePath)) {
    const formData = new FormData()
    formData.append('model', 'gpt-image-2')
    formData.append('prompt', spec.prompt)
    formData.append('size', '1536x1024')
    formData.append('quality', 'high')
    const imageData = fs.readFileSync(referenceImagePath)
    formData.append('image', new Blob([imageData], { type: 'image/png' }), 'reference.png')
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

let outfitRefPath: string | null = null
for (const spec of images) {
  try {
    await generate(spec, spec.useOutfitRef ? outfitRefPath : null)
    if (spec.isOutfitPage) {
      outfitRefPath = path.join(storyDir, OUTFIT_PAGE)
    }
  } catch (e) { console.error(`  FAILED: ${(e as Error).message}`) }
  await new Promise((r) => setTimeout(r, 2000))
}
console.log('\nDone!')
