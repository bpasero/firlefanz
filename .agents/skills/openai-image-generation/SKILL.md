---
name: openai-image-generation
description: Generate illustrated storybook images for Firlefanz stories using OpenAI's GPT Image API. Triggers when generating story illustrations, character art, or scene images.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# OpenAI Image Generation

Generate illustrations for Firlefanz storybook pages using OpenAI's GPT Image model (`gpt-image-1`).

## API Setup

Requires an OpenAI API key stored in `.env`:

```
OPENAI_API_KEY=your-key-here
```

**Model ID:** `gpt-image-1`

**Endpoint:**
```
POST https://api.openai.com/v1/images/generations
```

## Usage Pattern

```bash
curl -X POST "https://api.openai.com/v1/images/generations" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-type: application/json" \
    -d '{
        "model": "gpt-image-1",
        "prompt": "A children's book illustration...",
        "size": "1792x1024",
        "quality": "hd"
    }' | jq -r '.data[0].b64_json' | base64 --decode > image.png
```

## Image Guidelines for Firlefanz Stories

- **Style:** Warm, soft, whimsical children's book illustration style. Think watercolor or gentle digital painting.
- **Characters:** Firlefanz is a small dragon/dinosaur-like creature (not human). Paperlapapp is the same species, larger, fatherly.
- **Palette:** Calming, warm colors. Avoid harsh contrasts or dark/scary imagery.
- **Size:** Use `1792x1024` landscape for story pages, `1024x1024` for cover images.
- **Quality:** Use `hd` for story pages.
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
