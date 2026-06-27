// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useState, useEffect, useCallback, useRef } from 'react'
import { localizeStory, type Story } from './types/story'
import { NightModeProvider } from './context/NightModeContext'
import { LanguageProvider } from './context/LanguageContext'
import StoryLibrary from './components/StoryLibrary'
import StoryReader from './components/StoryReader'
import { rememberLastRead } from './lib/lastRead'
import { homePath, langFromPath, parseLocation, storyPath } from './lib/routes'

// Per-language tab titles for client-side navigation. The prerendered static
// HTML already carries a per-URL <title> (scripts/seo-prerender.ts), but the SPA
// must keep document.title correct as the user opens/closes stories and switches
// language in-app. Keep these mirrored with UI[lang].homeTitle / titleSuffix there.
const TITLE = {
  de: { home: 'Firlefanz — Geschichten zum Einschlafen', suffix: 'Gutenachtgeschichte zum Vorlesen' },
  en: { home: 'Firlefanz — Bedtime Stories', suffix: 'Bedtime Story to Read Aloud' },
} as const

function titleFor(story: Story | null, lang: string): string {
  const t = TITLE[lang as keyof typeof TITLE] ?? TITLE.de
  return story ? `${localizeStory(story, lang).title} — ${t.suffix}` : t.home
}

// Back-compat: rewrite an old hash route (#/id/page) to the new path URL on load
// so bookmarked/shared links keep working. Old links predate languages → German.
function migrateLegacyHash(): boolean {
  const m = window.location.hash.match(/^#\/([\w-]+)(?:\/(\d+))?/)
  if (!m) return false
  const page = m[2] ? parseInt(m[2], 10) : 1
  history.replaceState(null, '', `${storyPath(m[1], 'de')}${page > 1 ? `#${page}` : ''}`)
  return true
}

function App() {
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [initialPage, setInitialPage] = useState(0)
  const pageRef = useRef(0)

  useEffect(() => {
    migrateLegacyHash()
    const storyIds = ['der-glaeserne-strand', 'die-ritterburg', 'der-mond', 'skifahren-in-andermatt', 'ferien-im-hotel-sonnenquell', 'der-zauber-zoo', 'das-rockfestival', 'das-tal-der-sanften-riesen', 'goldi-im-labyrinth', 'am-ende-der-welt', 'die-stadt-der-vergessenen-spielzeuge', 'der-wolkenfluester', 'der-schachmeister', 'der-flughafen', 'das-kloster-in-den-wolken', 'bobo-der-siebenschlafer', 'der-kindergarten', 'der-osterhase', 'das-museum-der-lebendigen-statuen', 'das-urzeittal', 'die-dracheninsel', 'die-reise-nach-afrika', 'die-bunte-rakete', 'der-funkelring', 'der-postbote-des-windes', 'die-traumfabrik', 'das-nordlicht', 'der-zirkus-sternenschweif', 'der-meisterkoch', 'der-zauberwald', 'der-glitzersee', 'der-ponyhof', 'opa-opalapapp', 'die-bergwanderung']
    Promise.all(
      storyIds.map((id) =>
        fetch(`${import.meta.env.BASE_URL}stories/${id}/story.json`).then((res) => res.json())
      )
    ).then((loaded: Story[]) => {
      setStories(loaded)

      // Restore story & page from the URL on load
      const parsed = parseLocation(window.location.pathname, window.location.hash)
      if (parsed.storyId) {
        const story = loaded.find((s) => s.id === parsed.storyId)
        if (story) {
          const page = Math.min(parsed.page, story.pages.length - 1)
          setActiveStory(story)
          setInitialPage(page)
          pageRef.current = page
        }
      }
    })
  }, [])

  const openStory = useCallback((story: Story, page = 1) => {
    const idx = Math.min(Math.max(page - 1, 0), story.pages.length - 1)
    const lang = langFromPath(window.location.pathname)
    setActiveStory(story)
    setInitialPage(idx)
    pageRef.current = idx
    history.pushState(null, '', `${storyPath(story.id, lang)}${idx > 0 ? `#${idx + 1}` : ''}`)
    rememberLastRead(story.id, idx + 1, story.pages.length)
  }, [])

  const closeStory = useCallback(() => {
    setActiveStory(null)
    setInitialPage(0)
    pageRef.current = 0
    history.replaceState(null, '', homePath(langFromPath(window.location.pathname)))
  }, [])

  const handlePageChange = useCallback((pageIndex: number) => {
    pageRef.current = pageIndex
    if (activeStory) {
      // Page lives in the hash; assigning it adds a history entry so browser
      // back/forward steps through pages within the story.
      window.location.hash = String(pageIndex + 1)
      rememberLastRead(activeStory.id, pageIndex + 1, activeStory.pages.length)
    }
  }, [activeStory])

  // Handle browser back/forward (popstate = story open/close, hashchange = page turns)
  useEffect(() => {
    const route = () => {
      // Stories not loaded yet — the initial-load effect will route once they are.
      if (!stories.length) return
      const parsed = parseLocation(window.location.pathname, window.location.hash)
      if (!parsed.storyId) {
        setActiveStory(null)
        return
      }
      const story = stories.find((s) => s.id === parsed.storyId)
      if (!story) {
        setActiveStory(null)
        return
      }
      setActiveStory(story)
      const page = Math.min(parsed.page, story.pages.length - 1)
      // Only update initialPage (which remounts StoryReader via key) when navigating
      // via browser back/forward to a different page. In-story page turns also update
      // the hash, but they set pageRef.current first — skip those to avoid remounting
      // StoryReader on every page turn (which would reset narrating state and audio).
      if (page !== pageRef.current) {
        setInitialPage(page)
        pageRef.current = page
      }
    }
    window.addEventListener('popstate', route)
    window.addEventListener('hashchange', route)
    return () => {
      window.removeEventListener('popstate', route)
      window.removeEventListener('hashchange', route)
    }
  }, [stories])

  // Keep the browser tab title in sync with the open story and active language.
  // Language switches dispatch popstate (LanguageContext), so we re-title on those.
  useEffect(() => {
    const sync = () => {
      document.title = titleFor(activeStory, langFromPath(window.location.pathname))
    }
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [activeStory])

  return (
    <NightModeProvider>
      <LanguageProvider>
        {activeStory ? (
          <StoryReader
            key={`${activeStory.id}-${initialPage}`}
            story={activeStory}
            initialPage={initialPage}
            onBack={closeStory}
            onPageChange={handlePageChange}
          />
        ) : (
          <StoryLibrary stories={stories} onSelectStory={openStory} />
        )}
      </LanguageProvider>
    </NightModeProvider>
  )
}

export default App
