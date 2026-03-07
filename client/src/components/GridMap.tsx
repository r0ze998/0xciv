import type { Territory, Civilization } from '../types/game'
import { RESOURCE_ICONS } from '../lib/constants'

interface Props {
  grid: Territory[][]
  civs: Civilization[]
  selectedCiv: number
}

export function GridMap({ grid, civs, selectedCiv }: Props) {
  return (
    <div className="grid grid-cols-5 gap-1 p-2 bg-gray-900/80 rounded-lg border border-gray-700">
      {grid.flat().map((t) => {
        const owner = t.owner !== null ? civs[t.owner] : null
        const isSelected = t.owner === selectedCiv
        return (
          <div
            key={`${t.x}-${t.y}`}
            className={`aspect-square flex items-center justify-center rounded text-lg font-bold transition-all
              ${owner ? '' : 'bg-gray-800/60'}
              ${isSelected ? 'ring-2 ring-white/50 scale-105' : ''}
            `}
            style={{
              backgroundColor: owner ? `${owner.color}22` : undefined,
              borderWidth: 1,
              borderColor: owner ? owner.color : '#374151',
              boxShadow: owner ? `0 0 8px ${owner.color}44` : 'none',
            }}
            title={`(${t.x},${t.y}) ${t.resource}${owner ? ` — ${owner.name}` : ''}`}
          >
            <span className="text-sm">{RESOURCE_ICONS[t.resource]}</span>
          </div>
        )
      })}
      <div className="col-span-5 flex justify-center gap-3 pt-1">
        {civs.filter(c => c.isAlive).map((c) => {
          const count = grid.flat().filter(t => t.owner === civs.indexOf(c)).length
          return (
            <span key={c.id} className="text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c.color }} />
              <span style={{ color: c.color }}>{count}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
