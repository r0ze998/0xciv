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

const TYPE_CONFIG: Record<string, { border: string; prefix: string }> = {
  combat: { border: 'var(--c-danger)', prefix: 'ATK' },
  elimination: { border: 'var(--c-warning)', prefix: 'KIA' },
  trade: { border: 'var(--c-secondary)', prefix: 'TRD' },
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
        const cfg = TYPE_CONFIG[log.type] || { border: 'var(--c-border)', prefix: 'SYS' }
        return (
          <div key={id}
            className={`border px-3 py-2 text-[10px] backdrop-blur-sm ${exiting ? 'animate-toast-exit' : 'animate-log-entry'}`}
            style={{
              backgroundColor: 'rgba(10, 10, 15, 0.92)',
              borderColor: cfg.border,
              color: cfg.border,
              boxShadow: `0 0 12px ${cfg.border}22`,
              fontFamily: 'var(--font-mono)',
            }}>
            <span className="text-[8px] opacity-60 tracking-wider">{cfg.prefix}</span> {log.message}
          </div>
        )
      })}
    </div>
  )
}
