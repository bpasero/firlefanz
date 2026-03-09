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

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), copyrightBannerPlugin()],
  test: {
    environment: 'happy-dom',
  },
})
