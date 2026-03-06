import { createContext, useContext, useState, useEffect } from 'react'

const NightModeContext = createContext({ nightMode: false, toggleNightMode: () => {} })

export function NightModeProvider({ children }: { children: React.ReactNode }) {
  const [nightMode, setNightMode] = useState(
    () => localStorage.getItem('firlefanz-night-mode') === 'true'
  )

  useEffect(() => {
    localStorage.setItem('firlefanz-night-mode', String(nightMode))
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
