// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

// Build-time SEO prerender helpers. Pure string builders + story reader, shared
// by the Vite plugin (vite.config.ts) and unit tests (seo-prerender.test.ts).
// Kept framework-free (only fs/path) so it runs in Node and under Vitest.

import fs from 'fs'
import path from 'path'

export const SITE_URL = 'https://firlefanz.li'
export const BASE_PATH = '/' // Vite base — also the leading path segment for story URLs

export type Lang = 'de' | 'en'
export type Loc = { title: string; teaser: string; pages: string[] }
export type SeoStory = { id: string; cover: string; lastmod: string; de: Loc; en: Loc }

export const LANGS: Lang[] = ['de', 'en']

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// UI chrome strings for the language-specific prerender fallbacks.
export const UI = {
  de: {
    homeTitle: 'Firlefanz — Geschichten zum Einschlafen',
    homeDesc:
      'Alle interaktiven Gutenachtgeschichten von Firlefanz für Kinder von 3 bis 6 Jahren.',
    homeIntro:
      'Interaktive Gutenachtgeschichten für Kinder von 3 bis 6 Jahren. Firlefanz, ein liebenswertes drachenähnliches Wesen, erlebt zusammen mit seinem Papa Papalapapp fantastische Abenteuer — mit liebevollen Bildern, Vorlesefunktion und Nachtmodus. Kostenlos zum Vorlesen und sanften Einschlafen, auf Deutsch und Englisch.',
    allStories: 'Alle Geschichten',
    back: '← Alle Geschichten',
    titleSuffix: 'Gutenachtgeschichte zum Vorlesen',
  },
  en: {
    homeTitle: 'Firlefanz — Bedtime Stories',
    homeDesc: 'All of Firlefanz’s interactive bedtime stories for children aged 3 to 6.',
    homeIntro:
      'Interactive bedtime stories for children aged 3 to 6. Firlefanz, a lovable dragon-like creature, sets off on fantastical adventures together with his dad Papalapapp — with loving illustrations, read-aloud narration and a night mode. Free to read aloud and drift gently to sleep, in German and English.',
    allStories: 'All Stories',
    back: '← All Stories',
    titleSuffix: 'Bedtime Story to Read Aloud',
  },
} as const

export function readStories(storiesDir: string): SeoStory[] {
  let ids: string[] = []
  try {
    ids = fs
      .readdirSync(storiesDir)
      .filter((d) => {
        try {
          return (
            fs.statSync(path.join(storiesDir, d)).isDirectory() &&
            fs.existsSync(path.join(storiesDir, d, 'story.json'))
          )
        } catch {
          return false
        }
      })
      .sort()
  } catch {
    return []
  }
  const pageText = (p: { text?: string[] | string }) =>
    Array.isArray(p?.text) ? p.text.join(' ') : p?.text ?? ''
  const stories: SeoStory[] = []
  for (const id of ids) {
    try {
      const file = path.join(storiesDir, id, 'story.json')
      const s = JSON.parse(fs.readFileSync(file, 'utf-8'))
      const basePages: { text?: string[] | string }[] = Array.isArray(s.pages) ? s.pages : []
      const de: Loc = {
        title: s.title ?? id,
        teaser: s.teaser ?? '',
        pages: basePages.map(pageText),
      }
      // English from translations.en, falling back to German per field.
      const t = s.translations?.en
      const en: Loc = {
        title: t?.title ?? de.title,
        teaser: t?.teaser ?? de.teaser,
        pages: basePages.map((p, i) => pageText(t?.pages?.[i] ?? p)),
      }
      stories.push({
        id: s.id ?? id,
        cover: s.coverImage ?? `/stories/${id}/cover.png`,
        lastmod: fs.statSync(file).mtime.toISOString().slice(0, 10),
        de,
        en,
      })
    } catch {
      /* skip unreadable story */
    }
  }
  return stories
}

export const storyUrl = (id: string, lang: Lang) =>
  `${BASE_PATH}${lang === 'en' ? 'en/' : ''}geschichten/${id}/`
export const homeUrl = (lang: Lang) => (lang === 'en' ? `${BASE_PATH}en/` : BASE_PATH)
export const abs = (p: string) => `${SITE_URL}${p}`

// ---- shared prerender builders (used by both the homepage transform and the
// per-story page emitter so the strings match exactly for swapping) -----------

export function buildHomeRoot(stories: SeoStory[], lang: Lang): string {
  const ui = UI[lang]
  const items = stories
    .map((s) => {
      const loc = s[lang]
      return `
        <li style="break-inside:avoid">
          <a href="${storyUrl(s.id, lang)}" style="display:block;color:inherit;text-decoration:none">
            <img src="${escapeHtml(s.cover)}" alt="${escapeHtml(loc.title)}" width="320" height="213" loading="lazy" style="width:100%;height:auto;border-radius:.75rem;display:block" />
            <h3 style="font-size:1.15rem;margin:.6rem 0 .25rem">${escapeHtml(loc.title)}</h3>
            <p style="margin:0;line-height:1.5;opacity:.85">${escapeHtml(loc.teaser)}</p>
          </a>
        </li>`
    })
    .join('')
  return `<div id="root"><div id="seo-prerender" style="max-width:64rem;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,-apple-system,sans-serif;color:#5b4636">
      <h1 style="font-size:2rem;line-height:1.2;margin:0 0 .75rem">${escapeHtml(ui.homeTitle)}</h1>
      <p style="font-size:1.1rem;line-height:1.6;max-width:42rem;margin:0 0 2rem">${escapeHtml(ui.homeIntro)}</p>
      <h2 style="font-size:1.4rem;margin:0 0 1rem">${escapeHtml(ui.allStories)}</h2>
      <ul style="list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.5rem">${items}
      </ul>
    </div></div>`
}

