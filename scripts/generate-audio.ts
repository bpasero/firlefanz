// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/**
 * Generates per-page audio files for a story using OpenAI TTS.
 * Usage: npx tsx scripts/generate-audio.ts <story-id> [lang|all] [voice]
 *
 * The entire story is narrated in a single TTS call for consistent tone,
 * then split into per-page files using Whisper word-level timestamps + ffmpeg.
 *
 * IMPORTANT: Story text must not exceed 4096 characters per language.
 *
 * lang defaults to 'de'. Pass 'all' to generate for all available languages.
 * Audio files are saved as: public/stories/<id>/audio-<lang>-page-<N>.mp3
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import type { Story } from '../src/types/story.ts'

const MAX_INPUT_CHARS = 4096
const PAGE_SEPARATOR = '\n\n'

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

const langs = langArg === 'all'
  ? ['de', ...Object.keys(story.translations ?? {})]
  : [langArg]

const VOICE = voiceArg ?? 'fable'
const MODEL = 'gpt-4o-mini-tts'
const SPEED = 1.0

const LANG_INSTRUCTIONS: Record<string, string> = {
  de: 'Speak in German with a native German accent. You are a warm, calm storyteller reading a kids\' fantasy bedtime storybook to young children aged 3–6. The stories follow Firlefanz, a whimsical dragon-like creature, on magical adventures through fantastical lands. Read with gentle wonder, bringing the imaginative world to life while keeping the tone soothing and sleep-inducing. Use slightly different voices for dialogue to make characters distinguishable, but stay soft and calming throughout.',
  en: 'Speak in English with a native English accent. You are a warm, calm storyteller reading a kids\' fantasy bedtime storybook to young children aged 3–6. The stories follow Firlefanz, a whimsical dragon-like creature, on magical adventures through fantastical lands. Read with gentle wonder, bringing the imaginative world to life while keeping the tone soothing and sleep-inducing. Use slightly different voices for dialogue to make characters distinguishable, but stay soft and calming throughout.',
}

function getInstructions(lang: string): string {
  return LANG_INSTRUCTIONS[lang] ?? `Speak in the language of the provided text with a native accent. You are a warm, calm storyteller reading a kids' fantasy bedtime storybook to young children aged 3–6. The stories follow Firlefanz, a whimsical dragon-like creature, on magical adventures through fantastical lands. Read with gentle wonder, bringing the imaginative world to life while keeping the tone soothing and sleep-inducing. Use slightly different voices for dialogue to make characters distinguishable, but stay soft and calming throughout.`
}

async function generateFullAudio(text: string, lang: string): Promise<Buffer> {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, voice: VOICE, input: text, speed: SPEED, instructions: getInstructions(lang) }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`TTS API error: ${res.status} ${err}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

interface WhisperWord {
  word: string
  start: number
  end: number
}

async function getWordTimestamps(audioPath: string): Promise<WhisperWord[]> {
  const form = new FormData()
  form.append('file', new Blob([readFileSync(audioPath)]), 'audio.mp3')
  form.append('model', 'whisper-1')
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'word')

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: form,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Whisper API error: ${res.status} ${err}`)
  }
  const data = await res.json() as { words: WhisperWord[] }
  return data.words
}

function normalizeForMatching(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim()
}

