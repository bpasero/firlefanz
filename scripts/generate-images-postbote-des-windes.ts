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

const storyDir = path.join(rootDir, 'public/stories/der-postbote-des-windes')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style with visible brushstrokes and paper texture. Warm palette of golden amber, soft greens, dusty blues, and muted earth tones. Gentle ink outlines, pastel washes, luminous highlights."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with round eyes and a cheerful snout. There is exactly one Firlefanz in the scene.'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly, with a warm gentle face. There is exactly one Papalapapp in the scene.'
const LETTER = 'The letter is an old, yellowed, slightly worn folded piece of paper, sealed with a small faded red wax seal. The paper looks soft and ancient but precious. No visible writing or text on the paper.'
const OUTFIT_TRAVEL = 'Firlefanz wears a soft hooded travel cloak in earthy green-brown tones, sturdy little boots, and carries a small wooden walking stick and a tiny backpack. Papalapapp wears a wide-brimmed hat and a cozy travel coat, with a satchel slung over his shoulder.'
const FLUESTER = 'Flüster is a small, fluffy, cloud-like wind sprite — a friendly little creature about the size of a cat, made of soft pale-blue and white fluff with a tiny round face, big kind eyes, a tiny smile, and small floppy ears. He wears a slightly crooked grey-blue postman\'s cap and has several little leather letter pouches and satchels slung across his fluffy body. Wisps of gentle wind curl around him. There is exactly one Flüster in the scene.'
const KNURR = 'Knurr is a kind old tortoise the size of a small dog. He has a gentle wrinkled face, soft warm eyes, a round brown shell, and wears a cozy hand-knitted woollen cap in warm earthy colors. He uses tiny round reading glasses perched on his snout. There is exactly one Knurr in the scene.'
const WINDHAUS = 'The Windhaus is a tiny round whimsical cottage on top of a small grassy hill, with a thatched roof and dozens of small colorful mailboxes hanging from its walls in every shade — red, blue, green, yellow, orange. Gentle swirls of wind drift around it.'
const LIGHTHOUSE = 'A small old stone lighthouse on a tiny rocky islet in the middle of a calm, mirror-still sea. The lighthouse has a round top with a soft warm glow, weathered grey-blue stone walls, and a small wooden door at its base.'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook. Top row: ${F}, shown from front, side, and waving — small green dragon/dinosaur. Next to him, ${P}, same species but larger — shown from multiple angles. Middle row: ${FLUESTER}, shown from front and side. Next to him, ${KNURR}, shown from front and side. Bottom row: the old folded letter — ${LETTER} — and a tiny wisp of swirling wind. White background, consistent art style. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A children's book cover: ${F} and ${P} stand on a grassy hill at golden hour, looking up at the sky where ${FLUESTER} floats happily on a gentle curl of wind, holding out little letter pouches. ${F} reaches up with the old folded letter — ${LETTER} — in his paw. Soft puffy clouds drift in a warm sky. Warm magical adventurous mood. Soft watercolor textures. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} has just woken up in his cozy little bedroom. He sits up in bed, blinking sleepily. An old yellowed folded letter — ${LETTER} — has just fluttered through the open window on a soft wisp of breeze and is gently landing on his blanket. Curtains flutter in the morning breeze. Warm golden morning light filters through the window. Wonder and gentle surprise on his face. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at a small kitchen table. In front of him is a warm slice of bread with rosehip jam and a steaming cup of chamomile tea. Next to his plate lies the old folded letter — ${LETTER} — slightly rustling. ${F} gazes at it thoughtfully, one paw to his chin. Cozy warm kitchen with morning light streaming through a window. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} stands on the wooden veranda of ${P}'s little cottage, holding out the old folded letter — ${LETTER} — in his open paw. ${P} sits in a wooden chair with a cup of morning coffee, leaning forward, inspecting the faded wax seal with a thoughtful, knowing smile. Sunny morning, potted plants, peaceful village atmosphere. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} and ${P} stand at the front gate of their little village house, dressed for a long journey. ${OUTFIT_TRAVEL} ${F} is just tucking the wrapped letter carefully into the top of his little backpack. Both wave goodbye to their cozy little cottage. Morning light, packed bags at their feet, a sense of warm adventure. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic wide landscape vista showing ${F} and ${P} walking together along a winding path through a magical varied landscape: rolling green hills, a shimmering river crossed by little wooden bridges, distant misty mountains, a forest in the distance, and gentle dunes. ${OUTFIT_TRAVEL} Soft swirls of friendly wind curl visibly around them, leading the way. Sense of grand journey, warm afternoon light, dreamy clouds. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} and ${P} have arrived at the top of a small round grassy hill. Before them stands ${WINDHAUS}. ${FLUESTER} has just stepped out of the small wooden door, smiling warmly and waving a little fluffy arm in greeting. Soft afternoon light, gentle wind curls in the air, a few mailboxes wiggle slightly as if alive. ${F} and ${P} (in ${OUTFIT_TRAVEL}) look up at Flüster with delighted wonder. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} The cozy inside of the Windhaus. Soft warm light from hanging paper lanterns. Stacks and stacks of old folded letters piled everywhere — on tiny shelves, in baskets, on a small wooden desk — some dusty, some yellowed, all looking ancient and precious (but with no visible writing on them). ${FLUESTER} stands at his little desk, gently holding up the old folded letter ${LETTER} to the light, looking at it tenderly. ${F} and ${P} watch attentively. Cozy, magical, hushed atmosphere. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} ${F}, ${P} (in ${OUTFIT_TRAVEL}), and ${FLUESTER} are gently rising into the sky on a soft swirl of friendly wind, like floating on a cloud. The wind is visible as soft pale-blue and white whirls supporting them. Below them, rolling green hills and shimmering rivers stretch out, glowing in warm late-afternoon golden light. ${F} clutches the folded letter ${LETTER} carefully to his chest. Pillow-soft clouds drift around. Dreamy, magical, weightless. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} ${LIGHTHOUSE} The friendly wind has just gently set ${F}, ${P} (in ${OUTFIT_TRAVEL}), and ${FLUESTER} down on the small rocky islet in front of the lighthouse door. The wooden door has just opened, and ${KNURR} the old tortoise in his knitted cap peers out with a surprised, delighted smile. Soft late-afternoon light, calm mirror-still sea reflecting the sky, distant soft pastel clouds. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} Inside ${KNURR}'s cozy little lighthouse room. ${KNURR} sits in a comfy wooden rocking chair, the unfolded old letter — ${LETTER} but now gently opened in his paws — held up to read with his tiny round reading glasses. He smiles softly and a single tiny, happy tear glistens on his wrinkled cheek. ${F} and ${P} (in ${OUTFIT_TRAVEL}) and ${FLUESTER} stand nearby, watching with warm, tender expressions. Soft warm lantern light. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${F}, ${P}, ${FLUESTER}, and ${KNURR} sit together on the small wooden balcony of the lighthouse, sipping tea from little cups and sharing thick warm slices of golden honey cake on a wooden plate. Beyond them stretches a perfectly calm, mirror-still sea reflecting the first bright stars and a deep violet-orange twilight sky. The lighthouse glows gently behind them. Peaceful, warm, tender. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F} and ${P} stand together in their small cottage garden at sunset. The sky is deep violet and gold, with the first bright stars beginning to twinkle. A tiny, gentle wisp of friendly wind curls around ${F}, ruffling his scales softly — as if saying thank you. ${F} leans gently against ${P}, looking sleepy and content. Travel gear set down beside them. Warm peaceful glow. Tender, cozy, sleep-inducing. ${E}`
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
