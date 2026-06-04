// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

// Tracks the last story/page the reader had open, so the library can offer a
// gentle "keep reading" nook that resumes exactly where the bedtime story left off.

const LAST_READ_KEY = 'firlefanz-last-read'

export interface LastRead {
  id: string
  page: number // 1-based
  total: number
}

/** Persist the currently-open story + page. Called on open and on every page turn. */
export function rememberLastRead(id: string, page: number, total: number): void {
  try {
    localStorage.setItem(LAST_READ_KEY, JSON.stringify({ id, page, total }))
  } catch {
    // localStorage may be unavailable (private mode, quota) — resume is a nicety, never required.
  }
}

/** Read the last-read entry, or null if absent/invalid. Caller validates the id still exists. */
export function readLastRead(): LastRead | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LastRead>
    if (
      typeof parsed?.id === 'string' &&
      typeof parsed.page === 'number' &&
      typeof parsed.total === 'number' &&
      parsed.page >= 1 &&
      parsed.total >= 1
    ) {
      return { id: parsed.id, page: parsed.page, total: parsed.total }
    }
  } catch {
    // Corrupt entry — ignore and show no keep-reading nook.
  }
  return null
}
