// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'
import { controlColors } from '../lib/theme'
import Tooltip from './Tooltip'

interface Props {
  playing: boolean
  onToggle: () => void
}

export default function MusicToggle({ playing, onToggle }: Props) {
  const { nightMode, highContrast } = useNightMode()
  const { language } = useLanguage()

  const { bg, hoverBg, color, border } = controlColors({ nightMode, highContrast }, playing)

  return (
    <Tooltip label={playing ? (language === 'en' ? 'Stop music' : 'Musik stoppen') : (language === 'en' ? 'Play music' : 'Musik abspielen')}>
    <button
      onClick={onToggle}
      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors"
      style={{
        backgroundColor: bg,
        color,
        border,
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
