// © 2026 Benjamin Pasero. All rights reserved.
// https://github.com/bpasero/firlefanz

import { describe, it, expect } from 'vitest'
import { encodeMessage, embedLSB, extractLSB } from './watermark-images.ts'

describe('encodeMessage', () => {
  it('prefixes the UTF-8 bytes with a 4-byte big-endian length header', () => {
    const result = encodeMessage('hi')
    // Length header: 0x00000002, then "hi" → 0x68 0x69
    expect(result.length).toBe(4 + 2)
    expect(result.readUInt32BE(0)).toBe(2)
    expect(result.subarray(4).toString('utf-8')).toBe('hi')
  })

  it('handles multi-byte UTF-8 characters by counting bytes (not codepoints)', () => {
    const result = encodeMessage('é') // 2 bytes in UTF-8 (0xC3 0xA9)
    expect(result.readUInt32BE(0)).toBe(2)
  })

  it('handles the empty string with a zero-length header', () => {
    const result = encodeMessage('')
    expect(result.length).toBe(4)
    expect(result.readUInt32BE(0)).toBe(0)
  })
})

describe('embedLSB + extractLSB round-trip', () => {
  // Build a pixel buffer big enough to host the encoded message.
  function pixels(byteLen: number, fill = 0x80): Buffer {
    return Buffer.alloc(byteLen, fill)
  }

  it('round-trips the production stego message through the same pixel buffer', () => {
    const message = 'Copyright Benjamin Pasero https://github.com/bpasero/firlefanz'
    const encoded = encodeMessage(message)
    // Need at least encoded.length * 8 bits of capacity.
    const buf = pixels(encoded.length * 8 + 64)
    embedLSB(buf, encoded)
    expect(extractLSB(buf)).toBe(message)
  })

  it('round-trips a short ASCII message', () => {
    const encoded = encodeMessage('hello')
    const buf = pixels(encoded.length * 8 + 32)
    embedLSB(buf, encoded)
    expect(extractLSB(buf)).toBe('hello')
  })

  it('round-trips a message with multi-byte UTF-8 characters', () => {
    const encoded = encodeMessage('© 2026 — émojis 🎉')
    const buf = pixels(encoded.length * 8 + 32)
    embedLSB(buf, encoded)
    expect(extractLSB(buf)).toBe('© 2026 — émojis 🎉')
  })

  it('only modifies the least significant bit of each pixel byte', () => {
    const original = pixels(256, 0xfe) // top 7 bits = 1111111, lsb = 0
    const buf = Buffer.from(original)
    embedLSB(buf, encodeMessage('x'))
    // Every byte should still have its top 7 bits intact: byte & 0xfe === 0xfe.
    for (let i = 0; i < buf.length; i++) {
      expect(buf[i] & 0xfe).toBe(0xfe)
    }
  })

  it('throws when the buffer is too small to hold the message', () => {
    const encoded = encodeMessage('hello world')
    // Need encoded.length * 8 bits = encoded.length bytes of capacity (1 bit/byte).
    const tooSmall = pixels(encoded.length * 8 - 1)
    expect(() => embedLSB(tooSmall, encoded)).toThrow(/Image too small/)
  })

  it('survives noise in the upper bits of pixel data (only LSB carries the payload)', () => {
    // Simulate a varied image background — random-looking bytes.
    const buf = Buffer.from(
      Array.from({ length: 4096 }, (_, i) => (i * 37 + 13) & 0xff)
    )
    embedLSB(buf, encodeMessage('Firlefanz'))
    expect(extractLSB(buf)).toBe('Firlefanz')
  })
})

describe('extractLSB safety guards', () => {
  it('returns null when the decoded length header is unreasonably large', () => {
    // Set length header to 0xffffffff (way over the 10000 cap).
    const buf = Buffer.alloc(64, 0)
    for (let i = 0; i < 32; i++) buf[i] = 0x01 // every lsb = 1 → length = 0xffffffff
    expect(extractLSB(buf)).toBeNull()
  })

  it('returns null when the decoded length header is zero', () => {
    const buf = Buffer.alloc(64, 0xfe) // every lsb = 0 → length = 0
    expect(extractLSB(buf)).toBeNull()
  })

  it('returns null when the buffer is shorter than the claimed message length', () => {
    // Encode a length of 100 bytes, but provide only the 4-byte header.
    const buf = Buffer.alloc(40, 0)
    // Encode length=100 (0x00000064) into the first 32 lsb bits.
    const lenBits = []
    for (let i = 31; i >= 0; i--) lenBits.push((100 >> i) & 1)
    for (let i = 0; i < 32; i++) buf[i] = lenBits[i]
    // Buffer is only 40 bytes — far less than 32 + 100 * 8 = 832 bits required.
    expect(extractLSB(buf)).toBeNull()
  })
})
