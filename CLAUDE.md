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

### Home / Story Library — "Das Nachtlicht" (the nightlight nook)
The home page (`src/components/StoryLibrary.tsx`) is styled as the warm corner of a child's room at dusk — a single nightlight glowing from the top-left, the covers shown as little framed pictures on warm wooden shelves. It is calm and bedtime-appropriate first, joyful second.
- **Covers are 3:2 landscape (1536×1024) and must ALWAYS render at their true `aspect-[3/2]`** — never `aspect-[2/3]`. The old portrait crop guttered every painting (cut off the subjects on each side); showing full 3:2 is the single most important visual rule here.
- **Header nook** (top-left anchored, never centered): a circular "nightlight locket" containing a live CSS crop of `der-glaeserne-strand`'s cover (the one verified single-Firlefanz cover — **never** crop a two-dragon cover like der-mond/die-bunte-rakete/der-zauber-zoo/der-kindergarten) — zoomed to Firlefanz's face via `transform: scale` + `object-position`, gently breathing. Beside it: a **time-of-day-aware greeting** (Fredoka, three buckets from `new Date().getHours()` — morning/day/evening, DE+EN) and the series sub-label **"Geschichten zum Einschlafen" / "Bedtime Stories"** (Lora italic; e2e uses this exact text as the "on the library" signal — keep it).
- **Three-tier hierarchy** (antidote to "27 identical cards"): (1) **Keep-reading nook** — conditional; reads `localStorage['firlefanz-last-read']` (`{id,page,total}`, written by `App.tsx` via `src/lib/lastRead.ts` on open + every page turn), resumes via `#/{id}/{page}`; absent if nothing in progress. (2) **Featured "Heute Nacht / Tonight"** — one deterministic daily pick (`dayOfYear % stories.length`, stable all day), with a "Zeig mir eine andere Geschichte / Show me another story" link that advances it (cross-fade). (3) **Themed shelves** — a static `SHELVES` const (4 bands) with a guaranteed catch-all "Mehr Geschichten / More Stories" bucket so a new story can never silently vanish; featured + keep-reading ids are excluded so nothing shows twice. A **"🌙 Überrasch mich / Surprise me"** pill opens a random story (light-sweep, then navigate).
- **Frames**: each cover sits in a cream passe-partout **mat** with a thin keyline, caption **below** the painting (Fredoka 500, `line-clamp-2`, never a dark scrim over the art), a stable per-id micro-tilt (`hashTilt`, ±1.5°) so the wall looks hand-hung, and a warm halo. Calm hover lift (`.nl-lift`, 320ms, no overshoot); featured frame tips toward the viewer (`.nl-featured-lift`). Each frame stays a `<button>` carrying `onClick={onSelectStory}` + the `onContextMenu` context menu, exactly as before.
- **Layout**: responsive grid `repeat(auto-fill, minmax(248px, 1fr))` → one landscape frame per row on phones, ~4 on desktop; each themed band rests on a wooden ledge. The library scrolls vertically on mobile (only the *reader* must be no-scroll).
- **Fonts**: **Fredoka** (newly used) is the kid-facing voice (greeting, titles, section labels, captions, pill labels); **Lora** italic is the quiet connective tissue (sub-label, teaser, "Seite X von Y", copyright); **Playfair Display** is retired from the home page (it stays the reader/PDF voice).
- **Day/night**: warm honey "golden-hour" palette by day; a true warm bedtime **dark** by night (`DAY`/`NIGHT` token objects) — covers stay near-full brightness (`brightness(.95)`) as the "lit windows" while the room deepens into shadow (do **not** dim covers to .75/.82, and no dark scrim). Switching INTO night is "dusk falling": a dual-layer **background crossfade** (`.nl-bgfade`, opacity) plus a per-frame "lights coming on" cascade (`nlLightsOn`, re-keyed via `revealKey` on entering night mode).
- **Ambient** (all `pointer-events-none`, motivated by the lamplit fiction, NOT scattered emoji/stars): a top-left nightlight glow that faintly flickers, a few drifting dust motes, a faint SVG paper-grain overlay, and a bottom vignette. **All motion (keyframes in `src/index.css`, prefixed `nl*`) is gated behind `@media (prefers-reduced-motion: reduce)`** — base styles are the resting visible state so the page is fully calm and usable with motion off.
- Language toggle (DE/EN) and night-mode toggle in the top-right; copyright line at the bottom.

