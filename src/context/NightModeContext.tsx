// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { createContext, useContext, useState, useEffect } from 'react'
import { rootBackground } from '../lib/theme'

const NightModeContext = createContext({
  nightMode: false,
  toggleNightMode: () => {},
  highContrast: false,
  toggleHighContrast: () => {},
})

export function NightModeProvider({ children }: { children: React.ReactNode }) {
  const [nightMode, setNightMode] = useState(() => {
    const stored = localStorage.getItem('firlefanz-night-mode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [highContrast, setHighContrast] = useState(() => {
    const stored = localStorage.getItem('firlefanz-high-contrast')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-contrast: more)').matches
  })

  useEffect(() => {
    localStorage.setItem('firlefanz-night-mode', String(nightMode))
  }, [nightMode])

  useEffect(() => {
    const root = document.documentElement
    root.style.backgroundColor = rootBackground({ nightMode, highContrast })
    // Drives the focus ring + tooltip rules in index.css
    if (highContrast) root.dataset.contrast = nightMode ? 'night' : 'day'
    else delete root.dataset.contrast
  }, [nightMode, highContrast])

  // Stored only on an explicit choice, so an untouched switch keeps following the OS.
  const toggleHighContrast = () => {
    localStorage.setItem('firlefanz-high-contrast', String(!highContrast))
    setHighContrast(!highContrast)
  }

  return (
    <NightModeContext.Provider value={{ nightMode, toggleNightMode: () => setNightMode((n) => !n), highContrast, toggleHighContrast }}>
      {children}
    </NightModeContext.Provider>
  )
}

export function useNightMode() {
  return useContext(NightModeContext)
}
