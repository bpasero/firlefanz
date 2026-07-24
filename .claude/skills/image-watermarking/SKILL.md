---
name: image-watermarking
description: Embed invisible copyright protection (EXIF metadata + LSB steganography) into Firlefanz story images. Triggers after generating story images, or when asked to watermark or protect images.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# Image Watermarking Skill

Embed invisible copyright protection into Firlefanz story images.

## When to use

Trigger when:
- New story images have been generated
- User asks to watermark or protect images
- After running any image generation script

## What it does

Two layers of protection are applied to every PNG image:

1. **EXIF/PNG metadata** — Sets Copyright, Artist, and ImageDescription fields in the image metadata.
2. **LSB steganography** — Encodes a copyright message into the least significant bits of pixel data. Invisible to the human eye, survives casual copying (screenshots, downloads). Can be verified by re-reading the LSB data.

## Usage

```bash
# Watermark all stories
npx tsx scripts/watermark-images.ts

# Watermark a specific story
npx tsx scripts/watermark-images.ts <story-id>
```

The script:
- Processes all `.png` files in the story directory
- Embeds the steganographic message
- Adds EXIF metadata
- Verifies each image after watermarking

## Verification

The script automatically verifies each image after watermarking. To manually verify, run the script again — it will re-embed and re-verify. The `extractLSB` function in the script can be used programmatically to decode the hidden message from any watermarked image.

## Important

- Always watermark images **after** generation, **before** committing
- Always regenerate PDFs **after** watermarking, so the PDFs contain watermarked images
- The watermark survives PNG re-compression but may not survive format conversion (e.g. PNG→JPEG) or heavy image editing
