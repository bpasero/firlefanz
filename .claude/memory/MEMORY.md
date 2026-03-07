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
- Toggle buttons are small rounded pills: `rgba(255,255,255,0.4)` day / `rgba(255,255,255,0.12)` night, colour `#7c4a1e` day / `#e8d5b7` night

## Features Added (not in original CLAUDE.md)

### Night Mode (`src/context/NightModeContext.tsx`)
- Defaults to OS `prefers-color-scheme`, persisted in `localStorage`
- Toggle in library (top-right) and reader header
- Day palette: bg `#f9e8c9→#d4a05a`, text `#7c4a1e`, page `#fdf8ed`
- Night palette: bg `#1e1810→#12100c`, text `#e8d5b7`, page `#2a2418`

### Multi-language (`src/context/LanguageContext.tsx`)
- Defaults to browser language, persisted in `localStorage`; falls back to `de`
- `SUPPORTED = ['de', 'en']` — add new codes here to enable more languages
- Translations stored inline in `story.json` under `translations.<lang>`; German is always the base
- `localizeStory(story, lang)` in `src/types/story.ts` returns title/teaser/pages in active language
- Translate new stories: `node scripts/translate-stories.mjs [lang]` (uses GPT-4o-mini)

### Audio Narration (`src/components/NarrationToggle.tsx`)
- Web Speech API, no external dependency
- Rate `0.88`, lang `de-DE` or `en-US` matching active language
- Picks best matching installed voice; falls back to default
- Toggle in reader header; cancels on page turn, back navigation, and unmount

### PWA
- Manifest: `public/manifest.json`, SW: `public/sw.js` (stale-while-revalidate)
- Cache name `firlefanz-v1` — bump when deploying breaking changes
- Icons at `public/icons/` — regenerate with `node scripts/generate-icons.mjs`
- Registered in `src/main.tsx`

### Analytics
- Umami script tag in `index.html` (privacy-friendly, no cookies)

### Performance
- Adjacent page images preloaded in `StoryReader` on every page change
- Book container has explicit `backgroundColor` to prevent white flicker during 3D flip on mobile
