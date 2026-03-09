// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/**
 * Generates per-page audio files for a story using OpenAI TTS.
 * Usage: npx tsx scripts/generate-audio.ts <story-id> [lang|all] [voice]
 *
 * One TTS call is made per page for reliable sync. Story context
 * (title, page number, character names) is passed in the instructions
 * so the model maintains consistent tone and voice across pages.
 *
 * lang defaults to 'de'. Pass 'all' to generate for all available languages.
 * Audio files are saved as: public/stories/<id>/audio-<lang>-page-<N>.mp3
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { Story } from '../src/types/story.ts'

const storyId = process.argv[2]
const langArg = process.argv[3] ?? 'de'
const voiceArg = process.argv[4] ?? null

if (!storyId) {
  console.error('Usage: npx tsx scripts/generate-audio.ts <story-id> [lang|all] [voice]')
  console.error('Voices: alloy, echo, fable, onyx, nova, shimmer')
  process.exit(1)
}

// Load API key
let apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  try {
    const env = readFileSync('.env', 'utf-8')
    const match = env.match(/OPENAI_API_KEY=(.+)/)
    if (match) apiKey = match[1].trim()
  } catch { /* ignore */ }
}
if (!apiKey) { console.error('No OPENAI_API_KEY found'); process.exit(1) }

const storyPath = join('public', 'stories', storyId, 'story.json')
if (!existsSync(storyPath)) {
  console.error(`Story not found: ${storyPath}`)
  process.exit(1)
}

const story: Story = JSON.parse(readFileSync(storyPath, 'utf-8'))

function getPageTexts(lang: string): string[] {
  if (lang === 'de') {
    return story.pages.map((p) => p.text.join(' '))
  }
  const t = story.translations?.[lang]
  if (!t) throw new Error(`No translation for language: ${lang}`)
  return t.pages.map((p) => p.text.join(' '))
}

function getTitle(lang: string): string {
  if (lang === 'de') return story.title
  return story.translations?.[lang]?.title ?? story.title
}

const langs = langArg === 'all'
  ? ['de', ...Object.keys(story.translations ?? {})]
  : [langArg]

const VOICE = voiceArg ?? 'fable'
const MODEL = 'gpt-4o-mini-tts'
const SPEED = 1.0

const LANG_INSTRUCTIONS: Record<string, string> = {
  de: 'Speak in German with a native German accent. You are a warm, calm storyteller reading a kids\' fantasy bedtime storybook to young children aged 3–6. The stories follow Firlefanz, a whimsical dragon-like creature, and his father Papalapapp, on magical adventures through fantastical lands. Read with gentle wonder, bringing the imaginative world to life while keeping the tone soothing and sleep-inducing. Use slightly different voices for dialogue to make characters distinguishable, but stay soft and calming throughout.',
  en: 'Speak in English with a native English accent. You are a warm, calm storyteller reading a kids\' fantasy bedtime storybook to young children aged 3–6. The stories follow Firlefanz, a whimsical dragon-like creature, and his father Papalapapp, on magical adventures through fantastical lands. Read with gentle wonder, bringing the imaginative world to life while keeping the tone soothing and sleep-inducing. Use slightly different voices for dialogue to make characters distinguishable, but stay soft and calming throughout.',
}

function getInstructions(lang: string, title: string, pageNum: number, totalPages: number): string {
  const base = LANG_INSTRUCTIONS[lang] ?? `Speak in the language of the provided text with a native accent. You are a warm, calm storyteller reading a kids' fantasy bedtime storybook to young children aged 3–6. The stories follow Firlefanz, a whimsical dragon-like creature, and his father Papalapapp, on magical adventures through fantastical lands. Read with gentle wonder, bringing the imaginative world to life while keeping the tone soothing and sleep-inducing. Use slightly different voices for dialogue to make characters distinguishable, but stay soft and calming throughout.`
  return `${base} Story: "${title}". This is page ${pageNum} of ${totalPages} — maintain the same narrator voice and pacing as the rest of the story.`
}

async function generatePageAudio(text: string, instructions: string): Promise<Buffer> {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, voice: VOICE, input: text, speed: SPEED, instructions }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`TTS API error: ${res.status} ${err}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

const outDir = join('public', 'stories', storyId)

for (const lang of langs) {
  console.log(`\nGenerating audio for language: ${lang}`)

  let pageTexts: string[]
  try {
    pageTexts = getPageTexts(lang)
  } catch (e) {
    console.error(`  ${(e as Error).message}, skipping`)
    continue
  }

  const title = getTitle(lang)
  const totalPages = pageTexts.length

  for (let i = 0; i < pageTexts.length; i++) {
    const pageNum = i + 1
    const outPath = join(outDir, `audio-${lang}-page-${pageNum}.mp3`)

    if (existsSync(outPath)) {
      console.log(`  Page ${pageNum}/${totalPages}: already exists, skipping`)
      continue
    }

    const text = pageTexts[i]
    const instructions = getInstructions(lang, title, pageNum, totalPages)

    process.stdout.write(`  Page ${pageNum}/${totalPages}: generating... `)
    try {
      const audio = await generatePageAudio(text, instructions)
      writeFileSync(outPath, audio)
      console.log(`done (${(audio.length / 1024).toFixed(0)} KB)`)
    } catch (e) {
      console.error(`error - ${(e as Error).message}`)
    }
  }
}

console.log('\nDone!')
