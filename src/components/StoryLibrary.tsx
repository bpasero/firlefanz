// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useState } from 'react'
import type { Story } from '../types/story'
import { localizeStory } from '../types/story'
import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'
import { useMobileImages, getMobileSrc } from '../hooks/useMobileImages'
import NightModeToggle from './NightModeToggle'
import LanguageToggle from './LanguageToggle'
import StoryContextMenu, { type ContextMenuState } from './StoryContextMenu'

const base = import.meta.env.BASE_URL

interface StoryLibraryProps {
  stories: Story[]
  onSelectStory: (story: Story) => void
}

export default function StoryLibrary({ stories, onSelectStory }: StoryLibraryProps) {
  const { nightMode } = useNightMode()
  const { language } = useLanguage()
  const mobileImages = useMobileImages()
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  return (
    <div
      className="min-h-screen px-4 sm:px-6 py-8 sm:py-12 relative overflow-hidden"
      style={{
        background: nightMode
          ? 'linear-gradient(170deg, #1e1810 0%, #2a2018 30%, #1a1410 60%, #12100c 100%)'
          : 'linear-gradient(170deg, #f9e8c9 0%, #f5d5a0 30%, #e8c07a 60%, #d4a05a 100%)',
      }}
    >
      {/* Soft floating shapes for playful background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-30"
          style={{ background: nightMode
            ? 'radial-gradient(circle, #3b2d6b, transparent 70%)'
            : 'radial-gradient(circle, #fde68a, transparent 70%)'
          }}
        />
        <div
          className="absolute top-1/3 -right-16 w-56 h-56 rounded-full opacity-25"
          style={{ background: nightMode
            ? 'radial-gradient(circle, #2d1f5e, transparent 70%)'
            : 'radial-gradient(circle, #fbbf24, transparent 70%)'
          }}
        />
        <div
          className="absolute bottom-10 left-1/4 w-40 h-40 rounded-full opacity-20"
          style={{ background: nightMode
            ? 'radial-gradient(circle, #4a3070, transparent 70%)'
            : 'radial-gradient(circle, #f59e0b, transparent 70%)'
          }}
        />
        {/* Tiny stars */}
        <div className={`absolute top-16 right-1/4 text-2xl ${nightMode ? 'text-yellow-200/50' : 'text-amber-400/40'}`}>&#10022;</div>
        <div className={`absolute top-32 left-1/3 text-lg ${nightMode ? 'text-yellow-100/40' : 'text-amber-300/30'}`}>&#10022;</div>
        <div className={`absolute bottom-32 right-1/3 text-xl ${nightMode ? 'text-yellow-200/35' : 'text-amber-400/25'}`}>&#10022;</div>
        <div className={`absolute top-1/2 left-16 text-sm hidden sm:block ${nightMode ? 'text-yellow-100/40' : 'text-yellow-300/30'}`}>&#10022;</div>
        <div className={`absolute bottom-48 left-2/3 text-lg hidden sm:block ${nightMode ? 'text-yellow-200/45' : 'text-amber-300/35'}`}>&#10022;</div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-1.5">
        <LanguageToggle />
        <NightModeToggle />
      </div>

      {/* Header */}
      <div className="text-center mb-8 sm:mb-14 relative z-10">
        <h1
          className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: nightMode ? '#e8d5b7' : '#7c4a1e',
            textShadow: nightMode ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 4px rgba(255,255,255,0.3)',
          }}
        >
          Firlefanz
        </h1>
        <p
          className="text-base sm:text-xl italic"
          style={{
            fontFamily: "'Lora', serif",
            color: nightMode ? '#b8956a' : '#a0714a',
          }}
        >
          {language === 'en' ? 'Bedtime Stories' : 'Geschichten zum Einschlafen'}
        </p>
      </div>

      {/* Bookshelf */}
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Shelf row */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-4 sm:gap-10 px-2 sm:px-4 pb-4 sm:pb-6">
          {stories.map((story) => {
            const localized = localizeStory(story, language)
            return (
              <button
                key={story.id}
                onClick={() => onSelectStory(story)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setContextMenu({ x: e.clientX, y: e.clientY, storyId: story.id })
                }}
                className="group cursor-pointer w-full sm:w-52 transition-all duration-300 active:scale-95 sm:hover:-translate-y-3 sm:hover:scale-105"
                style={{ perspective: '800px' }}
              >
                {/* Book cover */}
                <div
                  className="relative rounded-xl sm:rounded-2xl overflow-hidden transition-shadow duration-300"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateY(-4deg)',
                    boxShadow: nightMode
                      ? '-4px 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
                      : '-4px 8px 24px rgba(120,70,20,0.35), 0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Spine edge */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 sm:w-3 z-10 rounded-l-xl sm:rounded-l-2xl ${nightMode ? 'bg-gradient-to-r from-black/50 to-transparent' : 'bg-gradient-to-r from-amber-800/40 to-transparent'}`} />
                  <img
                    src={`${base}${getMobileSrc(story.coverImage, mobileImages).replace(/^\//, '')}`}
                    alt={localized.title}
                    className={`w-full aspect-[2/3] object-cover ${nightMode ? 'brightness-75' : ''}`}
                  />
                  {/* Title overlay at bottom */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 pt-8 sm:pt-10"
                    style={{
                      background: 'linear-gradient(to top, rgba(60,30,10,0.85) 0%, rgba(60,30,10,0.5) 50%, transparent 100%)',
                    }}
                  >
                    <h2
                      className="text-amber-50 font-semibold text-sm sm:text-base leading-snug drop-shadow"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {localized.title}
                    </h2>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Wooden shelf */}
        <div
          className="h-4 sm:h-5 rounded-lg mx-1 sm:mx-2"
          style={{
            background: nightMode
              ? 'linear-gradient(180deg, #3a2a1c 0%, #2a1e14 40%, #1e1610 100%)'
              : 'linear-gradient(180deg, #c49a6c 0%, #a67c52 40%, #8b6340 100%)',
            boxShadow: nightMode
              ? '0 6px 16px rgba(0,0,0,0.4), 0 2px 0 #1a1210, inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 6px 16px rgba(120,70,20,0.3), 0 2px 0 #7a5530, inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        />
      </div>

      {/* Copyright */}
      <p
        className="text-center mt-8 sm:mt-12 text-xs relative z-10"
        style={{
          fontFamily: "'Lora', serif",
          color: nightMode ? '#6a5a40' : '#a0814a',
        }}
      >
        &copy; 2026 Benjamin Pasero. Alle Rechte vorbehalten.
      </p>

      {contextMenu && (
        <StoryContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
      )}
    </div>
  )
}
