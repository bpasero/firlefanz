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

const storyDir = path.join(rootDir, 'public/stories/das-kloster-in-den-wolken')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly'
const T = 'Tenzin is a small round friendly monk wearing a flowing saffron-orange robe, with a peaceful warm smile'
const OUTFIT = 'Firlefanz wears a green hat with a long feather, sturdy brown boots, and a warm jacket, holding a wooden walking stick. Papalapapp wears a scarf and a coat.'
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
    prompt: `${S} A book cover: ${F} and ${P} stand before a magnificent golden mountain monastery glowing against a deep blue twilight sky. Colorful prayer flags in red, yellow, blue, green, and white stretch from the monastery towers across the mountain peaks. ${T} stands at the monastery gate welcoming them with both arms open. Snow-capped peaks surround the scene. Magical, warm, peaceful. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} sitting up in bed, rubbing sleepy eyes, looking out a round bedroom window at a distant golden glow far above the snowy mountain peaks on the horizon. The morning sky is soft pink and lilac. Cozy small bedroom with a patchwork quilt. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sitting at a kitchen table eating a bowl of oatmeal topped with red berries, looking dreamily out the window toward distant snowy mountains that glow faintly golden. Warm cozy kitchen, morning light, steam rising from a mug. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} talking excitedly to ${P}, who sits at a kitchen table holding a coffee cup. Papalapapp looks up with a warm knowing smile, ready to stand. The kitchen window shows snowy mountain peaks in the distance. Morning light, cozy home atmosphere. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} wearing a green hat with a long feather, sturdy brown boots, and a warm jacket, holding a wooden walking stick. ${P} wearing a scarf and coat, carrying a small backpack. Both stand at the front door of a cozy cottage, bundled up and ready for a great mountain journey. Cheerful expressions, morning light, cobblestones outside. ${E}`,
    isOutfitPage: true
  },
  {
    filename: 'page-5.png',
    prompt: `${S} ${F} and ${P} on a grand epic journey through magical landscapes — seven glittering seas, seven golden deserts, seven wide rivers, seven dense forests, and seven mighty snow-capped mountain ranges each taller than the last. ${OUTFIT} The mountains grow bigger and more majestic with each step. Wide panoramic view of their wondrous journey across a fantastic world. A peaceful silence hangs over the high peaks. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} and ${P} standing on a rocky ledge high in the mountains, looking upward in wonder. Above them, where wisps of cloud drift past the peaks, a golden monastery glows in the warm evening light. Dozens of colorful prayer flags flutter on strings between the towers. A deep gentle sound drifts down from above. ${OUTFIT} Awe and excitement on their faces. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-7.png',
    prompt: `${S} At the carved wooden gate of a high mountain monastery. ${T} bows with both hands pressed together in a gentle greeting, smiling broadly. ${F} and ${P} stand before the gate, looking up in wonder. The monastery walls are warm stone, draped with red and gold banners. Snow-capped peaks rise behind. Welcoming, peaceful, magical. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Inside a mountain monastery courtyard. Colorful prayer flags in red, yellow, blue, green, and white hang everywhere, fluttering gently. Large bronze bells hang from curved rooftops. ${T} gestures expansively as he explains something to ${F} and ${P}. Warm golden lantern light. Stone archways, prayer wheels along the walls. Peaceful and magical. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-9.png',
    prompt: `${S} Inside a grand stone monastery hall lit by dozens of small candles and golden lanterns. A group of small friendly monks in orange robes sit in rows, singing together with eyes closed, their mouths open in peaceful harmony. ${F} sits among them with eyes closed, a gentle smile on his face. ${P} sits beside him. ${T} leads the singing. Deep warm light, stone walls, incense smoke curling upward. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-10.png',
    prompt: `${S} ${T} pouring steaming butter tea from a tall ornate jug into small round clay cups. ${F} holds a cup in both hands, taking a cautious first sip with a surprised but happy expression. ${P} smiles warmly. They sit on cushions near a low wooden table. Through an arched window, an endless sea of stars stretches across a deep dark sky above the mountain peaks. Cozy, magical, starlit. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${T} standing at the monastery gate in the morning light, gently pressing a small red prayer flag into ${F}'s hands with both of his own. ${P} already holds his red flag. All three smile warmly. The monastery towers rise behind Tenzin. Snow-covered peaks glow pink in the early morning sun. Tender farewell scene, peaceful and warm. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${P} carrying a sleeping ${F} on his back on a mountain path at night. Firlefanz is fast asleep with a gentle smile, holding a tiny red prayer flag. A sky full of brilliant stars stretches above the mountain silhouettes. The path winds gently down toward a warm glow in the valley far below. Peaceful, dreamy, tender bedtime scene. ${E}`,
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
