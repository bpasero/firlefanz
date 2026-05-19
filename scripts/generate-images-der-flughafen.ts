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

const storyDir = path.join(rootDir, 'public/stories/der-flughafen')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly'
const T = 'Tilda is a friendly owl wearing a neat blue airport-staff uniform'
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
    prompt: `${S} A book cover: ${F} stands in front of a grand magical airport terminal called the Great Cloud Harbor of Fluminor, with glowing arched windows and a huge orange airplane visible on the tarmac behind it. ${T} stands beside Firlefanz in her blue uniform, both looking up at the sky with wonder and excitement. Warm sunset light. Magical, adventurous, inviting. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} sitting up in bed, stretching with a big smile, looking out the bedroom window where a tiny silver airplane can be seen flying high in the blue morning sky. Cozy small bedroom, golden morning sunlight streaming in, warm soft light. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sitting at a kitchen table eating a bread roll with jam and drinking a mug of warm cocoa. Firlefanz looks dreamily out the window at the blue sky where a tiny silver airplane flies past. Warm cozy kitchen, morning light. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} talking excitedly to ${P}, who sits in a garden chair on a sunny porch, holding a coffee cup. A colorful book about airplanes rests on Papalapapp's knees. Papalapapp smiles wisely and looks ready to stand up. Morning garden light, flower pots, friendly and warm. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} wearing a green hat, sturdy boots, and a warm jacket, holding a wooden walking stick. ${P} wearing a scarf and coat, carrying a small backpack. Both stand at the front door of a cozy cottage, bundled up and ready for a great journey. Cheerful expressions, morning light. ${E}`,
    isOutfitPage: true
  },
  {
    filename: 'page-5.png',
    prompt: `${S} ${F} and ${P} on a grand epic journey through magical landscapes — seven glittering seas with leaping dolphins, seven golden deserts sparkling in the sun, seven tall snow-capped mountains, seven wide rivers, and seven dense forests. ${OUTFIT} A friendly wind swirls around them. Wide panoramic view of their long wondrous journey across a fantastic world. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} and ${P} standing on a hilltop in the distance, looking out toward the Great Cloud Harbor of Fluminor — a magical giant airport glittering with colorful lights in the late afternoon. Huge airplanes glide silently through the amber sky. ${OUTFIT} Firlefanz stands with mouth open in amazement. Papalapapp places a hand on his shoulder warmly. Wide, awe-inspiring view. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-7.png',
    prompt: `${S} Inside the bright, busy Great Cloud Harbor of Fluminor airport terminal. Travelers of all kinds carry colorful suitcases beneath glowing archways. ${T} approaches ${F} and ${P} with a warm welcoming smile, her blue uniform neat and tidy. Firlefanz looks around in wide-eyed wonder. Soft warm light, magical and busy, friendly atmosphere. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-8.png',
    prompt: `${S} ${F} pressing his nose against a giant curved window overlooking an airport runway. A large silver airplane is mid-takeoff, rising into the bright blue sky. Firlefanz watches with enormous shining eyes and a huge smile. ${P} and ${T} stand beside him. The interior is soft and warm, outside the runway stretches wide. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-9.png',
    prompt: `${S} Inside the airport. In the foreground, a large circular baggage carousel with bright colorful suitcases going round. In the background, a tall glass control tower. In the waiting area, a friendly family of sea turtles sits together with luggage, and an old frog musician sits nearby with a round hatbox-shaped suitcase, both smiling. ${F}, ${P}, and ${T} walk through the scene, smiling. Warm, lively, whimsical. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-10.png',
    prompt: `${S} A cozy airport restaurant scene. ${F}, ${P}, and ${T} sit at a table with bowls of tomato soup and crusty bread. Through a large panoramic window, airplanes can be seen landing and taking off on the runway outside in the golden afternoon light. Tilda gestures as she speaks. Firlefanz and Papalapapp listen happily. Warm, friendly, peaceful. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-11.png',
    prompt: `${S} On the airport tarmac at sunset. A massive, gleaming bright-orange airplane fills most of the scene. ${F} reaches up with one small hand and gently touches the cool metal of the airplane's side, looking up at it in awe and quiet wonder. ${P} stands beside Firlefanz with a proud, gentle smile. Warm amber and golden sunset light glows around them. Magical, tender, dreamy moment. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F} tucked snugly into a cozy bed, eyes half-closed in sleepy contentment, a tiny model airplane resting on the pillow beside him. Soft moonlight streams through the bedroom window. ${P} stands quietly in the doorway, watching with a warm gentle smile. Above Firlefanz, dreamy wisps show a glowing silver airplane soaring up into the clouds and stars. Peaceful, sleepy, bedtime scene. ${E}`,
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