export function buildHomeLd(stories: SeoStory[], lang: Lang): string {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: UI[lang].homeTitle,
    description: UI[lang].homeDesc,
    numberOfItems: stories.length,
    itemListElement: stories.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: s[lang].title,
        description: s[lang].teaser,
        url: abs(storyUrl(s.id, lang)),
        image: abs(s.cover),
        inLanguage: lang,
        genre: "Children's bedtime story",
        audience: { '@type': 'PeopleAudience', suggestedMinAge: 3, suggestedMaxAge: 6 },
      },
    })),
  }
  return `    <script type="application/ld+json">\n${JSON.stringify(itemList)}\n    </script>\n`
}

export function buildStoryRoot(s: SeoStory, lang: Lang): string {
  const loc = s[lang]
  const paras = loc.pages
    .filter((t) => t.trim())
    .map((t) => `\n        <p style="margin:0 0 1rem;line-height:1.7">${escapeHtml(t)}</p>`)
    .join('')
  return `<div id="root"><div id="seo-prerender" style="max-width:48rem;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,-apple-system,sans-serif;color:#5b4636">
      <p style="margin:0 0 1.5rem"><a href="${homeUrl(lang)}" style="color:inherit">${escapeHtml(UI[lang].back)}</a></p>
      <h1 style="font-size:2rem;line-height:1.2;margin:0 0 1rem">${escapeHtml(loc.title)}</h1>
      <img src="${escapeHtml(s.cover)}" alt="${escapeHtml(loc.title)}" width="768" height="512" style="width:100%;height:auto;border-radius:.75rem;display:block;margin:0 0 1.5rem" />
      <p style="font-size:1.1rem;line-height:1.6;font-style:italic;margin:0 0 2rem">${escapeHtml(loc.teaser)}</p>${paras}
    </div></div>`
}

export function buildStoryLd(s: SeoStory, lang: Lang): string {
  const work = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: s[lang].title,
    description: s[lang].teaser,
    url: abs(storyUrl(s.id, lang)),
    image: abs(s.cover),
    inLanguage: lang,
    genre: "Children's bedtime story",
    isAccessibleForFree: true,
    author: { '@type': 'Person', name: 'Benjamin Pasero' },
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 3, suggestedMaxAge: 6 },
  }
  return `    <script type="application/ld+json">\n${JSON.stringify(work)}\n    </script>\n`
}

// Rewrite the (German) index.html head for a specific page + language: title,
// description, canonical, og/twitter, og:locale, <html lang>, and the three
// reciprocal hreflang alternates (de URL, en URL, x-default = de URL).
export function applyHead(
  html: string,
  opts: { lang: Lang; title: string; desc: string; canonical: string; img: string; ogType: string; deUrl: string; enUrl: string }
): string {
  const { lang, title, desc, canonical, img, ogType, deUrl, enUrl } = opts
  return html
    .replace('<html lang="de">', `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(desc)}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<link rel="alternate" hreflang="de" href="[^"]*" \/>/, `<link rel="alternate" hreflang="de" href="${deUrl}" />`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*" \/>/, `<link rel="alternate" hreflang="en" href="${enUrl}" />`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/, `<link rel="alternate" hreflang="x-default" href="${deUrl}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(desc)}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${img}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${ogType}" />`)
    .replace(/<meta property="og:locale" content="[^"]*" \/>/, `<meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'de_DE'}" />`)
    .replace(/<meta property="og:locale:alternate" content="[^"]*" \/>/, `<meta property="og:locale:alternate" content="${lang === 'en' ? 'de_DE' : 'en_US'}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeHtml(desc)}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${img}" />`)
}

export function buildSitemap(stories: SeoStory[], today: string): string {
  // Each <url> declares all language variants via xhtml:link alternates.
  const entry = (loc: string, lastmod: string, priority: string, changefreq: string, alts: { de: string; en: string }) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n` +
    `    <xhtml:link rel="alternate" hreflang="de" href="${alts.de}" />\n` +
    `    <xhtml:link rel="alternate" hreflang="en" href="${alts.en}" />\n` +
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${alts.de}" />\n  </url>`
  const homeAlts = { de: abs(homeUrl('de')), en: abs(homeUrl('en')) }
  const urls: string[] = [
    entry(abs(homeUrl('de')), today, '1.0', 'weekly', homeAlts),
    entry(abs(homeUrl('en')), today, '0.9', 'weekly', homeAlts),
  ]
  for (const s of stories) {
    const alts = { de: abs(storyUrl(s.id, 'de')), en: abs(storyUrl(s.id, 'en')) }
    urls.push(entry(alts.de, s.lastmod, '0.8', 'monthly', alts))
    urls.push(entry(alts.en, s.lastmod, '0.8', 'monthly', alts))
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}
