# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Firlefanz is an interactive kids' storybook generator. It creates illustrated stories set in the universe of **Firlefanz**, a dragon/dinosaur-like character (not human, no specific gender) who lives adventures in a fictional fantasy world. Firlefanz lives in a small house in a small village, next to his father **Papalapapp**. The target audience is young children aged 3–6 who can identify with Firlefanz as the main character.

The app generates new stories with both text and images, presented in a kids' book format suitable for reading aloud.

## Story Structure

Every Firlefanz story follows a consistent arc:

1. **Morning wake-up**: Firlefanz wakes up and thinks about what to do today. The kid listening typically suggests where to go or who to meet (a new friend, or someone Firlefanz already knows).
2. **Breakfast & wonder**: Firlefanz has a light breakfast, wondering what the journey might bring.
3. **Visiting Papalapapp**: Firlefanz heads over to Papalapapp, who is usually at home enjoying a morning coffee (but not always). Firlefanz asks how to get to the destination and often asks Papalapapp to join.
4. **Dressing up**: Firlefanz puts on travel gear — hat, walking stick, boots, jacket — preparing for a long journey.
5. **The great journey**: The journey is always epic in scale. Firlefanz (and often Papalapapp) travel over 7 seas, 7 deserts, 7 mountains, 7 rivers, 7 forests, and more before reaching the destination. This is a signature element of every story.
6. **The adventure**: The destination is a fantastical, fictional place. It may seem dangerous or mysterious at first, but quickly turns out to be welcoming. New friends are made and adventures unfold.
7. **Homeward**: At the end, Firlefanz has made new friends and heads home again.

### Tone & Style

- **Calming**: The ultimate goal is to make kids sleepy and eventually fall asleep. Stories should wind down, never frighten or overly excite.
- **Fantasy-rich**: Heavily inspired by Walter Moers' "Kapitän Blaubär" — fictional places, whimsical creatures, and imaginative world-building.
- **Warm & safe**: Even uncertain or mysterious moments resolve into happy, friendly encounters.
- **In German**: All story text must be written in German. Simple, clear German suitable for young children.
- **Age-appropriate**: Language and themes for children aged 3–6. Simple sentences, gentle pacing, read-aloud friendly.
- **Length limit**: Total story text per language must not exceed **4096 characters** (OpenAI TTS input limit). The entire story is narrated in a single TTS call for consistent tone.

## App Layout

### Authentication
- **PIN gate** — 6-digit PIN entry screen before accessing the app
- PIN stored in `sessionStorage` (persists for the browser session)
- PIN code is in `src/components/PinGate.tsx`

### Home / Story Library
- Styled as a **wooden bookshelf** with 3D standing book covers on a warm golden background
- 2-column grid on mobile, flexible wrap on larger screens
- Each book shows a cover image with title overlay; books lift on hover (desktop) or scale on tap (mobile)
- Clicking a book opens the story in the reader view
- Copyright footer at bottom
- Language toggle (DE/EN) and night mode toggle in the top-right corner

### Story Reader
- **Desktop**: Open book layout — illustration on the left page, text on the right page, with a spine divider; book uses 90vw width on desktop (`md:max-w-[90vw]`) to fill the screen like a real printed book; the inner book container uses `aspect-[3/1]` on desktop (matching two 3:2 image halves side-by-side) so images fill edge-to-edge without cropping or letterboxing; images use `object-cover` which works perfectly since the container matches the image aspect ratio
- **Mobile**: Stacked layout — illustration on top, text below, with a horizontal divider
- Paper-textured text page with page numbers, corner fold detail (desktop)
- Page turn animation (3D flip with shadows) when navigating
- **Flicker-free page turns** — the base `PageContent` is always mounted (never conditionally unmounted during flip); the flip overlay is layered on top; the target page starts at `opacity: 0` with a delayed `flipReveal` CSS animation so its opaque background doesn't flash before the image decodes; all `<img>` elements use `decoding="sync"`; adjacent images are pre-decoded (not just prefetched) via `img.decode()`. **Never use conditional rendering (`flip ? ... : ...`) that unmounts the current page's `<img>` elements** — mount overlay layers alongside the stable base instead.
- Navigation: click left/right thirds, arrow keys, swipe left/right on touch, or nav buttons
- Overscroll bounce disabled to prevent accidental navigation
- **No scrollbars** — the reader must never show scrollbars, neither on the page itself nor on the text panel; the reader uses `fixed inset-0` positioning to lock to the viewport; text uses dynamic font scaling (`useLayoutEffect` overflow detection with progressive `FONT_STEPS`) to shrink until it fits
- **Mobile**: compact spacing — smaller padding (`px-1.5 py-1`), smaller nav buttons (`w-9 h-9`), tighter text padding (`p-3`); mobile e2e tests verify no scrolling
- Header contains: back button, story title, narration toggle, language toggle, night mode toggle, page counter

