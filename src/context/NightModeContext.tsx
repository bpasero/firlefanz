import { createContext, useContext, useState, useEffect } from 'react'

const NightModeContext = createContext({ nightMode: false, toggleNightMode: () => {} })

export function NightModeProvider({ children }: { children: React.ReactNode }) {
  const [nightMode, setNightMode] = useState(() => {
    const stored = localStorage.getItem('firlefanz-night-mode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('firlefanz-night-mode', String(nightMode))
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', nightMode ? '#1e1810' : '#f9e8c9')
    document.body.style.background = nightMode ? '#1e1810' : '#f9e8c9'
  }, [nightMode])

  return (
    <NightModeContext.Provider value={{ nightMode, toggleNightMode: () => setNightMode((n) => !n) }}>
      {children}
    </NightModeContext.Provider>
  )
}

export function useNightMode() {
  return useContext(NightModeContext)
}
