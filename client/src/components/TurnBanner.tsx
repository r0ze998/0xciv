import { useEffect, useState } from 'react'

interface Props {
  turn: number
  message?: string
}

export function TurnBanner({ turn, message }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (turn === 0) return
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(timer)
  }, [turn])

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
      <div className="text-center animate-turn-banner">
        <p className="text-6xl font-black tracking-widest" style={{
          background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 40px rgba(0,255,255,0.3)',
        }}>
          TURN {turn}
        </p>
        {message && <p className="text-gray-400 text-sm mt-2">{message}</p>}
      </div>
    </div>
  )
}
