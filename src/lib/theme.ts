// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

// Colour tokens shared by the pill controls, the reader and the context menu.
// High contrast is orthogonal to day/night, so every surface has four variants.
// High-contrast text must stay at WCAG AAA (7:1) on its background — see theme.test.ts.

export interface ThemeMode {
  nightMode: boolean
  highContrast: boolean
}

function pick<T>({ nightMode, highContrast }: ThemeMode, v: { day: T; night: T; hcDay: T; hcNight: T }): T {
  if (highContrast) return nightMode ? v.hcNight : v.hcDay
  return nightMode ? v.night : v.day
}

// ---- page backdrop ----------------------------------------------------------

export function rootBackground(mode: ThemeMode): string {
  return pick(mode, { day: '#edd3a4', night: '#14100c', hcDay: '#ffffff', hcNight: '#000000' })
}

// ---- pill controls ----------------------------------------------------------

export interface ControlColors {
  bg: string
  hoverBg: string
  color: string
  /** Visible outline in high contrast; undefined in the soft themes. */
  border: string | undefined
}

/** `active` marks a switched-on toggle (narration, music, contrast). */
export function controlColors(mode: ThemeMode, active = false): ControlColors {
  if (active) {
    return pick(mode, {
      day: { bg: 'rgba(180,140,90,0.4)', hoverBg: 'rgba(180,140,90,0.55)', color: '#7c4a1e', border: undefined },
      night: { bg: 'rgba(180,140,90,0.35)', hoverBg: 'rgba(180,140,90,0.5)', color: '#e8d5b7', border: undefined },
      hcDay: { bg: '#000000', hoverBg: '#333333', color: '#ffffff', border: '2px solid #000000' },
      hcNight: { bg: '#ffe600', hoverBg: '#fff27a', color: '#000000', border: '2px solid #ffe600' },
    })
  }
  return pick(mode, {
    day: { bg: 'rgba(255,255,255,0.4)', hoverBg: 'rgba(255,255,255,0.6)', color: '#7c4a1e', border: undefined },
    night: { bg: 'rgba(255,255,255,0.12)', hoverBg: 'rgba(255,255,255,0.22)', color: '#e8d5b7', border: undefined },
    hcDay: { bg: '#ffffff', hoverBg: '#dddddd', color: '#000000', border: '2px solid #000000' },
    hcNight: { bg: '#000000', hoverBg: '#333333', color: '#ffffff', border: '2px solid #ffffff' },
  })
}

// ---- story reader -----------------------------------------------------------

const READER_DAY = {
  pageBg: 'linear-gradient(170deg, #f5e1be 0%, #edd3a4 40%, #dfc08a 100%)',
  bookBg: '#fdf8ed',
  bookShadow: '0 12px 40px rgba(120,70,20,0.25), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(180,140,90,0.2)',
  imageBg: '#faf3e3',
  imageFilter: undefined as string | undefined,
  paper: 'linear-gradient(145deg, #fdf8ed 0%, #f8eed5 40%, #f3e5c0 100%)',
  paperBack: 'linear-gradient(135deg, #f5ead4, #fdf8ed 50%, #f0e4cc)',
  spineV: 'linear-gradient(90deg, #b8956a, #d4b08c, #b8956a)',
  spineH: 'linear-gradient(180deg, #b8956a, #d4b08c, #b8956a)',
  cornerFold: 'linear-gradient(135deg, transparent 50%, #eddcb8 50%)',
  text: '#4a3520',
  pageNumber: '#c4a06a',
  title: '#7c4a1e',
  counter: '#9a6b3a',
  counterBg: 'rgba(255,255,255,0.3)',
  btnBg: 'rgba(255,255,255,0.5)',
  btnHoverBg: 'rgba(255,255,255,0.7)',
  btnColor: '#7c4a1e',
  btnBorder: undefined as string | undefined,
}

export type ReaderColors = typeof READER_DAY

