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

const storyDir = path.join(rootDir, 'public/stories/bobo-der-siebenschlafer')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy atmosphere suitable for a bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly'
const B = 'Bobo is a tiny fluffy dormouse with warm brown fur, oversized round button eyes, and a large bushy tail, about the size of a fist'
const OUTFIT = 'Firlefanz wears a red hat with a long feather, sturdy brown boots, and a warm jacket, holding a wooden walking stick. Papalapapp wears a scarf and a coat.'
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
    prompt: `${S} A book cover: ${F} and ${B} sit together at the entrance of a cozy tiny house nestled between the roots of a giant ancient oak tree in a magical deep forest. The forest glows with soft golden dappled light filtering through an enormous leafy canopy far above. Soft moss covers the ground. Fireflies twinkle in the background. Warm, magical, sleepy atmosphere. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} ${F} sitting up in bed in a cozy small bedroom, rubbing sleepy eyes, looking out a round window. Morning light filters in softly. Outside, a quiet peaceful village, with trees and a few rooftops visible. A dreamy, gentle expression on his face. Patchwork quilt, wooden furniture. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sitting at a kitchen table eating a thick slice of bread with honey, a steaming mug of chamomile tea in front of him. He stares dreamily out the window toward a distant deep green forest. Warm cozy morning kitchen, sunlight streaming in, a honey pot on the table. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${F} talking excitedly to ${P}, who sits on a porch chair holding a coffee cup and smiling warmly. Papalapapp looks surprised and delighted, about to stand up. Morning light on a cozy cottage porch, potted flowers, a warm and friendly scene. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} ${F} wearing a red hat with a long feather, sturdy brown boots, and a warm jacket, holding a wooden walking stick. ${P} wearing a scarf and coat, carrying a small backpack with nuts and berries peeking out. Both stand at the front door of a cozy cottage, ready for a great adventure, cheerful expressions. Cobblestones outside, morning light. ${E}`,
    isOutfitPage: true
  },
  {
    filename: 'page-5.png',
    prompt: `${S} ${F} and ${P} on an epic journey through a succession of magical landscapes — glittering seas, golden deserts, wide rivers, dense ancient forests, and tall mountains. ${OUTFIT} Wide panoramic view showing their tiny figures against vast and beautiful scenery. Trees grow increasingly ancient and enormous as they journey deeper. Warm and adventurous yet calming atmosphere. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} and ${P} standing at the edge of an impossibly ancient and enormous forest. The trees are vast as cathedrals, their trunks wider than houses, canopy far above. The forest floor is covered in soft green moss and the light filters down in long golden shafts. Everything is extraordinarily still and quiet. A tiny handwritten sign on a mossy post at the forest entrance. ${OUTFIT} Wonder on their faces. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-7.png',
    prompt: `${S} A tiny cozy house nestled snugly between the gnarled roots of a massive ancient oak tree. The windows have tiny drawn curtains. ${F} and ${P} crouch down to the tiny doorway and knock gently. The door is just barely opening to reveal ${B} peering out, eyes wide and delighted, fur a bit ruffled and messy from sleeping. Warm lantern light from inside. Moss and small mushrooms around the roots. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-8.png',
    prompt: `${S} Inside a tiny cozy home nestled within oak roots. ${B} proudly shows ${F} and ${P} around his snug little house: a tiny bed of moss and soft leaves, a small wooden cupboard overflowing with acorns and hazelnuts, and a tiny glass lamp glowing warmly like a firefly. ${F} crouches to peer inside with delight. Everything is miniature but perfectly cozy. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-9.png',
    prompt: `${S} ${F} and ${B} playing together outside in the Great Sleep Forest beneath the ancient oak. ${B} dances in cheerful little circles while ${F} traces gentle spiral patterns in the soft green moss with a stick. ${P} sits nearby watching with a warm smile, leaning against the enormous oak trunk. Afternoon golden light through the canopy. Peaceful and playful. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-10.png',
    prompt: `${S} ${B} holding out two small acorns with both tiny paws, offering them to ${F} and ${P} with a wide yawning smile, his eyes beginning to droop sleepily. ${F} cups the acorn gently in both hands and holds it to his ear, eyes wide with wonder. ${P} does the same. The forest is bathed in soft evening light, fireflies beginning to glow. A magical, tender moment. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-11.png',
    prompt: `${S} ${F} and ${P} giving ${B} a warm farewell hug outside his tiny oak-root house. ${B} is barely visible in the hug, his bushy tail curling around them. The forest is quiet and dusky. ${B}'s tiny curtains are already half-drawn. A cozy lantern light glows from inside his house. Tender, warm, peaceful goodbye. ${E}`,
    useOutfitRef: true
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${P} carrying a sleeping ${F} on his back on a forest path at dusk. Firlefanz is fast asleep with a peaceful smile, clutching a small acorn in one fist. The ancient forest trees arch overhead, fireflies twinkle in the blue twilight between the trunks. A warm golden glow is visible far ahead at the end of the path. Dreamy, tender, perfect bedtime scene. ${E}`,
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
    formData.append('model', 'gpt-image-2')
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
      body: JSON.stringify({ model: 'gpt-image-2', prompt: spec.prompt, size: '1536x1024', quality: 'high' }),
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
