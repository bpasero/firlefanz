import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Load .env
const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8');
function envVar(name) {
  return envContent.match(new RegExp(`${name}=(.+)`))?.[1]?.trim();
}

// Pick provider from CLI arg: --provider=openai or --provider=google (default: openai)
const provider = process.argv.find(a => a.startsWith('--provider='))?.split('=')[1] || 'openai';

// --- Provider implementations ---

async function generateWithOpenAI(prompt, outPath) {
  const apiKey = envVar('OPENAI_API_KEY');
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY in .env');

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1536x1024',
      quality: 'medium',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image in response: ${JSON.stringify(data)}`);

  const buffer = Buffer.from(b64, 'base64');
  fs.writeFileSync(outPath, buffer);
  return buffer.length;
}

async function generateWithGoogle(prompt, outPath) {
  const apiKey = envVar('VITE_GOOGLE_AI_API_KEY');
  if (!apiKey) throw new Error('Missing VITE_GOOGLE_AI_API_KEY in .env');

  const model = 'gemini-3.1-flash-image-preview';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: '3:2', imageSize: '2K' },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!imagePart) throw new Error(`No image in response: ${JSON.stringify(data)}`);

  const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
  fs.writeFileSync(outPath, buffer);
  return buffer.length;
}

const generators = { openai: generateWithOpenAI, google: generateWithGoogle };

// --- Image prompts ---

const STYLE_PREFIX = 'Children\'s book illustration, soft watercolor style, warm calming colors.';
const STYLE_SUFFIX = 'Gentle, cozy atmosphere suitable for a bedtime story. No text in the image.';
const FIRLEFANZ_DESC = 'Firlefanz is a small friendly green dragon/dinosaur creature';
const PAPERLAPAPP_DESC = 'Papalapapp is the same species as Firlefanz but larger and fatherly';
const GOLDI_DESC = 'Goldi is a golden-furred ape with big friendly eyes';

const storyDir = path.join(rootDir, 'public/stories/goldi-im-labyrinth');

const images = [
  {
    filename: 'cover.png',
    prompt: `${STYLE_PREFIX} A book cover scene: ${FIRLEFANZ_DESC} standing in front of a tall magical green hedge labyrinth. The labyrinth entrance glows softly with warm lantern light. A golden ape peeks out from inside the maze, waving. Title area at the top. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-1.png',
    prompt: `${STYLE_PREFIX} ${FIRLEFANZ_DESC} waking up in a cozy small bedroom, stretching in a little bed. Morning sunlight streams through a window. The room is warm and inviting with simple wooden furniture. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-2.png',
    prompt: `${STYLE_PREFIX} ${FIRLEFANZ_DESC} sitting at a small kitchen table eating bread with honey and drinking hot cocoa from a mug. A cozy, tiny kitchen with warm light. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-3.png',
    prompt: `${STYLE_PREFIX} ${FIRLEFANZ_DESC} visiting ${PAPERLAPAPP_DESC} who is sitting at a kitchen table drinking coffee. They are in Papalapapp's cozy house. Papalapapp looks welcoming and wise. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-4.png',
    prompt: `${STYLE_PREFIX} ${FIRLEFANZ_DESC} wearing a green hat, thick walking boots, a warm jacket, and holding a wooden walking stick. Standing proudly at the door, ready for an adventure. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-5.png',
    prompt: `${STYLE_PREFIX} ${FIRLEFANZ_DESC} and ${PAPERLAPAPP_DESC} walking together through a vast fantasy landscape. Rolling mountains, a desert, forests, and a sparkling sea are all visible in the distance. Birds fly overhead. An epic but peaceful journey scene. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-6.png',
    prompt: `${STYLE_PREFIX} ${FIRLEFANZ_DESC} and ${PAPERLAPAPP_DESC} standing in front of a towering hedge labyrinth. The hedges are thick and green, reaching high into the sky. The entrance looks mysterious but inviting with warm light glowing from inside. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-7.png',
    prompt: `${STYLE_PREFIX} ${FIRLEFANZ_DESC} and ${PAPERLAPAPP_DESC} walking through a hedge maze corridor. Colorful paper lanterns hang on the hedge walls, lighting the path. Butterflies flutter around them. Flowers grow along the base of the hedges. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-8.png',
    prompt: `${STYLE_PREFIX} ${FIRLEFANZ_DESC} hugging ${GOLDI_DESC}. Goldi has just swung down from a hedge. They look very happy to see each other. ${PAPERLAPAPP_DESC} watches warmly in the background. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-9.png',
    prompt: `${STYLE_PREFIX} A magical secret garden in the center of a labyrinth. There is a treehouse in a large tree, a small pond with colorful fish, and fairy lights hanging everywhere. ${FIRLEFANZ_DESC}, ${PAPERLAPAPP_DESC}, and ${GOLDI_DESC} sitting together eating fruit. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-10.png',
    prompt: `${STYLE_PREFIX} ${FIRLEFANZ_DESC} and ${GOLDI_DESC} playing hide and seek in a hedge maze. The sun is setting, casting a warm golden-orange glow. Playful and gentle scene. ${PAPERLAPAPP_DESC} watches from a bench, smiling. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'page-11.png',
    prompt: `${STYLE_PREFIX} ${FIRLEFANZ_DESC} sleepily leaning against ${PAPERLAPAPP_DESC} while walking home under a silver moon and twinkling stars. A calm night scene with a gentle path ahead. ${GOLDI_DESC} waves goodbye from far behind. Very peaceful and sleepy atmosphere. ${STYLE_SUFFIX}`,
  },
];

// --- Main ---

async function main() {
  const generate = generators[provider];
  if (!generate) {
    console.error(`Unknown provider: ${provider}. Use --provider=openai or --provider=google`);
    process.exit(1);
  }

  console.log(`Using provider: ${provider}\n`);
  fs.mkdirSync(storyDir, { recursive: true });

  for (const imageSpec of images) {
    const outPath = path.join(storyDir, imageSpec.filename);
    console.log(`Generating ${imageSpec.filename}...`);
    try {
      const size = await generate(imageSpec.prompt, outPath);
      console.log(`  Saved ${outPath} (${(size / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\nDone!');
}

main();
