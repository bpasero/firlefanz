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

### Story Reader
- **Desktop**: Open book layout — illustration on the left page, German text on the right page, with a spine divider
- **Mobile**: Stacked layout — illustration on top, text below, with a horizontal divider
- Paper-textured text page with page numbers, corner fold detail (desktop)
- Page turn animation (3D flip with shadows) when navigating
- Navigation: click left/right thirds, arrow keys, swipe left/right on touch, or nav buttons
- Overscroll bounce disabled to prevent accidental navigation
- Fully responsive with dynamic viewport height (`dvh`) for proper mobile sizing

### Story Data
- Stories are **pre-generated** and stored as static data at `public/stories/<id>/`
- Each story directory contains: `story.json`, page images (`page-N.png`), cover image (`cover.png`), and a downloadable `book.pdf`
- Story JSON schema (see `src/types/story.ts`): id, title, teaser, coverImage, prompt (original English prompt for regeneration), and pages (each with `text: string[]` for multiple paragraphs and an image path)
- Story drafts/ideas saved in `public/stories/drafts.json`
- All image/asset paths must use `import.meta.env.BASE_URL` prefix (for GitHub Pages deployment)

## Copyright & Protection

- **All Rights Reserved** license (see `LICENSE`)
- Copyright footer visible in the app
- PDF metadata includes author, copyright, and keywords
- All images have **invisible watermarking**: EXIF metadata + LSB steganography encoding copyright message
- After generating images, always run `node scripts/watermark-images.mjs` before committing
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
- **Sharp** for image watermarking (EXIF metadata + LSB steganography)
- **Playfair Display** and **Lora** fonts (self-hosted via `@fontsource`, Latin subset only)

## Commands

- `npm run dev` — start dev server
- `npm run dev -- --host` — start dev server accessible on local network (for testing on mobile)
- `npm run build` — type-check and build for production
- `npm run lint` — lint with ESLint
- `npm test` — run tests once
- `npm run test:watch` — run tests in watch mode

## Scripts

- `node scripts/generate-images-<story-slug>.mjs` — generate story illustrations via OpenAI
- `node scripts/watermark-images.mjs [story-id]` — watermark images (EXIF + steganography); all stories if no id given
- `node scripts/generate-pdf.mjs <story-id>` — generate downloadable PDF for a story

## Workflow for Adding a New Story

1. Write `story.json` in `public/stories/<id>/`
2. Create and run image generation script: `node scripts/generate-images-<slug>.mjs`
3. Watermark images: `node scripts/watermark-images.mjs <id>`
4. Generate PDF: `node scripts/generate-pdf.mjs <id>`
5. Add story id to the `storyIds` array in `src/App.tsx`
6. Remove from `drafts.json` if applicable
7. Commit and push
