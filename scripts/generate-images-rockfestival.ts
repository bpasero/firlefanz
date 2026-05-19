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

const storyDir = path.join(rootDir, 'public/stories/das-rockfestival')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly'
const R = 'Riffchen is a small round creature with moss-like fur, glowing eyes, and a guitar around its neck'
const K = 'The Krachdrachen are three big friendly dragons with electric guitars, a thunder-cloud drum set, and a deep bass'
const OUTFIT = 'Firlefanz wears a green hat, brown boots, a warm jacket, and big fluffy headphones around his neck, holding a walking stick. Papalapapp wears a scarf and also has fluffy headphones.'
const OUTFIT_PAGE = 'page-4.png'

interface ImageSpec {
  filename: string
  prompt: string
  isOutfitPage?: boolean
  useOutfitRef?: boolean
}

const images: ImageSpec[] = [
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} and ${P} standing on a hilltop looking down at a magical rock festival in a vast valley below. A huge glowing stage in the center with colorful lights, surrounded by dozens of colorful tents. Both wearing big fluffy headphones. Warm sunset colors, exciting but gentle. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} in bed, just waking up, ears pricked, listening to a faint distant rumbling sound. Morning sunlight through the window. Curious, excited expression. Cozy small bedroom. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} at a small kitchen table with jam bread and warm milk, barely able to sit still, looking excited and dreamy. Warm cozy kitchen, morning light. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} visiting ${P} who sits on a bench in front of a cozy house, drinking morning coffee. ${F} looks excited, gesturing enthusiastically. ${P} smiles warmly. Sunny morning. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} wearing a green hat, brown boots, warm jacket, holding a walking stick, and wearing big fluffy over-ear headphones. ${P} with a scarf and his own pair of fluffy headphones. Both standing at the door, ready for adventure, looking happy. ${E}`, isOutfitPage: true },
  { filename: 'page-5.png', prompt: `${S} ${F} and ${P} on an epic journey across a vast fantasy landscape. ${OUTFIT} Golden sparkling seas, sandy deserts, mountains, blooming meadows. Wide panoramic view, warm colors. A faint glow on the horizon hinting at the festival ahead. ${E}`, useOutfitRef: true },
  { filename: 'page-6.png', prompt: `${S} A magical rock festival in a vast valley called Donnertal. A huge center stage made of shiny wood and colorful rocks, decorated with thousands of sparkling lights. Surrounding the stage are dozens of colorful tents of all shapes — round, pointed, mushroom-shaped. Small campfires dot the area with friendly creatures gathered around them. ${F} and ${P} in the foreground looking down in awe. ${OUTFIT} Warm evening light. ${E}`, useOutfitRef: true },
  { filename: 'page-7.png', prompt: `${S} ${R} waddling toward ${F} and ${P}, waving cheerfully. Festival tents and the big stage visible in the background. ${OUTFIT} Warm, friendly, welcoming scene. ${E}`, useOutfitRef: true },
  { filename: 'page-8.png', prompt: `${S} ${R} showing ${F} and ${P} around the festival grounds. Stalls with colorful cotton candy and sparkling lemonade bottles. A cozy round tent with soft cushions visible inside. ${OUTFIT} Warm, magical, festive atmosphere. ${E}`, useOutfitRef: true },
  { filename: 'page-9.png', prompt: `${S} ${K} performing on the huge center stage under colorful spotlights. The three dragon musicians play electric guitars and thunder-cloud drums energetically. ${F} and ${P} in the audience wearing their fluffy headphones, bouncing happily to the music. ${OUTFIT} Vibrant but warm stage lighting, crowd of friendly creatures watching. ${E}`, useOutfitRef: true },
  { filename: 'page-10.png', prompt: `${S} ${F} standing on the big stage under warm spotlights, playing a small drum with a big smile. One of the Krachdrachen dragons stands next to him encouragingly. The audience of friendly creatures cheers and claps. ${OUTFIT} Magical, warm stage lighting. ${E}`, useOutfitRef: true },
  { filename: 'page-11.png', prompt: `${S} Everyone sitting around a large campfire at night. ${K} playing very softly in the background. Small shimmering musical notes float up into the starry sky like fireflies. ${R} handing out cups of warm cocoa. ${F} and ${P} sitting together peacefully. ${OUTFIT} Calm, sleepy, warm nighttime atmosphere. ${E}`, useOutfitRef: true },
  { filename: 'page-12.png', prompt: `${S} ${F} and ${P} cuddled up together inside a cozy round tent with soft cushions and blankets. ${F} is falling asleep with a peaceful smile, fluffy headphones beside the pillow. ${P} has his arm around ${F}. Through the tent opening, stars sparkle and a faint warm glow from the distant stage. Very sleepy, warm, peaceful. ${E}`, useOutfitRef: true },
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
