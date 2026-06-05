// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'
import Tooltip from './Tooltip'

interface Props {
  playing: boolean
  onToggle: () => void
}

export default function MusicToggle({ playing, onToggle }: Props) {
  const { nightMode } = useNightMode()
  const { language } = useLanguage()

  const bg = playing
    ? (nightMode ? 'rgba(180,140,90,0.35)' : 'rgba(180,140,90,0.4)')
    : (nightMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)')
  const hoverBg = playing
    ? (nightMode ? 'rgba(180,140,90,0.5)' : 'rgba(180,140,90,0.55)')
    : (nightMode ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.6)')

  return (
    <Tooltip label={playing ? (language === 'en' ? 'Stop music' : 'Musik stoppen') : (language === 'en' ? 'Play music' : 'Musik abspielen')}>
    <button
      onClick={onToggle}
      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors"
      style={{
        backgroundColor: bg,
        color: nightMode ? '#e8d5b7' : '#7c4a1e',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bg}
    >
      {playing ? (
        // Double musical note (active)
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6zM8 21a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
        </svg>
      ) : (
        // Single musical note with a soft slash (muted)
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l10-2v11" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
          <line x1="3" y1="3" x2="21" y2="21" opacity="0.55" />
        </svg>
      )}
    </button>
    </Tooltip>
  )
}
