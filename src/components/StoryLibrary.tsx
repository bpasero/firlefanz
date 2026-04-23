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

const base = import.meta.env.BASE_URL

interface StoryLibraryProps {
  stories: Story[]
  onSelectStory: (story: Story) => void
}

export default function StoryLibrary({ stories, onSelectStory }: StoryLibraryProps) {
  const { nightMode } = useNightMode()
  const { language } = useLanguage()
  const mobileImages = useMobileImages()
  const [searchQuery, setSearchQuery] = useState('')

  const query = searchQuery.trim().toLowerCase()
  const filteredStories = query
    ? stories.filter((story) => {
        const loc = localizeStory(story, language)
        return loc.title.toLowerCase().includes(query) || loc.teaser.toLowerCase().includes(query)
      })
    : stories

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

      {/* Search */}
      <div className="max-w-md mx-auto mb-8 sm:mb-12 relative z-10 px-2">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{
            background: nightMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
            boxShadow: nightMode
              ? '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 2px 12px rgba(120,70,20,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
            border: nightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(180,120,60,0.25)',
          }}
        >
          <svg
            className="shrink-0 w-4 h-4"
            style={{ color: nightMode ? '#9a7a50' : '#a07840' }}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'en' ? 'Search stories…' : 'Geschichten suchen…'}
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
            style={{
              fontFamily: "'Lora', serif",
              color: nightMode ? '#e8d5b7' : '#5a3010',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: nightMode ? '#9a7a50' : '#a07840' }}
              aria-label="Clear search"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Bookshelf */}
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Shelf row */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-4 sm:gap-10 px-2 sm:px-4 pb-4 sm:pb-6">
          {filteredStories.length === 0 && (
            <p
              className="col-span-2 py-12 text-center text-base italic"
              style={{
                fontFamily: "'Lora', serif",
                color: nightMode ? '#7a6040' : '#a07848',
              }}
            >
              {language === 'en' ? 'No stories found.' : 'Keine Geschichten gefunden.'}
            </p>
          )}
          {filteredStories.map((story) => {
            const localized = localizeStory(story, language)
            return (
              <button
                key={story.id}
                onClick={() => onSelectStory(story)}
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
    </div>
  )
}
