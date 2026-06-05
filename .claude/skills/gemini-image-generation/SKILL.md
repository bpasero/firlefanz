---
name: gemini-image-generation
description: Generate illustrated storybook images for Firlefanz stories using Google Nano Banana 2 (Gemini 3.1 Flash Image Preview) via OpenRouter. Triggers when generating story illustrations, character art, scene images, or covers.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# Gemini Image Generation (Nano Banana 2)

Generate illustrations for Firlefanz storybook pages using Google **Nano Banana 2** — `google/gemini-3.1-flash-image-preview` — via OpenRouter. This is the project default for image generation (it replaced OpenAI GPT Image 2 / the legacy `openai-image-generation` skill).

## API Setup

Requires an OpenRouter API key in `.env` (the same key used for narration):

```
OPENROUTER_API_KEY=your-key-here
```

**Model ID:** `google/gemini-3.1-flash-image-preview`
**Endpoint:** `POST https://openrouter.ai/api/v1/chat/completions` — OpenAI-compatible chat format (NOT a dedicated `/images` endpoint).

Image generation is requested by adding `modalities: ["image", "text"]` to a normal chat request. Aspect ratio and resolution tier go in `image_config`:

```jsonc
{
  "model": "google/gemini-3.1-flash-image-preview",
  "messages": [{ "role": "user", "content": [ { "type": "text", "text": "..." } ] }],
  "modalities": ["image", "text"],
  "image_config": { "aspect_ratio": "3:2", "image_size": "2K" }
}
```

- **Reference images** (style sheet, previous page) are passed as extra parts in the same `content` array, as data URLs:
  `{ "type": "image_url", "image_url": { "url": "data:image/png;base64,<...>" } }`.
  Nano Banana 2 uses them as visual context for character/style consistency and for edits.
- **Generated image** comes back at `choices[0].message.images[0].image_url.url` as a base64 PNG data URL (`data:image/png;base64,...`). Split on the comma and `Buffer.from(b64, 'base64')`.
- **Aspect ratio:** use `"3:2"` for covers and story pages. Supported ratios include 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9.
- **Size:** request `image_size: "2K"`, then **resize the result to the project's canonical 1536×1024** with Sharp (`fit: 'cover'`) so every downstream script (watermark, compress, pdf) sees a consistent source size. (Gemini controls aspect + a quality tier, not exact pixel dims.)

## Usage Pattern

Use a per-story script (one file per story, the repo convention):

```bash
npx tsx scripts/generate-images-<story-slug>.ts
```

**`scripts/generate-images-urzeittal.ts` is the canonical reference implementation** — copy it for new stories. It:
1. Builds a temporary `style-ref.png` character reference sheet (all characters from multiple angles) and passes it as a reference image to every page → consistent characters.
2. Passes the **previous page** as a second reference image → scene-to-scene continuity.
3. Generates `cover.png` and `page-N.png`, resizes each to 1536×1024, retries up to 3× on a missing image part, and deletes `style-ref.png` at the end.

## Style steering (important)

Nano Banana 2 has a **strong cartoon bias** — given a generic "children's book illustration" prompt it tends to produce bold black ink outlines, glossy saturated colors, and big cartoon eyes. The Firlefanz library style is the opposite: soft colored-pencil/watercolor, hazy, muted, **no outlines**. Two levers, used together, reliably pull it back to the soft look:

1. **Anti-cartoon prompt language.** Explicitly ask for "soft colored-pencil and watercolor, no outlines, soft blurred edges, muted/desaturated pastel palette, matte hand-painted texture" and explicitly negate "NOT a cartoon, not glossy, not bold-lined, not saturated." (See the `S`/`E` constants in `generate-images-urzeittal.ts`.)
2. **Style anchors.** Pass one or more existing soft-style images (e.g. the previous generation's art, or a sibling story's cover) as reference images when building the `style-ref.png` character sheet. The urzeittal script supports this via `STYLE_ANCHORS=/path/a.png,/path/b.png` — those images are attached to the style-sheet request so the painterly look propagates to every page.

**Character uniqueness is a recurring failure mode** with this model: it likes to draw the main character twice (e.g. a "two blended scenes" prompt, or a journey panorama showing the travelers at several stages). Every multi-character or panorama prompt must say "exactly ONE Firlefanz, exactly ONE Papalapapp … each appears only once; do NOT draw Firlefanz twice." **Always visually review every page** against the one-Firlefanz/one-Papalapapp rule — don't trust the prompt alone.

## Image Guidelines for Firlefanz Stories

- **Style:** warm, soft, whimsical watercolor children's-book illustration. Calming, warm palette; no harsh contrast or scary imagery.
- **Characters:** there is exactly **one** Firlefanz and exactly **one** Papalapapp — state this in prompts; two of either is a critical error. Firlefanz is a small dragon/dinosaur creature (not human); Papalapapp is the same species, larger, fatherly.
- **No text rule:** every prompt must include a strong no-text instruction, e.g. `"No text, words, letters, labels, signs, or writing of any kind anywhere in the image."`
- **Size:** 3:2 landscape, normalised to 1536×1024.
- **Quality:** request `image_size: "2K"` — mobile bandwidth is handled by the compressed WebP variants, not by lowering source quality.
- **Tone:** safe, cozy, sleepy. Even "mysterious" scenes should look inviting.

## After Generating

Follow the standard post-generation pipeline (see CLAUDE.md):

```bash
npx tsx scripts/watermark-images.ts <story-id>     # EXIF + steganography
npx tsx scripts/compress-images.ts <story-id>      # mobile WebP variants (run after watermark)
npx tsx scripts/generate-pdf.ts <story-id>         # regenerate PDF with watermarked images
```