### Story Reader
- **Desktop**: Open book layout — illustration on the left page, text on the right page, with a spine divider; book uses 90vw width on desktop (`md:max-w-[90vw]`) to fill the screen like a real printed book; the inner book container uses `aspect-[3/1]` on desktop (matching two 3:2 image halves side-by-side) so images fill edge-to-edge without cropping or letterboxing; images use `object-cover` which works perfectly since the container matches the image aspect ratio
- **Mobile portrait**: Stacked layout — illustration on top (40% height), text below (60% height), with a horizontal divider
- **Mobile landscape**: Open book layout (same as desktop) — when a phone is turned sideways, `useIsLandscapeMobile()` detects `(orientation: landscape) and (max-height: 600px)` and switches to side-by-side layout with a vertical spine; nav buttons are hidden to save vertical space (swipe gestures and click zones still work); smaller font step set (`FONT_STEPS_LANDSCAPE`) is used since height is very limited; spacing is tightened (`px-2 py-0.5`, no `sm:` padding expansion)
- Paper-textured text page with page numbers, corner fold detail (desktop + landscape mobile)
- Page turn animation (3D flip with shadows) when navigating
- **Flicker-free page turns** — the base `PageContent` is always mounted (never conditionally unmounted during flip); the flip overlay is layered on top; the target page starts at `opacity: 0` with a delayed `flipReveal` CSS animation so its opaque background doesn't flash before the image decodes; all `<img>` elements use `decoding="sync"`; adjacent images are pre-decoded (not just prefetched) via `img.decode()`. **Never use conditional rendering (`flip ? ... : ...`) that unmounts the current page's `<img>` elements** — mount overlay layers alongside the stable base instead.
- Navigation: click left/right thirds, arrow keys, swipe left/right on touch, or nav buttons (nav buttons hidden in landscape mobile)
- Overscroll bounce disabled to prevent accidental navigation
- **No scrollbars** — the reader must never show scrollbars, neither on the page itself nor on the text panel; the reader uses `fixed inset-0` positioning to lock to the viewport; text uses dynamic font scaling (`useLayoutEffect` overflow detection with progressive `FONT_STEPS`) to shrink until it fits; three font step sets: `FONT_STEPS_DESKTOP`, `FONT_STEPS_MOBILE`, `FONT_STEPS_LANDSCAPE`
- **Mobile portrait**: compact spacing — smaller padding (`px-1.5 py-1`), smaller nav buttons (`w-9 h-9`), tighter text padding (`p-3`); mobile e2e tests verify no scrolling
- Header contains: back button, story title, narration toggle, music toggle (shown only when the story has a `music` field), language toggle, night mode toggle, fullscreen toggle, page counter

