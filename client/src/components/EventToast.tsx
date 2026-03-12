import { useEffect, useState, useRef } from 'react'
import type { LogEntry } from '../types/game'

interface Props {
  logs: LogEntry[]
}

interface Toast {
  id: number
  log: LogEntry
  exiting: boolean
}

const TYPE_CONFIG: Record<string, { bg: string; border: string; icon: string }> = {
  combat: { bg: 'bg-red-950/90', border: 'border-red-500/50', icon: '⚔️' },
  elimination: { bg: 'bg-yellow-950/90', border: 'border-yellow-500/50', icon: '☠️' },
  trade: { bg: 'bg-blue-950/90', border: 'border-blue-500/50', icon: '🤝' },
}

export function EventToast({ logs }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    if (logs.length === 0) return
    const recent = logs.slice(-4)
    const important = recent.filter(l => l.type === 'combat' || l.type === 'elimination' || l.type === 'trade')
    if (important.length === 0) return

    const newToasts = important.map((log, i) => ({ id: Date.now() + i, log, exiting: false }))
    setToasts(prev => [...prev, ...newToasts].slice(-3))

    // Start exit animation before removal
    const exitTimer = setTimeout(() => {
      setToasts(prev => prev.map(t => newToasts.find(n => n.id === t.id) ? { ...t, exiting: true } : t))
    }, 2200)

    const removeTimer = setTimeout(() => {
      setToasts(prev => prev.filter(t => !newToasts.find(n => n.id === t.id)))
    }, 2500)

    newToasts.forEach(t => {
      timersRef.current.set(t.id, exitTimer)
    })

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [logs.length])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-16 right-2 sm:right-4 z-30 space-y-2 max-w-[calc(100vw-1rem)] sm:max-w-xs">
      {toasts.map(({ id, log, exiting }) => {
        const cfg = TYPE_CONFIG[log.type] || { bg: 'bg-gray-900', border: 'border-gray-700', icon: '📡' }
        return (
          <div key={id} className={`${cfg.bg} border ${cfg.border} rounded-lg px-3 py-2 text-xs text-white shadow-lg backdrop-blur-sm ${exiting ? 'animate-toast-exit' : 'animate-log-entry'}`}>
            {cfg.icon} {log.message}
          </div>
        )
      })}
    </div>
  )
}
