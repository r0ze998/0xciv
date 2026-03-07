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
    const timer = setTimeout(() => setShowWarCry(false), 1200)
    return () => clearTimeout(timer)
  }, [warCry])

  return (
    <>
      {visible && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-center animate-turn-banner">
            <p className="text-6xl font-black tracking-widest" style={{
              background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>TURN {turn}</p>
            {message && <p className="text-gray-400 text-sm mt-2">{message}</p>}
          </div>
        </div>
      )}
      {showWarCry && warCry && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-35 pointer-events-none animate-turn-banner">
          <p className="text-2xl font-black tracking-wider" style={{
            color: warCryColor || '#fff',
            textShadow: `0 0 20px ${warCryColor || '#fff'}44`,
          }}>"{warCry}"</p>
        </div>
      )}
    </>
  )
}
