// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  readStories,
  storyUrl,
  homeUrl,
  abs,
  buildStoryRoot,
  buildStoryLd,
  buildHomeRoot,
  buildHomeLd,
  applyHead,
  buildSitemap,
  type SeoStory,
} from './seo-prerender'

// Extract and parse the JSON-LD payload from a `<script type="application/ld+json">` block.
function parseLd(html: string) {
  const m = html.match(/<script type="application\/ld\+json">\n([\s\S]*?)\n {4}<\/script>/)
  if (!m) throw new Error('no JSON-LD block found')
  return JSON.parse(m[1])
}

const story: SeoStory = {
  id: 'der-mond',
  cover: '/stories/der-mond/cover.png',
  lastmod: '2026-06-05',
  de: { title: 'Firlefanz & der Mond', teaser: 'Eine Reise.', pages: ['Seite eins.', 'Seite zwei.', ''] },
  en: { title: 'Firlefanz and the Moon', teaser: 'A journey.', pages: ['Page one.', 'Page two.', ''] },
}

describe('url helpers', () => {
  it('builds per-language story and home URLs', () => {
    expect(storyUrl('der-mond', 'de')).toBe('/geschichten/der-mond/')
    expect(storyUrl('der-mond', 'en')).toBe('/en/geschichten/der-mond/')
    expect(homeUrl('de')).toBe('/')
    expect(homeUrl('en')).toBe('/en/')
    expect(abs('/geschichten/x/')).toBe('https://firlefanz.li/geschichten/x/')
  })
})

describe('buildStoryRoot', () => {
  it('renders the German page with all non-empty paragraphs and a German back link', () => {
    const html = buildStoryRoot(story, 'de')
    expect(html).toContain('href="/"')
    expect(html).toContain('← Alle Geschichten')
    expect(html).toContain('Firlefanz &amp; der Mond') // h1, HTML-escaped
    expect(html).toContain('Seite eins.')
    expect(html).toContain('Seite zwei.')
    // 2 non-empty pages → 2 body paragraphs (the empty third is filtered out)
    expect(html.match(/line-height:1\.7/g)?.length).toBe(2)
  })

  it('renders the English page with English text and an English back link to /en/', () => {
    const html = buildStoryRoot(story, 'en')
    expect(html).toContain('href="/en/"')
    expect(html).toContain('← All Stories')
    expect(html).toContain('Firlefanz and the Moon')
    expect(html).toContain('Page one.')
    expect(html).not.toContain('Seite eins.')
  })
})

describe('buildStoryLd', () => {
  it('emits a CreativeWork with the right language, URL and image', () => {
    const de = parseLd(buildStoryLd(story, 'de'))
    expect(de['@type']).toBe('CreativeWork')
    expect(de.inLanguage).toBe('de')
    expect(de.name).toBe('Firlefanz & der Mond')
    expect(de.url).toBe('https://firlefanz.li/geschichten/der-mond/')
    expect(de.image).toBe('https://firlefanz.li/stories/der-mond/cover.png')
    expect(de.isAccessibleForFree).toBe(true)
    expect(de.author?.name).toBe('Benjamin Pasero')

    const en = parseLd(buildStoryLd(story, 'en'))
    expect(en.inLanguage).toBe('en')
    expect(en.name).toBe('Firlefanz and the Moon')
    expect(en.url).toBe('https://firlefanz.li/en/geschichten/der-mond/')
  })
})

describe('buildHomeRoot / buildHomeLd', () => {
  it('links to the per-language story URLs and uses the right home title', () => {
    const de = buildHomeRoot([story], 'de')
    expect(de).toContain('href="/geschichten/der-mond/"')
    expect(de).toContain('Firlefanz — Geschichten zum Einschlafen')

    const en = buildHomeRoot([story], 'en')
    expect(en).toContain('href="/en/geschichten/der-mond/"')
    expect(en).toContain('Firlefanz — Bedtime Stories')
  })

  it('emits an ItemList with per-language item URLs', () => {
    const ld = parseLd(buildHomeLd([story], 'en'))
    expect(ld['@type']).toBe('ItemList')
    expect(ld.numberOfItems).toBe(1)
    expect(ld.itemListElement[0].item.url).toBe('https://firlefanz.li/en/geschichten/der-mond/')
    expect(ld.itemListElement[0].item.inLanguage).toBe('en')
  })
})

