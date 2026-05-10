// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'
import Tooltip from './Tooltip'

interface Props {
  className?: string
  /** When true, the button has no background of its own — meant to sit inside a glass pill container. */
  bare?: boolean
}

export default function NightModeToggle({ className = '', bare = false }: Props) {
  const { nightMode, toggleNightMode } = useNightMode()
  const { language } = useLanguage()

  const bg = bare ? 'transparent' : nightMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)'
  const hoverBg = nightMode ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.55)'

  return (
    <Tooltip label={nightMode ? (language === 'en' ? 'Day mode' : 'Tagmodus') : (language === 'en' ? 'Night mode' : 'Nachtmodus')}>
    <button
      onClick={toggleNightMode}
      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors text-base sm:text-sm ${className}`}
      style={{
        backgroundColor: bg,
        color: nightMode ? '#f1e0c2' : '#7c4a1e',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bg}
    >
      {nightMode ? '☀' : '☾'}
    </button>
    </Tooltip>
  )
}