### URL Routing (path-based + bilingual, for SEO)
- **The URL is the source of truth for language.** German (default): `/` , `/geschichten/<story-id>/`. English: `/en/` , `/en/geschichten/<story-id>/`. The page within a story is a non-indexed hash suffix (`#<n>`, 1-based), so each story keeps exactly **one canonical URL per language** (no thin per-page duplicates). (`geschichten` avoids colliding with the `/stories/<id>/...` asset path.)
- `src/lib/routes.ts` is the single source of truth for URL↔language↔story mapping: `langFromPath`, `homePath(lang)`, `storyPath(id, lang)`, `parseLocation(pathname, hash)`, `swapLangPath`. Imported by `App.tsx`, `LanguageContext.tsx`, and `StoryLibrary.tsx` (leaf module → no import cycle).
- `App.tsx` resolves the active story/page via `parseLocation` and navigates with the **History API**. `openStory(story, page?)` pushes the story URL **in the current language**; `closeStory()` returns to that language's home; page turns set the hash. Browser back/forward is handled by **both** `popstate` (story open/close + language switch) and `hashchange` (page turns); the `route()` listener no-ops while stories are still loading.
- **Language switching** (`LanguageContext.tsx`): language is derived from the URL; `setLanguage(lang)` navigates to `swapLangPath(...)` (the same view under the other language prefix) and dispatches `popstate` so the open story stays open. On the **bare home root only**, the app client-redirects `/` → `/en/` **only when the stored `localStorage` preference is English** (a returning visitor who explicitly chose EN) — deliberately NOT from `navigator.language`, so JS-rendering crawlers (no `localStorage`) are never redirected and `/` stays the unambiguous German canonical. Default is German; a first-time non-German visitor sees German at `/` and switches via the toggle. Story URLs never redirect.
- **Back-compat**: an old `#/story-id/page` hash link is rewritten to the new German path URL on load (`migrateLegacyHash()` in `App.tsx`).
- Library covers (`StoryLibrary.tsx`) are real `<a href={storyPath(id, language)}>` anchors that call `preventDefault()` + `onSelect` on a plain left-click (progressive enhancement: crawlable + open-in-new-tab/middle-click still work).
- **Build-time prerender** (`seoPrerenderPlugin` in `vite.config.ts`): `transformIndexHtml` prerenders the German homepage; a `closeBundle` hook emits, per story, `dist/geschichten/<id>/index.html` (de) **and** `dist/en/geschichten/<id>/index.html` (en) — each with language-correct `<html lang>`, `<title>`/description/canonical/og + full page text + per-story `CreativeWork` JSON-LD and **reciprocal `hreflang`** (de↔en, x-default→de) — plus `dist/en/index.html` (English catalogue), `dist/404.html` (SPA fallback), and a full bilingual `dist/sitemap.xml` (`xhtml:link` alternates per URL). True static-site generation — works on static GitHub Pages with no server rewrites.
- No router dependency — uses `window.location` + History API directly.

### Global UI Features
- **Night mode** — warm dark colour palette for bedtime reading; defaults to OS `prefers-color-scheme`, persisted in `localStorage`
- **Language toggle** — DE/EN (cycles through `SUPPORTED` in `src/context/LanguageContext.tsx`); the active language is **encoded in the URL** (`/en/` prefix = English), persisted in `localStorage`. Toggling navigates to the same view in the other language (see URL Routing above)
- **Audio narration** — pre-generated Gemini 3.1 Flash TTS audio files (per-page MP3s, default voice **Algieba**) with `playbackRate = 1.2`; falls back to Web Speech API if audio file not found; toggle in story reader header
- **Background music** — **every story ships with one.** A single looping ~30 s instrumental clip per story (`public/stories/<id>/music.mp3`, generated by `scripts/generate-music.ts` via OpenRouter **Lyria 3 Clip**) plays quietly under the narration. The reader (`StoryReader.tsx`) shows a music pill **only when the story's `story.json` has a `music` field** (the `music` field stays optional in the type so a story still renders if a track is missing, but every shipped story should have one); the on/off preference is global and persisted in `localStorage` (`firlefanz-music`), so it carries across stories. Music loops, continues across page turns, gently fades in/out, and **ducks** to a lower volume while a page is being narrated so the voice always leads (`MUSIC_BASE_VOL` / `MUSIC_DUCK_VOL`). Music is language-agnostic (one clip for DE + EN). Autoplay needs a user gesture — toggling the pill (or the click that opened the story) provides it.
- All toggles share the same visual style (small rounded pill buttons)

### Story Data
- Stories are **pre-generated** and stored as static data at `public/stories/<id>/`
- Each story directory contains: `story.json`, page images (`page-N.png`), cover image (`cover.png`), and a downloadable `book.pdf`
- Story JSON schema (see `src/types/story.ts`): id, title, teaser, coverImage, prompt, pages (each with `text: string[]` and image path), an optional `translations` object, and an optional `music` field (path to a looping background-music clip, set by `scripts/generate-music.ts`)
- **Translations** are stored inline in `story.json` under `translations.<lang>` (e.g. `translations.en`). German is always the base language. Use `localizeStory(story, lang)` helper to get localized title/teaser/pages.
- **Dialog quotes in story.json**: Always use escaped ASCII double quotes (`\"...\""`) for dialog inside JSON string values. Unicode curly quotes (`"..."`) look similar but the closing `"` (U+201C) can be confused with a straight `"` (U+0022) and break JSON parsing. Use `\"` consistently.
- Story drafts/ideas saved in `public/stories/drafts.json`
- All image/asset paths must use `import.meta.env.BASE_URL` prefix (for GitHub Pages deployment)

