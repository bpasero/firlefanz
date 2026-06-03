---
name: gemini-audio-generation
description: Generate per-page narration audio (MP3) for Firlefanz stories using Google Gemini 3.1 Flash TTS with the voice Algieba via OpenRouter. Triggers whenever generating, regenerating, or fixing story narration, audio, voiceover, or per-page MP3 files. The default narration voice for ALL stories is Algieba.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# Gemini Audio Generation

Generate narration for Firlefanz storybook pages using Google **Gemini 3.1 Flash TTS** (`google/gemini-3.1-flash-tts-preview`) via OpenRouter.

**The default voice for every story is `Algieba`** (a smooth male narrator). Use it for all stories unless the user explicitly asks for a different voice — a single consistent narrator across the whole library is the intended design.

## API Setup

Requires an OpenRouter API key in `.env` (audio is the one part of the pipeline that uses OpenRouter, not OpenAI):

```
OPENROUTER_API_KEY=your-key-here
```

Also requires **ffmpeg** on PATH (Gemini returns raw PCM; we transcode to MP3).

**Model ID:** `google/gemini-3.1-flash-tts-preview`
**Endpoint:** `POST https://openrouter.ai/api/v1/audio/speech` — OpenAI-compatible (`model`, `input`, `voice`, `response_format`, `speed`). It auto-detects the input language (German + English both supported).
**Important:** over OpenRouter this model only returns `response_format: "pcm"` (24 kHz / 16-bit / mono) — request PCM and transcode to MP3 with `ffmpeg -f s16le -ar 24000 -ac 1`.

## Usage

Always use the canonical script — do not hand-roll TTS calls:

```bash
npx tsx scripts/generate-audio.ts <story-id> all          # one story, DE + EN, voice Algieba
npx tsx scripts/generate-audio.ts all                     # (re)generate EVERY story
npx tsx scripts/generate-audio.ts <story-id> de Umbriel   # override lang / voice if asked
```

Output: `public/stories/<id>/audio-<lang>-page-N.mp3` (git-tracked).
Env knobs: `CONCURRENCY` (default 4), `PAGES=7,8` (only those pages), `CHUNK_CHARS` (shrink sentence chunks), `FORCE=1` (ignore the `all`-mode resume log).

## How it works (and why)

- **Per-page synthesis = page-turn sync.** Each page is narrated in its own call, so every MP3 matches its page exactly. The reader (`StoryReader.tsx`) plays one MP3 per page and auto-advances on the audio `ended` event — **there are no separate timestamps to maintain**. This is tighter than splitting one long clip into pages after the fact.
- **Truncation safeguard.** Gemini occasionally returns a truncated whole-page clip (HTTP 200 but cut short) on certain passages — content-dependent, not length. The script validates each clip's length (flags anything faster than ~20 chars/sec) and, if short, re-synthesizes the page sentence-by-sentence and concatenates the PCM. **Always check the per-story duration summary it prints for `⚠ SHORT` pages**, and re-run them with a smaller `CHUNK_CHARS` if needed (e.g. `PAGES=8 CHUNK_CHARS=110 ...`).

## Voices

- **Default for all stories: `Algieba`** (smooth male).
- Other male options: `Umbriel` (easy-going), `Charon` (informative), `Iapetus` (clear), `Enceladus` (soft), `Schedar` (even).
- Female options: `Sulafat` (warm), `Vindemiatrix` (gentle), `Achernar` (soft).

## Playback note

The reader plays audio at `playbackRate = 1.2`, and falls back to the browser Web Speech API if an MP3 is missing. Generate at the natural speed (the script uses `speed: 1.0`).
