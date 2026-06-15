// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/**
 * Generate per-page narration MP3s with Google Gemini 3.1 Flash TTS via OpenRouter.
 *
 * Default voice: Algieba (smooth male). The reader (StoryReader.tsx) plays one MP3 per page and
 * auto-advances on the audio 'ended' event, so per-page files ARE the page-turn sync — no
 * timestamps needed. Output: public/stories/<id>/audio-<lang>-page-<N>.mp3 (git-tracked).
 *
 * Gemini TTS over OpenRouter returns raw PCM (24 kHz / 16-bit / mono) → transcoded to MP3 via
 * ffmpeg. Gemini occasionally truncates a whole-page request (HTTP 200 but cut short), so every
 * page is length-validated; if short it is re-synthesized sentence-by-sentence and concatenated.
 *
 * Usage:
 *   npx tsx scripts/generate-audio.ts <story-id> [lang|all] [voice]   # one story (default lang=all)
 *   npx tsx scripts/generate-audio.ts all [lang|all] [voice]          # every story
 *
 * Env: CONCURRENCY (default 4) · PAGES=1,2 (only these pages) · CHUNK_CHARS (chunk size) ·
 *      FORCE=1 (ignore the resume log for `all`)
 *
 * Requires OPENROUTER_API_KEY in .env and ffmpeg on PATH.
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import type { Story } from '../src/types/story.ts'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const storiesDir = path.join(rootDir, 'public/stories')

const apiKey = process.env.OPENROUTER_API_KEY
if (!apiKey) { console.error('Missing OPENROUTER_API_KEY'); process.exit(1) }

const MODEL = 'google/gemini-3.1-flash-tts-preview'
const DEFAULT_VOICE = 'Algieba'

const storyArg = process.argv[2]
const langArg = process.argv[3] ?? 'all'
const voice = process.argv[4] ?? DEFAULT_VOICE
if (!storyArg) { console.error('Usage: generate-audio.ts <story-id|all> [lang|all] [voice]'); process.exit(1) }

const CONCURRENCY = process.env.CONCURRENCY ? parseInt(process.env.CONCURRENCY, 10) : 4
const pagesFilter = process.env.PAGES ? new Set(process.env.PAGES.split(',').map((s) => parseInt(s.trim(), 10))) : null
const progressFile = path.join(rootDir, '.audio-regen-progress')

// PCM is s16le / 24 kHz / mono → bytes/sec = 24000 * 2. A clip faster than ~20 chars/sec is truncated.
const SEC_PER_BYTE = 1 / (24000 * 2)
const MIN_SEC_PER_CHAR = 0.05

async function synthValidated(text: string, maxAttempts = 3): Promise<{ buf: Buffer; sec: number } | null> {
  const minSec = text.length * MIN_SEC_PER_CHAR
  let best: Buffer | null = null
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch('https://openrouter.ai/api/v1/audio/speech', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, voice, input: text, response_format: 'pcm' }),
    })
    if (!res.ok) {
      await new Promise((r) => setTimeout(r, 3000)); continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const sec = buf.length * SEC_PER_BYTE
    if (!best || buf.length > best.length) best = buf
    if (sec >= minSec) return { buf, sec }
    await new Promise((r) => setTimeout(r, 2000))
  }
  return best ? { buf: best, sec: best.length * SEC_PER_BYTE } : null
}

// Split into sentence groups (Gemini reliably renders short sentences even when it truncates pages).
function splitChunks(text: string): string[] {
  const max = process.env.CHUNK_CHARS ? parseInt(process.env.CHUNK_CHARS, 10) : 180
  const parts = text.match(/[^.!?]+[.!?]+"?\s*/g) ?? [text]
  const chunks: string[] = []
  let cur = ''
  for (const p of parts) {
    if (cur && (cur + p).length > max) { chunks.push(cur.trim()); cur = '' }
    cur += p
  }
  if (cur.trim()) chunks.push(cur.trim())
  return chunks.length ? chunks : [text]
}

async function synthPage(text: string): Promise<{ buf: Buffer; sec: number } | null> {
  const minSec = text.length * MIN_SEC_PER_CHAR
  const whole = await synthValidated(text, 2)
  if (whole && whole.sec >= minSec) return whole
  // Fallback: synthesize sentence chunks and concatenate PCM with 0.2s gaps.
  const chunks = splitChunks(text)
  const silence = Buffer.alloc(Math.round(24000 * 2 * 0.2))
  const out: Buffer[] = []
  for (let c = 0; c < chunks.length; c++) {
    const r = await synthValidated(chunks[c], 3)
    if (!r) return whole
    if (c > 0) out.push(silence)
    out.push(r.buf)
  }
  const buf = Buffer.concat(out)
  return { buf, sec: buf.length * SEC_PER_BYTE }
}

async function pool<T>(items: T[], n: number, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const idx = i++; await fn(items[idx]) }
  }))
}

