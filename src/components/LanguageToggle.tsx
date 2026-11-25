// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useLanguage } from '../context/LanguageContext'
import { useNightMode } from '../context/NightModeContext'
import { controlColors } from '../lib/theme'
import Tooltip from './Tooltip'

const LABELS: Record<string, string> = { de: 'DE', en: 'EN' }

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage, supportedLanguages } = useLanguage()
  const { nightMode, highContrast } = useNightMode()

  const next = supportedLanguages[(supportedLanguages.indexOf(language) + 1) % supportedLanguages.length]

  const { bg, hoverBg, color, border } = controlColors({ nightMode, highContrast })

  return (
    <Tooltip label={language === 'en' ? 'Switch language' : 'Sprache wechseln'}>
    <button
      onClick={() => setLanguage(next)}
      className={`h-9 sm:h-8 px-2.5 rounded-full flex items-center justify-center transition-colors text-xs font-semibold tracking-wide ${className}`}
      style={{
        backgroundColor: bg,
        color,
        border,
        fontFamily: "'Lora', serif",
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bg}
    >
      {LABELS[language] ?? language.toUpperCase()}
    </button>
    </Tooltip>
  )
}
