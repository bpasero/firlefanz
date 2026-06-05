// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8')
const apiKey = envContent.match(/OPENROUTER_API_KEY=(.+)/)?.[1]?.trim()
if (!apiKey) { console.error('Missing OPENROUTER_API_KEY in .env'); process.exit(1) }

// Image generation via OpenRouter → Google Nano Banana 2 (Gemini 3.1 Flash Image Preview).
const MODEL = 'google/gemini-3.1-flash-image-preview'
const WIDTH = 1536
const HEIGHT = 1024 // 3:2 landscape — the project's canonical cover/page size

const storyDir = path.join(rootDir, 'public/stories/das-urzeittal')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Soft, hand-painted children's picture-book illustration in a gentle colored-pencil and watercolor style — hazy, dreamy and slightly grainy, with visible soft paper texture. Soft, blurred edges and NO outlines: forms are built from soft pencil shading and gentle watercolor washes that blend into one another, with no bold ink lines and no hard black outlines anywhere. Muted, tender, slightly desaturated pastel palette: soft sage and olive greens, warm pale buttery yellows, gentle amber light, dusty soft turquoise, warm earthy browns and pale pink blossoms — gentle and faded, never bright or saturated. Diffuse, soft light. The look of a classic vintage hand-illustrated bedtime storybook: soft, matte and painterly — definitely NOT a cartoon, not glossy, not digital vector art, not bold-lined, not saturated."
const E = 'Gentle, cozy, dreamy bedtime atmosphere. Soft matte hand-painted texture, muted and tender, never cartoonish, never glossy, never sharp-lined. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face and a scarf'
const TROMMO = 'Trommo is a very large gentle long-necked dinosaur (brachiosaurus-type) with soft olive-green skin, enormous kind brown eyes, a gentle smile, and a rounded snout — clearly a single dinosaur character'
const ZIPSI = 'Zipsi is a small quick playful dinosaur with bright multicolored scales (blue, green, yellow), a long wagging tail, and big sparkling eyes — clearly a single dinosaur character'
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
    prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from multiple angles (front, side, back, waving). Beside him: ${P}, also from multiple angles. Bottom row: ${TROMMO} shown from front and side — note the very long neck and gentle expression. Far right: ${ZIPSI} shown from front and side — note the small size and colorful scales. White background. Consistent art style throughout. ${E}`,
  },
  {
    filename: 'cover.png',
    prompt: `${S} Book cover: ${F} in his dark green jacket and wide-brimmed hat stands in a lush prehistoric valley. Behind him, the enormous gentle ${TROMMO} lowers his long neck down to Firlefanz's level with a warm smile. The small colorful ${ZIPSI} leaps joyfully nearby. Giant ancient ferns, towering prehistoric trees, and a golden sky with soft mist fill the background. Magical, warm, inviting atmosphere. ${E}`,
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} just waking up in his cosy bedroom, sitting up in bed with a dreamy, wondering expression, rubbing one eye. Around him in a soft dream-cloud illustration style, gentle outlines of friendly dinosaurs float — a large gentle long-necked one and a small colorful one, all smiling and waving. Warm morning light through a small window. ${E}`,
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} at a small wooden kitchen table eating a bowl of warm oatmeal with honey, a cup of warm tea beside the bowl. He has a thoughtful, faraway look with chin resting on one hand. Soft morning light through a cosy window. Simple, warm, quiet breakfast scene. ${E}`,
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} visiting ${P}, who sits on a wooden stool in front of his cosy house with a steaming coffee cup. Firlefanz stands before him looking excited and curious. Papalapapp smiles warmly and gestures toward distant misty mountains on the horizon. A small cosy village garden with flowers. ${E}`,
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} standing in front of a tall mirror, dressed for adventure: dark green jacket, brown hiking boots, wide-brimmed explorer hat, wooden walking stick with a copper knob. He gives a proud, satisfied nod at his reflection. ${P} stands at the open front door with a backpack, smiling warmly. Bright cheerful hallway with wooden floor. ${E}`,
  },
  {
    filename: 'page-5.png',
    prompt: `${S} Epic journey scene. IMPORTANT: there is exactly ONE Firlefanz and exactly ONE Papalapapp in this image — a single pair of travelers, shown only once, together in the foreground. ${F} (${OUTFIT}) walks side by side with ${P}, who wears his scarf and carries a backpack, along a path in the foreground. Behind them, a sweeping panorama hints at the long journey ahead: a distant turquoise sea, a far snow-capped mountain, and a winding river, all far away in the background. Do NOT draw any duplicate, extra, or background copies of Firlefanz or Papalapapp anywhere — each appears exactly once. Sense of grand adventure and vast distance. ${E}`,
  },
  {
    filename: 'page-6.png',
    prompt: `${S} A breathtaking view: beyond a massive natural stone arch, an enormous lush prehistoric valley opens up. Towering ancient trees with enormous trunks, cascading waterfalls, giant flowers in vivid pink and violet. ${F} and ${P} stand at the arch, small against its scale, staring in awe at the world opening before them. Warm golden light pours through the valley. ${E}`,
  },
  {
    filename: 'page-7.png',
    prompt: `${S} ${F} and ${P} stand in the lush valley. From the dense ancient foliage emerges a colossal head on a very long neck — ${TROMMO} — as large as a rooftop, with enormous kind brown eyes. Firlefanz grips Papalapapp's hand and looks up wide-eyed. Trommo winks one huge eye and smiles warmly. Dappled golden jungle light. ${E}`,
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Joyful meeting scene in the lush prehistoric valley. IMPORTANT: there is exactly ONE Firlefanz, exactly ONE Papalapapp, exactly ONE Trommo, and exactly ONE Zipsi — each character appears only once. The enormous gentle ${TROMMO} bends his long neck down toward the group. ${F}, wearing his explorer hat, raises his arms in delight. Beside him stands ${P}, who is larger and wears his scarf. The small colorful ${ZIPSI} hops excitedly from foot to foot nearby, tail wagging like a happy puppy. Do NOT draw two small green dragons — there is only ONE Firlefanz. Tropical ferns and giant flowers surround the group. Warm golden afternoon light. ${E}`,
  },
  {
    filename: 'page-9.png',
    prompt: `${S} ${F} and ${P} seated together high on the broad back of the enormous gentle ${TROMMO}, so high that they are level with soft white clouds, gazing out over the vast green valley far below with quiet wonder. The small colorful ${ZIPSI} perches happily on Trommo's neck just nearby. IMPORTANT: there is exactly ONE Firlefanz, ONE Papalapapp, ONE Trommo, and ONE Zipsi — each character appears only once; do NOT draw Firlefanz or Papalapapp more than once anywhere. Warm late-afternoon golden light, soft and dreamy. ${E}`,
  },
  {
    filename: 'page-10.png',
    prompt: `${S} Farewell scene at the edge of the valley under a starry night sky. ${TROMMO} bends his long neck gently down, and ${F} rests his head softly against Trommo's cheek with eyes closed and a warm smile. ${ZIPSI} stands on tiptoe and places a small glowing pebble into Firlefanz's outstretched hand. ${P} watches with a gentle expression. Stars reflect in a still forest pool nearby. ${E}`,
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${F}'s cosy bedroom at night. He lies tucked under a warm blanket with sleepy drooping eyes and a peaceful smile, one hand loosely holding a small glowing stone. ${P} sits beside the bed in the soft lamplight. Through the small window, a full moon and stars. The room glows in deep blue and warm amber. Deeply restful, dreamy, safe scene. ${E}`,
  },
]

