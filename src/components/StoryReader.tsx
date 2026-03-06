import { useState, useCallback, useRef, useEffect } from 'react'
import type { Story } from '../types/story'
import { useNightMode } from '../context/NightModeContext'
import NightModeToggle from './NightModeToggle'

const base = import.meta.env.BASE_URL

interface StoryReaderProps {
  story: Story
  onBack: () => void
}

type TurnState = null | 'turning-forward' | 'turning-back'

function PageContent({ story, pageIndex, nightMode }: { story: Story; pageIndex: number; nightMode: boolean }) {
  const page = story.pages[pageIndex]
  return (
    <div className="absolute inset-0 flex flex-col md:flex-row">
      {/* Left page — illustration */}
      <div className="h-2/5 md:h-auto md:w-1/2 relative overflow-hidden" style={{ backgroundColor: nightMode ? '#1e1a14' : '#faf3e3' }}>
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/10 to-transparent z-10 hidden md:block" />
        <img
          src={`${base}${page.image.replace(/^\//, '')}`}
          alt={`Seite ${pageIndex + 1}`}
          className={`w-full h-full object-cover ${nightMode ? 'brightness-75' : ''}`}
        />
      </div>

      {/* Book spine */}
      <div
        className="hidden md:block w-3 relative z-20 shrink-0"
        style={{
          background: nightMode
            ? 'linear-gradient(90deg, #3a2a1c, #4a3828, #3a2a1c)'
            : 'linear-gradient(90deg, #b8956a, #d4b08c, #b8956a)',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        }}
      />
      {/* Mobile divider */}
      <div
        className="md:hidden h-1 relative z-20 shrink-0"
        style={{
          background: nightMode
            ? 'linear-gradient(180deg, #3a2a1c, #4a3828, #3a2a1c)'
            : 'linear-gradient(180deg, #b8956a, #d4b08c, #b8956a)',
          boxShadow: '0 0 6px rgba(0,0,0,0.15)',
        }}
      />

      {/* Right page — text */}
      <div
        className="h-3/5 md:h-auto md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col justify-center paper-texture relative overflow-y-auto"
        style={{
          background: nightMode
            ? 'linear-gradient(145deg, #2a2418 0%, #241e14 40%, #1e1a12 100%)'
            : 'linear-gradient(145deg, #fdf8ed 0%, #f8eed5 40%, #f3e5c0 100%)',
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/5 to-transparent hidden md:block" />
        <div
          className="absolute bottom-0 right-0 w-10 h-10 hidden md:block"
          style={{ background: nightMode
            ? 'linear-gradient(135deg, transparent 50%, #1a1610 50%)'
            : 'linear-gradient(135deg, transparent 50%, #eddcb8 50%)'
          }}
        />

        <div className="relative z-10">
          {page.text.map((paragraph, i) => (
            <p
              key={i}
              className="text-base sm:text-lg md:text-xl leading-relaxed mb-4 md:mb-5 last:mb-0"
              style={{
                fontFamily: "'Lora', serif",
                color: nightMode ? '#d4c4a8' : '#4a3520',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="absolute bottom-3 right-4 md:bottom-6 md:right-8">
          <span
            className="text-xs sm:text-sm italic"
            style={{
              fontFamily: "'Lora', serif",
              color: nightMode ? '#6a5a40' : '#c4a06a',
            }}
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
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const { nightMode } = useNightMode()
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') turnPage('forward')
      else if (e.key === 'ArrowLeft') turnPage('back')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [turnPage])

  const handleBookClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!bookRef.current || turnState) return
    const rect = bookRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const third = rect.width / 3
    if (x < third) turnPage('back')
    else if (x > third * 2) turnPage('forward')
  }, [turnPage, turnState])

  // Swipe handling for touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    touchStartRef.current = null

    // Only count horizontal swipes (dx > dy) with enough distance
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) turnPage('forward')
      else turnPage('back')
    }
  }, [turnPage])

  const btnBg = nightMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'
  const btnHoverBg = nightMode ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.7)'
  const btnColor = nightMode ? '#e8d5b7' : '#7c4a1e'

  return (
    <div
      className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-2 py-1.5 sm:p-4 relative overflow-hidden"
      style={{
        background: nightMode
          ? 'linear-gradient(170deg, #1e1810 0%, #1a1410 40%, #14100c 100%)'
          : 'linear-gradient(170deg, #f5e1be 0%, #edd3a4 40%, #dfc08a 100%)',
      }}
    >
      {/* Soft floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-25"
          style={{ background: nightMode
            ? 'radial-gradient(circle, #2d1f5e, transparent 70%)'
            : 'radial-gradient(circle, #fde68a, transparent 70%)'
          }}
        />
        <div
          className="absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-20"
          style={{ background: nightMode
            ? 'radial-gradient(circle, #3b2d6b, transparent 70%)'
            : 'radial-gradient(circle, #fbbf24, transparent 70%)'
          }}
        />
        <div className={`absolute top-12 left-1/4 text-xl hidden sm:block ${nightMode ? 'text-yellow-200/40' : 'text-amber-400/30'}`}>&#10022;</div>
        <div className={`absolute bottom-20 right-1/4 text-lg hidden sm:block ${nightMode ? 'text-yellow-100/35' : 'text-amber-300/25'}`}>&#10022;</div>
      </div>

      {/* Header */}
      <div className="w-full max-w-5xl mb-1.5 sm:mb-5 flex items-center justify-between relative z-10 gap-2">
        <button
          onClick={onBack}
          className="text-xs sm:text-sm font-medium transition-colors px-2.5 py-1.5 sm:px-3 rounded-full shrink-0"
          style={{
            fontFamily: "'Lora', serif",
            color: btnColor,
            backgroundColor: btnBg,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = btnHoverBg}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = btnBg}
        >
          &larr; <span className="hidden sm:inline">Zur Bibliothek</span>
        </button>
        <h2
          className="text-sm sm:text-lg font-semibold truncate min-w-0"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: nightMode ? '#e8d5b7' : '#7c4a1e',
          }}
        >
          {story.title}
        </h2>
        <div className="flex items-center gap-1.5 shrink-0">
          <NightModeToggle />
          <span
            className="text-xs sm:text-sm px-2.5 py-1.5 sm:px-3 rounded-full whitespace-nowrap"
            style={{
              fontFamily: "'Lora', serif",
              color: nightMode ? '#b8956a' : '#9a6b3a',
              backgroundColor: nightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.3)',
            }}
          >
            {pageIndex + 1}/{story.pages.length}
          </span>
        </div>
      </div>

      {/* Book */}
      <div
        ref={bookRef}
        onClick={handleBookClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-5xl cursor-pointer select-none relative z-10 flex-1 md:flex-none"
        style={{ perspective: '2500px' }}
      >
        <div
          className="relative rounded-xl sm:rounded-2xl overflow-hidden h-full"
          style={{
            boxShadow: nightMode
              ? '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(60,40,20,0.3)'
              : '0 12px 40px rgba(120,70,20,0.25), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(180,140,90,0.2)',
            minHeight: 'min(calc(100dvh - 120px), 780px)',
            maxHeight: '780px',
          }}
        >
          {/* Bottom layer: next page (visible during turn) */}
          {turnState && (
            <PageContent story={story} pageIndex={nextPageIndex} nightMode={nightMode} />
          )}

          {/* Current page */}
          {!turnState && (
            <PageContent story={story} pageIndex={pageIndex} nightMode={nightMode} />
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
              <PageContent story={story} pageIndex={pageIndex} nightMode={nightMode} />
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

      {/* Navigation — larger touch targets on mobile */}
      <div className="mt-1.5 sm:mt-6 flex items-center gap-6 sm:gap-8 relative z-10">
        <button
          onClick={() => turnPage('back')}
          disabled={isFirst || !!turnState}
          className="w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xl sm:text-lg"
          style={{
            backgroundColor: btnBg,
            color: btnColor,
          }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = btnHoverBg }}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = btnBg}
        >
          &lsaquo;
        </button>
        <button
          onClick={() => turnPage('forward')}
          disabled={isLast || !!turnState}
          className="w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xl sm:text-lg"
          style={{
            backgroundColor: btnBg,
            color: btnColor,
          }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = btnHoverBg }}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = btnBg}
        >
          &rsaquo;
        </button>
      </div>
    </div>
  )
}
