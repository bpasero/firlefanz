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
              {/* PDF download */}
              <a
                href={`/stories/${story.id}/book.pdf`}
                download={`${story.title}.pdf`}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 flex items-center justify-center gap-1 text-amber-400 hover:text-amber-200 text-xs transition-colors"
                style={{ fontFamily: "'Lora', serif" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                PDF
              </a>
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
