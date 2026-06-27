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

const storyDir = path.join(rootDir, 'public/stories/die-bergwanderung')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A warm, calming palette of meadow green, honey gold, butter yellow, soft sky blue, rosy pink and creamy white. Gentle ink outlines, soft warm highlights, a great sense of comfort, warmth and gentle wonder."
const E = 'Gentle, calm, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const O = "Opalapapp is Firlefanz's grandfather — the same dragon-dinosaur species, but clearly OLD and grandfatherly: his scales are a soft silvery sage-green, paler and more weathered than the others, his face is gently wrinkled with a kind warm smile and soft tired eyes. He wears small round spectacles on his snout, a long soft knitted scarf in warm dusty-rose and cream tones, and leans on a beautifully carved wooden walking stick. He is unmistakably the eldest. There is exactly one Opalapapp in the entire scene — never two, and he must always look distinctly older and greyer than Papalapapp so the two are never confused."
const C = 'The cows are gentle, cozy alpine cows with soft brown-and-white patched coats, warm friendly brown eyes and a small bell on a collar around the neck. They are clearly ordinary cows, NOT dragons or dinosaurs.'
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
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully — wearing a small green hat, a warm jacket and little boots. Next to him ${P} Shown from front and side. Middle row: ${O} Shown from front and side, smiling warmly and leaning on his carved walking stick. Bottom row: a single gentle alpine cow with brown-and-white patches, warm brown eyes and a bell on its collar, shown from front and side. Make the three dragon generations clearly distinct in size and age: a small child Firlefanz, a sturdy fatherly Papalapapp, and a small, slightly stooped, silver-green, bespectacled, scarf-wearing grandfather Opalapapp. Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, warm, cinematic children's book cover. High on a sunny green alpine mountain meadow full of wildflowers, ${F} wearing his small green hat stands happily between ${P} and ${O}, all three gazing out over a sweeping view of golden mountain peaks. Beside them a gentle brown-and-white cow with a bell grazes peacefully, and in the distance a little colorful cable-car gondola floats up a steel cable toward the summit. Soft golden light, fluffy clouds drifting close, deeply warm, magical and full of wonder. ${C} ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom on a bright, fresh morning. ${F} has just woken and sits up in his small wooden bed, stretching with a happy, excited smile, gazing out of the open window toward tall blue mountains rising on the distant horizon. Warm golden sunlight streams in. Soft, snug, tender mood in honey and cream tones. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine), so there is never a second little dragon figure. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table eating a warm honey bread roll with a cup of milk, gazing dreamily into the air. Tiny dream-like wisps float gently above his head showing faint blue mountain peaks with little clouds, hinting at the high mountains he is imagining. Warm cozy kitchen interior in soft honey and green tones, a happy, anticipatory feeling. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} In front of a little village cottage on a sunny morning. ${P} sits in a comfy wooden chair holding a steaming cup of coffee, and beside him ${O} sits holding a steaming cup of tea, both relaxed and smiling. ${F} stands before them talking eagerly with wide sparkling eyes and a big excited smile, hopping with joy as if asking an excited question. Calm, sunny, peaceful morning light. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage. ${F} is now dressed for a long mountain hike in ${OUTFIT} — wearing his small green hat, warm jacket and little boots, holding his wooden walking stick, looking proud and ready. ${P} stands beside him packing a wicker basket with bread rolls and a teapot. ${O} waits nearby with his scarf and carved stick, smiling warmly. Warm golden morning light fills the snug room. Cheerful, loving, anticipatory mood. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic but gentle, sweeping wide landscape. ${F} dressed in ${OUTFIT}, ${P} carrying a wicker basket, and ${O} leaning on his carved stick walk together as small figures along a winding path that rolls over seven soft green hills, across seven little wooden bridges over sparkling brooks, past seven rustling meadows, all beneath a warm bright sky with soft fluffy clouds. Tall blue mountains rise ahead in the distance. Grand sense of a journey, gentle wonder and warmth. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} Inside a small colorful cable-car gondola floating high up a steel cable on a sunny mountainside. ${F} dressed in ${OUTFIT} presses his nose to the window with delight and wonder, ${O} sits beside him gently holding his hand, and ${P} sits across smiling. Through the windows, treetops, green slopes and mountain peaks fall away far below. Soft floating, dreamy, slightly thrilling but very safe and calm mood, warm light. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} The three arrive at the top of the mountain. Before them opens a wide green alpine meadow full of colorful wildflowers, ringed by golden sunlit peaks under a clear sky. ${F} dressed in ${OUTFIT} stands with arms spread wide in awe, ${P} and ${O} beside him smiling. In the meadow a few gentle brown-and-white cows graze peacefully with bells on their collars. Fresh, clear, breathtaking, full of light and wonder. ${C} ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} On the sunny alpine meadow. A single gentle brown-and-white cow with warm brown eyes and a bell on its collar leans down curiously toward ${F} dressed in ${OUTFIT}, who reaches up with a soft happy laugh to stroke her nose. ${P} and ${O} watch warmly nearby. Wildflowers, soft grass, mountain peaks behind. Tender, joyful, gentle mood in warm light. ${C} ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} A cozy little wooden mountain restaurant hut with a sunny outdoor terrace, high on the alpine meadow with mountain peaks behind. ${F} dressed in ${OUTFIT}, ${P} and ${O} sit together at a small wooden table on the terrace. On the table are warm toasted cheese slices and a mug of hot chocolate topped with a swirl of cream in front of Firlefanz. All three look cozy and content. A gentle cow grazes nearby on the meadow. Warm, snug, happy midday mood. ${C} ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} ${F} dressed in ${OUTFIT}, ${P} and ${O} lie together in soft green alpine grass, gazing up at fluffy white clouds drifting close above them. Gentle brown-and-white cows graze peacefully around them with bells on their collars. Wildflowers, soft mountain breeze, golden afternoon light. Deeply calm, peaceful, dreamy and content mood. ${C} ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} Late afternoon, golden hour. The small colorful cable-car gondola gently descends a steel cable down the mountainside toward the valley far below, bathed in warm golden-orange light. Inside, ${F} dressed in ${OUTFIT} yawns sleepily and holds ${O}'s warm hand, with ${P} beside them. The alpine meadow and cows grow small below. Soft, sleepy, tender golden-hour mood. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F}'s cozy little bedroom at night, warm and snug. ${F} is tucked sweetly into his bed under a soft blanket, eyes gently closed, almost asleep with a peaceful happy smile. ${O} the old silver-green grandfather dragon sits gently on the edge of the bed, his spectacles glinting softly in the warm lamplight. Through the window the first stars twinkle over distant mountain peaks, and a faint dreamy wisp above shows a tiny cable car and a little cow with a bell. Deeply calm, warm, tender, sleep-inducing bedtime mood. IMPORTANT: the only dragon-dinosaur creatures in the image are the single sleeping Firlefanz and the single grandfather Opalapapp — exactly one of each, and any toys must NOT be dragons or dinosaurs. ${E}`
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