const READER_NIGHT: ReaderColors = {
  pageBg: 'linear-gradient(170deg, #1e1810 0%, #1a1410 40%, #14100c 100%)',
  bookBg: '#1e1a12',
  bookShadow: '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(60,40,20,0.3)',
  imageBg: '#1e1a14',
  imageFilter: 'brightness(0.75)',
  paper: 'linear-gradient(145deg, #2a2418 0%, #241e14 40%, #1e1a12 100%)',
  paperBack: 'linear-gradient(135deg, #2a2418, #1e1a12 50%, #252015)',
  spineV: 'linear-gradient(90deg, #3a2a1c, #4a3828, #3a2a1c)',
  spineH: 'linear-gradient(180deg, #3a2a1c, #4a3828, #3a2a1c)',
  cornerFold: 'linear-gradient(135deg, transparent 50%, #1a1610 50%)',
  text: '#d4c4a8',
  pageNumber: '#6a5a40',
  title: '#e8d5b7',
  counter: '#b8956a',
  counterBg: 'rgba(255,255,255,0.08)',
  btnBg: 'rgba(255,255,255,0.1)',
  btnHoverBg: 'rgba(255,255,255,0.18)',
  btnColor: '#e8d5b7',
  btnBorder: undefined,
}

const READER_HC_DAY: ReaderColors = {
  pageBg: '#ffffff',
  bookBg: '#ffffff',
  bookShadow: '0 0 0 2px #000000',
  imageBg: '#ffffff',
  imageFilter: undefined,
  paper: '#ffffff',
  paperBack: '#ffffff',
  spineV: '#000000',
  spineH: '#000000',
  cornerFold: 'none',
  text: '#000000',
  pageNumber: '#000000',
  title: '#000000',
  counter: '#000000',
  counterBg: '#ffffff',
  btnBg: '#ffffff',
  btnHoverBg: '#dddddd',
  btnColor: '#000000',
  btnBorder: '2px solid #000000',
}

// The spine is grey rather than white so a dark bedroom gets no glaring bar.
const READER_HC_NIGHT: ReaderColors = {
  pageBg: '#000000',
  bookBg: '#000000',
  bookShadow: '0 0 0 2px #ffffff',
  imageBg: '#000000',
  imageFilter: undefined,
  paper: '#000000',
  paperBack: '#000000',
  spineV: '#8a8a8a',
  spineH: '#8a8a8a',
  cornerFold: 'none',
  text: '#ffffff',
  pageNumber: '#ffffff',
  title: '#ffe600',
  counter: '#ffffff',
  counterBg: '#000000',
  btnBg: '#000000',
  btnHoverBg: '#333333',
  btnColor: '#ffffff',
  btnBorder: '2px solid #ffffff',
}

export function readerColors(mode: ThemeMode): ReaderColors {
  return pick(mode, { day: READER_DAY, night: READER_NIGHT, hcDay: READER_HC_DAY, hcNight: READER_HC_NIGHT })
}

// ---- context menu -----------------------------------------------------------

export function menuColors(mode: ThemeMode): { item: string; background: string; border: string; boxShadow: string } {
  return pick(mode, {
    day: {
      item: 'text-amber-950 hover:bg-amber-900/10',
      background: 'rgba(252,243,228,0.98)',
      border: '1px solid rgba(120,70,20,0.18)',
      boxShadow: '0 12px 32px rgba(120,70,20,0.35)',
    },
    night: {
      item: 'text-amber-100 hover:bg-amber-100/10',
      background: 'rgba(42,32,24,0.97)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
    },
    hcDay: {
      item: 'text-black hover:bg-black hover:text-white',
      background: '#ffffff',
      border: '2px solid #000000',
      boxShadow: 'none',
    },
    hcNight: {
      item: 'text-white hover:bg-[#ffe600] hover:text-black',
      background: '#000000',
      border: '2px solid #ffffff',
      boxShadow: 'none',
    },
  })
}
