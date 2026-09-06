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

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A warm, calming palette of forest green, moss green, honey gold, warm brown, soft sky blue and creamy white. Gentle ink outlines, soft dappled sunlight through leaves, a great sense of comfort, warmth and gentle wonder."
const E = 'Gentle, calm, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const M = 'Mrs Moosbach is a kind, motherly badger lady with a black-and-white striped face, soft grey fur, a round green felt hat and a small wooden flute hanging on a cord around her neck. She is clearly a badger, NOT a dragon or dinosaur.'
const N = 'Nuffi is a small, fluffy chestnut-brown squirrel with a big bushy tail, bright round eyes and a red woolly bobble hat. Nuffi is clearly a squirrel, NOT a dragon or dinosaur.'
const KIDS = 'The other kindergarten children are small, cute woodland creatures in muddy rubber boots — a little rabbit, a small hedgehog, a fox kit, a tiny mouse — and NONE of them are dragons or dinosaurs, so Firlefanz is the only small dragon-dinosaur in the scene.'
const OUTFIT = 'green rubber boots, brown mud trousers, a yellow rain jacket, a soft blue woolly hat, a small backpack and a small wooden walking stick'
const PLACE = 'The forest kindergarten: a huge old oak tree at the edge of a sunlit forest with a swing made of ropes hanging from a thick branch, a circle of tree stumps as seats beneath it, and beside it a small, cozy, colourfully painted wooden wagon (a little caravan on wheels) with flower boxes at its window. No building, no house — just the forest.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully — dressed in ${OUTFIT}. Next to him ${P} Shown from front and side. Bottom row: ${M} Shown from front and side. Next to her ${N} Shown from front and side, waving. Make all four characters clearly distinct: a small child dragon Firlefanz, a large fatherly dragon Papalapapp, a badger lady in a green hat, and a tiny squirrel in a red bobble hat. Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, warm, cinematic children's book cover. ${PLACE} In the golden dappled sunlight beneath the great oak, ${F} dressed in ${OUTFIT} stands happily at the center, and next to him ${N} waves cheerfully. Behind them ${M} smiles warmly by the colourful wooden wagon, and a rope swing sways from the oak branch. Ferns, moss, mushrooms and tall sunlit trees all around, soft light rays falling through the leaves. Deeply warm, magical and full of wonder. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom on a bright, fresh morning. ${F} has just woken and sits up in his small wooden bed, blinking and stretching with a happy, excited, slightly curious smile. Through the open window, a green forest is visible on the hills beyond the village. Warm golden sunlight streams in. Soft, snug, tender mood in honey and cream tones. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine), so there is never a second little dragon figure. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table eating a bowl of warm oatmeal with apple pieces and a drizzle of honey, spoon in hand, gazing dreamily into the air. Tiny dream-like wisps float gently above his head showing faint green trees, a little squirrel and a ring of tree stumps, hinting at the forest kindergarten he is imagining. Warm cozy kitchen interior in soft honey and green tones, a happy, thoughtful, anticipatory feeling. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} In front of a little village cottage on a sunny morning. ${P} sits on a wooden bench holding a steaming cup of coffee, relaxed and smiling. ${F} stands before him in his pyjamas, talking eagerly with wide sparkling eyes, pointing toward a green forest visible on the hills in the distance. Calm, sunny, peaceful morning light, flowers by the cottage door. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage hallway. ${F} is now dressed for the forest in ${OUTFIT} — green rubber boots, brown mud trousers, yellow rain jacket, blue woolly hat, small backpack, holding his little wooden walking stick — standing proudly in front of a tall mirror and looking at his reflection with a satisfied grin, one boot stamping. A sandwich and an apple peek out of the open backpack. Warm golden morning light fills the snug room. Cheerful, proud, anticipatory mood. IMPORTANT: the mirror reflection must show Firlefanz himself, and there is still exactly one Firlefanz in the scene. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic but gentle, sweeping wide landscape seen from above. ${F} dressed in ${OUTFIT} and ${P} walk hand in hand as small figures along a winding path that leads out of a cozy village, over seven soft green hills, across seven little wooden bridges over sparkling brooks, through seven meadows full of daisies and over seven little wooden fences, toward a big green forest at the far end where the trees grow taller and taller. Warm bright sky with soft fluffy clouds. Grand sense of a journey, gentle wonder and warmth. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${PLACE} ${F} dressed in ${OUTFIT} stands at the edge of the path holding ${P}'s hand, looking up at the enormous old oak with wide, awed, slightly nervous eyes. ${KIDS} A few of these woodland children run about happily between the trees in the background. Tall sunlit trees, ferns and moss, soft light rays. A mood of wonder mixed with a little shyness. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} Beneath the great old oak of the forest kindergarten. ${P} kneels down to be at eye level with ${F} dressed in ${OUTFIT} and wraps him in a big, warm, tender hug. Firlefanz's eyes are closed, his face pressed to Papalapapp's shoulder, comforted. Gentle sunlight through the leaves, the rope swing and the colourful wooden wagon softly in the background. Very tender, loving, reassuring mood. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} At the forest kindergarten. ${M} steps out of the small colourful wooden wagon with open arms and a warm welcoming smile toward ${F} dressed in ${OUTFIT}. In the foreground, ${N} peeks out from a patch of green ferns with a cheeky, friendly grin, waving. ${P} stands a little behind, smiling. Dappled sunlight, moss, mushrooms, the great oak above. Warm, welcoming, joyful mood. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} Deep in the sunlit forest. ${F} dressed in ${OUTFIT} and ${N} are building a hut out of long branches leaned against a thick tree trunk, both carrying sticks and laughing. ${KIDS} Two or three of these woodland children help by carrying branches. Nearby lies a big hollow fallen log, and a small colourful woodpecker sits on a branch above. Ferns, moss, soft light rays. Playful, happy, busy and warm mood. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} The morning circle at the forest kindergarten: ${M} sits on a tree stump playing her small wooden flute. ${F} dressed in ${OUTFIT} and ${N} sit side by side on tree stumps in the circle, and around them sit the other woodland children. ${KIDS} In the middle of the circle a small, safe campfire with a little pot of apple compote steaming gently. Golden dappled light, the great oak above. Deeply calm, cozy, content, peaceful mood. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} Midday at the edge of the forest kindergarten. ${P} walks along the forest path toward the great oak, arms open, while ${F} dressed in ${OUTFIT} runs joyfully toward him, proudly lifting one muddy green rubber boot. Behind Firlefanz, ${N} waves goodbye with his bushy tail from beside the half-built branch hut. Bright, warm sunlight, joyful reunion mood. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} Late golden afternoon on the path home. ${P} walks along a quiet path through soft green hills toward a small cozy cottage in the distance, carrying ${F} dressed in ${OUTFIT} asleep on his back. Firlefanz's eyes are gently closed with a peaceful happy smile, and in his small hand he holds a single pine cone. Behind them the forest glows in warm golden light, and the trees seem to sway softly. Deeply calm, warm, tender, sleep-inducing bedtime mood. ${E}`
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
