import { useState, useEffect } from 'react'

interface Props {
  isPlaying: boolean
}

export function GameClock({ isPlaying }: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isPlaying) return
    const start = Date.now() - elapsed * 1000
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying])

  if (!isPlaying && elapsed === 0) return null

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <span className="text-[10px] text-gray-600 font-mono hidden sm:inline">
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  )
}
