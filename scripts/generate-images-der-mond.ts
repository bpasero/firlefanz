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

const storyDir = path.join(rootDir, 'public/stories/der-mond')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly'
const L = 'Luna is a soft, round, gently glowing moon spirit with large silver eyes, a warm silvery shimmer around her, and a kind shy smile'
const OUTFIT = 'Firlefanz wears a green hat, brown boots, and a warm jacket, holding a wooden walking stick. Papalapapp wears a scarf and a coat.'
const OUTFIT_PAGE = 'page-4.png'

interface ImageSpec {
  filename: string
  prompt: string
  isOutfitPage?: boolean
  useOutfitRef?: boolean
}

const images: ImageSpec[] = [
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} and ${L} sitting together on the surface of the moon, looking down at the glowing blue Earth below. A starry night sky all around. ${P} waves from behind. Magical, silvery, warm and cozy. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} sitting up in bed, looking out a bedroom window at a bright pink morning sky where the moon is still faintly visible — round and silver. Firlefanz looks curious and a little amazed. Cozy small bedroom with warm lamp light. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} sitting at a kitchen table eating an oat roll with honey and drinking a mug of cocoa. Through the window, the pale moon is still faintly visible in the morning sky. Firlefanz gazes toward the window thoughtfully. Warm, cozy kitchen. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} talking excitedly to ${P}, who sits on a porch drinking coffee and looks up at the sky with a calm knowing smile. Morning light, cozy porch with flowers and wooden chairs. ${P} is starting to stand up, ready to join. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} wearing green hat, boots, warm jacket, holding walking stick. ${P} wearing a scarf and coat. Both standing at the front door, bundled up and ready for a great journey. Firlefanz has a small bag. Cozy cottage door, morning light. ${E}`, isOutfitPage: true },
  { filename: 'page-5.png', prompt: `${S} ${F} and ${P} on a grand journey through magical landscapes — seven glittering seas, silver-sand deserts, tall snow-capped mountains, wide rivers, deep forests, and open plains. ${OUTFIT} The moon hangs ahead of them in the sky, glowing brighter as they walk. Epic, wide panoramic view. ${E}`, useOutfitRef: true },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} standing at the edge of the world — the ground ends and before them is only deep blue sky that curves gently downward. ${OUTFIT} They step upward onto invisible steps made of soft shimmering air, climbing into the sky toward the moon. Magical, breathtaking, vertical composition. ${E}`, useOutfitRef: true },
  { filename: 'page-7.png', prompt: `${S} ${F} and ${P} landing softly on the surface of the moon. ${OUTFIT} The ground is soft silvery moon dust. Everywhere small glowing crystals catch the light and make soft tinkling sounds. The dark starry sky surrounds them. Earth glows blue in the distance. Awe-inspiring, beautiful, quiet. ${E}`, useOutfitRef: true },
  { filename: 'page-8.png', prompt: `${S} ${L} rising shyly from a moon crater. ${F} steps toward her with a big smile. ${P} watches warmly. ${OUTFIT} Luna glows softly silver, large gentle eyes looking at Firlefanz with wonder and happiness. First meeting, warm and touching. ${E}`, useOutfitRef: true },
  { filename: 'page-9.png', prompt: `${S} ${L} sitting on a moon rock, telling her story. ${F} listens closely and shakes his head with a kind reassuring smile. ${P} sits nearby with a warm expression. ${OUTFIT} The Earth is visible far below. Luna looks a little sad but hopeful. Quiet, emotional, tender moment. ${E}`, useOutfitRef: true },
  { filename: 'page-10.png', prompt: `${S} ${F}, ${P} and ${L} spending the day together on the moon. ${OUTFIT} Luna shows them a moon crater with a beautiful view of the glowing blue Earth below. Papalapapp holds a moon cookie looking delighted. Firlefanz talks animatedly, Luna listens and glows brighter. Joyful, warm, friendship. ${E}`, useOutfitRef: true },
  { filename: 'page-11.png', prompt: `${S} ${L} gently holding ${F}'s small paw with both her glowing hands. ${OUTFIT} A quiet, heartfelt farewell on the moon surface. Firlefanz smiles up at her. The starry sky and the glowing Earth form a beautiful backdrop. Tender, warm, touching. ${E}`, useOutfitRef: true },
  { filename: 'page-12.png', prompt: `${S} ${F} tucked into bed in a cozy bedroom, smiling and waving out the window at the moon which shines extra bright in the night sky. The moon glows warmly through the window. ${P} stands nearby watching with a gentle smile. Outside the window ${L}'s soft silhouette can be seen in the moon. Peaceful, sleepy, warm bedtime scene. ${E}`, useOutfitRef: true },
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
