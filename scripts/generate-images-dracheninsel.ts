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

const storyDir = path.join(rootDir, 'public/stories/die-dracheninsel')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Mysterious sea and cave palette: deep teal and midnight blue ocean, misty grey-green island fog, warm amber lantern glow underground, vivid bioluminescent purples and greens, soft golden sunrise. Gentle ink outlines, dreamy highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face and a scarf'
const BABY = 'the tiny baby dragon is no bigger than a kitten, with bright blue scales, large wondering eyes, a round snout, and tiny stubby wings — a single unique baby dragon character'
const OUTFIT = 'Firlefanz wears a dark green jacket, brown hiking boots, a wide-brimmed explorer hat, holds a wooden walking stick with a copper knob, and wears a bright orange life vest'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    isStyleRef: true,
    prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from multiple angles (front, side, back, waving). Beside him: ${P}, also from multiple angles. Bottom row: ${BABY} shown from front and side — tiny, kitten-sized, with bright blue scales and big eyes. White background. Consistent art style throughout. ${E}`,
  },
  {
    filename: 'cover.png',
    prompt: `${S} Book cover: ${F} in his dark green jacket and wide-brimmed hat stands on a rocky island shore under a misty sky. Before him rises the dark silhouette of a massive ancient dragon skeleton. Nestled at the base of the skeleton glows a single dark-blue egg with golden spots, casting a warm light. Seagulls circle above. Mysterious, magical, inviting atmosphere. ${E}`,
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} just waking up in his cosy bedroom, sitting up in bed with a dreamy, wondering expression, rubbing one eye. Around him in a soft dream-cloud, a mysterious rocky island surrounded by misty sea appears, with seagulls circling above it. Warm morning light through a small window. ${E}`,
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} at a small wooden kitchen table eating three slices of golden honey bread, a mug of warm milk beside the plate. He has a thoughtful, faraway look with chin resting on one hand, gazing dreamily out of a small window toward the sea. Simple, warm, quiet breakfast scene. ${E}`,
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} visiting ${P}, who sits on a wooden stool on the veranda of his cosy house with a steaming coffee cup. Firlefanz stands before him looking excited and curious. Papalapapp sets down his cup, stands up, and smiles warmly — gesturing toward a distant misty ocean horizon. A small cosy village garden with flowers. ${E}`,
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} dressed in his dark green jacket, brown hiking boots, wide-brimmed explorer hat, wooden walking stick, and a bright orange life vest. He looks ready for sea adventure, standing proudly. ${P} stands nearby with a long wooden oar over his shoulder. At the edge of the village, a small wooden dock with a little wooden boat bobs on calm water. ${E}`,
  },
  {
    filename: 'page-5.png',
    prompt: `${S} Epic panoramic sea journey: ${F} and ${P} in their small wooden boat. ${OUTFIT}. Papalapapp wears his scarf and rows. Across a wide panorama: enormous shining waves, dense fog banks, a glittering lagoon, and finally a dark rocky island with a single ancient gnarled tree appearing on the horizon. A sense of vast ocean distance and grand adventure. ${E}`,
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} and ${P} have pulled their small boat onto a rocky island shore. They have stopped in awe before a massive ancient dragon skeleton in a quiet valley — bones as large as a ship, half-overgrown with moss and island grass, under a pale sky. The skeleton is clearly the bones of one large ancient dragon. Both characters look up at it with wide eyes and hushed expressions. ${E}`,
  },
  {
    filename: 'page-7.png',
    prompt: `${S} Close-up scene: among the enormous mossy bones of the ancient dragon skeleton, ${F} gently lifts a single large egg — dark midnight blue with glowing golden spots, roughly the size of a pumpkin — and holds it carefully in both arms. The egg radiates a warm amber glow. Firlefanz looks at it with wonder and tenderness. ${P} watches reverently nearby. ${E}`,
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Underground cave scene: ${F} and ${P} drift across an immense underground ocean in a small stone boat. The water glows soft pale blue. Hundreds of tiny fish with their own bioluminescent lights float gently in the depths below. Stalactites hang from a vast dark ceiling above. Firlefanz cradles the dark-blue glowing egg carefully on his lap. The scene is magical, hushed, and vast. ${E}`,
  },
  {
    filename: 'page-9.png',
    prompt: `${S} Enormous underground cave filled with giant glowing mushrooms — the largest as tall as houses — in vivid purple, orange, and green. They pulse with soft warm bioluminescent light like lanterns, illuminating the cave in magical colour. ${F} and ${P} walk hand-in-hand through the mushroom forest, tiny against the giant fungal forms. Firlefanz carries the glowing blue egg. At the far end of the cave, a faint shimmer of daylight is visible. ${E}`,
  },
  {
    filename: 'page-10.png',
    prompt: `${S} Two-moment scene. Left: ${F} trips over a gnarled root just outside the cave exit and the dark-blue egg tumbles from his arms into soft green moss — a crack splits across the shell. Right: the egg bursts open and ${BABY} crawls out, looking up at Firlefanz with enormous wondering eyes and sneezing a tiny spark of flame. Firlefanz crouches down, laughing with delight. ${P} looks on warmly. Warm afternoon light, green meadow. ${E}`,
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${F}'s cosy bedroom at night. He lies tucked under a warm blanket with sleepy, happy eyes, ${BABY} curled up like a sleeping kitten on his tummy. Firlefanz has one hand resting gently on the little dragon. ${P} sits beside the bed in warm lamplight. A full moon shines through the small window. The room glows in deep navy blue and warm amber. Deeply restful, dreamy, safe scene. ${E}`,
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
