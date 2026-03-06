import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8');
const apiKey = envContent.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) { console.error('Missing OPENAI_API_KEY in .env'); process.exit(1); }

const storyDir = path.join(rootDir, 'public/stories/am-ende-der-welt');
fs.mkdirSync(storyDir, { recursive: true });

const S = "Children's book illustration, soft watercolor style, warm calming colors.";
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text in the image.';
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature';
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly';
const G = 'Glimmi is a tiny fluffy star-shaped creature with big friendly eyes and small wings, softly glowing';

const images = [
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} standing at the edge of a cliff, looking out at a vast shimmering colorful nebula of pink, gold and light blue. Stars grow like flowers. A tiny glowing star creature floats nearby. Magical, dreamy. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} in bed, looking out a window at an endless blue sky stretching to the horizon. Morning light, cozy small bedroom. Wondering expression. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} at a small kitchen table eating jam bread and drinking warm milk with honey. Cozy kitchen, warm light, thoughtful expression. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} visiting ${P} who sits in a cozy armchair drinking coffee. Warm living room. Papalapapp smiles warmly, about to stand up to join the adventure. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} wearing a green hat, boots, warm jacket, holding a walking stick. ${P} wears a scarf and holds a bag of cookies. Both standing at the door, ready for adventure. ${E}` },
  { filename: 'page-5.png', prompt: `${S} ${F} and ${P} on an epic journey across a fantasy landscape. Sparkling golden desert, mountains with clouds you can touch, gentle waves, blooming meadows. Birds overhead, warm sunset colors. Peaceful and vast. ${E}` },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} walking through a magical landscape where the sky has turned soft purple and the grass shimmers silver. Tiny glowing fireflies dance around them, lighting the path. Dreamy, ethereal atmosphere. ${E}` },
  { filename: 'page-7.png', prompt: `${S} ${F} and ${P} standing at a gentle cliff edge, looking out at a vast shimmering mist glowing in pink, gold and light blue colors. The edge of the world. Breathtaking, magical, serene. ${E}` },
  { filename: 'page-8.png', prompt: `${S} ${G} emerging from colorful shimmering mist, greeting ${F} and ${P}. Glimmi is tiny and fluffy and glows softly. Friendly meeting, magical setting at the edge of the world. ${E}` },
  { filename: 'page-9.png', prompt: `${S} A magical place at the edge of the world: soft glowing clouds float like cushions, tiny stars grow from the ground like flowers making gentle tinkling sounds. ${F}, ${P} and ${G} exploring together. Pastel colors, dreamy. ${E}` },
  { filename: 'page-10.png', prompt: `${S} ${F}, ${P} and ${G} sitting together on a softly glowing cloud, eating cookies. The sky transitions from deep blue to pink to gold. Stars bloom around them. Peaceful, warm, magical. ${E}` },
  { filename: 'page-11.png', prompt: `${S} ${F} asleep leaning against ${P}, holding a tiny glowing star in his hand. Walking home under a dark sky full of stars. ${G} waves goodbye in the distance. Very peaceful, sleepy, the little star glows softly. ${E}` },
];

async function generate(spec) {
  console.log(`Generating ${spec.filename}...`);
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-1', prompt: spec.prompt, size: '1536x1024', quality: 'medium' }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image in response');
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(path.join(storyDir, spec.filename), buf);
  console.log(`  Saved ${spec.filename} (${(buf.length / 1024).toFixed(0)} KB)`);
}

for (const spec of images) {
  try { await generate(spec); } catch (e) { console.error(`  FAILED: ${e.message}`); }
  await new Promise(r => setTimeout(r, 2000));
}
console.log('\nDone!');