describe('applyHead', () => {
  const SHELL = [
    '<!doctype html>',
    '<html lang="de">',
    '  <head>',
    '    <title>Firlefanz — Geschichten zum Einschlafen</title>',
    '    <meta name="description" content="old desc" />',
    '    <link rel="canonical" href="https://firlefanz.li/" />',
    '    <link rel="alternate" hreflang="de" href="https://firlefanz.li/" />',
    '    <link rel="alternate" hreflang="en" href="https://firlefanz.li/" />',
    '    <link rel="alternate" hreflang="x-default" href="https://firlefanz.li/" />',
    '    <meta property="og:title" content="old" />',
    '    <meta property="og:description" content="old" />',
    '    <meta property="og:image" content="https://firlefanz.li/old.png" />',
    '    <meta property="og:url" content="https://firlefanz.li" />',
    '    <meta property="og:type" content="website" />',
    '    <meta property="og:locale" content="de_DE" />',
    '    <meta property="og:locale:alternate" content="en_US" />',
    '    <meta name="twitter:title" content="old" />',
    '    <meta name="twitter:description" content="old" />',
    '    <meta name="twitter:image" content="https://firlefanz.li/old.png" />',
    '  </head><body></body></html>',
  ].join('\n')

  const deUrl = abs(storyUrl('der-mond', 'de'))
  const enUrl = abs(storyUrl('der-mond', 'en'))

  it('sets German story head with reciprocal hreflang + self canonical', () => {
    const html = applyHead(SHELL, {
      lang: 'de', title: 'Mond — Firlefanz', desc: 'd', canonical: deUrl, img: abs(story.cover), ogType: 'article', deUrl, enUrl,
    })
    expect(html).toContain('<html lang="de">')
    expect(html).toContain('<title>Mond — Firlefanz</title>')
    expect(html).toContain(`<link rel="canonical" href="${deUrl}" />`)
    expect(html).toContain(`<link rel="alternate" hreflang="de" href="${deUrl}" />`)
    expect(html).toContain(`<link rel="alternate" hreflang="en" href="${enUrl}" />`)
    expect(html).toContain(`<link rel="alternate" hreflang="x-default" href="${deUrl}" />`)
    expect(html).toContain(`<meta property="og:url" content="${deUrl}" />`)
    expect(html).toContain('<meta property="og:type" content="article" />')
    expect(html).toContain('<meta property="og:locale" content="de_DE" />')
    expect(html).toContain('<meta property="og:locale:alternate" content="en_US" />')
  })

  it('sets English story head: lang=en, en canonical, swapped locales, same alternate pair', () => {
    const html = applyHead(SHELL, {
      lang: 'en', title: 'Moon — Firlefanz', desc: 'd', canonical: enUrl, img: abs(story.cover), ogType: 'article', deUrl, enUrl,
    })
    expect(html).toContain('<html lang="en">')
    expect(html).toContain(`<link rel="canonical" href="${enUrl}" />`)
    expect(html).toContain(`<link rel="alternate" hreflang="de" href="${deUrl}" />`)
    expect(html).toContain(`<link rel="alternate" hreflang="en" href="${enUrl}" />`)
    expect(html).toContain(`<link rel="alternate" hreflang="x-default" href="${deUrl}" />`)
    expect(html).toContain('<meta property="og:locale" content="en_US" />')
    expect(html).toContain('<meta property="og:locale:alternate" content="de_DE" />')
    // x-default always points at the German URL, never the English one
    expect(html).not.toContain(`hreflang="x-default" href="${enUrl}"`)
  })

  it('HTML-escapes the title and description', () => {
    const html = applyHead(SHELL, {
      lang: 'de', title: 'A & B', desc: '<x>', canonical: deUrl, img: 'i', ogType: 'article', deUrl, enUrl,
    })
    expect(html).toContain('<title>A &amp; B</title>')
    expect(html).toContain('content="&lt;x&gt;"')
  })
})

describe('buildSitemap', () => {
  it('lists both homes + both languages per story, each with hreflang alternates', () => {
    const xml = buildSitemap([story], '2026-01-02')
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    // 2 homes + 2 story variants = 4 <loc>
    expect(xml.match(/<loc>/g)?.length).toBe(4)
    expect(xml).toContain('<loc>https://firlefanz.li/</loc>')
    expect(xml).toContain('<loc>https://firlefanz.li/en/</loc>')
    expect(xml).toContain('<loc>https://firlefanz.li/geschichten/der-mond/</loc>')
    expect(xml).toContain('<loc>https://firlefanz.li/en/geschichten/der-mond/</loc>')
    // 4 urls × 3 alternates
    expect(xml.match(/<xhtml:link/g)?.length).toBe(12)
    // home lastmod = passed date; story lastmod = story.lastmod
    expect(xml).toContain('<lastmod>2026-01-02</lastmod>')
    expect(xml).toContain('<lastmod>2026-06-05</lastmod>')
  })
})

describe('readStories', () => {
  let dir: string

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'firlefanz-stories-'))
    const write = (id: string, data: unknown) => {
      fs.mkdirSync(path.join(dir, id), { recursive: true })
      fs.writeFileSync(path.join(dir, id, 'story.json'), JSON.stringify(data))
    }
    // Fully translated story (with multi-segment page text).
    write('a-story', {
      id: 'a-story', title: 'Titel A', teaser: 'Teaser A', coverImage: '/stories/a-story/cover.png',
      pages: [{ text: ['S1', 'x'] }, { text: ['S2'] }],
      translations: { en: { title: 'Title A', teaser: 'Teaser A EN', pages: [{ text: ['P1'] }, { text: ['P2'] }] } },
    })
    // No translation + no coverImage → English falls back to German, cover defaults.
    write('b-story', { id: 'b-story', title: 'Titel B', teaser: 'Teaser B', pages: [{ text: ['B1'] }] })
    // A non-story directory must be ignored.
    fs.mkdirSync(path.join(dir, 'not-a-story'), { recursive: true })
  })

  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }))

  it('reads + sorts stories, ignoring dirs without story.json', () => {
    const stories = readStories(dir)
    expect(stories.map((s) => s.id)).toEqual(['a-story', 'b-story'])
  })

  it('joins multi-segment page text and reads both languages when translated', () => {
    const a = readStories(dir).find((s) => s.id === 'a-story')!
    expect(a.de.pages).toEqual(['S1 x', 'S2'])
    expect(a.en.title).toBe('Title A')
    expect(a.en.pages).toEqual(['P1', 'P2'])
  })

  it('falls back to German per field when translations.en is missing', () => {
    const b = readStories(dir).find((s) => s.id === 'b-story')!
    expect(b.en.title).toBe(b.de.title)
    expect(b.en.teaser).toBe(b.de.teaser)
    expect(b.en.pages).toEqual(b.de.pages)
  })

  it('defaults the cover path and stamps an ISO date lastmod', () => {
    const b = readStories(dir).find((s) => s.id === 'b-story')!
    expect(b.cover).toBe('/stories/b-story/cover.png')
    expect(b.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