## Copyright & Protection

- **All Rights Reserved** license (see `LICENSE`)
- Copyright footer visible in the app
- All source files (`src/**/*.ts`, `scripts/**/*.ts`) include a `// © 2026 Benjamin Pasero` header comment
- Bundled output (JS + CSS) includes the copyright banner via the `copyrightBannerPlugin` in `vite.config.ts`
- PDF metadata includes title and keywords (no author name or copyright statement in the PDF itself)
- All images have **invisible watermarking**: EXIF metadata + LSB steganography encoding copyright message
- Always generate images at **high quality** (`quality: 'high'`) — mobile bandwidth is handled by compressed WebP variants, not by reducing source quality
- After generating images, always run `npx tsx scripts/watermark-images.ts` before committing
- After watermarking, run `npx tsx scripts/compress-images.ts` to regenerate mobile WebP variants from the watermarked PNGs (run compress *after* watermark so variants are derived from the final files)
- After watermarking, regenerate PDFs so they contain watermarked images

## Deployment

- Hosted on **GitHub Pages** at `https://firlefanz.li` (custom domain via `public/CNAME`)
- GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys on push to `main`
- Vite `base` is set to `/` (root) — hosted at a custom top-level domain
- Node 22 required in CI

## Tech Stack

- **React** (TypeScript) with **Vite** for the frontend
- **Tailwind CSS v4** for styling (via `@tailwindcss/vite` plugin)
- **Vitest** with **happy-dom** for testing
- **PDFKit** for generating downloadable story PDFs
- **Sharp** for image watermarking (EXIF metadata + LSB steganography), icon generation, and mobile WebP compression
- **tsx** for running TypeScript scripts directly (`npx tsx scripts/*.ts`)
- **Fredoka**, **Playfair Display**, and **Lora** fonts (self-hosted via `@fontsource`, Latin subset only)
- **Google Gemini 3.1 Flash TTS** (via OpenRouter) for pre-generated narration; **Web Speech API** (browser built-in) as the runtime fallback
- **Umami** for privacy-friendly analytics (script tag in `index.html`)
- **Copyright banner** injected into all bundled JS and CSS via a custom Vite plugin (`copyrightBannerPlugin` in `vite.config.ts`); uses `writeBundle` hook to reliably run after Vite's modulepreload polyfill injection

## PWA

- Installable as a PWA on iOS ("Add to Home Screen"), Android (install prompt), and desktop
- Web app manifest at `public/manifest.json` — `start_url` and `scope` set to `/`
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

**Always run `npm run build` after any code change** to verify there are no TypeScript compile errors. Fix any failures before considering the task done.

**Always run `npm run test:e2e` after making changes to the UI** to verify nothing is broken. Fix any failures before considering the task done.

Playwright projects:
- `chromium` — desktop smoke tests (`smoke.spec.ts`)
- `mobile` — portrait mobile tests on Pixel 5 412×915 (`mobile.spec.ts`)
- `mobile-landscape` — landscape mobile tests on Pixel 5 rotated 915×412 (`mobile-landscape.spec.ts`)

## Scripts

**API keys**: scripts load `OPENAI_API_KEY` / `OPENROUTER_API_KEY` via `dotenv` (`import 'dotenv/config'` at the top of each script). Keys may be set either as real environment variables **or** in a `.env` file at the repo root — env vars take precedence, and a missing `.env` is fine as long as the key is exported. No `.env` file is required.

