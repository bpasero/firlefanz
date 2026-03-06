import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8');
const apiKey = envContent.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) { console.error('Missing OPENAI_API_KEY in .env'); process.exit(1); }

const storyDir = path.join(rootDir, 'public/stories/die-stadt-der-vergessenen-spielzeuge');
fs.mkdirSync(storyDir, { recursive: true });

const S = "Children's book illustration, soft watercolor style, warm calming colors.";
const E = 'Gentle, cozy, dreamy atmosphere suitable for a bedtime story. No text in the image.';
const F = 'Firlefanz is a small friendly green dragon/dinosaur creature';
const P = 'Papalapapp is the same species as Firlefanz but larger and fatherly';
const B = 'Brummel is a large old teddy bear with thin fur in places, tiny glasses, and a warm smile';

const images = [
  { filename: 'cover.png', prompt: `${S} A book cover: ${F} standing at the entrance of a tiny colorful city made of building blocks, paper roofs, and marble streets. An old teddy bear with glasses welcomes him. Toys peek from windows. Magical, warm, inviting. ${E}` },
  { filename: 'page-1.png', prompt: `${S} ${F} in bed, looking up at the ceiling. Morning light. A faint sound from the attic above. Curious expression, cozy small bedroom. ${E}` },
  { filename: 'page-2.png', prompt: `${S} ${F} on a dusty attic, surrounded by old boxes and draped cloths. He holds a small red wooden toy train with chipped paint. Warm light from a small window. Wonder and curiosity. ${E}` },
  { filename: 'page-3.png', prompt: `${S} ${F} at a kitchen table eating honey bread and drinking warm milk. A small red wooden toy train sits next to his plate. Cozy kitchen, warm morning light, thoughtful expression. ${E}` },
  { filename: 'page-4.png', prompt: `${S} ${F} visiting ${P} in a cozy living room. Papalapapp sits in an armchair with coffee, examining a small red wooden toy train. Warm, friendly atmosphere. Papalapapp about to stand up. ${E}` },
  { filename: 'page-5.png', prompt: `${S} ${F} wearing green hat, boots, jacket, holding walking stick. ${P} with scarf and bag of cookies. Both at the door ready for adventure. Firlefanz has a small bag with the toy train inside. ${E}` },
  { filename: 'page-6.png', prompt: `${S} ${F} and ${P} on an epic journey through a fantasy landscape. Along the path are small lost items: a colored pencil, a marble, a tiny doll shoe. Golden desert, mountains, gentle waves, blooming meadows. Warm sunset colors. ${E}` },
  { filename: 'page-7.png', prompt: `${S} A magical tiny city behind a gentle hill, nestled between ancient trees. Houses made of colorful building blocks, roofs of bright paper, streets paved with glass marbles. Warm glowing lights in windows. Enchanting, miniature, cozy. ${E}` },
  { filename: 'page-8.png', prompt: `${S} ${B} standing at a small city gate made of stacked building blocks. He wears tiny round glasses and has a warm smile. His fur is worn but lovable. ${F} and ${P} arrive, looking up at him. Welcoming atmosphere. ${E}` },
  { filename: 'page-9.png', prompt: `${S} A lively toy town square. Stuffed animals run a small shop trading buttons and ribbons. Wooden figures play tag in a small plaza. An old doll with one shoe reads stories to smaller toys. ${F}, ${P} and ${B} walking through. Charming, bustling, warm. ${E}` },
  { filename: 'page-10.png', prompt: `${S} ${F} holding out a small red wooden toy train to ${B}. Brummel looks at it with tears of joy in his eyes, gently taking it in his paws. Emotional, warm reunion moment. Soft lighting. ${E}` },
  { filename: 'page-11.png', prompt: `${S} ${F}, ${P}, ${B} and various toys sitting together on a town square, sharing cookies. A small red toy train circles around them happily. Toys singing together. Warm evening light, cozy, communal. ${E}` },
  { filename: 'page-12.png', prompt: `${S} ${P} carrying sleeping ${F} on his back, walking home under a starry sky. ${B} waves goodbye from the toy city gate in the background. Firlefanz holds a tiny wooden cube in his hand. Peaceful, sleepy, the toy city glows warmly behind them. ${E}` },
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
