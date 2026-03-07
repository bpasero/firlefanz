// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

export interface Story {
  id: string;
  title: string;
  teaser: string;
  coverImage: string;
  prompt: string;
  pages: Page[];
  translations?: Record<string, StoryTranslation>;
}

export interface Page {
  text: string[];
  image: string;
}

export interface StoryTranslation {
  title: string;
  teaser: string;
  pages: { text: string[] }[];
}

export type Language = string  // e.g. 'de', 'en', 'fr'

export function localizeStory(story: Story, lang: Language): { title: string; teaser: string; pages: { text: string[]; image: string }[] } {
  const t = lang !== 'de' ? story.translations?.[lang] : undefined
  return {
    title: t?.title ?? story.title,
    teaser: t?.teaser ?? story.teaser,
    pages: story.pages.map((page, i) => ({
      image: page.image,
      text: t?.pages[i]?.text ?? page.text,
    })),
  }
}
