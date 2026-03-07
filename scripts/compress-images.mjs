/**
 * Generate compressed mobile WebP variants of story images.
 *
 * Usage:
 *   node scripts/compress-images.mjs [story-id]
 *
 * If no story-id is given, all stories are processed.
 *
 * Generates `<name>-mobile.webp` alongside each `.png` file:
 *   - Max 800px wide (preserving aspect ratio)
 *   - WebP at quality 82 — good visual quality, 90%+ smaller than source PNG
 *
 * The app automatically serves mobile variants on narrow screens or slow connections.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const storiesDir = path.join(rootDir, 'public/stories');

const MOBILE_MAX_WIDTH = 800;
const WEBP_QUALITY = 82;

async function compressImage(inputPath) {
  const outputPath = inputPath.replace(/\.png$/, '-mobile.webp');
  await sharp(inputPath)
    .resize({ width: MOBILE_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);

  const inputSize = fs.statSync(inputPath).size;
  const outputSize = fs.statSync(outputPath).size;
  const saved = ((1 - outputSize / inputSize) * 100).toFixed(0);
  const inputMB = (inputSize / 1024 / 1024).toFixed(1);
  const outputKB = (outputSize / 1024).toFixed(0);
  console.log(`  ${path.basename(inputPath)} → ${path.basename(outputPath)} (${inputMB}MB → ${outputKB}KB, -${saved}%)`);
}

async function processStory(storyDir) {
  const storyName = path.basename(storyDir);
  const images = fs.readdirSync(storyDir).filter((f) => f.endsWith('.png'));

  if (images.length === 0) return;

  console.log(`\nProcessing: ${storyName} (${images.length} images)`);
  for (const img of images) {
    await compressImage(path.join(storyDir, img));
  }
}

const targetId = process.argv[2];
let storyDirs;

if (targetId) {
  const dir = path.join(storiesDir, targetId);
  if (!fs.existsSync(dir)) {
    console.error(`Story not found: ${targetId}`);
    process.exit(1);
  }
  storyDirs = [dir];
} else {
  storyDirs = fs
    .readdirSync(storiesDir)
    .filter((d) => {
      const full = path.join(storiesDir, d);
      return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, 'story.json'));
    })
    .map((d) => path.join(storiesDir, d));
}

console.log(`Generating mobile WebP variants (max ${MOBILE_MAX_WIDTH}px, quality ${WEBP_QUALITY})...`);

for (const dir of storyDirs) {
  await processStory(dir);
}

console.log('\nDone!');
