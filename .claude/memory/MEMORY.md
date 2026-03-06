# Firlefanz Project Memory

## Key Decisions
- Father's name is **Papalapapp** (not Paperlapapp)
- Firlefanz is a dragon/dinosaur creature, no specific gender
- All stories in **German**, simple language for ages 3-6
- User prefers **local fonts** (via @fontsource), not CDN/Google Fonts
- User prefers **OpenAI gpt-image-1** for image generation (Google Nano Banana had quota/reliability issues)
- Image size: `1536x1024` landscape, quality: `medium`
- User does not like complex page-turn animations — keep it simple
- PDF download button is hidden from the UI (but PDFs and script still exist)
- Site is protected with a 6-digit PIN gate (client-side, sessionStorage)
- All images must be watermarked before committing (EXIF + LSB steganography)
- Asset paths must use `import.meta.env.BASE_URL` (GitHub Pages base: `/firlefanz/`)

## Workflow for New Stories
1. Write `story.json` in `public/stories/<id>/`
2. Create and run image generation script
3. Watermark: `node scripts/watermark-images.mjs <id>`
4. Generate PDF: `node scripts/generate-pdf.mjs <id>`
5. Add story id to `storyIds` array in `src/App.tsx`
6. Remove from `drafts.json` if applicable
7. Commit and push (auto-deploys to GitHub Pages)

## Stories
1. **Goldi im Labyrinth** — visiting ape friend Goldi in a labyrinth
2. **Am Ende der Welt** — traveling to the end of the world, meeting Glimmi
3. **Die Stadt der vergessenen Spielzeuge** — finding a lost toy, toy city with Brummel
4. **Der Wolkenflüsterer** — helping Wölkchen repaint the grey sky
5. **Drafts** in `public/stories/drafts.json`: Die Traumfabrik, Der Mondgarten, Das Lied der Meerjungfische

## Characters
- **Firlefanz** — small friendly green dragon/dinosaur, main character
- **Papalapapp** — same species, larger, fatherly
- **Goldi** — golden ape friend (story 1)
- **Glimmi** — tiny fluffy glowing star creature (story 2)
- **Brummel** — old teddy bear mayor with glasses (story 3)
- **Wölkchen** — small fluffy cloud creature, paints clouds (story 4)

## UI Preferences
- Warm golden tones, not dark/sterile
- Simple page-turn animation (user rejected complex ones twice)
- Responsive: 2-col grid mobile, flex wrap desktop
- Reader stacks vertically on mobile (image top, text bottom)
- Swipe support for touch, arrow keys for desktop
- No bounce/overscroll on mobile
- Tight spacing on mobile between book and nav buttons
