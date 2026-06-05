// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { useState, useEffect, useMemo, useRef } from 'react'
import type { Story } from '../types/story'
import { localizeStory } from '../types/story'
import { useNightMode } from '../context/NightModeContext'
import { useLanguage } from '../context/LanguageContext'
import { useMobileImages, getMobileSrc } from '../hooks/useMobileImages'
import { readLastRead, clearLastRead, type LastRead } from '../lib/lastRead'
import NightModeToggle from './NightModeToggle'
import LanguageToggle from './LanguageToggle'
import StoryContextMenu, { type ContextMenuState } from './StoryContextMenu'

const base = import.meta.env.BASE_URL

// The locket mascot is a live CSS crop of the ONE verified single-Firlefanz cover.
// Do NOT swap to a cover that shows two dragons (der-mond, die-bunte-rakete,
// der-zauber-zoo, der-kindergarten) — that would violate the one-and-only rule.
const MASCOT_COVER = 'der-glaeserne-strand'

const FREDOKA = "'Fredoka', system-ui, sans-serif"
const LORA = "'Lora', serif"

// Themed shelves. Any story id not listed here lands in a catch-all band, so a
// newly-added story can never silently vanish from the home page.
const SHELVES: { key: string; de: string; en: string; ids: string[] }[] = [
  {
    key: 'stars', de: 'Unterm Sternenhimmel', en: 'Under the Stars',
    ids: ['der-mond', 'das-nordlicht', 'der-zirkus-sternenschweif', 'das-kloster-in-den-wolken', 'der-wolkenfluester', 'die-bunte-rakete', 'die-traumfabrik'],
  },
  {
    key: 'adventures', de: 'Große Abenteuer', en: 'Big Adventures',
    ids: ['die-reise-nach-afrika', 'der-flughafen', 'am-ende-der-welt', 'das-urzeittal', 'die-dracheninsel', 'die-ritterburg', 'skifahren-in-andermatt'],
  },
  {
    key: 'friends', de: 'Liebste Freunde', en: 'Dearest Friends',
    ids: ['der-kindergarten', 'bobo-der-siebenschlafer', 'der-osterhase', 'der-glaeserne-strand', 'der-zauber-zoo', 'das-tal-der-sanften-riesen'],
  },
  {
    key: 'magic', de: 'Zauber & Wunder', en: 'Magic & Wonder',
    ids: ['der-funkelring', 'goldi-im-labyrinth', 'das-museum-der-lebendigen-statuen', 'der-schachmeister', 'die-stadt-der-vergessenen-spielzeuge', 'der-postbote-des-windes', 'das-rockfestival'],
  },
]

// ---- theme tokens -----------------------------------------------------------

const DAY = {
  pageBg: 'linear-gradient(165deg, #fbe6c4 0%, #f6dcab 46%, #efce93 100%)',
  nightlight: 'radial-gradient(circle at center, rgba(255,226,178,0.55) 0%, rgba(255,214,150,0.24) 38%, transparent 70%)',
  ledge: 'linear-gradient(180deg, #d9b585 0%, #c69a68 55%, #b07f4f 100%)',
  ledgeLip: '#9a6c42',
  mat: '#fbf3e0',
  surface: 'rgba(253,243,218,0.66)',
  keyline: 'rgba(120,70,20,0.22)',
  textPrimary: '#5f3b1f',
  caption: '#6b4226',
  subLabel: '#8a6a45',
  meta: '#9a7a52',
  accent: '#ffd98a',
  halo: 'radial-gradient(circle at center, rgba(255,206,128,0.6), transparent 68%)',
  haloHover: 'radial-gradient(circle at center, rgba(255,214,140,0.8), transparent 70%)',
  glowRest: 0.22,
  frameShadow: '0 10px 22px -8px rgba(120,70,20,0.38), 0 2px 6px rgba(120,70,20,0.18)',
  featuredShadow: '0 18px 40px -12px rgba(120,70,20,0.45), 0 4px 10px rgba(120,70,20,0.2)',
  cardShadow: '0 14px 30px -10px rgba(120,70,20,0.4), 0 2px 6px rgba(120,70,20,0.16)',
  pillBg: '#fff6e4',
  pillText: '#a8742f',
  pillBorder: 'rgba(168,116,47,0.28)',
  vignette: 'inset 0 -120px 130px -60px rgba(80,40,10,0.22)',
  coverFilter: 'brightness(1)',
  mascotRing: 'inset 0 0 0 3px #fff7e6, 0 0 28px 6px rgba(255,214,140,0.45)',
  pool: 'radial-gradient(58% 72% at 50% 44%, rgba(255,224,170,0.62), transparent 72%)',
  progressTrack: 'rgba(120,70,20,0.16)',
  progressFill: 'linear-gradient(90deg, #f0b86a, #ffd98a)',
}

