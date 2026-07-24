---
name: new-story
description: Step-by-step pipeline for adding a new Firlefanz story — writing story.json, translating, generating images, watermarking, compressing, PDF, narration audio and background music, and registering the story in the app. Triggers when adding, creating, or publishing a new story.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# Workflow for Adding a New Story

Follow every step in order. Steps 8 and 9 (audio and music) are not optional — every shipped story has both.


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
