import { useState, useEffect } from 'react'
import type { Story } from './types/story'
import StoryLibrary from './components/StoryLibrary'
import StoryReader from './components/StoryReader'

function App() {
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)

  useEffect(() => {
    const storyIds = ['goldi-im-labyrinth', 'am-ende-der-welt', 'die-stadt-der-vergessenen-spielzeuge', 'der-wolkenfluester']
    Promise.all(
      storyIds.map((id) =>
        fetch(`/stories/${id}/story.json`).then((res) => res.json())
      )
    ).then((loaded: Story[]) => setStories(loaded))
  }, [])

  if (activeStory) {
    return <StoryReader story={activeStory} onBack={() => setActiveStory(null)} />
  }

  return <StoryLibrary stories={stories} onSelectStory={setActiveStory} />
}

export default App
