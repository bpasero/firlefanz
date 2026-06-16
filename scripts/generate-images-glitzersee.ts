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

const storyDir = path.join(rootDir, 'public/stories/der-glitzersee')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A warm, calming summer palette of honey gold, butter yellow, soft turquoise, sage green and creamy white. Gentle ink outlines, soft warm highlights, a great sense of comfort, warmth and gentle wonder."
const E = 'Gentle, calm, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const Q = 'Quabbel is a small, plump, jolly water creature with smooth blue-green skin, a round soft belly, big friendly round eyes and a wide gentle smile — a little like a cheerful frog crossed with a soft seal pup. He is NOT a dragon or dinosaur. There is exactly one Quabbel in the scene.'
const SCH = 'Schildi is a small, gentle, friendly turtle with a warm sandy-golden swirly-patterned dome shell, soft stubby legs, a kind smiling face and big calm eyes. There is exactly one Schildi in the scene.'
const OUTFIT = 'a wide woven straw sun hat, a bright yellow swim ring around his belly, carrying a small wooden walking stick, and a little beach bag with a bucket and spade'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully — wearing a wide straw sun hat and a yellow swim ring. Next to him ${P} Shown from front and side. Middle row: ${Q} shown from front and side, splashing happily. Bottom row: ${SCH} shown from front and side, holding a little spade; and a small still-life of a yellow bucket, a spade, a seashell and a sandcastle. Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, warm, cinematic children's book cover. A magical shimmering lake — the Glitzersee — sparkles in golden sunlight, surrounded by soft golden sand. In the foreground ${F} wearing a wide straw sun hat and a yellow swim ring stands joyfully at the water's edge beside his friends ${Q} splashing in the shallow water and ${SCH} sitting in the sand beside a little sandcastle. ${P} watches warmly nearby. Dragonflies dance over the water. Joyful, magical, inviting and full of warm summer light. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom on a bright, warm summer morning. ${F} has just woken and sits up in his small wooden bed, stretching with a happy sleepy smile as a warm golden sunbeam streams through the window onto his nose. Soft, snug, tender mood in honey and cream tones. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine), so there is never a second little dragon figure. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table eating a ripe red strawberry and a small slice of bread with honey, with a cup of cool water beside him, gazing dreamily into the air as if imagining a sparkling lake. Tiny dream-like wisps of blue water and a sandcastle float faintly above his head. Warm cozy kitchen interior in soft honey and turquoise tones, a calm happy feeling. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${P} sits in a comfy wooden chair in front of his little cottage, holding a steaming cup of morning coffee, smiling warmly. ${F} stands before him talking eagerly with wide sparkling eyes and a big excited smile, gesturing as if describing the lake. A calm, sunny, peaceful summer morning in the small village, soft golden light. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage. ${F} is now dressed for a summer journey to the lake in ${OUTFIT} — wearing his wide straw sun hat and yellow swim ring, holding his wooden walking stick and a little beach bag with a bucket, spade and folded towel, standing proudly and ready to go. ${P} stands beside him smiling. Warm golden morning light fills the snug room. Cheerful, loving, anticipatory mood. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic, sweeping wide landscape vista. ${F} dressed in ${OUTFIT}, and ${P} walk together as tiny figures across a vast, magical, varied world — shimmering blue seas, golden sand deserts, tall green mountains, winding rivers and fragrant forests — all beneath a warm, bright, gentle summer sky with soft fluffy clouds. Grand sense of journey, adventure and gentle wonder. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} dressed in ${OUTFIT}, and ${P} stand on a gentle grassy rise, gazing in delight at the Glitzersee spread out below them — a beautiful shimmering lake sparkling like a thousand tiny stars in the sunlight, ringed with soft golden sand fine as sugar. Dragonflies dance over the gentle waves. Lush, inviting, magical and warm summer light. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} At the sandy shore of the sparkling Glitzersee. ${Q} splashes cheerfully in the shallow turquoise water, waving a friendly flipper. ${SCH} sits in the golden sand nearby, waving a little spade in greeting. ${F} dressed in ${OUTFIT} arrives with a delighted, beaming smile, ${P} behind him. Warm, joyful reunion of friends, sparkling water, golden sand. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} ${F} (his straw sun hat now resting in the golden sand on the shore, still wearing his yellow swim ring) wades and swims joyfully in the cool sparkling turquoise water of the Glitzersee together with ${Q} who makes a big happy splash, and ${SCH} paddling gently nearby. They laugh and play, glittering droplets in the air. Bright warm sunshine overhead. A joyful, playful, refreshing scene of friendship. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} On the warm golden sandy shore of the Glitzersee. ${F} (wearing his yellow swim ring) tips over a yellow bucket of wet sand to make the first tower of a sandcastle. ${Q} digs a deep moat with his hands, and ${SCH} carefully shapes delicate battlements with her little paws. Buckets, spades and a growing sandcastle. Cheerful, busy, happy teamwork in warm sunlight. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} A beautiful finished sandcastle on the golden shore of the Glitzersee — tall towers, little windows, and a small bridge over the moat, decorated with a seashell and a few colorful pebbles at the gate. ${F} (wearing his yellow swim ring), ${Q} and ${SCH} lie contentedly in the warm sand beside their sandcastle, looking up at soft fluffy clouds. ${P} rests nearby. Peaceful, satisfied, golden afternoon mood. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} Golden sunset over the Glitzersee — the lake glows pink and orange, the sun sinking low. ${F} dressed in ${OUTFIT} hugs his friends ${Q} and ${SCH} goodbye on the sandy shore, everyone smiling warmly. ${P} stands ready to head home. Tender, heartfelt farewell between friends in warm rosy sunset light. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F}'s cozy little bedroom at night, warm and snug. ${F} is tucked sweetly into his bed under a soft blanket, eyes gently closed, fast asleep with a peaceful happy smile, hugging a soft teddy bear. On the windowsill rests a small seashell from the lake, glowing softly in the moonlight. Faint, soft dreamy wisps of mist curl above him hinting only at cool blue water, a little golden sandcastle and a seashell — NO creatures or characters at all inside the dream wisps. A starry night sky through the window. Deeply calm, warm, tender, sleep-inducing bedtime mood. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is the single sleeping Firlefanz himself — there must be exactly ONE Firlefanz in the whole picture (no second Firlefanz in any dream or thought bubble), and any toys in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine). ${E}`
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