const NIGHT: typeof DAY = {
  pageBg: 'radial-gradient(125% 95% at 16% 8%, #34281a 0%, #241a12 42%, #150f0a 100%)',
  nightlight: 'radial-gradient(circle at center, rgba(255,210,150,0.42) 0%, rgba(255,190,120,0.17) 40%, transparent 70%)',
  ledge: 'linear-gradient(180deg, #3c2c1d 0%, #2c2016 60%, #1d1510 100%)',
  ledgeLip: '#140f0a',
  mat: '#2a2018',
  surface: 'rgba(31,24,16,0.6)',
  keyline: 'rgba(0,0,0,0.45)',
  textPrimary: '#ecd9b8',
  caption: '#e3cfa6',
  subLabel: '#b0926a',
  meta: '#a98e63',
  accent: '#ffcf85',
  halo: 'radial-gradient(circle at center, rgba(255,196,120,0.62), transparent 66%)',
  haloHover: 'radial-gradient(circle at center, rgba(255,206,140,0.85), transparent 70%)',
  glowRest: 0.4,
  frameShadow: '0 12px 28px -8px rgba(0,0,0,0.6), 0 0 22px -6px rgba(255,200,120,0.12)',
  featuredShadow: '0 20px 46px -12px rgba(0,0,0,0.7), 0 0 30px -6px rgba(255,200,120,0.18)',
  cardShadow: '0 16px 34px -10px rgba(0,0,0,0.66), 0 0 24px -8px rgba(255,200,120,0.14)',
  pillBg: 'rgba(58,44,28,0.92)',
  pillText: '#e8bc7e',
  pillBorder: 'rgba(255,200,120,0.26)',
  vignette: 'inset 0 -140px 140px -70px rgba(8,5,2,0.6)',
  coverFilter: 'brightness(0.95)',
  mascotRing: 'inset 0 0 0 3px #3a2c1c, 0 0 30px 8px rgba(255,200,120,0.22)',
  pool: 'radial-gradient(58% 72% at 50% 44%, rgba(255,200,130,0.32), transparent 72%)',
  progressTrack: 'rgba(255,220,170,0.14)',
  progressFill: 'linear-gradient(90deg, #c98e44, #ffcf85)',
}

type Theme = typeof DAY

// ---- pure helpers -----------------------------------------------------------

/** Stable per-id tilt so the wall looks hand-hung, not gridded. SSR-safe. */
function hashTilt(id: string): { deg: number; dy: number } {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const deg = ((h % 33) / 32 - 0.5) * 3 // ≈ -1.5 .. +1.5 deg
  const dy = (h >> 5) % 4 // 0..3 px
  return { deg, dy }
}

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getFullYear(), 0, 0)
  const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.floor((today - start) / 86_400_000)
}

function greetingFor(lang: string): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return lang === 'en' ? 'Good morning, little dreamer' : 'Guten Morgen, kleiner Träumer'
  if (h >= 11 && h < 18) return lang === 'en' ? "So glad you're here" : 'Schön, dass du da bist'
  return lang === 'en' ? 'Good night, little dreamer' : 'Gute Nacht, kleiner Träumer'
}

