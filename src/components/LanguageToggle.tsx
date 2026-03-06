import { useLanguage } from '../context/LanguageContext'
import { useNightMode } from '../context/NightModeContext'

const LABELS: Record<string, string> = { de: 'DE', en: 'EN' }

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage, supportedLanguages } = useLanguage()
  const { nightMode } = useNightMode()

  const next = supportedLanguages[(supportedLanguages.indexOf(language) + 1) % supportedLanguages.length]

  return (
    <button
      onClick={() => setLanguage(next)}
      className={`h-9 sm:h-8 px-2.5 rounded-full flex items-center justify-center transition-colors text-xs font-semibold tracking-wide ${className}`}
      style={{
        backgroundColor: nightMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)',
        color: nightMode ? '#e8d5b7' : '#7c4a1e',
        fontFamily: "'Lora', serif",
      }}
      title={`Sprache wechseln / Switch language`}
    >
      {LABELS[language] ?? language.toUpperCase()}
    </button>
  )
}
