// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useState, useEffect, useCallback } from 'react'
import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'
import Tooltip from './Tooltip'

export default function FullscreenToggle({ className = '' }: { className?: string }) {
  const { nightMode } = useNightMode()
  const { language } = useLanguage()
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Hide on devices that don't support fullscreen (e.g. iOS Safari)
  if (!document.documentElement.requestFullscreen) return null

  const bg = nightMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)'
  const hoverBg = nightMode ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.6)'

  return (
    <Tooltip label={isFullscreen ? (language === 'en' ? 'Exit fullscreen' : 'Vollbild beenden') : (language === 'en' ? 'Fullscreen' : 'Vollbild')}>
    <button
      onClick={toggle}
      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${className}`}
      style={{
        backgroundColor: bg,
        color: nightMode ? '#e8d5b7' : '#7c4a1e',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bg}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {isFullscreen ? (
          <>
            {/* Collapse arrows */}
            <polyline points="5,1 5,5 1,5" />
            <polyline points="11,1 11,5 15,5" />
            <polyline points="5,15 5,11 1,11" />
            <polyline points="11,15 11,11 15,11" />
          </>
        ) : (
          <>
            {/* Expand arrows */}
            <polyline points="5,1 1,1 1,5" />
            <polyline points="11,1 15,1 15,5" />
            <polyline points="5,15 1,15 1,11" />
            <polyline points="11,15 15,15 15,11" />
          </>
        )}
      </svg>
    </button>
    </Tooltip>
  )
}
