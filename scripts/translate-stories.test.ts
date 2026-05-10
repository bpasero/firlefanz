// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect } from 'vitest'
import { extractTranslationSource, mergeTranslation, type TranslationPayload } from './translate-stories.ts'
import type { Story } from '../src/types/story.ts'

const baseStory: Story = {
  id: 'demo',
  title: 'Der Drache',
  teaser: 'Eine Geschichte über Firlefanz.',
  coverImage: '/stories/demo/cover.png',
  prompt: 'do not translate this',
  pages: [
    { text: ['Seite eins, Absatz eins.', 'Seite eins, Absatz zwei.'], image: '/stories/demo/page-1.png' },
    { text: ['Seite zwei.'], image: '/stories/demo/page-2.png' },
  ],
}

describe('extractTranslationSource', () => {
  it('returns title, teaser, and page text only — no images, prompt, or id', () => {
    const src = extractTranslationSource(baseStory)
    expect(src).toEqual({
      title: 'Der Drache',
      teaser: 'Eine Geschichte über Firlefanz.',
      pages: [
        { text: ['Seite eins, Absatz eins.', 'Seite eins, Absatz zwei.'] },
        { text: ['Seite zwei.'] },
      ],
    })
    // Crucial: do not leak image paths to the translator API.
    expect(JSON.stringify(src)).not.toContain('cover.png')
    expect(JSON.stringify(src)).not.toContain('page-1.png')
    expect(JSON.stringify(src)).not.toContain('do not translate this')
  })

  it('preserves the page count (caller relies on a 1:1 mapping)', () => {
    const src = extractTranslationSource(baseStory)
    expect(src.pages).toHaveLength(baseStory.pages.length)
  })
})

describe('mergeTranslation', () => {
  const enPayload: TranslationPayload = {
    title: 'The Dragon',
    teaser: 'A story about Firlefanz.',
    pages: [{ text: ['Page one A.', 'Page one B.'] }, { text: ['Page two.'] }],
  }

  it('attaches translations.<lang> with title, teaser, and pages', () => {
    const merged = mergeTranslation(baseStory, 'en', enPayload)
    expect(merged.translations?.en).toEqual({
      title: 'The Dragon',
      teaser: 'A story about Firlefanz.',
      pages: [{ text: ['Page one A.', 'Page one B.'] }, { text: ['Page two.'] }],
    })
  })

  it('preserves pre-existing translations for other languages', () => {
    const story: Story = {
      ...baseStory,
      translations: {
        fr: {
          title: 'Le dragon',
          teaser: 'Une histoire.',
          pages: [{ text: ['Page un.'] }, { text: ['Page deux.'] }],
        },
      },
    }
    const merged = mergeTranslation(story, 'en', enPayload)
    expect(merged.translations?.fr).toEqual(story.translations!.fr)
    expect(merged.translations?.en?.title).toBe('The Dragon')
  })

  it('overwrites an existing translation for the same language', () => {
    const story: Story = {
      ...baseStory,
      translations: {
        en: {
          title: 'OLD English title',
          teaser: 'old',
          pages: [{ text: ['old1'] }, { text: ['old2'] }],
        },
      },
    }
    const merged = mergeTranslation(story, 'en', enPayload)
    expect(merged.translations?.en?.title).toBe('The Dragon')
    expect(merged.translations?.en?.pages[0].text).toEqual(['Page one A.', 'Page one B.'])
  })

  it('does not mutate the input story', () => {
    const story: Story = JSON.parse(JSON.stringify(baseStory))
    const before = JSON.stringify(story)
    mergeTranslation(story, 'en', enPayload)
    expect(JSON.stringify(story)).toBe(before)
  })

  it('does not mutate the input story when translations already exists', () => {
    const story: Story = {
      ...baseStory,
      translations: { fr: { title: 'X', teaser: 'Y', pages: [{ text: ['Z'] }, { text: ['W'] }] } },
    }
    const before = JSON.stringify(story)
    mergeTranslation(story, 'en', enPayload)
    expect(JSON.stringify(story)).toBe(before)
  })

  it('preserves the German base fields (title, teaser, pages, image, prompt) untouched', () => {
    const merged = mergeTranslation(baseStory, 'en', enPayload)
    expect(merged.title).toBe(baseStory.title)
    expect(merged.teaser).toBe(baseStory.teaser)
    expect(merged.pages).toEqual(baseStory.pages)
    expect(merged.coverImage).toBe(baseStory.coverImage)
    expect(merged.prompt).toBe(baseStory.prompt)
    expect(merged.id).toBe(baseStory.id)
  })

  it('round-trips: extract → merge yields a translation block matching the source structure', () => {
    const src = extractTranslationSource(baseStory)
    const merged = mergeTranslation(baseStory, 'de-CH', src)
    // Page count and per-page paragraph counts match.
    expect(merged.translations?.['de-CH']?.pages).toHaveLength(baseStory.pages.length)
    expect(merged.translations?.['de-CH']?.pages[0].text).toHaveLength(
      baseStory.pages[0].text.length,
    )
  })
})