function findPageBoundaries(words: WhisperWord[], pageTexts: string[]): number[] {
  // Returns start timestamps for each page
  const boundaries: number[] = [0] // First page always starts at 0

  // Build cumulative word list from whisper
  const whisperWords = words.map(w => normalizeForMatching(w.word))

  for (let pageIdx = 0; pageIdx < pageTexts.length - 1; pageIdx++) {
    // Count words in this page's text
    const pageWords = normalizeForMatching(pageTexts[pageIdx]).split(/\s+/)
    const nextPageWords = normalizeForMatching(pageTexts[pageIdx + 1]).split(/\s+/)

    // Find where the next page's first few words appear in the whisper transcript
    // We search after the approximate position of where this page should end
    const approxWordsSoFar = pageTexts.slice(0, pageIdx + 1).reduce((sum, t) => sum + normalizeForMatching(t).split(/\s+/).length, 0)

    // Search window: start looking a bit before the expected position
    const searchStart = Math.max(0, approxWordsSoFar - Math.floor(pageWords.length * 0.3))
    const searchEnd = Math.min(whisperWords.length, approxWordsSoFar + Math.floor(pageWords.length * 0.5))

    // Look for the first few words of the next page
    const needle = nextPageWords.slice(0, Math.min(4, nextPageWords.length))
    let bestMatch = -1

    for (let i = searchStart; i < searchEnd; i++) {
      let matched = 0
      for (let j = 0; j < needle.length && i + j < whisperWords.length; j++) {
        if (whisperWords[i + j].includes(needle[j]) || needle[j].includes(whisperWords[i + j])) {
          matched++
        }
      }
      if (matched >= Math.min(3, needle.length)) {
        bestMatch = i
        break
      }
    }

    if (bestMatch >= 0) {
      boundaries.push(words[bestMatch].start)
    } else {
      // Fallback: estimate proportionally
      const totalChars = pageTexts.join('').length
      const charsSoFar = pageTexts.slice(0, pageIdx + 1).join('').length
      const ratio = charsSoFar / totalChars
      const totalDuration = words[words.length - 1].end
      boundaries.push(ratio * totalDuration)
      console.warn(`    Warning: Could not find exact boundary for page ${pageIdx + 2}, using proportional estimate`)
    }
  }

  return boundaries
}

function splitAudioWithFfmpeg(inputPath: string, boundaries: number[], totalPages: number, outDir: string, lang: string): void {
  // Get total duration
  const durationStr = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${inputPath}"`).toString().trim()
  const totalDuration = parseFloat(durationStr)

  for (let i = 0; i < totalPages; i++) {
    const start = boundaries[i]
    const end = i < totalPages - 1 ? boundaries[i + 1] : totalDuration
    const outPath = join(outDir, `audio-${lang}-page-${i + 1}.mp3`)

    execSync(`ffmpeg -y -i "${inputPath}" -ss ${start} -to ${end} -c copy "${outPath}" 2>/dev/null`)
    const size = readFileSync(outPath).length
    console.log(`    Page ${i + 1}: ${start.toFixed(1)}s – ${end.toFixed(1)}s (${(size / 1024).toFixed(0)} KB)`)
  }
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

  // Check if all pages already exist
  const allExist = pageTexts.every((_, i) => existsSync(join(outDir, `audio-${lang}-page-${i + 1}.mp3`)))
  if (allExist) {
    console.log('  All pages already exist, skipping')
    continue
  }

  // Combine all pages into one text
  const fullText = pageTexts.join(PAGE_SEPARATOR)
  if (fullText.length > MAX_INPUT_CHARS) {
    console.error(`  Error: Story text is ${fullText.length} chars, exceeds ${MAX_INPUT_CHARS} limit. Shorten the story text.`)
    continue
  }
  console.log(`  Full text: ${fullText.length} chars, ${pageTexts.length} pages`)

  // Step 1: Generate full audio
  process.stdout.write('  Generating full narration... ')
  const fullAudioPath = join(outDir, `_full-${lang}.mp3`)
  try {
    const audio = await generateFullAudio(fullText, lang)
    writeFileSync(fullAudioPath, audio)
    console.log(`done (${(audio.length / 1024).toFixed(0)} KB)`)
  } catch (e) {
    console.error(`error - ${(e as Error).message}`)
    continue
  }

  // Step 2: Get word-level timestamps via Whisper
  process.stdout.write('  Transcribing for timestamps... ')
  let words: WhisperWord[]
  try {
    words = await getWordTimestamps(fullAudioPath)
    console.log(`done (${words.length} words)`)
  } catch (e) {
    console.error(`error - ${(e as Error).message}`)
    unlinkSync(fullAudioPath)
    continue
  }

  // Step 3: Find page boundaries
  console.log('  Finding page boundaries...')
  const boundaries = findPageBoundaries(words, pageTexts)

  // Step 4: Split into per-page files
  console.log('  Splitting into pages:')
  try {
    splitAudioWithFfmpeg(fullAudioPath, boundaries, pageTexts.length, outDir, lang)
  } catch (e) {
    console.error(`  Split error: ${(e as Error).message}`)
    unlinkSync(fullAudioPath)
    continue
  }

  // Clean up full audio
  unlinkSync(fullAudioPath)
}

console.log('\nDone!')
