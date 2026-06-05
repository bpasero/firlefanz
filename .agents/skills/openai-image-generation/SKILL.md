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
- **Characters:** Firlefanz is a small dragon/dinosaur-like creature (not human). Papalapapp is the same species, larger, fatherly. See the **Character Uniqueness & Consistency** section below — it is the single most important thing to get right.
- **Palette:** Calming, warm colors. Avoid harsh contrasts or dark/scary imagery.
- **Size:** Use `1536x1024` landscape for story pages and covers (within gpt-image-2 limits: max edge ≤ 3840 px, sides multiples of 16, aspect ≤ 3:1).
- **Quality:** Use `high` for story pages — mobile bandwidth is handled by compressed WebP variants, not by lowering source quality.
- **Tone:** Illustrations should feel safe, cozy, and sleepy — matching the calming story tone. Even "mysterious" scenes should look inviting, not frightening.
- **Language:** Any text rendered in images (signs, labels, book covers, etc.) must be in German.

## Character Uniqueness & Consistency (MOST IMPORTANT)

The single most common defect in generated images is **accidental duplication of the protagonist**: when a scene needs a crowd, a group, friends, a band, classmates, dwarves, guests, etc., the model tends to draw extra copies of Firlefanz (or Papalapapp) instead of inventing distinct creatures. A full audit found this in ~10 stories — group/crowd scenes are by far the riskiest. Every prompt must defend against it explicitly.

**Canonical look — pin it in every prompt:**
- **Firlefanz**: ONE small, round, friendly green dragon/dinosaur. A row of soft rounded spikes/scales runs down his back and tail. Small head, big friendly dark eyes, short rounded snout, small arms, chunky tail. **NO wings. NO horns.** (Common drift to avoid: little bat-wings, or horns on the head — never add these.)
- **Papalapapp**: the SAME species as Firlefanz but **noticeably larger and clearly taller/bulkier** — the size difference must read at a glance. Same back-spikes, same wingless/hornless anatomy. Often an orange scarf + coat; often a coffee cup in morning home scenes.

**Hard rules to bake into EVERY prompt:**
1. **Exactly ONE Firlefanz and at most ONE Papalapapp in the entire image** — never two or more of either, anywhere (not in the background, not in a crowd, not in a reflection unless the scene is explicitly a mirror, not in a porthole/window). State this affirmatively *and* negatively.
2. **Every other character must be a VISIBLY DIFFERENT creature** — a different species, body shape, and color from Firlefanz. Friends, classmates, crowds, bands, guests, helpers must NOT be green dragons/dinosaurs and must NOT resemble Firlefanz or Papalapapp. Give each its own concrete description (e.g. "a fluffy white rabbit-creature", "an orange fox", "a round blue sprite") rather than leaving it generic.
3. **Keep the size hierarchy obvious**: if both appear, Papalapapp is clearly the big one and Firlefanz clearly the small one.
4. **Placement must be physically possible and match the text**: characters inside a vehicle (airplane, rocket, boat) must be drawn *inside* it (seen through a window/porthole is fine) — never floating loose outside in the sky or in open space unless the text explicitly describes a spacewalk/flight.
5. **No text anywhere**: `No text, words, letters, labels, signs, or writing of any kind anywhere in the image.` (Stray lettering on jars, boxes, banners, and signs has slipped through — keep this line in every prompt.)

**Always pass the `style-ref.png` character reference sheet and the previous page as reference images** (see CLAUDE.md → image generation script) so anatomy and the one-of-each rule stay stable scene to scene.

## Prompt Template

When generating story illustrations, structure prompts like:

```
Children's book illustration, soft watercolor style, warm calming colors.
[Scene description from story].

CHARACTERS — read carefully:
- Firlefanz: exactly ONE small, round, friendly green dragon/dinosaur with a row of soft
  rounded spikes down his back and tail, big friendly eyes, short snout, small arms — NO
  wings, NO horns. Wearing [current outfit].
- [If present] Papalapapp: exactly ONE, the same species but clearly LARGER and taller than
  Firlefanz, [outfit]. (Omit this line entirely if Papalapapp is not in the scene.)
- [Every other character]: describe each as a visibly DIFFERENT creature — different species,
  shape and color, NOT a green dragon and NOT resembling Firlefanz/Papalapapp. e.g. [concrete
  description of each friend / crowd member].

CRITICAL RULES:
- There is exactly ONE Firlefanz and at most ONE Papalapapp in the whole image. Do NOT draw
  two or more Firlefanz or two or more Papalapapp anywhere — not in crowds, backgrounds,
  reflections, windows or portholes.
- Any crowd, group, band, or set of friends must be made of distinct non-dragon creatures,
  each clearly different from Firlefanz.
- Keep all characters in physically possible positions that match the scene (e.g. inside the
  vehicle, not floating outside).
- No text, words, letters, labels, signs, or writing of any kind anywhere in the image.

[Setting details]. Gentle, cozy atmosphere suitable for a bedtime story.
```
