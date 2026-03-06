---
name: nano-banana-image-generation
description: Generate illustrated storybook images for Firlefanz stories using Google's Nano Banana 2 (Gemini 3.1 Flash Image) API. Triggers when generating story illustrations, character art, or scene images.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# Nano Banana 2 Image Generation

Generate illustrations for Firlefanz storybook pages using Google's Nano Banana 2 model (`gemini-3.1-flash-image-preview`).

## API Setup

Requires a Google AI API key ([get one here](https://aistudio.google.com/apikey)) stored in `.env`:

```
VITE_GOOGLE_AI_API_KEY=your-key-here
```

Access in code via `import.meta.env.VITE_GOOGLE_AI_API_KEY`. Note: this exposes the key in the browser — a backend proxy should be added for production.

**Model ID:** `gemini-3.1-flash-image-preview`

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent
```

## Usage Pattern

```javascript
const response = await ai.models.generateContent({
  model: 'gemini-3.1-flash-image-preview',
  contents: prompt,
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
    imageConfig: {
      aspectRatio: '3:2',
      imageSize: '2K'
    }
  }
});
```

## Image Guidelines for Firlefanz Stories

- **Style:** Warm, soft, whimsical children's book illustration style. Think watercolor or gentle digital painting.
- **Characters:** Firlefanz is a small dragon/dinosaur-like creature (not human). Papalapapp is the same species, larger, fatherly.
- **Palette:** Calming, warm colors. Avoid harsh contrasts or dark/scary imagery.
- **Aspect ratio:** Use `3:2` landscape for story pages, `1:1` for character portraits.
- **Resolution:** Use `2K` for story pages.
- **Consistency:** Use reference images and character descriptions to maintain visual consistency across pages. Nano Banana 2 supports up to 5 consistent characters and 14 objects per session.
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
