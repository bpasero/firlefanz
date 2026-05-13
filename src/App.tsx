// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Story } from './types/story'
import { NightModeProvider } from './context/NightModeContext'
import { LanguageProvider } from './context/LanguageContext'
import StoryLibrary from './components/StoryLibrary'
import StoryReader from './components/StoryReader'

export function parseHash(): { storyId: string; page: number } | null {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (!hash) return null
  const parts = hash.split('/')
  const storyId = parts[0]
  const page = parts[1] ? Math.max(0, parseInt(parts[1], 10) - 1) : 0
  if (!storyId || isNaN(page)) return null
  return { storyId, page }
}

function App() {
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [initialPage, setInitialPage] = useState(0)
  const pageRef = useRef(0)

  useEffect(() => {
    const storyIds = ['der-glaeserne-strand', 'die-ritterburg', 'der-mond', 'skifahren-in-andermatt', 'der-zauber-zoo', 'das-rockfestival', 'das-tal-der-sanften-riesen', 'goldi-im-labyrinth', 'am-ende-der-welt', 'die-stadt-der-vergessenen-spielzeuge', 'der-wolkenfluester', 'der-schachmeister', 'der-flughafen', 'das-kloster-in-den-wolken', 'bobo-der-siebenschlafer', 'der-kindergarten', 'der-osterhase', 'das-museum-der-lebendigen-statuen', 'das-urzeittal', 'die-dracheninsel', 'die-reise-nach-afrika', 'die-bunte-rakete', 'der-funkelring', 'der-postbote-des-windes']
    Promise.all(
      storyIds.map((id) =>
        fetch(`${import.meta.env.BASE_URL}stories/${id}/story.json`).then((res) => res.json())
      )
    ).then((loaded: Story[]) => {
      setStories(loaded)

      // Restore story & page from URL hash
      const parsed = parseHash()
      if (parsed) {
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

  const openStory = useCallback((story: Story) => {
    setActiveStory(story)
    setInitialPage(0)
    pageRef.current = 0
    window.location.hash = `#/${story.id}/1`
  }, [])

  const closeStory = useCallback(() => {
    setActiveStory(null)
    setInitialPage(0)
    pageRef.current = 0
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [])

  const handlePageChange = useCallback((pageIndex: number) => {
    pageRef.current = pageIndex
    if (activeStory) {
      window.location.hash = `#/${activeStory.id}/${pageIndex + 1}`
    }
  }, [activeStory])

  // Handle browser back/forward
  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash()
      if (!parsed) {
        setActiveStory(null)
        return
      }
      const story = stories.find((s) => s.id === parsed.storyId)
      if (story) {
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
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [stories])

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
