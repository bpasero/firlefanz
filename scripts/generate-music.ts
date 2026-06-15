// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/**
 * Generate a looping background-music track for a Firlefanz story with Google
 * Lyria 3 Clip via OpenRouter.
 *
 * Lyria returns a complete ~30s MP3 (44.1 kHz stereo, ID3-tagged) — already in the
 * final format, so no ffmpeg transcoding is needed (unlike narration). The reader
 * (StoryReader.tsx) loops this clip quietly underneath the per-page narration, so a
 * short seamless-feeling clip is all we want. The clip is the same for every page and
 * every language (music is language-agnostic).
 *
 * The script saves public/stories/<id>/music.mp3 and patches story.json to add the
 * `music` field so the reader picks it up automatically.
 *
 * Usage:
 *   npx tsx scripts/generate-music.ts <story-id>                 # default calming prompt
 *   npx tsx scripts/generate-music.ts <story-id> "custom prompt" # per-story mood
 *
 * Env: PROMPT (overrides the prompt, same as the 2nd arg) · FORCE=1 (overwrite an
 *      existing music.mp3 instead of skipping).
 *
 * Requires OPENROUTER_API_KEY in .env (same key as narration / images).
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Story } from '../src/types/story.ts'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const storiesDir = path.join(rootDir, 'public/stories')

const apiKey = process.env.OPENROUTER_API_KEY
if (!apiKey) { console.error('Missing OPENROUTER_API_KEY'); process.exit(1) }

const MODEL = 'google/lyria-3-clip-preview'

// A gentle, loopable bedtime bed. Instrumental only — vocals would fight the narration.
const DEFAULT_PROMPT =
  'A soft, slow, gentle instrumental bedtime lullaby. Warm felt piano and a delicate ' +
  'music box, with airy ambient pads underneath. Very calm, tender and dreamy, lulling ' +
  'and sleepy. No vocals, no drums, no sudden changes — a seamless, soothing loop that ' +
  'sits quietly in the background under a storyteller\'s voice.'

const storyArg = process.argv[2]
if (!storyArg) { console.error('Usage: generate-music.ts <story-id|all> [prompt]'); process.exit(1) }
const prompt = process.argv[3] ?? process.env.PROMPT ?? DEFAULT_PROMPT

function listStories(): string[] {
  return fs.readdirSync(storiesDir).filter((d) => fs.existsSync(path.join(storiesDir, d, 'story.json'))).sort()
}

// Lyria streams the audio as base64 chunks in delta.audio.data (SSE). Audio output
// REQUIRES stream:true; a non-streaming request returns HTTP 400.
async function generateMusic(text: string): Promise<Buffer> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: text }],
      modalities: ['audio', 'text'],
      stream: true,
    }),
  })
  if (!res.ok || !res.body) throw new Error(`API error: ${res.status} ${await res.text()}`)

  const parts: string[] = []
  let buf = ''
  const decoder = new TextDecoder()
  // res.body is an async-iterable stream of Uint8Array chunks under tsx/Node 22.
  for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    buf += decoder.decode(chunk, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (payload === '[DONE]') continue
      let j: { choices?: { delta?: { audio?: { data?: string } }; message?: { audio?: { data?: string } } }[] }
      try { j = JSON.parse(payload) } catch { continue }
      const audio = j.choices?.[0]?.delta?.audio ?? j.choices?.[0]?.message?.audio
      if (audio?.data) parts.push(audio.data)
    }
  }
  if (!parts.length) throw new Error('No audio data in response')
  return Buffer.from(parts.join(''), 'base64')
}

// Generate one story's music.mp3 and set its `music` field. Returns 'done' | 'skipped' | 'failed'.
async function doStory(id: string): Promise<'done' | 'skipped' | 'failed'> {
  const dir = path.join(storiesDir, id)
  const storyJsonPath = path.join(dir, 'story.json')
  if (!fs.existsSync(storyJsonPath)) { console.log(`  no story.json — skipping`); return 'skipped' }

  const outPath = path.join(dir, 'music.mp3')
  if (fs.existsSync(outPath) && !process.env.FORCE) {
    console.log(`  music.mp3 already exists — skipping (FORCE=1 to overwrite)`)
    return 'skipped'
  }

  let mp3: Buffer | null = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`  generating (attempt ${attempt})...`)
      mp3 = await generateMusic(prompt)
      break
    } catch (e) {
      console.error(`  attempt ${attempt} failed: ${(e as Error).message}`)
      if (attempt < 3) await new Promise((r) => setTimeout(r, 3000))
    }
  }
  if (!mp3) { console.error(`  ALL ATTEMPTS FAILED`); return 'failed' }

  fs.writeFileSync(outPath, mp3)
  console.log(`  saved ${path.relative(rootDir, outPath)} (${(mp3.length / 1024).toFixed(0)} KB)`)

  // Patch story.json so the reader picks up the track automatically.
  const story: Story = JSON.parse(fs.readFileSync(storyJsonPath, 'utf-8'))
  const musicPath = `/stories/${id}/music.mp3`
  if (story.music !== musicPath) {
    story.music = musicPath
    fs.writeFileSync(storyJsonPath, JSON.stringify(story, null, 2) + '\n')
    console.log(`  set "music": "${musicPath}" in story.json`)
  }
  return 'done'
}

// ---- main ----
const all = storyArg === 'all'
const targets = all ? listStories() : [storyArg]

console.log(`Model=${MODEL}`)
console.log(`Prompt: ${prompt}`)
console.log(`Stories: ${targets.length}\n`)

const failed: string[] = []
let done = 0, skipped = 0
for (let i = 0; i < targets.length; i++) {
  const id = targets[i]
  console.log(`[${i + 1}/${targets.length}] ${id}`)
  const r = await doStory(id)
  if (r === 'done') done++
  else if (r === 'skipped') skipped++
  else failed.push(id)
}

console.log('\n===== SUMMARY =====')
console.log(`${done} generated, ${skipped} skipped, ${failed.length} failed`)
if (failed.length) { console.log(`Failed: ${failed.join(', ')}`); process.exit(1) }
console.log('Done!')
