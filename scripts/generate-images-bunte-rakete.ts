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

const storyDir = path.join(rootDir, 'public/stories/die-bunte-rakete')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Warm palette of golden amber, soft greens, and muted earth tones. Gentle ink outlines, pastel washes, luminous highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout. There is exactly one Firlefanz in the scene.'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face. There is exactly one Papalapapp in the scene.'
const ROCKET = 'The rocket is large, rounded, and friendly-looking, shimmering in all rainbow colors — red, orange, yellow, green, blue, and violet — like a giant crayon come to life'
const OUTFIT_SPACE = 'Firlefanz wears a silver spacesuit with a round helmet and bright red space boots. Papalapapp wears a golden spacesuit with a cozy rounded helmet that has extra room for his ears.'
const PUENKTCHEN = 'Pünktchen is a small friendly Martian child with rust-red skin, THREE round eyes arranged in a triangle on its face, and FOUR small curious arms. Cheerful and wide-eyed.'
const WOLKI = 'Wolki is a friendly cloud fish — a small fish-shaped creature made entirely of soft white and blue cloud wisps, with a cheerful grin and sparkly eyes, floating weightlessly'
const FUNKI = 'Funki is a tiny crystalline ring creature, transparent and glittering like ice, with small limbs, dancing and spinning joyfully'
const WELLUS = 'Wellus is an ancient, wise Neptunian — tall and willowy with deep-blue skin, large calm eyes, and a long flowing beard made of silver seaweed. He radiates quiet wisdom.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from front, side, and waving — small green dragon/dinosaur. Next to him, ${P}, same species but larger — shown from multiple angles. Middle row: the colorful rocket — ${ROCKET}. Bottom row: ${PUENKTCHEN} shown from front and side. Next to Pünktchen, ${WOLKI}. Next to Wolki, ${FUNKI}. Next to Funki, ${WELLUS}. White background, consistent art style. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A children's book cover: ${F} and ${P} stand in a garden next to their magnificent colorful rocket — ${ROCKET}. The rocket towers above them, ready for launch. Above in the sky, a few distant planets are faintly visible among stars. Morning light, warm and adventurous mood. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} has just woken up in his cozy bedroom. He presses his nose against the window, eyes wide with wonder. Outside in the small garden, a magnificent colorful rocket stands — ${ROCKET}. Warm morning light filters through the window. Curtains frame the scene. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at a small kitchen table eating bread with strawberry jam and a cup of rose-hip tea. He keeps glancing out the window, where the colorful rocket is just visible outside. Thoughtful, dreamy expression. Cozy warm kitchen with morning light. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} visits ${P} on his small wooden veranda. Papalapapp sits in a chair with a cup of morning coffee, smiling warmly. He sets down his cup and stands up enthusiastically, eager to join. Sunny morning, potted plants on the veranda. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} and ${P} stand side by side in their spacesuits at the open hatch of the colorful rocket. ${OUTFIT_SPACE} ${ROCKET}. Both look excited and ready. The rocket hatch glows warmly from inside. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} The colorful rainbow rocket shoots upward through deep space — ${ROCKET}. Behind it trails a rainbow of fire and stardust. The rocket passes glowing nebulae, tumbling comets, shimmering meteor showers, and swirling spiral galaxies. Stars everywhere. Epic sense of scale and wonder. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} View from inside the colorful rocket: ${F} and ${P} in spacesuits press against the round porthole window. ${OUTFIT_SPACE} Outside: Mercury, a small grey rocky planet, and Venus, shrouded in thick swirling orange clouds, glow intensely close to a brilliant sun. Both characters wave cheerfully at the hot planets. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} On the rusty-red surface of Mars under a pale pink sky. ${F} and ${P} in spacesuits stand with ${PUENKTCHEN}. ${OUTFIT_SPACE} Pünktchen reaches out two of its four arms in greeting. They are surrounded by red rocky formations and small dust swirls. A few colorful Martian rocks lie on the ground around them. Friendly and warm scene. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Enormous Jupiter fills the background — its swirling orange and cream cloud bands and massive red storm dominating the sky. The colorful rainbow rocket floats nearby. ${WOLKI} drifts close to the rocket, laughing with a big grin. ${F} in his silver spacesuit leans out to laugh with Wolki. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} Saturn with its majestic golden glittering rings stretches across the background. ${FUNKI} dances and spins along one of the rings, glittering like scattered ice crystals. ${F} and ${P} in spacesuits float near their colorful rocket, watching Funki with open-mouthed wonder and delight. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} Deep space near two distant planets: Uranus, a soft blue-green globe, and Neptune, a deep midnight-blue globe, both faintly visible. ${WELLUS} floats serenely in the foreground, his silver seaweed beard drifting gently. He gestures toward the brilliant stars around them. ${F} in his silver spacesuit floats nearby, gazing at the stars with wide, wondering eyes. The scene is calm and vast and beautiful. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} A warm farewell scene in space. The colorful rainbow rocket is visible in the center. ${F} and ${P} in spacesuits wave from the rocket window and hatch. Around them float all four friends: ${PUENKTCHEN} waving its four arms, ${WOLKI} blowing happy bubble-clouds, ${FUNKI} spinning a glittery farewell dance, and ${WELLUS} bowing gracefully with his seaweed beard flowing. Stars and planets in the background. Warm and emotional. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} The colorful rainbow rocket lands softly in a small garden at golden-hour sunset — ${ROCKET}. ${F} and ${P} have climbed out and stand together looking up at the darkening evening sky where the first stars are beginning to appear. ${F} leans gently against ${P}, looking sleepy and happy. Warm golden and violet tones. Peaceful and tender. ${E}`
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
