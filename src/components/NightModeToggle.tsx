// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'
import Tooltip from './Tooltip'

export default function NightModeToggle({ className = '' }: { className?: string }) {
  const { nightMode, toggleNightMode } = useNightMode()
  const { language } = useLanguage()

  const bg = nightMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)'
  const hoverBg = nightMode ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.6)'

  return (
    <Tooltip label={nightMode ? (language === 'en' ? 'Day mode' : 'Tagmodus') : (language === 'en' ? 'Night mode' : 'Nachtmodus')}>
    <button
      onClick={toggleNightMode}
      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors text-base sm:text-sm ${className}`}
      style={{
        backgroundColor: bg,
        color: nightMode ? '#e8d5b7' : '#7c4a1e',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bg}
    >
      {nightMode ? '\u2600' : '\u263E'}
    </button>
    </Tooltip>
  )
}
