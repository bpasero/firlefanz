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

const storyDir = path.join(rootDir, 'public/stories/die-traumfabrik')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Warm dreamy palette of pastel violet, dusty pink, soft mint, pale gold, and silvery blue. Gentle ink outlines, pastel washes, luminous glowing highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout. There is exactly one Firlefanz in the scene.'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face. There is exactly one Papalapapp in the scene.'
const OUTFIT_TRAVEL = 'Firlefanz wears a soft hooded travel cloak in dusty lilac and silvery blue tones, sturdy little boots, a small pointed hat, and carries a small wooden walking stick. Papalapapp wears a wide-brimmed hat in soft dusty rose and a cozy travel coat, with a small wicker basket slung over his shoulder.'
const SCHNURR = 'Schnurr is a cuddly old wise owl about the size of a small dog. Soft fluffy grey and dove-white feathers, large gentle round amber eyes, a tiny curved beak, a slightly slanted woollen nightcap in pastel violet with a soft pompom on top. He has a kind, sleepy, grandfatherly face. There is exactly one Schnurr in the scene.'
const TRAUMWEBER = 'The Traumweber are tiny fluffy dream-weaver creatures the size of a kitten — softly rounded bodies covered in pastel fluff (some lilac, some pale blue, some mint, some peach), with tiny round faces, big shining eyes, and minute paws. They are gentle, friendly, and busy.'
const DREAM = 'A finished dream looks like a small, weightless wisp of softly swirling pastel light — silvery-blue mixed with hints of warm gold, gently glowing like a tiny nebula, light and airy like a piece of cotton candy.'
const JAR = 'A small round glass jar with a soft pale cork stopper, completely smooth and unlabeled. No writing or text on the jar.'
const FABRIK = 'The Traumfabrik is a beautiful round magical house perched on a giant fluffy cloud high in the sky, with many small whimsical turrets, soft round windows that glow warmly from within, and several soft little chimneys gently puffing out tiny pastel cloud curls — pink, lilac, pale blue, mint green.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from front, side, and waving — small green dragon/dinosaur. Next to him, ${P}, same species but larger — shown from multiple angles. Middle row: ${SCHNURR}, shown from front and side. Next to him, three ${TRAUMWEBER}, shown in various poses. Bottom row: a small empty glass jar (${JAR}), a finished dream wisp (${DREAM}), and a tiny golden spinning wheel. White background, consistent art style. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A children's book cover: ${F} and ${P} stand on a giant fluffy pastel cloud high in a starlit twilight sky, looking up in wonder at ${FABRIK}. Tiny pastel cloud curls drift out of the chimneys. ${SCHNURR} peeks out of the round door, smiling warmly. Two tiny ${TRAUMWEBER} float nearby holding a glowing dream wisp (${DREAM}). Warm magical mood. Soft watercolor textures. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} has just woken up in his cozy little bedroom, sitting up in bed and blinking sleepily with a small dreamy smile on his face. Soft golden morning light filters in through the curtains. Above his head, faint translucent swirls of dreamy pastel light still linger in the air — silvery-blue and gold — as if a dream is just fading away. Wonder and tenderness on his face. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at a small kitchen table. In front of him is a warm slice of bread with butter and golden honey, and a small cup of warm milk. He gazes thoughtfully out a kitchen window at the soft morning sky, where a few delicate puffy clouds drift by. Cozy warm kitchen with a hint of golden sunlight. Soft, calm, dreamy atmosphere. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} stands on the wooden veranda of ${P}'s little cottage. ${P} sits in a comfy wooden armchair holding a steaming cup of morning coffee, an old open book on his lap. He gazes warmly and knowingly at ${F}, with a gentle dreamy smile, as if about to share a wonderful secret. Sunny morning, potted plants, peaceful village atmosphere. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} and ${P} stand at the front gate of their little village house, dressed for a long journey. ${OUTFIT_TRAVEL} ${P} holds a small wicker basket with apple slices and a thermos. Both wave goodbye to their cozy little cottage. Morning light, a small wooden walking stick in Firlefanz's paw, a sense of warm adventure. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic wide landscape vista showing ${F} and ${P} (in ${OUTFIT_TRAVEL}) walking together along a winding path through a magical varied landscape: rolling green hills, a shimmering river crossed by little wooden bridges, distant misty mountains, a forest in the distance, gentle dunes. Far above in the sky, the first whisper of a delicate cloud staircase made of pale moonlight gleams faintly, hinting upward. Sense of grand journey, warm afternoon light, dreamy clouds. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} and ${P} (in ${OUTFIT_TRAVEL}) gently climb up a narrow, glowing staircase made of soft moonlight and pale silvery wisps, that floats upward through a deep dusky twilight sky scattered with the first soft stars. They look small and reverent. The staircase curls gently up toward a distant fluffy cloud high above. Magical, weightless, dreamy atmosphere. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} ${F} and ${P} (in ${OUTFIT_TRAVEL}) have arrived on top of a giant, fluffy pastel cloud high in the sky. Before them stands ${FABRIK}. Soft pastel cloud curls drift out of the little chimneys. Around them, the deep twilight sky is sprinkled with gentle stars. Both look up in awe and wonder. Magical, hushed atmosphere. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} The round front door of the Traumfabrik has just opened slowly. ${SCHNURR} stands in the doorway, blinking warmly and smiling sleepily. Warm golden light from inside the factory spills out around him. ${F} and ${P} (in ${OUTFIT_TRAVEL}) look up at him with delight and gentle surprise. Soft pastel cloud puffs drift nearby in the twilight sky. Cozy, warm, magical. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} The cozy whimsical inside of the Traumfabrik. Soft warm light from hanging paper lanterns. Many tiny golden spinning wheels of different sizes are gently turning. Several ${TRAUMWEBER} sit at the wheels, spinning soft glowing dream wisps in every gentle pastel color — silvery-blue, peach, mint, lilac, pale gold — that drift lightly in the air like cotton candy. ${F} and ${P} (in ${OUTFIT_TRAVEL}) and ${SCHNURR} stand in the middle, watching with wide eyes. Magical, hushed, dreamy atmosphere. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} ${F} sits on a small wooden stool at a tiny golden spinning wheel. He has his eyes gently closed with a peaceful smile, his small paws softly resting on the wheel as it slowly turns. A soft, silvery-blue dream wisp (${DREAM}) is just beginning to be spun from the wheel, glowing gently. ${SCHNURR} stands close behind him, watching tenderly. ${P} (in ${OUTFIT_TRAVEL}) watches from nearby with a warm smile. Soft warm lantern light. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} A tiny lilac ${TRAUMWEBER} stands on a small wooden bench, gently holding out a small round glass jar (${JAR}) to ${F}. Inside the jar, a soft glowing silvery-blue dream wisp (${DREAM}) sparkles like a tiny nebula. ${F} reaches for the jar with both paws, eyes shining with wonder. ${SCHNURR} watches close by, smiling warmly, holding a soft cork. ${P} (in ${OUTFIT_TRAVEL}) stands nearby. Cozy, magical, tender atmosphere. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F}'s cozy little bedroom at night. ${F} is tucked snugly under his soft blanket, his eyes gently closed with a peaceful sleepy smile. Tucked carefully under his pillow, the small glass jar (${JAR}) softly glows from beneath, casting a gentle silvery-blue light that drifts around the room like a faint dream wisp. Through the window, a deep starry night sky is visible. Warm peaceful glow. Tender, cozy, sleep-inducing. ${E}`
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
