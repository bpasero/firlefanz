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

const storyDir = path.join(rootDir, 'public/stories/der-glaeserne-strand')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature (not human, no specific gender). There is exactly one Firlefanz in this image.'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly. There is exactly one Papalapapp in this image.'
const A = 'Axelotel is a small friendly fish with shimmering rainbow-coloured scales (green, blue, orange, pink, purple) and large warm curious eyes and a gentle smile'
const OUTFIT = 'Firlefanz wears a green hat, brown boots, and a warm jacket, holding a wooden walking stick and a small blue cloth bag. Papalapapp wears a scarf and a coat.'
const OUTFIT_PAGE = 'page-4.png'

interface ImageSpec {
  filename: string
  prompt: string
  isOutfitPage?: boolean
  useOutfitRef?: boolean
}

const images: ImageSpec[] = [
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} kneeling on a beautiful white sandy beach, ${A} poking out of the shallow water beside Firlefanz. The beach is covered with dozens of colourful smooth sea glass stones in red, green, blue, yellow, purple and orange, glittering in warm sunlight. The sea is calm and turquoise. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} sitting up in a cosy bed, looking out a bedroom window at a golden glittering morning sky. The light streams in warm and sparkly, as if the air itself were made of coloured glass. Firlefanz looks amazed and full of wonder. Cosy small bedroom with warm lamp light. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} sitting at a kitchen table eating a small honey roll and drinking warm milk with cinnamon from a mug. Firlefanz looks out the window with a dreamy, thoughtful expression. Warm morning light, cosy kitchen. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} talking excitedly to ${P}, who sits on a porch drinking coffee and listens with a calm knowing smile. Morning light, cosy porch with wooden chairs. ${P} is starting to stand up, ready to join the journey. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} wearing a green hat, brown boots, warm jacket, holding a wooden walking stick, and carrying a small blue cloth bag. ${P} wearing a scarf and coat. Both standing at the front door, bundled up and ready for a great journey. Cosy cottage door, morning light. ${E}`, isOutfitPage: true },
  { filename: 'page-5.png', prompt: `${S} ${F} and ${P} on an epic journey through magical landscapes — seven glittering seas, golden deserts, tall mountains, wide rivers, deep forests, and open plains. ${OUTFIT} The air around them smells of salt and mystery. Wide panoramic view, sense of grand adventure. ${E}`, useOutfitRef: true },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} arriving at a breathtaking beach. ${OUTFIT} The sand is white as snow and everywhere between the grains lie hundreds of smooth colourful sea glass stones — red, green, blue, yellow, purple and orange — glittering in sunlight like jewels. The sea is calm and turquoise. Firlefanz holds one breath in awe. ${E}`, useOutfitRef: true },
  { filename: 'page-7.png', prompt: `${S} ${F} kneeling in the soft white sand, carefully picking up smooth sea glass stones — a green one, a blue one, an orange one. ${OUTFIT} Firlefanz holds them up to the sunlight with delight. ${P} collects stones calmly nearby. The beach is covered with beautiful colourful stones. ${E}`, useOutfitRef: true },
  { filename: 'page-8.png', prompt: `${S} ${A} poking his head and fins cheerfully out of the shallow water at the edge of the beach. ${F} and ${P} look at him with surprised and delighted expressions. ${OUTFIT} The water around Axelotel shimmers with rainbow colours. Colourful sea glass stones visible on the sand and under the water. ${E}`, useOutfitRef: true },
  { filename: 'page-9.png', prompt: `${S} ${A} in the shallow water, gesturing with his fins as he tells his story. ${F} sits on the sand listening closely, holding a sea glass stone up with wide amazed eyes. ${P} sits nearby listening warmly. ${OUTFIT} The sea behind them stretches to the horizon. Colourful sea glass stones around them. ${E}`, useOutfitRef: true },
  { filename: 'page-10.png', prompt: `${S} ${A} diving and bringing new sea glass stones to the shore one by one. ${F} watches with joy and adds them to a small blue bag. ${OUTFIT} ${P} has built a little tower from the largest stones on the beach. The afternoon sun is warm and golden. A joyful, playful scene of friendship. ${E}`, useOutfitRef: true },
  { filename: 'page-11.png', prompt: `${S} ${A} waving goodbye with his fin from the shallow water as the sun sets golden over the sea. ${F} waves back with a warm smile. ${P} stands beside Firlefanz. ${OUTFIT} The sea is bathed in golden and pink sunset light. A tender, heartfelt farewell between new friends. ${E}`, useOutfitRef: true },
  { filename: 'page-12.png', prompt: `${S} ${F} tucked cosily into bed in a warm bedroom. On the windowsill three smooth sea glass stones — one green, one blue, one orange — glow softly in the moonlight streaming through the window. Firlefanz looks at them with a peaceful happy smile, eyes growing heavy. Quiet, sleepy, warm bedtime scene. ${E}`, useOutfitRef: true },
]

async function generate(spec: ImageSpec, referenceImagePath: string | null = null): Promise<void> {
  const outPath = path.join(storyDir, spec.filename)
  if (fs.existsSync(outPath)) {
    console.log(`Skipping ${spec.filename} (already exists)`)
    return
  }
  console.log(`Generating ${spec.filename}...`)
  let res: Response
  if (referenceImagePath && fs.existsSync(referenceImagePath)) {
    const formData = new FormData()
    formData.append('model', 'gpt-image-1')
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
      body: JSON.stringify({ model: 'gpt-image-1', prompt: spec.prompt, size: '1536x1024', quality: 'high' }),
    })
  }
  if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text()}`)
  const data = await res.json() as { data?: { b64_json?: string }[] }
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error('No image in response')
  const buf = Buffer.from(b64, 'base64')
  fs.writeFileSync(outPath, buf)
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
