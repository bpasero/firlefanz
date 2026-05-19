---
name: openai-image-generation
description: Generate illustrated storybook images for Firlefanz stories using OpenAI's GPT Image 2 API. Triggers when generating story illustrations, character art, or scene images.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# OpenAI Image Generation

Generate illustrations for Firlefanz storybook pages using OpenAI's GPT Image 2 model (`gpt-image-2`).

## API Setup

Requires an OpenAI API key stored in `.env`:

```
OPENAI_API_KEY=your-key-here
```

**Model ID:** `gpt-image-2` (released 2026-04-21, snapshot `gpt-image-2-2026-04-21`)

**Endpoints:**
- `POST https://api.openai.com/v1/images/generations` — text-only prompts
- `POST https://api.openai.com/v1/images/edits` — when one or more reference images are passed (multipart form, `image[]` fields). Up to **16 reference images** are supported.

**Why gpt-image-2 over gpt-image-1:**
- Built-in reasoning ("thinking mode") — plans composition before drawing → stronger character consistency across pages (Firlefanz looks the same in every scene).
- Up to 16 reference images per request (vs. fewer in `gpt-image-1`).
- Better text rendering when text is required — still avoid text in images per the project rule.
- Pricing per image (not token-based output): @1024×1024 roughly $0.006 (low), $0.053 (medium), $0.211 (high). Reference-image inputs are always billed at high-fidelity rates regardless of `quality`.

## Usage Pattern

```bash
curl -X POST "https://api.openai.com/v1/images/generations" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-type: application/json" \
    -d '{
        "model": "gpt-image-2",
        "prompt": "A children's book illustration...",
        "size": "1536x1024",
        "quality": "high"
    }' | jq -r '.data[0].b64_json' | base64 --decode > image.png
```

## Image Guidelines for Firlefanz Stories

- **Style:** Warm, soft, whimsical children's book illustration style. Think watercolor or gentle digital painting.
- **Characters:** Firlefanz is a small dragon/dinosaur-like creature (not human). Papalapapp is the same species, larger, fatherly.
- **Palette:** Calming, warm colors. Avoid harsh contrasts or dark/scary imagery.
- **Size:** Use `1536x1024` landscape for story pages and covers (within gpt-image-2 limits: max edge ≤ 3840 px, sides multiples of 16, aspect ≤ 3:1).
- **Quality:** Use `high` for story pages — mobile bandwidth is handled by compressed WebP variants, not by lowering source quality.
- **Tone:** Illustrations should feel safe, cozy, and sleepy — matching the calming story tone. Even "mysterious" scenes should look inviting, not frightening.
- **Language:** Any text rendered in images (signs, labels, book covers, etc.) must be in German.

## Prompt Template

When generating story illustrations, structure prompts like:

```
Children's book illustration, soft watercolor style, warm calming colors.
[Scene description from story].
Firlefanz is a small friendly dragon/dinosaur creature wearing [current outfit].
[Additional characters and setting details].
Gentle, cozy atmosphere suitable for a bedtime story.
```
