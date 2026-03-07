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

const storyDir = path.join(rootDir, 'public/stories/der-wolkenfluester')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly'
const W = 'Wölkchen is a small fluffy cloud-like creature with long floppy ears, soft white fur, and gentle eyes'
const OUTFIT = 'Firlefanz wears a green hat, brown boots, and a warm jacket, holding a wooden walking stick. Papalapapp wears a scarf and gloves and carries a bag of cookies.'
const OUTFIT_PAGE = 'page-4.png'

interface ImageSpec {
  filename: string
  prompt: string
  isOutfitPage?: boolean
  useOutfitRef?: boolean
}

const images: ImageSpec[] = [
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} standing on top of a cloud mountain, holding a glowing paintbrush, painting the sky in beautiful sunset colors of pink, gold and blue. A small fluffy white cloud creature with long ears watches nearby. Magical, dreamy, colorful sky. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} in bed looking out a window at a completely grey, sad sky. No color in the clouds at all. Morning light is dim and muted. Worried, curious expression. Cozy small bedroom. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} at a kitchen table eating strawberry jam bread and drinking warm milk. Outside the window the sky is grey. Small birds sit quietly on a branch, looking up at the grey sky. Quiet, still morning. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} visiting ${P} who stands at a window looking at the grey sky with a concerned expression. Cozy living room with warm lamp light. Papalapapp reaching for his coat. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} wearing green hat, boots, warm jacket, holding walking stick. ${P} with scarf and gloves, holding a bag of cookies. Both bundled up warmly at the door, ready for a high mountain journey. ${E}`, isOutfitPage: true },
  { filename: 'page-5.png', prompt: `${S} ${F} and ${P} on an epic journey through a landscape that looks faded and muted — deserts, mountains, meadows all slightly grey and colorless. ${OUTFIT} Everything looks pale and quiet. Wide landscape view, melancholy but peaceful. ${E}`, useOutfitRef: true },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} at the base of enormous Cloud Mountains, peaks disappearing into grey clouds above. ${OUTFIT} A shimmering staircase made of soft glowing steps leads upward into the clouds. Magical, awe-inspiring, vertical composition. ${E}`, useOutfitRef: true },
  { filename: 'page-7.png', prompt: `${S} A small workshop above the clouds. Pots and buckets filled with glowing paint: sunset gold, morning pink, sky blue. Paintbrushes scattered on the floor. ${W} sitting sadly in the middle. ${F} and ${P} entering. ${OUTFIT} Dreamy cloud workshop setting. ${E}`, useOutfitRef: true },
  { filename: 'page-8.png', prompt: `${S} ${F} kneeling down talking gently to ${W} who looks sad with tears in his eyes. Cloud workshop setting with paint pots around them. ${P} standing nearby looking sympathetic. ${OUTFIT} Tender, emotional moment. ${E}`, useOutfitRef: true },
  { filename: 'page-9.png', prompt: `${S} ${F} and ${P} searching for paintbrushes in a magical cloud landscape. ${OUTFIT} Rainbow bridges, star flowers, cotton-cloud nests. Firlefanz finds brushes in a fluffy cloud nest used by a small cloud bird. Adventure, discovery. ${E}`, useOutfitRef: true },
  { filename: 'page-10.png', prompt: `${S} ${W} joyfully painting a cloud with a glowing brush dipped in sunset pink. ${F} painting a small cloud golden yellow with his own brush. ${OUTFIT} The cloud glows like a lantern. Magical, colorful, joyful moment. Paint pots nearby. ${E}`, useOutfitRef: true },
  { filename: 'page-11.png', prompt: `${S} ${F}, ${P} and ${W} painting the entire sky together. ${OUTFIT} The sky transitions from grey to beautiful pink, gold and soft blue. ${W} mixes colors, ${P} holds paint pots, ${F} paints small clouds below. Panoramic view, the world coming alive with color. ${E}`, useOutfitRef: true },
  { filename: 'page-12.png', prompt: `${S} ${F} asleep leaning against ${P} while walking home. ${OUTFIT} The sky above is a magnificent sunset in pink, gold and soft blue — freshly painted clouds. ${F} holds a tiny paintbrush in his hand. ${W} waves from a cloud above. Peaceful, sleepy, beautiful evening sky. ${E}`, useOutfitRef: true },
]

async function generate(spec: ImageSpec, referenceImagePath: string | null = null): Promise<void> {
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
