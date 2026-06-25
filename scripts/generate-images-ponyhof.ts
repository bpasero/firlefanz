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

const storyDir = path.join(rootDir, 'public/stories/der-ponyhof')
fs.mkdirSync(storyDir, { recursive: true })

const S = "Children's book illustration, soft luminous watercolor style with visible brushstrokes and gentle paper texture. Dreamy, painterly and atmospheric. A warm, calming palette of meadow green, honey gold, butter yellow, soft sky blue, rosy pink and creamy white. Gentle ink outlines, soft warm highlights, a great sense of comfort, warmth and gentle wonder."
const E = 'Gentle, calm, dreamy atmosphere suitable for a soothing bedtime story. No text, words, letters, labels, signs, or writing of any kind anywhere in the image.'
const F = 'Firlefanz is a small, friendly green dragon-like dinosaur creature with a rounded head, big gentle round eyes, a soft rounded snout, and small soft rounded spikes along his back. He has a sweet, innocent, childlike face and is about the size of a small child. There is exactly one Firlefanz in the entire scene — never two.'
const P = 'Papalapapp is the same green dragon-dinosaur species as Firlefanz but clearly larger, rounder and fatherly, with a warm, gentle, wise face. There is exactly one Papalapapp in the entire scene — never two.'
const W = 'Wölkchen is a small, gentle real pony (a little horse, NOT a dragon or dinosaur) with a soft creamy-white coat, a fluffy flowing pale mane and tail, big kind dark eyes, and a sweet calm face. There is exactly one Wölkchen pony as the special pony of the story.'
const H = 'Haferl is a small, round, kind-hearted pony-keeper creature with soft warm brown fur, rosy cheeks, a gentle smiling face and big friendly eyes — a little like a cuddly badger-hedgehog mix. He wears a simple straw hat and a green apron. He is NOT a dragon or dinosaur. There is exactly one Haferl in the scene.'
const OUTFIT = 'a small rounded riding hat, sturdy little riding boots, a warm cozy jacket, carrying a small wooden walking stick and a little shoulder bag with a red apple'
const STYLE_REF = 'style-ref.png'

interface ImageSpec {
  filename: string
  prompt: string
  isStyleRef?: boolean
}