function coverSrc(path: string, mobile: boolean): string {
  return `${base}${getMobileSrc(path, mobile).replace(/^\//, '')}`
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

const PILL_BASE =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border backdrop-blur-sm'

// ---- ambient layers ---------------------------------------------------------

function Motes() {
  // Generated once so the motes don't jump when the page re-renders or theme flips.
  const motes = useMemo(() => {
    const variants = ['nlMoteA', 'nlMoteB', 'nlMoteC']
    return Array.from({ length: 8 }, (_, i) => {
      const r = (n: number) => (Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1
      const rand = (n: number, lo: number, hi: number) => lo + Math.abs(r(n)) * (hi - lo)
      return {
        left: rand(1, 6, 92),
        bottom: rand(2, 2, 60),
        size: rand(3, 3, 6),
        dur: rand(4, 18, 30),
        delay: rand(5, 0, 14),
        variant: variants[i % 3],
        desktopOnly: i >= 5,
      }
    })
  }, [])
  return (
    <>
      {motes.map((m, i) => (
        <span
          key={i}
          aria-hidden
          className={`nl-anim absolute rounded-full ${m.desktopOnly ? 'hidden sm:block' : ''}`}
          style={{
            left: `${m.left}%`,
            bottom: `${m.bottom}%`,
            width: m.size,
            height: m.size,
            background: 'rgba(255,236,200,0.55)',
            filter: 'blur(0.5px)',
            animation: `${m.variant} ${m.dur}s linear ${m.delay}s infinite`,
          }}
        />
      ))}
    </>
  )
}

// ---- matted shelf frame -----------------------------------------------------

interface FrameProps {
  story: Story
  title: string
  t: Theme
  mobile: boolean
  delayMs: number
  glowKey: number
  eager: boolean
  onSelect: (story: Story) => void
  onContext: (e: React.MouseEvent, storyId: string) => void
}

function Frame({ story, title, t, mobile, delayMs, glowKey, eager, onSelect, onContext }: FrameProps) {
  const { deg, dy } = hashTilt(story.id)
  return (
    <button
      type="button"
      aria-label={title}
      onClick={() => onSelect(story)}
      onContextMenu={(e) => onContext(e, story.id)}
      className="nl-anim group relative block w-full text-left focus-visible:outline-none rounded-2xl"
      style={{ animation: `nlFrameIn 520ms ease-out both`, animationDelay: `${delayMs}ms` }}
    >
      {/* ambient warm halo — also performs the "lights coming on" cascade (keyed) */}
      <span
        key={glowKey}
        aria-hidden
        className="nl-anim pointer-events-none absolute -inset-2.5 rounded-[1.4rem]"
        style={{
          background: t.halo,
          filter: 'blur(14px)',
          opacity: t.glowRest,
          ['--glow-rest']: String(t.glowRest),
          animation: `nlLightsOn 760ms ease-out both`,
          animationDelay: `${delayMs}ms`,
        } as React.CSSProperties}
      />
      {/* hover bloom */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-[1.4rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: t.haloHover, filter: 'blur(16px)' }}
      />
      {/* static hand-hung tilt */}
      <span className="relative block" style={{ transform: `rotate(${deg}deg) translateY(${dy}px)` }}>
        {/* calm hover lift */}
        <span className="nl-lift block">
          {/* paper mat */}
          <span
            className="block rounded-2xl p-1.5 sm:p-2 ring-2 ring-transparent group-focus-visible:ring-[#f5b942]"
            style={{ background: t.mat, boxShadow: t.frameShadow }}
          >
            <span
              className="block overflow-hidden rounded-xl"
              style={{ boxShadow: `inset 0 0 0 1px ${t.keyline}` }}
            >
              <img
                src={coverSrc(story.coverImage, mobile)}
                alt=""
                className="block w-full object-cover aspect-[3/2]"
                style={{ filter: t.coverFilter }}
                loading={eager ? 'eager' : 'lazy'}
                decoding={eager ? 'sync' : 'async'}
              />
            </span>
            {/* caption strip below the painting — never over it */}
            <span className="block px-1 pt-1.5 pb-0.5">
              <span
                className="block line-clamp-2"
                style={{ fontFamily: FREDOKA, fontWeight: 500, fontSize: 14.5, lineHeight: 1.2, color: t.caption }}
              >
                {title}
              </span>
            </span>
          </span>
        </span>
      </span>
    </button>
  )
}

// ---- wooden shelf ledge ------------------------------------------------------

function Ledge({ t }: { t: Theme }) {
  return (
    <div
      aria-hidden
      className="mt-1.5 h-3 rounded-b-md sm:h-3.5"
      style={{ background: t.ledge, boxShadow: `0 2px 0 ${t.ledgeLip}, 0 9px 16px -6px rgba(40,20,4,0.4)` }}
    />
  )
}

// ---- featured "tonight" frame -----------------------------------------------

interface FeaturedProps {
  story: Story
  title: string
  teaser: string
  t: Theme
  mobile: boolean
  lang: string
  dim: boolean
  onSelect: (story: Story) => void
  onContext: (e: React.MouseEvent, storyId: string) => void
  onAnother: () => void
}

function Featured({ story, title, teaser, t, mobile, lang, dim, onSelect, onContext, onAnother }: FeaturedProps) {
  return (
    <section className="relative mt-6 sm:mt-7" style={{ perspective: 1200 }}>
      {/* pool of lamplight */}
      <div aria-hidden className="pointer-events-none absolute -inset-x-24 -inset-y-12 rounded-[3rem]" style={{ background: t.pool, filter: 'blur(10px)' }} />
      <div className="relative mx-auto" style={{ maxWidth: 760 }}>
        <button
          type="button"
          aria-label={`${lang === 'en' ? 'Tonight' : 'Heute Nacht'}: ${title}`}
          onClick={() => onSelect(story)}
          onContextMenu={(e) => onContext(e, story.id)}
          className="group relative block w-full text-left focus-visible:outline-none"
        >
          <div
            className="nl-featured-lift"
            style={{ opacity: dim ? 0.3 : 1, transition: 'opacity 220ms ease, transform 300ms cubic-bezier(.22,1,.36,1)' }}
          >
            <div
              className="rounded-3xl p-2 sm:p-2.5 ring-2 ring-transparent group-focus-visible:ring-[#f5b942]"
              style={{ background: t.mat, boxShadow: t.featuredShadow }}
            >
              <div className="relative overflow-hidden rounded-2xl" style={{ boxShadow: `inset 0 0 0 1px ${t.keyline}` }}>
                <img
                  src={coverSrc(story.coverImage, mobile)}
                  alt=""
                  className="block w-full object-cover aspect-[3/2]"
                  loading="eager"
                  decoding="sync"
                />
                {/* slow sheen */}
                <span
                  aria-hidden
                  className="nl-anim pointer-events-none absolute inset-y-0 left-0 w-1/4"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,250,235,0.35), transparent)',
                    animation: 'nlSheen 7s ease-in-out infinite',
                  }}
                />
                {/* tonight pill */}
                <span
                  className={`${PILL_BASE} absolute left-2.5 top-2.5`}
                  style={{ background: t.pillBg, color: t.pillText, borderColor: t.pillBorder, fontFamily: FREDOKA }}
                >
                  <span aria-hidden>✦</span>
                  {lang === 'en' ? 'Tonight' : 'Heute Nacht'}
                </span>
              </div>
              <div className="px-1.5 pt-2.5 pb-1 sm:px-2">
                <h2 style={{ fontFamily: FREDOKA, fontWeight: 600, fontSize: mobile ? 20 : 24, lineHeight: 1.15, color: t.textPrimary }}>
                  {title}
                </h2>
                <p className="mt-1 line-clamp-2" style={{ fontFamily: LORA, fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.35, color: t.meta }}>
                  {teaser}
                </p>
              </div>
            </div>
          </div>
        </button>
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={onAnother}
            className="rounded-full px-2 py-1 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5b942]"
            style={{ fontFamily: LORA, fontStyle: 'italic', fontSize: 13.5, color: t.subLabel }}
          >
            {lang === 'en' ? 'Show me another story' : 'Zeig mir eine andere Geschichte'}
          </button>
        </div>
      </div>
    </section>
  )
}

