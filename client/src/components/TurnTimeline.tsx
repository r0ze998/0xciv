import type { Civilization } from '../types/game'

interface TurnSnapshot {
  turn: number
  civData: { id: number; hp: number; food: number; territories: number; isAlive: boolean }[]
}

interface Props {
  history: TurnSnapshot[]
  civs: Civilization[]
  currentTurn: number
}

export function TurnTimeline({ history, civs, currentTurn }: Props) {
  if (history.length < 2) return null

  const maxTurns = 20
  const recent = history.slice(-maxTurns)
  const maxHP = 100

  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-3">
      <h3 className="text-gray-500 text-xs font-bold mb-2 tracking-wider">HP TIMELINE</h3>
      <div className="relative h-20">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <div key={v} className="absolute left-0 right-0 border-t border-gray-800" style={{ bottom: `${v}%` }}>
            {v === 0 && <span className="absolute right-0 text-[8px] text-gray-700 -top-2">0</span>}
            {v === 100 && <span className="absolute right-0 text-[8px] text-gray-700 -top-2">100</span>}
          </div>
        ))}
        {/* Lines per civ */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${recent.length - 1} ${maxHP}`} preserveAspectRatio="none">
          {civs.map(civ => {
            const points = recent.map((snap, i) => {
              const cd = snap.civData.find(c => c.id === civ.id)
              const hp = cd?.isAlive ? cd.hp : 0
              return `${i},${maxHP - hp}`
            }).join(' ')
            return (
              <polyline
                key={civ.id}
                points={points}
                fill="none"
                stroke={civ.color}
                strokeWidth="1.5"
                strokeOpacity={civ.isAlive ? 0.8 : 0.2}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>
      </div>
      <div className="flex justify-between text-[8px] text-gray-700 mt-1">
        <span>T{recent[0]?.turn || 0}</span>
        <span>T{currentTurn}</span>
      </div>
    </div>
  )
}

export type { TurnSnapshot }
