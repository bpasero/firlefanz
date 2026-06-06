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

const storyDir = path.join(rootDir, 'public/stories/das-urzeittal')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Lush prehistoric jungle palette: deep emerald greens, golden amber sunlight, soft turquoise mist, earthy warm browns, vivid tropical flowers in pink and violet. Gentle ink outlines, dreamy highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face and a scarf'
const TROMMO = 'Trommo is a very large gentle long-necked dinosaur (brachiosaurus-type) with soft olive-green skin, enormous kind brown eyes, a gentle smile, and a rounded snout — clearly a single dinosaur character'
const ZIPSI = 'Zipsi is a small quick playful dinosaur with bright multicolored scales (blue, green, yellow), a long wagging tail, and big sparkling eyes — clearly a single dinosaur character'
const OUTFIT = 'Firlefanz wears a dark green jacket, brown hiking boots, a wide-brimmed explorer hat, and holds a wooden walking stick with a copper knob'
const UNIQUE = 'CRITICAL: there is exactly ONE Firlefanz and exactly ONE Papalapapp in the whole image — show each of them only a single time. Do NOT duplicate, repeat, mirror, or paint multiple copies of Firlefanz or Papalapapp anywhere in the scene.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    isStyleRef: true,
    prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from multiple angles (front, side, back, waving). Beside him: ${P}, also from multiple angles. Bottom row: ${TROMMO} shown from front and side — note the very long neck and gentle expression. Far right: ${ZIPSI} shown from front and side — note the small size and colorful scales. White background. Consistent art style throughout. ${E}`,
  },
  {
    filename: 'cover.png',
    prompt: `${S} Book cover: ${F} in his dark green jacket and wide-brimmed hat stands in a lush prehistoric valley. Behind him, the enormous gentle ${TROMMO} lowers his long neck down to Firlefanz's level with a warm smile. The small colorful ${ZIPSI} leaps joyfully nearby. Giant ancient ferns, towering prehistoric trees, and a golden sky with soft mist fill the background. Magical, warm, inviting atmosphere. ${E}`,
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} just waking up in his cosy bedroom, sitting up in bed with a dreamy, wondering expression, rubbing one eye. Around him in a soft dream-cloud illustration style, gentle outlines of friendly dinosaurs float — a large gentle long-necked one and a small colorful one, all smiling and waving. Warm morning light through a small window. ${E}`,
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} at a small wooden kitchen table eating a bowl of warm oatmeal with honey, a cup of warm tea beside the bowl. He has a thoughtful, faraway look with chin resting on one hand. Soft morning light through a cosy window. Simple, warm, quiet breakfast scene. ${E}`,
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} visiting ${P}, who sits on a wooden stool in front of his cosy house with a steaming coffee cup. Firlefanz stands before him looking excited and curious. Papalapapp smiles warmly and gestures toward distant misty mountains on the horizon. A small cosy village garden with flowers. ${E}`,
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} standing in front of a tall mirror, dressed for adventure: dark green jacket, brown hiking boots, wide-brimmed explorer hat, wooden walking stick with a copper knob. He gives a proud, satisfied nod at his reflection. ${P} stands at the open front door with a backpack, smiling warmly. Bright cheerful hallway with wooden floor. ${E}`,
  },
  {
    filename: 'page-5.png',
    prompt: `${S} A single epic journey scene: exactly one ${F} and exactly one ${P} walk together, side by side, along one winding path through a vast and varied landscape. ${OUTFIT}. Papalapapp wears his scarf and carries a backpack. Behind them, far in the distance, a continuous sweeping panorama blends a turquoise sea, snow-capped mountains, a rushing river and an ancient green forest, the air growing warmer and greener ahead. The two travellers appear ONLY ONCE, together in the foreground. ${UNIQUE} Sense of grand adventure and vast distance. ${E}`,
  },
  {
    filename: 'page-6.png',
    prompt: `${S} A breathtaking view: beyond a massive natural stone arch, an enormous lush prehistoric valley opens up. Towering ancient trees with enormous trunks, cascading waterfalls, giant flowers in vivid pink and violet. ${F} and ${P} stand at the arch, small against its scale, staring in awe at the world opening before them. Warm golden light pours through the valley. ${E}`,
  },
  {
    filename: 'page-7.png',
    prompt: `${S} ${F} and ${P} stand in the lush valley. From the dense ancient foliage emerges a colossal head on a very long neck — ${TROMMO} — as large as a rooftop, with enormous kind brown eyes. Firlefanz grips Papalapapp's hand and looks up wide-eyed. Trommo winks one huge eye and smiles warmly. Dappled golden jungle light. ${E}`,
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Joyful meeting scene in the lush prehistoric valley: the enormous gentle ${TROMMO} bends his long neck down toward ${F} and ${P}. The small colorful ${ZIPSI} hops excitedly from foot to foot nearby, tail wagging like a happy puppy. Firlefanz raises his arms in delight. Tropical ferns and giant flowers surround the group. Warm golden afternoon light. ${E}`,
  },
  {
    filename: 'page-9.png',
    prompt: `${S} Exactly one ${F} and exactly one ${P} sit close together high on the broad back of ${TROMMO}, so high they are level with soft white clouds, looking out over a vast green prehistoric valley far below with wonder and quiet joy. The small colorful ${ZIPSI} clambers playfully up Trommo's long neck beside them. Warm late-afternoon golden light, gentle dreamy clouds drifting past. ${UNIQUE} ${E}`,
  },
  {
    filename: 'page-10.png',
    prompt: `${S} Farewell scene at the edge of the valley under a starry night sky. ${TROMMO} bends his long neck gently down, and ${F} rests his head softly against Trommo's cheek with eyes closed and a warm smile. ${ZIPSI} stands on tiptoe and places a small glowing pebble into Firlefanz's outstretched hand. ${P} watches with a gentle expression. Stars reflect in a still forest pool nearby. ${E}`,
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${F}'s cosy bedroom at night. He lies tucked under a warm blanket with sleepy drooping eyes and a peaceful smile, one hand loosely holding a small glowing stone. ${P} sits beside the bed in the soft lamplight. Through the small window, a full moon and stars. The room glows in deep blue and warm amber. Deeply restful, dreamy, safe scene. ${E}`,
  },
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