// ---- keep-reading nook ------------------------------------------------------

interface KeepReadingProps {
  story: Story
  title: string
  lastRead: LastRead
  t: Theme
  mobile: boolean
  lang: string
  onResume: (lr: LastRead) => void
  onContext: (e: React.MouseEvent, storyId: string) => void
  onDismiss: () => void
}

function KeepReading({ story, title, lastRead, t, mobile, lang, onResume, onContext, onDismiss }: KeepReadingProps) {
  const fraction = Math.max(0.04, Math.min(1, lastRead.page / lastRead.total))
  return (
    <section className="relative mt-5 sm:mt-6">
      <button
        type="button"
        aria-label={`${lang === 'en' ? 'Keep reading' : 'Weiterlesen'}: ${title}`}
        onClick={() => onResume(lastRead)}
        onContextMenu={(e) => onContext(e, story.id)}
        className="group relative block w-full overflow-hidden rounded-3xl text-left ring-2 ring-transparent transition-transform duration-300 focus-visible:outline-none focus-visible:ring-[#f5b942] active:scale-[0.99]"
        style={{ background: t.surface, boxShadow: t.cardShadow, border: `1px solid ${t.keyline}` }}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-2/5 sm:shrink-0">
            <img
              src={coverSrc(story.coverImage, mobile)}
              alt=""
              className="block h-full w-full object-cover aspect-[3/2]"
              loading="eager"
              decoding="sync"
            />
          </div>
          <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
            <span className={`${PILL_BASE} mb-2 self-start`} style={{ background: t.pillBg, color: t.pillText, borderColor: t.pillBorder, fontFamily: FREDOKA }}>
              <span aria-hidden>↻</span>
              {lang === 'en' ? 'Keep reading' : 'Weiterlesen'}
            </span>
            <h3 style={{ fontFamily: FREDOKA, fontWeight: 600, fontSize: 18, lineHeight: 1.2, color: t.textPrimary }}>{title}</h3>
            <p className="mt-1" style={{ fontFamily: LORA, fontStyle: 'italic', fontSize: 13.5, color: t.meta }}>
              {lang === 'en' ? `Page ${lastRead.page} of ${lastRead.total}` : `Seite ${lastRead.page} von ${lastRead.total}`}
            </p>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full" style={{ background: t.progressTrack }}>
              <div
                className="nl-anim h-full rounded-full"
                style={{
                  width: `${fraction * 100}%`,
                  background: t.progressFill,
                  transformOrigin: 'left',
                  animation: 'nlProgressFill 900ms ease-out both',
                }}
              />
            </div>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={lang === 'en' ? 'Remove from keep reading' : 'Aus „Weiterlesen“ entfernen'}
        title={lang === 'en' ? 'Remove from keep reading' : 'Aus „Weiterlesen“ entfernen'}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5b942] active:scale-90"
        style={{ background: t.pillBg, color: t.pillText, border: `1px solid ${t.pillBorder}` }}
      >
        <span aria-hidden>×</span>
      </button>
    </section>
  )
}

