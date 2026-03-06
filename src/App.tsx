import { useState, useEffect } from 'react'
import type { Story } from './types/story'
import StoryLibrary from './components/StoryLibrary'
import StoryReader from './components/StoryReader'

function App() {
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)

  useEffect(() => {
    fetch('/stories/goldi-im-labyrinth/story.json')
      .then((res) => res.json())
      .then((story: Story) => setStories([story]))
  }, [])

  if (activeStory) {
    return <StoryReader story={activeStory} onBack={() => setActiveStory(null)} />
  }

  return <StoryLibrary stories={stories} onSelectStory={setActiveStory} />
}

export default App
