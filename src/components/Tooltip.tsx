// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import type { ReactNode } from 'react'

interface Props {
  label: string
  children: ReactNode
}

export default function Tooltip({ label, children }: Props) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2
          px-2 py-1 rounded text-xs whitespace-nowrap z-50
          opacity-0 group-hover/tip:opacity-100 transition-opacity
          bg-black/80 text-white"
        style={{ fontFamily: "'Lora', serif" }}
      >
        {label}
      </span>
    </span>
  )
}
