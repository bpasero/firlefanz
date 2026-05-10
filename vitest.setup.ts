// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

// Shim window.speechSynthesis for happy-dom, which doesn't expose the Web Speech
// API. StoryReader's audio effect calls .cancel() unguarded, which would throw
// and React 19 would unmount the entire tree on the resulting effect error.
if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      speak: () => {},
      getVoices: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      paused: false,
      pending: false,
      speaking: false,
    },
  })
}
