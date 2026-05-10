// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react'
import type { Story } from '../types/story'
import { localizeStory } from '../types/story'
import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'
import { useMobileImages, getMobileSrc } from '../hooks/useMobileImages'
import NightModeToggle from './NightModeToggle'
import LanguageToggle from './LanguageToggle'
import NarrationToggle from './NarrationToggle'
import FullscreenToggle from './FullscreenToggle'

const base = import.meta.env.BASE_URL

interface StoryReaderProps {
  story: Story
  initialPage?: number
  onBack: () => void
  onPageChange?: (pageIndex: number) => void
}


const FONT_STEPS_DESKTOP = [1.25, 1.125, 1, 0.9375, 0.875, 0.8125, 0.75] // rem: xl → xs
const FONT_STEPS_MOBILE = [1, 0.9375, 0.875, 0.8125, 0.75, 0.6875, 0.625] // rem: base → xxs (mobile has less vertical space)
const FONT_STEPS_LANDSCAPE = [0.875, 0.8125, 0.75, 0.6875, 0.625, 0.5625, 0.5] // rem: smaller still — landscape has very limited height

// Detect when a mobile phone is turned to landscape (short viewport height).
// max-height: 600px excludes desktop monitors and tablets.
function useIsLandscapeMobile() {
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(orientation: landscape) and (max-height: 600px)').matches
  })
  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape) and (max-height: 600px)')
    const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isLandscape
}

