import { useRef, useEffect } from 'react'
import type { LogEntry } from '../types/game'

const TYPE_STYLE: Record<string, { color: string; prefix: string }> = {
  action: { color: 'var(--c-text-dim)', prefix: 'ACT' },
  combat: { color: 'var(--c-danger)', prefix: 'ATK' },
  trade: { color: 'var(--c-secondary)', prefix: 'TRD' },
  elimination: { color: 'var(--c-warning)', prefix: 'KIA' },
  system: { color: 'var(--c-purple)', prefix: 'SYS' },
}

export function TurnLog({ logs }: { logs: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight) }, [logs])

  return (
    <div ref={ref} className="h-64 overflow-y-auto rounded border p-3 text-xs space-y-0.5 data-stream-bg"
      style={{
        backgroundColor: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
        fontFamily: 'var(--font-mono)',
      }}>
      {logs.length === 0 && <p className="italic" style={{ color: 'var(--c-text-muted)' }}>&gt; awaiting first turn...</p>}
      {logs.map((log, i) => {
        const s = TYPE_STYLE[log.type] || { color: 'var(--c-text-dim)', prefix: '---' }
        const isRecent = i >= logs.length - 6
        return (
          <div key={i} className={`${isRecent ? 'animate-log-entry' : ''} ${log.type === 'elimination' ? 'font-bold' : ''}`}
            style={{ color: s.color }}>
            <span style={{ color: 'var(--c-text-muted)' }}>[T{log.turn}]</span>{' '}
            <span className="text-[9px]" style={{ opacity: 0.6 }}>{s.prefix}</span>{' '}
            {log.message}
          </div>
        )
      })}
    </div>
  )
}