### URL Hash Routing
- Story and page state is persisted in the URL hash: `#/story-id/page-number` (1-based)
- Reloading the page restores the active story and page position
- Browser back/forward buttons navigate between stories/pages via `hashchange` listener
- Going back to the library clears the hash
- No router dependency — uses `window.location.hash` directly

### Global UI Features
- **Night mode** — warm dark colour palette for bedtime reading; defaults to OS `prefers-color-scheme`, persisted in `localStorage`
- **Language toggle** — DE/EN (cycles through `SUPPORTED` in `src/context/LanguageContext.tsx`); defaults to browser language, persisted in `localStorage`
- **Audio narration** — pre-generated OpenAI TTS audio files (per-page MP3s) with `playbackRate = 1.2`; falls back to Web Speech API if audio file not found; toggle in story reader header
- All three toggles share the same visual style (small rounded pill buttons)

### Story Data
- Stories are **pre-generated** and stored as static data at `public/stories/<id>/`
- Each story directory contains: `story.json`, page images (`page-N.png`), cover image (`cover.png`), and a downloadable `book.pdf`
- Story JSON schema (see `src/types/story.ts`): id, title, teaser, coverImage, prompt, pages (each with `text: string[]` and image path), and optional `translations` object
- **Translations** are stored inline in `story.json` under `translations.<lang>` (e.g. `translations.en`). German is always the base language. Use `localizeStory(story, lang)` helper to get localized title/teaser/pages.
- Story drafts/ideas saved in `public/stories/drafts.json`
- All image/asset paths must use `import.meta.env.BASE_URL` prefix (for GitHub Pages deployment)

## Copyright & Protection

- **All Rights Reserved** license (see `LICENSE`)
- Copyright footer visible in the app
- All source files (`src/**/*.ts`, `scripts/**/*.ts`) include a `// © 2026 Benjamin Pasero` header comment
- Bundled output (JS + CSS) includes the copyright banner via the `copyrightBannerPlugin` in `vite.config.ts`
- PDF metadata includes author, copyright, and keywords
- All images have **invisible watermarking**: EXIF metadata + LSB steganography encoding copyright message
- Always generate images at **high quality** (`quality: 'high'`) — mobile bandwidth is handled by compressed WebP variants, not by reducing source quality
- After generating images, always run `npx tsx scripts/watermark-images.ts` before committing
- After watermarking, run `npx tsx scripts/compress-images.ts` to regenerate mobile WebP variants from the watermarked PNGs (run compress *after* watermark so variants are derived from the final files)
- After watermarking, regenerate PDFs so they contain watermarked images

## Deployment

- Hosted on **GitHub Pages** at `https://bpasero.github.io/firlefanz/`
- GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys on push to `main`
- Vite `base` is set to `/firlefanz/` for correct asset paths
- Node 22 required in CI

## Tech Stack

- **React** (TypeScript) with **Vite** for the frontend
- **Tailwind CSS v4** for styling (via `@tailwindcss/vite` plugin)
- **Vitest** with **happy-dom** for testing
- **PDFKit** for generating downloadable story PDFs
- **Sharp** for image watermarking (EXIF metadata + LSB steganography), icon generation, and mobile WebP compression
- **tsx** for running TypeScript scripts directly (`npx tsx scripts/*.ts`)
- **Playfair Display** and **Lora** fonts (self-hosted via `@fontsource`, Latin subset only)
- **Web Speech API** (browser built-in) for audio narration
- **Umami** for privacy-friendly analytics (script tag in `index.html`)
- **Copyright banner** injected into all bundled JS and CSS via a custom Vite plugin (`copyrightBannerPlugin` in `vite.config.ts`); uses `writeBundle` hook to reliably run after Vite's modulepreload polyfill injection

## PWA

