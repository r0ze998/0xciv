import type { Territory, Civilization } from '../types/game'
import { GRID_SIZE } from '../lib/constants'

interface Props {
  grid: Territory[][]
  civs: Civilization[]
}

export function MiniMap({ grid, civs }: Props) {
  const cellSize = 8
  const gap = 1
  const size = GRID_SIZE * (cellSize + gap) - gap

  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-2">
      <h3 className="text-gray-500 text-[10px] font-bold mb-1.5 tracking-wider">MAP</h3>
      <svg width={size} height={size} className="mx-auto">
        {grid.flat().map(t => {
          const civ = t.owner !== null ? civs[t.owner] : null
          return (
            <rect
              key={`${t.x}-${t.y}`}
              x={t.x * (cellSize + gap)}
              y={t.y * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={1}
              fill={civ ? civ.color : '#1a1a2e'}
              opacity={civ ? (civ.isAlive ? 0.8 : 0.2) : 0.4}
            />
          )
        })}
      </svg>
      <div className="flex gap-2 mt-1.5 justify-center flex-wrap">
        {civs.filter(c => c.isAlive).map(c => (
          <span key={c.id} className="flex items-center gap-0.5 text-[8px]" style={{ color: c.color }}>
            <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: c.color }} />
            {c.territories}
          </span>
        ))}
      </div>
    </div>
  )
}
