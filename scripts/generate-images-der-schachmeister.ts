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

const storyDir = path.join(rootDir, 'public/stories/der-schachmeister')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly'
const Z = 'Grandmaster Zeno is a kind old human man with a long white beard and warm wise eyes, wearing a long robe'
const OUTFIT = 'Firlefanz wears a green hat, brown boots, and a warm jacket, holding a wooden walking stick. Papalapapp wears a scarf and a coat.'
const OUTFIT_PAGE = 'page-4.png'

interface ImageSpec {
  filename: string
  prompt: string
  isOutfitPage?: boolean
  useOutfitRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: 'cover.png',
    prompt: `${S} A book cover: ${F} and ${Z} sit across from each other at a beautiful wooden chess table inside a cozy tower room. A glowing chess board with golden and silver pieces is between them. Both smile warmly. Magical warm lamplight, bookshelves in the background. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} sitting up in bed, stretching and looking excited, golden morning sunlight streaming through the window. On the small nightstand next to the bed sits a tiny chess king piece. Cozy small bedroom with warm, soft light. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sitting at a kitchen table eating a bowl of oatmeal with honey and drinking herbal tea. On the table in front of him sits a small wooden chess set with pieces arranged on the board — Firlefanz gazes at the pieces curiously and thoughtfully. Warm, cozy kitchen. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} talking eagerly to ${P}, who sits on a sunny porch holding a coffee cup and smiling wisely. Morning light, wooden porch with flower pots. Papalapapp looks thoughtful and ready to stand up. Both look at each other warmly. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} wearing green hat, boots, warm jacket, holding a wooden walking stick. ${P} wearing a scarf and coat with a backpack. Both standing at the front door of a cozy cottage, bundled up and ready for a great journey. Morning light, cheerful expressions. ${E}`,
    isOutfitPage: true
  },
  {
    filename: 'page-5.png',
    prompt: `${S} ${F} and ${P} on a grand journey through magical landscapes — seven glittering seas with seagulls, golden deserts, tall snow-capped mountains, wide rivers, and deep forests. ${OUTFIT} Epic, wide panoramic view of their long and wondrous journey. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} and ${P} arriving in a magical kingdom where the trees are shaped like giant chess pieces — white rooks, black bishops, golden knights — rising from the ground like a forest. The path beneath their feet is black-and-white checkered like a chessboard. Small colorful birds hop from square to square. ${OUTFIT} Firlefanz hops joyfully. Whimsical, enchanting, fairytale landscape. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-7.png',
    prompt: `${S} A tall white alabaster tower at the end of a long black-and-white checkered path. On the tower balcony stands ${Z}, waving down warmly. ${F} and ${P} look up at him from below with big smiles. ${OUTFIT} Blue sky, the chess kingdom forest surrounding the tower. Welcoming, magical, cozy. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Inside a cozy tower room filled with chess boards, books, and warm lamplight. ${Z} sits beside ${F} at a small table, patiently pointing to different chess pieces on the board — a king, a queen, a knight. Firlefanz watches with wide, shining eyes full of wonder. ${P} smiles from a nearby armchair. Bookshelves everywhere, warm golden light. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-9.png',
    prompt: `${S} ${F} and ${Z} playing chess at a beautiful wooden board, chess pieces glowing softly in warm lamplight. Firlefanz leans forward, one hand on his chin, thinking carefully about his next move. Zeno watches with a warm, encouraging smile. ${P} watches from the side, nodding proudly. Focused, cozy, joyful atmosphere. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-10.png',
    prompt: `${S} A cozy evening dinner scene inside the tower. ${Z}, ${F} and ${P} sit around a round table with plates of food and a big plate of checkered cookies — small black-and-white squares of deliciousness. Zeno speaks wisely, gesturing gently. Firlefanz and Papalapapp listen and smile. Stars visible through the tall tower window. Warm, peaceful, friendly. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-11.png',
    prompt: `${S} Farewell scene at the tower doorway. ${Z} kneels to present ${F} with a small, colorful wooden chess set — red, blue, yellow and green pieces. Firlefanz reaches out with sparkling eyes and a big happy smile. ${P} watches fondly. Warm evening light from inside the tower, soft outdoor dusk light outside. Heartfelt, cozy moment. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F} tucked snugly in a cozy bed, holding a small colorful wooden chess set gently in both hands. Eyes half-closed, a peaceful sleepy smile. Moonlight coming softly through the bedroom window. ${P} stands quietly in the doorway, watching with a warm gentle smile. Peaceful, sleepy, bedtime scene. ${E}`,
    useOutfitRef: true
  },
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