// ---- main library -----------------------------------------------------------

interface StoryLibraryProps {
  stories: Story[]
  onSelectStory: (story: Story) => void
}

export default function StoryLibrary({ stories, onSelectStory }: StoryLibraryProps) {
  const { nightMode } = useNightMode()
  const { language } = useLanguage()
  const mobile = useMobileImages()
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [featOffset, setFeatOffset] = useState(0)
  const [featDim, setFeatDim] = useState(false)
  const [shimmer, setShimmer] = useState(false)
  const pendingPick = useRef<Story | null>(null)

  const t = nightMode ? NIGHT : DAY

  // "Lights coming on" cascade: re-run when the user switches INTO night mode.
  const [revealKey, setRevealKey] = useState(0)
  const prevNight = useRef(nightMode)
  useEffect(() => {
    if (nightMode && !prevNight.current) setRevealKey((k) => k + 1)
    prevNight.current = nightMode
  }, [nightMode])

  const byId = useMemo(() => new Map(stories.map((s) => [s.id, s])), [stories])

  // Keep-reading: read once, validate the story still exists.
  const [keepDismissed, setKeepDismissed] = useState(false)
  const storedLastRead = useMemo<LastRead | null>(() => {
    const lr = readLastRead()
    return lr && byId.has(lr.id) ? lr : null
  }, [byId])
  const lastRead = keepDismissed ? null : storedLastRead
  const keepStory = lastRead ? byId.get(lastRead.id)! : null

  // Featured "tonight": deterministic per day, nudged by the "another story" link,
  // and never the same cover as the keep-reading nook.
  const featured = useMemo(() => {
    if (stories.length === 0) return null
    let baseIdx = dayOfYear(new Date()) % stories.length
    if (keepStory && stories[baseIdx]?.id === keepStory.id) baseIdx = (baseIdx + 1) % stories.length
    let idx = (baseIdx + featOffset) % stories.length
    if (keepStory && stories[idx]?.id === keepStory.id) idx = (idx + 1) % stories.length
    return stories[idx]
  }, [stories, keepStory, featOffset])

  // Build the themed bands, excluding the featured + keep-reading covers, with a
  // guaranteed catch-all so no story is ever dropped.
  const bands = useMemo(() => {
    const used = new Set<string>([featured?.id, keepStory?.id].filter(Boolean) as string[])
    const listed = new Set(SHELVES.flatMap((s) => s.ids))
    const out = SHELVES.map((s) => ({
      key: s.key,
      label: language === 'en' ? s.en : s.de,
      stories: s.ids.map((id) => byId.get(id)).filter((x): x is Story => !!x && !used.has(x.id)),
    }))
    const leftover = stories.filter((s) => !listed.has(s.id) && !used.has(s.id))
    if (leftover.length) out.push({ key: 'more', label: language === 'en' ? 'More Stories' : 'Mehr Geschichten', stories: leftover })
    return out.filter((b) => b.stories.length > 0)
  }, [stories, byId, featured, keepStory, language])

  // Stagger delays in visual order (featured first, then down the shelves).
  const delayFor = useMemo(() => {
    const m = new Map<string, number>()
    let o = 1
    bands.forEach((b) => b.stories.forEach((s) => m.set(s.id, Math.min(o++ * 38, 620))))
    return m
  }, [bands])

  const greeting = greetingFor(language)
  const subLabel = language === 'en' ? 'Bedtime Stories' : 'Geschichten zum Einschlafen'

  const openContext = (e: React.MouseEvent, storyId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, storyId })
  }

  const resume = (lr: LastRead) => {
    window.location.hash = `#/${lr.id}/${lr.page}`
  }

  const dismissKeep = () => {
    clearLastRead()
    setKeepDismissed(true)
  }

  const nextFeatured = () => {
    setFeatDim(true)
    window.setTimeout(() => {
      setFeatOffset((o) => o + 1)
      setFeatDim(false)
    }, 180)
  }

  const surpriseMe = () => {
    if (stories.length === 0) return
    const pick = stories[Math.floor(Math.random() * stories.length)]
    if (prefersReducedMotion()) {
      onSelectStory(pick)
      return
    }
    pendingPick.current = pick
    setShimmer(true)
  }

  const mascotSrc = coverSrc(`/stories/${MASCOT_COVER}/cover.png`, mobile)

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: nightMode ? '#150f0a' : '#efce93' }}>
      {/* crossfading day/night backgrounds — the "dusk falling" toggle moment */}
      <div aria-hidden className="nl-bgfade pointer-events-none absolute inset-0" style={{ background: DAY.pageBg, opacity: nightMode ? 0 : 1 }} />
      <div aria-hidden className="nl-bgfade pointer-events-none absolute inset-0" style={{ background: NIGHT.pageBg, opacity: nightMode ? 1 : 0 }} />
      {/* ambient layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="nl-anim absolute"
          style={{ top: -200, left: -200, width: 560, height: 560, background: t.nightlight, animation: 'nlFlicker 9s ease-in-out infinite' }}
        />
        <Motes />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            opacity: nightMode ? 0.05 : 0.06,
            mixBlendMode: nightMode ? 'overlay' : 'soft-light',
          }}
        />
        <div className="absolute inset-0" style={{ boxShadow: t.vignette }} />
      </div>

      {/* controls */}
      <div className="absolute right-4 top-4 z-30 flex gap-1.5">
        <LanguageToggle />
        <NightModeToggle />
      </div>

      {/* content column */}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-8 pt-9 sm:px-6 sm:pt-12">
        {/* header nook */}
        <header className="nl-anim flex items-center gap-4 pr-24 sm:gap-5" style={{ animation: 'nlGreetingIn 700ms ease-out both' }}>
          <div className="relative shrink-0">
            <div
              className="nl-anim absolute -inset-3 rounded-full"
              style={{ background: t.nightlight, animation: 'nlFlicker 9s ease-in-out infinite' }}
            />
            <div
              className="nl-anim relative overflow-hidden rounded-full"
              style={{ width: mobile ? 76 : 96, height: mobile ? 76 : 96, boxShadow: t.mascotRing, animation: 'nlBreath 6s ease-in-out infinite' }}
            >
              <img
                src={mascotSrc}
                alt=""
                aria-hidden
                className="h-full w-full object-cover"
                style={{
                  objectPosition: '46% 40%',
                  transform: 'scale(2.1)',
                  transformOrigin: '50% 30%',
                  filter: nightMode ? 'brightness(0.97)' : undefined,
                }}
              />
            </div>
          </div>
          <div className="min-w-0">
            <h1 style={{ fontFamily: FREDOKA, fontWeight: 600, fontSize: 'clamp(21px, 5.2vw, 30px)', lineHeight: 1.12, color: t.textPrimary }}>
              {greeting}
            </h1>
            <p className="mt-1" style={{ fontFamily: LORA, fontStyle: 'italic', fontSize: 'clamp(13px, 3.4vw, 16px)', color: t.subLabel }}>
              {subLabel}
            </p>
          </div>
        </header>

        {/* action row */}
        <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6">
          <button
            type="button"
            onClick={surpriseMe}
            aria-label={language === 'en' ? 'Open a random story' : 'Zufällige Geschichte öffnen'}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5b942] active:scale-95"
            style={{ fontFamily: FREDOKA, fontWeight: 500, background: t.pillBg, color: t.pillText, border: `1px solid ${t.pillBorder}` }}
          >
            <span aria-hidden>🌙</span>
            {language === 'en' ? 'Surprise me' : 'Überrasch mich'}
          </button>
        </div>

        {/* keep-reading */}
        {keepStory && lastRead && (
          <KeepReading
            story={keepStory}
            title={localizeStory(keepStory, language).title}
            lastRead={lastRead}
            t={t}
            mobile={mobile}
            lang={language}
            onResume={resume}
            onContext={openContext}
            onDismiss={dismissKeep}
          />
        )}

        {/* featured tonight */}
        {featured && (
          <Featured
            story={featured}
            title={localizeStory(featured, language).title}
            teaser={localizeStory(featured, language).teaser}
            t={t}
            mobile={mobile}
            lang={language}
            dim={featDim}
            onSelect={onSelectStory}
            onContext={openContext}
            onAnother={nextFeatured}
          />
        )}

        {/* themed shelves */}
        {bands.map((band) => (
          <section key={band.key} className="mt-9 sm:mt-12">
            <h2
              className="mb-3 pl-1"
              style={{ fontFamily: FREDOKA, fontWeight: 500, fontSize: 15.5, letterSpacing: '0.02em', color: t.textPrimary }}
            >
              {band.label}
            </h2>
            <div className="grid gap-5 sm:gap-7" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))' }}>
              {band.stories.map((story) => (
                <Frame
                  key={story.id}
                  story={story}
                  title={localizeStory(story, language).title}
                  t={t}
                  mobile={mobile}
                  delayMs={delayFor.get(story.id) ?? 0}
                  glowKey={revealKey}
                  eager={(delayFor.get(story.id) ?? 0) < 160}
                  onSelect={onSelectStory}
                  onContext={openContext}
                />
              ))}
            </div>
            <Ledge t={t} />
          </section>
        ))}

        {/* copyright */}
        <p className="mt-10 text-center text-xs" style={{ fontFamily: LORA, fontStyle: 'italic', color: t.meta }}>
          © 2026 Benjamin Pasero. Alle Rechte vorbehalten.
        </p>
      </div>

      {/* surprise light-sweep, then navigate */}
      {shimmer && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          <div
            className="nl-anim absolute inset-y-0 left-0 w-1/2"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,228,176,0.5), transparent)', animation: 'nlShimmer 600ms ease-out forwards' }}
            onAnimationEnd={() => {
              setShimmer(false)
              if (pendingPick.current) onSelectStory(pendingPick.current)
              pendingPick.current = null
            }}
          />
        </div>
      )}

      {contextMenu && <StoryContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />}
    </div>
  )
}