- Installable as a PWA on iOS ("Add to Home Screen"), Android (install prompt), and desktop
- Web app manifest at `public/manifest.json` — `start_url` and `scope` set to `/firlefanz/`
- Service worker at `public/sw.js` — stale-while-revalidate caching strategy; offline-capable after first visit
- App icons at `public/icons/icon-192.png` and `public/icons/icon-512.png` (generated via `npx tsx scripts/generate-icons.ts`)
- Registered in `src/main.tsx` via `navigator.serviceWorker.register`
- SW cache name is `firlefanz-v1` — bump this when deploying breaking changes

## Commands

- `npm run dev` — start dev server
- `npm run dev -- --host` — start dev server accessible on local network (for testing on mobile)
- `npm run build` — type-check and build for production
- `npm run lint` — lint with ESLint
- `npm test` — run tests once
- `npm run test:watch` — run tests in watch mode
- `npm run test:e2e` — run Playwright UI smoke tests (reuses dev server if running)

## Testing Policy

**Always run `npm run test:e2e` after making changes to the UI** to verify nothing is broken. Fix any failures before considering the task done.

## Scripts

- `npx tsx scripts/generate-images-<story-slug>.ts` — generate story illustrations via OpenAI (`gpt-image-1`, `quality: 'high'`, `1536x1024`); always generate at high quality — mobile bandwidth is handled by the compressed WebP variants
- `npx tsx scripts/watermark-images.ts [story-id]` — watermark images (EXIF + steganography); all stories if no id given
- `npx tsx scripts/compress-images.ts [story-id]` — generate compressed mobile WebP variants (`<name>-mobile.webp`) alongside each PNG; max 800px wide, WebP quality 82 (~30–55 KB vs ~3.8 MB originals); served automatically on narrow viewports (≤768px) or slow connections via `src/hooks/useMobileImages.ts`
- `npx tsx scripts/generate-pdf.ts <story-id>` — generate downloadable PDF for a story
- `npx tsx scripts/translate-stories.ts [lang]` — translate all stories to target language (default: `en`) using GPT-4o-mini; adds `translations.<lang>` to each `story.json`; skips stories that already have that translation
- `npx tsx scripts/generate-icons.ts` — generate PWA icons (`public/icons/icon-192.png`, `public/icons/icon-512.png`) from a cover image using Sharp
- `npx tsx scripts/generate-audio.ts <story-id> [lang|all] [voice]` — generate per-page audio MP3 files via OpenAI TTS (`gpt-4o-mini-tts`, speed 1.0); the entire story is narrated in a single TTS call for consistent tone, then split into per-page files using Whisper word-level timestamps + ffmpeg; saved as `public/stories/<id>/audio-<lang>-page-N.mp3`; lang defaults to `de`, pass `all` for every available language; voice defaults to `fable` (available: alloy, echo, fable, onyx, nova, shimmer); requires `ffmpeg` installed locally
  - der-wolkenfluester → `fable` (warm British male)
  - am-ende-der-welt → `nova` (warm female)
  - die-stadt-der-vergessenen-spielzeuge → `fable` (warm British male)
  - goldi-im-labyrinth → `nova` (warm female)
  - das-tal-der-sanften-riesen → `shimmer` (warm female)
  - das-rockfestival → `fable` (warm British male)
  - der-zauber-zoo → `fable` (warm British male)

## Adding a New Language

1. Run `npx tsx scripts/translate-stories.ts <lang>` (e.g. `fr`)
2. Add the language code to the `SUPPORTED` array in `src/context/LanguageContext.tsx`
3. Commit and push

## Workflow for Adding a New Story

1. Write `story.json` in `public/stories/<id>/` (German base text)
2. Translate to English: `npx tsx scripts/translate-stories.ts en` (adds `translations.en` to `story.json`)
3. Create and run image generation script: `npx tsx scripts/generate-images-<slug>.ts`
4. Watermark images: `npx tsx scripts/watermark-images.ts <id>`
5. Generate mobile WebP variants: `npx tsx scripts/compress-images.ts <id>`
6. Generate PDF: `npx tsx scripts/generate-pdf.ts <id>`
7. Generate audio for both languages: `npx tsx scripts/generate-audio.ts <id> all`
8. Add story id to the `storyIds` array in `src/App.tsx`
9. Remove from `drafts.json` if applicable
10. Commit and push
