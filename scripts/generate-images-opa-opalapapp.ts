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

const storyDir = path.join(rootDir, 'public/stories/opa-opalapapp')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A warm, calming palette of meadow green, honey gold, butter yellow, soft sky blue, rosy pink and creamy white. Gentle ink outlines, soft warm highlights, a great sense of comfort, warmth and gentle wonder."
const E = 'Gentle, calm, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const O = "Opalapapp is Firlefanz's grandfather — the same dragon-dinosaur species, but clearly OLD and grandfatherly: his scales are a soft silvery sage-green, paler and more weathered than the others, his face is gently wrinkled with a kind warm smile and soft tired eyes. He wears small round spectacles on his snout, a long soft knitted scarf in warm dusty-rose and cream tones, and leans on a beautifully carved wooden walking stick. He carries an old leather travel bag. He is unmistakably the eldest. There is exactly one Opalapapp in the entire scene — never two, and he must always look distinctly older and greyer than Papalapapp so the two are never confused."
const OUTFIT = 'a small green pointed hat, sturdy little boots, a warm cozy jacket and a small wooden walking stick'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully — wearing a small green hat, a warm jacket and little boots. Next to him ${P} Shown from front and side. Bottom row: ${O} Shown from front and side, smiling warmly and leaning on his carved walking stick. Make the three generations clearly distinct in size and age: a small child Firlefanz, a sturdy fatherly Papalapapp, and a small, slightly stooped, silver-green, bespectacled, scarf-wearing grandfather Opalapapp. Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, warm, cinematic children's book cover. On a sunny path winding over gentle green hills in a small village, three generations meet in a joyful reunion. In the foreground ${F} wearing his small green hat runs with open arms toward ${O}, who has just arrived from a long journey and kneels with open arms and the happiest, warmest grandfatherly smile. ${P} stands beside them beaming. Soft rolling hills, little bridges and fields stretch into a warm golden horizon behind them. Tender, magical, full of love and warm golden light. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom on a bright, fresh morning. ${F} has just woken and sits up in his small wooden bed, stretching with a happy, excited smile, eyes sparkling as if today is a very special day, while warm golden sunlight streams through the open window. Soft, snug, tender mood in honey and cream tones. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine), so there is never a second little dragon figure. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table eating a warm honey bread roll with a cup of milk, gazing dreamily into the air, too excited to eat. Tiny dream-like wisps float gently above his head showing a faint, kindly old silver-green grandfather dragon with round spectacles and a long scarf, hinting at the grandpa he is imagining. Warm cozy kitchen interior in soft honey and green tones, a happy, anticipatory feeling. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${P} sits in a comfy wooden chair in front of his little cottage, holding a steaming cup of morning coffee, smiling warmly. ${F} stands before him talking eagerly with wide sparkling eyes and a big excited smile, hopping from foot to foot as if asking an excited question. A calm, sunny, peaceful morning in the small village, soft golden light. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage. ${F} is now dressed for a long walk in ${OUTFIT} — wearing his small green hat, warm jacket and little boots, holding his wooden walking stick, looking proud and ready. ${P} stands beside him packing a wicker basket with bread rolls and a teapot for the journey, smiling. Warm golden morning light fills the snug room. Cheerful, loving, anticipatory mood. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic but gentle, sweeping wide village landscape. ${F} dressed in ${OUTFIT}, and ${P} carrying a wicker basket walk together as small figures along a winding path that rolls over seven soft green hills, across seven little wooden bridges over sparkling brooks, past seven golden rustling fields, all beneath a warm, bright, gentle sky with soft fluffy clouds. Grand sense of a journey to meet someone, gentle wonder and warmth. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} On the winding country path over the green hills. ${F} dressed in ${OUTFIT} stands frozen with delight, pointing far ahead. In the distance, walking slowly toward them, is ${O} — clearly recognizable as the old silver-green grandfather dragon with round spectacles, a long soft scarf and a carved walking stick and travel bag. ${P} stands beside Firlefanz smiling. Warm light, a tender moment of recognition and joy. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} The warm, joyful reunion on the sunny path. ${O} kneels with both arms wide open, the happiest grandfatherly smile on his gently wrinkled face, and ${F} dressed in ${OUTFIT} leaps into his big warm hug. ${P} stands close beside them, one hand lovingly on his old father's shoulder, all three faces glowing with happiness. Soft golden light, deeply tender and heartwarming. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} The three sit resting together in soft green grass beside the path. ${O} has opened his old leather travel bag and holds out a beautiful small spiral seashell to ${F} dressed in ${OUTFIT}, who holds it to his ear with closed eyes and a look of pure wonder. ${P} watches warmly. Soft fluffy clouds drift above, a calm, magical, gentle mood in warm afternoon light. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} The three walk home together along the winding path in warm late-afternoon light. ${O} walks in the middle leaning on his carved stick, holding ${F}'s hand on one side (Firlefanz dressed in ${OUTFIT}, gazing up in wonder and listening) and ${P}'s hand on the other. Faint, dreamy storytelling wisps float softly in the sky — a singing fish, a candy-floss mountain, a smiling moon — hinting at Opa's tales. Tender, loving, golden-hour mood. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} Inside the cozy cottage in the warm evening. ${P} stirs a steaming pot of soup at the hearth, and ${O} sits in the softest comfy armchair with his scarf, looking content and a little tired from the journey. ${F} snuggles lovingly against Opa's warm scarf. Through the window the sky is darkening to dusk with the first stars twinkling. Snug, warm, deeply peaceful family mood in soft candlelight and honey tones. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${F}'s cozy little bedroom at night, warm and snug. ${F} is tucked sweetly into his bed under a soft blanket, eyes gently closing, almost asleep with a peaceful happy smile. ${O} the old silver-green grandfather dragon sits gently on the edge of the bed, telling a quiet bedtime story, his spectacles glinting softly in the warm lamplight. A small spiral seashell rests on the bedside table. The first stars glow through the window. Deeply calm, warm, tender, sleep-inducing bedtime mood. IMPORTANT: the only dragon-dinosaur creatures in the image are the single sleeping Firlefanz and the single grandfather Opalapapp — exactly one of each, and any toys must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine). ${E}`
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

const anyPageMissing = images.some(s => !s.isStyleRef && !fs.existsSync(path.join(storyDir, s.filename)))

for (const spec of images) {
  const outPath = path.join(storyDir, spec.filename)

  if (!spec.isStyleRef && fs.existsSync(outPath)) {
    console.log(`Skipping ${spec.filename} (already exists)`)
    previousPagePath = outPath
    continue
  }

  if (spec.isStyleRef && !anyPageMissing) {
    continue
  }

  try {
    const refs: string[] = []

    if (!spec.isStyleRef) {
      refs.push(styleRefPath)
    }

    if (previousPagePath) {
      refs.push(previousPagePath)
    }

    await generate(spec, refs)

    if (!spec.isStyleRef) {
      previousPagePath = path.join(storyDir, spec.filename)
    }
  } catch (e) { console.error(`  FAILED: ${(e as Error).message}`) }
  await new Promise((r) => setTimeout(r, 2000))
}

if (fs.existsSync(styleRefPath)) {
  fs.unlinkSync(styleRefPath)
  console.log(`\nCleaned up ${STYLE_REF}`)
}

console.log('\nDone!')
