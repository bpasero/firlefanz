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

const storyDir = path.join(rootDir, 'public/stories/der-zauberwald')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft watercolor style, warm calming colors."
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. There is exactly ONE Firlefanz and exactly ONE Papalapapp in the scene, never more than one of each. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature (not human, no specific gender)'
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly'
const K = 'Knorr is an ancient, enormous talking oak tree with deeply furrowed bark and a gentle, kind-hearted old face formed naturally in its thick trunk'
const SP = 'Spross is a small, young, thin sapling tree with only a few trembling leaves and a shy little face in its slender trunk'
const OUTFIT = 'Firlefanz wears a green hat, sturdy brown boots, and a warm jacket, holding a wooden walking stick. Papalapapp wears a scarf and carries a small bag of nuts.'
const OUTFIT_PAGE = 'page-4.png'

interface ImageSpec {
  filename: string
  prompt: string
  isOutfitPage?: boolean
  useOutfitRef?: boolean
}

const images: ImageSpec[] = [
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} standing at the edge of a magical glowing forest, looking up in wonder at huge ancient trees with gentle kind faces in their trunks. Warm golden light filters through the green leaves. Magical, inviting, dreamy. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} just waking up and stretching in a cozy small bedroom, warm morning light falling through a small window. Sleepy, happy, curious expression. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} sitting at a kitchen table eating honey bread and drinking warm tea, looking out the window into a garden, daydreaming about a magical forest. Cozy, quiet morning. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} visiting ${P} who sits cozily in front of his little house drinking morning coffee from a cup. A small village setting. Warm, friendly conversation between the two. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} wearing a green hat, sturdy boots and a warm jacket, holding a walking stick. ${P} tying on a scarf and holding a small bag of nuts. Both at the door, ready for a long journey. ${E}`, isOutfitPage: true },
  { filename: 'page-5.png', prompt: `${S} ${F} and ${P} on an epic journey through a vast landscape — over seas, deserts, high mountains, rushing rivers and blooming meadows, with butterflies fluttering around. ${OUTFIT} Wide, sweeping landscape view, gentle and peaceful. ${E}`, useOutfitRef: true },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} standing at the edge of a huge, old, quiet forest. The trees are enormous with gnarled branches and thick green crowns. ${OUTFIT} Still, slightly mysterious but peaceful mood, soft light. ${E}`, useOutfitRef: true },
  { filename: 'page-7.png', prompt: `${S} ${F} and ${P} looking up in wonder at ${K}. The ancient oak's kind old face is gently visible in its trunk, smiling down at them. A soft wind moves the leaves. ${OUTFIT} Magical, warm, welcoming. ${E}`, useOutfitRef: true },
  { filename: 'page-8.png', prompt: `${S} ${F} and ${P} surrounded by friendly talking trees with gentle faces — a slender giggling birch, a plump beech, soft singing fir trees. To the side stands ${SP}, looking shy and quiet. ${OUTFIT} Whimsical, cozy forest scene. ${E}`, useOutfitRef: true },
  { filename: 'page-9.png', prompt: `${S} ${F} sitting in soft green moss right beside ${SP}, talking gently and kindly to the little shy sapling, encouraging it. Tender, warm, heartfelt moment. ${OUTFIT} ${E}`, useOutfitRef: true },
  { filename: 'page-10.png', prompt: `${S} ${F} and ${P} in the forest at golden sunset, the sun sinking between the tree trunks and turning everything warm gold. The big trees with gentle faces gently hum together. ${OUTFIT} Peaceful, magical evening glow. ${E}`, useOutfitRef: true },
  { filename: 'page-11.png', prompt: `${S} The whole forest singing softly together at dusk — ${K}, a birch, beeches and firs, and little ${SP} joining in. ${F} smiles happily beside the little sapling. ${P} nearby. ${OUTFIT} Warm, glowing, musical bedtime atmosphere. ${E}`, useOutfitRef: true },
  { filename: 'page-12.png', prompt: `${S} ${F} walking home in the evening, very sleepy, leaning against ${P} with eyes half closed, holding a single little leaf as a keepsake. Sleeping animals — squirrels, birds — tucked in the calm forest behind them. ${OUTFIT} Soft moonlit, dreamy, peaceful ending. ${E}`, useOutfitRef: true },
]

async function generate(spec: ImageSpec, referenceImagePath: string | null = null): Promise<void> {
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
  fs.writeFileSync(path.join(storyDir, spec.filename), buf)
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
