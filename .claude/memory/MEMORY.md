# Firlefanz Project Memory

## Key Decisions
- Father's name is **Papalapapp** (not Paperlapapp)
- Firlefanz is a dragon/dinosaur creature, no specific gender
- All stories in **German**, simple language for ages 3-6
- User prefers **local fonts** (via @fontsource), not CDN/Google Fonts
- User prefers **OpenAI gpt-image-1** for image generation (Google Nano Banana had quota/reliability issues)
- Image size: `1536x1024` landscape, quality: `medium`
- User does not like complex page-turn animations — keep it simple

## Workflow
- Each story gets: story.json, cover + page images, PDF, dedicated generation script
- App.tsx storyIds array must be updated when adding a new story
- PDF generation: `node scripts/generate-pdf.mjs <story-id>`
- Image generation: `node scripts/generate-images-<story-slug>.mjs`
- Use playwright-cli skill for visual verification of the app

## Stories
1. **Goldi im Labyrinth** — visiting ape friend Goldi in a labyrinth
2. **Am Ende der Welt** — traveling to the end of the world, meeting Glimmi
3. **Die Stadt der vergessenen Spielzeuge** — finding a lost toy, discovering toy city with Brummel the teddy bear mayor
4. **Drafts** saved in `public/stories/drafts.json`: Der Wolkenflüsterer, Die Traumfabrik, Der Mondgarten, Das Lied der Meerjungfische

## Characters
- **Firlefanz** — small friendly green dragon/dinosaur, main character
- **Papalapapp** — same species, larger, fatherly
- **Goldi** — golden ape friend (story 1)
- **Glimmi** — tiny fluffy glowing star creature (story 2)
- **Brummel** — old teddy bear mayor with glasses (story 3)
