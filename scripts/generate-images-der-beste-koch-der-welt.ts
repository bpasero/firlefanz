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

const storyDir = path.join(rootDir, 'public/stories/der-beste-koch-der-welt')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A warm, cozy palette of honey gold, copper, soft green and tender blue, lit by warm kitchen light and gentle steam. Gentle ink outlines, soft glowing highlights, a great sense of warmth, comfort and calm."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const OUTFIT = 'a green pointed hat, sturdy little brown boots, a warm cozy jacket and a clean little cooking apron, carrying a small wooden walking stick and a wooden cooking spoon'
const GUSTO = "Master Chef Gusto is the most famous cook in the world — a round, jolly, fatherly creature with rosy cheeks, warm twinkling eyes, a big curly white mustache, wearing a tall white chef's toque hat and a white double-breasted chef's jacket with a warm cream apron. He is gentle, welcoming and kind, never scary. There is exactly one Master Chef Gusto in the scene."
const KITCHEN = 'a cozy, magical mountaintop kitchen-restaurant called the Golden Pan, full of warm golden light, with gleaming copper pots and pans hanging everywhere, a big warm hearth, wooden shelves and gentle rising steam'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully. Next to him ${P} Shown from front and side. Bottom row: ${GUSTO} shown full length from the front and from the side, holding a wooden spoon and a copper pot. Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, cinematic children's book cover. ${KITCHEN} glows warmly at the top of a gentle mountain under a soft late-afternoon sky. In the warm foreground, ${F} dressed in ${OUTFIT}, stands happily beside ${GUSTO}, both holding wooden spoons over a big steaming copper pot full of golden soup. ${P} smiles warmly beside them. Colorful dishes and rising fragrant steam, deeply cozy, warm and inviting, full of wonder. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom, early morning with soft golden sunlight through the window. ${F} has just woken and sits up in his small wooden bed, one hand on his tummy, eyes sparkling with a delighted dreamy smile. Faint dreamy wisps of steaming pots, colorful plates and delicious food float softly above his head like a daydream. Warm, tender, cozy mood. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table, taking a bite of a crunchy red apple, with a little jar of golden honey and a spoon in front of him. He gazes off dreamily with a big imaginative smile, thinking about cooking. Warm cozy kitchen interior in soft honey-wood and green tones, gentle morning light. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${P} sits on a wooden bench in front of his cozy little cottage, holding a steaming cup of morning coffee and smiling warmly and knowingly. ${F} stands before him, hopping with eager excitement, eyes wide and sparkling. A calm, sunny morning, the quiet village behind them, flowers around the bench. Warm and loving mood. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage by the front door. ${F} is now dressed in ${OUTFIT}, ready for a great journey, looking excited. ${P} kneels beside him, gently tying a clean little cooking apron around Firlefanz and tucking a wooden cooking spoon into his pocket, smiling warmly. Warm golden interior light, cheerful and snug. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic, sweeping wide landscape vista. ${F} dressed in ${OUTFIT}, and ${P} walk together as tiny figures across a vast, magical, varied world — glittering seas, golden deserts, tall mountains, wide rivers, deep forests and blooming meadows — beneath a soft late-afternoon sky. Faint, cozy wisps of delicious fragrant steam drift in the breeze, as if carried from far-off cooking. Grand sense of journey, wonder and gentle anticipation. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} dressed in ${OUTFIT}, and ${P} stand on the last hilltop, looking up in awe at the Golden Pan — ${KITCHEN} — a cozy round house high on the mountain with steaming chimneys releasing little fragrant clouds, warm light shimmering in the windows. A soft golden late-afternoon sky above. Firlefanz holds his tummy with happy anticipation. Magical, inviting, warm. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} At the warm open doorway of the Golden Pan. ${GUSTO} stands in the doorway with his arms spread wide in a big warm welcome, beaming. ${F} dressed in ${OUTFIT}, and ${P} look up at him with delight. Warm golden kitchen light spilling out from inside, copper pots glowing behind him. Joyful, welcoming, cozy. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Inside ${KITCHEN}. ${F} dressed in ${OUTFIT}, stands on a little wooden stool and stirs a big copper pot of golden, glowing sun soup with his wooden spoon, tasting a tiny drop with a delighted face. ${GUSTO} stands beside him, gently dropping small glowing pieces of colorful vegetable into the pot. ${P} watches warmly. Rising fragrant steam, warm golden light. Cozy and joyful. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} Inside ${KITCHEN}. On a floury wooden table, ${P} kneads soft dough while ${F} dressed in ${OUTFIT}, cuts it into long, cheerful ribbons of pasta in every rainbow color. ${GUSTO} swirls a copper pan so colorful noodles dance in the air, sprinkling tiny green herb stars. Everyone is laughing. Warm, lively, cozy kitchen scene, gentle steam. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} Inside ${KITCHEN}, softer and calmer light now. ${GUSTO} carefully spoons a soft, wobbly deep-blue moonberry pudding into little bowls on the table. ${F} dressed in ${OUTFIT}, leans in and sprinkles sparkling silver star sugar over the pudding with a look of careful wonder. ${P} smiles gently beside them. Magical, tender, glowing softly. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} A warm, beautifully set wooden table inside ${KITCHEN}. ${F} dressed in ${OUTFIT}, ${P}, and ${GUSTO} sit together happily eating the three-course lunch — bowls of golden soup, plates of colorful rainbow noodles, and little bowls of blue moonberry pudding. Firlefanz sighs with pure happiness, eyes closed in delight. Warm candlelit golden glow, deeply cozy and content. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F}'s cozy little bedroom at night, warm and snug. ${F} is tucked into his small wooden bed, fast asleep with a peaceful, contented smile, one hand resting on his full happy tummy. On the bedside table sits a tiny jar of golden soup, glowing faintly. Soft moonlight and a few gentle stars through the window. Deeply calm, warm, tender, sleep-inducing bedtime mood. ${E}`
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
