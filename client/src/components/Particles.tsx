import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  emoji: string
  dx: number
  dy: number
  life: number
}

let nextId = 0

export function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (particles.length === 0) return
    const timer = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, x: p.x + p.dx, y: p.y + p.dy, dy: p.dy + 0.5, life: p.life - 1 }))
          .filter(p => p.life > 0)
      )
    }, 50)
    return () => clearInterval(timer)
  }, [particles.length > 0])

  function emit(x: number, y: number, type: 'attack' | 'gather' | 'defend' | 'trade' | 'elimination') {
    const configs: Record<string, { emojis: string[]; count: number }> = {
      attack: { emojis: ['💥', '⚔️', '🔥', '💢'], count: 6 },
      gather: { emojis: ['✨', '⭐', '💎'], count: 4 },
      defend: { emojis: ['🛡️', '💙', '🔷'], count: 3 },
      trade: { emojis: ['🤝', '💰', '📦'], count: 3 },
      elimination: { emojis: ['💀', '☠️', '🔥', '💥', '😵'], count: 8 },
    }
    const cfg = configs[type]
    const newParticles: Particle[] = Array.from({ length: cfg.count }, () => ({
      id: nextId++,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 20,
      emoji: cfg.emojis[Math.floor(Math.random() * cfg.emojis.length)],
      dx: (Math.random() - 0.5) * 6,
      dy: -(Math.random() * 4 + 2),
      life: 15 + Math.floor(Math.random() * 10),
    }))
    setParticles(prev => [...prev, ...newParticles].slice(-50))
  }

  return { particles, emit }
}

export function ParticleLayer({ particles }: { particles: Particle[] }) {
  if (particles.length === 0) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute text-lg select-none"
          style={{
            left: p.x,
            top: p.y,
            opacity: p.life / 20,
            transform: `scale(${0.5 + p.life / 30})`,
            transition: 'none',
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
