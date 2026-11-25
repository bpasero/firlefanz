// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'
import { controlColors } from '../lib/theme'
import Tooltip from './Tooltip'

export default function HighContrastToggle({ className = '' }: { className?: string }) {
  const { nightMode, highContrast, toggleHighContrast } = useNightMode()
  const { language } = useLanguage()
  const { bg, hoverBg, color, border } = controlColors({ nightMode, highContrast }, highContrast)
  const label = language === 'en' ? 'High contrast' : 'Hoher Kontrast'

  return (
    <Tooltip label={label}>
    <button
      onClick={toggleHighContrast}
      aria-label={label}
      aria-pressed={highContrast}
      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${className}`}
      style={{ backgroundColor: bg, color, border }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bg}
    >
      {/* half-filled circle — the usual contrast symbol */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
      </svg>
    </button>
    </Tooltip>
  )
}
