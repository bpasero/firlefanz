# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Firlefanz is an interactive kids' storybook generator. It creates illustrated stories set in the universe of **Firlefanz**, a dragon/dinosaur-like character (not human, no specific gender) who lives adventures in a fictional fantasy world. Firlefanz lives in a small house in a small village, next to his father **Papalapapp**. The target audience is young children aged 3–6 who can identify with Firlefanz as the main character.

The app generates new stories with both text and images, presented in a kids' book format suitable for reading aloud.

## Story Structure

Every Firlefanz story follows a consistent arc:

1. **Morning wake-up**: Firlefanz wakes up and thinks about what to do today. The kid listening typically suggests where to go or who to meet (a new friend, or someone Firlefanz already knows).
2. **Breakfast & wonder**: Firlefanz has a light breakfast, wondering what the journey might bring.
3. **Visiting Papalapapp**: Firlefanz heads over to Papalapapp, who is usually at home enjoying a morning coffee (but not always). Firlefanz asks how to get to the destination and often asks Papalapapp to join.
4. **Dressing up**: Firlefanz puts on travel gear — hat, walking stick, boots, jacket — preparing for a long journey.
5. **The great journey**: The journey is always epic in scale. Firlefanz (and often Papalapapp) travel over 7 seas, 7 deserts, 7 mountains, 7 rivers, 7 forests, and more before reaching the destination. This is a signature element of every story.
6. **The adventure**: The destination is a fantastical, fictional place. It may seem dangerous or mysterious at first, but quickly turns out to be welcoming. New friends are made and adventures unfold.
7. **Homeward**: At the end, Firlefanz has made new friends and heads home again.

### Tone & Style

- **Calming**: The ultimate goal is to make kids sleepy and eventually fall asleep. Stories should wind down, never frighten or overly excite.
- **Fantasy-rich**: Heavily inspired by Walter Moers' "Kapitän Blaubär" — fictional places, whimsical creatures, and imaginative world-building.
- **Warm & safe**: Even uncertain or mysterious moments resolve into happy, friendly encounters.
- **In German**: All story text must be written in German. Simple, clear German suitable for young children.
- **Age-appropriate**: Language and themes for children aged 3–6. Simple sentences, gentle pacing, read-aloud friendly.

## App Layout

### Home / Story Library
- Styled as a **wooden bookshelf** with 3D standing book covers
- Each book shows a cover image with title overlay; books lift on hover
- PDF download link below each book
- Clicking a book opens the story in the reader view

### Story Reader
- **Open book layout** — illustration on the left page, German text on the right page, with a spine divider
- Paper-textured text page with page numbers, corner fold detail
- Page turn animation (3D flip with shadows) when navigating
- Click left/right thirds of the book or use nav buttons to turn pages
- Designed for a parent reading aloud to a child on a tablet or screen

### Story Data
- Stories are **pre-generated** and stored as static data at `public/stories/<id>/`
- Each story directory contains: `story.json`, page images (`page-N.png`), cover image (`cover.png`), and a downloadable `book.pdf`
- Story JSON schema (see `src/types/story.ts`): id, title, teaser, coverImage, prompt (original English prompt for regeneration), and pages (each with `text: string[]` for multiple paragraphs and an image path)
- Future: allow creating new stories dynamically once a backend is in place

## Tech Stack

- **React** (TypeScript) with **Vite** for the frontend
- **Tailwind CSS v4** for styling (via `@tailwindcss/vite` plugin)
- **Vitest** with **happy-dom** for testing
- **PDFKit** for generating downloadable story PDFs
- **Playfair Display** and **Lora** fonts (self-hosted via `@fontsource`)

## Commands

- `npm run dev` — start dev server
- `npm run build` — type-check and build for production
- `npm run lint` — lint with ESLint
- `npm test` — run tests once
- `npm run test:watch` — run tests in watch mode

## Scripts

- `node scripts/generate-images.mjs [--provider=openai|google]` — generate story illustrations (defaults to OpenAI)
- `node scripts/generate-pdf.mjs <story-id>` — generate downloadable PDF for a story
