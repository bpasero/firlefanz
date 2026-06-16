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

const storyDir = path.join(rootDir, 'public/stories/der-zauberwald')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A warm, cozy palette of deep forest green, mossy green, honey gold, warm amber and soft brown, with gentle golden firefly light. Gentle ink outlines, soft warm highlights, a great sense of comfort, warmth and gentle wonder. Inviting and homely."
const E = 'Gentle, calm, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const OUTFIT = 'a small green pointed hat, a warm cozy jacket, sturdy little brown hiking boots, and carries a small wooden walking stick'
const H = "Holderbart is an enormous, ancient, kindly oak tree with a wise gentle face formed naturally in his gnarled bark — two warm, soft, half-closed eyes and a calm smile — and a long flowing beard made of soft green moss. He is a friendly tree, never scary. There is exactly one Holderbart in the scene."
const TREES = 'Other tall ancient trees in the magical forest also have gentle, friendly faces softly formed in their bark — a slender white birch with a cheerful smile, a plump round beech with a cozy sleepy face — all kind and welcoming, never frightening.'
const LEAF = 'a single softly glowing golden leaf that shimmers with warm light. No text on it.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully, dressed in ${OUTFIT}. Next to him ${P} Shown from front and side. Center, large: ${H} Shown as a full majestic oak tree with his kindly mossy-bearded face, plus a close-up of his gentle smiling bark face. Bottom row: ${TREES} shown small, and ${LEAF} shown close up. Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, warm, cinematic children's book cover. Deep inside a magical ancient forest at golden dusk. ${F} dressed in ${OUTFIT}, stands small and full of wonder, looking up in delight at ${H} — the giant kindly oak with a gentle mossy-bearded face glowing softly. ${TREES} smile in the warm background. Hundreds of tiny golden fireflies drift through the air, lighting the forest like little lanterns. Magical, cozy, awe-inspiring and full of gentle warmth. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom on a bright, warm morning. ${F} has just woken and sits up in his small wooden bed, stretching with a happy sleepy smile as the morning sun touches his nose. Soft golden morning light streams through the window. Warm, snug, tender mood in honey and green tones. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys or decorations must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine), so there is never a second little dragon figure. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table, eating a slice of bread with honey and a few sweet berries, drinking warm milk, gazing dreamily into the air as if imagining a great forest. Tiny dream-like wisps of tall trees float faintly above his head. Warm cozy kitchen interior in soft honey and sage-green tones, a gentle calm happy feeling. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${P} sits in a comfy wooden chair in front of his little cottage, holding a steaming cup of morning coffee, smiling warmly. ${F} stands before him talking eagerly with wide, sparkling eyes, gesturing as if asking the way. A calm, sunny, peaceful morning in the small village, soft golden light. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage. ${F} is now dressed for travel in ${OUTFIT} — wearing his green pointed hat, warm jacket and hiking boots, holding his wooden walking stick, standing proudly and ready for the journey. ${P} stands beside him handing him a small wrapped packet of cookies, smiling. Warm golden morning light fills the snug room. Cheerful, loving, anticipatory mood. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic, sweeping wide landscape vista. ${F} dressed in ${OUTFIT}, walks alone as a tiny figure across a vast, magical, varied world — shimmering blue seas, golden sand dunes, tall green mountains, winding rivers and blooming meadows — all beneath a warm, bright, gentle sky with soft fluffy clouds. Grand sense of journey, adventure and gentle wonder. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} dressed in ${OUTFIT}, stands small at the very edge of an enormous ancient forest, looking up at huge old trees whose branches weave together high above into a green roof. The forest is quiet, hushed and a little mysterious, but soft and inviting, not scary — gentle dappled light filters down. Firlefanz peeks in curiously and a little shyly. Calm, magical, hushed mood. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} Deep in the forest, ${H} slowly opens his two warm, gentle eyes in his gnarled bark and gives a kind smile through his long green mossy beard. ${F} dressed in ${OUTFIT}, stands before him, looking up with wide, amazed, delighted eyes. Soft warm light, a tender first meeting. Cozy, magical, friendly mood. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} The whole magical forest comes alive. ${TREES} All around, ancient trees open gentle smiling faces in their bark and look down kindly. ${F} dressed in ${OUTFIT}, stands in the middle, beaming with delight, surrounded by ${H}. Hundreds of tiny golden fireflies dance between the trunks, bathing everything in warm golden light. Joyful, magical, welcoming. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} ${F} dressed in ${OUTFIT}, sits down on soft green moss at the foot of ${H}, listening with rapt attention as the kindly old oak with his mossy beard tells a story. Gentle fireflies float around. Birds nestle sleepily in the branches. Warm, intimate, storytelling mood, deep cozy forest in golden-green light. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} The trees of the magical forest gently sway their branches and sing a soft lullaby. ${TREES} ${H} sways gently. ${F} dressed in ${OUTFIT}, sits curled on the soft moss, his eyes growing heavy and sleepy, almost drifting off, with a peaceful happy smile. Warm golden firefly light, dreamy swirling leaves, deeply calm and soothing mood. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${H} gently lets ${LEAF} float down from his branches toward ${F} dressed in ${OUTFIT}, who reaches up with both paws to catch it, his face full of gratitude and wonder. The smiling trees watch warmly. Soft golden glow, fireflies drifting, a tender farewell gift moment. Cozy and heartwarming. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F}'s cozy little bedroom at night, warm and snug. ${F} is tucked sweetly into his bed under a soft blanket, eyes gently closed, fast asleep with a peaceful happy smile. On his pillow beside him rests ${LEAF}, glowing faintly. Faint dreamy wisps above him hint at the kindly trees of the magical forest. Soft warm candlelight, a starry sky through the window. Deeply calm, warm, tender, sleep-inducing bedtime mood. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys or decorations must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine), so there is never a second little dragon figure. ${E}`
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
