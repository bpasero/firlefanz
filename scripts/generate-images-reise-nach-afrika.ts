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

const storyDir = path.join(rootDir, 'public/stories/die-reise-nach-afrika')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Warm palette of golden amber, ochre yellows, burnt oranges, and dusty earth tones of the African savanna. Gentle ink outlines, pastel washes, luminous highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout — there is exactly one Firlefanz in this image'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face — there is exactly one Papalapapp in this image'
const TEMBO = 'Tembo is a big, gentle African elephant with large kind eyes, broad wrinkled grey skin, and long curved tusks — there is exactly one Tembo in this image'
const TEMBI = 'Tembi is a small baby elephant, Tembo\'s daughter, with soft grey skin, tiny ears, and an endearingly short stumpy trunk — there is exactly one Tembi in this image'
const SIMBA = 'Simba is a young lion with a small growing mane, golden fur, big curious amber eyes, and a fluffy tail tip — there is exactly one Simba in this image'
const OUTFIT = 'Firlefanz wears a green hat, brown boots, and a warm jacket, holding a wooden walking stick. Papalapapp wears a straw hat and a light travel scarf.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from multiple angles (front, side, waving). Next to him, ${P}, also shown from multiple angles. Middle row: ${TEMBO} standing peacefully, shown from front and side. Next to him, ${TEMBI} standing beside her father. Bottom row: ${SIMBA} lying in the sun and standing alert. African savanna background hints. Consistent art style throughout. White background. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A book cover: ${F} and ${P} standing in the golden African savanna at sunset. ${OUTFIT} In the background, ${TEMBO} and ${TEMBI} stand together, their silhouettes against an enormous orange and pink sunset sky. ${SIMBA} is curled up in the foreground grass. Acacia trees frame the scene. Magical, warm, inviting. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} in bed, just woken up, eyes wide open with excitement. A thought bubble shows silhouettes of elephants and a lion in a golden savanna. Morning sunlight streams through a small cottage window. Cozy bedroom, warm golden light, curious and excited expression. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} at a small kitchen table eating a bowl of honey porridge and drinking warm milk. He has a dreamy, thoughtful expression, gazing out the window. Through the window, a tiny airplane is visible in a bright blue sky. Warm cozy kitchen, morning atmosphere. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} visiting ${P} who is sitting comfortably at his front door, drinking morning coffee. ${P} has a friendly warm expression and is listening to ${F}. A cozy little village cottage, morning sunshine, flowers in the garden. Papalapapp is beginning to smile, ready to join the adventure. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} and ${P} dressed and ready for travel. ${OUTFIT} Both standing at the door with backpacks, excited expressions. A packed bag of sandwiches visible. Warm morning light, cheerful and adventurous mood. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} ${F} and ${P} inside an airplane, looking out of a round porthole window with wonder. ${OUTFIT} Through the window: red and yellow African landscape far below with scattered acacia trees. Soft clouds at altitude. Warm, dreamy in-flight atmosphere. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} and ${P} stepping off a small airplane onto the golden African savanna. ${OUTFIT} A warm wind blows the tall yellow grass. In the near distance, ${TEMBO} stands facing them with a curious, gentle expression, swinging his trunk slowly. Distant kopje hills on the horizon. Warm afternoon light. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} ${TEMBO} gently extends his trunk toward ${F}, who stands very still, looking up with wide eyes. Papalapapp watches nearby with a warm smile. ${OUTFIT} Little ${TEMBI} peeks out from behind Tembo's leg, also nudging toward Firlefanz with her tiny trunk. Sunny savanna, golden grass, acacia trees in the background. Soft and tender moment. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} ${F} and ${TEMBI} playing chase in tall golden grass. Tembi's little trunk is pressed into Firlefanz's belly and he is tumbling backward laughing. ${TEMBO} watches calmly and contentedly. ${P} laughs so hard his straw hat has fallen off his head. Joyful, playful, sunny savanna scene. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} ${SIMBA} lying relaxed next to ${F} in the warm savanna grass, purring contentedly. Simba's golden fur glows in the afternoon sun. Firlefanz looks pleasantly surprised but happy, leaning gently against the young lion. ${P} watches nearby with a warm smile. ${OUTFIT} Peaceful, golden, dreamy savanna atmosphere. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} ${F}, ${P}, ${TEMBO}, ${TEMBI}, and ${SIMBA} all sitting together in the golden savanna grass under a spectacular orange and purple sunset sky. Firlefanz is gesturing as he tells a story, everyone gathered close listening. Acacia silhouettes against the glowing sky. Warm, cozy, magical evening scene. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${F} hugging little ${TEMBI} warmly under a starry African night sky. ${P} stands nearby watching. In the background, ${TEMBO} watches fondly and ${SIMBA} yawns sleepily. A small airplane waits nearby. First stars are appearing in the dark blue sky above the savanna horizon. Warm farewell scene, gentle and peaceful. ${E}`
  },
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
