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

const storyDir = path.join(rootDir, 'public/stories/der-zirkus-sternenschweif')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A warm magical palette of midnight blue, deep violet and gold, lit by glowing lanterns, bubbles and sparkling stars. Gentle ink outlines, soft glowing highlights, a great sense of wonder, warmth and calm."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const OUTFIT = 'a green pointed hat, sturdy little brown boots, and a warm cozy jacket, carrying a small wooden walking stick'
const MONDINO = 'Director Mondino is a round, cozy, fatherly circus director — a gentle plump creature with warm friendly eyes and rosy cheeks, wearing a deep velvet-blue tailcoat with golden buttons and a tall midnight-blue top hat. He is jolly and kind, never scary. There is exactly one Director Mondino in the scene.'
const PIPPA = 'Pippa is a small, cheerful juggler creature — a little fluffy fox-like performer in a sparkling rose-pink costume, juggling many glowing translucent soap bubbles that shine like little moons.'
const FILOU = 'Filou is a slender, graceful cat-like tightrope dancer in a shimmering silver costume, balancing lightly on a glowing silver beam of moonlight.'
const POMPOMS = 'the Pompom Bouncers are three small, round, fluffy ball-shaped creatures in soft pastel colors (one mint green, one peach, one lilac), bouncing joyfully high into the air.'
const STERNENSCHWEIF = 'the Sternenschweif (Star-Tail) is an enormous, gentle, magical winged creature soaring slowly beneath the tent dome — soft and benevolent, with large feathery glowing wings and a long, magnificent sparkling comet-like tail that trails glittering golden stars. It glows softly in blue, violet and gold. It is calm and wondrous, never scary. There is exactly one Sternenschweif in the scene.'
const TENT = 'an enormous magical circus tent striped in midnight blue and gold, glowing warmly from within, with colorful paper lanterns and a glittering flag on top'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully. Next to him ${P} Shown from front and side, wearing a scarf. Middle row: ${MONDINO} shown full length; and ${PIPPA} Bottom row: ${FILOU} and ${POMPOMS} and a small close-up of ${STERNENSCHWEIF} Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, cinematic children's book cover. ${TENT} stands glowing under a deep starry night sky. Tiny and full of wonder in the foreground, ${F} dressed in ${OUTFIT}, and ${P} stand together gazing up in awe. High above the tent in the night sky soars ${STERNENSCHWEIF}, its long sparkling tail arcing across the stars and scattering glittering golden stardust over the whole scene. Epic in scale, deeply magical, warm and serene. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom, early morning with soft golden sunlight through the window. ${F} has just woken and sits bolt upright in his small wooden bed, eyes wide and sparkling with excitement, a delighted dreamy smile, as if he has just dreamed something wonderful. Faint dreamy wisps of colorful circus lights and bubbles float softly above his head like a daydream. Warm, tender, cozy mood. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table, nibbling a warm jam sandwich and holding a little cup of berry juice, bobbing his feet happily as if hearing music. He gazes off dreamily with a big imaginative smile. Warm cozy kitchen interior in soft honey-wood and blue tones, gentle morning light. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${P} sits on a wooden bench in front of his cozy little cottage, holding a steaming cup of morning coffee and smiling warmly and knowingly. ${F} stands before him, hopping with eager excitement, eyes wide and sparkling. A calm, sunny morning, the quiet village behind them, flowers around the bench. Warm and loving mood. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage by the front door. ${F} is now dressed in ${OUTFIT}, ready for a great journey, looking excited. ${P} stands beside him wearing a warm scarf, tucking two red apples into a small bag, smiling gently. Warm golden interior light, cheerful and snug. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic, sweeping wide landscape vista. ${F} dressed in ${OUTFIT}, and ${P} with his scarf walk together as tiny figures across a vast, magical, varied world — glittering seas, golden deserts, tall mountains, wide rivers, deep forests and blooming meadows — beneath a soft late-afternoon sky turning to dusk. Faint, magical wisps of music and tiny glowing notes drift in the breeze around them. Grand sense of journey, wonder and gentle anticipation. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} dressed in ${OUTFIT}, and ${P} stand on the last hill at dusk, looking down in awe at ${TENT} below them. Colorful paper lanterns sway in the evening breeze and many small friendly animals stream happily toward the tent entrance. A deep blue starry evening sky above. Firlefanz raises his arms with joy. Magical, festive yet calm and warm. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} At the glowing entrance of the magical circus tent. ${MONDINO} stands welcoming, bowing deeply with a warm grand gesture and a big friendly smile, lifting his tall top hat. ${F} dressed in ${OUTFIT}, and ${P} look up at him with delight. Warm golden lantern light spilling from the tent doorway, deep blue evening behind. Joyful, welcoming, cozy. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Inside the warm, glowing circus tent, full of soft golden light. ${F} dressed in ${OUTFIT}, and ${P} sit in cozy red velvet seats at the very front, watching with wide delighted eyes. In the ring, ${PIPPA} juggles many glowing translucent bubbles that float through the air like little moons. Magical, warm, joyful atmosphere, soft spotlights. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} Inside the glowing circus tent. High above the ring, ${FILOU} dances gracefully along a glowing silver beam of moonlight. Below in the ring, ${POMPOMS} bounce joyfully high into the air. In the front cozy seats, ${F} dressed in ${OUTFIT}, claps and laughs with pure delight, ${P} smiling warmly beside him. Lively but warm and gentle, soft golden and silver light. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} A spectacular, awe-inspiring moment inside the now-darkened tent, lit softly and golden. In the center of the ring ${MONDINO} stands with one hand raised. Above him, gliding quietly beneath the tent dome, soars ${STERNENSCHWEIF}, scattering glittering golden stars all through the air. ${F} dressed in ${OUTFIT}, and ${P} gaze up from their seats utterly awestruck. Breathtaking, magical, hushed and wondrous. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} A deeply calm, dreamy scene inside the tent. ${STERNENSCHWEIF} circles slowly high under the dome, its glittering stars drifting gently down through the air like warm glowing snow. The light is soft and golden. ${F} dressed in ${OUTFIT}, leans sleepily against ${P}, yawning with half-closed eyes and a peaceful happy smile. Tender, sleepy, magical, sleep-inducing mood. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F}'s cozy little bedroom at night, warm and snug — but in this scene Firlefanz is being carried home: show ${P} walking gently through a starry night, carrying the sleeping ${F} dressed in ${OUTFIT}, on his back. Firlefanz is fast asleep with a peaceful happy smile. The sky above is full of brilliant sparkling stars, as if scattered there by the Star-Tail. Deeply calm, warm, tender, sleep-inducing bedtime mood. ${E}`
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
