// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'
import { controlColors } from '../lib/theme'
import Tooltip from './Tooltip'

interface Props {
  narrating: boolean
  onToggle: () => void
}

export default function NarrationToggle({ narrating, onToggle }: Props) {
  const { nightMode, highContrast } = useNightMode()
  const { language } = useLanguage()

  const { bg, hoverBg, color, border } = controlColors({ nightMode, highContrast }, narrating)

  return (
    <Tooltip label={narrating ? (language === 'en' ? 'Stop narration' : 'Vorlesen stoppen') : (language === 'en' ? 'Read aloud' : 'Vorlesen')}>
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
      {narrating ? (
        // Speaker with sound waves
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      ) : (
        // Speaker without waves (muted)
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM3 9v6h4l5 5V4L7 9H3z"/>
        </svg>
      )}
    </button>
    </Tooltip>
  )
}
