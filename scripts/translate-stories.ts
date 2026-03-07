// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/**
 * Translates all story JSON files to the target language using OpenAI.
 * Usage: npx tsx scripts/translate-stories.ts [lang]
 * Default: npx tsx scripts/translate-stories.ts en
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type { Story } from '../src/types/story.ts'

const targetLang = process.argv[2] ?? 'en'
const langName: Record<string, string> = { en: 'English', fr: 'French', es: 'Spanish' }
const langLabel = langName[targetLang] ?? targetLang

let apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  const env = readFileSync('.env', 'utf-8')
  const match = env.match(/OPENAI_API_KEY=(.+)/)
  if (!match) { console.error('No OPENAI_API_KEY found'); process.exit(1) }
  apiKey = match[1].trim()
  process.env.OPENAI_API_KEY = apiKey
}

interface TranslationPayload {
  title: string
  teaser: string
  pages: { text: string[] }[]
}

async function translate(text: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are translating a German children's bedtime storybook into ${langLabel}.
Keep the warm, gentle, dreamy tone. Simple vocabulary for ages 3–6.
Preserve all character names (Firlefanz, Papalapapp, Goldi, etc.) exactly as-is.
Return ONLY the translated JSON, no explanation, no markdown fences.`,
        },
        {
          role: 'user',
          content: `Translate this JSON object to ${langLabel}. Translate only string values (title, teaser, and all text arrays). Keep all keys, structure, and character names unchanged.\n\n${text}`,
        },
      ],
      temperature: 0.3,
    }),
  })
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices[0].message.content.trim()
}

const storiesDir = 'public/stories'
const storyDirs = readdirSync(storiesDir).filter((d) => !d.startsWith('.') && d !== 'drafts.json')

for (const dir of storyDirs) {
  const storyPath = join(storiesDir, dir, 'story.json')
  let story: Story
  try {
    story = JSON.parse(readFileSync(storyPath, 'utf-8'))
  } catch {
    continue
  }

  if (story.translations?.[targetLang]) {
    console.log(`${dir}: already has ${targetLang} translation, skipping`)
    continue
  }

  console.log(`${dir}: translating to ${targetLang}...`)

  const toTranslate: TranslationPayload = {
    title: story.title,
    teaser: story.teaser,
    pages: story.pages.map((p) => ({ text: p.text })),
  }

  const raw = await translate(JSON.stringify(toTranslate, null, 2))

  let translated: TranslationPayload
  try {
    translated = JSON.parse(raw)
  } catch {
    console.error(`  Failed to parse translation response for ${dir}:`, raw.slice(0, 200))
    continue
  }

  story.translations = story.translations ?? {}
  story.translations[targetLang] = {
    title: translated.title,
    teaser: translated.teaser,
    pages: translated.pages,
  }

  writeFileSync(storyPath, JSON.stringify(story, null, 2) + '\n')
  console.log(`  Done: "${translated.title}"`)
}

console.log('\nAll stories translated.')
