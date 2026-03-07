import type { Civilization, Territory } from '../types/game'

interface Props {
  grid: Territory[][]
  civs: Civilization[]
}

export function TerritoryChart({ grid, civs }: Props) {
  const total = grid.flat().length
  const counts = civs.map(c => ({
    civ: c,
    count: grid.flat().filter(t => t.owner === c.id).length,
  }))
  const unclaimed = total - counts.reduce((a, c) => a + c.count, 0)

  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-3">
      <h3 className="text-gray-500 text-xs font-bold mb-2 tracking-wider">TERRITORY CONTROL</h3>
      <div className="flex rounded-full h-3 overflow-hidden bg-gray-800">
        {counts.map(({ civ, count }) =>
          count > 0 ? (
            <div
              key={civ.id}
              className="h-full transition-all duration-500"
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: civ.color,
                opacity: civ.isAlive ? 1 : 0.3,
              }}
              title={`${civ.name}: ${count}/${total}`}
            />
          ) : null
        )}
        {unclaimed > 0 && (
          <div
            className="h-full bg-gray-700"
            style={{ width: `${(unclaimed / total) * 100}%` }}
            title={`Unclaimed: ${unclaimed}/${total}`}
          />
        )}
      </div>
      <div className="flex gap-3 mt-2 flex-wrap">
        {counts.map(({ civ, count }) => (
          <span key={civ.id} className="text-[10px] flex items-center gap-1" style={{ color: civ.isAlive ? civ.color : '#6b7280' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: civ.color, opacity: civ.isAlive ? 1 : 0.3 }} />
            {Math.round((count / total) * 100)}%
          </span>
        ))}
        {unclaimed > 0 && (
          <span className="text-[10px] text-gray-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full inline-block bg-gray-700" />
            {Math.round((unclaimed / total) * 100)}% free
          </span>
        )}
      </div>
    </div>
  )
}
