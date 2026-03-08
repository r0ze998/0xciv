import { useEffect, useState } from 'react'
import type { LogEntry } from '../types/game'

interface Props {
  logs: LogEntry[]
}

const TYPE_ICONS: Record<string, string> = {
  combat: '⚔️',
  trade: '🤝',
  elimination: '☠️',
  system: '📡',
  action: '🔄',
}

export function ActivityFeed({ logs }: Props) {
  const [visible, setVisible] = useState<LogEntry[]>([])

  useEffect(() => {
    const recent = logs.slice(-5)
    setVisible(recent)
  }, [logs])

  if (visible.length === 0) return null

  return (
    <div className="bg-gray-900/60 rounded-lg border border-gray-800 p-2">
      <h3 className="text-gray-600 text-[10px] font-bold mb-1 tracking-wider">⚡ LIVE FEED</h3>
      <div className="space-y-0.5 max-h-24 overflow-hidden">
        {visible.map((log, i) => (
          <p
            key={`${log.turn}-${i}`}
            className={`text-[10px] truncate animate-log-entry ${
              log.type === 'combat' ? 'text-red-400' :
              log.type === 'elimination' ? 'text-red-500 font-bold' :
              log.type === 'trade' ? 'text-blue-400' :
              'text-gray-500'
            }`}
          >
            {TYPE_ICONS[log.type] || '·'} {log.message}
          </p>
        ))}
      </div>
    </div>
  )
}
