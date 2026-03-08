// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useState, useEffect } from 'react'
import type { Story } from './types/story'
import { NightModeProvider } from './context/NightModeContext'
import { LanguageProvider } from './context/LanguageContext'
import PinGate from './components/PinGate'
import StoryLibrary from './components/StoryLibrary'
import StoryReader from './components/StoryReader'

function App() {
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)

  useEffect(() => {
    const storyIds = ['der-zauber-zoo', 'das-rockfestival', 'das-tal-der-sanften-riesen', 'goldi-im-labyrinth', 'am-ende-der-welt', 'die-stadt-der-vergessenen-spielzeuge', 'der-wolkenfluester']
    Promise.all(
      storyIds.map((id) =>
        fetch(`${import.meta.env.BASE_URL}stories/${id}/story.json`).then((res) => res.json())
      )
    ).then((loaded: Story[]) => setStories(loaded))
  }, [])

  return (
    <NightModeProvider>
      <LanguageProvider>
      <PinGate>
        {activeStory ? (
          <StoryReader story={activeStory} onBack={() => setActiveStory(null)} />
        ) : (
          <StoryLibrary stories={stories} onSelectStory={setActiveStory} />
        )}
      </PinGate>
      </LanguageProvider>
    </NightModeProvider>
  )
}

export default App
