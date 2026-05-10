// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useLanguage } from '../context/LanguageContext'
import { useNightMode } from '../context/NightModeContext'
import Tooltip from './Tooltip'

const LABELS: Record<string, string> = { de: 'DE', en: 'EN' }

interface Props {
  className?: string
  /** When true, the button has no background of its own — meant to sit inside a glass pill container. */
  bare?: boolean
}

export default function LanguageToggle({ className = '', bare = false }: Props) {
  const { language, setLanguage, supportedLanguages } = useLanguage()
  const { nightMode } = useNightMode()

  const next = supportedLanguages[(supportedLanguages.indexOf(language) + 1) % supportedLanguages.length]

  const bg = bare ? 'transparent' : nightMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)'
  const hoverBg = nightMode ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.55)'

  return (
    <Tooltip label={language === 'en' ? 'Switch language' : 'Sprache wechseln'}>
    <button
      onClick={() => setLanguage(next)}
      className={`h-9 sm:h-8 px-3 rounded-full flex items-center justify-center transition-colors text-xs font-semibold tracking-wider ${className}`}
      style={{
        backgroundColor: bg,
        color: nightMode ? '#f1e0c2' : '#7c4a1e',
        fontFamily: "'Fredoka', 'Lora', sans-serif",
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bg}
    >
      {LABELS[language] ?? language.toUpperCase()}
    </button>
    </Tooltip>
  )
}
