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

const storyDir = path.join(rootDir, 'public/stories/der-funkelring')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Warm palette of golden amber, soft greens, and muted earth tones. Gentle ink outlines, pastel washes, luminous highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout. There is exactly one Firlefanz in the scene.'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face. There is exactly one Papalapapp in the scene.'
const RING = 'The Funkelring is a small, delicate golden ring that glitters and sparkles brightly, as if filled with tiny stars. It glows with a soft warm light.'
const OUTFIT_TRAVEL = 'Firlefanz wears a soft hooded travel cloak in earthy green-brown tones, sturdy little boots, and carries a small wooden walking stick and a tiny backpack. Papalapapp wears a wide-brimmed hat and a cozy travel coat, with a satchel slung over his shoulder.'
const GANDOLFI = 'Gandolfi is a wise old wizard with a long flowing grey beard, kind crinkled eyes, a tall pointy grey hat, and a soft grey-blue robe. He carries a wooden staff. There is exactly one Gandolfi in the scene.'
const LUMI = 'Lumi is a gentle, slender elf with long flowing silver hair, soft pointed ears, kind sparkling eyes, and a flowing pale green robe with delicate leaf patterns. There is exactly one Lumi in the scene.'
const BROMMEL = 'Brommel is a short, sturdy, friendly dwarf with a big shaggy red beard, a round cheerful face, a brown leather tunic, a wide belt, sturdy boots, and a small woollen cap. There is exactly one Brommel in the scene.'
const FUNKELBERG = 'The Funkelberg is a tall, magical mountain that glows from within like a giant gemstone, shimmering with soft golden and amber light against a starry twilight sky.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from front, side, and waving — small green dragon/dinosaur. Next to him, ${P}, same species but larger — shown from multiple angles. Middle row: ${GANDOLFI}, shown from front and side. Next to him, ${LUMI}, shown from front and side. Bottom row: ${BROMMEL}, shown from front and side. Next to him, the small golden Funkelring — ${RING}. White background, consistent art style. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A children's book cover: ${F}, ${P}, ${GANDOLFI}, ${LUMI}, and ${BROMMEL} stand together on a grassy hill at golden hour, looking toward a distant glowing mountain — ${FUNKELBERG}. ${F} stands in the front holding the small glittering golden Funkelring on his open palm. Warm adventurous mood. Soft light, watercolor textures. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} has just woken up in his cozy little bedroom. He sits up in bed, blinking into the warm morning sunlight. On his small wooden nightstand lies the Funkelring — ${RING}. He looks at it with wide-eyed wonder. Soft golden morning light filters through the curtains. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at a small kitchen table. In front of him is a warm slice of bread with honey and a steaming cup of rosehip tea. The little golden ring lies on the table next to his plate, sparkling faintly — ${RING}. ${F} gazes at it thoughtfully. Cozy warm kitchen with morning light streaming through a window. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} stands on the wooden veranda of ${P}'s little cottage, holding out his open hand to show the tiny golden Funkelring — ${RING}. ${P} sits in a wooden chair with a cup of morning coffee, leaning forward with a surprised but warm smile. Sunny morning, potted plants, peaceful village atmosphere. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} and ${P} stand at the front gate of their little village house, dressed for a long journey. ${OUTFIT_TRAVEL} Beside them stands ${GANDOLFI}, smiling gently and leaning on his wooden staff. Morning light, packed bags at their feet, a sense of warm adventure and friendship. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic wide landscape vista showing the small fellowship walking along a winding path through a magical varied landscape: rolling green hills, a shimmering river, distant misty mountains, and a forest in the distance. The five travelers walk together in a line: ${F} and ${P} in the lead with their travel gear (${OUTFIT_TRAVEL}), then ${GANDOLFI} with his staff, ${LUMI} with her flowing silver hair and pale green robe, and ${BROMMEL} the sturdy red-bearded dwarf. Sense of grand journey, warm afternoon light. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} A glowing magical elven forest at twilight. Tall slender trees with silver bark sparkle as if dusted with stardust. Soft golden lanterns hang from branches. The fellowship sits together on soft moss in a small clearing. ${LUMI} pours a delicate flower-petal tea into small wooden cups and offers warm honey bread with berries to ${F}, ${P}, ${GANDOLFI}, and ${BROMMEL}. Peaceful, dreamy, warm atmosphere. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} A snowy mountain pass with gently glittering blue-tinted snow. The fellowship trudges along the path bundled in warm woollen caps and scarves. ${BROMMEL} the red-bearded dwarf leads the way with a friendly grin, ${GANDOLFI} follows with his staff, then ${F} and ${P} in their travel gear (${OUTFIT_TRAVEL}), and ${LUMI} at the back with her silver hair flowing. Soft snow falls. The mountain is friendly, not frightening. Cool calm light. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} A vast, warm underground hall of the dwarves. Golden lanterns hang from the high stone ceiling. Long wooden tables are covered with bowls of soup, loaves of bread, and platters of cake. Crackling fires glow in stone hearths. Many friendly bearded dwarves sit at the tables singing and laughing. ${BROMMEL} stands proudly introducing ${F}, ${P}, ${GANDOLFI}, and ${LUMI} to his dwarf brothers. Cozy and joyful. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} The fellowship has reached the foot of the magnificent Funkelberg — ${FUNKELBERG}. They stand together looking up at the glowing mountain. ${F}, ${P} (in travel gear: ${OUTFIT_TRAVEL}), ${GANDOLFI}, ${LUMI}, and ${BROMMEL} are visible from behind, gazing in awe. The mountain glows from within with a soft amber light against a deep twilight sky filled with stars. Sense of wonder and arrival. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} On the summit of the Funkelberg, beside a small luminous pool that glows like liquid light. ${F} kneels at the edge of the pool, gently placing the tiny golden Funkelring into the glowing water — ${RING}. The whole mountaintop bursts into soft light: thousands of tiny glowing lights rise like fireflies into the starry sky. ${P}, ${GANDOLFI}, ${LUMI}, and ${BROMMEL} stand nearby watching with quiet smiles. Magical, tender, awe-inspiring. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} A warm farewell scene at the foot of the glowing Funkelberg. ${F} hugs ${LUMI} tenderly while ${BROMMEL} smiles next to them. ${P} stands beside ${GANDOLFI}, who waves with a kind smile and his wooden staff. The mountain glows softly behind them, lighting the path home. Warm emotional sunset tones. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F} and ${P} stand together in their small cottage garden at sunset. The sky is deep violet and gold, with the first bright stars beginning to twinkle. ${F} leans gently against ${P}, looking sleepy and content. The travel gear is set down beside them. Warm peaceful glow, like the Funkelberg itself, in the evening sky. Tender, cozy, sleep-inducing. ${E}`
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
