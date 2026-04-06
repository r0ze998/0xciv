import { useEffect, useState } from 'react'
import type { LogEntry } from '../types/game'
import { EVENT_ICON_MAP, SignalIcon } from './Icons'

interface Props {
  logs: LogEntry[]
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
      <h3 className="text-gray-600 text-[10px] font-bold mb-1 tracking-wider flex items-center gap-1">
        <SignalIcon size={10} color="#00ff41" /> LIVE FEED
      </h3>
      <div className="space-y-0.5 max-h-24 overflow-hidden">
        {visible.map((log, i) => {
          const IconComp = EVENT_ICON_MAP[log.type as keyof typeof EVENT_ICON_MAP]
          const color = log.type === 'combat' ? '#f87171'
            : log.type === 'elimination' ? '#ef4444'
            : log.type === 'trade' ? '#60a5fa'
            : '#666'
          return (
            <p
              key={`${log.turn}-${i}`}
              className={`text-[10px] truncate animate-log-entry flex items-center gap-1 ${
                log.type === 'combat' ? 'text-red-400' :
                log.type === 'elimination' ? 'text-red-500 font-bold' :
                log.type === 'trade' ? 'text-blue-400' :
                'text-gray-500'
              }`}
            >
              {IconComp ? <span className="flex-shrink-0"><IconComp size={11} color={color} /></span> : <span className="w-3">·</span>}
              <span className="truncate">{log.message}</span>
            </p>
          )
        })}
      </div>
    </div>
  )
}