- `npx tsx scripts/generate-images-<story-slug>.ts` — generate story illustrations via OpenAI (`gpt-image-2`, `quality: 'high'`, `1536x1024`); always generate at high quality — mobile bandwidth is handled by the compressed WebP variants; the script first generates a temporary `style-ref.png` character reference sheet (all story characters shown from multiple angles) which is passed as a reference image to every subsequent page generation for visual consistency; each page also includes the previous page as a reference for scene-to-scene continuity; uses `/v1/images/edits` when reference images are present, `/v1/images/generations` otherwise; `style-ref.png` is deleted after all pages are generated. (Note: this is the newer majority pattern; ~11 older per-story scripts — e.g. `generate-images-der-mond.ts` — instead reuse the dressing-up page `page-4.png` as the reference for later pages, with no `style-ref.png` sheet and no previous-page chaining, and the oldest `generate-images-goldi-im-labyrinth.ts` uses no reference images at all.)
- `npx tsx scripts/watermark-images.ts [story-id]` — watermark images (EXIF + steganography); all stories if no id given
- `npx tsx scripts/compress-images.ts [story-id]` — generate compressed mobile WebP variants (`<name>-mobile.webp`) alongside each PNG; max 800px wide, WebP quality 82 (~30–55 KB vs ~3.8 MB originals); served automatically on narrow viewports (≤768px) or slow connections via `src/hooks/useMobileImages.ts`
- `npx tsx scripts/generate-pdf.ts <story-id>` — generate downloadable PDF for a story; **A4 portrait** format with 3:2 illustration at top, warm paper text panel below; uses Lora serif (18pt) for body text and Playfair Display for titles; includes cover page, dedication page (*Für Madsi von deinem Papi — Zürich, 2026*), story pages, and a final *Ende* page; fonts loaded from `node_modules/@fontsource` (woff format); images are upscaled to **300 DPI** (~2410×1607 px) using Sharp Lanczos3 resampling and embedded as **JPEG quality 90** — visually lossless for print, ~8–12 MB per PDF; PDF canvas includes **3mm bleed on all sides** (612×859 pt vs A4 trim 595×842 pt); images are inset **3mm from the trim edges** on left, top, and right (safe area) so content near the cut zone is not lost to cutting variation; all text and page numbers stay within the trim safe area
- `npx tsx scripts/translate-stories.ts [lang]` — translate all stories to target language (default: `en`) using GPT-4o-mini; adds `translations.<lang>` to each `story.json`; skips stories that already have that translation; to force a retranslation, remove the existing `translations.<lang>` block from `story.json` first
- `npx tsx scripts/generate-cover-png.ts <story-id>` — generate a print-ready cover PNG (`cover_148x210.png`) at 148×210mm (A5) / 300 DPI; cover image fills the top in 3:2 ratio, warm paper text panel below with story title in **Fredoka** (playful rounded font) and series label in Lora italic; uses `@napi-rs/canvas` for font rendering (both `latin` and `latin-ext` Fredoka variants must be registered for German umlaut support)
- `npx tsx scripts/generate-icons.ts` — generate PWA icons (`public/icons/icon-192.png`, `public/icons/icon-512.png`) from a cover image using Sharp
- `npx tsx scripts/generate-audio.ts <story-id|all> [lang|all] [voice]` — generate per-page narration MP3s via **Google Gemini 3.1 Flash TTS** (`google/gemini-3.1-flash-tts-preview`) through OpenRouter; **default voice `Algieba`** (smooth male) for all stories. Each page is synthesized in its own call, so per-page files match each page exactly and the reader auto-advances on the audio `ended` event — **no timestamps needed**. Saved as `public/stories/<id>/audio-<lang>-page-N.mp3`; lang defaults to `all` (de + en). Pass `all` as the story id to (re)generate every story (a resume log at `.audio-regen-progress` lets a failed run continue; `FORCE=1` ignores it). Gemini returns PCM → transcoded to MP3 with `ffmpeg` (required locally). Requires `OPENROUTER_API_KEY` (env var or `.env`; see Scripts intro). **Gemini occasionally truncates a whole-page clip** — the script validates each clip's length and, if short, re-synthesizes it sentence-by-sentence and concatenates (`CHUNK_CHARS` to shrink chunks, `PAGES=1,2` to target specific pages, `CONCURRENCY` default 4). Always check the per-story duration summary it prints for any `⚠ SHORT` pages.
  - Default narration voice for every story: **`Algieba`** (Gemini, smooth male). Alternatives — male: `Umbriel`, `Charon`, `Iapetus`, `Enceladus`, `Schedar`; female: `Sulafat` (warm), `Vindemiatrix` (gentle), `Achernar` (soft).
