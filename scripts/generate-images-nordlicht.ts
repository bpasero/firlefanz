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

const storyDir = path.join(rootDir, 'public/stories/das-nordlicht')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A deep wintry palette of midnight blue, indigo and snow-white, lit by glowing aurora ribbons of emerald green, rose pink, soft violet and pale gold. Gentle ink outlines, soft glowing highlights, a great sense of calm, vastness and wonder. Cozy and warm despite the cold."
const E = 'Gentle, calm, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const OUTFIT = 'a thick cozy knitted red winter jacket, a chunky woolly cream scarf, sturdy little fur-lined boots, and a pointed woolly bobble hat, carrying a small wooden walking stick'
const LUMI = 'Lumi is an enormous, gentle, magical aurora fox, as big as a hill. His soft thick fur shimmers with the colors of the northern lights — deep blue and silver when at rest, glowing with flowing emerald green, rose, violet and gold when awake. He has a long, magnificent, sweeping tail that trails luminous ribbons of aurora light, large kind amber eyes, a soft snout, big fluffy ears, and a calm, wise, friendly face. He is warm and benevolent, never scary or fierce. There is exactly one Lumi in the scene.'
const STONE = 'a small smooth round stone partly wrapped in soft cream wool, glowing with a warm soft golden-orange light from within like a tiny gentle ember. No text on it.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully — a small green dragon-dinosaur. Next to him ${P} Shown from front and side. Center, large: ${LUMI} Shown full-body standing, and curled up asleep, plus a close-up of his gentle glowing face. Bottom row: ${STONE} shown close up; and Firlefanz's warm winter outfit laid out (a red knitted jacket, a cream woolly scarf, fur-lined boots and a pointed bobble hat). Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, cinematic children's book cover. A vast, still, snowy polar landscape at night under countless sparkling stars. Tiny and full of wonder in the foreground, ${F} dressed in ${OUTFIT}, and ${P} in a warm deep-blue coat and woolly hat, stand together on the glittering snow, looking up in awe. Towering far above them across the whole sky, ${LUMI} sweeps his great luminous tail, and the entire heavens blaze with magnificent dancing northern lights — vast flowing ribbons of emerald green, rose pink, violet and gold — mirrored on a sheet of smooth ice below. Epic in scale, deeply magical, serene and warm. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom, very early on a grey, dim winter morning. ${F} has just woken and sits up in his small wooden bed, blinking sleepily and clutching his soft blanket, with a wistful, dreamy expression. Through the bedroom window the sky is still dark and grey — no stars, no moon, only soft darkness. Quiet, calm, tender mood, the room in soft muted blue-grey tones with a hint of warm candlelight. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table, cozily eating a bowl of warm milk-porridge with honey, both little paws wrapped around a steaming cup of cocoa. He gazes thoughtfully out the kitchen window at a pale, cold, empty morning sky. Warm cozy kitchen interior in soft blues and warm honey-wood tones, a gentle calm wintry feeling. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${P} sits in a comfy wooden chair on the porch of his little snow-dusted cottage, holding a steaming cup of morning coffee, smiling warmly and knowingly as if about to share a wonderful secret. ${F} stands before him listening with wide, eager, sparkling eyes. A cold, calm, peaceful winter morning, soft snow on the rooftops, the quiet village behind them. IMPORTANT: it is early morning with a plain, pale grey-blue sky and soft daylight — there must be NO northern lights and NO aurora anywhere in the sky, only a quiet, empty winter morning sky. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage beside a warm glowing stove. ${F} is now dressed warmly in ${OUTFIT}. ${P} leans down and gently places ${STONE} into Firlefanz's open paws. Firlefanz gazes down at the softly glowing warm stone with delight and wonder. Warm golden firelight fills the snug room. Tender, loving, heartwarming mood. IMPORTANT: through any window the evening sky is dark and plain with only a few faint stars — there must be NO northern lights and NO aurora anywhere. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic, sweeping wide landscape vista. ${F} dressed in ${OUTFIT}, and ${P}, walk together as tiny figures across a vast, magical, varied frozen world — frozen silver seas, snowy dunes, towering mountains of blue ice, and a white snowy forest — all beneath a deep, dark, inky-blue night sky scattered with faint cold stars. IMPORTANT: the sky is completely dark and empty, COMPLETELY WITHOUT any northern lights or aurora of any kind, because the lights have not yet been woken. Firlefanz holds his softly glowing warm stone close to his chest — it is the single tiny point of warm light in all the cold darkness. Grand sense of journey, awe, and gentle solitude. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} dressed in ${OUTFIT}, and ${P} stand at the very top of the world — an immense, still, glittering snowfield stretching to the far horizon beneath a deep black sky filled with a thousand sparkling stars, but with NO northern lights at all, the sky dark and empty. Before them rises a beautiful cave of glowing translucent blue ice. Firlefanz's warm stone glows softly in his paws. A hushed, vast, magical scene, a touch lonely and full of quiet anticipation. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} Inside a vast cave of translucent glowing blue ice. ${LUMI} However, here his fur is dim, grey and dull — his light has gone out. He lies curled up fast asleep like a huge sleeping hill. ${F} dressed in ${OUTFIT}, and ${P} stand small beside the enormous sleeping fox, gazing at him with tender concern. Firlefanz holds his softly glowing warm stone. Cool blue tones, soft and quiet, gentle and not at all scary. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Inside the glowing blue ice cave, a deeply tender moment. ${F} dressed in ${OUTFIT}, presses his warm glowing stone (${STONE}) softly into ${LUMI}'s thick fur and hugs the great fox close, leaning his small body against him to share his warmth. A soft warm glow is just beginning to spread through Lumi's fur from where Firlefanz touches — the first gentle ribbons of green and gold light awakening in his coat. Lumi is slowly opening his large, kind amber eyes. Warm, magical, loving. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} A spectacular, awe-inspiring, cinematic moment — the showpiece of the book. ${LUMI} Now fully awake and radiant, his fur blazing with color, he rears up and sweeps his enormous luminous tail high across the heavens — and the entire night sky ERUPTS into magnificent dancing northern lights: vast flowing curtains and ribbons of brilliant emerald green, rose pink, violet and gold rippling across the stars and reflected on the snow below. ${F} dressed in ${OUTFIT}, and ${P} stand tiny at the bottom, arms raised, utterly awestruck. Breathtaking, epic, full of wonder. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} High up in the glowing aurora-filled night sky, ${F} dressed in ${OUTFIT}, rides joyfully on ${LUMI}'s broad soft back, the two of them soaring together among the swirling ribbons of northern lights. Firlefanz reaches out one paw and a delicate ribbon of soft green light streams from it, joining the dancing aurora — his very own light. Far below on the snowfield, tiny glowing snow-creatures dance and cheer in the colorful glow. Magical, joyful, weightless and tender. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${LUMI} Lowers his great gentle glowing head down close to ${F} dressed in ${OUTFIT}, and ${P} in a tender, loving farewell, his kind amber eyes warm and soft. Above and behind them the sky still shimmers with gentle dancing northern lights over the snow. In the middle distance, the tiny figures of Firlefanz and Papalapapp have begun their long walk home beneath a sky full of soft color. Warm, peaceful, heartfelt goodbye. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F}'s cozy little bedroom at night, warm and snug. ${F} is tucked sweetly into his bed under a soft blanket, eyes gently closed, fast asleep with a peaceful happy smile, holding his softly glowing warm stone (${STONE}) close in his paws. Through the bedroom window, far away in the starry night sky, a faint, delicate shimmer of green northern light glows gently among the stars. Deeply calm, warm, tender, sleep-inducing bedtime mood. ${E}`
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
