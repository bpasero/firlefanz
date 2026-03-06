/**
 * Translates all story JSON files to the target language using OpenAI.
 * Usage: node scripts/translate-stories.mjs [lang]
 * Default: node scripts/translate-stories.mjs en
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const targetLang = process.argv[2] ?? 'en'
const langName = { en: 'English', fr: 'French', es: 'Spanish' }[targetLang] ?? targetLang

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  const env = readFileSync('.env', 'utf-8')
  const match = env.match(/OPENAI_API_KEY=(.+)/)
  if (!match) { console.error('No OPENAI_API_KEY found'); process.exit(1) }
  process.env.OPENAI_API_KEY = match[1].trim()
}

async function translate(text) {
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
          content: `You are translating a German children's bedtime storybook into ${langName}.
Keep the warm, gentle, dreamy tone. Simple vocabulary for ages 3–6.
Preserve all character names (Firlefanz, Papalapapp, Goldi, etc.) exactly as-is.
Return ONLY the translated JSON, no explanation, no markdown fences.`,
        },
        {
          role: 'user',
          content: `Translate this JSON object to ${langName}. Translate only string values (title, teaser, and all text arrays). Keep all keys, structure, and character names unchanged.\n\n${text}`,
        },
      ],
      temperature: 0.3,
    }),
  })
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

const storiesDir = 'public/stories'
const storyDirs = readdirSync(storiesDir).filter((d) => !d.startsWith('.') && d !== 'drafts.json')

for (const dir of storyDirs) {
  const storyPath = join(storiesDir, dir, 'story.json')
  let story
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

  // Build the object to translate: only title, teaser, and page texts
  const toTranslate = {
    title: story.title,
    teaser: story.teaser,
    pages: story.pages.map((p) => ({ text: p.text })),
  }

  const raw = await translate(JSON.stringify(toTranslate, null, 2))

  let translated
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
