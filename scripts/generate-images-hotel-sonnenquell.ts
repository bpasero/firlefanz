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

const storyDir = path.join(rootDir, 'public/stories/ferien-im-hotel-sonnenquell')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A warm, calming palette of honey gold, butter yellow, soft turquoise, sage green and creamy white. Gentle ink outlines, soft warm highlights, a great sense of comfort, warmth and gentle wonder."
const E = 'Gentle, calm, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const M = 'Murmeli is a friendly, plump marmot with soft golden-brown fur, round cheeks, big kind eyes and a warm welcoming smile, wearing a small cream-coloured apron. He is NOT a dragon or dinosaur. There is exactly one Murmeli in the scene.'
const PI = 'Pina is a small, playful young otter with sleek brown fur, a round friendly face, big sparkling eyes and a cheerful grin. She is NOT a dragon or dinosaur. There is exactly one Pina in the scene.'
const HOTEL = 'the Hotel Sonnenquell: a cosy, grand wooden mountain lodge nestled on a lush green hillside, surrounded by foaming sparkling rivers and tall green mountains, with colourful flowers growing on its roof, a large slowly-turning wooden waterwheel beside it, and bright sun-mirror panels catching the light. It feels warm, welcoming, natural and eco-friendly.'
const OUTFIT = 'a soft hiking hat, a warm travel jacket, sturdy little boots, carrying a small wooden walking stick and a backpack with a colourful swim ring poking out'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully — wearing a soft hiking hat and a warm travel jacket. Next to him ${P} Shown from front and side. Middle row: ${M} shown from front and side, smiling warmly in his apron. Bottom row: ${PI} shown from front and side, splashing playfully; and a small still-life of a colourful swim ring, a wooden walking stick and a basket of garden berries. Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, warm, cinematic children's book cover showing ${HOTEL} In the sunny foreground ${F} dressed in ${OUTFIT} arrives with a joyful beaming smile beside ${P}, both gazing up in wonder at the lodge. ${M} waves a friendly welcome from the doorway and ${PI} the little otter peeks happily from a sparkling river nearby. Joyful, magical, inviting and full of warm golden light. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom on a bright, warm morning. ${F} has just woken and sits up in his small wooden bed, stretching with a happy sleepy smile as a warm golden sunbeam streams through the window onto his nose. Soft, snug, tender mood in honey and cream tones. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine), so there is never a second little dragon figure. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table happily eating a ripe juicy pear, gazing dreamily into the air as if imagining a wonderful mountain holiday. Tiny dream-like wisps above his head faintly hint at a cosy lodge, green mountains and a sparkling pool. Warm cozy kitchen interior in soft honey and turquoise tones, a calm happy feeling. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${P} sits in a comfy wooden chair in front of his little cottage, holding a steaming cup of morning coffee, smiling warmly. ${F} stands before him talking eagerly with wide sparkling eyes and a big excited smile, gesturing as if describing a faraway mountain hotel. A calm, sunny, peaceful morning in the small village, soft golden light. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage. ${F} is now dressed for a mountain journey in ${OUTFIT} — wearing his soft hiking hat and warm jacket, holding his wooden walking stick, with a colourful swim ring poking out of his backpack, standing proudly and ready to go. ${P} stands beside him smiling. Warm golden morning light fills the snug room. Cheerful, loving, anticipatory mood. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic, sweeping wide landscape vista. ${F} dressed in ${OUTFIT}, and ${P} walk together as tiny figures across a vast, magical, varied world — shimmering blue seas, golden sand deserts, tall green mountains, winding rivers, fragrant forests and lush green valleys — all beneath a warm, bright, gentle sky with soft fluffy clouds. Grand sense of journey, adventure and gentle wonder. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} dressed in ${OUTFIT}, and ${P} arrive and gaze in delight at ${HOTEL} ${M} stands in the open doorway with his apron, waving a warm welcome with a big friendly smile. Lush green hillside, sparkling rivers, the turning waterwheel and sun-mirror panels glinting. Inviting, magical, warm afternoon light. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} ${M} the marmot in his apron proudly shows ${F} and ${P} around the warm, cosy wooden interior of the Hotel Sonnenquell, gesturing toward a sunny window where the big waterwheel turns and a lush flower-and-vegetable garden grows outside, with bees buzzing among the blossoms. ${F} looks around in wonder. Warm honey-and-green tones, a feeling of cosy natural abundance. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} A wonderful outdoor playground beside the Hotel Sonnenquell on the green hillside: swings, a long slide, and a treehouse high up in a tall fir tree. ${F} (still wearing his soft hiking hat) and ${PI} the little otter whoosh down the long slide together, laughing with pure joy. Bright warm sunshine, mountains and sparkling rivers behind them. A joyful, playful scene of new friendship. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} A beautiful warm outdoor swimming pool beside the lodge, fed by sparkling river water and warmed by the sun. ${F} (his hat resting at the poolside) floats and splashes joyfully in his colourful swim ring, ${PI} the otter does a playful tumble underwater, and ${P} swims gently and contentedly nearby. Glittering droplets in the warm sunshine, green mountains all around. Refreshing, happy, playful mood. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} An afternoon of sports and play at the Hotel Sonnenquell. In the foreground ${F} and ${PI} the otter paddle a small wooden boat together across a calm sparkling river, both beaming. In the gentle background, hints of a soft climbing wall and a ball game on a green meadow. ${P} watches warmly from the riverbank. Warm golden afternoon light, green mountains, joyful and active. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} A long wooden table set in the lodge's garden at golden sunset. ${M} the marmot in his apron serves steaming soup, fresh bread, sweet berries and a warm apple cake — all from the garden. ${F}, ${P} and ${PI} the otter sit together at the table, smiling happily. Small warm lanterns glow, and over the mountains the sky turns soft pink and gold. Cosy, abundant, heartwarming evening mood. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} A cosy, warm wooden hotel bedroom at night, snug and peaceful. ${F} is tucked sweetly into a soft bed beside an open window, eyes gently closed, fast asleep with a peaceful happy smile. Through the open window a sparkling river glistens softly in the moonlight beneath green mountains, and stars begin to twinkle over the Hotel Sonnenquell. Deeply calm, warm, tender, sleep-inducing bedtime mood. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is the single sleeping Firlefanz himself — there must be exactly ONE Firlefanz in the whole picture (no second Firlefanz in any dream or thought bubble), and any toys in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine). ${E}`
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

// Resume support: only (re)generate images that are still missing. Already-generated
// pages are kept and still feed the scene-to-scene continuity chain. The temporary
// style reference sheet is regenerated only if at least one page is still missing.
// To force a single page to regenerate, delete its PNG before re-running.
const anyPageMissing = images.some(s => !s.isStyleRef && !fs.existsSync(path.join(storyDir, s.filename)))

for (const spec of images) {
  const outPath = path.join(storyDir, spec.filename)

  // Skip existing page/cover images (resume), but keep the continuity chain intact
  if (!spec.isStyleRef && fs.existsSync(outPath)) {
    console.log(`Skipping ${spec.filename} (already exists)`)
    previousPagePath = outPath
    continue
  }

  // Nothing to anchor if every page is already present
  if (spec.isStyleRef && !anyPageMissing) {
    continue
  }

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
