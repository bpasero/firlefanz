---
name: new-language
description: Add a new language to the Firlefanz app — translating stories, registering the language code, and wiring its URL prefix into routing and the SEO prerender so it gets crawlable URLs and hreflang. Triggers when adding or enabling a new language or locale.
license: MIT
metadata:
  author: firlefanz
  version: "1.0.0"
---

# Adding a New Language


1. Run `npx tsx scripts/translate-stories.ts <lang>` (e.g. `fr`)
2. Add the language code to the `SUPPORTED` array in `src/context/LanguageContext.tsx`
3. **Wire the URL prefix**: language is encoded in the URL (`/en/` today). The routing/prerender currently hard-code the `de` (root) + `en` (`/en/`) prefixes — `src/lib/routes.ts` (`langFromPath`/`homePath`/`storyPath`/`parseLocation`) and `vite.config.ts` (`LANGS`, `UI`, `storyUrl`, the `closeBundle` emitter + sitemap). Generalize these to the new prefix so the language gets its own crawlable URLs + `hreflang`. (A language added only to `SUPPORTED` would render via the toggle but would not get its own indexable URLs.)
4. Commit and push
