import type { Story } from '../types/story'

interface StoryLibraryProps {
  stories: Story[]
  onSelectStory: (story: Story) => void
}

export default function StoryLibrary({ stories, onSelectStory }: StoryLibraryProps) {
  return (
    <div
      className="min-h-screen px-6 py-12"
      style={{
        background: 'linear-gradient(180deg, #3e2723 0%, #5d4037 40%, #4e342e 100%)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <h1
          className="text-5xl font-bold text-amber-100 mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Firlefanz
        </h1>
        <p
          className="text-amber-300 text-lg italic"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Geschichten zum Einschlafen
        </p>
      </div>

      {/* Bookshelf */}
      <div className="max-w-5xl mx-auto">
        {/* Shelf row */}
        <div className="flex flex-wrap justify-center gap-8 px-4 pb-4">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => onSelectStory(story)}
              className="group cursor-pointer w-56 transition-transform hover:-translate-y-2"
              style={{ perspective: '800px' }}
            >
              {/* Book cover */}
              <div
                className="relative rounded-r-lg rounded-l-sm overflow-hidden shadow-2xl transition-shadow group-hover:shadow-amber-400/30"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'rotateY(-5deg)',
                  boxShadow: '-6px 6px 20px rgba(0,0,0,0.5), inset -2px 0 4px rgba(0,0,0,0.2)',
                }}
              >
                {/* Spine edge */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-950 to-transparent z-10" />
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full aspect-[2/3] object-cover"
                />
                {/* Title overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-10">
                  <h2
                    className="text-amber-50 font-semibold text-base leading-snug"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {story.title}
                  </h2>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Wooden shelf */}
        <div
          className="h-4 rounded-sm mx-2"
          style={{
            background: 'linear-gradient(180deg, #8d6e63, #6d4c41 40%, #5d4037)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.4), 0 2px 0 #4e342e',
          }}
        />
      </div>
    </div>
  )
}
