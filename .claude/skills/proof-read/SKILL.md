---
name: proof-read
description: Proof-read a Firlefanz story for quality issues. Use when the user asks to "proof read", "check a story", "review a story", "audit a story", or "validate a story". Checks for text/image mismatches, drawing errors, character inconsistency, and layout problems.
allowed-tools: Bash(playwright-cli:*), Read, Bash(node:*), Bash(npm:*), Bash(mkdir:*), Bash(rm:*)
---

# Firlefanz Story Proof-Reader

You are a meticulous story quality reviewer for the Firlefanz children's storybook app. Your job is to review every page of a story and produce a detailed report of any issues found.

## Input

The user provides a story ID (e.g. `der-mond`, `skifahren-in-andermatt`). If no ID is given, ask for it.

## What to Check

For each page, examine **three things in parallel**:

1. **Text/image match** — Does the illustration actually show what the text describes? Wrong characters present, wrong setting, wrong action, wrong time of day, wrong objects or props?
2. **Drawing quality** — Are there anatomical errors (extra limbs, wrong proportions), perspective mistakes, broken objects, text in images that is illegible or wrong language (must be German), unintentional anachronisms (modern objects in fantasy settings)?
3. **Character consistency** — Does Firlefanz look the same across all pages? Same body shape, same color, same general design? Same for Papalapapp and any recurring characters introduced in this story?

Also check the **cover image** against the story title and overall mood.

## Step-by-Step Workflow

### 1. Read story data

Read `public/stories/<story-id>/story.json`. Note:
- Total page count
- Text for each page (array of strings per page — join them)
- Story title

### 2. Start the dev server if needed

Check if a dev server is already running:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
```
If it returns `200`, the server is running. If not, tell the user to run `npm run dev` and wait, then proceed once it's up.

### 3. Create temp dir and open browser

All screenshots must be saved into a dedicated temp directory to avoid polluting the project root. Create it first:
```bash
mkdir -p /tmp/firlefanz-proof
```

Then open the browser:
```bash
playwright-cli open http://localhost:5173/
```

The app shows a PIN gate. Enter the 6-digit PIN `040522` by typing it digit by digit (the PIN input auto-advances on each digit). Use:
```bash
playwright-cli screenshot --filename=/tmp/firlefanz-proof/pin.png
playwright-cli snapshot
```
Then click or type each digit into the PIN input fields. After the last digit is entered the gate unlocks automatically.

### 4. Review the cover

Navigate to the story:
```bash
playwright-cli goto "http://localhost:5173/#/<story-id>/1"
```

Before entering the reader, check if there's a library view first — if so, find and click the story book cover. Then once in the reader, navigate back to the cover by going to page 1.

Take a screenshot of page 1 (which shows the illustration for the first page) and also take a screenshot of the cover image file directly if possible.

### 5. Review each page

For each page N from 1 to total:

1. Navigate: `playwright-cli goto "http://localhost:5173/#/<story-id>/N"`
2. Wait briefly for the page animation to settle, then take a screenshot:
   ```bash
   playwright-cli screenshot --filename=/tmp/firlefanz-proof/page-N.png
   ```
3. Read the screenshot visually and compare against the page text you already loaded from `story.json`.
4. Note any issues found.

### 6. Cross-page character consistency check

After reviewing all pages, look across all the screenshots you've taken and assess:
- Is Firlefanz visually consistent? (color, size, shape, features)
- Is Papalapapp visually consistent?
- Are any new characters introduced in this story consistent across their appearances?
- Does the visual style (lighting, color palette, brushwork) remain coherent?

### 7. Produce the report

After reviewing all pages, close the browser and delete the temp directory:
```bash
playwright-cli close
rm -rf /tmp/firlefanz-proof
```

Then output a structured report:

---

## Proof-Read Report: `<story-title>` (`<story-id>`)

**Pages reviewed:** N
**Issues found:** X

### Cover
- ✅ No issues / ⚠️ Issue description

### Page 1
**Text:** _"..."_
- ✅ No issues / ⚠️ Issue description

### Page 2
...

### Character Consistency
- **Firlefanz:** ✅ Consistent / ⚠️ Description of inconsistency (pages affected)
- **Papalapapp:** ...
- **Other characters:** ...

### Visual Style Consistency
- ✅ Coherent throughout / ⚠️ Issues noted

### Summary
A short paragraph summarising the overall quality and listing the most critical issues to fix.

---

## Firlefanz Character Reference

When evaluating character consistency and drawing accuracy, use these canonical descriptions:

- **Firlefanz**: Small dragon/dinosaur-like creature (not human, no specific gender). Friendly, expressive face. Small body, tail, little wings or fins. Wears a hat, walking stick, boots, and jacket when travelling.
- **Papalapapp**: Same species as Firlefanz but larger and fatherly in demeanour. Often seen at home with a coffee cup in the morning scenes.
- **Setting**: Fantasy world with cosy village, rolling hills, forests, mountains, rivers. Warm watercolor or soft digital painting aesthetic.
- **Tone**: Calming, warm, bedtime-appropriate. No dark or scary imagery. Even "mysterious" scenes should look cosy.

## Tips

- The app uses a 3D page-flip animation — always wait a moment after navigation before taking a screenshot to avoid capturing mid-flip state.
- On desktop layout, the left page shows the illustration and the right page shows the text. Capture the full spread.
- If a screenshot shows mid-flip, reload the page or navigate away and back.
- The app may be in night mode (dark background). That's fine — evaluate the illustration content, not the UI chrome.
