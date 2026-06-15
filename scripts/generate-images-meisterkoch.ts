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

const storyDir = path.join(rootDir, 'public/stories/der-meisterkoch')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A warm, cozy palette of honey gold, butter yellow, soft terracotta, sage green and creamy white. Gentle ink outlines, soft warm highlights, a great sense of comfort, warmth and gentle wonder. Inviting and homely."
const E = 'Gentle, calm, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const OUTFIT = 'a small green pointed hat, a warm cozy jacket, sturdy little hiking boots, and a clean cream cooking apron, carrying a small wooden walking stick and a wooden cooking spoon'
const G = "Meisterkoch Gustav Goldlöffel is the world's most famous chef: a warm, round, jolly human cook with rosy cheeks, a big friendly smile, a bushy curly moustache, wearing a spotless white chef's jacket and a tall white chef's hat (toque). He is kind, gentle and welcoming, never stern. There is exactly one Gustav Goldlöffel in the scene."
const SPOON = 'a beautiful shiny golden wooden cooking spoon that gleams with a soft warm light. No text on it.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully — a small green dragon-dinosaur wearing a cream cooking apron. Next to him ${P} Shown from front and side. Center, large: ${G} Shown full-body standing with a ladle, and a close-up of his warm smiling face. Bottom row: ${SPOON} shown close up; and a cozy cooking still-life — a steaming golden pumpkin soup, a bowl of colorful rainbow noodles, and a fluffy strawberry-cream cake. Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, warm, cinematic children's book cover. Inside a magnificent, cozy golden kitchen-castle full of copper pots, bundles of herbs and warm sunlight streaming through tall windows. In the foreground ${F} dressed in ${OUTFIT}, stands happily on a little stool stirring a big steaming pot, beside ${G} who beams down at him, and ${P} watching warmly. On the big wooden table: a golden pumpkin soup, colorful rainbow noodles and a fluffy strawberry-cloud cake. Steam curls gently in the warm light. Joyful, magical, inviting and full of delicious warmth. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom on a bright, warm morning. ${F} has just woken and sits up in his small wooden bed, blinking happily and patting his tummy with a dreamy, hungry smile, as if imagining something delicious. Soft golden morning light streams through the window. Warm, snug, tender mood in honey and cream tones. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys or decorations in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine), so there is never a second little dragon figure. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table, eating just a small slice of bread with honey and a crunchy red apple, gazing dreamily into the air as if imagining a great feast. Tiny dream-like wisps of steaming pots and golden dishes float faintly above his head. Warm cozy kitchen interior in soft honey and sage-green tones, a gentle calm happy feeling. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${P} sits in a comfy wooden chair in front of his little cottage, holding a steaming cup of morning coffee, smiling warmly. ${F} stands before him talking eagerly with wide, sparkling eyes and a big excited smile, gesturing as if describing something wonderful. A calm, sunny, peaceful morning in the small village, soft golden light. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage. ${F} is now dressed for travel in ${OUTFIT} — wearing his green pointed hat, warm jacket, hiking boots and a clean cream cooking apron, holding his wooden walking stick and a wooden cooking spoon, standing proudly and ready for the journey. ${P} stands beside him with a small backpack, smiling. Warm golden morning light fills the snug room. Cheerful, loving, anticipatory mood. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic, sweeping wide landscape vista. ${F} dressed in ${OUTFIT}, and ${P}, walk together as tiny figures across a vast, magical, varied world — shimmering blue seas, golden sand dunes, tall green mountains, winding rivers and fragrant forests — all beneath a warm, bright, gentle sky with soft fluffy clouds. Grand sense of journey, adventure and gentle wonder. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} A beautiful island seen from a gentle hill — the Island of a Hundred Scents. ${F} dressed in ${OUTFIT}, and ${P} stand small in the foreground, gazing in delight at a cozy, warm kitchen-castle in the middle of the lush green island, with gentle curls of fragrant steam rising from its chimney into the sky. Soft swirls of delicious-smelling colored mist drift through the air. Lush, inviting, magical and warm. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} Inside the great, warm, golden kitchen of the kitchen-castle, full of copper pots, hanging herbs, wooden spoons and sunny windows. ${G} stands welcoming with open arms and a huge happy smile. ${F} dressed in ${OUTFIT}, and ${P} have just arrived and look up at the friendly chef with delight and wonder. Cozy, bright, joyful, full of warm light. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} In the warm kitchen, the first course. ${F} dressed in ${OUTFIT}, stands on a little wooden stool, stirring a big pot of golden, creamy pumpkin soup with his wooden spoon, his face glowing with delight as he tastes it. ${G} stands beside him, gently drizzling a swirl of cream into the soup and smiling warmly. A big bright orange pumpkin sits on the table. Steam curls softly. Cozy, golden, delicious mood. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} In the warm kitchen, the main course. On the big wooden table sits a lovely plate of colorful rainbow noodles with a gentle red tomato sauce, topped with little golden star-shaped potatoes and a few green peas. ${F} dressed in ${OUTFIT}, proudly places a golden potato star on top, while ${G} looks on happily and ${P} sets the table in the background. Bright, cheerful, mouth-watering and warm. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} In the warm kitchen, the dessert. ${G} and ${F} dressed in ${OUTFIT}, together build a soft, fluffy strawberry-cloud cake — heaping billows of whipped cream like little white clouds, topped with sweet red strawberries. Firlefanz giggles with delight, a tiny dab of cream on his snout. ${P} watches with a happy grin. Soft pink and cream tones, sweet, gentle and joyful. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} A heartwarming scene at a big cozy wooden table in the golden kitchen-castle. ${F} dressed in ${OUTFIT}, ${P}, and ${G} sit together happily eating their wonderful three-course meal — bowls of golden pumpkin soup, plates of rainbow noodles and the fluffy strawberry-cloud cake all on the table. ${G} leans over and gently hands ${F} ${SPOON} as a gift. Everyone is smiling, warm and full and content. Tender, loving, golden mood. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F}'s cozy little bedroom at night, warm and snug. ${F} is tucked sweetly into his bed under a soft blanket, eyes gently closed, fast asleep with a peaceful happy smile, holding ${SPOON} close in his paws. Faint dreamy wisps above him hint at golden soup, colorful noodles and a strawberry cake. Soft warm candlelight, a starry sky through the window. Deeply calm, warm, tender, sleep-inducing bedtime mood. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys or decorations in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine), so there is never a second little dragon figure. ${E}`
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
