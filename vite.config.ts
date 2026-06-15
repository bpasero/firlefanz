// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

/// <reference types="vitest/config" />
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {
  LANGS,
  UI,
  readStories,
  storyUrl,
  homeUrl,
  abs,
  buildHomeRoot,
  buildHomeLd,
  buildStoryRoot,
  buildStoryLd,
  applyHead,
  buildSitemap,
} from './scripts/seo-prerender'

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

// Inject real, crawlable content into the otherwise-empty SPA shell so search
// engines (and crawlers that don't run JavaScript) see the full story catalogue.
// The markup lives inside #root, so React's createRoot() cleanly replaces it on
// mount — it is a no-JS / pre-render fallback, not part of the live app.
//
// transformIndexHtml prerenders the homepage catalogue; closeBundle then emits a
// real, deep-content HTML file per story (so each story has its own crawlable URL
// on static GitHub Pages), plus a 404.html SPA fallback and a full sitemap.
function seoPrerenderPlugin(): Plugin {
  const storiesDir = path.resolve(__dirname, 'public/stories')
  return {
    name: 'seo-prerender',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const stories = readStories(storiesDir)
        if (!stories.length) return html
        // The served index.html is the German homepage; closeBundle derives the
        // English homepage and all per-story pages from it.
        return html
          .replace('<div id="root"></div>', buildHomeRoot(stories, 'de'))
          .replace('</head>', `${buildHomeLd(stories, 'de')}  </head>`)
      },
    },
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist')
      const indexPath = path.join(outDir, 'index.html')
      if (!fs.existsSync(indexPath)) return
      const stories = readStories(storiesDir)
      if (!stories.length) return

      const shell = fs.readFileSync(indexPath, 'utf-8')
      const homeRootDe = buildHomeRoot(stories, 'de')
      const homeLdDe = buildHomeLd(stories, 'de')

      const homeImg = abs('/stories/der-glaeserne-strand/cover.png')
      const homeAlts = { deUrl: abs(homeUrl('de')), enUrl: abs(homeUrl('en')) }

      const write = (rel: string, html: string) => {
        const file = path.join(outDir, rel)
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, html)
      }

      // Per-story pages, both languages.
      for (const s of stories) {
        const alts = { deUrl: abs(storyUrl(s.id, 'de')), enUrl: abs(storyUrl(s.id, 'en')) }
        for (const lang of LANGS) {
          const swapped = shell.replace(homeRootDe, buildStoryRoot(s, lang))
          if (swapped === shell) {
            throw new Error(`seo-prerender: homepage #root block not found while building ${storyUrl(s.id, lang)}`)
          }
          const html = applyHead(swapped.replace(homeLdDe, buildStoryLd(s, lang)), {
            lang,
            title: `${s[lang].title} — ${UI[lang].titleSuffix}`,
            desc: s[lang].teaser,
            canonical: abs(storyUrl(s.id, lang)),
            img: abs(s.cover),
            ogType: 'article',
            ...alts,
          })
          write(path.join(lang === 'en' ? 'en/geschichten' : 'geschichten', s.id, 'index.html'), html)
        }
      }

      // English homepage (catalogue) at /en/.
      const enHome = applyHead(
        shell.replace(homeRootDe, buildHomeRoot(stories, 'en')).replace(homeLdDe, buildHomeLd(stories, 'en')),
        { lang: 'en', title: UI.en.homeTitle, desc: UI.en.homeDesc, canonical: abs(homeUrl('en')), img: homeImg, ogType: 'website', ...homeAlts }
      )
      write('en/index.html', enHome)

      // Fix the German homepage head in place (hreflang/locale alternates).
      const deHome = applyHead(shell, {
        lang: 'de', title: UI.de.homeTitle, desc: UI.de.homeDesc, canonical: abs(homeUrl('de')), img: homeImg, ogType: 'website', ...homeAlts,
      })
      write('index.html', deHome)

      // SPA fallback so client-side navigation to any non-prerendered path boots the app.
      write('404.html', deHome)
      // Full sitemap listing both languages of the homepage + every story page.
      write('sitemap.xml', buildSitemap(stories, new Date().toISOString().slice(0, 10)))
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
