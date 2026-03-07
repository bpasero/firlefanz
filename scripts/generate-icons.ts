// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import sharp from 'sharp'
import { mkdirSync } from 'fs'

const sizes = [192, 512]
const src = 'public/stories/goldi-im-labyrinth/cover.png'
const outDir = 'public/icons'

mkdirSync(outDir, { recursive: true })

for (const size of sizes) {
  await sharp(src)
    .resize(size, size, { fit: 'cover', position: 'top' })
    .png()
    .toFile(`${outDir}/icon-${size}.png`)
  console.log(`Generated icon-${size}.png`)
}
