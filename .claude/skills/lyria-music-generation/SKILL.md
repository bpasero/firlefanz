---
name: lyria-music-generation
description: Generate a looping background-music track (MP3) for a Firlefanz story using Google Lyria 3 Clip via OpenRouter. Triggers whenever generating, regenerating, or fixing a story's background music, melody, soundtrack, or ambient music bed. Music is instrumental, calming, and plays quietly under the narration.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# Lyria Music Generation

Generate a calming, loopable background-music bed for a Firlefanz story using Google **Lyria 3 Clip** (`google/lyria-3-clip-preview`) via OpenRouter. The reader plays this clip quietly underneath the per-page narration when the user enables the music toggle.

**Every story ships with a music track** — generating one is a required step when adding a new story (see "Workflow for Adding a New Story" in CLAUDE.md), not an optional extra.

**Music is always instrumental and calming** — it is bedtime background, not a song. No vocals, no drums, no sudden dynamics. It should be soothing enough to fall asleep to and unobtrusive enough to sit under a storyteller's voice.

## API Setup

Requires an OpenRouter API key in `.env` (same key as narration and images):

```
OPENROUTER_API_KEY=your-key-here
```

No ffmpeg needed — unlike narration, Lyria returns a finished **MP3** directly.

**Model ID:** `google/lyria-3-clip-preview` (~$0.04 per clip)
**Endpoint:** `POST https://openrouter.ai/api/v1/chat/completions` with `modalities: ["audio","text"]`.
**Important:** audio output **requires `stream: true`** (a non-streaming request returns HTTP 400). The audio arrives as base64 chunks in `choices[].delta.audio.data` (SSE); concatenate the chunks and base64-decode to get a complete **MP3** (~30 s, 44.1 kHz stereo, ~193 kbps, ID3-tagged). The Pro variant (`lyria-3-pro-preview`) makes full songs — we want the short **Clip** because the reader loops it.

## Usage

Always use the canonical script — do not hand-roll the streaming call:

```bash
npx tsx scripts/generate-music.ts <story-id>                 # default calming bedtime bed
npx tsx scripts/generate-music.ts <story-id> "custom mood"   # per-story mood prompt
npx tsx scripts/generate-music.ts all                        # every story missing a track
FORCE=1 npx tsx scripts/generate-music.ts <story-id>         # overwrite existing music.mp3
```

The script saves `public/stories/<id>/music.mp3` (git-tracked) **and** patches `story.json` to add the `music` field, so the reader picks it up automatically. `all` mode walks every story dir and skips those that already have a `music.mp3` (so it's safe to re-run; `FORCE=1` regenerates). The `music` field is an optional path (`/stories/<id>/music.mp3`) — kept optional so a story still renders if a track is missing, but every shipped story should have one.

## How it works (and why)

- **One short clip, looped.** A ~30 s instrumental clip is generated once per story and looped in the reader (`StoryReader.tsx`). Music is language-agnostic, so a single `music.mp3` serves both DE and EN — there is no per-page or per-language variant.
- **Plays under narration.** The reader keeps the music at a low volume and gently ducks it further while narration is speaking, so the storyteller's voice always sits on top. Music continues across page turns (only the narration restarts per page).
- **No watermarking / compression.** `music.mp3` is audio, so it skips the image watermark and WebP compression steps. Just commit the file.

## Prompt guidance

Keep prompts gentle and explicit about what to avoid. Good ingredients: *soft felt piano, music box, warm ambient pads, gentle harp, slow and dreamy, lullaby, seamless soothing loop*. Always include *no vocals, no drums, no sudden changes*. Tailor the mood to the story when it helps (e.g. a starry-night story → "twinkling celesta and airy pads"), but never at the cost of calm.

## After generating

1. The `music` field is set in `story.json` automatically — verify the diff.
2. No re-translation, re-watermark, or PDF regen is needed (music is independent of text and images).
3. Commit `music.mp3` and the `story.json` change.
