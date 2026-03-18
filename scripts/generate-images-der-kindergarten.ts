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

const storyDir = path.join(rootDir, 'public/stories/der-kindergarten')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature (not human, no specific gender) — there is exactly one Firlefanz in the entire image'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly — there is exactly one Papalapapp in the entire image'
const FJ = 'Finja is a small friendly creature (same species as Firlefanz) with large round eyes and wearing a bright orange hat — there is exactly one Finja in the image'
const OUTFIT = 'Firlefanz wears a blue backpack, colorful boots, a warm jacket, and a striped scarf. Papalapapp wears a coat and a scarf.'
const OUTFIT_PAGE = 'page-4.png'

interface ImageSpec {
  filename: string
  prompt: string
  isOutfitPage?: boolean
  useOutfitRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: 'cover.png',
    prompt: `${S} A book cover: ${F} and ${FJ} stand together in front of a bright, colourful kindergarten house at the end of a linden tree avenue. Both have big smiles and look excited. The kindergarten has a cheerful garden with swings and a sandbox. Morning light, warm and welcoming atmosphere. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} sitting up in bed in a cozy small bedroom, wide awake and beaming with excitement, little fists raised in joy. Morning sunlight streams through a round window. A backpack and colourful boots are set out ready beside the bed. Patchwork quilt, wooden furniture, warm and cozy feel. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sitting at a small kitchen table eating a thick slice of bread with strawberry jam, a steaming mug of tea in front of him. He stares dreamily out the window with a happy expression, imagining swings, building blocks, and friends. Warm morning kitchen light, cheerful colours. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} talking excitedly to ${P}, who stands in a cozy kitchen holding a coffee cup. Papalapapp has an enormous warm smile and is putting down the cup, clearly delighted and ready to head out. Morning light, warm and friendly domestic scene. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} wearing a blue backpack, colorful boots, a warm jacket, and a striped scarf, standing tall and proud in front of a mirror with a big grin. ${P} wearing a coat and scarf stands nearby smiling warmly. Both are at the front door of a cozy cottage, ready to set off on their first kindergarten adventure. Morning light outside. ${E}`,
    isOutfitPage: true
  },
  {
    filename: 'page-5.png',
    prompt: `${S} ${F} and ${P} on an epic journey together through a magical succession of vast landscapes — glittering seas, golden deserts, wide rushing rivers, rolling hills, and dense linden forests. ${OUTFIT} Their tiny figures walk hand-in-hand against sweeping, beautiful panoramas. Adventurous yet calming atmosphere, warm morning light. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} and ${P} arriving at the end of a long linden tree avenue. At the far end stands a bright, colourful kindergarten house painted in cheerful colours, with a large garden full of swings, a sandbox, and a red climbing tower. Other small creature children with backpacks can be seen near the entrance. Firlefanz pauses, eyes wide with wonder and a touch of nerves. ${OUTFIT} Warm morning sunlight filtering through the linden trees. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-7.png',
    prompt: `${S} ${P} kneeling down on the path outside the kindergarten to be at eye level with ${F}, placing both hands gently on his shoulders and looking at him with deep warmth and reassurance. Firlefanz looks slightly nervous but hopeful. The colourful kindergarten is visible in the soft background. A tender, caring moment between father and child. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Inside a bright and cheerful kindergarten room. A friendly teacher creature with a yellow braid and a heart on her apron smiles warmly and gestures welcomingly. ${FJ} gently tugs on ${F}'s striped scarf from one side, looking up at him with a big friendly smile and her orange hat slightly askew. Firlefanz looks pleasantly surprised. Colourful room with cubbyholes, drawings on the walls, wooden toys. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-9.png',
    prompt: `${S} ${F} and ${FJ} in a building corner of the kindergarten, surrounded by scattered wooden blocks. They have just finished building an enormous wobbly tower together and it is dramatically toppling. Both laugh with wide-open mouths and delight. A group of other small creature children rush over to see and join the laughter. Warm, joyful, playful scene. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-10.png',
    prompt: `${S} A circle of small creature children including ${F} and ${FJ} dancing and singing together in a bright kindergarten room. Nearby, paintings dry on a line and golden paper stars are stuck to a window. Then a wide long table where all the children sit together eating tomato soup with bread, everyone content and cosy. Warm afternoon light, peaceful and happy. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-11.png',
    prompt: `${S} At the kindergarten entrance doorway in afternoon light. ${F} wearing his jacket and backpack waves goodbye to ${FJ}, who waves back enthusiastically from inside the doorway wearing her orange hat. Both are laughing and calling something to each other. ${P} stands behind Firlefanz, smiling warmly. A happy, warm farewell. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${P} carrying a fast-asleep ${F} on his back on a quiet village path at dusk. Firlefanz has a peaceful smile and holds a golden paper star clutched loosely in one small fist. The village is bathed in warm orange evening light. Trees line the path, a cozy little house glows warmly ahead in the distance. Dreamy, tender, perfect bedtime scene. ${E}`,
    useOutfitRef: true
  },
]

async function generate(spec: ImageSpec, referenceImagePath: string | null = null): Promise<void> {
  const outPath = path.join(storyDir, spec.filename)
  if (fs.existsSync(outPath)) {
    console.log(`Skipping ${spec.filename} (already exists)`)
    return
  }
  console.log(`Generating ${spec.filename}...`)
  let res: Response
  if (referenceImagePath && fs.existsSync(referenceImagePath)) {
    const formData = new FormData()
    formData.append('model', 'gpt-image-1')
    formData.append('prompt', spec.prompt)
    formData.append('size', '1536x1024')
    formData.append('quality', 'high')
    const imageData = fs.readFileSync(referenceImagePath)
    formData.append('image', new Blob([imageData], { type: 'image/png' }), 'reference.png')
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
  fs.writeFileSync(outPath, buf)
  console.log(`  Saved ${spec.filename} (${(buf.length / 1024).toFixed(0)} KB)`)
}

let outfitRefPath: string | null = null
for (const spec of images) {
  try {
    await generate(spec, spec.useOutfitRef ? outfitRefPath : null)
    if (spec.isOutfitPage) {
      outfitRefPath = path.join(storyDir, OUTFIT_PAGE)
    }
  } catch (e) { console.error(`  FAILED: ${(e as Error).message}`) }
  await new Promise((r) => setTimeout(r, 2000))
}
console.log('\nDone!')
