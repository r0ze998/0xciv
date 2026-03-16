import { useEffect, useState } from 'react'
import type { Civilization } from '../types/game'

interface Props {
  civs: Civilization[]
  onComplete: () => void
}

const LINES = [
  '> BOOT_SEQUENCE initialized...',
  '> Generating terrain matrix...',
  '> Spawning civilizations...',
  '> Linking on-chain state...',
]

export function IntroSequence({ civs, onComplete }: Props) {
  const [lineIndex, setLineIndex] = useState(0)
  const [showCivs, setShowCivs] = useState(false)
  const [civIndex, setCivIndex] = useState(-1)

  useEffect(() => {
    if (lineIndex < LINES.length) {
      const timer = setTimeout(() => setLineIndex(i => i + 1), 500)
      return () => clearTimeout(timer)
    } else if (!showCivs) {
      const timer = setTimeout(() => setShowCivs(true), 300)
      return () => clearTimeout(timer)
    }
  }, [lineIndex, showCivs])

  useEffect(() => {
    if (!showCivs) return
    if (civIndex < civs.length - 1) {
      const timer = setTimeout(() => setCivIndex(i => i + 1), 350)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(onComplete, 700)
      return () => clearTimeout(timer)
    }
  }, [showCivs, civIndex, civs.length, onComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 crt-lines"
      style={{ backgroundColor: 'var(--c-bg)' }}>
      <div className="text-center space-y-2" style={{ fontFamily: 'var(--font-mono)' }}>
        {LINES.slice(0, lineIndex).map((line, i) => (
          <p key={i} className="text-xs animate-log-entry" style={{ color: 'var(--c-text-dim)' }}>
            <span className="neon-green">{line.slice(0, 1)}</span>{line.slice(1)}
          </p>
        ))}
        {showCivs && civs.slice(0, civIndex + 1).map((c) => (
          <p key={c.id} className="text-sm animate-log-entry font-bold" style={{
            color: c.color,
            textShadow: `0 0 12px ${c.color}55`,
          }}>
            <span style={{ color: 'var(--c-text-muted)' }}>&gt;</span> {c.name} :: ONLINE
          </p>
        ))}
        {lineIndex <= LINES.length && (
          <span className="typing-cursor" />
        )}
      </div>
    </div>
  )
}
