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

const storyDir = path.join(rootDir, 'public/stories/der-waldkindergarten')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Soft, hand-painted children's picture-book illustration in a gentle watercolor style — warm and friendly classic storybook art. NOT photorealistic, NOT 3D-rendered, NOT cinematic. Naturally colourful but with a soft, gently warm palette of moss green, leaf green, honey gold, warm brown, soft sky blue and creamy white — not neon, not over-saturated, and not dull or muddy either. Soft rounded shapes, friendly faces, light hand-drawn outlines, and gentle painterly shading. Comfortable dappled forest daylight, soft even lighting, no harsh shadows."
const E = 'Warm, cosy and kid-friendly atmosphere — soft and welcoming, never gloomy, murky, dark, or scary, but also calm rather than loud or garish. Gentle colours with soft even lighting and no heavy dark shadows. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const ANAT = 'with a row of soft rounded spikes down the back and tail, big friendly eyes, short rounded snout, small arms, chunky tail, and absolutely NO wings and NO horns (never draw little bat-wings or horns)'
const F = `Firlefanz is exactly ONE small, round, friendly green dragon/dinosaur creature (not human, no specific gender) ${ANAT} — there is exactly one Firlefanz in the entire image, never two`
const P = `Papalapapp is the same species as Firlefanz ${ANAT}, but clearly LARGER, taller and fatherly, wearing an orange scarf — there is exactly one Papalapapp in the entire image, never two`
const T = 'Frau Farn, the kindergarten teacher, is a tall, gentle, warm-brown doe (female deer) standing upright, with soft kind eyes, long lashes, a green felt hat with a little feather, and a small wooden whistle on a cord around her neck. She is clearly a deer, NOT a dragon or dinosaur — there is exactly one Frau Farn.'
const K = 'Kiro is a small red fox kit standing upright, with a fluffy white-tipped tail, a moss-green knitted woolly hat, and a little yellow rain jacket. He is clearly a fox, NOT a dragon or dinosaur — there is exactly one Kiro.'
const KIDS = 'The other kindergarten children are all small forest animals, each a clearly DIFFERENT species from Firlefanz and NOT green dragons or dinosaurs: a small round fluffy owl chick, a little hedgehog in a pointed knitted cap, and a red squirrel with a bushy tail.'
const OUTFIT = 'Firlefanz wears dark-blue rain dungarees (bib overalls) that go up over his belly, red rubber boots, a small green hat, a small brown backpack, and carries a little wooden walking stick.'
const CAMP = 'The forest kindergarten is a round sunlit clearing in a beech forest: in the middle stands an old wooden construction-trailer wagon painted in cheerful faded colours, in front of it a fire pit ringed with grey stones with tree-stump seats around it, and between the trees hang a few colourful hammocks. An enormous ancient beech tree with a broad trunk and soft golden-green leaves stands at the edge of the clearing.'
const NO_TOYS = 'IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys must NOT be dragons or dinosaurs (a soft teddy bear or cloth bunny is fine), so there is never a second little dragon figure.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully — wearing dark-blue rain dungarees, red rubber boots and a small green hat. Next to him ${P} Shown from front and side, clearly much bigger than Firlefanz. Middle row: ${T} Shown from front and side. Next to her ${K} Shown from front and side. Bottom row: the three other kindergarten children — a small round fluffy owl chick, a little hedgehog in a pointed knitted cap, and a red squirrel with a bushy tail — each shown once from the front. Make every character clearly distinct in species, size and colour. Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A warm, inviting children's book cover. ${CAMP} In the foreground ${F} — ${OUTFIT} — stands happily in the clearing holding hands with ${K}, both smiling, while ${T} stands warmly behind them beside the painted wagon. Dappled golden sunlight falls through the beech leaves, soft moss, ferns and mushrooms on the forest floor. Deeply warm, magical, full of gentle wonder. ${KIDS} ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cosy little bedroom on a bright fresh morning. ${F} has just woken and sits up in his small wooden bed, eyes wide with excitement and a hint of nervous flutter, one hand on his tummy. Through the open window a green forest edge and a few birds on a branch are visible in warm morning light. Soft, snug, tender mood in honey and cream tones. ${NO_TOYS} ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table eating a bowl of warm porridge with apple pieces and a drizzle of honey, spoon in hand, gazing thoughtfully into the air. Tiny dreamy wisps float above his head showing faint little trees, a raindrop and a question-like curl of mist — hinting at his forest questions. Warm cosy kitchen interior in soft honey and green tones. ${NO_TOYS} ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} In front of a little village cottage on a sunny morning. ${P} sits on a wooden bench holding a steaming cup of coffee, relaxed and smiling. ${F} in his pyjamas comes running up the garden path toward him, arms raised, calling out an excited question with wide sparkling eyes. Flowers along the path, a green forested hill in the background. Calm, sunny, peaceful morning light. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cosy cottage. ${F} is now dressed for the forest — ${OUTFIT} — standing proudly in front of a tall wooden-framed mirror, turning slightly with a delighted smile. His reflection in the mirror shows the same single Firlefanz in the same outfit (this is a mirror, so the reflection is fine — but there must be no other dragon figure). ${P} stands beside him, nodding approvingly. Warm golden morning light fills the snug room. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} A sweeping, gentle wide landscape seen from slightly above. ${F} — ${OUTFIT} — and ${P} walk hand in hand as small figures along a winding path that leads away from a tiny village with seven little lanes and garden fences, over seven small wooden footbridges across sparkling brooks, past seven mossy boulders and over seven soft green hills, toward a big welcoming beech forest ahead. Warm bright sky with soft clouds. Grand sense of a journey, gentle wonder and warmth. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${CAMP} Seen from the edge of the forest path: ${F} — ${OUTFIT} — has stopped at the entrance to the clearing, holding ${P}'s hand tightly and looking at the camp with wide, curious, slightly nervous eyes. The leaves of the trees around them shimmer softly as if whispering, with a few gentle golden-green sparkles among the leaves. No other characters are visible yet. Warm dappled sunlight, moss and ferns. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} ${CAMP} ${T} steps warmly out of the painted wagon door toward ${F} — ${OUTFIT} — who stands close to ${P}, looking up at her with a shy beginning smile. Behind them the enormous ancient beech tree gently rustles, its leaves glowing with soft golden-green light as if it is whispering a welcome. Frau Farn bends kindly toward Firlefanz. Warm, tender, welcoming mood. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} ${CAMP} Morning circle: on the tree-stump seats around the stone fire pit sit the kindergarten children singing together — ${KIDS} ${K} sits among them too. ${F} — ${OUTFIT} — sits on a stump between them, humming along with a little smile. ${T} stands beside the circle leading the song. At the edge of the clearing ${P} waves goodbye with a warm smile as he turns to go between the trees. Every child is a clearly different animal; there is exactly one Firlefanz. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} In the sunlit forest beside a thick tree trunk. ${F} — ${OUTFIT} — and ${K} are building a stick hut together: many long branches leaned against the trunk in a cone shape, forming a cosy little shelter. Kiro carries a long branch, Firlefanz leans one into place, both grinning with delight. Little sunspots of light fall through the gaps. Moss, ferns and mushrooms around. Joyful, gentle mood. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} ${CAMP} At a little mud kitchen — a low wooden bench with old pots, pans and a bowl — ${F} — ${OUTFIT} — stirs a big pot of pretend mud soup with pine cones and beechnuts using a wooden spoon, proudly presenting it. ${K} and the other children (${KIDS}) gather around pretending to slurp from little wooden bowls, laughing. ${T} tends a kettle over the fire pit nearby. Warm, playful, cosy mood. Exactly one Firlefanz. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} Quiet forest rest time. Colourful hammocks hang between the beech trees in the clearing. ${F} — ${OUTFIT} — lies in a hammock gazing up at the leaves, yawning softly, deeply relaxed. In other hammocks nearby rest ${K} and the other children (${KIDS}), eyes half closed. ${T} gently pushes one hammock. Above them the leaves sway in the breeze with warm dappled light sparkling through. A woodpecker on a trunk. Deeply calm, peaceful, dreamy mood. Exactly one Firlefanz. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} Late afternoon on the forest path leading home, golden light between the trees. ${P} carries ${F} — ${OUTFIT} — on his back; Firlefanz has his eyes half closed and cheek resting sleepily on Papalapapp's shoulder, muddy red boots dangling. Far behind them in the clearing ${K} waves goodbye beside the stick hut. Soft golden-hour light, sleepy, tender, content mood. ${E}`
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
