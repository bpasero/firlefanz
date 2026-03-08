// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useLanguage } from '../context/LanguageContext'
import { useNightMode } from '../context/NightModeContext'
import Tooltip from './Tooltip'

const LABELS: Record<string, string> = { de: 'DE', en: 'EN' }

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage, supportedLanguages } = useLanguage()
  const { nightMode } = useNightMode()

  const next = supportedLanguages[(supportedLanguages.indexOf(language) + 1) % supportedLanguages.length]

  const bg = nightMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)'
  const hoverBg = nightMode ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.6)'

  return (
    <Tooltip label={language === 'en' ? 'Switch language' : 'Sprache wechseln'}>
    <button
      onClick={() => setLanguage(next)}
      className={`h-9 sm:h-8 px-2.5 rounded-full flex items-center justify-center transition-colors text-xs font-semibold tracking-wide ${className}`}
      style={{
        backgroundColor: bg,
        color: nightMode ? '#e8d5b7' : '#7c4a1e',
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