function pageTextsFor(story: Story, lang: string): string[] {
  if (lang === 'de') return story.pages.map((p) => p.text.join(' '))
  const t = story.translations?.[lang]
  return t ? t.pages.map((p) => p.text.join(' ')) : []
}

function listStories(): string[] {
  return fs.readdirSync(storiesDir).filter((d) => fs.existsSync(path.join(storiesDir, d, 'story.json'))).sort()
}

async function doStory(id: string): Promise<string[]> {
  const dir = path.join(storiesDir, id)
  const story: Story = JSON.parse(fs.readFileSync(path.join(dir, 'story.json'), 'utf-8'))
  const langs = langArg === 'all' ? ['de', ...Object.keys(story.translations ?? {})] : [langArg]
  const short: string[] = []
  for (const lang of langs) {
    const texts = pageTextsFor(story, lang)
    if (!texts.length) continue
    const idxs = texts.map((_, i) => i).filter((i) => !pagesFilter || pagesFilter.has(i + 1))
    await pool(idxs, CONCURRENCY, async (i) => {
      const r = await synthPage(texts[i])
      if (!r) { console.log(`    ${lang} p${i + 1}: FAILED`); short.push(`${lang}p${i + 1}`); return }
      const pcmPath = path.join(dir, `.tmp-${lang}-${i + 1}.pcm`)
      const out = path.join(dir, `audio-${lang}-page-${i + 1}.mp3`)
      fs.writeFileSync(pcmPath, r.buf)
      execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${pcmPath}" -b:a 160k "${out}"`, { stdio: 'ignore' })
      fs.unlinkSync(pcmPath)
      const tooShort = r.sec < texts[i].length * MIN_SEC_PER_CHAR
      if (tooShort) short.push(`${lang}p${i + 1}`)
      console.log(`    ${lang} p${i + 1}: ${r.sec.toFixed(1)}s${tooShort ? ' ⚠ SHORT' : ''}`)
    })
  }
  return short
}

// ---- main ----
const all = storyArg === 'all'
const targets = all ? listStories() : [storyArg]
const done = (all && !process.env.FORCE && fs.existsSync(progressFile))
  ? new Set(fs.readFileSync(progressFile, 'utf-8').split('\n').map((s) => s.trim()).filter(Boolean))
  : new Set<string>()
const queue = targets.filter((id) => !done.has(id))

console.log(`Model=${MODEL} voice=${voice} concurrency=${CONCURRENCY}`)
console.log(`Stories: ${queue.length}${done.size ? ` (resuming, ${done.size} already done)` : ''}\n`)

const problems: Record<string, string[]> = {}
for (let s = 0; s < queue.length; s++) {
  const id = queue[s]
  console.log(`[${s + 1}/${queue.length}] ${id}`)
  try {
    const short = await doStory(id)
    if (short.length) { problems[id] = short; console.log(`  ⚠ ${id}: ${short.length} short page(s): ${short.join(', ')}`) }
    else if (all) fs.appendFileSync(progressFile, id + '\n')
  } catch (e) { console.error(`  ERROR ${id}: ${(e as Error).message}`); problems[id] = ['error'] }
}

console.log('\n===== SUMMARY =====')
const clean = queue.length - Object.keys(problems).length
console.log(`${clean}/${queue.length} stories clean${all && done.size ? ` (+${done.size} previously done)` : ''}`)
if (Object.keys(problems).length) {
  console.log('Needs attention:')
  for (const [id, p] of Object.entries(problems)) console.log(`  ${id}: ${p.join(', ')}`)
} else console.log('All requested stories OK ✓')
