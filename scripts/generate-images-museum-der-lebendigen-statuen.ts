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

const storyDir = path.join(rootDir, 'public/stories/das-museum-der-lebendigen-statuen')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Warm amber and golden lantern palette with deep indigo evening sky, cool stone greys, glowing bronze, and soft violet shadows. Gentle ink outlines, dreamy highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face and a scarf'
const RUNO = 'Runo is a small, round friendly stone statue with a wide smile carved into polished grey stone, tiny stubby arms and round inset eyes — clearly a single statue character'
const KNIGHT = 'the Dancing Knight is a tall elegant stone statue of a knight in ornate armour, posed mid-bow with one arm extended gracefully'
const FAIRY = 'the Marble Fairy is a slender white marble statue of a fairy with outstretched wings and arms raised as if humming a melody'
const OUTFIT = 'Firlefanz wears a dark green jacket, brown hiking boots, a wide-brimmed explorer hat, and holds a wooden walking stick with a copper knob'
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
    prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from multiple angles (front, side, back, waving). Beside him: ${P}, also from multiple angles. Bottom row: ${RUNO} shown from front and side. Far right: ${KNIGHT} and ${FAIRY} each shown from front. White background. Consistent art style throughout. ${E}`,
  },
  {
    filename: 'cover.png',
    prompt: `${S} Book cover: ${F} in his dark green jacket and wide-brimmed hat stands in a grand museum hall glowing with golden lantern light. Around him, friendly stone and bronze statues have come to life — ${RUNO} waves nearby, ${KNIGHT} bows gracefully, and ${FAIRY} floats with raised arms. Tall stone columns and arched windows with a deep indigo evening sky outside. Magical, warm, inviting atmosphere. ${E}`,
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} just waking up in his cosy bedroom, sitting up in bed with a dreamy, wondering expression, rubbing one eye. Around him in a soft dream-cloud illustration style, gentle outlines of smiling stone statues float — small round ones and tall graceful ones, all friendly. Warm morning light through a small window. ${E}`,
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} at a small wooden kitchen table eating toast with strawberry jam, a cup of warm tea beside the plate. He has a thoughtful, faraway expression, chin resting on one hand. Soft morning light through a cosy kitchen window. Simple, warm, quiet breakfast scene. ${E}`,
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} visiting ${P}, who sits on a wooden garden bench with a steaming coffee cup, enjoying the morning air. Firlefanz stands before him looking excited and curious. Papalapapp smiles warmly and gestures toward distant misty mountains on the horizon. A small cosy village garden with flowers in the background. ${E}`,
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} standing in front of a tall mirror, dressed for adventure: dark green jacket, brown hiking boots, wide-brimmed explorer hat, wooden walking stick with a copper knob. He gives a proud, satisfied look at his reflection. Warm bright hallway with wooden floor. ${E}`,
  },
  {
    filename: 'page-5.png',
    prompt: `${S} Epic panoramic journey: ${F} and ${P} walking across a vast sweeping landscape. ${OUTFIT}. Papalapapp wears his scarf. Visible in the same scene: crossing a turquoise foaming sea on stepping stones, climbing a snow-capped mountain with the sun setting, trudging through a dense dark forest. The sky shifts from golden to deep violet as evening approaches. Sense of grand adventure and vast distance. ${E}`,
  },
  {
    filename: 'page-6.png',
    prompt: `${S} A massive ancient building of grey stone looms ahead at dusk — enormous and grand, with tall towers, arched windows glowing faintly with warm amber light, and a set of huge heavy wooden doors flanked by stone columns. ${F} and ${P} stand small before it, looking up in awe. ${OUTFIT} Deep indigo sky, early stars appearing, last embers of sunset on the horizon. ${E}`,
  },
  {
    filename: 'page-7.png',
    prompt: `${S} Interior of a vast stone museum hall lit by golden lanterns. Rows of statues stand completely still on pedestals: a small round stone figure, a tall armoured knight, a slender fairy, a long-tailed bronze creature — all motionless in the amber glow. ${F} and ${P} walk between them, looking curiously at each one. Cool stone floors, high vaulted ceiling, dramatic but warm light. ${E}`,
  },
  {
    filename: 'page-8.png',
    prompt: `${S} The moment the statues wake up: through a tall arched museum window the last sliver of red-orange sun disappears below the horizon. Inside the hall, ${RUNO} winks at ${F} — one stone eye closed in a friendly wink. Around them other statues begin to stir: ${KNIGHT} slowly raises an arm, ${FAIRY} tilts her head. The golden lantern light warms everything. Firlefanz stares with wide delighted eyes. ${E}`,
  },
  {
    filename: 'page-9.png',
    prompt: `${S} Joyful museum scene: ${F} dances with ${KNIGHT}, who bows low with one arm extended while Firlefanz mirrors the bow and giggles. ${P} stands to the side summoning happily. ${FAIRY} stands nearby with arms raised as if humming. ${RUNO} watches everything with its permanent wide smile. Golden lantern light, festive and warm. ${E}`,
  },
  {
    filename: 'page-10.png',
    prompt: `${S} Farewell scene inside the museum entrance: ${RUNO} wraps its small stubby stone arms around ${F} in a hug. Firlefanz looks surprised but happy, eyes closed with a warm smile. ${P} watches with a gentle expression. The huge wooden doors stand open behind them, revealing a moonlit night sky with stars. Other statues wave goodbye from their pedestals. ${E}`,
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${F}'s cosy bedroom at night. He is tucked under a warm blanket with sleepy drooping eyes and a soft smile. ${P} sits beside the bed with a folded blanket, moonlight streaming through a small window onto the floor. The room glows in deep blue and warm gold tones. Outside the window a full moon and stars. Peaceful, dreamy, deeply restful scene. ${E}`,
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
