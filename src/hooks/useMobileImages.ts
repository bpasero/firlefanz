// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useState, useEffect } from 'react'

type NetworkInfo = {
  saveData?: boolean
  effectiveType?: string
  addEventListener?: (event: string, handler: () => void) => void
  removeEventListener?: (event: string, handler: () => void) => void
}

export function shouldUseMobileImages(): boolean {
  if (window.innerWidth <= 768) return true
  const conn: NetworkInfo | undefined =
    (navigator as unknown as { connection?: NetworkInfo; mozConnection?: NetworkInfo; webkitConnection?: NetworkInfo })
      .connection ??
    (navigator as unknown as { mozConnection?: NetworkInfo }).mozConnection ??
    (navigator as unknown as { webkitConnection?: NetworkInfo }).webkitConnection
  if (!conn) return false
  if (conn.saveData) return true
  if (conn.effectiveType && ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return true
  return false
}

/**
 * Returns true when the app should serve compressed mobile WebP images instead
 * of full-resolution PNGs. Triggers on:
 * - Narrow viewport (≤768px)
 * - Slow connection via Network Information API (2g/3g or saveData mode)
 */
export function useMobileImages(): boolean {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    setMobile(shouldUseMobileImages())

    const conn: NetworkInfo | undefined =
      (navigator as unknown as { connection?: NetworkInfo }).connection
    if (conn?.addEventListener) {
      const handler = () => setMobile(shouldUseMobileImages())
      conn.addEventListener('change', handler)
      return () => conn.removeEventListener?.('change', handler)
    }
  }, [])

  return mobile
}

/**
 * Returns the mobile WebP variant path if useMobile is true, otherwise the original.
 * Mobile variant is named `<original-stem>-mobile.webp`.
 */
export function getMobileSrc(src: string, useMobile: boolean): string {
  if (!useMobile) return src
  return src.replace(/\.png$/, '-mobile.webp')
}
