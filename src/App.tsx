import { useState, useEffect } from 'react'
import type { Story } from './types/story'
import PinGate from './components/PinGate'
import StoryLibrary from './components/StoryLibrary'
import StoryReader from './components/StoryReader'

function App() {
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)

  useEffect(() => {
    const storyIds = ['goldi-im-labyrinth', 'am-ende-der-welt', 'die-stadt-der-vergessenen-spielzeuge', 'der-wolkenfluester']
    Promise.all(
      storyIds.map((id) =>
        fetch(`${import.meta.env.BASE_URL}stories/${id}/story.json`).then((res) => res.json())
      )
    ).then((loaded: Story[]) => setStories(loaded))
  }, [])

  return (
    <PinGate>
      {activeStory ? (
        <StoryReader story={activeStory} onBack={() => setActiveStory(null)} />
      ) : (
        <StoryLibrary stories={stories} onSelectStory={setActiveStory} />
      )}
    </PinGate>
  )
}

export default App
