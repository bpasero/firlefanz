import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8');
const apiKey = envContent.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) { console.error('Missing OPENAI_API_KEY in .env'); process.exit(1); }

const storyDir = path.join(rootDir, 'public/stories/das-tal-der-sanften-riesen');
fs.mkdirSync(storyDir, { recursive: true });

const S = "Children's book illustration, soft watercolor style, warm calming colors.";
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text in the image.';
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature with a slim, slender build';
const P = 'Papalapapp is the same species as Firlefanz but taller and fatherly, with a normal slim build';
const M = 'Mummel is an enormous gentle giant creature as big as a house, with soft golden-brown fluffy fur, small round ears, large peaceful sleepy eyes, and a warm, calm expression — gigantic but completely harmless';
const OUTFIT = 'Firlefanz wears a green hat, brown boots, and a warm jacket, holding a wooden walking stick. Papalapapp wears a scarf and carries a bag of cookies.';
const OUTFIT_PAGE = 'page-4.png';

const images = [
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} and ${P} standing at the rim of a lush deep green valley, looking down in wonder. Far below, a soft golden hill of fur — ${M} — can be glimpsed sleeping peacefully among enormous trees and giant flowers. Warm, inviting, magical. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} in bed, stretching happily. Morning sunlight through the window, birds on a branch outside. Cozy small bedroom, warm golden light. Thoughtful, curious expression. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} at a small kitchen table eating jam bread and drinking warm milk with honey. Warm cozy kitchen, morning light. Thoughtful expression, chin resting on one hand. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} visiting ${P} who sits in a cozy armchair drinking coffee. Warm living room. Papalapapp smiles warmly and is about to stand up to join the adventure. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} wearing a green hat, brown boots, warm jacket, holding a walking stick. ${P} with a scarf and a bag of cookies. Both standing at the door, ready for adventure. ${E}`, isOutfitPage: true },
  { filename: 'page-5.png', prompt: `${S} ${F} and ${P} on an epic journey across a vast fantasy landscape. ${OUTFIT} Golden sparkling seas, sugar-sand deserts, mountains touching clouds, blooming meadows. Wide panoramic view, warm sunset colors, sense of great distance. ${E}`, useOutfitRef: true },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} standing at the grassy rim of a deep, lush green valley, peering down. ${OUTFIT} The valley is vast and still, filled with mist and enormous trees. Sense of wonder and quiet anticipation. ${E}`, useOutfitRef: true },
  { filename: 'page-7.png', prompt: `${S} Inside a magical valley with trees as tall as houses and flowers as big as umbrellas. ${F} and ${P} walk among them in awe. ${OUTFIT} Behind the largest tree, a huge soft golden-brown shape — like a hill of fur — lies sleeping. Dreamy, lush, enchanting scale. ${E}`, useOutfitRef: true },
  { filename: 'page-8.png', prompt: `${S} ${M} slowly opening one enormous eye, then the other. ${F} and ${P} stand before him, tiny in comparison. ${OUTFIT} Mummel looks gentle and surprised, not frightening at all. Warm golden light, magical scale difference. ${E}`, useOutfitRef: true },
  { filename: 'page-9.png', prompt: `${S} ${F} and ${P} talking with ${M} who lies peacefully on the ground, head resting on his enormous paws. ${OUTFIT} Mummel listens with wide, gentle eyes. Cozy valley setting, warm afternoon light filtering through giant trees. ${E}`, useOutfitRef: true },
  { filename: 'page-10.png', prompt: `${S} ${F} and ${P} sitting on ${M}'s enormous soft paw, sharing cookies together. ${OUTFIT} Mummel gazes up at the clouds with a peaceful smile. Magical scale, cozy and warm. Soft afternoon light. ${E}`, useOutfitRef: true },
  { filename: 'page-11.png', prompt: `${S} ${F} asleep leaning against ${P}, being carried home under a starry sky. ${OUTFIT} In the distance, ${M} waves one enormous gentle paw in farewell from the valley below. The scene is peaceful, sleepy, and warm. ${E}`, useOutfitRef: true },
];

async function generate(spec, referenceImagePath = null) {
  console.log(`Generating ${spec.filename}...`);
  let res;
  if (referenceImagePath && fs.existsSync(referenceImagePath)) {
    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', spec.prompt);
    formData.append('size', '1536x1024');
    formData.append('quality', 'high');
    const imageData = fs.readFileSync(referenceImagePath);
    formData.append('image', new Blob([imageData], { type: 'image/png' }), 'reference.png');
    res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData,
    });
  } else {
    res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1', prompt: spec.prompt, size: '1536x1024', quality: 'high' }),
    });
  }
  if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image in response');
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(path.join(storyDir, spec.filename), buf);
  console.log(`  Saved ${spec.filename} (${(buf.length / 1024).toFixed(0)} KB)`);
}

let outfitRefPath = null;
for (const spec of images) {
  try {
    await generate(spec, spec.useOutfitRef ? outfitRefPath : null);
    if (spec.isOutfitPage) {
      outfitRefPath = path.join(storyDir, OUTFIT_PAGE);
    }
  } catch (e) { console.error(`  FAILED: ${e.message}`); }
  await new Promise(r => setTimeout(r, 2000));
}
console.log('\nDone!');
