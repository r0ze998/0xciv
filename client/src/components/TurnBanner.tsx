import { useEffect, useState } from 'react'

interface Props {
  turn: number
  message?: string
  warCry?: string
  warCryColor?: string
}

export function TurnBanner({ turn, message, warCry, warCryColor }: Props) {
  const [visible, setVisible] = useState(false)
  const [showWarCry, setShowWarCry] = useState(false)

  useEffect(() => {
    if (turn === 0) return
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(timer)
  }, [turn])

  useEffect(() => {
    if (!warCry) return
    setShowWarCry(true)
    const timer = setTimeout(() => setShowWarCry(false), 1500)
    return () => clearTimeout(timer)
  }, [warCry])

  return (
    <>
      {visible && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-center animate-turn-banner">
            <p className="text-7xl sm:text-8xl font-black tracking-[0.3em]" style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--c-primary)',
              textShadow: '0 0 40px rgba(0, 255, 65, 0.5), 0 0 80px rgba(0, 255, 65, 0.2), 0 0 120px rgba(0, 212, 255, 0.1)',
            }}>T{turn}</p>
            {message && <p className="text-sm mt-2" style={{ color: 'var(--c-text-dim)' }}>{message}</p>}
          </div>
        </div>
      )}
      {showWarCry && warCry && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-35 pointer-events-none animate-turn-banner">
          <p className="text-xl sm:text-2xl font-black tracking-wider" style={{
            color: warCryColor || '#fff',
            textShadow: `0 0 20px ${warCryColor || '#fff'}66, 0 0 40px ${warCryColor || '#fff'}22`,
            fontFamily: 'var(--font-display)',
          }}>"{warCry}"</p>
        </div>
      )}
    </>
  )
}
