// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect } from 'vitest'
import { localizeStory, type Story } from './story'

const baseStory: Story = {
  id: 'demo',
  title: 'Der Drache',
  teaser: 'Eine Geschichte über Firlefanz.',
  coverImage: '/stories/demo/cover.png',
  prompt: 'irrelevant',
  pages: [
    { text: ['Seite eins, Absatz eins.', 'Seite eins, Absatz zwei.'], image: '/stories/demo/page-1.png' },
    { text: ['Seite zwei.'], image: '/stories/demo/page-2.png' },
  ],
}

describe('localizeStory', () => {
  it('returns the German base when language is "de" even if no translations exist', () => {
    const result = localizeStory(baseStory, 'de')
    expect(result.title).toBe('Der Drache')
    expect(result.teaser).toBe('Eine Geschichte über Firlefanz.')
    expect(result.pages.map((p) => p.text)).toEqual([baseStory.pages[0].text, baseStory.pages[1].text])
  })

  it('returns the German base when the requested language is missing from translations', () => {
    const result = localizeStory(baseStory, 'fr')
    expect(result.title).toBe(baseStory.title)
    expect(result.teaser).toBe(baseStory.teaser)
    expect(result.pages[0].text).toBe(baseStory.pages[0].text)
  })

  it('returns the German base when the story has translations for other languages but not the requested one', () => {
    const story: Story = {
      ...baseStory,
      translations: {
        en: {
          title: 'The Dragon',
          teaser: 'A story about Firlefanz.',
          pages: [{ text: ['Page one.'] }, { text: ['Page two.'] }],
        },
      },
    }
    const result = localizeStory(story, 'fr')
    expect(result.title).toBe(baseStory.title)
    expect(result.pages[0].text).toBe(baseStory.pages[0].text)
  })

  it('returns the requested translation when available', () => {
    const story: Story = {
      ...baseStory,
      translations: {
        en: {
          title: 'The Dragon',
          teaser: 'A story about Firlefanz.',
          pages: [{ text: ['Page one, paragraph one.', 'Page one, paragraph two.'] }, { text: ['Page two.'] }],
        },
      },
    }
    const result = localizeStory(story, 'en')
    expect(result.title).toBe('The Dragon')
    expect(result.teaser).toBe('A story about Firlefanz.')
    expect(result.pages[0].text).toEqual(['Page one, paragraph one.', 'Page one, paragraph two.'])
    expect(result.pages[1].text).toEqual(['Page two.'])
  })

  it('always preserves the German image path regardless of language', () => {
    const story: Story = {
      ...baseStory,
      translations: {
        en: {
          title: 'The Dragon',
          teaser: 'tease',
          pages: [{ text: ['Page one.'] }, { text: ['Page two.'] }],
        },
      },
    }
    const de = localizeStory(story, 'de')
    const en = localizeStory(story, 'en')
    expect(de.pages.map((p) => p.image)).toEqual(en.pages.map((p) => p.image))
    expect(en.pages[0].image).toBe('/stories/demo/page-1.png')
  })

  it('falls back to the German page text when a translated page entry is missing', () => {
    // English translation only has the first page filled in.
    const story: Story = {
      ...baseStory,
      translations: {
        en: {
          title: 'The Dragon',
          teaser: 'tease',
          pages: [{ text: ['Page one only.'] }],
        },
      },
    }
    const result = localizeStory(story, 'en')
    expect(result.pages[0].text).toEqual(['Page one only.'])
    // Page 2 has no translation entry → fall back to German.
    expect(result.pages[1].text).toEqual(baseStory.pages[1].text)
  })

  it('falls back when a translated page exists but has no text array', () => {
    const story: Story = {
      ...baseStory,
      translations: {
        en: {
          title: 'The Dragon',
          teaser: 'tease',
          // @ts-expect-error — exercise the runtime fallback when text is missing
          pages: [{}, { text: ['Page two.'] }],
        },
      },
    }
    const result = localizeStory(story, 'en')
    expect(result.pages[0].text).toEqual(baseStory.pages[0].text)
    expect(result.pages[1].text).toEqual(['Page two.'])
  })
})
