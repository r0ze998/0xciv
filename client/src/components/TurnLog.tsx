import { useRef, useEffect } from 'react'
import type { LogEntry } from '../types/game'

const TYPE_STYLE: Record<string, { color: string; icon: string }> = {
  action: { color: 'text-gray-300', icon: '⚡' },
  combat: { color: 'text-red-400', icon: '⚔️' },
  trade: { color: 'text-blue-400', icon: '🤝' },
  elimination: { color: 'text-yellow-400', icon: '☠️' },
  system: { color: 'text-purple-400', icon: '📡' },
}

export function TurnLog({ logs }: { logs: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight) }, [logs])

  return (
    <div ref={ref} className="h-64 overflow-y-auto bg-gray-900/80 rounded-lg border border-gray-700 p-3 font-mono text-xs space-y-1">
      {logs.length === 0 && <p className="text-gray-600 italic">Waiting for first turn...</p>}
      {logs.map((log, i) => {
        const s = TYPE_STYLE[log.type] || { color: 'text-gray-400', icon: '•' }
        return (
          <div key={i} className={s.color}>
            <span className="text-gray-600">[T{log.turn}]</span> {s.icon} {log.message}
          </div>
        )
      })}
    </div>
  )
}
