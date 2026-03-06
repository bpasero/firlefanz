import { useState, useCallback, useRef } from 'react'
import type { Story } from '../types/story'

interface StoryReaderProps {
  story: Story
  onBack: () => void
}

type TurnState = null | 'turning-forward' | 'turning-back'

function PageContent({ story, pageIndex }: { story: Story; pageIndex: number }) {
  const page = story.pages[pageIndex]
  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row">
      {/* Left page — illustration */}
      <div className="lg:w-1/2 bg-amber-50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/10 to-transparent z-10 hidden lg:block" />
        <img
          src={page.image}
          alt={`Seite ${pageIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Book spine */}
      <div
        className="hidden lg:block w-2 relative z-20 shrink-0"
        style={{
          background: 'linear-gradient(90deg, #5d4037, #8d6e63, #5d4037)',
          boxShadow: '0 0 8px rgba(0,0,0,0.4)',
        }}
      />

      {/* Right page — text */}
      <div
        className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center paper-texture relative"
        style={{
          background: 'linear-gradient(135deg, #fdf8ed 0%, #f5ecd5 50%, #efe4c8 100%)',
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/5 to-transparent hidden lg:block" />
        <div
          className="absolute bottom-0 right-0 w-8 h-8 hidden lg:block"
          style={{ background: 'linear-gradient(135deg, transparent 50%, #e8dcc6 50%)' }}
        />

        <div className="relative z-10">
          {page.text.map((paragraph, i) => (
            <p
              key={i}
              className="text-amber-950 text-lg lg:text-xl leading-relaxed mb-4 last:mb-0"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="absolute bottom-4 right-6 lg:bottom-6 lg:right-8">
          <span
            className="text-amber-400 text-sm italic"
            style={{ fontFamily: "'Lora', serif" }}
          >
            — {pageIndex + 1} —
          </span>
        </div>
      </div>
    </div>
  )
}

export default function StoryReader({ story, onBack }: StoryReaderProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [turnState, setTurnState] = useState<TurnState>(null)
  const [nextPageIndex, setNextPageIndex] = useState(0)
  const bookRef = useRef<HTMLDivElement>(null)
  const isFirst = pageIndex === 0
  const isLast = pageIndex === story.pages.length - 1

  const turnPage = useCallback((direction: 'forward' | 'back') => {
    if (direction === 'forward' && isLast) return
    if (direction === 'back' && isFirst) return
    if (turnState) return

    const next = pageIndex + (direction === 'forward' ? 1 : -1)
    setNextPageIndex(next)
    setTurnState(direction === 'forward' ? 'turning-forward' : 'turning-back')

    setTimeout(() => {
      setPageIndex(next)
      setTurnState(null)
    }, 800)
  }, [isFirst, isLast, pageIndex, turnState])

  const handleBookClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!bookRef.current || turnState) return
    const rect = bookRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const third = rect.width / 3
    if (x < third) turnPage('back')
    else if (x > third * 2) turnPage('forward')
  }, [turnPage, turnState])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at center, #5d4037 0%, #3e2723 70%, #2c1a12 100%)',
      }}
    >
      {/* Header */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-amber-200 hover:text-amber-50 text-sm font-medium transition-colors"
          style={{ fontFamily: "'Lora', serif" }}
        >
          &larr; Zur Bibliothek
        </button>
        <span className="text-amber-400 text-sm" style={{ fontFamily: "'Lora', serif" }}>
          Seite {pageIndex + 1} von {story.pages.length}
        </span>
      </div>

      {/* Book */}
      <div
        ref={bookRef}
        onClick={handleBookClick}
        className="w-full max-w-5xl cursor-pointer select-none"
        style={{ perspective: '2500px' }}
      >
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.1)',
            height: 'clamp(400px, 60vh, 650px)',
          }}
        >
          {/* Bottom layer: next page (visible during turn) */}
          {turnState && (
            <PageContent story={story} pageIndex={nextPageIndex} />
          )}

          {/* Current page */}
          {!turnState && (
            <PageContent story={story} pageIndex={pageIndex} />
          )}

          {/* Turning page overlay */}
          {turnState && (
            <div
              className="absolute inset-0 z-30"
              style={{
                transformOrigin: turnState === 'turning-forward' ? 'left center' : 'right center',
                animation: `${turnState === 'turning-forward' ? 'flip-forward' : 'flip-back'} 0.8s ease-in-out forwards`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              <PageContent story={story} pageIndex={pageIndex} />
              {/* Shadow that intensifies as page turns */}
              <div
                className="absolute inset-0"
                style={{
                  animation: `${turnState === 'turning-forward' ? 'shadow-forward' : 'shadow-back'} 0.8s ease-in-out forwards`,
                }}
              />
            </div>
          )}

          {/* Dynamic shadow on the revealed page */}
          {turnState && (
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                animation: `shadow-reveal 0.8s ease-in-out forwards`,
              }}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center gap-8">
        <button
          onClick={() => turnPage('back')}
          disabled={isFirst || !!turnState}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-900/50 text-amber-200 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-amber-800 transition-colors text-lg"
        >
          &lsaquo;
        </button>
        <p className="text-amber-500/60 text-xs" style={{ fontFamily: "'Lora', serif" }}>
          Klicke links oder rechts zum Blättern
        </p>
        <button
          onClick={() => turnPage('forward')}
          disabled={isLast || !!turnState}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-900/50 text-amber-200 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-amber-800 transition-colors text-lg"
        >
          &rsaquo;
        </button>
      </div>
    </div>
  )
}
