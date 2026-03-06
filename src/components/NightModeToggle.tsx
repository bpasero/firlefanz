import { useNightMode } from '../context/NightModeContext'

export default function NightModeToggle({ className = '' }: { className?: string }) {
  const { nightMode, toggleNightMode } = useNightMode()

  return (
    <button
      onClick={toggleNightMode}
      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors text-base sm:text-sm ${className}`}
      style={{
        backgroundColor: nightMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)',
        color: nightMode ? '#e8d5b7' : '#7c4a1e',
      }}
      title={nightMode ? 'Tagmodus' : 'Nachtmodus'}
    >
      {nightMode ? '\u2600' : '\u263E'}
    </button>
  )
}
