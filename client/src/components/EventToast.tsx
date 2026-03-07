import { useEffect, useState } from 'react'
import type { LogEntry } from '../types/game'

interface Props {
  logs: LogEntry[]
}

const TYPE_CONFIG: Record<string, { bg: string; border: string; icon: string }> = {
  combat: { bg: 'bg-red-950/90', border: 'border-red-500/50', icon: '⚔️' },
  elimination: { bg: 'bg-yellow-950/90', border: 'border-yellow-500/50', icon: '☠️' },
  trade: { bg: 'bg-blue-950/90', border: 'border-blue-500/50', icon: '🤝' },
}

export function EventToast({ logs }: Props) {
  const [toasts, setToasts] = useState<{ id: number; log: LogEntry }[]>([])

  useEffect(() => {
    if (logs.length === 0) return
    const recent = logs.slice(-4)
    const important = recent.filter(l => l.type === 'combat' || l.type === 'elimination' || l.type === 'trade')
    if (important.length === 0) return

    const newToasts = important.map((log, i) => ({ id: Date.now() + i, log }))
    setToasts(prev => [...prev, ...newToasts].slice(-3))

    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => !newToasts.find(n => n.id === t.id)))
    }, 2500)

    return () => clearTimeout(timer)
  }, [logs.length])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-16 right-4 z-30 space-y-2 max-w-xs">
      {toasts.map(({ id, log }) => {
        const cfg = TYPE_CONFIG[log.type] || { bg: 'bg-gray-900', border: 'border-gray-700', icon: '📡' }
        return (
          <div key={id} className={`${cfg.bg} border ${cfg.border} rounded-lg px-3 py-2 text-xs text-white animate-log-entry shadow-lg`}>
            {cfg.icon} {log.message}
          </div>
        )
      })}
    </div>
  )
}
