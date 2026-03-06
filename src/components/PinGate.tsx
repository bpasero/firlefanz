import { useState, useRef, useEffect } from 'react'

const PIN = '040522'
const SESSION_KEY = 'firlefanz-auth'

interface PinGateProps {
  children: React.ReactNode
}

export default function PinGate({ children }: PinGateProps) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  )
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  if (authenticated) {
    return <>{children}</>
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)
    setError(false)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newDigits.every((d) => d !== '') && newDigits.join('') !== '') {
      const entered = newDigits.join('')
      if (entered === PIN) {
        sessionStorage.setItem(SESSION_KEY, 'true')
        setAuthenticated(true)
      } else {
        setError(true)
        setTimeout(() => {
          setDigits(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }, 600)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newDigits = [...digits]
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || ''
    }
    setDigits(newDigits)
    if (pasted.length === 6) {
      if (pasted === PIN) {
        sessionStorage.setItem(SESSION_KEY, 'true')
        setAuthenticated(true)
      } else {
        setError(true)
        setTimeout(() => {
          setDigits(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }, 600)
      }
    } else {
      inputRefs.current[pasted.length]?.focus()
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(170deg, #f9e8c9 0%, #f5d5a0 30%, #e8c07a 60%, #d4a05a 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #fde68a, transparent 70%)' }}
        />
        <div
          className="absolute bottom-10 right-1/4 w-56 h-56 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #fbbf24, transparent 70%)' }}
        />
        <div className="absolute top-20 right-1/3 text-amber-400/40 text-2xl">&#10022;</div>
        <div className="absolute bottom-32 left-1/4 text-amber-300/30 text-lg">&#10022;</div>
      </div>

      <div className="relative z-10 text-center">
        <h1
          className="text-4xl sm:text-5xl font-bold mb-3"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: '#7c4a1e',
          }}
        >
          Firlefanz
        </h1>
        <p
          className="text-lg italic mb-10"
          style={{
            fontFamily: "'Lora', serif",
            color: '#a0714a',
          }}
        >
          Bitte gib den Geheimcode ein
        </p>

        <div className="flex gap-2 sm:gap-3 justify-center mb-6" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl outline-none transition-all duration-200"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#7c4a1e',
                backgroundColor: 'rgba(255,255,255,0.6)',
                border: error ? '2px solid #c44' : '2px solid rgba(180,140,90,0.3)',
                boxShadow: '0 2px 8px rgba(120,70,20,0.1)',
                animation: error ? 'shake 0.4s ease-in-out' : undefined,
              }}
            />
          ))}
        </div>

        {error && (
          <p
            className="text-sm"
            style={{
              fontFamily: "'Lora', serif",
              color: '#c44',
            }}
          >
            Das war leider falsch!
          </p>
        )}
      </div>
    </div>
  )
}