- `npx tsx scripts/generate-music.ts <story-id|all> [prompt]` — generate the looping background-music clip via OpenRouter **Lyria 3 Clip** (`google/lyria-3-clip-preview`, ~$0.04/clip). **Every story gets one.** Lyria returns a finished **MP3** directly (~30 s, 44.1 kHz stereo) — **no ffmpeg transcoding** (unlike narration). Audio output **requires `stream: true`** and arrives as base64 chunks in `choices[].delta.audio.data`. Saves `public/stories/<id>/music.mp3` and patches `story.json` to add the `music` field so the reader picks it up. Pass `all` to (re)generate every story that doesn't already have a `music.mp3` (existing ones are skipped; `FORCE=1` overwrites). Default prompt is a calm instrumental bedtime bed; pass a 2nd arg (or `PROMPT=`) to tailor the mood. Music is language-agnostic; **skip watermark/compress/PDF** — it's independent of images and text. Requires `OPENROUTER_API_KEY` (env var or `.env`; see Scripts intro).

## Adding a New Language

1. Run `npx tsx scripts/translate-stories.ts <lang>` (e.g. `fr`)
2. Add the language code to the `SUPPORTED` array in `src/context/LanguageContext.tsx`
3. **Wire the URL prefix**: language is encoded in the URL (`/en/` today). The routing/prerender currently hard-code the `de` (root) + `en` (`/en/`) prefixes — `src/lib/routes.ts` (`langFromPath`/`homePath`/`storyPath`/`parseLocation`) and `vite.config.ts` (`LANGS`, `UI`, `storyUrl`, the `closeBundle` emitter + sitemap). Generalize these to the new prefix so the language gets its own crawlable URLs + `hreflang`. (A language added only to `SUPPORTED` would render via the toggle but would not get its own indexable URLs.)
4. Commit and push

## Workflow for Adding a New Story

1. Write `story.json` in `public/stories/<id>/` (German base text). The `<id>` is the public **URL slug** — it becomes `/geschichten/<id>/` (DE) and `/en/geschichten/<id>/` (EN), so use a stable, lowercase, kebab-case id and don't rename it later (renaming breaks existing links). The `coverImage` field is used as the story's `og:image` social-share card.
2. Check total character count (aim for ~4096 for pacing): `node -e "const s=require('./public/stories/<id>/story.json');console.log(s.pages.map(p=>p.text.join(' ')).join(' ').length)"`
3. Translate to English: `npx tsx scripts/translate-stories.ts en` (adds `translations.en` to `story.json`). **Required for SEO** — the English URL `/en/geschichten/<id>/` is prerendered from `translations.en`; without it that page silently falls back to German text.
4. Create and run image generation script: `npx tsx scripts/generate-images-<slug>.ts`
5. Watermark images: `npx tsx scripts/watermark-images.ts <id>`
6. Generate mobile WebP variants: `npx tsx scripts/compress-images.ts <id>`
7. Generate PDF: `npx tsx scripts/generate-pdf.ts <id>`
8. Generate audio for both languages: `npx tsx scripts/generate-audio.ts <id> all` (Gemini TTS, default voice `Algieba`)
9. Generate the background-music clip: `npx tsx scripts/generate-music.ts <id>` (Lyria 3 Clip; sets the `music` field automatically). **Every story gets a music track** — don't skip this.
10. Add story id to the `storyIds` array in `src/App.tsx` (this is what loads it in the running app — the home library and reader).
11. Remove from `drafts.json` if applicable
12. **No manual SEO/URL/sitemap work is needed** — the build's `seoPrerenderPlugin` (`vite.config.ts`) reads every `public/stories/*/story.json` and automatically emits the crawlable `dist/geschichten/<id>/index.html` + `dist/en/geschichten/<id>/index.html` pages (with canonical, reciprocal `hreflang`, full text, JSON-LD) and adds both URLs to `dist/sitemap.xml`. After `npm run build`, verify the new story is there: `ls dist/geschichten/<id>/ dist/en/geschichten/<id>/ && grep -c "<id>/" dist/sitemap.xml` (expect 1 file each + sitemap hits), and confirm the EN page shows English text (not the German fallback).
13. Commit and push
