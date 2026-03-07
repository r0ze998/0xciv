import { useState, useEffect } from 'react'

interface GameRecord {
  id: number
  winner: string
  winnerColor: string
  turns: number
  strategy: string
  date: string
}

const STORAGE_KEY = '0xciv-leaderboard'

function loadRecords(): GameRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function saveRecord(record: Omit<GameRecord, 'id' | 'date'>) {
  const records = loadRecords()
  records.push({
    ...record,
    id: Date.now(),
    date: new Date().toLocaleDateString('ja-JP'),
  })
  // Keep last 20
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-20)))
}

interface Props {
  show: boolean
  onClose: () => void
}

export function Leaderboard({ show, onClose }: Props) {
  const [records, setRecords] = useState<GameRecord[]>([])

  useEffect(() => {
    if (show) setRecords(loadRecords().reverse())
  }, [show])

  if (!show) return null

  // Stats
  const winCounts: Record<string, { count: number; color: string }> = {}
  for (const r of records) {
    if (!winCounts[r.winner]) winCounts[r.winner] = { count: 0, color: r.winnerColor }
    winCounts[r.winner].count++
  }
  const sorted = Object.entries(winCounts).sort((a, b) => b[1].count - a[1].count)
  const fastestWin = records.length > 0 ? [...records].sort((a, b) => a.turns - b.turns)[0] : null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-950 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black" style={{
            background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>🏆 LEADERBOARD</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-sm">✕</button>
        </div>

        {records.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">No games played yet. Start a game!</p>
        ) : (
          <>
            {/* Win counts */}
            <div className="mb-4">
              <h3 className="text-gray-500 text-xs font-bold mb-2 tracking-wider">WIN RATE</h3>
              <div className="space-y-1.5">
                {sorted.map(([name, { count, color }]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm flex-1" style={{ color }}>{name}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${(count / records.length) * 100}%`,
                        backgroundColor: color,
                      }} />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{count}W</span>
                  </div>
                ))}
              </div>
            </div>

            {fastestWin && (
              <p className="text-xs text-gray-500 mb-3">
                ⚡ Fastest win: <span style={{ color: fastestWin.winnerColor }}>{fastestWin.winner}</span> in {fastestWin.turns} turns
              </p>
            )}

            {/* Recent games */}
            <h3 className="text-gray-500 text-xs font-bold mb-2 tracking-wider">RECENT GAMES</h3>
            <div className="space-y-1">
              {records.slice(0, 10).map(r => (
                <div key={r.id} className="flex items-center justify-between text-xs bg-gray-900/60 rounded px-2 py-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.winnerColor }} />
                    <span style={{ color: r.winnerColor }}>{r.winner}</span>
                  </span>
                  <span className="text-gray-600">T{r.turns}</span>
                  <span className="text-gray-700 text-[10px]">{r.date}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { saveRecord }
