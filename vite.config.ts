// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/// <reference types="vitest/config" />
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const COPYRIGHT = '© 2026 Benjamin Pasero. All rights reserved. https://github.com/bpasero/firlefanz'

// Prepend copyright banner to all emitted JS and CSS files after build.
// Uses writeBundle (post-disk) because Vite's modulepreload polyfill injection
// runs after Rollup's banner option, making rollupOptions.output.banner unreliable.
function copyrightBannerPlugin(): Plugin {
  return {
    name: 'copyright-banner',
    enforce: 'post',
    apply: 'build',
    writeBundle(options, bundle) {
      const outDir = options.dir ?? 'dist'
      for (const fileName of Object.keys(bundle)) {
        if (!fileName.endsWith('.js') && !fileName.endsWith('.css')) continue
        const filePath = path.join(outDir, fileName)
        const content = fs.readFileSync(filePath, 'utf-8')
        const banner = fileName.endsWith('.css') ? `/* ${COPYRIGHT} */\n` : `// ${COPYRIGHT}\n`
        fs.writeFileSync(filePath, banner + content)
      }
    },
  }
}

const SITE_URL = 'https://firlefanz.li'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type SeoStory = { id: string; title: string; teaser: string; cover: string }

function readStories(): SeoStory[] {
  const storiesDir = path.resolve(__dirname, 'public/stories')
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
  const stories: SeoStory[] = []
  for (const id of ids) {
    try {
      const s = JSON.parse(fs.readFileSync(path.join(storiesDir, id, 'story.json'), 'utf-8'))
      stories.push({
        id: s.id ?? id,
        title: s.title ?? id,
        teaser: s.teaser ?? '',
        cover: s.coverImage ?? `/stories/${id}/cover.png`,
      })
    } catch {
      /* skip unreadable story */
    }
  }
  return stories
}

// Inject real, crawlable content into the otherwise-empty SPA shell so search
// engines (and crawlers that don't run JavaScript) see the full story catalogue.
// The markup lives inside #root, so React's createRoot() cleanly replaces it on
// mount — it is a no-JS / pre-render fallback, not part of the live app.
function seoPrerenderPlugin(): Plugin {
  return {
    name: 'seo-prerender',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const stories = readStories()
        if (!stories.length) return html

        const items = stories
          .map(
            (s) => `
        <li style="break-inside:avoid">
          <a href="#/${s.id}/1" style="display:block;color:inherit;text-decoration:none">
            <img src="${escapeHtml(s.cover)}" alt="${escapeHtml(s.title)}" width="320" height="213" loading="lazy" style="width:100%;height:auto;border-radius:.75rem;display:block" />
            <h3 style="font-size:1.15rem;margin:.6rem 0 .25rem">${escapeHtml(s.title)}</h3>
            <p style="margin:0;line-height:1.5;opacity:.85">${escapeHtml(s.teaser)}</p>
          </a>
        </li>`
          )
          .join('')

        const prerender = `<div id="root"><div id="seo-prerender" style="max-width:64rem;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,-apple-system,sans-serif;color:#5b4636">
      <h1 style="font-size:2rem;line-height:1.2;margin:0 0 .75rem">Firlefanz — Geschichten zum Einschlafen</h1>
      <p style="font-size:1.1rem;line-height:1.6;max-width:42rem;margin:0 0 2rem">Interaktive Gutenachtgeschichten für Kinder von 3 bis 6 Jahren. Firlefanz, ein liebenswertes drachenähnliches Wesen, erlebt zusammen mit seinem Papa Papalapapp fantastische Abenteuer — mit liebevollen Bildern, Vorlesefunktion und Nachtmodus. Kostenlos zum Vorlesen und sanften Einschlafen, auf Deutsch und Englisch.</p>
      <h2 style="font-size:1.4rem;margin:0 0 1rem">Alle Geschichten</h2>
      <ul style="list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.5rem">${items}
      </ul>
    </div></div>`

        const itemList = {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Firlefanz — Geschichten zum Einschlafen',
          description:
            'Alle interaktiven Gutenachtgeschichten von Firlefanz für Kinder von 3 bis 6 Jahren.',
          numberOfItems: stories.length,
          itemListElement: stories.map((s, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'CreativeWork',
              name: s.title,
              description: s.teaser,
              url: `${SITE_URL}/#/${s.id}/1`,
              image: `${SITE_URL}${s.cover}`,
              inLanguage: ['de', 'en'],
              genre: "Children's bedtime story",
              audience: { '@type': 'PeopleAudience', suggestedMinAge: 3, suggestedMaxAge: 6 },
            },
          })),
        }
        const jsonLd = `    <script type="application/ld+json">\n${JSON.stringify(itemList)}\n    </script>\n`

        return html
          .replace('<div id="root"></div>', prerender)
          .replace('</head>', `${jsonLd}  </head>`)
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), seoPrerenderPlugin(), copyrightBannerPlugin()],
  test: {
    environment: 'happy-dom',
    exclude: ['node_modules', 'dist', 'tests/e2e/**'],
    setupFiles: ['./vitest.setup.ts'],
  },
})
