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
node scripts/generate-pdf.mjs <story-id>
```

Example:
```bash
node scripts/generate-pdf.mjs goldi-im-labyrinth
```

This reads `public/stories/<story-id>/story.json` and its images, then outputs `public/stories/<story-id>/book.pdf`.

## PDF Layout

- **Format:** A4 landscape — wide format suited for a kids' book
- **Cover page:** Full-bleed cover image with title overlay
- **Story pages:** Left half shows the illustration, right half shows text on a paper-colored background with page numbers
- **Fonts:** Helvetica (bundled with PDFKit, no extra files needed)

## When to Regenerate

Run this script after:
- Generating or updating story images
- Editing story text in `story.json`
- Creating a new story

The PDF is served as a static file and linked from the story library with a download button.
