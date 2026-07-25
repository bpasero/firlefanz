# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Firlefanz is an interactive kids' storybook generator. It creates illustrated stories set in the universe of **Firlefanz**, a dragon/dinosaur-like character (not human, no specific gender) who lives adventures in a fictional fantasy world. Firlefanz lives in a small house in a small village, next to his father **Papalapapp**. The target audience is young children aged 3–6 who can identify with Firlefanz as the main character.

**Character uniqueness rule**: There is exactly **one** Firlefanz and exactly **one** Papalapapp in the entire universe. Any image showing two or more Firlefanz figures, or two or more Papalapapp figures, is a critical error. Every generated image prompt must make this explicit.

**No text in images rule**: Images must never contain text, words, letters, labels, signs, or writing of any kind, unless explicitly required by the scene (e.g. a street sign that is central to the story). Every image generation script must include a strong no-text instruction such as: `"No text, words, letters, labels, signs, or writing of any kind anywhere in the image."`

The app generates new stories with both text and images, presented in a kids' book format suitable for reading aloud.

## Story Structure

Every Firlefanz story follows a consistent arc:

1. **Morning wake-up**: Firlefanz wakes up and thinks about what to do today. The kid listening typically suggests where to go or who to meet (a new friend, or someone Firlefanz already knows).
2. **Breakfast & wonder**: Firlefanz has a light breakfast, wondering what the journey might bring.
3. **Visiting Papalapapp**: Firlefanz heads over to Papalapapp, who is usually at home enjoying a morning coffee (but not always). Firlefanz asks how to get to the destination and often asks Papalapapp to join.
4. **Dressing up**: Firlefanz puts on travel gear — hat, walking stick, boots, jacket — preparing for a long journey.
5. **The great journey**: The journey is always epic in scale. Firlefanz (and often Papalapapp) travel over 7 seas, 7 deserts, 7 mountains, 7 rivers, 7 forests, and more before reaching the destination. This is a signature element of every story. For stories where the destination is nearby (e.g. in the village), adapt the journey to a village scale — over seven lanes, seven bridges, seven hills, etc. — so it still feels grand through a child's eyes.
6. **The adventure**: The destination is a fantastical, fictional place. It may seem dangerous or mysterious at first, but quickly turns out to be welcoming. New friends are made and adventures unfold.
7. **Homeward**: At the end, Firlefanz has made new friends and heads home again.

### Tone & Style

- **Calming**: The ultimate goal is to make kids sleepy and eventually fall asleep. Stories should wind down, never frighten or overly excite.
- **Fantasy-rich**: Heavily inspired by Walter Moers' "Kapitän Blaubär" — fictional places, whimsical creatures, and imaginative world-building.
- **Warm & safe**: Even uncertain or mysterious moments resolve into happy, friendly encounters.
- **In German**: All story text must be written in German. Simple, clear German suitable for young children.
- **Age-appropriate**: Language and themes for children aged 3–6. Simple sentences, gentle pacing, read-aloud friendly.
- **Length limit**: Keep total story text per language to roughly **4096 characters** for gentle bedtime pacing. (Narration is generated per page via Gemini TTS, so the old single-call hard limit no longer applies — but concise stories still read best.)

## App Layout

UI rules for the home library, story reader, URL routing and global UI features live in `src/CLAUDE.md`, which loads automatically when working with files under `src/`.

### Story Data

- Stories are **pre-generated** and stored as static data at `public/stories/<id>/`; the JSON schema is `src/types/story.ts`
- **Translations** are stored inline in `story.json` under `translations.<lang>` (e.g. `translations.en`). German is always the base language. Use `localizeStory(story, lang)` helper to get localized title/teaser/pages.
- **Dialog quotes in story.json**: Always use escaped ASCII double quotes (`\"...\""`) for dialog inside JSON string values. Unicode curly quotes (`"..."`) look similar but the closing `"` (U+201C) can be confused with a straight `"` (U+0022) and break JSON parsing. Use `\"` consistently.
- Story drafts/ideas saved in `public/stories/drafts.json`
- All image/asset paths must use `import.meta.env.BASE_URL` prefix (for GitHub Pages deployment)

## Copyright & Protection

- **All Rights Reserved** license (see `LICENSE`)
- Copyright footer visible in the app
- All source files (`src/**/*.ts`, `scripts/**/*.ts`) include a `// © 2026 Benjamin Pasero` header comment
- Bundled output (JS + CSS) includes the copyright banner via the `copyrightBannerPlugin` in `vite.config.ts`; it uses the `writeBundle` hook to reliably run **after** Vite's modulepreload polyfill injection
- PDF metadata includes title and keywords (no author name or copyright statement in the PDF itself)
- All images have **invisible watermarking**: EXIF metadata + LSB steganography encoding copyright message
- Always generate images at **high quality** (`quality: 'high'`) — mobile bandwidth is handled by compressed WebP variants, not by reducing source quality
- After generating images, always run `npx tsx scripts/watermark-images.ts` before committing
- After watermarking, run `npx tsx scripts/compress-images.ts` to regenerate mobile WebP variants from the watermarked PNGs (run compress *after* watermark so variants are derived from the final files)
- After watermarking, regenerate PDFs so they contain watermarked images

## Deployment

- Hosted on **GitHub Pages** at `https://firlefanz.li` (custom domain via `public/CNAME`)
- Vite `base` is set to `/` (root) — hosted at a custom top-level domain

## PWA

- The app is installable as a PWA (manifest, service worker and icons live in `public/`)
- SW cache name is `firlefanz-v1` — bump this when deploying breaking changes

## Testing Policy

**Always run `npm run build` after any code change** to verify there are no TypeScript compile errors. Fix any failures before considering the task done.

**Always run `npm run test:e2e` after making changes to the UI** to verify nothing is broken. Fix any failures before considering the task done.

## Scripts

Asset scripts run with `npx tsx scripts/<name>.ts`. Details, flags, env knobs and gotchas live in skills: `story-scripts` (compress, translate, cover PNG, icons, API keys), plus `openai-image-generation`, `image-watermarking`, `pdf-generation`, `gemini-audio-generation` and `lyria-music-generation`.

## Adding a New Language

See the `new-language` skill.

## Workflow for Adding a New Story

See the `new-story` skill. Every story gets images, watermarking, WebP variants, a PDF, DE+EN narration and a background-music track — don't skip steps.
