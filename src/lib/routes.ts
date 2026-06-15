// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import type { Language } from '../types/story'

// Single source of truth for URL <-> language <-> story mapping.
//
// URL scheme (the URL is the source of truth for the active language):
//   German (default):  <base>            ,  <base>geschichten/<id>/
//   English:           <base>en/         ,  <base>en/geschichten/<id>/
// The page within a story is a non-indexed hash suffix (#<n>, 1-based).

export const BASE = import.meta.env.BASE_URL // '/' in production (custom domain)

/** Active language implied by the path (English only when under the /en/ prefix). */
export function langFromPath(pathname: string): Language {
  return pathname === `${BASE}en` || pathname.startsWith(`${BASE}en/`) ? 'en' : 'de'
}

/** Library URL for a language. */
export function homePath(lang: Language): string {
  return lang === 'en' ? `${BASE}en/` : BASE
}

/** Crawlable per-story URL for a language. */
export function storyPath(id: string, lang: Language): string {
  return lang === 'en' ? `${BASE}en/geschichten/${id}/` : `${BASE}geschichten/${id}/`
}

/** Resolve the active language, story id (or null on the library), and page index. */
export function parseLocation(
  pathname: string,
  hash: string
): { lang: Language; storyId: string | null; page: number } {
  const lang = langFromPath(pathname)
  let rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '')
  if (rest === 'en') rest = ''
  else if (rest.startsWith('en/')) rest = rest.slice(3)
  const m = rest.match(/^geschichten\/([^/]+)/)
  const storyId = m ? m[1] : null
  const n = parseInt(hash.replace(/^#/, ''), 10)
  const page = Number.isFinite(n) && n > 0 ? n - 1 : 0
  return { lang, storyId, page }
}

/** The equivalent URL of the current view in the other language (preserves page hash). */
export function swapLangPath(pathname: string, hash: string, toLang: Language): string {
  const { storyId } = parseLocation(pathname, hash)
  const base = storyId ? storyPath(storyId, toLang) : homePath(toLang)
  return `${base}${hash || ''}`
}