// One OpenRouter call. Reference images (style sheet + previous page) are passed as
// data-URL image parts alongside the text prompt so Nano Banana 2 keeps the characters
// and scene style consistent. Returns the raw PNG bytes Gemini emits.
async function callModel(prompt: string, refPaths: string[]): Promise<Buffer> {
  const content: Array<Record<string, unknown>> = [{ type: 'text', text: prompt }]
  for (const refPath of refPaths) {
    const b64 = fs.readFileSync(refPath).toString('base64')
    content.push({ type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } })
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content }],
      modalities: ['image', 'text'],
      image_config: { aspect_ratio: '3:2', image_size: '2K' },
    }),
  })

  if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text()}`)
  const data = await res.json() as {
    choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[]
  }
  const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url
  if (!url) throw new Error('No image in response')
  const b64 = url.split(',')[1] ?? ''
  return Buffer.from(b64, 'base64')
}

async function generate(spec: ImageSpec, referenceImages: string[]): Promise<void> {
  console.log(`Generating ${spec.filename}...`)

  const existingRefs = referenceImages.filter(p => fs.existsSync(p))

  // Retry a few times — image models occasionally return no image part.
  let raw: Buffer | null = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      raw = await callModel(spec.prompt, existingRefs)
      break
    } catch (e) {
      console.error(`  attempt ${attempt} failed: ${(e as Error).message}`)
      if (attempt < 3) await new Promise((r) => setTimeout(r, 3000))
    }
  }
  if (!raw) throw new Error('all attempts failed')

  // Normalise to the project's canonical 1536×1024 (3:2) so every downstream
  // script (watermark, compress, pdf) sees a consistent source size.
  const buf = await sharp(raw).resize(WIDTH, HEIGHT, { fit: 'cover' }).png().toBuffer()
  fs.writeFileSync(path.join(storyDir, spec.filename), buf)
  console.log(`  Saved ${spec.filename} (${(buf.length / 1024).toFixed(0)} KB)`)
}

const styleRefPath = path.join(storyDir, STYLE_REF)
const coverPath = path.join(storyDir, 'cover.png')

// Optional targeted regen, e.g. PAGES=5,8 (page numbers) or PAGES=cover.png.
// In targeted mode the style-ref sheet is not rebuilt; the existing cover (which
// shows every character exactly once) is the style anchor instead, and the on-disk
// previous page provides continuity. Non-requested files are left untouched.
const requested = process.env.PAGES?.split(',').map(s => s.trim()).filter(Boolean)
const onlyFiles = requested && requested.length
  ? new Set(requested.map(p => /^\d+$/.test(p) ? `page-${p}.png` : p))
  : null
if (onlyFiles) console.log(`Targeted regen: ${[...onlyFiles].join(', ')}`)

// Optional style anchors (e.g. previous-generation images) passed as extra reference
// images when building the character/style sheet, to steer the painterly look.
const styleAnchors = (process.env.STYLE_ANCHORS?.split(',').map(s => s.trim()).filter(Boolean) ?? [])
  .filter(p => fs.existsSync(p))
if (styleAnchors.length) console.log(`Style anchors: ${styleAnchors.join(', ')}`)

let previousPagePath: string | null = null

for (const spec of images) {
  // In targeted mode skip the style-ref build and any page not requested, but keep
  // the continuity chain pointing at the on-disk previous page.
  if (onlyFiles) {
    if (spec.isStyleRef) continue
    if (!onlyFiles.has(spec.filename)) {
      previousPagePath = path.join(storyDir, spec.filename)
      continue
    }
  }

  try {
    const refs: string[] = []

    if (spec.isStyleRef) {
      // Anchor the character/style sheet to any provided reference images (e.g. the
      // previous-generation art) so the painterly look carries into every page.
      refs.push(...styleAnchors)
    } else {
      // Style anchor: the style-ref sheet on a full run, the existing cover on a targeted regen.
      refs.push(onlyFiles ? coverPath : styleRefPath)
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
