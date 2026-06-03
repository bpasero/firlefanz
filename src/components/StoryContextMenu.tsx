// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'

export interface ContextMenuState {
  x: number
  y: number
  storyId: string
}

interface StoryContextMenuProps {
  menu: ContextMenuState
  onClose: () => void
}

/** Build a shareable, absolute URL that opens a story at its first page. */
export function storyUrl(storyId: string): string {
  return `${window.location.origin}${window.location.pathname}${window.location.search}#/${storyId}/1`
}

export default function StoryContextMenu({ menu, onClose }: StoryContextMenuProps) {
  const { nightMode } = useNightMode()
  const { language } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: menu.x, y: menu.y })

  // Keep the menu fully on-screen by clamping to the viewport once measured.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const margin = 8
    const x = Math.min(menu.x, window.innerWidth - width - margin)
    const y = Math.min(menu.y, window.innerHeight - height - margin)
    setPos({ x: Math.max(margin, x), y: Math.max(margin, y) })
  }, [menu.x, menu.y])

  // Dismiss on outside click, escape, scroll, or resize.
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  const openNewTab = () => {
    window.open(storyUrl(menu.storyId), '_blank', 'noopener,noreferrer')
    onClose()
  }

  const openNewWindow = () => {
    const w = Math.min(1280, Math.round(window.screen.availWidth * 0.8))
    const h = Math.min(900, Math.round(window.screen.availHeight * 0.85))
    const left = Math.round((window.screen.availWidth - w) / 2)
    const top = Math.round((window.screen.availHeight - h) / 2)
    window.open(
      storyUrl(menu.storyId),
      '_blank',
      `popup,noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`
    )
    onClose()
  }

  const labels =
    language === 'en'
      ? { tab: 'Open in new tab', window: 'Open in new window' }
      : { tab: 'In neuem Tab öffnen', window: 'In neuem Fenster öffnen' }

  const itemClass = `flex items-center gap-2.5 w-full text-left px-3.5 py-2 text-sm rounded-lg transition-colors ${
    nightMode
      ? 'text-amber-100 hover:bg-amber-100/10'
      : 'text-amber-950 hover:bg-amber-900/10'
  }`

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-50 min-w-[14rem] p-1.5 rounded-xl shadow-2xl backdrop-blur-sm"
      style={{
        left: pos.x,
        top: pos.y,
        fontFamily: "'Lora', serif",
        background: nightMode ? 'rgba(42,32,24,0.97)' : 'rgba(252,243,228,0.98)',
        border: nightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(120,70,20,0.18)',
        boxShadow: nightMode
          ? '0 12px 32px rgba(0,0,0,0.6)'
          : '0 12px 32px rgba(120,70,20,0.35)',
      }}
    >
      <button type="button" role="menuitem" className={itemClass} onClick={openNewTab}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
        </svg>
        {labels.tab}
      </button>
      <button type="button" role="menuitem" className={itemClass} onClick={openNewWindow}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
        {labels.window}
      </button>
    </div>
  )
}
