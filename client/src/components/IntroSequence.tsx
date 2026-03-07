import { useEffect, useState } from 'react'
import type { Civilization } from '../types/game'

interface Props {
  civs: Civilization[]
  onComplete: () => void
}

const LINES = [
  'Initializing world...',
  'Generating terrain...',
  'Spawning civilizations...',
]

export function IntroSequence({ civs, onComplete }: Props) {
  const [lineIndex, setLineIndex] = useState(0)
  const [showCivs, setShowCivs] = useState(false)
  const [civIndex, setCivIndex] = useState(-1)

  useEffect(() => {
    if (lineIndex < LINES.length) {
      const timer = setTimeout(() => setLineIndex(i => i + 1), 600)
      return () => clearTimeout(timer)
    } else if (!showCivs) {
      const timer = setTimeout(() => setShowCivs(true), 300)
      return () => clearTimeout(timer)
    }
  }, [lineIndex, showCivs])

  useEffect(() => {
    if (!showCivs) return
    if (civIndex < civs.length - 1) {
      const timer = setTimeout(() => setCivIndex(i => i + 1), 400)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(onComplete, 800)
      return () => clearTimeout(timer)
    }
  }, [showCivs, civIndex, civs.length, onComplete])

  return (
    <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
      <div className="text-center space-y-3 font-mono">
        {LINES.slice(0, lineIndex).map((line, i) => (
          <p key={i} className="text-gray-500 text-sm animate-log-entry">
            <span className="text-green-500">{'>'}</span> {line}
          </p>
        ))}
        {showCivs && civs.slice(0, civIndex + 1).map((c) => (
          <p key={c.id} className="text-sm animate-log-entry font-bold" style={{ color: c.color }}>
            <span className="text-gray-600">{'>'}</span> {c.name} has entered the world
          </p>
        ))}
        {lineIndex <= LINES.length && (
          <span className="inline-block w-2 h-4 bg-green-500 animate-pulse" />
        )}
      </div>
    </div>
  )
}
