---
name: story-scripts
description: Reference for the scripts in scripts/ that build Firlefanz story assets — compress-images, translate-stories, generate-cover-png, generate-icons — plus API-key setup and an index of the dedicated skills covering image, watermark, PDF, audio and music generation. Triggers when running, debugging, or writing any scripts/*.ts asset script.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# Story Asset Scripts

All scripts run with `tsx`: `npx tsx scripts/<name>.ts`.

## API keys

Scripts load `OPENAI_API_KEY` / `OPENROUTER_API_KEY` via `dotenv` (`import 'dotenv/config'` at the top of each script). Keys may be set either as real environment variables **or** in a `.env` file at the repo root — env vars take precedence, and a missing `.env` is fine as long as the key is exported. No `.env` file is required.

## Scripts covered by their own skills

Use these skills instead of this file — they carry the full endpoint, model-id and gotcha detail:

| Script | Skill |
|---|---|
| `generate-images-<story-slug>.ts` | `openai-image-generation` |
| `watermark-images.ts` | `image-watermarking` |
| `generate-pdf.ts` | `pdf-generation` |
| `generate-audio.ts` | `gemini-audio-generation` |
| `generate-music.ts` | `lyria-music-generation` |

**Image-script compatibility note** (not in the skill): the newer majority pattern generates a temporary `style-ref.png` character reference sheet and also chains the previous page as a reference. About 11 older per-story scripts — e.g. `generate-images-der-mond.ts` — instead reuse the dressing-up page `page-4.png` as the reference for later pages, with no `style-ref.png` sheet and no previous-page chaining; the oldest, `generate-images-goldi-im-labyrinth.ts`, uses no reference images at all. Don't assume a given script follows the current pattern — read it first.

## `compress-images.ts [story-id]`

Generates compressed mobile WebP variants (`<name>-mobile.webp`) alongside each PNG; max 800px wide, WebP quality 82 (~30–55 KB vs ~3.8 MB originals). Served automatically on narrow viewports (≤768px) or slow connections via `src/hooks/useMobileImages.ts`.

**Run this *after* `watermark-images.ts`**, so the variants are derived from the final watermarked files.

## `translate-stories.ts [lang]`

Translates all stories to the target language (default `en`) using GPT-4o-mini; adds `translations.<lang>` to each `story.json`. Skips stories that already have that translation — **to force a retranslation, remove the existing `translations.<lang>` block from `story.json` first**.

## `generate-cover-png.ts <story-id>`

Generates a print-ready cover PNG (`cover_148x210.png`) at 148×210 mm (A5) / 300 DPI: cover image fills the top in 3:2 ratio, warm paper text panel below with the story title in **Fredoka** and the series label in Lora italic. Uses `@napi-rs/canvas` for font rendering — **both the `latin` and `latin-ext` Fredoka variants must be registered** or German umlauts break.

## `generate-icons.ts`

Generates the PWA icons (`public/icons/icon-192.png`, `public/icons/icon-512.png`) from a cover image using Sharp.
