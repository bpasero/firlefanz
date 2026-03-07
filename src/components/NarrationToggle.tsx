// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useNightMode } from '../context/NightModeContext'

interface Props {
  narrating: boolean
  onToggle: () => void
}

export default function NarrationToggle({ narrating, onToggle }: Props) {
  const { nightMode } = useNightMode()

  return (
    <button
      onClick={onToggle}
      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors"
      style={{
        backgroundColor: narrating
          ? (nightMode ? 'rgba(180,140,90,0.35)' : 'rgba(180,140,90,0.4)')
          : (nightMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)'),
        color: nightMode ? '#e8d5b7' : '#7c4a1e',
      }}
      title={narrating ? 'Vorlesen stoppen' : 'Vorlesen'}
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
  )
}
