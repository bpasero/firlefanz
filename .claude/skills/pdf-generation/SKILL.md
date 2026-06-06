---
name: pdf-generation
description: Generate downloadable PDF books from Firlefanz stories. Triggers when creating PDFs, exporting stories, or preparing printable versions.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# Story PDF Generation

Generate printable PDF books from Firlefanz story data using PDFKit.

## Usage

```bash
npx tsx scripts/generate-pdf.ts <story-id>
```

Example:
```bash
npx tsx scripts/generate-pdf.ts goldi-im-labyrinth
```

This reads `public/stories/<story-id>/story.json` and its images, then outputs `public/stories/<story-id>/book.pdf`.

## PDF Layout

- **Format:** A4 portrait with 3mm bleed on all sides — printable book format
- **Cover page:** 3:2 cover image filling the top, story title below on a warm paper panel
- **Dedication page:** *Für Madsi von deinem Papi — Zürich, 2026*
- **Story pages:** 3:2 illustration at the top, warm paper text panel below with page numbers (images upscaled to 300 DPI and embedded as JPEG quality 90)
- **Ende page:** closing page after the last story page
- **Fonts:** Lora serif (18pt body) and Playfair Display (titles), loaded from `node_modules/@fontsource` as woff

## When to Regenerate

Run this script after:
- Generating or updating story images
- Editing story text in `story.json`
- Creating a new story

The PDF is served as a static file and linked from the story library with a download button.