function PageContent({ story, pageIndex, nightMode, language, mobileImages, isLandscapeMobile }: { story: Story; pageIndex: number; nightMode: boolean; language: string; mobileImages: boolean; isLandscapeMobile: boolean }) {
  const localized = localizeStory(story, language)
  const page = localized.pages[pageIndex]
  const imageSrc = `${base}${getMobileSrc(page.image, mobileImages).replace(/^\//, '')}`
  const textContainerRef = useRef<HTMLDivElement>(null)
  const [fontStep, setFontStep] = useState(0)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  // Landscape mobile has very limited height — use the smallest font step set
  const fontSteps = isLandscapeMobile ? FONT_STEPS_LANDSCAPE : isMobile ? FONT_STEPS_MOBILE : FONT_STEPS_DESKTOP
  // Use side-by-side (book) layout on desktop or when a phone is in landscape
  const useRowLayout = !isMobile || isLandscapeMobile

  // Reset font step when page, language, or orientation changes
  useEffect(() => { setFontStep(0) }, [pageIndex, language, isLandscapeMobile])

  // Shrink font until text fits without overflow
  useLayoutEffect(() => {
    const container = textContainerRef.current
    if (!container) return
    if (container.scrollHeight > container.clientHeight && fontStep < fontSteps.length - 1) {
      setFontStep((s) => s + 1)
    }
  }, [fontStep, fontSteps.length, pageIndex, language, isLandscapeMobile])

  const fontSize = fontSteps[fontStep]

  return (
    <div className={`absolute inset-0 flex ${useRowLayout ? 'flex-row' : 'flex-col'}`}>
      {/* Left page — illustration */}
      <div
        className={`${useRowLayout ? 'w-1/2' : 'h-2/5'} relative overflow-hidden`}
        style={{ backgroundColor: nightMode ? '#1e1a14' : '#faf3e3' }}
      >
        {useRowLayout && <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/10 to-transparent z-10" />}
        <img
          src={imageSrc}
          alt={`Seite ${pageIndex + 1}`}
          decoding="sync"
          className={`w-full h-full object-cover ${nightMode ? 'brightness-75' : ''}`}
        />
      </div>

      {/* Book spine (row layout) or horizontal divider (column layout) */}
      {useRowLayout ? (
        <div
          className="w-3 relative z-20 shrink-0"
          style={{
            background: nightMode
              ? 'linear-gradient(90deg, #3a2a1c, #4a3828, #3a2a1c)'
              : 'linear-gradient(90deg, #b8956a, #d4b08c, #b8956a)',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          }}
        />
      ) : (
        <div
          className="h-1 relative z-20 shrink-0"
          style={{
            background: nightMode
              ? 'linear-gradient(180deg, #3a2a1c, #4a3828, #3a2a1c)'
              : 'linear-gradient(180deg, #b8956a, #d4b08c, #b8956a)',
            boxShadow: '0 0 6px rgba(0,0,0,0.15)',
          }}
        />
      )}

      {/* Right page — text */}
      <div
        ref={textContainerRef}
        className={`${useRowLayout ? 'w-1/2' : 'h-3/5'} ${isLandscapeMobile ? 'p-3' : useRowLayout ? 'p-8 md:p-12' : 'p-3 sm:p-8'} flex flex-col paper-texture relative overflow-hidden`}
        style={{
          background: nightMode
            ? 'linear-gradient(145deg, #2a2418 0%, #241e14 40%, #1e1a12 100%)'
            : 'linear-gradient(145deg, #fdf8ed 0%, #f8eed5 40%, #f3e5c0 100%)',
        }}
      >
        {useRowLayout && <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/5 to-transparent" />}
        {useRowLayout && (
          <div
            className="absolute bottom-0 right-0 w-10 h-10"
            style={{ background: nightMode
              ? 'linear-gradient(135deg, transparent 50%, #1a1610 50%)'
              : 'linear-gradient(135deg, transparent 50%, #eddcb8 50%)'
            }}
          />
        )}

        <div className="relative z-10 my-auto">
          {page.text.map((paragraph, i) => (
            <p
              key={i}
              className="leading-relaxed mb-4 last:mb-0"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: `${fontSize}rem`,
                color: nightMode ? '#d4c4a8' : '#4a3520',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className={`absolute bottom-3 right-4 ${!isLandscapeMobile && useRowLayout ? 'md:bottom-6 md:right-8' : ''}`}>
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

export default function StoryReader({ story, initialPage = 0, onBack, onPageChange }: StoryReaderProps) {
  const [pageIndex, setPageIndex] = useState(initialPage)
  const [narrating, setNarrating] = useState(false)
  const [flip, setFlip] = useState<{
    direction: 'forward' | 'back'
    fromPage: number
    toPage: number
  } | null>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioFailedRef = useRef<Set<string>>(new Set())
  const turnPageRef = useRef<((dir: 'forward' | 'back') => void) | null>(null)
  const isLastRef = useRef(false)
  const { nightMode } = useNightMode()
  const { language } = useLanguage()
  const mobileImages = useMobileImages()
  const isLandscapeMobile = useIsLandscapeMobile()
  const localized = localizeStory(story, language)
  const isFirst = pageIndex === 0
  const isLast = pageIndex === story.pages.length - 1

  // Preload and pre-decode adjacent page images for flicker-free page turns
  useEffect(() => {
    const toPreload = [pageIndex - 1, pageIndex + 1].filter(
      (i) => i >= 0 && i < story.pages.length
    )
    for (const i of toPreload) {
      const img = new Image()
      img.src = `${base}${getMobileSrc(story.pages[i].image, mobileImages).replace(/^\//, '')}`
      img.decode().catch(() => {})
    }
  }, [pageIndex, story, mobileImages])

  // Narrate current page: prefer pre-generated audio file, fall back to Web Speech API
  useEffect(() => {
    window.speechSynthesis.cancel()
    audioRef.current?.pause()
    if (!narrating) return

    const cacheKey = `${story.id}-${language}`

    const speakFallback = () => {
      const synth = window.speechSynthesis
      const text = localizeStory(story, language).pages[pageIndex].text.join(' ')
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'en' ? 'en-US' : 'de-DE'
      utterance.rate = 1.06
      utterance.onend = () => { if (!isLastRef.current) turnPageRef.current?.('forward') }
      const speak = () => {
        const voices = synth.getVoices()
        const voice = voices.find((v) => v.lang.startsWith(language === 'en' ? 'en' : 'de'))
        if (voice) utterance.voice = voice
        synth.speak(utterance)
      }
      if (synth.getVoices().length > 0) speak()
      else synth.addEventListener('voiceschanged', speak, { once: true })
      return () => synth.cancel()
    }

    if (audioFailedRef.current.has(cacheKey)) {
      const cleanup = speakFallback()
      return cleanup
    }

    const audioUrl = `${base}stories/${story.id}/audio-${language}-page-${pageIndex + 1}.mp3`

    // Reuse the same Audio element across pages — changing src on an already-unlocked
    // element avoids iOS autoplay restrictions that block play() on new Audio() elements
    // created outside of a direct user-gesture handler.
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.playbackRate = 1.2
    }
    const audio = audioRef.current

    const handleEnded = () => { if (!isLastRef.current) turnPageRef.current?.('forward') }
    const handleError = () => {
      audioFailedRef.current.add(cacheKey)
      audio.removeEventListener('ended', handleEnded)
      speakFallback()
    }
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError, { once: true })

    // Defer src assignment and play() so React StrictMode's synchronous cleanup can
    // cancel this timer before audio starts — preventing the double-invocation stutter
    // (play → immediate pause → play again) in development mode.
    const playTimer = setTimeout(() => {
      audio.src = audioUrl
      audio.play().catch(() => {})
    }, 0)

    return () => {
      clearTimeout(playTimer)
      audio.pause()
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      window.speechSynthesis.cancel()
    }
  }, [pageIndex, narrating, language, story])

  // Cancel narration when leaving the reader
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
      audioRef.current?.pause()
    }
  }, [])

  const turnPage = useCallback((direction: 'forward' | 'back') => {
    if (flip) return
    if (direction === 'forward' && isLast) return
    if (direction === 'back' && isFirst) return
    // Stop audio immediately so it doesn't bleed into the page flip animation
    audioRef.current?.pause()
    window.speechSynthesis.cancel()
    const next = pageIndex + (direction === 'forward' ? 1 : -1)
    setFlip({ direction, fromPage: pageIndex, toPage: next })
  }, [isFirst, isLast, pageIndex, flip])

  const handleFlipEnd = useCallback(() => {
    if (flip) {
      setPageIndex(flip.toPage)
      onPageChange?.(flip.toPage)
      setFlip(null)
    }
  }, [flip, onPageChange])

  // Keep refs current for use inside audio/speech callbacks
  turnPageRef.current = turnPage
  isLastRef.current = isLast

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') turnPage('forward')
      else if (e.key === 'ArrowLeft') turnPage('back')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [turnPage])

  const handleBookClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!bookRef.current) return
    const rect = bookRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const third = rect.width / 3
    if (x < third) turnPage('back')
    else if (x > third * 2) turnPage('forward')
  }, [turnPage])

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

  const btnHoverBg = nightMode ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.7)'
  const btnColor = nightMode ? '#f1e0c2' : '#7c4a1e'

  const glassPill: React.CSSProperties = {
    backgroundColor: nightMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.45)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: nightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.6)',
    boxShadow: nightMode ? '0 6px 18px rgba(0,0,0,0.35)' : '0 6px 18px rgba(180,110,60,0.15)',
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center overflow-hidden ${isLandscapeMobile ? 'px-2 py-0.5' : 'px-1.5 py-1 sm:p-4'}`}
      style={{
        background: nightMode
          ? 'radial-gradient(ellipse at 20% 0%, #2a1f4a 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, #3a2255 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, #1a1228 0%, transparent 60%), linear-gradient(180deg, #100a1c 0%, #0a0612 100%)'
          : 'radial-gradient(ellipse at 15% 0%, #ffe7c2 0%, transparent 50%), radial-gradient(ellipse at 85% 25%, #ffd6c2 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, #fbe0a8 0%, transparent 60%), linear-gradient(180deg, #fff5e4 0%, #fde2c4 100%)',
      }}
    >
      {/* Drifting aurora blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full opacity-40 blur-3xl"
          style={{
            background: nightMode
              ? 'radial-gradient(circle, #7c3aed 0%, transparent 65%)'
              : 'radial-gradient(circle, #ffc59a 0%, transparent 65%)',
            animation: 'auroraDrift 26s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-0 -left-20 w-[22rem] h-[22rem] rounded-full opacity-35 blur-3xl"
          style={{
            background: nightMode
              ? 'radial-gradient(circle, #5b3aa8 0%, transparent 65%)'
              : 'radial-gradient(circle, #fcd34d 0%, transparent 65%)',
            animation: 'auroraDrift 30s ease-in-out infinite reverse',
          }}
        />
        <div className={`absolute top-12 left-1/4 text-base hidden sm:block ${nightMode ? 'text-yellow-100/45' : 'text-amber-500/25'}`}>&#10022;</div>
        <div className={`absolute bottom-20 right-1/4 text-sm hidden sm:block ${nightMode ? 'text-yellow-100/35' : 'text-amber-500/20'}`}>&#10022;</div>
      </div>

      {/* Header */}
      <div className={`w-full max-w-5xl md:max-w-[90vw] flex items-center justify-between relative z-20 gap-2 ${isLandscapeMobile ? 'mb-0.5' : 'mb-1 sm:mb-5'}`}>
        <button
          onClick={() => { window.speechSynthesis.cancel(); audioRef.current?.pause(); onBack() }}
          className="text-xs sm:text-sm font-medium transition-colors px-3 py-1.5 sm:px-4 rounded-full shrink-0"
          style={{
            fontFamily: "'Fredoka', 'Lora', sans-serif",
            color: btnColor,
            ...glassPill,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = btnHoverBg}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (glassPill.backgroundColor as string)}
        >
          &larr; <span className="hidden sm:inline">{language === 'en' ? 'Library' : 'Bibliothek'}</span>
        </button>
        <h2
          className="text-sm sm:text-lg font-semibold truncate min-w-0 tracking-tight"
          style={{
            fontFamily: "'Fredoka', 'Playfair Display', sans-serif",
            color: nightMode ? '#f1e0c2' : '#7c4a1e',
          }}
        >
          {localized.title}
        </h2>
        <div className="flex items-center gap-1 shrink-0 p-1 rounded-full" style={glassPill}>
          <NarrationToggle narrating={narrating} onToggle={() => setNarrating((n) => !n)} bare />
          <LanguageToggle bare />
          <NightModeToggle bare />
          <FullscreenToggle bare />
          <span
            className="text-xs sm:text-sm px-2 py-1 whitespace-nowrap tabular-nums"
            style={{
              fontFamily: "'Fredoka', 'Lora', sans-serif",
              color: nightMode ? '#c5b6e8' : '#9a6b3a',
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
        className="w-full max-w-5xl md:max-w-[90vw] cursor-pointer select-none relative z-10 flex-1 min-h-0 flex flex-col md:justify-center"
        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
      >
        <div
          className="relative rounded-xl sm:rounded-2xl overflow-hidden h-full md:h-auto md:aspect-[3/1]"
          style={{
            backgroundColor: nightMode ? '#1e1a12' : '#fdf8ed',
            boxShadow: nightMode
              ? '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(60,40,20,0.3)'
              : '0 12px 40px rgba(120,70,20,0.25), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(180,140,90,0.2)',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          {/* Base layer — always mounted so images are never unmounted/remounted */}
          <PageContent story={story} pageIndex={pageIndex} nightMode={nightMode} language={language} mobileImages={mobileImages} isLandscapeMobile={isLandscapeMobile} />

          {/* Flip overlay — layered on top during page turn animation */}
          {flip && (
            <>
              {/* Target page revealed as the flip progresses.
                  Starts invisible to prevent flash from opaque background mounting
                  before the image decodes — the flipping page at z30 covers it anyway
                  for the first ~350ms of the 700ms animation. */}
              <div className="absolute inset-0" style={{ zIndex: 20, opacity: 0, animation: 'flipReveal 1ms 100ms forwards' }}>
                <PageContent story={story} pageIndex={flip.toPage} nightMode={nightMode} language={language} mobileImages={mobileImages} isLandscapeMobile={isLandscapeMobile} />
              </div>
              {/* Shadow cast by turning page onto target page */}
              <div
                className="absolute inset-0 bg-black pointer-events-none"
                style={{
                  zIndex: 25,
                  animation: 'flipShadow 700ms ease-in-out forwards',
                }}
              />
              {/* Flipping page */}
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 30,
                  transformOrigin: flip.direction === 'forward' ? 'left center' : 'right center',
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d' as never,
                  animation: `${flip.direction === 'forward' ? 'flipForward' : 'flipBackward'} 700ms cubic-bezier(0.645, 0.045, 0.355, 1) forwards`,
                  willChange: 'transform',
                }}
                onAnimationEnd={(e) => { if (e.target === e.currentTarget) handleFlipEnd() }}
              >
                {/* Front face — current page content */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden' as never,
                  }}
                >
                  <PageContent story={story} pageIndex={flip.fromPage} nightMode={nightMode} language={language} mobileImages={mobileImages} isLandscapeMobile={isLandscapeMobile} />
                  {/* Fold crease shadow near hinge */}
                  <div
                    className="absolute top-0 bottom-0 pointer-events-none"
                    style={{
                      zIndex: 35,
                      width: '5rem',
                      ...(flip.direction === 'forward'
                        ? { left: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.12), transparent)' }
                        : { right: 0, background: 'linear-gradient(to left, rgba(0,0,0,0.12), transparent)' }),
                      animation: 'foldGradient 700ms ease-in-out forwards',
                    }}
                  />
                </div>
                {/* Back face — page back texture */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden' as never,
                    transform: 'rotateY(180deg)',
                    background: nightMode
                      ? 'linear-gradient(135deg, #2a2418, #1e1a12 50%, #252015)'
                      : 'linear-gradient(135deg, #f5ead4, #fdf8ed 50%, #f0e4cc)',
                  }}
                >
                  {/* Fold shadow on back face */}
                  <div
                    className="absolute top-0 bottom-0 pointer-events-none"
                    style={{
                      width: '6rem',
                      ...(flip.direction === 'forward'
                        ? { right: 0, background: 'linear-gradient(to left, rgba(0,0,0,0.18), transparent)' }
                        : { left: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.18), transparent)' }),
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation — larger touch targets on mobile; hidden in landscape (use swipe/click zones instead) */}
      <div className={`mt-1 sm:mt-6 flex items-center gap-6 sm:gap-8 relative z-10 ${isLandscapeMobile ? 'hidden' : ''}`}>
        <button
          onClick={() => turnPage('back')}
          disabled={isFirst}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-all text-lg hover:scale-105"
          style={{
            ...glassPill,
            color: btnColor,
          }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = btnHoverBg }}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (glassPill.backgroundColor as string)}
        >
          &lsaquo;
        </button>
        <button
          onClick={() => turnPage('forward')}
          disabled={isLast}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-all text-lg hover:scale-105"
          style={{
            ...glassPill,
            color: btnColor,
          }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = btnHoverBg }}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (glassPill.backgroundColor as string)}
        >
          &rsaquo;
        </button>
      </div>
    </div>
  )
}