const images: ImageSpec[] = [
  {
    filename: STYLE_REF,
    prompt: `${S} Character reference sheet for a children's storybook, on a clean white background, consistent art style. Top row: ${F} Shown from the front, from the side, and waving cheerfully — wearing a small riding hat, a warm jacket and little riding boots. Next to him ${P} Shown from front and side. Middle row: ${W} shown from front and side, standing calmly. Bottom row: ${H} shown from front and side, holding an apple; and a small still-life of a red apple, a soft brush and a little pony saddle. Clean white background, multiple reference poses. ${E}`,
    isStyleRef: true
  },
  {
    filename: 'cover.png',
    prompt: `${S} A breathtaking, warm, cinematic children's book cover. The most beautiful pony farm in the world spreads across sunny green meadows dotted with colorful flowers, a friendly red barn in the background and gentle hills beyond. In the foreground ${F} wearing a small riding hat and warm jacket stands joyfully beside ${W}, gently petting the pony's soft nose. ${H} smiles nearby holding an apple, and a few other ponies graze peacefully in the distance. ${P} watches warmly. Joyful, magical, inviting and full of warm golden light. ${E}`
  },
  {
    filename: 'page-1.png',
    prompt: `${S} Inside Firlefanz's cozy little bedroom on a bright, fresh morning. ${F} has just woken and sits up in his small wooden bed, stretching with a happy sleepy smile as birds sing outside the open window and a gentle breeze stirs the meadow grass beyond. Soft, snug, tender mood in honey and cream tones. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is Firlefanz himself — any toys in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine), so there is never a second little dragon figure. ${E}`
  },
  {
    filename: 'page-2.png',
    prompt: `${S} ${F} sits at his small wooden kitchen table eating a slice of red apple and a warm bread roll, with a cup of fresh milk beside him, gazing dreamily into the air as if imagining a pony. Tiny dream-like wisps showing a faint soft white pony and a green meadow float gently above his head. Warm cozy kitchen interior in soft honey and green tones, a calm happy feeling. ${E}`
  },
  {
    filename: 'page-3.png',
    prompt: `${S} ${P} sits in a comfy wooden chair in front of his little cottage, holding a steaming cup of morning coffee, smiling warmly. ${F} stands before him talking eagerly with wide sparkling eyes and a big excited smile, gesturing as if describing a pony. A calm, sunny, peaceful morning in the small village, soft golden light. ${E}`
  },
  {
    filename: 'page-4.png',
    prompt: `${S} Inside the cozy cottage. ${F} is now dressed for a journey to the pony farm in ${OUTFIT} — wearing his small riding hat, warm jacket and little riding boots, holding his wooden walking stick, proudly showing a shiny red apple he will give to the pony. ${P} stands beside him smiling. Warm golden morning light fills the snug room. Cheerful, loving, anticipatory mood. ${E}`
  },
  {
    filename: 'page-5.png',
    prompt: `${S} An epic, sweeping wide landscape vista. ${F} dressed in ${OUTFIT}, and ${P} walk together as tiny figures across a vast, magical, varied world — shimmering blue seas, golden sand deserts, tall green mountains, winding rivers and rustling forests — all beneath a warm, bright, gentle sky with soft fluffy clouds. Grand sense of journey, adventure and gentle wonder. ${E}`
  },
  {
    filename: 'page-6.png',
    prompt: `${S} ${F} dressed in ${OUTFIT}, and ${P} stand on a gentle grassy rise, gazing in delight at the most beautiful pony farm in the world spread out below them — lush green meadows where many gentle ponies graze with manes blowing in the wind, a friendly red barn glowing in warm sunshine, and colorful flowers everywhere. Lush, inviting, magical and warm light. ${E}`
  },
  {
    filename: 'page-7.png',
    prompt: `${S} At the sunny pony farm. ${H} greets warmly with a wide friendly smile, wearing his straw hat and green apron full of apples. He gently introduces ${F} dressed in ${OUTFIT} to ${W}, the soft creamy-white pony with a fluffy mane, who nuzzles Firlefanz's nose tenderly. ${P} stands warmly behind. Green meadow, other ponies grazing softly in the background. A warm, joyful meeting of new friends. ${E}`
  },
  {
    filename: 'page-8.png',
    prompt: `${S} On the green meadow of the pony farm. ${F} (wearing his riding hat) gently holds out a red apple to ${W}, who happily nibbles it. Then ${H} carefully helps Firlefanz up onto the soft saddle on Wölkchen's back, steadying him kindly. Firlefanz holds the pony's fluffy mane with a thrilled, beaming smile. Warm, tender, encouraging mood in soft sunlight. ${E}`
  },
  {
    filename: 'page-9.png',
    prompt: `${S} ${F} (wearing his riding hat) rides happily on the back of ${W}, the gentle white pony, stepping softly across a lush green meadow dotted with blooming flowers, past a sparkling little brook. The wind ruffles Firlefanz's ears, the pony trots gently in warm sunshine, and Firlefanz beams with pure joy as if flying. ${H} walks alongside smiling. Joyful, free, sunlit scene. ${E}`
  },
  {
    filename: 'page-10.png',
    prompt: `${S} Under a big shady tree on the pony farm meadow. ${F} lovingly brushes ${W}'s soft white mane with a little brush until it shines, and offers fresh hay. A few other gentle ponies come closer, curiously sniffing. Firlefanz leans contentedly against the warm pony, looking up at soft fluffy clouds. ${P} and ${H} rest nearby. Peaceful, satisfied, golden afternoon mood. ${E}`
  },
  {
    filename: 'page-11.png',
    prompt: `${S} Golden sunset over the pony farm — the sky glows pink and orange, the sun sinking low behind the green hills. ${F} dressed in ${OUTFIT} hugs ${W} the white pony gently goodbye, everyone smiling warmly. ${H} waves kindly with his straw hat, and ${P} stands ready to head home. Tender, heartfelt farewell in warm rosy sunset light. ${E}`
  },
  {
    filename: 'page-12.png',
    prompt: `${S} ${F}'s cozy little bedroom at night, warm and snug. ${F} is tucked sweetly into his bed under a soft blanket, eyes gently closed, fast asleep with a peaceful happy smile, hugging a soft teddy bear. The first stars glow through the window. Faint, soft dreamy wisps of mist curl above him hinting only at a gentle white pony, soft flowing manes and a green meadow — exactly ONE small pony in the dream wisps and NO other creatures or characters. A starry night sky through the window. Deeply calm, warm, tender, sleep-inducing bedtime mood. IMPORTANT: the only dragon-dinosaur creature anywhere in the image is the single sleeping Firlefanz himself — there must be exactly ONE Firlefanz in the whole picture (no second Firlefanz in any dream or thought bubble), and any toys in the room must NOT be dragons or dinosaurs (a soft teddy bear or a cloth bunny is fine). ${E}`
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
