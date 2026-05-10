// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

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

  return (
    <div
      className="min-h-screen px-4 sm:px-8 py-10 sm:py-16 relative overflow-hidden"
      style={{
        background: nightMode
          ? 'radial-gradient(ellipse at 20% 0%, #2a1f4a 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, #3a2255 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, #1a1228 0%, transparent 60%), linear-gradient(180deg, #100a1c 0%, #0a0612 100%)'
          : 'radial-gradient(ellipse at 15% 0%, #ffe7c2 0%, transparent 50%), radial-gradient(ellipse at 85% 25%, #ffd6c2 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, #fbe0a8 0%, transparent 60%), linear-gradient(180deg, #fff5e4 0%, #fde2c4 100%)',
      }}
    >
      {/* Soft drifting aurora blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-32 w-[36rem] h-[36rem] rounded-full opacity-50 blur-3xl"
          style={{
            background: nightMode
              ? 'radial-gradient(circle, #5b3aa8 0%, transparent 65%)'
              : 'radial-gradient(circle, #ffc59a 0%, transparent 65%)',
            animation: 'auroraDrift 22s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] rounded-full opacity-45 blur-3xl"
          style={{
            background: nightMode
              ? 'radial-gradient(circle, #7c3aed 0%, transparent 65%)'
              : 'radial-gradient(circle, #ffb59c 0%, transparent 65%)',
            animation: 'auroraDrift 28s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[26rem] h-[26rem] rounded-full opacity-40 blur-3xl"
          style={{
            background: nightMode
              ? 'radial-gradient(circle, #a855f7 0%, transparent 65%)'
              : 'radial-gradient(circle, #fcd34d 0%, transparent 65%)',
            animation: 'auroraDrift 32s ease-in-out infinite',
          }}
        />
        {/* Faint star dust on top */}
        <div className={`absolute top-20 right-1/4 text-base ${nightMode ? 'text-yellow-100/60' : 'text-amber-500/30'}`}>&#10022;</div>
        <div className={`absolute top-40 left-1/3 text-xs ${nightMode ? 'text-yellow-100/50' : 'text-amber-500/25'}`}>&#10022;</div>
        <div className={`absolute bottom-40 right-1/3 text-sm hidden sm:block ${nightMode ? 'text-yellow-100/45' : 'text-amber-500/25'}`}>&#10022;</div>
        <div className={`absolute top-1/2 left-12 text-xs hidden sm:block ${nightMode ? 'text-yellow-100/40' : 'text-amber-500/20'}`}>&#10022;</div>
      </div>

      {/* Toggle group — frosted glass pill */}
      <div
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-1 p-1 rounded-full"
        style={{
          backgroundColor: nightMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: nightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.6)',
          boxShadow: nightMode
            ? '0 8px 24px rgba(0,0,0,0.35)'
            : '0 8px 24px rgba(180,110,60,0.15)',
        }}
      >
        <LanguageToggle bare />
        <NightModeToggle bare />
      </div>

      {/* Hero */}
      <div className="text-center mb-10 sm:mb-16 relative z-10 pt-2 sm:pt-6">
        <h1
          className="text-5xl sm:text-7xl md:text-8xl font-bold mb-3 sm:mb-4 tracking-tight"
          style={{
            fontFamily: "'Fredoka', 'Playfair Display', sans-serif",
            backgroundImage: nightMode
              ? 'linear-gradient(120deg, #ffd9a8 0%, #ffb27a 35%, #ff9b86 65%, #ffd9a8 100%)'
              : 'linear-gradient(120deg, #b9591f 0%, #d97435 30%, #e6534a 60%, #b9591f 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            animation: 'titleFloat 6s ease-in-out infinite, textShimmer 8s ease-in-out infinite',
            filter: nightMode ? 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' : 'drop-shadow(0 4px 12px rgba(255,180,120,0.4))',
          }}
        >
          Firlefanz
        </h1>
        <p
          className="text-base sm:text-xl"
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: 'italic',
            color: nightMode ? '#c5b6e8' : '#b06b3a',
            letterSpacing: '0.04em',
          }}
        >
          {language === 'en' ? 'Bedtime stories for little dreamers' : 'Geschichten für kleine Träumer'}
        </p>
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
          <span
            className="block h-px w-10 sm:w-16"
            style={{
              background: nightMode
                ? 'linear-gradient(90deg, transparent, rgba(197,182,232,0.5), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(176,107,58,0.5), transparent)',
            }}
          />
          <span className={`text-sm ${nightMode ? 'text-purple-200/60' : 'text-amber-700/50'}`}>&#10022;</span>
          <span
            className="block h-px w-10 sm:w-16"
            style={{
              background: nightMode
                ? 'linear-gradient(90deg, transparent, rgba(197,182,232,0.5), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(176,107,58,0.5), transparent)',
            }}
          />
        </div>
      </div>

      {/* Story grid */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-7 px-1 sm:px-4 pb-8 sm:pb-12">
          {stories.map((story, idx) => {
            const localized = localizeStory(story, language)
            return (
              <button
                key={story.id}
                onClick={() => onSelectStory(story)}
                className="group cursor-pointer w-full transition-transform duration-500 ease-out active:scale-95 hover:-translate-y-2"
                style={{
                  perspective: '1000px',
                  animation: `cardRise 600ms cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(idx * 40, 600)}ms backwards`,
                }}
              >
                <div
                  className="relative rounded-2xl overflow-hidden transition-all duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    boxShadow: nightMode
                      ? '0 16px 36px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)'
                      : '0 16px 36px rgba(180,100,40,0.28), 0 4px 12px rgba(180,100,40,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
                  }}
                >
                  {/* Glossy highlight on hover */}
                  <div
                    className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)',
                    }}
                  />
                  {/* Subtle spine highlight */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 z-10"
                    style={{
                      background: nightMode
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.15))',
                    }}
                  />
                  <img
                    src={`${base}${getMobileSrc(story.coverImage, mobileImages).replace(/^\//, '')}`}
                    alt={localized.title}
                    className={`w-full aspect-[2/3] object-cover transition-transform duration-700 group-hover:scale-105 ${nightMode ? 'brightness-75' : ''}`}
                  />
                  {/* Title bar — frosted glass */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-3 sm:p-4"
                    style={{
                      background: nightMode
                        ? 'linear-gradient(to top, rgba(20,12,30,0.92) 0%, rgba(20,12,30,0.7) 60%, transparent 100%)'
                        : 'linear-gradient(to top, rgba(60,30,15,0.88) 0%, rgba(60,30,15,0.55) 60%, transparent 100%)',
                      backdropFilter: 'blur(2px)',
                      WebkitBackdropFilter: 'blur(2px)',
                    }}
                  >
                    <h2
                      className="text-amber-50 font-semibold text-sm sm:text-base leading-snug"
                      style={{
                        fontFamily: "'Fredoka', 'Playfair Display', sans-serif",
                        letterSpacing: '0.005em',
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      }}
                    >
                      {localized.title}
                    </h2>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <p
        className="text-center mt-2 text-xs relative z-10"
        style={{
          fontFamily: "'Lora', serif",
          color: nightMode ? '#7a6a9a' : '#b8895a',
          letterSpacing: '0.02em',
        }}
      >
        &copy; 2026 Benjamin Pasero. {language === 'en' ? 'All rights reserved.' : 'Alle Rechte vorbehalten.'}
      </p>
    </div>
  )
}
